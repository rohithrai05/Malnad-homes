
import React, { useState, useMemo } from 'react';
import { ArrowLeft, User, Mail, Phone, Calendar, Users, MessageSquare, CheckCircle, MapPin, ShieldCheck, BadgeCheck } from 'lucide-react';
import { Property } from '../types';
import { Button } from './Button';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface OwnerContactPageProps {
  property: Property;
  onBack: () => void;
}

export const OwnerContactPage: React.FC<OwnerContactPageProps> = ({ property, onBack }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form State
  const [tenantName, setTenantName] = useState(user?.name || '');
  const [tenantEmail, setTenantEmail] = useState(user?.email || '');
  const [tenantPhone, setTenantPhone] = useState(user?.contact || '');
  const [moveIn, setMoveIn] = useState('');
  const [guests, setGuests] = useState('1 Guest');
  const [message, setMessage] = useState('');

  // Logic: Get today's date in YYYY-MM-DD format for min attribute
  const today = useMemo(() => {
    return new Date().toISOString().split('T')[0];
  }, []);

  // Logic: Generate guest options based on property specs
  const guestOptions = useMemo(() => {
    const max = property.specs?.guests || 5; // Default to 5 if undefined
    return Array.from({ length: max }, (_, i) => i + 1);
  }, [property.specs]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (tenantPhone.length < 10) {
      alert("Phone number must be 10 digits.");
      return;
    }

    // Strong validation for date
    const selectedDate = new Date(moveIn);
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0); // Normalize today to start of day

    if (selectedDate < todayDate) {
      alert("Move-in date cannot be in the past. Please select a valid date.");
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase.from('inquiries').insert([
        {
          user_id: user.id,
          owner_id: property.owner_id, // Critical: Send to the property owner
          property_id: property.id,
          property_title: property.title,
          owner_contact: property.owner?.email || '',
          name: tenantName,
          email: tenantEmail,
          phone: tenantPhone,
          move_in_date: moveIn || null,
          guests: guests,
          message: message,
          status: 'pending'
        }
      ]);

      if (error) throw error;

      setSuccess(true);
    } catch (err) {
      console.error('Error submitting inquiry:', err);
      alert('Failed to send inquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const owner = property.owner || {
    name: "Malnad Homes Support",
    contact: "+91 98765 43210",
    email: "support@malnadhomes.in",
    avatar: "https://ui-avatars.com/api/?name=Malnad+Support&background=064e3b&color=fff"
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20 md:pt-24 pb-12 animate-in fade-in slide-in-from-bottom-4">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-emerald-500 transition-colors font-bold mb-6 md:mb-8 group text-sm md:text-base"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> {t('property.backBtn')}
        </button>

        {/* Improved Responsive Owner Card */}
        <div className="bg-emerald-600 rounded-2xl md:rounded-3xl p-6 md:p-10 mb-6 md:mb-8 text-white shadow-xl shadow-emerald-900/20 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-48 md:w-64 h-48 md:h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
           <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8">
                 <div className="flex items-center gap-4 md:gap-6">
                    <div className="relative shrink-0">
                      <img src={owner.avatar} className="w-16 h-16 md:w-24 md:h-24 rounded-xl md:rounded-2xl object-cover border-4 border-white/20 shadow-lg" alt={owner.name} />
                      <div className="absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 bg-white text-emerald-600 p-0.5 md:p-1 rounded-full shadow-md">
                         <BadgeCheck className="h-4 w-4 md:h-5 md:w-5" />
                      </div>
                    </div>
                    <div>
                       <span className="bg-white/20 px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[8px] md:text-[10px] font-bold uppercase tracking-widest border border-white/30 mb-2 md:mb-3 inline-block">Verified Owner</span>
                       <h2 className="text-xl md:text-3xl font-serif font-bold truncate max-w-[200px] md:max-w-none">{owner.name}</h2>
                       <p className="text-emerald-100 mt-0.5 md:mt-1 flex items-center gap-2 opacity-80 text-[10px] md:text-sm"><ShieldCheck className="h-3 w-3 md:h-4 md:w-4" /> Responds fast</p>
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-row gap-4 md:gap-8 border-t md:border-t-0 md:border-l border-white/20 pt-4 md:pt-0 md:pl-12">
                    <div className="space-y-0.5 md:space-y-1">
                       <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-emerald-200">Call Direct</p>
                       <a href={`tel:${owner.contact}`} className="text-sm md:text-lg font-bold hover:underline flex items-center gap-2">
                          <Phone className="h-3 w-3 md:h-4 md:w-4" /> {owner.contact}
                       </a>
                    </div>
                    <div className="space-y-0.5 md:space-y-1">
                       <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-emerald-200">Email Address</p>
                       <a href={`mailto:${owner.email}`} className="text-sm md:text-lg font-bold hover:underline flex items-center gap-2 truncate max-w-[250px] md:max-w-none">
                          <Mail className="h-3 w-3 md:h-4 md:w-4" /> {owner.email}
                       </a>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-5">
            
            {/* Left: Property Summary */}
            <div className="lg:col-span-2 bg-slate-900 p-6 md:p-12 text-white">
              <h2 className="text-xl md:text-2xl font-serif font-bold mb-6 md:mb-8">Reservation Summary</h2>
              
              <div className="bg-slate-800/50 rounded-2xl p-4 md:p-6 border border-slate-700/50 mb-6 md:mb-8">
                <div className="flex items-center gap-4 mb-4">
                  <img src={property.mainImage} className="w-16 h-16 md:w-20 md:h-20 rounded-xl object-cover border border-slate-700 shrink-0" />
                  <div className="min-w-0">
                    <h4 className="font-bold text-base md:text-lg leading-tight truncate">{property.title}</h4>
                    <p className="text-slate-400 text-[10px] md:text-sm flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3 text-emerald-500 shrink-0" /> <span className="truncate">{property.location}</span>
                    </p>
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-700/50 flex justify-between items-center">
                  <span className="text-slate-400 text-xs md:text-sm">Monthly Rent</span>
                  <span className="text-xl md:text-2xl font-bold text-emerald-400">{property.price}</span>
                </div>
              </div>

              <div className="space-y-4 md:space-y-6">
                 <div className="flex gap-3 md:gap-4">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0 text-xs md:text-sm font-bold">1</div>
                    <p className="text-[11px] md:text-sm text-slate-400 leading-relaxed">Fill out the <span className="text-white font-bold">Tenant Inquiry</span> form with your details.</p>
                 </div>
                 <div className="flex gap-3 md:gap-4">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0 text-xs md:text-sm font-bold">2</div>
                    <p className="text-[11px] md:text-sm text-slate-400 leading-relaxed">The owner will receive your query instantly and check availability.</p>
                 </div>
                 <div className="flex gap-3 md:gap-4">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0 text-xs md:text-sm font-bold">3</div>
                    <p className="text-[11px] md:text-sm text-slate-400 leading-relaxed">You'll be contacted via phone/email to finalize the move-in process.</p>
                 </div>
              </div>
            </div>

            {/* Right: Tenant Inquiry Form */}
            <div className="lg:col-span-3 p-6 md:p-12 relative bg-white dark:bg-slate-900 border-l border-slate-100 dark:border-slate-800">
              {success ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-white dark:bg-slate-900 z-10 animate-in zoom-in">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-emerald-900/20">
                    <CheckCircle className="h-8 w-8 md:h-10 md:w-10" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold mb-2">{t('contact.success')}</h3>
                  <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 leading-relaxed mb-10">
                    {t('contact.successDesc')}
                  </p>
                  <Button onClick={onBack} variant="outline" className="w-full">
                    {t('property.backBtn')}
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
                  <div className="mb-4">
                    <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">Tenant Details</h3>
                    <p className="text-[11px] md:text-sm text-slate-500">Provide your information so the owner can contact you.</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('contact.nameLabel')}</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-3 h-4 w-4 md:h-5 md:w-5 md:top-3.5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                      <input 
                        type="text" required 
                        value={tenantName} onChange={(e) => setTenantName(e.target.value)}
                        placeholder="e.g. John Doe"
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 md:py-3 pl-10 md:pl-12 pr-4 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all text-sm md:text-base" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('contact.emailLabel')}</label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-3 h-4 w-4 md:h-5 md:w-5 md:top-3.5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                        <input 
                          type="email" required 
                          value={tenantEmail} onChange={(e) => setTenantEmail(e.target.value)}
                          placeholder="your@email.com"
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 md:py-3 pl-10 md:pl-12 pr-4 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all text-sm md:text-base" 
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('contact.phoneLabel')}</label>
                      <div className="relative group">
                        <Phone className="absolute left-4 top-3 h-4 w-4 md:h-5 md:w-5 md:top-3.5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                        <input 
                          type="tel" required 
                          value={tenantPhone} 
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '');
                            if (val.length <= 10) setTenantPhone(val);
                          }}
                          placeholder="10 digit number"
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 md:py-3 pl-10 md:pl-12 pr-4 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all text-sm md:text-base" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('contact.moveIn')}</label>
                      <div className="relative group">
                        <Calendar className="absolute left-4 top-3 h-4 w-4 md:h-5 md:w-5 md:top-3.5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                        <input 
                          type="date" 
                          required 
                          min={today}
                          value={moveIn}
                          onChange={(e) => setMoveIn(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 md:py-3 pl-10 md:pl-12 pr-4 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all [color-scheme:dark] text-sm md:text-base" 
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('contact.guests')}</label>
                      <div className="relative group">
                        <Users className="absolute left-4 top-3 h-4 w-4 md:h-5 md:w-5 md:top-3.5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                        <select 
                          value={guests}
                          onChange={(e) => setGuests(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 md:py-3 pl-10 md:pl-12 pr-4 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all appearance-none cursor-pointer text-sm md:text-base"
                        >
                          {guestOptions.map(num => (
                            <option key={num} value={`${num} ${num === 1 ? 'Guest' : 'Guests'}`}>
                              {num} {num === 1 ? 'Guest' : 'Guests'}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('contact.message')}</label>
                    <div className="relative group">
                      <MessageSquare className="absolute left-4 top-4 h-4 w-4 md:h-5 md:w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                      <textarea 
                        rows={4} 
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Describe your background or ask specific questions..."
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-4 pl-10 md:pl-12 pr-4 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all resize-none text-sm md:text-base" 
                      />
                    </div>
                  </div>

                  <Button type="submit" isLoading={loading} className="w-full py-4 text-base md:text-lg shadow-xl shadow-emerald-900/20">
                    {t('contact.sendBtn')}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
