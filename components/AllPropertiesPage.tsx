
import React, { useState, useMemo, useEffect } from 'react';
import { 
  ArrowLeft, Filter, MapPin, Search, Star, ChevronDown, 
  Navigation, Heart, ChevronLeft, ChevronRight, X, SlidersHorizontal,
  ArrowUpDown, Check
} from 'lucide-react';
import { properties as staticProperties } from '../data/properties';
import { Property, GuestType } from '../types';
import { Button } from './Button';
import { useFavorites } from '../contexts/FavoritesContext';
import { useAuth } from '../contexts/AuthContext';
import { useUI } from '../contexts/UIContext';
import { PropertyCardSkeleton } from './Skeleton';
import { useLanguage } from '../contexts/LanguageContext';

interface AllPropertiesPageProps {
  onBack: () => void;
  initialSearchState?: {
    query: string;
    location: { lat: number; lng: number } | null;
  };
  onViewProperty: (property: Property) => void;
}

const PROPERTIES_PER_PAGE = 6;

const AMENITY_OPTIONS = [
  'High-Speed Wi-Fi', 'AC Rooms', 'Home Cooked Meals', 
  'Parking', 'Power Backup', '24/7 Security', 'Mess Facility'
];

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const PropertyCard: React.FC<{ property: Property, onClick: () => void, distance?: number }> = ({ property, onClick, distance }) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isAuthenticated } = useAuth();
  const { openAuthModal } = useUI();
  const { t } = useLanguage();
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
      className="bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 transition-all duration-500 group cursor-pointer hover:shadow-[0_30px_60px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_30px_60px_rgba(0,0,0,0.5)] relative h-full flex flex-col hover:-translate-y-2"
    >
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-slate-200 dark:bg-slate-800 shrink-0">
        <img src={property.mainImage} alt={property.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-in-out" />
        
        {/* Floating Badges */}
        <div className="absolute top-4 left-4 bg-slate-950/60 backdrop-blur-md px-2.5 py-1 rounded-xl flex items-center gap-1.5 border border-white/10 shadow-lg">
          <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
          <span className="text-[10px] font-black text-white">{property.rating}</span>
        </div>

        <button 
          onClick={handleFavoriteClick} 
          className={`absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-md border transition-all duration-300 z-10 group/fav ${
            favorite 
              ? 'bg-red-500 border-red-400 shadow-lg' 
              : 'bg-white/10 border-white/20 hover:bg-white/20'
          }`}
        >
          <Heart className={`h-4.5 w-4.5 transition-colors ${favorite ? 'fill-white text-white' : 'text-white'}`} />
        </button>

        <div className="absolute bottom-4 left-4 flex gap-2">
          <span className="bg-emerald-600 text-white text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest shadow-lg">
            {property.category}
          </span>
          {typeof distance === 'number' && (
            <span className="bg-blue-600/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[9px] font-black text-white uppercase flex items-center gap-1.5 shadow-lg">
              <Navigation className="h-2.5 w-2.5" /> {distance.toFixed(1)} km
            </span>
          )}
        </div>
      </div>

      <div className="p-6 md:p-8 flex-1 flex flex-col">
        <div className="flex items-center text-slate-500 dark:text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-widest mb-3">
          <MapPin className="h-3.5 w-3.5 mr-2 text-emerald-500 shrink-0" />
          <span className="truncate">{property.location}</span>
        </div>
        
        <h3 className="text-lg md:text-xl font-serif font-bold text-slate-900 dark:text-white mb-4 line-clamp-1 group-hover:text-emerald-500 transition-colors duration-300">
          {property.title}
        </h3>
        
        <div className="mt-auto flex justify-between items-center pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="transition-transform duration-300 group-hover:translate-x-1">
            <p className="text-slate-900 dark:text-white font-black text-lg md:text-2xl transition-all duration-500 group-hover:scale-110 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 origin-left">
              {property.price}
            </p>
            <p className="text-slate-500 text-[9px] md:text-[10px] uppercase font-black tracking-widest mt-1 opacity-70">
              {t('property.priceLabel')}
            </p>
          </div>
          
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 group-hover:bg-emerald-600 transition-all duration-300 group-hover:text-white text-emerald-600 dark:text-emerald-400 shadow-sm group-hover:shadow-emerald-900/30">
             <ChevronRight className="h-5 w-5" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const AllPropertiesPage: React.FC<AllPropertiesPageProps> = ({ onBack, initialSearchState, onViewProperty }) => {
  const { t } = useLanguage();
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState(initialSearchState?.query || '');
  const [selectedArea, setSelectedArea] = useState('All Areas');
  const [priceMax, setPriceMax] = useState(20000);
  const [selectedGender, setSelectedGender] = useState<GuestType | 'All'>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Types');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'rating' | 'priceLow' | 'priceHigh'>('rating');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(initialSearchState?.location || null);

  const allProperties = useMemo(() => {
    const dynamicProps = JSON.parse(localStorage.getItem('malnad_dynamic_properties') || '[]') as Property[];
    const approvedDynamic = dynamicProps.filter(p => p.status === 'approved');
    return [...staticProperties, ...approvedDynamic].filter(p => p.mainImage && p.mainImage.trim() !== '');
  }, []);

  const areas = useMemo(() => ['All Areas', ...Array.from(new Set(allProperties.map(p => p.location)))], [allProperties]);
  const categories = useMemo(() => ['All Types', ...Array.from(new Set(allProperties.map(p => p.category)))], [allProperties]);

  useEffect(() => {
    setCurrentPage(1);
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedArea, priceMax, selectedGender, selectedCategory, selectedAmenities, sortBy, userLocation]);

  const filteredProperties = useMemo(() => {
    let result = allProperties.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesArea = selectedArea === 'All Areas' || p.location === selectedArea;
      const matchesPrice = p.priceValue <= priceMax;
      const matchesCategory = selectedCategory === 'All Types' || p.category === selectedCategory;
      const matchesGender = selectedGender === 'All' || p.allowedGuest === 'Any' || p.allowedGuest === selectedGender;
      const matchesAmenities = selectedAmenities.length === 0 || selectedAmenities.every(a => p.amenities.includes(a));
      
      return matchesSearch && matchesArea && matchesPrice && matchesCategory && matchesGender && matchesAmenities;
    });

    if (userLocation) {
      result = result.map(p => ({ ...p, distance: calculateDistance(userLocation.lat, userLocation.lng, p.coordinates.lat, p.coordinates.lng) }))
        .sort((a: any, b: any) => a.distance - b.distance);
    } else {
      result.sort((a, b) => {
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'priceLow') return a.priceValue - b.priceValue;
        if (sortBy === 'priceHigh') return a.priceValue - a.priceValue;
        return 0;
      });
    }
    
    return result;
  }, [allProperties, searchTerm, selectedArea, priceMax, selectedGender, selectedCategory, selectedAmenities, sortBy, userLocation]);

  const totalPages = Math.ceil(filteredProperties.length / PROPERTIES_PER_PAGE);
  const paginatedProperties = useMemo(() => {
    const start = (currentPage - 1) * PROPERTIES_PER_PAGE;
    return filteredProperties.slice(start, start + PROPERTIES_PER_PAGE);
  }, [filteredProperties, currentPage]);

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const handleReset = () => {
    setSearchTerm('');
    setSelectedArea('All Areas');
    setSelectedCategory('All Types');
    setSelectedGender('All');
    setPriceMax(20000);
    setSelectedAmenities([]);
    setSortBy('rating');
    setUserLocation(null);
  };

  const FilterBoard = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className={`space-y-8 ${isMobile ? 'p-8 pb-32' : ''}`}>
      {!isMobile && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <SlidersHorizontal className="h-5 w-5 text-emerald-500" /> {t('filters.title')}
          </h2>
          <button onClick={handleReset} className="text-xs font-black text-emerald-600 dark:text-emerald-400 hover:underline uppercase tracking-widest">{t('filters.reset')}</button>
        </div>
      )}

      {/* Search Input */}
      <div className="space-y-3">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">{t('filters.search')}</label>
        <div className="relative group">
          <Search className="absolute left-4 top-3.5 h-4.5 w-4.5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
          <input 
            type="text" 
            placeholder="e.g. Balnad"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all text-sm font-medium"
          />
        </div>
      </div>

      {/* Property Type Dropdown */}
      <div className="space-y-3">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">{t('filters.category')}</label>
        <div className="relative">
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3.5 px-5 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all appearance-none cursor-pointer text-sm font-bold"
          >
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <ChevronDown className="absolute right-4 top-4 h-4.5 w-4.5 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Guest Preference Buttons */}
      <div className="space-y-3">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">{t('filters.guests')}</label>
        <div className="grid grid-cols-2 gap-3">
          {(['All', 'Family', 'Male', 'Female'] as const).map(type => (
            <button 
              key={type}
              onClick={() => setSelectedGender(type)}
              className={`py-3 px-2 rounded-2xl text-[11px] font-black uppercase tracking-tighter transition-all border-2 ${
                selectedGender === type 
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-xl shadow-emerald-900/30' 
                : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500 hover:border-emerald-500/50'
              }`}
            >
              {type === 'All' ? 'Everyone' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Slider */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">{t('filters.price')}</label>
          <span className="text-sm font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">₹{priceMax}</span>
        </div>
        <input 
          type="range" min="2000" max="25000" step="500"
          value={priceMax} onChange={(e) => setPriceMax(parseInt(e.target.value))}
          className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />
        <div className="flex justify-between text-[10px] text-slate-500 font-black mt-2 uppercase tracking-widest opacity-60">
          <span>₹2k</span>
          <span>₹25k</span>
        </div>
      </div>

      {/* Amenities Checkboxes */}
      <div className="space-y-4">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">{t('filters.amenities')}</label>
        <div className="grid grid-cols-1 gap-2.5">
          {AMENITY_OPTIONS.map(amenity => (
            <label key={amenity} className="flex items-center gap-3 cursor-pointer group">
              <div 
                onClick={() => toggleAmenity(amenity)}
                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 ${
                  selectedAmenities.includes(amenity) 
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg' 
                  : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 group-hover:border-emerald-500/40'
                }`}
              >
                {selectedAmenities.includes(amenity) && <Check className="h-3.5 w-3.5 stroke-[4px]" />}
              </div>
              <span className="text-xs md:text-sm font-bold text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{amenity}</span>
            </label>
          ))}
        </div>
      </div>

      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 z-20">
          <Button onClick={() => setIsFilterDrawerOpen(false)} className="w-full py-5 rounded-[1.5rem] shadow-2xl shadow-emerald-900/30 font-black uppercase tracking-widest">
            Show {filteredProperties.length} Properties
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 md:pt-32 pb-20 animate-in fade-in slide-in-from-bottom-4 text-slate-900 dark:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Navigation Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-10 mb-12 md:mb-16">
          <div className="flex items-center gap-4 md:gap-6">
             <button 
              onClick={onBack}
              className="p-3 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 shadow-sm border border-slate-200 dark:border-slate-800 transition-all hover:scale-105 active:scale-95"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl md:text-5xl font-serif font-bold text-slate-900 dark:text-white tracking-tight">Explore Homes</h1>
              <p className="text-slate-500 text-xs md:text-sm font-medium mt-1 uppercase tracking-widest opacity-80">{t('filters.results').replace('{count}', filteredProperties.length.toString())}</p>
            </div>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
             <div className="relative group flex-1 md:flex-none">
                <ArrowUpDown className="absolute left-4 top-3.5 h-4 w-4 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full md:w-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 pl-11 pr-10 text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-emerald-500/50 outline-none appearance-none transition-all cursor-pointer hover:border-emerald-500/50"
                >
                  <option value="rating">{t('filters.sortRating')}</option>
                  <option value="priceLow">{t('filters.sortPriceLow')}</option>
                  <option value="priceHigh">{t('filters.sortPriceHigh')}</option>
                </select>
                <ChevronDown className="absolute right-4 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
             </div>
             
             {/* Mobile Filter Trigger */}
             <button 
               onClick={() => setIsFilterDrawerOpen(true)}
               className="md:hidden flex items-center justify-center gap-3 px-6 py-3.5 bg-emerald-600 text-white rounded-2xl shadow-xl shadow-emerald-900/30 active:scale-95 transition-all text-xs font-black uppercase tracking-widest"
             >
                <Filter className="h-4 w-4" /> Filters
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 md:gap-16">
          
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-10 sticky top-32 shadow-xl shadow-slate-950/5">
               <FilterBoard />
            </div>
          </aside>

          {/* Properties Grid */}
          <div className="lg:col-span-3">
            {isLoading ? (
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                 {Array.from({ length: 6 }).map((_, i) => <PropertyCardSkeleton key={i} />)}
               </div>
            ) : filteredProperties.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {paginatedProperties.map((p) => (
                  <PropertyCard 
                    key={p.id} 
                    property={p} 
                    onClick={() => onViewProperty(p)} 
                    distance={p.distance} 
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem] p-16 md:p-32 text-center flex flex-col items-center justify-center animate-in zoom-in shadow-sm">
                 <div className="w-24 h-24 md:w-32 md:h-32 bg-slate-50 dark:bg-slate-950 rounded-full flex items-center justify-center mb-8 text-slate-200 dark:text-slate-800 shadow-inner">
                    <Search className="h-10 w-10 md:h-16 md:w-16" />
                 </div>
                 <h3 className="text-2xl md:text-4xl font-serif font-bold text-slate-900 dark:text-white mb-4">{t('filters.noResults')}</h3>
                 <p className="text-slate-500 mb-10 max-w-sm text-sm md:text-base font-medium leading-relaxed">We couldn't find any stays that match your specific criteria. Try loosening your filters.</p>
                 <Button onClick={handleReset} variant="primary" size="lg" className="px-12 rounded-2xl">{t('filters.reset')}</Button>
              </div>
            )}

            {/* Pagination */}
            {!isLoading && totalPages > 1 && (
               <div className="flex items-center justify-center gap-3 mt-16 md:mt-24">
                 <button 
                   disabled={currentPage === 1}
                   onClick={() => {
                     setCurrentPage(p => p - 1);
                     window.scrollTo({ top: 0, behavior: 'smooth' });
                   }}
                   className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 disabled:opacity-30 transition-all hover:scale-110 active:scale-95"
                 >
                   <ChevronLeft className="h-6 w-6" />
                 </button>
                 <div className="flex gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button 
                        key={page}
                        onClick={() => {
                          setCurrentPage(page);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl font-black text-xs md:text-sm transition-all hover:scale-105 active:scale-95 ${
                          currentPage === page 
                          ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-900/30 scale-110' 
                          : 'bg-white dark:bg-slate-900 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                 </div>
                 <button 
                   disabled={currentPage === totalPages}
                   onClick={() => {
                     setCurrentPage(p => p + 1);
                     window.scrollTo({ top: 0, behavior: 'smooth' });
                   }}
                   className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 disabled:opacity-30 transition-all hover:scale-110 active:scale-95"
                 >
                   <ChevronRight className="h-6 w-6" />
                 </button>
               </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer Overlay */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-[70] md:hidden animate-in fade-in duration-500">
           <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setIsFilterDrawerOpen(false)}></div>
           <div className="absolute right-0 top-0 bottom-0 w-[90%] bg-white dark:bg-slate-900 animate-in slide-in-from-right duration-500 overflow-y-auto shadow-2xl">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl z-10">
                 <h2 className="text-xl font-bold flex items-center gap-3">
                    <SlidersHorizontal className="h-5 w-5 text-emerald-500" /> Filter Options
                 </h2>
                 <button onClick={() => setIsFilterDrawerOpen(false)} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500">
                    <X className="h-6 w-6" />
                 </button>
              </div>
              <FilterBoard isMobile />
           </div>
        </div>
      )}
    </div>
  );
};
