
import React, { useState, useRef, useEffect } from 'react';
import { Upload, List, BarChart3, CheckCircle, Copy, Check, Home, Image as ImageIcon, Loader2, ArrowLeft, Trash2, Mail, Calendar, User, Phone, CheckSquare, XCircle, Clock, AlertCircle, RefreshCw, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from './Button';
import { Property, PropertyCategory } from '../types';
import { supabase } from '../lib/supabase';
import { OptimizationTool } from './OptimizationTool';

interface OwnerDashboardPageProps {
  onBack: () => void;
}

const COMMON_AMENITIES = [
  'Wi-Fi', 'AC', 'Parking', 'Furnished', 'Attached Bathroom', 
  'Geyser', 'Power Backup', 'Laundry', 'CCTV', 'Meals Included',
  'Study Desk', 'Gym Access', 'Housekeeping', 'Filtered Water'
];

export const OwnerDashboardPage: React.FC<OwnerDashboardPageProps> = ({ onBack }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'upload' | 'listings' | 'stats' | 'inbox' | 'optimizer'>('upload');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [myProperties, setMyProperties] = useState<Property[]>([]);
  const [fetchingProps, setFetchingProps] = useState(false);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loadingInquiries, setLoadingInquiries] = useState(false);
  const [processingInquiryId, setProcessingInquiryId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload Form State
  const [formData, setFormData] = useState({
    title: '',
    type: 'Villa',
    price: '',
    location: '',
    description: '',
    imageUrl: '',
    amenities: [] as string[]
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'listings') {
      fetchMyProperties();
    } else if (activeTab === 'inbox') {
      fetchInquiries();
    }
  }, [activeTab]);

  const fetchMyProperties = async () => {
    if (!user) return;
    setFetchingProps(true);
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const mappedProps: Property[] = (data || []).map((p: any) => ({
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
        owner: undefined 
      }));
      setMyProperties(mappedProps);
    } catch (error: any) {
      console.error('Error fetching properties:', error);
      if (error.code !== '42P01') {
         setErrorMsg(error.message || 'Failed to load properties');
      }
    } finally {
      setFetchingProps(false);
    }
  };

  const fetchInquiries = async () => {
    if (!user) return;
    setLoadingInquiries(true);
    setErrorMsg(null);
    try {
      const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInquiries(data || []);
    } catch (error: any) {
      console.error('Error fetching inquiries:', error);
      if (error.code === '42P01') {
        setErrorMsg("Database tables not found. Please run the setup SQL.");
        setInquiries([]); 
      } else {
        setErrorMsg(error.message || "An unknown error occurred while fetching inquiries.");
      }
    } finally {
      setLoadingInquiries(false);
    }
  };

  const handleInquiryAction = async (id: string, status: 'confirmed' | 'rejected') => {
    setProcessingInquiryId(id);
    try {
      const { error } = await supabase
        .from('inquiries')
        .update({ status: status })
        .eq('id', id);

      if (error) throw error;
      
      setInquiries(prev => prev.map(inq => inq.id === id ? { ...inq, status } : inq));
    } catch (error: any) {
      console.error('Error updating inquiry:', error);
      alert(`Failed to update status: ${error.message || "Unknown error"}`);
    } finally {
      setProcessingInquiryId(null);
    }
  };

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setUploadingImage(true);
    try {
      const fileName = `${user.id}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const { data, error } = await supabase.storage
        .from('property-images')
        .upload(fileName, file, { upsert: true });

      if (error) {
        throw error;
      }

      const { data: urlData } = supabase.storage
        .from('property-images')
        .getPublicUrl(fileName);

      setFormData(prev => ({ ...prev, imageUrl: urlData.publicUrl }));
    } catch (error: any) {
      console.error("Image upload failed:", error);
      alert(`Failed to upload image: ${error.message || "Unknown error"}`);
      setImagePreview(null);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!formData.imageUrl) {
      alert("Please upload a property image first.");
      return;
    }
    setLoading(true);
    
    try {
      const { error } = await supabase.from('properties').insert([
        {
          owner_id: user.id,
          title: formData.title,
          category: formData.type,
          location: formData.location,
          price: `₹${formData.price}`,
          price_value: parseInt(formData.price) || 0,
          main_image: formData.imageUrl,
          gallery_images: [formData.imageUrl],
          description: formData.description,
          amenities: formData.amenities,
          allowed_guest: 'Any',
          specs: { guests: 2, bedrooms: 1, bathrooms: 1, size: 'Unknown' },
          coordinates: { lat: 12.7685, lng: 75.2023 },
          status: 'pending'
        }
      ]);

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setFormData({
            title: '',
            type: 'Villa',
            price: '',
            location: '',
            description: '',
            imageUrl: '',
            amenities: []
        });
        setImagePreview(null);
        setActiveTab('listings');
      }, 2000);
    } catch (error: any) {
      console.error('Error submitting property:', error);
      const msg = error.message || error.details || JSON.stringify(error);
      alert(`Failed to list property: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProperty = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this listing? This will also remove any reviews and inquiries associated with it.')) return;
    
    setDeletingId(id);
    try {
      // Manual Cascade: Delete related records first
      await Promise.allSettled([
        supabase.from('reviews').delete().eq('property_id', id),
        supabase.from('favorites').delete().eq('property_id', id),
        supabase.from('inquiries').delete().eq('property_id', id)
      ]);

      const { error } = await supabase.from('properties').delete().eq('id', id);
      if (error) {
         if (error.code === '23503') {
            throw new Error("Cannot delete property because it has related data protected by the database. Contact admin.");
         }
         throw error;
      }
      
      setMyProperties(prev => prev.filter(p => p.id !== id));
    } catch (error: any) {
      console.error('Error deleting property:', error);
      alert(`Failed to delete property: ${error.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-12 animate-in fade-in slide-in-from-bottom-4 text-slate-900 dark:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={onBack}
            className="p-2 rounded-full bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-emerald-500 transition-colors shadow-sm"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-serif font-bold text-slate-900 dark:text-white">{t('owner.title')}</h1>
            <p className="text-sm text-slate-500">{t('owner.subtitle')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Navigation Sidebar */}
          <div className="lg:col-span-1 space-y-2">
            <button 
              onClick={() => setActiveTab('upload')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'upload' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'}`}
            >
              <Upload className="h-5 w-5" /> {t('owner.tabUpload')}
            </button>
            <button 
              onClick={() => setActiveTab('inbox')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'inbox' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'}`}
            >
              <Mail className="h-5 w-5" /> Inbox & Requests
            </button>
            <button 
              onClick={() => setActiveTab('listings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'listings' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'}`}
            >
              <List className="h-5 w-5" /> {t('owner.tabListings')}
            </button>
            <button 
              onClick={() => setActiveTab('stats')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'stats' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'}`}
            >
              <BarChart3 className="h-5 w-5" /> {t('owner.tabAnalytics')}
            </button>
            <button 
              onClick={() => setActiveTab('optimizer')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'optimizer' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'}`}
            >
              <Sparkles className="h-5 w-5" /> {t('owner.tabOptimizer')}
            </button>
          </div>

          {/* Tab Content */}
          <div className="lg:col-span-3">
            
            {activeTab === 'inbox' && (
               <div className="space-y-6">
                  <h3 className="text-xl font-serif font-bold text-slate-900 dark:text-white mb-6">Tenant Inquiries</h3>
                  
                  {loadingInquiries ? (
                     <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-emerald-500"/></div>
                  ) : errorMsg ? (
                     <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-2xl p-6 text-center">
                        <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
                        <h4 className="text-red-600 dark:text-red-400 font-bold mb-1">Failed to load inquiries</h4>
                        <p className="text-red-500/80 text-sm">{errorMsg}</p>
                     </div>
                  ) : inquiries.length > 0 ? (
                     <div className="space-y-4">
                        {inquiries.map((req) => (
                           <div key={req.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
                              {/* Inquiry Card Content */}
                              <div className="flex justify-between items-start">
                                 <div>
                                    <div className="flex items-center gap-2 mb-1">
                                       <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">{req.property_title}</span>
                                       <span className="text-slate-400 text-xs flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(req.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <h4 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                                       <User className="h-4 w-4 text-slate-500" /> {req.name}
                                    </h4>
                                 </div>
                                 <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                                    req.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                    req.status === 'rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                    'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                 }`}>
                                    {req.status}
                                 </div>
                              </div>
                              
                              <div className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                 <div className="space-y-2">
                                    <p className="text-slate-500 flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> <span className="text-slate-700 dark:text-slate-300 font-medium">{req.phone}</span></p>
                                    <p className="text-slate-500 flex items-center gap-2"><Mail className="h-3.5 w-3.5" /> <span className="text-slate-700 dark:text-slate-300 font-medium">{req.email}</span></p>
                                 </div>
                                 <div className="space-y-2">
                                    <p className="text-slate-500 flex items-center gap-2"><Calendar className="h-3.5 w-3.5" /> Move In: <span className="text-slate-700 dark:text-slate-300 font-medium">{req.move_in_date}</span></p>
                                    <p className="text-slate-500 flex items-center gap-2"><User className="h-3.5 w-3.5" /> Guests: <span className="text-slate-700 dark:text-slate-300 font-medium">{req.guests}</span></p>
                                 </div>
                                 {req.message && (
                                    <div className="col-span-1 md:col-span-2 pt-2 border-t border-slate-200 dark:border-slate-800 mt-2">
                                       <p className="text-slate-500 italic">"{req.message}"</p>
                                    </div>
                                 )}
                              </div>

                              {req.status === 'pending' && (
                                 <div className="flex justify-end gap-3 pt-2">
                                    <Button 
                                       size="sm" 
                                       variant="outline" 
                                       className="text-red-500 border-red-500/20 hover:bg-red-500/10 hover:border-red-500/50"
                                       onClick={() => handleInquiryAction(req.id, 'rejected')}
                                       disabled={processingInquiryId === req.id}
                                    >
                                       {processingInquiryId === req.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4 mr-2" />}
                                       Reject
                                    </Button>
                                    <Button 
                                       size="sm" 
                                       className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20"
                                       onClick={() => handleInquiryAction(req.id, 'confirmed')}
                                       disabled={processingInquiryId === req.id}
                                    >
                                       {processingInquiryId === req.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckSquare className="h-4 w-4 mr-2" />}
                                       Accept Tenant
                                    </Button>
                                 </div>
                              )}
                           </div>
                        ))}
                     </div>
                  ) : (
                     <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-16 text-center shadow-sm">
                        <Mail className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <h4 className="text-lg font-bold text-slate-900 dark:text-white">No inquiries yet</h4>
                        <p className="text-slate-500 text-sm">When tenants book your property, requests will appear here.</p>
                     </div>
                  )}
               </div>
            )}

            {activeTab === 'upload' && (
               <div className="space-y-6">
                 {success ? (
                   <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-16 text-center animate-in zoom-in flex flex-col items-center justify-center shadow-sm">
                      <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-emerald-900/20">
                        <CheckCircle className="h-10 w-10" />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t('owner.uploadSuccess')}</h3>
                      <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">{t('owner.uploadSuccessDesc')}</p>
                   </div>
                 ) : (
                    <form onSubmit={handleSubmit} className="space-y-8">
                       <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm">
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                             <Home className="h-5 w-5 text-emerald-500" /> {t('owner.basicInfo')}
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div className="space-y-2 col-span-1 md:col-span-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t('owner.propTitle')}</label>
                                <input 
                                   type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                                   className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                                   placeholder="e.g. Sunset Heights PG"
                                />
                             </div>
                             <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t('owner.propType')}</label>
                                <select 
                                   value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}
                                   className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none appearance-none"
                                >
                                   <option value="Villa">Villa / Homestay</option>
                                   <option value="Apartment">Apartment / Flat</option>
                                   <option value="PG">PG (Paying Guest)</option>
                                   <option value="Hostel">Hostel / Dorm</option>
                                </select>
                             </div>
                             <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t('owner.price')} ({t('owner.perMonth')})</label>
                                <div className="relative">
                                   <span className="absolute left-4 top-3 text-slate-500">₹</span>
                                   <input 
                                      type="text" 
                                      required 
                                      value={formData.price} 
                                      onChange={e => {
                                        const val = e.target.value.replace(/\D/g, '');
                                        setFormData({...formData, price: val});
                                      }}
                                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-8 pr-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                                      placeholder="5000"
                                   />
                                </div>
                             </div>
                             <div className="space-y-2 col-span-1 md:col-span-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t('owner.location')}</label>
                                <input 
                                   type="text" required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})}
                                   className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                                   placeholder="e.g. Balnad, Puttur"
                                />
                             </div>
                          </div>
                       </div>

                       <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm">
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                             <ImageIcon className="h-5 w-5 text-emerald-500" /> {t('owner.image')}
                          </h3>
                          <div onClick={() => fileInputRef.current?.click()} className="relative w-full h-64 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-emerald-500 transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden bg-slate-50 dark:bg-slate-900/50">
                             <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                             {imagePreview ? (
                                <>
                                  <img src={imagePreview} className="w-full h-full object-cover" />
                                  {uploadingImage && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><Loader2 className="animate-spin text-white h-8 w-8" /></div>}
                                </>
                             ) : (
                                <div className="text-center">
                                   <Upload className="mx-auto h-10 w-10 text-slate-300 mb-2" />
                                   <p className="text-sm font-bold text-slate-500">{t('owner.imageDesc')}</p>
                                </div>
                             )}
                          </div>
                       </div>

                       <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm">
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('owner.amenities')}</h3>
                          <p className="text-sm text-slate-500 mb-6">{t('owner.amenitiesDesc')}</p>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                             {COMMON_AMENITIES.map(amenity => (
                                <button key={amenity} type="button" onClick={() => toggleAmenity(amenity)}
                                   className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${formData.amenities.includes(amenity) ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-emerald-500'}`}
                                >
                                   {amenity}
                                </button>
                             ))}
                          </div>
                          <div className="mt-8">
                             <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">{t('owner.description')}</label>
                             <textarea 
                                rows={5} required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                                placeholder="Details about distance to campus, food facilities, safety..."
                             />
                          </div>
                       </div>

                       <div className="flex justify-end gap-4">
                          <Button type="button" variant="outline" onClick={() => setFormData({title: '', type: 'Villa', price: '', location: '', description: '', imageUrl: '', amenities: []})}>
                             {t('owner.btnReset')}
                          </Button>
                          <Button type="submit" isLoading={loading || uploadingImage} disabled={!formData.imageUrl}>
                             {t('owner.btnSubmit')}
                          </Button>
                       </div>
                    </form>
                 )}
               </div>
            )}

            {activeTab === 'listings' && (
               <div className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                     <h3 className="text-xl font-bold">{t('owner.tabListings')}</h3>
                     <button 
                        onClick={() => fetchMyProperties()} 
                        className="text-slate-500 hover:text-emerald-500 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                        title="Refresh List"
                     >
                        <RefreshCw className={`h-4 w-4 ${fetchingProps ? 'animate-spin' : ''}`} />
                     </button>
                  </div>
                  
                  {fetchingProps ? (
                    <div className="text-center py-20"><Loader2 className="h-8 w-8 animate-spin mx-auto text-emerald-500"/></div>
                  ) : myProperties.length > 0 ? myProperties.map((prop, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-sm group">
                       <div className="flex items-center gap-4">
                          <img src={prop.mainImage} className="w-16 h-16 rounded-xl object-cover" />
                          <div>
                             <h4 className="font-bold text-slate-900 dark:text-white">{prop.title}</h4>
                             <p className="text-slate-500 text-xs">{prop.location} • {prop.price}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-4">
                           <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${prop.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' : prop.status === 'rejected' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'}`}>
                              {prop.status}
                           </span>
                           <button onClick={(e) => handleDeleteProperty(e, prop.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors" disabled={deletingId === prop.id}>
                              {deletingId === prop.id ? <Loader2 className="h-5 w-5 animate-spin" /> : <Trash2 className="h-5 w-5" />}
                           </button>
                       </div>
                    </div>
                  )) : (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-16 text-center shadow-sm">
                       <h4 className="text-xl font-bold mb-2">{t('owner.noListings')}</h4>
                       <p className="text-slate-500 mb-8">{t('owner.noListingsDesc')}</p>
                       <Button onClick={() => setActiveTab('upload')}>{t('owner.createFirst')}</Button>
                    </div>
                  )}
               </div>
            )}

            {activeTab === 'stats' && (
               <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl text-center shadow-sm">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{t('owner.statsViews')}</p>
                        <p className="text-4xl font-bold">0</p>
                     </div>
                     <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl text-center shadow-sm text-emerald-500">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{t('owner.statsInquiries')}</p>
                        <p className="text-4xl font-bold">{inquiries.length}</p>
                     </div>
                     <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl text-center shadow-sm">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{t('owner.statsRevenue')}</p>
                        <p className="text-4xl font-bold">₹0</p>
                     </div>
                  </div>
                  <div className="h-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-400 gap-4 shadow-sm">
                     <BarChart3 className="h-10 w-10 opacity-20" />
                     <p className="text-sm">{t('owner.statsDesc')}</p>
                  </div>
               </div>
            )}

            {activeTab === 'optimizer' && (
              <div className="animate-in fade-in slide-in-from-bottom-4">
                <OptimizationTool embedded />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
