
import React, { useState, useEffect, useRef } from 'react';
import { X, MapPin, Navigation, Star, ArrowRight, Crosshair, Plus, Minus, Info, Layers, Mountain, Home } from 'lucide-react';
import { Property, PropertyCategory } from '../types';
import { supabase } from '../lib/supabase';
import L from 'leaflet';

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewProperty: (property: Property) => void;
}

/**
 * Accurate Area Names and Coordinates for Puttur, Karnataka
 */
const PUTTUR_AREAS = [
  { name: 'PUTTUR CITY', coords: [12.7628, 75.2105], type: 'city' },
  { name: 'Bolwar', coords: [12.7712, 75.2045], type: 'area' },
  { name: 'Kallare', coords: [12.7635, 75.2215], type: 'area' },
  { name: 'Darbe', coords: [12.7485, 75.2185], type: 'area' },
  { name: 'Parladka', coords: [12.7410, 75.2105], type: 'area' },
  { name: 'Salmara', coords: [12.7785, 75.2285], type: 'area' },
  { name: 'Bappalige', coords: [12.7455, 75.1955], type: 'area' },
  { name: 'Nehrunagar', coords: [12.8055, 75.1785], type: 'area' },
  { name: 'Samethadka', coords: [12.7645, 75.2365], type: 'area' },
  { name: 'Koornadka', coords: [12.7455, 75.2425], type: 'area' },
  { name: 'Balnad', coords: [12.7155, 75.1655], type: 'area' },
  { name: 'Kabaka', coords: [12.7855, 75.1955], type: 'area' },
  // Local Highlights
  { name: 'Mahalingeshwara Temple', coords: [12.7615, 75.2075], type: 'landmark' },
  { name: 'St Philomena College', coords: [12.7445, 75.2195], type: 'landmark' },
];

export const MapModal: React.FC<MapModalProps> = ({ isOpen, onClose, onViewProperty }) => {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [mapStyle, setMapStyle] = useState<'satellite' | 'streets'>('satellite');
  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  
  const putturCenter: [number, number] = [12.7628, 75.2105];

  const handleLocateMe = () => {
    if (!mapInstanceRef.current) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        // Smooth fly to location
        mapInstanceRef.current?.flyTo([latitude, longitude], 17, { 
            animate: true,
            duration: 1.5
        });
      },
      () => alert("Location access denied or unavailable.")
    );
  };

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();

  // Initialize Map
  useEffect(() => {
    if (isOpen && mapContainerRef.current && !mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: putturCenter,
        zoom: 14,
        zoomControl: false,
        attributionControl: false,
        maxZoom: 22
      });

      mapInstanceRef.current = map;

      // Area Labels Implementation
      PUTTUR_AREAS.forEach(area => {
        const isCity = area.type === 'city';
        const isLandmark = area.type === 'landmark';
        
        const areaLabel = L.divIcon({
          className: 'area-label-professional',
          html: `
            <div class="flex flex-col items-center group/label cursor-default">
              <span class="${isCity ? 'text-[11px] sm:text-[14px] font-black tracking-[0.3em] text-white bg-emerald-600/90' : isLandmark ? 'text-[9px] font-bold text-amber-300 bg-black/60' : 'text-[10px] font-bold text-white bg-slate-900/40 group-hover/label:bg-emerald-600/90'} 
                backdrop-blur-md px-3 py-1 rounded-full border ${isCity ? 'border-white/40' : 'border-white/10'} whitespace-nowrap shadow-lg transition-colors duration-300">
                ${area.name}
              </span>
              ${isCity ? '<div class="w-0.5 h-4 bg-emerald-500/80 mt-1"></div><div class="w-2 h-2 bg-emerald-500 rounded-full"></div>' : ''}
            </div>
          `,
          iconSize: [120, 50],
          iconAnchor: [60, 25]
        });
        L.marker(area.coords as [number, number], { icon: areaLabel, interactive: false, zIndexOffset: isCity ? 2000 : 1000 }).addTo(map);
      });

      // Modern Property Marker Component
      const propIcon = L.divIcon({
        className: 'prop-marker-pro',
        html: `
          <div class="relative flex items-center justify-center group cursor-pointer">
            <!-- Pulse Effect -->
            <div class="absolute w-12 h-12 bg-emerald-500/40 rounded-full animate-[ping_2s_infinite] pointer-events-none"></div>
            <div class="absolute w-12 h-12 bg-emerald-400/20 rounded-full animate-[pulse_3s_infinite] pointer-events-none"></div>
            
            <!-- Pin Shape -->
            <div class="relative z-10 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-2">
               <div class="absolute inset-0 bg-gradient-to-tr from-emerald-600 to-teal-400 rounded-full shadow-[0_8px_20px_rgba(0,0,0,0.4)] border-2 border-white"></div>
               <svg class="relative z-20 w-5 h-5 md:w-6 md:h-6 text-white drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
               </svg>
            </div>
            
            <!-- Shadow Anchor -->
            <div class="absolute -bottom-1 w-4 h-1.5 bg-black/40 blur-sm rounded-[100%] transition-all group-hover:scale-50 group-hover:opacity-50"></div>
          </div>
        `,
        iconSize: [48, 48],
        iconAnchor: [24, 24]
      });

      // Load Map Pins dynamically from Supabase
      const fetchPins = async () => {
        const { data } = await supabase.from('properties').select('*').eq('status', 'approved');
        
        if (data && map) {
           const dbProperties: Property[] = data.map((p: any) => ({
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
             status: p.status
           }));

           dbProperties.forEach(prop => {
             const marker = L.marker([prop.coordinates.lat, prop.coordinates.lng], { icon: propIcon })
               .addTo(map)
               .on('click', (e) => {
                 L.DomEvent.stopPropagation(e);
                 setSelectedProperty(prop);
                 // Smooth Zoom Effect (FlyTo)
                 map.flyTo([prop.coordinates.lat, prop.coordinates.lng], 18, {
                     animate: true,
                     duration: 1.5 // Seconds
                 });
               });
             markersRef.current.push(marker);
           });
        }
      };

      fetchPins();

      map.on('click', () => setSelectedProperty(null));

      // Force refresh size
      setTimeout(() => map.invalidateSize(), 500);
    }

    return () => {
      // Cleanup on unmount handled by ref check
    };
  }, [isOpen]);

  // Handle Tile Layer Updates
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Remove old layer
    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }

    // Google Maps Tile URLs
    const url = mapStyle === 'satellite' 
      ? 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}' // Hybrid
      : 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'; // Streets

    const layer = L.tileLayer(url, {
      maxZoom: 22,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    });

    layer.addTo(mapInstanceRef.current);
    tileLayerRef.current = layer;

  }, [mapStyle, isOpen]);

  // Clean up on modal close completely
  useEffect(() => {
    if (!isOpen && mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        tileLayerRef.current = null;
        markersRef.current = [];
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-hidden p-0 sm:p-5">
      {/* Immersive Backdrop */}
      <div className="absolute inset-0 bg-slate-950/98 backdrop-blur-2xl animate-in fade-in duration-500" onClick={onClose}></div>
      
      {/* Map Content Vessel */}
      <div className="relative w-full h-full sm:w-[98%] sm:h-[95%] sm:rounded-[3rem] bg-slate-900 shadow-[0_0_100px_rgba(0,0,0,1)] border border-white/5 overflow-hidden flex flex-col animate-in zoom-in-95 duration-500">
        
        {/* Floating Controller Cluster */}
        <div className="absolute top-4 left-4 right-4 sm:top-6 sm:left-6 sm:right-6 z-[400] flex justify-between items-start pointer-events-none">
          <div className="flex flex-col gap-3 sm:gap-3 pointer-events-auto">
             {/* Brand Badge - Always Visible and Professional */}
             <div className="bg-slate-900/90 backdrop-blur-xl p-3 sm:p-5 rounded-[1.5rem] sm:rounded-[2rem] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-3 sm:gap-4 transition-all hover:bg-slate-900 group">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-900/30 group-hover:scale-110 transition-transform">
                   <Navigation className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div>
                   <h2 className="text-white font-black text-xs sm:text-xl tracking-tight leading-none sm:leading-tight">Malnad Explorer</h2>
                   <p className="text-emerald-400 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-1.5 sm:gap-2 mt-1 sm:mt-1">
                      <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse border border-emerald-500/50"></span>
                      PUTTUR
                   </p>
                </div>
             </div>

             {/* Style Switcher */}
             <div className="bg-slate-900/90 backdrop-blur-xl p-2 sm:p-1.5 rounded-2xl sm:rounded-[1.5rem] border border-white/10 shadow-xl flex items-center gap-1 w-fit">
                <button 
                  onClick={() => setMapStyle('satellite')}
                  className={`px-3 py-2.5 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl text-[10px] sm:text-[10px] font-black uppercase tracking-wider flex items-center gap-2 sm:gap-2 transition-all ${mapStyle === 'satellite' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                >
                  <Mountain className="h-4 w-4 sm:h-3 sm:w-3" /> <span className="hidden sm:inline">Sat</span>
                </button>
                <button 
                  onClick={() => setMapStyle('streets')}
                  className={`px-3 py-2.5 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl text-[10px] sm:text-[10px] font-black uppercase tracking-wider flex items-center gap-2 sm:gap-2 transition-all ${mapStyle === 'streets' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                >
                  <Layers className="h-4 w-4 sm:h-3 sm:w-3" /> <span className="hidden sm:inline">Map</span>
                </button>
             </div>
          </div>
          
          <div className="flex flex-col gap-3 sm:gap-4 pointer-events-auto items-end">
            <button 
              onClick={onClose} 
              className="p-3.5 sm:p-4 bg-slate-900/90 backdrop-blur-xl text-white rounded-full border border-white/10 hover:text-red-400 transition-all shadow-2xl active:scale-95 group"
            >
              <X className="h-6 w-6 sm:h-6 sm:w-6 group-hover:rotate-90 transition-transform" />
            </button>
            
            <div className="flex flex-col bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl sm:rounded-[1.5rem] overflow-hidden shadow-2xl">
               <button onClick={handleZoomIn} className="p-3.5 sm:p-4 text-white hover:bg-emerald-600/20 transition-all border-b border-white/5 active:bg-emerald-600 group" title="Zoom In">
                  <Plus className="h-6 w-6 sm:h-6 sm:w-6 group-active:scale-125 transition-transform" />
               </button>
               <button onClick={handleZoomOut} className="p-3.5 sm:p-4 text-white hover:bg-emerald-600/20 transition-all active:bg-emerald-600 group" title="Zoom Out">
                  <Minus className="h-6 w-6 sm:h-6 sm:w-6 group-active:scale-75 transition-transform" />
               </button>
            </div>

            <button 
              onClick={handleLocateMe} 
              className="p-4 sm:p-5 bg-emerald-600 text-white rounded-2xl sm:rounded-[1.5rem] shadow-xl hover:bg-emerald-500 transition-all active:scale-90 group" 
              title="My Location"
            >
              <Crosshair className="h-6 w-6 sm:h-6 sm:w-6 group-hover:rotate-45 transition-transform" />
            </button>
          </div>
        </div>

        {/* The Map */}
        <div ref={mapContainerRef} className="w-full h-full bg-slate-950 z-0"></div>

        {/* High-Fidelity Property Preview Unit */}
        {selectedProperty && (
          <div className="absolute bottom-6 sm:bottom-10 left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 sm:w-[500px] z-[400] animate-in slide-in-from-bottom-10 duration-500">
             <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl border border-white/10 rounded-[2rem] sm:rounded-[3rem] p-5 sm:p-7 shadow-[0_40px_100px_rgba(0,0,0,0.8)] relative overflow-hidden group/card">
                <div className="flex gap-4 sm:gap-8 relative z-10">
                   <div className="relative shrink-0">
                      <img 
                        src={selectedProperty.mainImage} 
                        className="w-24 h-24 sm:w-40 sm:h-40 rounded-2xl sm:rounded-[2.5rem] object-cover shadow-2xl ring-4 sm:ring-8 ring-emerald-500/5 transition-transform group-hover/card:scale-105 duration-700" 
                        alt={selectedProperty.title}
                      />
                      <div className="absolute -top-2 -left-2 bg-emerald-600 text-white text-[9px] sm:text-[10px] font-black px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl uppercase tracking-widest shadow-xl border border-white/20">
                         {selectedProperty.category}
                      </div>
                   </div>
                   
                   <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <h4 className="text-slate-900 dark:text-white font-black text-lg sm:text-2xl truncate tracking-tight mb-1 sm:mb-2">
                        {selectedProperty.title}
                      </h4>
                      <div className="flex items-center text-slate-500 dark:text-slate-400 text-[10px] sm:text-sm font-bold opacity-80">
                        <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-emerald-500" /> {selectedProperty.location}
                      </div>
                      
                      <div className="mt-3 sm:mt-5 flex items-center justify-between">
                         <div className="flex flex-col">
                            <span className="text-[8px] sm:text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] leading-none mb-1 sm:mb-2">Rent / Month</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-black text-xl sm:text-3xl">{selectedProperty.price}</span>
                         </div>
                         <div className="flex items-center text-amber-500 font-black text-xs sm:text-sm bg-amber-500/10 px-3 sm:px-4 py-1 sm:py-1.5 rounded-xl sm:rounded-2xl border border-amber-500/20 shadow-inner">
                            <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-amber-500 mr-1 sm:mr-2" /> {selectedProperty.rating}
                         </div>
                      </div>

                      <button 
                        onClick={() => { 
                          onViewProperty(selectedProperty);
                          onClose();
                        }} 
                        className="mt-4 sm:mt-6 w-full text-xs sm:text-sm font-black text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 py-3 sm:py-4 rounded-xl sm:rounded-[1.5rem] flex items-center justify-center gap-2 sm:gap-3 transition-all active:scale-95 shadow-[0_15px_35px_rgba(16,185,129,0.3)] group/btn"
                      >
                         View Details
                         <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 group-hover/btn:translate-x-1.5 transition-transform" />
                      </button>
                   </div>
                </div>
                
                {/* Decorative Background Blur */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                <button 
                  onClick={() => setSelectedProperty(null)} 
                  className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 sm:p-3 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full z-20"
                >
                   <X className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
             </div>
          </div>
        )}
        
        {/* Pro Help Tip */}
        <div className="hidden sm:flex absolute bottom-8 left-8 z-[400] bg-slate-900/80 backdrop-blur-xl px-5 py-2.5 rounded-full border border-white/10 items-center gap-3 text-[11px] font-black text-emerald-100 uppercase tracking-widest shadow-2xl pointer-events-none">
           <Info className="h-4 w-4 text-emerald-500" />
           Verified Listings Marked in Emerald
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .prop-marker-pro {
          background: transparent !important;
          border: none !important;
        }
        .area-label-professional {
          background: transparent !important;
          border: none !important;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .leaflet-marker-pane {
          z-index: 600 !important;
        }
        /* Leaflet Specific Overrides for Dark/Google Theme */
        .leaflet-container {
          background: #0f172a;
        }
        /* Smooth transitions for labels */
        .area-label-professional span {
          text-shadow: 0 4px 12px rgba(0,0,0,0.8);
        }
      `}} />
    </div>
  );
};
