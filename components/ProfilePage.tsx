
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, User, Heart, Clock, Camera, MapPin, Loader2, Star, Trash2, AlertTriangle, List, Calendar, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from './Button';
import { Property, PropertyCategory } from '../types';
import { useFavorites } from '../contexts/FavoritesContext';
import { supabase } from '../lib/supabase';

interface ProfilePageProps {
  onBack: () => void;
  onViewProperty: (property: Property) => void;
}

const DeleteAccountModal: React.FC<{ isOpen: boolean; onClose: () => void; onConfirm: () => void; isLoading: boolean }> = ({ isOpen, onClose, onConfirm, isLoading }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm animate-in fade-in" onClick={!isLoading ? onClose : undefined}></div>
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl text-center animate-in zoom-in-95 duration-200">
         <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="h-8 w-8" />
         </div>
         <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Delete Account?</h3>
         <p className="text-slate-500 text-sm mb-8 leading-relaxed">This will permanently delete your profile, favorites, and history. This action cannot be undone.</p>
         <div className="grid grid-cols-2 gap-4">
            <Button variant="secondary" onClick={onClose} disabled={isLoading} className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">Cancel</Button>
            <Button onClick={onConfirm} isLoading={isLoading} className="bg-red-600 hover:bg-red-500 border-transparent text-white">Delete</Button>
         </div>
      </div>
    </div>
  );
};

export const ProfilePage: React.FC<ProfilePageProps> = ({ onBack, onViewProperty }) => {
  const { user, updateProfile, deleteAccount } = useAuth();
  const { t } = useLanguage();
  const { favorites: favoriteIds, toggleFavorite, isLoading: favLoading } = useFavorites();
  const [activeTab, setActiveTab] = useState<'profile' | 'favorites' | 'listings' | 'activity'>('profile');

  // Edit Profile State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [contact, setContact] = useState('');
  const [gender, setGender] = useState('Male');
  const [dob, setDob] = useState('');
  const [address, setAddress] = useState('');
  
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Data State
  const [savedProperties, setSavedProperties] = useState<Property[]>([]);
  const [myListings, setMyListings] = useState<Property[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loadingListings, setLoadingListings] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setContact(user.contact || '');
      setGender(user.gender || 'Male');
      setDob(user.dob || '');
      setAddress(user.address || '');
      setPreviewUrl(user.avatar || '');
    }
  }, [user]);

  // Fetch favorite properties (only from DB)
  useEffect(() => {
    const fetchSavedProperties = async () => {
       if (!favoriteIds.length) {
         setSavedProperties([]);
         return;
       }

       // Fetch dynamic properties from DB for IDs in favoriteIds
       const { data, error } = await supabase
         .from('properties')
         .select('*')
         .in('id', favoriteIds);

       if (data) {
          const dynamicFavs: Property[] = data.map((p: any) => ({
             id: p.id,
             owner_id: p.owner_id, 
             title: p.title,
             category: p.category as PropertyCategory,
             location: p.location,
             price: p.price,
             priceValue: p.price_value,
             rating: 0,
             mainImage: p.main_image,
             galleryImages: p.gallery_images || [],
             description: p.description,
             amenities: p.amenities || [],
             allowedGuest: p.allowed_guest || 'Any',
             specs: p.specs,
             coordinates: p.coordinates,
             status: p.status
          }));
          setSavedProperties(dynamicFavs);
       } else {
          setSavedProperties([]);
       }
    };

    fetchSavedProperties();
  }, [favoriteIds]);

  // Fetch my listings
  useEffect(() => {
    if (activeTab === 'listings' && user) {
      setLoadingListings(true);
      supabase.from('properties').select('*').eq('owner_id', user.id).then(({ data }) => {
        if (data) {
          const props: Property[] = data.map((p: any) => ({
             id: p.id,
             owner_id: p.owner_id,
             title: p.title,
             category: p.category as PropertyCategory,
             location: p.location,
             price: p.price,
             priceValue: p.price_value,
             rating: 0,
             mainImage: p.main_image,
             galleryImages: p.gallery_images || [],
             description: p.description,
             amenities: p.amenities || [],
             allowedGuest: p.allowed_guest || 'Any',
             specs: p.specs,
             coordinates: p.coordinates,
             status: p.status
          }));
          setMyListings(props);
        }
        setLoadingListings(false);
      });
    }
  }, [activeTab, user]);

  // Fetch bookings (inquiries)
  useEffect(() => {
    if (activeTab === 'activity' && user) {
      setLoadingBookings(true);
      const fetchBookings = async () => {
        const { data, error } = await supabase
          .from('inquiries')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (data) {
          setBookings(data);
        }
        setLoadingBookings(false);
      };
      fetchBookings();
    }
  }, [activeTab, user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setIsEditing(true);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (contact && contact.length < 10) {
      alert("Contact number must be 10 digits.");
      return;
    }
    setSaveLoading(true);
    try {
        await updateProfile({ firstName, lastName, contact, gender: gender as any, dob, address, photoFile });
        setIsEditing(false);
        setPhotoFile(null);
    } catch (err) {
        alert("Failed to update profile. Please try again.");
        console.error(err);
    } finally {
        setSaveLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      await deleteAccount();
    } catch (error: any) {
      alert(error.message || "Failed to delete account. You may need to re-login.");
    } finally {
      setDeleteLoading(false);
      setIsDeleteModalOpen(false);
    }
  };

  const handleRemoveFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    toggleFavorite(id);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-12 animate-in fade-in slide-in-from-bottom-4 text-slate-900 dark:text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center gap-4 mb-8">
          <button onClick={onBack} className="p-2 rounded-full bg-white dark:bg-slate-900 hover:bg-slate-100 text-slate-600 shadow-sm">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-3xl font-serif font-bold">{t('profile.title')}</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="col-span-1 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center shadow-sm">
              <div className="relative w-28 h-28 mx-auto mb-4 group">
                <div className="w-full h-full rounded-full overflow-hidden border-4 border-slate-100 dark:border-slate-800 shadow-xl relative">
                   <img src={previewUrl || `https://ui-avatars.com/api/?name=${user?.name}&background=10b981&color=fff`} className="w-full h-full object-cover" />
                   {saveLoading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><Loader2 className="h-8 w-8 text-white animate-spin" /></div>}
                </div>
                <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 p-2.5 bg-emerald-600 rounded-full text-white shadow-lg border-2 border-white dark:border-slate-900"><Camera className="h-4 w-4" /></button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
              </div>
              <h2 className="text-xl font-bold truncate">{user?.name}</h2>
              <p className="text-slate-500 text-xs mt-1 truncate">{user?.email}</p>
            </div>

            <nav className="space-y-2">
              <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'profile' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white dark:bg-slate-900 text-slate-500 hover:bg-slate-100 border border-slate-200 dark:border-slate-800'}`}>
                <User className="h-5 w-5" /> {t('profile.infoTab')}
              </button>
              <button onClick={() => setActiveTab('listings')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'listings' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white dark:bg-slate-900 text-slate-500 hover:bg-slate-100 border border-slate-200 dark:border-slate-800'}`}>
                <List className="h-5 w-5" /> My Listings
              </button>
              <button onClick={() => setActiveTab('favorites')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'favorites' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white dark:bg-slate-900 text-slate-500 hover:bg-slate-100 border border-slate-200 dark:border-slate-800'}`}>
                <Heart className="h-5 w-5" /> {t('profile.favoritesTab')}
              </button>
              <button onClick={() => setActiveTab('activity')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'activity' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white dark:bg-slate-900 text-slate-500 hover:bg-slate-100 border border-slate-200 dark:border-slate-800'}`}>
                <Clock className="h-5 w-5" /> {t('profile.historyTab')}
              </button>
            </nav>
          </div>

          <div className="col-span-1 md:col-span-3">
            {activeTab === 'profile' && (
               <div className="space-y-8">
                   <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm">
                      <div className="flex justify-between items-center mb-8">
                          <div>
                             <h3 className="text-xl font-bold">{t('profile.settingsHeader')}</h3>
                             <p className="text-sm text-slate-500 mt-1">{t('profile.settingsSub')}</p>
                          </div>
                          {!isEditing && <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-emerald-600 rounded-lg text-sm font-bold">{t('profile.editBtn')}</button>}
                      </div>
                      <form onSubmit={handleSaveProfile} className="space-y-8">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div className="space-y-3">
                                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t('profile.firstName')}</label>
                                  <input type="text" value={firstName} onChange={e => { setFirstName(e.target.value); setIsEditing(true); }} disabled={!isEditing && !saveLoading} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 focus:ring-2 focus:ring-emerald-500 outline-none" />
                              </div>
                              <div className="space-y-3">
                                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t('profile.lastName')}</label>
                                  <input type="text" value={lastName} onChange={e => { setLastName(e.target.value); setIsEditing(true); }} disabled={!isEditing && !saveLoading} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 focus:ring-2 focus:ring-emerald-500 outline-none" />
                              </div>
                              <div className="space-y-3">
                                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t('profile.contact')}</label>
                                  <input 
                                    type="tel" 
                                    value={contact} 
                                    onChange={e => { 
                                      const val = e.target.value.replace(/\D/g, ''); 
                                      if(val.length <= 10) {
                                        setContact(val); 
                                        setIsEditing(true);
                                      }
                                    }} 
                                    disabled={!isEditing && !saveLoading} 
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 focus:ring-2 focus:ring-emerald-500 outline-none" 
                                    placeholder="10 digit number"
                                  />
                              </div>
                              <div className="space-y-3">
                                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t('profile.email')} <span className="text-[10px] lowercase text-slate-400">{t('profile.emailNote')}</span></label>
                                  <input type="email" value={user?.email} disabled className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 opacity-60 cursor-not-allowed" />
                              </div>
                              <div className="space-y-3">
                                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t('profile.gender')}</label>
                                  <select value={gender} onChange={e => { setGender(e.target.value as any); setIsEditing(true); }} disabled={!isEditing && !saveLoading} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 outline-none transition-all">
                                      <option value="Male">Male</option>
                                      <option value="Female">Female</option>
                                      <option value="Other">Other</option>
                                  </select>
                              </div>
                              <div className="space-y-3">
                                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t('profile.dob')}</label>
                                  <input type="date" value={dob} onChange={e => { setDob(e.target.value); setIsEditing(true); }} disabled={!isEditing && !saveLoading} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 [color-scheme:dark]" />
                              </div>
                              <div className="col-span-1 md:col-span-2 space-y-3">
                                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t('profile.address')}</label>
                                  <textarea value={address} onChange={e => { setAddress(e.target.value); setIsEditing(true); }} disabled={!isEditing && !saveLoading} rows={3} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 focus:ring-2 focus:ring-emerald-500 outline-none resize-none" />
                              </div>
                          </div>
                          {isEditing && (
                              <div className="flex gap-4 justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                                  <Button type="button" variant="secondary" onClick={() => setIsEditing(false)} disabled={saveLoading}>{t('profile.cancelBtn')}</Button>
                                  <Button type="submit" isLoading={saveLoading}>{t('profile.saveBtn')}</Button>
                              </div>
                          )}
                      </form>
                   </div>
                   
                   <div className="bg-red-50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/20 rounded-2xl p-6 md:p-8">
                      <h3 className="text-lg font-bold text-red-600 dark:text-red-500 mb-2 flex items-center gap-2"><Trash2 className="h-5 w-5" /> Danger Zone</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">Once you delete your account, there is no going back. Please be certain.</p>
                      <button 
                        onClick={() => setIsDeleteModalOpen(true)}
                        className="px-4 py-2 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg text-sm font-bold transition-colors"
                      >
                        Delete Account
                      </button>
                   </div>
               </div>
            )}

            {activeTab === 'listings' && (
               <div className="space-y-6">
                 <h3 className="text-2xl font-serif font-bold mb-6">Properties You Listed</h3>
                 {loadingListings ? (
                    <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-emerald-500"/></div>
                 ) : myListings.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {myListings.map(prop => (
                         <div key={prop.id} onClick={() => onViewProperty(prop)} className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 group shadow-sm hover:shadow-xl transition-all relative cursor-pointer">
                            <div className="h-52 overflow-hidden relative">
                                <img src={prop.mainImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase ${prop.status === 'approved' ? 'bg-emerald-500 text-white' : prop.status === 'rejected' ? 'bg-red-500 text-white' : 'bg-amber-500 text-black'}`}>
                                  {prop.status}
                                </span>
                            </div>
                            <div className="p-5">
                                <h4 className="font-bold text-lg truncate mb-2">{prop.title}</h4>
                                <div className="flex items-center text-slate-500 text-xs mb-4"><MapPin className="h-3 w-3 mr-1 text-emerald-500" /> {prop.location}</div>
                                <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800">
                                    <span className="text-emerald-600 font-bold text-lg">{prop.price}</span>
                                </div>
                            </div>
                         </div>
                      ))}
                    </div>
                 ) : (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-16 text-center shadow-sm">
                       <h4 className="text-xl font-bold mb-2">No Listings Found</h4>
                       <p className="text-slate-500 dark:text-slate-400">You haven't listed any properties yet.</p>
                    </div>
                 )}
               </div>
            )}

            {activeTab === 'favorites' && (
                <div className="space-y-6">
                    <h3 className="text-2xl font-serif font-bold mb-6">{t('profile.favoritesTab')}</h3>
                    {favLoading ? (
                       <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-emerald-500"/></div>
                    ) : savedProperties.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {savedProperties.map(prop => (
                              <div key={prop.id} onClick={() => onViewProperty(prop)} className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 group shadow-sm hover:shadow-xl transition-all relative cursor-pointer">
                                  <div className="h-52 overflow-hidden relative">
                                      <img src={prop.mainImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                      <button onClick={(e) => handleRemoveFavorite(e, prop.id)} className="absolute top-3 right-3 p-2 bg-slate-900/60 backdrop-blur-md rounded-full text-red-500 z-10"><Heart className="h-4 w-4 fill-red-500" /></button>
                                  </div>
                                  <div className="p-5">
                                      <h4 className="font-bold text-lg truncate mb-2">{prop.title}</h4>
                                      <div className="flex items-center text-slate-500 text-xs mb-4"><MapPin className="h-3 w-3 mr-1 text-emerald-500" /> {prop.location}</div>
                                      <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800">
                                          <span className="text-emerald-600 font-bold text-lg transition-all duration-300 group-hover:scale-110 origin-left">{prop.price}</span>
                                          <div className="flex items-center gap-1 text-amber-500 font-bold text-xs"><Star className="h-3 w-3 fill-amber-500" /> {prop.rating}</div>
                                      </div>
                                  </div>
                              </div>
                          ))}
                      </div>
                    ) : (
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-16 text-center shadow-sm">
                            <Heart className="h-12 w-12 text-slate-200 mx-auto mb-6" />
                            <h4 className="text-xl font-bold mb-2">{t('profile.noFavs')}</h4>
                            <p className="text-slate-500 dark:text-slate-400 mb-8">{t('profile.noFavsDesc')}</p>
                            <Button onClick={onBack} variant="outline">{t('profile.startExploring')}</Button>
                        </div>
                    )}
                </div>
            )}
            
            {activeTab === 'activity' && (
                <div className="space-y-6">
                   <h3 className="text-2xl font-serif font-bold mb-6">{t('profile.historyTab')}</h3>
                   {loadingBookings ? (
                      <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-emerald-500"/></div>
                   ) : bookings.length > 0 ? (
                      <div className="space-y-4">
                        {bookings.map((booking) => (
                          <div key={booking.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between gap-4 transition-all hover:border-emerald-500/30">
                             <div>
                                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{booking.property_title}</h4>
                                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                                   <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4 text-emerald-500" /> Move In: {booking.move_in_date || 'N/A'}</span>
                                   <span className="flex items-center gap-1.5"><Users className="h-4 w-4 text-emerald-500" /> {booking.guests}</span>
                                </div>
                                {booking.message && <p className="text-slate-400 text-sm mt-3 italic bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-100 dark:border-slate-800">"{booking.message}"</p>}
                             </div>
                             <div className="flex flex-row md:flex-col justify-between items-end gap-2 shrink-0">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                                   booking.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                   booking.status === 'rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                   'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                }`}>
                                   {booking.status}
                                </span>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(booking.created_at).toLocaleDateString()}</span>
                             </div>
                          </div>
                        ))}
                      </div>
                   ) : (
                      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-16 text-center shadow-sm">
                         <Clock className="h-12 w-12 text-slate-200 mx-auto mb-6" />
                         <h4 className="text-xl font-bold mb-2">{t('profile.noBookings')}</h4>
                         <p className="text-slate-500 dark:text-slate-400 mb-8">{t('profile.noBookingsDesc')}</p>
                         <Button onClick={onBack} variant="outline">{t('profile.startExploring')}</Button>
                      </div>
                   )}
                </div>
            )}
          </div>
        </div>
      </div>
      
      <DeleteAccountModal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        onConfirm={handleDeleteAccount}
        isLoading={deleteLoading}
      />
    </div>
  );
};
