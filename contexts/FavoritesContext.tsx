
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

interface FavoritesContextType {
  favorites: string[]; // Store IDs
  toggleFavorite: (propertyId: string) => Promise<void>;
  isFavorite: (propertyId: string) => boolean;
  isLoading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Fetch favorites from DB when user logs in
  useEffect(() => {
    if (user) {
      fetchFavorites();
    } else {
      setFavorites([]);
    }
  }, [user]);

  const fetchFavorites = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('property_id')
        .eq('user_id', user.id);

      if (error) throw error;
      if (data) {
        setFavorites(data.map(item => item.property_id));
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = async (propertyId: string) => {
    if (!user) return; // UI should handle auth check before calling this
    
    // Optimistic Update
    const isAlreadyFavorite = favorites.includes(propertyId);
    setFavorites(prev => 
      isAlreadyFavorite ? prev.filter(id => id !== propertyId) : [...prev, propertyId]
    );

    try {
      if (isAlreadyFavorite) {
        // Remove from DB
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('property_id', propertyId);
        
        if (error) throw error;
      } else {
        // Add to DB
        const { error } = await supabase
          .from('favorites')
          .insert([{ user_id: user.id, property_id: propertyId }]);
        
        if (error) throw error;
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Revert on error
      fetchFavorites(); 
    }
  };

  const isFavorite = (propertyId: string) => favorites.includes(propertyId);

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite, isLoading }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error("useFavorites must be used within FavoritesProvider");
  return context;
};
