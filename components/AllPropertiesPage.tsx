
import React, { useState, useMemo, useEffect } from 'react';
import { 
  ArrowLeft, Filter, MapPin, Search, Star, ChevronDown, 
  Navigation, Heart, ChevronLeft, ChevronRight, X, SlidersHorizontal,
  ArrowUpDown, Check, Crosshair, Loader2, Wifi, Coffee, Car, Shield, Zap
} from 'lucide-react';
import { Property, GuestType, PropertyCategory } from '../types';
import { Button } from './Button';
import { useFavorites } from '../contexts/FavoritesContext';
import { useAuth } from '../contexts/AuthContext';
import { useUI } from '../contexts/UIContext';
import { PropertyCardSkeleton } from './Skeleton';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';

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
  'Wi-Fi', 'AC', 'Parking', 'Food', 'Power Backup', 
  'Security', 'Gym', 'Laundry', 'Hot Water'
];

// Helper to match amenities loosely (e.g. "High-Speed Wi-Fi" matches "Wi-Fi")
const checkAmenityMatch = (propertyAmenities: string[], selected: string[]) => {
  if (selected.length === 0) return true;
  return selected.every(sel => 
    propertyAmenities.some(p => p.toLowerCase().includes(sel.toLowerCase()))
  );
};

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Earth radius in km
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
      className="bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 transition-all duration-500 group cursor-pointer hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] relative h-full flex flex-col hover:-translate-y-2"
    >
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-slate-200 dark:bg-slate-800 shrink-0">
        <img src={property.mainImage} alt={property.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-in-out" />
        
        {/* Floating Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
           <div className="bg-slate-950/60 backdrop-blur-md px-2.5 py-1 rounded-xl flex items-center gap-1.5 border border-white/10 shadow-lg w-fit">
            <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
            <span className="text-[10px] font-black text-white">{property.rating || 'New'}</span>
          </div>
          {typeof distance === 'number' && (
            <span className="bg-emerald-600/90 backdrop-blur-md px-2.5 py-1 rounded-xl text-[9px] font-black text-white uppercase flex items-center gap-1.5 shadow-lg w-fit animate-in fade-in slide-in-from-left-2">
              <Navigation className="h-2.5 w-2.5" /> {distance.toFixed(1)} km
            </span>
          )}
        </div>

        <button 
          onClick={handleFavoriteClick} 
          className={`absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-md border transition-all duration-300 z-10 group/fav ${
            favorite 
              ? 'bg-red-500 border-red-400 shadow-lg scale-110' 
              : 'bg-black/20 border-white/20 hover:bg-black/40 text-white'
          }`}
        >
          <Heart className={`h-4.5 w-4.5 transition-colors ${favorite ? 'fill-white text-white' : 'text-white'}`} />
        </button>

        <div className="absolute bottom-4 left-4">
          <span className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-900 dark:text-white text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest shadow-lg">
            {property.category}
          </span>
        </div>
      </div>

      <div className="p-5 md:p-7 flex-1 flex flex-col">
        <div className="flex items-center text-slate-500 dark:text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-widest mb-2">
          <MapPin className="h-3.5 w-3.5 mr-1.5 text-emerald-500 shrink-0" />
          <span className="truncate">{property.location}</span>
        </div>
        
        <h3 className="text-lg font-serif font-bold text-slate-900 dark:text-white mb-4 line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">
          {property.title}
        </h3>

        {/* Mini Specs */}
        <div className="flex gap-3 mb-5 text-slate-500 dark:text-slate-400 text-xs font-medium">
           <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
             {property.specs.bedrooms} Beds
           </span>
           <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
             {property.specs.bathrooms} Baths
           </span>
        </div>
        
        <div className="mt-auto flex justify-between items-center pt-5 border-t border-slate-100 dark:border-slate-800">
          <div className="transition-transform duration-300 group-hover:translate-x-1">
            <p className="text-slate-900 dark:text-white font-black text-xl transition-all duration-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 origin-left">
              {property.price}
            </p>
            <p className="text-slate-400 text-[9px] uppercase font-bold tracking-widest mt-0.5">
              / Month
            </p>
          </div>
          
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-emerald-600 transition-all duration-300 group-hover:text-white text-slate-400 shadow-sm group-hover:shadow-emerald-900/30">
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
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [isLocating, setIsLocating] = useState(false);
  
  // Advanced Filters State
  const [searchTerm, setSearchTerm] = useState(initialSearchState?.query || '');
  const [priceMax, setPriceMax] = useState(25000);
  const [selectedGender, setSelectedGender] = useState<GuestType | 'All'>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'rating' | 'priceLow' | 'priceHigh'>('rating');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(initialSearchState?.location || null);
  const [maxDistance, setMaxDistance] = useState<number>(10); // Default 10km search radius

  // Update internal state if props change (e.g. searching from Navbar)
  useEffect(() => {
    if (initialSearchState?.location) {
      setUserLocation(initialSearchState.location);
    }
    if (initialSearchState?.query) {
      setSearchTerm(initialSearchState.query);
    }
  }, [initialSearchState]);

  useEffect(() => {
    const fetchProps = async () => {
      setIsLoading(true);
      // Fetch dynamic approved properties from Supabase ONLY
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'approved');
      
      let dynamicProps: Property[] = [];
      if (data) {
        dynamicProps = data.map((p: any) => ({
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
      }

      const filtered = dynamicProps.filter(p => p.mainImage && p.mainImage.trim() !== '');
      setAllProperties(filtered);
      setIsLoading(false);
    };

    fetchProps();
  }, []);

  const handleNearMe = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        setIsLocating(false);
        alert("Unable to retrieve your location.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const filteredProperties = useMemo(() => {
    let result = allProperties.filter(p => {
      // 1. Search Text (Title or Location)
      const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      // 2. Price Filter
      const matchesPrice = p.priceValue <= priceMax;
      
      // 3. Category Filter
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      
      // 4. Guest Type Filter
      const matchesGender = selectedGender === 'All' || p.allowedGuest === 'Any' || p.allowedGuest === selectedGender;
      
      // 5. Amenities Filter (AND logic - must have all selected)
      const matchesAmenities = checkAmenityMatch(p.amenities, selectedAmenities);
      
      // 6. Distance Filter (only if user location is set)
      let matchesDistance = true;
      let dist = 0;
      if (userLocation) {
        dist = calculateDistance(userLocation.lat, userLocation.lng, p.coordinates.lat, p.coordinates.lng);
        matchesDistance = dist <= maxDistance;
      }
      
      return matchesSearch && matchesPrice && matchesCategory && matchesGender && matchesAmenities && matchesDistance;
    });

    // Augment with distance for sorting
    if (userLocation) {
      result = result.map(p => ({
        ...p,
        distance: calculateDistance(userLocation.lat, userLocation.lng, p.coordinates.lat, p.coordinates.lng)
      }));
      // If user location is active, default sort is by Distance unless explicitly changed
      if (sortBy === 'rating') { // 'rating' is default state, so we override it for distance if location is present
         result.sort((a: any, b: any) => a.distance - b.distance);
      }
    }

    // Apply explicit sorts
    if (sortBy === 'priceLow') result.sort((a, b) => a.priceValue - b.priceValue);
    if (sortBy === 'priceHigh') result.sort((a, b) => b.priceValue - a.priceValue);
    if (sortBy === 'rating' && !userLocation) result.sort((a, b) => b.rating - a.rating); // Only sort by rating if no location or explicitly asked

    return result;
  }, [allProperties, searchTerm, priceMax, selectedGender, selectedCategory, selectedAmenities, sortBy, userLocation, maxDistance]);

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
    setSelectedCategory('All');
    setSelectedGender('All');
    setPriceMax(25000);
    setSelectedAmenities([]);
    setSortBy('rating');
    setUserLocation(null);
    setMaxDistance(10);
  };

  const FilterBoard = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className={`space-y-8 ${isMobile ? 'p-6 pb-32' : ''}`}>
      {!isMobile && (
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-emerald-500" /> Filters
          </h2>
          <button onClick={handleReset} className="text-[10px] font-black text-slate-400 hover:text-emerald-500 uppercase tracking-widest transition-colors">Reset</button>
        </div>
      )}

      {/* Location Section */}
      <div className="space-y-3">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">Location & Radius</label>
        
        <div className="flex gap-2 items-center">
           <div className="relative group flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400 group-focus-within:text-emerald-500 transition-colors duration-300" />
            <input 
              type="text" 
              placeholder="Search area..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800/60 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 shadow-sm transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-700 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 focus:bg-white dark:focus:bg-slate-950 outline-none"
            />
          </div>
          <button 
            onClick={handleNearMe}
            disabled={isLocating}
            className={`p-3.5 rounded-2xl border-2 transition-all duration-300 ${
              userLocation 
              ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-600 dark:text-emerald-400 shadow-emerald-500/20 shadow-md' 
              : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800/60 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm'
            }`}
            title="Use my location"
          >
            {isLocating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Crosshair className="h-5 w-5" />}
          </button>
        </div>

        {/* Distance Slider - Only visible if location is set */}
        {userLocation && (
          <div className="pt-2 animate-in fade-in slide-in-from-top-2">
             <div className="flex justify-between items-center mb-2">
               <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Within {maxDistance} km</span>
             </div>
             <input 
                type="range" min="1" max="50" step="1"
                value={maxDistance} onChange={(e) => setMaxDistance(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
             />
             <div className="flex justify-between text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-widest">
               <span>1 km</span>
               <span>50 km</span>
             </div>
          </div>
        )}
      </div>

      <div className="h-px bg-slate-100 dark:bg-slate-800"></div>

      {/* Property Type Segmented Control */}
      <div className="space-y-3">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">Type</label>
        <div className="flex flex-wrap gap-2">
          {['All', 'Villa', 'PG', 'Apartment', 'Hostel'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                selectedCategory === cat
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-lg'
                  : 'bg-transparent border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Guest Type */}
      <div className="space-y-3">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">Who's Staying?</label>
        <div className="grid grid-cols-4 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          {(['All', 'Family', 'Male', 'Female'] as const).map(type => (
            <button 
              key={type}
              onClick={() => setSelectedGender(type)}
              className={`py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                selectedGender === type 
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm scale-95' 
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              {type === 'All' ? 'Any' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Max Budget</label>
          <span className="text-base font-black text-slate-900 dark:text-white">₹{priceMax.toLocaleString()}</span>
        </div>
        <input 
          type="range" min="2000" max="25000" step="500"
          value={priceMax} onChange={(e) => setPriceMax(parseInt(e.target.value))}
          className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />
      </div>

      <div className="h-px bg-slate-100 dark:bg-slate-800"></div>

      {/* Amenities Tags */}
      <div className="space-y-3">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">Amenities</label>
        <div className="flex flex-wrap gap-2">
          {AMENITY_OPTIONS.map(amenity => {
            const isSelected = selectedAmenities.includes(amenity);
            return (
              <button 
                key={amenity} 
                onClick={() => toggleAmenity(amenity)}
                className={`px-3 py-2 rounded-xl text-[11px] font-bold border transition-all flex items-center gap-1.5 ${
                  isSelected
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300'
                }`}
              >
                {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                {amenity}
              </button>
            );
          })}
        </div>
      </div>

      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 z-20">
          <Button onClick={() => setIsFilterDrawerOpen(false)} className="w-full py-4 rounded-xl shadow-xl shadow-emerald-900/20 font-bold">
            View {filteredProperties.length} Properties
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20 md:pt-28 pb-20 animate-in fade-in slide-in-from-bottom-4 text-slate-900 dark:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header & Mobile Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 md:mb-12">
          <div className="flex items-center gap-4">
             <button 
              onClick={onBack}
              className="p-3 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 shadow-sm border border-slate-200 dark:border-slate-800 transition-all hover:scale-105 active:scale-95"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 dark:text-white tracking-tight">Find Stays</h1>
              <div className="flex items-center gap-2 mt-1">
                 {userLocation && <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><Crosshair className="h-3 w-3" /> Near Me</span>}
                 <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{filteredProperties.length} results found</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
             {/* Sort Dropdown */}
             <div className="relative group flex-1 md:flex-none">
                <ArrowUpDown className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-hover:text-emerald-500 transition-colors z-10" />
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full md:w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-10 pr-10 text-xs font-bold uppercase tracking-wide text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-emerald-500/50 outline-none appearance-none cursor-pointer hover:border-emerald-500/50 shadow-sm"
                >
                  <option value="rating">Recommended</option>
                  <option value="priceLow">Price: Low to High</option>
                  <option value="priceHigh">Price: High to Low</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
             </div>
             
             {/* Mobile Filter Button */}
             <button 
               onClick={() => setIsFilterDrawerOpen(true)}
               className="md:hidden flex items-center justify-center gap-2 px-5 py-3 bg-slate-900 dark:bg-emerald-600 text-white rounded-xl shadow-lg active:scale-95 transition-all text-xs font-bold uppercase tracking-widest whitespace-nowrap"
             >
                <Filter className="h-4 w-4" /> Filters
                {selectedAmenities.length > 0 && <span className="bg-white text-emerald-600 w-4 h-4 rounded-full flex items-center justify-center text-[9px]">{selectedAmenities.length}</span>}
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block lg:col-span-1 sticky top-28">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 shadow-xl shadow-slate-200/50 dark:shadow-black/20">
               <FilterBoard />
            </div>
          </aside>

          {/* Grid */}
          <div className="lg:col-span-3">
            {isLoading ? (
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                 {Array.from({ length: 6 }).map((_, i) => <PropertyCardSkeleton key={i} />)}
               </div>
            ) : filteredProperties.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedProperties.map((p) => (
                    <PropertyCard 
                      key={p.id} 
                      property={p} 
                      onClick={() => onViewProperty(p)} 
                      distance={p.distance} 
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-16">
                    <button 
                      disabled={currentPage === 1}
                      onClick={() => {
                        setCurrentPage(p => p - 1);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-30 transition-all active:scale-95"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mx-2">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button 
                      disabled={currentPage === totalPages}
                      onClick={() => {
                        setCurrentPage(p => p + 1);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-30 transition-all active:scale-95"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-12 text-center flex flex-col items-center justify-center shadow-sm min-h-[400px]">
                 <div className="w-20 h-20 bg-slate-50 dark:bg-slate-950 rounded-full flex items-center justify-center mb-6 text-slate-300 dark:text-slate-700">
                    <Search className="h-10 w-10" />
                 </div>
                 <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('filters.noResults')}</h3>
                 <p className="text-slate-500 text-sm mb-8 max-w-xs leading-relaxed">Adjust your filters or radius to find more properties.</p>
                 <Button onClick={handleReset} variant="outline" className="rounded-xl px-8 border-slate-200 dark:border-slate-800">{t('filters.reset')}</Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-[70] md:hidden animate-in fade-in duration-300">
           <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsFilterDrawerOpen(false)}></div>
           <div className="absolute right-0 top-0 bottom-0 w-[85%] max-w-[350px] bg-white dark:bg-slate-900 animate-in slide-in-from-right duration-300 shadow-2xl overflow-y-auto">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-10">
                 <h2 className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                    <SlidersHorizontal className="h-5 w-5 text-emerald-500" /> Filters
                 </h2>
                 <button onClick={() => setIsFilterDrawerOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500">
                    <X className="h-5 w-5" />
                 </button>
              </div>
              <FilterBoard isMobile />
           </div>
        </div>
      )}
    </div>
  );
};
