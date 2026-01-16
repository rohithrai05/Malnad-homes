
import React, { useState, useRef } from 'react';
import { X, Upload, List, ChevronRight, BarChart3, CheckCircle, MapPin, Copy, Check, Home, Image as ImageIcon, Loader2, Info } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './Button';
import { Property, PropertyCategory } from '../types';
import { supabase } from '../lib/supabase';

interface OwnerDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COMMON_AMENITIES = [
  'Wi-Fi', 'AC', 'Parking', 'Furnished', 'Attached Bathroom', 
  'Geyser', 'Power Backup', 'Laundry', 'CCTV', 'Meals Included',
  'Study Desk', 'Gym Access', 'Housekeeping', 'Filtered Water'
];

export const OwnerDashboardModal: React.FC<OwnerDashboardModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'upload' | 'listings' | 'stats'>('upload');
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

  if (!isOpen) return null;

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
    if (!file || !user) return;

    // Create a local preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to Supabase Storage
    setUploadingImage(true);
    try {
      const fileName = `${user.id}/${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage
        .from('property-images')
        .upload(fileName, file, { upsert: true });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('property-images')
        .getPublicUrl(fileName);

      setFormData(prev => ({ ...prev, imageUrl: urlData.publicUrl }));
    } catch (error) {
      console.error("Image upload failed:", error);
      alert("Failed to upload image. Please try again.");
      setImagePreview(null);
    } finally {
      setUploadingImage(false);
    }
  };

  // Upload Handlers
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.imageUrl) {
      alert("Please upload a property image first.");
      return;
    }
    setLoading(true);
    
    // Create new Property Object
    const newProperty: Property = {
        id: `prop_${Date.now()}`,
        title: formData.title,
        category: formData.type as PropertyCategory,
        location: formData.location,
        price: `₹${formData.price}`,
        priceValue: parseInt(formData.price) || 0,
        rating: 0, // New listing
        mainImage: formData.imageUrl,
        galleryImages: [formData.imageUrl], // Use same for gallery for demo
        description: formData.description,
        amenities: formData.amenities,
        allowedGuest: 'Any', // Default
        specs: { guests: 2, bedrooms: 1, bathrooms: 1, size: 'Unknown' },
        coordinates: { lat: 12.7685, lng: 75.2023 }, // Default to Puttur center
        status: 'pending' 
    };

    // Simulate API call and LocalStorage Save
    setTimeout(() => {
      // Get existing dynamic properties
      const existing = JSON.parse(localStorage.getItem('malnad_dynamic_properties') || '[]');
      localStorage.setItem('malnad_dynamic_properties', JSON.stringify([...existing, newProperty]));

      setLoading(false);
      setSuccess(true);
      
      // Reset form after 2 seconds
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
      }, 2000);
    }, 1500);
  };

  // Get user's properties (simulated from local storage for this user)
  const myProperties = (JSON.parse(localStorage.getItem('malnad_dynamic_properties') || '[]') as Property[]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-0 md:p-4">
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md transition-opacity" onClick={onClose}></div>
      
      <div className="relative w-full md:max-w-6xl h-full md:h-[85vh] md:max-h-[800px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 md:rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in slide-in-from-bottom-5 md:zoom-in-95 duration-200">
        
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-slate-50 dark:bg-slate-950 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 p-4 md:p-6 flex flex-col shrink-0">
          <div className="flex items-center gap-3 mb-6 md:mb-10">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-900/20 shrink-0">
              {user?.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-slate-900 dark:text-white font-bold text-sm truncate">{user?.name}</p>
              <p className="text-slate-500 text-xs">Owner Account</p>
            </div>
            <button onClick={onClose} className="ml-auto md:hidden text-slate-400 hover:text-slate-900 dark:hover:text-white">
                <X className="h-6 w-6" />
            </button>
          </div>

          <nav className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0 scrollbar-hide">
            <button 
              onClick={() => setActiveTab('upload')}
              className={`flex-shrink-0 md:w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'upload' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white border border-transparent'}`}
            >
              <Upload className="h-4 w-4" /> <span className="whitespace-nowrap">Upload Property</span>
            </button>
            <button 
              onClick={() => setActiveTab('listings')}
              className={`flex-shrink-0 md:w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'listings' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white border border-transparent'}`}
            >
              <List className="h-4 w-4" /> <span className="whitespace-nowrap">My Listings</span>
            </button>
            <button 
              onClick={() => setActiveTab('stats')}
              className={`flex-shrink-0 md:w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'stats' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white border border-transparent'}`}
            >
              <BarChart3 className="h-4 w-4" /> <span className="whitespace-nowrap">Analytics</span>
            </button>
          </nav>

          <button onClick={onClose} className="hidden md:flex mt-auto items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white text-sm px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-900/50 rounded-lg transition-colors">
            <X className="h-4 w-4" /> Close Dashboard
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-white dark:bg-slate-900 p-6 md:p-10 relative text-slate-900 dark:text-white">
          
          {activeTab === 'upload' && (
            <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 pb-12">
              <div className="mb-8">
                <h2 className="text-3xl font-serif font-bold text-slate-900 dark:text-white mb-2">List New Property</h2>
                <p className="text-slate-500 dark:text-slate-400">Add details to showcase your property. All listings require admin approval.</p>
              </div>

              {success ? (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-12 text-center animate-in zoom-in flex flex-col items-center justify-center min-h-[400px]">
                  <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-emerald-900/20">
                    <CheckCircle className="h-10 w-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Submitted for Review!</h3>
                  <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">Your property has been sent to the admin team. It will appear in your listings once approved.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                  
                  {/* Basic Info Section */}
                  <div className="bg-slate-50 dark:bg-slate-950/50 p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800/50">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800/50">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                            <Home className="h-4 w-4" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Basic Information</h3>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Property Title</label>
                            <input 
                                type="text" 
                                required
                                value={formData.title}
                                onChange={e => setFormData({...formData, title: e.target.value})}
                                placeholder="e.g. Sunset Hill Villa"
                                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl py-3.5 px-5 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Property Type</label>
                                <div className="relative">
                                    <select 
                                        value={formData.type}
                                        onChange={e => setFormData({...formData, type: e.target.value})}
                                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl py-3.5 px-5 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="Villa">Villa / Homestay</option>
                                        <option value="Apartment">Apartment / Flat</option>
                                        <option value="PG">PG (Paying Guest)</option>
                                        <option value="Hostel">Hostel / Dorm</option>
                                    </select>
                                    <ChevronRight className="absolute right-4 top-4 h-4 w-4 text-slate-500 rotate-90 pointer-events-none" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Price <span className="text-slate-500 dark:text-slate-600 font-normal lowercase">(per month)</span></label>
                                <div className="relative">
                                    <span className="absolute left-5 top-3.5 text-slate-500 font-serif">₹</span>
                                    <input 
                                        type="text" 
                                        required
                                        value={formData.price}
                                        onChange={e => setFormData({...formData, price: e.target.value})}
                                        placeholder="5000"
                                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl py-3.5 pl-10 pr-5 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                  </div>

                  {/* Location & Media Section */}
                  <div className="bg-slate-50 dark:bg-slate-950/50 p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800/50">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800/50">
                        <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                            <ImageIcon className="h-4 w-4" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Location & Media</h3>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Location</label>
                            <input 
                                type="text" 
                                required
                                value={formData.location}
                                onChange={e => setFormData({...formData, location: e.target.value})}
                                placeholder="e.g. Madikeri, Coorg"
                                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl py-3.5 px-5 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Property Image</label>
                            <div 
                              onClick={() => fileInputRef.current?.click()}
                              className={`relative w-full h-48 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden ${
                                imagePreview 
                                  ? 'border-emerald-500/50' 
                                  : 'border-slate-300 dark:border-slate-700 hover:border-emerald-500'
                              }`}
                            >
                              <input 
                                type="file" 
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                                className="hidden"
                              />
                              
                              {imagePreview ? (
                                <>
                                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                     <div className="flex flex-col items-center gap-2 text-white">
                                        <Upload className="h-6 w-6" />
                                        <span className="text-sm font-bold">Change Image</span>
                                     </div>
                                  </div>
                                  {uploadingImage && (
                                    <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center">
                                      <div className="flex flex-col items-center gap-2">
                                        <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
                                        <span className="text-xs font-bold text-emerald-500">Uploading...</span>
                                      </div>
                                    </div>
                                  )}
                                </>
                              ) : (
                                <div className="flex flex-col items-center text-slate-500">
                                  {uploadingImage ? (
                                    <Loader2 className="h-8 w-8 text-emerald-500 animate-spin mb-2" />
                                  ) : (
                                    <Upload className="h-8 w-8 mb-2" />
                                  )}
                                  <p className="text-sm font-bold">Click or drag to upload property photo</p>
                                  <p className="text-xs mt-1">PNG, JPG, WEBP (Max 5MB)</p>
                                </div>
                              )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Amenities</label>
                            <p className="text-xs text-slate-400 mb-3">Select the features available at your property:</p>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                              {COMMON_AMENITIES.map(amenity => (
                                <button
                                  key={amenity}
                                  type="button"
                                  onClick={() => toggleAmenity(amenity)}
                                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                                    formData.amenities.includes(amenity)
                                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-sm shadow-emerald-900/10'
                                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                                  }`}
                                >
                                  <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                                    formData.amenities.includes(amenity)
                                      ? 'bg-emerald-500 border-emerald-500 text-white'
                                      : 'bg-transparent border-slate-300 dark:border-slate-700'
                                  }`}>
                                    {formData.amenities.includes(amenity) && <Check className="h-2 w-2" strokeWidth={4} />}
                                  </div>
                                  {amenity}
                                </button>
                              ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Description</label>
                            <textarea 
                                rows={5}
                                required
                                value={formData.description}
                                onChange={e => setFormData({...formData, description: e.target.value})}
                                placeholder="Tell guests about the unique features, surroundings, and amenities..."
                                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-5 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 resize-none leading-relaxed"
                            />
                        </div>
                    </div>
                  </div>

                  <div className="flex flex-col-reverse md:flex-row justify-end gap-4 pt-4">
                     <Button 
                       type="button" 
                       variant="outline" 
                       onClick={() => {
                         setFormData({title: '', type: 'Villa', price: '', location: '', description: '', imageUrl: '', amenities: []});
                         setImagePreview(null);
                       }}
                       className="w-full md:w-auto text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700"
                     >
                        Reset
                     </Button>
                     <Button 
                        type="submit" 
                        size="lg" 
                        isLoading={loading || uploadingImage} 
                        disabled={!formData.imageUrl}
                        className="w-full md:w-auto shadow-xl shadow-emerald-900/20"
                      >
                       Submit Listing
                     </Button>
                  </div>
                </form>
              )}
            </div>
          )}

          {activeTab === 'listings' && (
             <div className="animate-in fade-in slide-in-from-bottom-4">
                <h2 className="text-3xl font-serif font-bold text-slate-900 dark:text-white mb-6">My Listings</h2>
                {myProperties.length > 0 ? (
                    <div className="space-y-4">
                        {myProperties.map((prop, idx) => (
                             <div key={idx} className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="h-16 w-16 rounded-lg bg-slate-200 dark:bg-slate-800 overflow-hidden">
                                        <img src={prop.mainImage} alt={prop.title} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white">{prop.title}</h3>
                                        <p className="text-slate-500 text-sm">{prop.location}</p>
                                    </div>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                    prop.status === 'pending' ? 'bg-amber-500/10 text-amber-500' :
                                    prop.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' :
                                    'bg-red-500/10 text-red-600'
                                }`}>
                                    {prop.status}
                                </div>
                             </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-16 text-center flex flex-col items-center justify-center min-h-[400px]">
                        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mb-6 border border-slate-200 dark:border-slate-800 shadow-inner">
                            <List className="h-10 w-10 text-slate-400 dark:text-slate-700" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No active listings</h3>
                        <p className="text-slate-500 mb-8 max-w-sm">You haven't uploaded any properties yet. Start your journey by listing your first property.</p>
                        <Button onClick={() => setActiveTab('upload')} variant="outline" className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300">Create First Listing</Button>
                    </div>
                )}
             </div>
          )}

           {activeTab === 'stats' && (
             <div className="animate-in fade-in slide-in-from-bottom-4">
                <h2 className="text-3xl font-serif font-bold text-slate-900 dark:text-white mb-8">Analytics Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                   <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl">
                      <p className="text-slate-500 text-xs uppercase font-bold mb-3">Total Views</p>
                      <p className="text-4xl font-bold text-slate-900 dark:text-white">0</p>
                   </div>
                   <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl text-center shadow-sm text-emerald-500">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Inquiries</p>
                      <p className="text-4xl font-bold text-emerald-500 dark:text-emerald-400">0</p>
                   </div>
                   <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl text-center shadow-sm">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Revenue (Est)</p>
                      <p className="text-4xl font-bold text-slate-900 dark:text-white">₹0</p>
                   </div>
                </div>
                <div className="h-80 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center text-slate-400 dark:text-slate-600 flex-col gap-4">
                   <BarChart3 className="h-12 w-12 opacity-20" />
                   <p>Performance data will appear here once you have active listings.</p>
                </div>
             </div>
          )}

        </div>
      </div>
    </div>
  );
};
