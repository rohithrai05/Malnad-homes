
import React, { useState } from 'react';
import { Instagram, Facebook, Phone, Mail, MapPin, X, Info, Shield, CheckCircle, FileText, HelpCircle, File } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useUI } from '../contexts/UIContext';
import { Button } from './Button';

// Internal reusable Modal component for footer content
const FooterModal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; content: React.ReactNode; icon?: React.ElementType }> = ({ isOpen, onClose, title, content, icon: Icon }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm animate-in fade-in" onClick={onClose}></div>
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 md:p-8">
          <div className="flex justify-between items-start mb-6">
             <div className="flex items-center gap-3">
                {Icon && <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-500"><Icon className="h-6 w-6" /></div>}
                <h3 className="text-2xl font-serif font-bold text-slate-900 dark:text-white leading-none">{title}</h3>
             </div>
             <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
               <X className="h-6 w-6" />
             </button>
          </div>
          <div className="text-slate-600 dark:text-slate-300 text-sm md:text-base leading-relaxed space-y-4">
             {content}
          </div>
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
             <Button onClick={onClose} className="rounded-xl px-6">
               Close
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Footer: React.FC = () => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const { openAuthModal } = useUI();
  
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    content: React.ReactNode;
    icon?: React.ElementType;
  }>({
    isOpen: false,
    title: '',
    content: null
  });

  const openModal = (title: string, content: React.ReactNode, icon?: React.ElementType) => {
    setModalConfig({ isOpen: true, title, content, icon });
  };

  const closeModal = () => {
    setModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  // Handlers for specific links
  const handleHowItWorks = (e: React.MouseEvent) => {
    e.preventDefault();
    openModal(
      t('footer.howItWorks'),
      <div className="space-y-4">
        <p>Finding your home in Malnad is simple:</p>
        <div className="flex gap-4">
           <div className="font-black text-emerald-500 text-lg">01</div>
           <p>Browse verified listings or use the map to find properties near your college or workplace.</p>
        </div>
        <div className="flex gap-4">
           <div className="font-black text-emerald-500 text-lg">02</div>
           <p>Click "Reserve" or "Contact Owner" to send a direct inquiry. No middlemen involved.</p>
        </div>
        <div className="flex gap-4">
           <div className="font-black text-emerald-500 text-lg">03</div>
           <p>Visit the property, sign the digital agreement, and move in!</p>
        </div>
      </div>,
      HelpCircle
    );
  };

  const handleSafety = (e: React.MouseEvent) => {
    e.preventDefault();
    openModal(
      t('footer.safety'),
      <div>
        <p className="mb-4">Your safety is our top priority. Here's how we ensure a secure environment:</p>
        <ul className="space-y-3">
          <li className="flex gap-2"><CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" /> <span><strong>Physical Verification:</strong> Every listing is visited by our team.</span></li>
          <li className="flex gap-2"><CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" /> <span><strong>Owner KYC:</strong> We verify the identity of all property owners.</span></li>
          <li className="flex gap-2"><CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" /> <span><strong>Secure Data:</strong> Your contact details are shared only when you initiate a booking.</span></li>
        </ul>
      </div>,
      Shield
    );
  };

  const handlePartner = (e: React.MouseEvent) => {
    e.preventDefault();
    openModal(
      t('footer.partner'),
      <div>
        <p className="mb-4">Own a property in Puttur or Malnad? Partner with us to:</p>
        <ul className="list-disc pl-5 space-y-2 mb-6">
           <li>Get verified tenant leads (Students & Professionals).</li>
           <li>Enjoy zero brokerage fees.</li>
           <li>Access our digital rent agreement tools.</li>
        </ul>
        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800 text-sm">
           <strong>How to join:</strong> Log in to your account and navigate to the <em>Owner Dashboard</em> from the profile menu to start listing your property.
        </div>
      </div>,
      CheckCircle
    );
  };

  const handleListProperty = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isAuthenticated) {
      openModal(
        "List Your Property",
        <div className="text-center">
           <p className="mb-6">You are currently logged in.</p>
           <p>To list a property, please open the User Menu (top right) and select <strong>Owner Portal</strong>.</p>
           <p className="text-sm text-slate-500 mt-4">This allows you to manage images, pricing, and availability in one place.</p>
        </div>,
        FileText
      );
    } else {
      openAuthModal();
    }
  };

  const handlePropMgmt = (e: React.MouseEvent) => {
    e.preventDefault();
    openModal(
      t('footer.propMgmt'),
      <p>Our Premium Property Management service (Coming Soon) will allow owners to completely outsource maintenance, rent collection, and tenant complaints to the Malnad Homes team. Stay tuned!</p>,
      Info
    );
  };

  const handleAgreements = (e: React.MouseEvent) => {
    e.preventDefault();
    openModal(
      t('footer.agreements'),
      <p>We provide standard, legally vetted rental agreement templates compliant with Karnataka rental laws. Owners can generate these directly from their dashboard when finalizing a tenant to ensure legal protection for both parties.</p>,
      File
    );
  };

  const handlePrivacy = (e: React.MouseEvent) => {
    e.preventDefault();
    openModal(
      t('footer.privacy'),
      <div className="space-y-4">
         <p><strong>Data Protection:</strong> We employ industry-standard encryption to protect your personal information.</p>
         <p><strong>Information Usage:</strong> Your data is used solely for connecting you with properties. We do not sell data to third-party advertisers.</p>
         <p><strong>Cookies:</strong> We use essential cookies to maintain your login session and preferences.</p>
      </div>,
      Shield
    );
  };

  const handleTerms = (e: React.MouseEvent) => {
    e.preventDefault();
    openModal(
      t('footer.terms'),
      <div className="space-y-4">
         <p>By using Malnad Homes, you agree to:</p>
         <ul className="list-disc pl-5 space-y-1">
            <li>Provide accurate information in your profile.</li>
            <li>Respect property owners and other tenants.</li>
            <li>Use the platform for lawful housing purposes only.</li>
         </ul>
         <p>Misuse of the platform may result in account suspension.</p>
      </div>,
      FileText
    );
  };

  return (
    <>
      <footer className="bg-slate-950 pt-20 pb-10 border-t border-slate-900 text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center space-x-3 mb-6 group cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
                {/* Floating Home Logo - Footer Animated Version */}
                <div className="relative h-12 w-12 text-emerald-500 transition-all duration-500 ease-out group-hover:scale-110">
                   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full overflow-visible">
                      {/* Sunrise Animation */}
                      <circle 
                        cx="12" cy="14" r="6" 
                        className="text-amber-400/80 fill-amber-400/20 transition-all duration-700 ease-in-out group-hover:-translate-y-3 group-hover:fill-amber-400/60 group-hover:shadow-lg" 
                        strokeWidth="0" 
                        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                      />
                      
                      <g className="transition-transform duration-500 ease-out group-hover:-translate-y-0.5">
                        <path d="M12 2L3 8h18L12 2z" strokeWidth="2" fill="currentColor" className="opacity-10 transition-opacity duration-300 group-hover:opacity-20" />
                        <path d="M12 2L3 8h18L12 2" strokeWidth="2" />
                        <path d="M12 0.5V2" strokeWidth="2" />
                        <path d="M2 9l-1 4h22l-1-4" strokeWidth="2" />
                        <path d="M5 13v8h14v-8" strokeWidth="2" />
                        {/* Door Lights up */}
                        <rect x="10" y="16" width="4" height="5" className="fill-amber-200/0 transition-all duration-500 group-hover:fill-amber-200/50" strokeWidth="0" />
                        <path d="M10 21v-5h4v5" strokeWidth="1.5" />
                        {/* Smoke */}
                        <circle cx="17" cy="5" r="0.5" className="fill-slate-400/0 transition-all duration-700 delay-100 group-hover:fill-slate-400/30 group-hover:-translate-y-2 group-hover:scale-[2]" strokeWidth="0" />
                      </g>
                   </svg>
                </div>
                <div className="flex flex-col">
                  <span className="font-serif text-xl font-bold text-white tracking-wide leading-none">
                    Malnad<span className="text-emerald-500">Homes</span>
                  </span>
                  <span className="text-[9px] uppercase font-bold tracking-[0.25em] text-slate-500 block mt-1">
                    Puttur
                  </span>
                </div>
              </div>
              <p className="text-sm leading-relaxed mb-6">
                {t('footer.tagline')}
              </p>
              <div className="flex space-x-4">
                <a href="https://www.instagram.com/malnadhomes" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-emerald-400 transition-colors" aria-label="Instagram">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="https://www.facebook.com/malnadhomes" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-emerald-400 transition-colors" aria-label="Facebook">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="https://wa.me/917899965405" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-emerald-400 transition-colors" aria-label="WhatsApp">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </a>
                <a href="tel:9113869353" className="text-slate-400 hover:text-emerald-400 transition-colors" aria-label="Call">
                  <Phone className="h-5 w-5" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6">{t('footer.company')}</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#about" onClick={(e) => { e.preventDefault(); document.getElementById('about')?.scrollIntoView({behavior: 'smooth'}) }} className="hover:text-emerald-400 transition-colors">{t('footer.aboutUs')}</a></li>
                <li><a href="#" onClick={handleHowItWorks} className="hover:text-emerald-400 transition-colors">{t('footer.howItWorks')}</a></li>
                <li><a href="#" onClick={handleSafety} className="hover:text-emerald-400 transition-colors">{t('footer.safety')}</a></li>
                <li><a href="#" onClick={handlePartner} className="hover:text-emerald-400 transition-colors">{t('footer.partner')}</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6">{t('footer.services')}</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#places" onClick={(e) => { e.preventDefault(); document.getElementById('places')?.scrollIntoView({behavior: 'smooth'}) }} className="hover:text-emerald-400 transition-colors">{t('footer.findHome')}</a></li>
                <li><a href="#" onClick={handleListProperty} className="hover:text-emerald-400 transition-colors">{t('footer.listProp')}</a></li>
                <li><a href="#" onClick={handlePropMgmt} className="hover:text-emerald-400 transition-colors">{t('footer.propMgmt')}</a></li>
                <li><a href="#" onClick={handleAgreements} className="hover:text-emerald-400 transition-colors">{t('footer.agreements')}</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6">{t('footer.contact')}</h4>
              <ul className="space-y-4 text-sm">
                <li className="flex items-start">
                  <MapPin className="h-5 w-5 mr-3 text-emerald-500 shrink-0" />
                  <a href="https://maps.google.com/?q=Nehru+Nagar+Puttur" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Nehru Nagar, Puttur, Karnataka, India 574203</a>
                </li>
                <li className="flex items-center">
                  <Phone className="h-5 w-5 mr-3 text-emerald-500 shrink-0" />
                  <a href="tel:9113869353" className="hover:text-white transition-colors">+91 9113869353</a>
                </li>
                <li className="flex items-center">
                  <Mail className="h-5 w-5 mr-3 text-emerald-500 shrink-0" />
                  <a href="mailto:malenaduhomes@gmail.com" className="hover:text-white transition-colors">malenaduhomes@gmail.com</a>
                </li>
              </ul>
            </div>

          </div>

          <div className="border-t border-slate-900 pt-8 flex flex-col md:flex-row justify-between items-center text-xs">
            <p>© {new Date().getFullYear()} {t('footer.rights')}</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" onClick={handlePrivacy} className="hover:text-white transition-colors">{t('footer.privacy')}</a>
              <a href="#" onClick={handleTerms} className="hover:text-white transition-colors">{t('footer.terms')}</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Reusable Footer Modal */}
      <FooterModal 
        isOpen={modalConfig.isOpen} 
        onClose={closeModal} 
        title={modalConfig.title} 
        content={modalConfig.content}
        icon={modalConfig.icon}
      />
    </>
  );
};
