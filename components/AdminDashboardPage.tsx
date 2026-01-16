
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Check, XCircle, MapPin, Building, ArrowLeft, Loader2, Database, RefreshCw, Trash2, List, LayoutList, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from './Button';
import { Property, PropertyCategory } from '../types';
import { supabase } from '../lib/supabase';
import { properties as staticProperties } from '../data/properties';

interface AdminDashboardPageProps {
  onBack: () => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onBack }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending');
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);

  useEffect(() => {
    loadProperties();
  }, [activeTab]);

  const loadProperties = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('status', activeTab)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const mappedProps: Property[] = data.map((p: any) => ({
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
          status: p.status,
          owner: undefined 
        }));
        setProperties(mappedProps);
      } else {
        setProperties([]);
      }
    } catch (error) {
      console.error(`Error loading ${activeTab} properties:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: 'approved' | 'rejected') => {
    setProcessingId(id);
    try {
      const { data, error } = await supabase
        .from('properties')
        .update({ status: newStatus })
        .eq('id', id)
        .select();

      if (error) throw error;

      setProperties(prev => prev.filter(p => p.id !== id));
    } catch (error: any) {
      console.error("Error updating status:", error);
      alert(`Failed to update status: ${error.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this listing?\n\nThis will also remove all related reviews, favorites, and inquiries.\n\nThis action cannot be undone.")) return;
    
    setProcessingId(id);
    try {
      await Promise.allSettled([
        supabase.from('reviews').delete().eq('property_id', id),
        supabase.from('favorites').delete().eq('property_id', id),
        supabase.from('inquiries').delete().eq('property_id', id)
      ]);

      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProperties(prev => prev.filter(p => p.id !== id));
    } catch (error: any) {
      console.error("Error deleting property:", error);
      alert(`Failed to delete property: ${error.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleSeedDatabase = async () => {
    if (!user) return;
    if (!confirm("This will insert demo properties into the database. Continue?")) return;
    
    setIsSeeding(true);
    try {
      const payload = staticProperties.map(p => ({
        owner_id: user.id, 
        title: p.title,
        category: p.category,
        location: p.location,
        price: p.price,
        price_value: p.priceValue,
        main_image: p.mainImage,
        gallery_images: p.galleryImages,
        description: p.description,
        amenities: p.amenities,
        allowed_guest: p.allowedGuest,
        specs: p.specs,
        coordinates: p.coordinates,
        status: 'pending' 
      }));

      const { error } = await supabase.from('properties').insert(payload);
      if (error) throw error;

      alert("Success! Demo properties added as 'Pending'.");
      if (activeTab === 'pending') loadProperties();
    } catch (error: any) {
      console.error("Seeding failed:", error);
      alert(`Seeding failed: ${error.message}`);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-12 animate-in fade-in slide-in-from-bottom-4 text-slate-900 dark:text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="p-2 rounded-full bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-emerald-500 transition-colors shadow-sm"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-4">
               <div className="h-12 w-12 rounded-xl bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-600/30">
                  <ShieldCheck className="h-6 w-6" />
               </div>
               <div>
                  <h1 className="text-3xl font-serif font-bold text-slate-900 dark:text-white">{t('admin.title')}</h1>
                  <p className="text-sm text-slate-500">{t('admin.subtitle')}</p>
               </div>
            </div>
          </div>

          <div className="flex gap-3">
             <Button 
                variant="outline" 
                onClick={() => loadProperties()} 
                disabled={isLoading}
                className="border-slate-200 dark:border-slate-800"
             >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
             </Button>
             <Button 
                onClick={handleSeedDatabase} 
                disabled={isSeeding || isLoading}
                className="bg-indigo-600 hover:bg-indigo-500 text-white border-transparent shadow-lg shadow-indigo-900/20"
             >
                {isSeeding ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Database className="h-4 w-4 mr-2" />}
                Seed Database
             </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-8 border-b border-slate-200 dark:border-slate-800 pb-1">
          <button 
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'pending' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            <List className="h-4 w-4" /> Pending Reviews
          </button>
          <button 
            onClick={() => setActiveTab('approved')}
            className={`px-4 py-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'approved' ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            <LayoutList className="h-4 w-4" /> Active Listings
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-32">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
          </div>
        ) : properties.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-20 text-center shadow-sm">
             <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                {activeTab === 'pending' ? <Check className="h-10 w-10 text-emerald-500" /> : <XCircle className="h-10 w-10 text-slate-400" />}
             </div>
             <h3 className="text-xl font-bold mb-2">{activeTab === 'pending' ? t('admin.noPending') : 'No Active Listings'}</h3>
             <p className="text-slate-500 mb-8">{activeTab === 'pending' ? t('admin.noPendingDesc') : 'Approved properties will appear here.'}</p>
             {activeTab === 'pending' && <Button variant="outline" onClick={handleSeedDatabase}>Add Demo Data</Button>}
          </div>
        ) : (
          <div className="space-y-6">
             <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${activeTab === 'pending' ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                {activeTab === 'pending' ? t('admin.pending') : 'Live Properties'} <span className="text-slate-400 font-normal">({properties.length})</span>
             </h3>
             <div className="grid grid-cols-1 gap-6">
                {properties.map((prop) => (
                  <div key={prop.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-sm hover:shadow-md transition-all group">
                     <div className="md:w-72 h-56 md:h-auto shrink-0 relative bg-slate-100 dark:bg-slate-800">
                        <img src={prop.mainImage} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" alt={prop.title} />
                        <div className={`absolute top-4 left-4 text-black text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest shadow-lg ${activeTab === 'pending' ? 'bg-amber-500' : 'bg-emerald-500 text-white'}`}>
                          {activeTab === 'pending' ? 'Pending Review' : 'Live'}
                        </div>
                     </div>
                     <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
                        <div>
                           <div className="flex justify-between items-start mb-2">
                              <h4 className="text-2xl font-serif font-bold text-slate-900 dark:text-white">{prop.title}</h4>
                              <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{prop.price}</span>
                           </div>
                           <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-6">
                              <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {prop.location}</span>
                              <span className="flex items-center gap-1.5"><Building className="h-3.5 w-3.5" /> {prop.category}</span>
                           </div>
                           <p className="text-slate-600 dark:text-slate-300 line-clamp-2 mb-6 text-sm leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">{prop.description}</p>
                           
                           {/* Amenities Preview */}
                           <div className="flex flex-wrap gap-2 mb-4">
                              {prop.amenities.slice(0, 5).map((am, i) => (
                                <span key={i} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-[10px] font-bold uppercase tracking-wider rounded-md text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">{am}</span>
                              ))}
                              {prop.amenities.length > 5 && <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-[10px] font-bold rounded-md text-slate-400">+{prop.amenities.length - 5}</span>}
                           </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                           {activeTab === 'pending' ? (
                             <>
                               <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-red-500 border-red-200 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300" 
                                  onClick={() => handleUpdateStatus(prop.id, 'rejected')}
                                  disabled={processingId === prop.id}
                               >
                                  {processingId === prop.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4 mr-2" />}
                                  {t('admin.btnReject')}
                               </Button>
                               <Button 
                                  size="sm" 
                                  className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20"
                                  onClick={() => handleUpdateStatus(prop.id, 'approved')}
                                  disabled={processingId === prop.id}
                               >
                                  {processingId === prop.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
                                  {t('admin.btnApprove')}
                               </Button>
                             </>
                           ) : (
                             <Button 
                                variant="outline"
                                size="sm" 
                                className="text-amber-500 border-amber-200 dark:border-amber-900/30 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:border-amber-300" 
                                onClick={() => handleUpdateStatus(prop.id, 'rejected')}
                                disabled={processingId === prop.id}
                             >
                                {processingId === prop.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <EyeOff className="h-4 w-4 mr-2" />}
                                Suspend
                             </Button>
                           )}
                        </div>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
