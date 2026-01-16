
import React, { useState, useEffect } from 'react';
import { MapPin, Star, ArrowRight, Heart, ChevronRight } from 'lucide-react';
import { Property, PropertyCategory } from '../types';
import { useFavorites } from '../contexts/FavoritesContext';
import { useAuth } from '../contexts/AuthContext';
import { useUI } from '../contexts/UIContext';
import { PropertyCardSkeleton } from './Skeleton';
import { supabase } from '../lib/supabase';

interface PropertyCardProps {
  property: Property;
  onClick: () => void;
}

interface FeaturedPlacesProps {
  onViewAllClick?: () => void;
  onViewProperty: (property: Property) => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, onClick }) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isAuthenticated } = useAuth();
  const { openAuthModal } = useUI();
  const favorite = isFavorite(property.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    toggleFavorite(property.id);
  };

  return (
    <div 
      onClick={onClick}
      className="bg-slate-900 rounded-[2rem] overflow-hidden border border-slate-800 hover:border-emerald-500/40 transition-all duration-500 group cursor-pointer animate-in fade-in zoom-in-95 relative flex flex-col h-full hover:shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_20px_rgba(16,185,129,0.1)] hover:-translate-y-2"
    >
      <div className="relative w-full aspect-[4/3] overflow-hidden shrink-0">
        <img 
          src={property.mainImage} 
          alt={property.title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out" 
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800';
          }}
        />
        {/* Glassmorphic Badge */}
        <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-white/10 shadow-xl">
          <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
          <span className="text-xs font-bold text-white">{property.rating || 'New'}</span>
        </div>
        
        {/* Prominent Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className={`absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-md border transition-all duration-300 z-10 group/fav ${
            favorite 
              ? 'bg-red-500 border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.5)]' 
              : 'bg-black/40 border-white/20 hover:bg-black/60 hover:scale-110'
          }`}
        >
          <Heart className={`h-5 w-5 transition-colors ${favorite ? 'fill-white text-white' : 'text-white'}`} />
        </button>

        <div className="absolute bottom-4 left-4 flex gap-2">
           <span className="bg-emerald-600/90 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-black text-white uppercase tracking-wider shadow-lg">
              {property.category}
          </span>
        </div>
      </div>

      <div className="p-6 md:p-8 flex flex-col flex-1">
        <div className="flex items-center text-emerald-400 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] mb-3">
          <MapPin className="h-3.5 w-3.5 mr-1.5 shrink-0" />
          <span className="truncate">{property.location}</span>
        </div>
        
        <h3 className="text-xl md:text-2xl font-serif font-bold text-white mb-4 line-clamp-1 group-hover:text-emerald-400 transition-colors duration-300">
          {property.title}
        </h3>
        
        <div className="mt-auto flex justify-between items-end gap-4">
          <div className="transition-transform duration-500 group-hover:translate-x-1">
            <p className="text-slate-500 text-[10px] md:text-xs uppercase font-black tracking-widest mb-1.5">Rent per month</p>
            <div className="flex items-baseline gap-1">
              <span className="text-white font-black text-xl md:text-3xl transition-all duration-500 group-hover:text-emerald-400 group-hover:scale-105 origin-left">
                {property.price}
              </span>
              <span className="text-xs font-medium text-slate-600">/ mo</span>
            </div>
          </div>
          
          <button className="p-3.5 rounded-2xl bg-slate-800 group-hover:bg-emerald-600 text-emerald-400 group-hover:text-white transition-all duration-300 shadow-xl active:scale-90 group-hover:rotate-[-5deg]">
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const FeaturedPlaces: React.FC<FeaturedPlacesProps> = ({ onViewAllClick, onViewProperty }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);

  useEffect(() => {
    const fetchProps = async () => {
      // Fetch only approved dynamic properties from Supabase
      const { data } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'approved')
        .limit(6);

      let dynamicProps: Property[] = [];
      if (data) {
        dynamicProps = data.map((p: any) => ({
             id: p.id,
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
             status: p.status,
             owner_id: p.owner_id
        }));
      }
      
      const filtered = dynamicProps.filter(p => p.mainImage && p.mainImage.trim() !== '');
      setFeaturedProperties(filtered);
      setIsLoading(false);
    };

    fetchProps();
  }, []);

  return (
    <section id="places" className="py-20 md:py-32 bg-slate-950 overflow-hidden relative">
      {/* Background Decorative Gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row justify-between md:items-end mb-12 md:mb-20">
          <div className="max-w-3xl">
            <h2 className="text-4xl md:text-6xl font-serif font-bold text-white mb-4 md:mb-6 leading-tight">
              Curated <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">Stays</span>
            </h2>
            <p className="text-slate-400 text-base md:text-xl leading-relaxed">
              Handpicked accommodations designed to elevate your living experience in Malnad.
            </p>
          </div>
          <button 
            onClick={onViewAllClick} 
            className="flex items-center gap-3 text-emerald-400 hover:text-emerald-300 font-black transition-all mt-8 md:mt-0 text-sm md:text-base group uppercase tracking-widest"
          >
            Explore Listings <div className="p-2 rounded-full bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors"><ArrowRight className="h-4 w-4 md:h-5 md:w-5 group-hover:translate-x-1 transition-transform" /></div>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {isLoading ? (
             Array.from({ length: 3 }).map((_, i) => <PropertyCardSkeleton key={i} />)
          ) : featuredProperties.length > 0 ? (
             featuredProperties.map((place) => <PropertyCard key={place.id} property={place} onClick={() => onViewProperty(place)} />)
          ) : (
             <div className="col-span-full text-center text-slate-500 py-10">
                No featured properties available at the moment.
             </div>
          )}
        </div>
        
        {/* Mobile View All CTA */}
        <div className="mt-12 md:hidden">
          <button 
            onClick={onViewAllClick}
            className="w-full py-5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black rounded-2xl active:scale-95 transition-all text-sm uppercase tracking-widest shadow-xl shadow-emerald-900/20"
          >
            Show more listings
          </button>
        </div>
      </div>
    </section>
  );
};
