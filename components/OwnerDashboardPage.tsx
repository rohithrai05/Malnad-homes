
import React, { useState, useRef, useEffect } from 'react';
import { Upload, List, ChevronRight, BarChart3, CheckCircle, Sparkles, Copy, Check, Home, Image as ImageIcon, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from './Button';
import { generateListingDescription } from '../services/geminiService';
import { Property, PropertyCategory } from '../types';
import { storage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

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
  const [activeTab, setActiveTab] = useState<'upload' | 'listings' | 'stats' | 'optimizer'>('upload');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
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

  // AI Optimizer State
  const [aiPropertyName, setAiPropertyName] = useState('');
  const [aiFeatures, setAiFeatures] = useState('');
  const [aiVibe, setAiVibe] = useState('Professional & Quiet');
  const [aiResult, setAiResult] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiCopied, setAiCopied] = useState(false);

  // Amenity Toggle Handler
  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  // Image Upload Handler
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setUploadingImage(true);
    try {
      const storageRef = ref(storage, `property_images/${user?.id}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      setFormData(prev => ({ ...prev, imageUrl: downloadURL }));
    } catch (error) {
      console.error("Image upload failed:", error);
      alert("Failed to upload image. Please try again.");
      setImagePreview(null);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.imageUrl) {
      alert("Please upload a property image first.");
      return;
    }
    setLoading(true);
    
    const newProperty: Property = {
        id: `prop_${Date.now()}`,
        title: formData.title,
        category: formData.type as PropertyCategory,
        location: formData.location,
        price: `₹${formData.price}`,
        priceValue: parseInt(formData.price) || 0,
        rating: 0,
        mainImage: formData.imageUrl,
        galleryImages: [formData.imageUrl],
        description: formData.description,
        amenities: formData.amenities,
        allowedGuest: 'Any',
        specs: { guests: 2, bedrooms: 1, bathrooms: 1, size: 'Unknown' },
        coordinates: { lat: 12.7685, lng: 75.2023 },
        status: 'pending' 
    };

    setTimeout(() => {
      const existing = JSON.parse(localStorage.getItem('malnad_dynamic_properties') || '[]');
      localStorage.setItem('malnad_dynamic_properties', JSON.stringify([...existing, newProperty]));

      setLoading(false);
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
    }, 1500);
  };

  const handleAiGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPropertyName || !aiFeatures) return;
    
    setAiLoading(true);
    const desc = await generateListingDescription(aiPropertyName, aiFeatures, aiVibe);
    setAiResult(desc);
    setAiLoading(false);
  };

  const copyAiToClipboard = () => {
    navigator.clipboard.writeText(aiResult);
    setAiCopied(true);
    setTimeout(() => setAiCopied(false), 2000);
  };

  const myProperties = (JSON.parse(localStorage.getItem('malnad_dynamic_properties') || '[]') as Property[]);

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
                                      type="number" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})}
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
                          <div onClick={() => fileInputRef.current?.click()} className="relative w-full h-64 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-emerald-500 transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden bg-slate-50 dark:bg-slate-950/50">
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
                                   className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${formData.amenities.includes(amenity) ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-emerald-500'}`}
                                >
                                   {amenity}
                                </button>
                             ))}
                          </div>
                          <div className="mt-8">
                             <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">{t('owner.description')}</label>
                             <textarea 
                                rows={5} required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
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
                  {myProperties.length > 0 ? myProperties.map((prop, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                       <div className="flex items-center gap-4">
                          <img src={prop.mainImage} className="w-16 h-16 rounded-xl object-cover" />
                          <div>
                             <h4 className="font-bold text-slate-900 dark:text-white">{prop.title}</h4>
                             <p className="text-slate-500 text-xs">{prop.location} • {prop.price}</p>
                          </div>
                       </div>
                       <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${prop.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                          {prop.status}
                       </span>
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
                        <p className="text-4xl font-bold">0</p>
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
               <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm">
                  <div className="mb-8">
                     <span className="bg-amber-500/10 text-amber-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4 inline-block">{t('owner.aiBadge')}</span>
                     <h2 className="text-3xl font-serif font-bold mb-2">{t('owner.aiTitle')}</h2>
                     <p className="text-slate-500">{t('owner.aiDesc')}</p>
                  </div>
                  <form onSubmit={handleAiGenerate} className="space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t('owner.aiNameLabel')}</label>
                           <input type="text" value={aiPropertyName} onChange={e => setAiPropertyName(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 focus:ring-2 focus:ring-emerald-500 outline-none" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t('owner.aiTenantLabel')}</label>
                           <select value={aiVibe} onChange={e => setAiVibe(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 focus:ring-2 focus:ring-emerald-500 outline-none">
                              <option>Professional & Quiet</option>
                              <option>Student Friendly & Budget</option>
                              <option>Family & Safe</option>
                           </select>
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t('owner.aiFeaturesLabel')}</label>
                        <textarea rows={3} value={aiFeatures} onChange={e => setAiFeatures(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 focus:ring-2 focus:ring-emerald-500 outline-none resize-none" />
                     </div>
                     <Button type="submit" isLoading={aiLoading} className="w-full">{t('owner.aiBtn')}</Button>
                  </form>
                  {aiResult && (
                    <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 animate-in fade-in">
                       <div className="flex justify-between items-center mb-4">
                          <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-widest">AI Generated Description</h4>
                          <button onClick={copyAiToClipboard} className="text-slate-400 hover:text-emerald-500 transition-colors">
                             {aiCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </button>
                       </div>
                       <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
                          <p className="text-sm leading-relaxed">{aiResult}</p>
                       </div>
                    </div>
                  )}
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
