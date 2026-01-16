
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { supabase } from '../lib/supabase';

interface UpdateProfileParams {
  name?: string;
  firstName?: string;
  lastName?: string;
  contact?: string;
  gender?: 'Male' | 'Female' | 'Other';
  dob?: string;
  address?: string;
  avatar?: string;
  photoFile?: File | null;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, photoFile?: File | null) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: UpdateProfileParams) => Promise<void>;
  updatePassword: (oldPw: string, newPw: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper to map Supabase Auth User + DB Data to App User
  const mapUser = (authUser: any, dbData: any): User => {
    const metadata = authUser.user_metadata || {};
    
    // Admin check: either hardcoded email OR role in DB
    const isAdmin = authUser.email === 'rohi@gmail.com' || dbData?.role === 'admin';

    return {
      id: authUser.id,
      name: dbData?.name || metadata.full_name || authUser.email?.split('@')[0] || 'User',
      firstName: dbData?.firstName || metadata.firstName || metadata.full_name?.split(' ')[0] || '',
      lastName: dbData?.lastName || metadata.lastName || metadata.full_name?.split(' ').slice(1).join(' ') || '',
      contact: dbData?.contact || metadata.contact || '',
      gender: dbData?.gender || metadata.gender || undefined,
      dob: dbData?.dob || metadata.dob || '',
      address: dbData?.address || metadata.address || '',
      email: authUser.email || dbData?.email || '',
      role: isAdmin ? 'admin' : (dbData?.role || metadata.role || 'user'),
      avatar: dbData?.avatar || metadata.avatar_url || undefined,
      settings: dbData?.settings || metadata.settings || {
        language: 'en',
        theme: 'dark',
        notifications: true
      }
    };
  };

  const syncUserToDB = async (authUser: any, metadata: any) => {
    // Attempt to upsert user record to ensure it exists for FK constraints
    const userPayload = {
      id: authUser.id,
      email: authUser.email,
      name: metadata.full_name || authUser.email?.split('@')[0],
      avatar: metadata.avatar_url,
      role: authUser.email === 'rohi@gmail.com' ? 'admin' : 'user',
      updated_at: new Date().toISOString()
    };
    
    // Explicitly handle the promise result to catch errors properly
    const { error } = await supabase.from('users').upsert([userPayload]);
    
    if (error) {
      console.warn("Auto-sync user failed:", error.message);
      // We don't throw here to avoid blocking the auth session if just the profile DB fails
    }
  };

  const fetchProfile = async (authUser: any) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) {
        // If row not found (PGRST116), we use metadata AND try to sync again
        if (error.code === 'PGRST116') {
           await syncUserToDB(authUser, authUser.user_metadata);
        }
        
        if (error.code !== 'PGRST116' && error.code !== '42P01') {
           console.warn("Supabase DB Fetch Error:", error.message);
        }
        setUser(mapUser(authUser, {}));
      } else {
        setUser(mapUser(authUser, data));
      }
    } catch (err) {
      console.warn("Profile fetch failed:", err);
      setUser(mapUser(authUser, {}));
    }
  };

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile(session.user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        throw new Error("Password or Email Incorrect");
      }
      throw error;
    }
  };

  const signup = async (name: string, email: string, password: string, photoFile?: File | null) => {
    // 1. Prepare initial metadata
    let photoURL = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=10b981&color=fff`;
    
    const metadata = {
      full_name: name,
      firstName: name.split(' ')[0],
      lastName: name.split(' ').slice(1).join(' ') || '',
      avatar_url: photoURL,
      settings: {
        language: 'en',
        theme: 'dark',
        notifications: true
      }
    };

    // 2. Sign Up with metadata
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });

    if (authError) throw authError;

    if (authData.user) {
      // 3. Attempt to Create Profile Record in DB
      // We wait for this to ensure consistency before navigating
      await syncUserToDB(authData.user, metadata);
      
      if (!authData.session) {
          throw new Error("Email not verified"); 
      }
    }
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password',
    });
    if (error) throw error;
  };

  const updateProfileData = async (data: UpdateProfileParams) => {
    if (!user) return;
    
    let photoURL = data.avatar || user.avatar || "";
    
    // 1. Handle Photo Upload
    if (data.photoFile) {
      try {
        // Sanitize filename to avoid path issues
        const fileExt = data.photoFile.name.split('.').pop() || 'jpg';
        const fileName = `${user.id}/${Date.now()}_profile.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, data.photoFile, { upsert: true });

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName);
          photoURL = urlData.publicUrl;
        } else {
           console.error("Avatar upload error:", uploadError);
           // If bucket not found, inform development logic
           if (uploadError.message.includes("bucket")) {
             console.warn("Ensure 'avatars' bucket exists in Supabase Storage.");
           }
        }
      } catch (e: any) {
        console.error("Avatar upload exception:", e.message);
      }
    }

    const displayName = data.name || (data.firstName && data.lastName ? `${data.firstName} ${data.lastName}` : user.name);
    
    // 2. Prepare Update Data for Auth Metadata
    const metadataUpdates: any = {
        full_name: displayName,
        avatar_url: photoURL,
        updated_at: new Date().toISOString()
    };
    if (data.firstName) metadataUpdates.firstName = data.firstName;
    if (data.lastName) metadataUpdates.lastName = data.lastName;
    if (data.contact) metadataUpdates.contact = data.contact;
    if (data.gender) metadataUpdates.gender = data.gender;
    if (data.dob) metadataUpdates.dob = data.dob;
    if (data.address) metadataUpdates.address = data.address;

    // 3. Update Auth User Metadata (Primary Source)
    const { data: updateAuthData, error: authUpdateError } = await supabase.auth.updateUser({
      data: metadataUpdates
    });

    if (authUpdateError) throw authUpdateError;

    // 4. Upsert to DB to ensure record exists and is updated
    // Exclude 'full_name' because the DB uses 'name'
    const { avatar_url, full_name, ...safeMetadata } = metadataUpdates;

    const dbPayload: any = {
      id: user.id, // Important for upsert
      email: user.email,
      avatar: photoURL,
      name: displayName,
      updated_at: new Date().toISOString(),
      ...safeMetadata
    };
    
    // Remove undefined values
    Object.keys(dbPayload).forEach(key => dbPayload[key] === undefined && delete dbPayload[key]);

    const { error: dbError } = await supabase.from('users').upsert(dbPayload);
    if (dbError && dbError.code !== '42P01') console.warn("DB Sync failed:", dbError.message);
    
    // 5. Update Local State
    setUser(prev => prev ? ({ ...prev, ...dbPayload }) : null);
  };

  const updatePassword = async (oldPw: string, newPw: string) => {
     const { error } = await supabase.auth.updateUser({ password: newPw });
     if (error) throw error;
  };

  const deleteAccount = async () => {
    if (!user) return;

    try {
      // 1. Delete User's Favorites
      await supabase.from('favorites').delete().eq('user_id', user.id);

      // 2. Delete User's Reviews
      await supabase.from('reviews').delete().eq('user_id', user.id);

      // 3. Delete User's Inquiries
      await supabase.from('inquiries').delete().eq('user_id', user.id);

      // 4. Handle User's Properties (Listings) - Cascade Delete
      const { data: props } = await supabase.from('properties').select('id').eq('owner_id', user.id);
      
      if (props && props.length > 0) {
          const propIds = props.map(p => p.id);
          // Delete reviews on these properties (by others)
          await supabase.from('reviews').delete().in('property_id', propIds);
          // Delete favorites of these properties (by others)
          await supabase.from('favorites').delete().in('property_id', propIds);
          // Delete inquiries on these properties (by others)
          await supabase.from('inquiries').delete().in('property_id', propIds);
          
          // Delete the properties
          await supabase.from('properties').delete().eq('owner_id', user.id);
      }

      // 5. Delete from public.users table
      await supabase.from('users').delete().eq('id', user.id);

      // 6. Attempt to delete from Auth (Requires RPC 'delete_user' on backend usually)
      try {
        await supabase.rpc('delete_user');
      } catch (e) {
        // If RPC doesn't exist, we can't fully delete the Auth user from client.
        // However, we've stripped all their data.
      }

      // 7. Clear local artifacts
      localStorage.removeItem(`malnad_favorites_${user.id}`);

      // 8. Sign out
      await supabase.auth.signOut();
      
      setUser(null);
    } catch (error) {
      console.error("Error deleting account:", error);
      throw new Error("Failed to delete account data. Please try again.");
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      login, 
      signup, 
      logout, 
      resetPassword,
      updateProfile: updateProfileData, 
      updatePassword,
      deleteAccount
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
