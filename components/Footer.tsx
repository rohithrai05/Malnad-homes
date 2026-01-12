
import React from 'react';
import { Facebook, Instagram, Twitter, Linkedin, Phone, Mail, MapPin } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-slate-950 pt-20 pb-10 border-t border-slate-900 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center space-x-3 mb-6 group">
              {/* Custom Modern Logo */}
              <div className="relative h-12 w-12 bg-gradient-to-br from-emerald-500 to-teal-700 rounded-xl p-2.5 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-300 flex items-center justify-center">
                 <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-white">
                    <path d="M3 10L12 2L21 10V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-90"/>
                    <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-90"/>
                    {/* Leaf Accent */}
                    <path d="M12 2C12 2 16 5 16 9C16 10.5 15 11 15 11" stroke="#a7f3d0" strokeWidth="2" strokeLinecap="round"/>
                 </svg>
              </div>
              <span className="font-serif text-xl font-bold text-white tracking-wide">
                Malnad<span className="text-emerald-500">Homes</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed mb-6">
              {t('footer.tagline')}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-slate-400 hover:text-emerald-400 transition-colors"><Instagram className="h-5 w-5" /></a>
              <a href="#" className="text-slate-400 hover:text-emerald-400 transition-colors"><Twitter className="h-5 w-5" /></a>
              <a href="#" className="text-slate-400 hover:text-emerald-400 transition-colors"><Facebook className="h-5 w-5" /></a>
              <a href="#" className="text-slate-400 hover:text-emerald-400 transition-colors"><Linkedin className="h-5 w-5" /></a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">{t('footer.company')}</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-emerald-400 transition-colors">{t('footer.aboutUs')}</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">{t('footer.careers')}</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">{t('footer.press')}</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">{t('footer.sustainability')}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">{t('footer.services')}</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-emerald-400 transition-colors">{t('footer.listingMgmt')}</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">{t('footer.workflowAuto')}</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">{t('footer.seo')}</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">{t('footer.concierge')}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">{t('footer.contact')}</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 mr-3 text-emerald-500 shrink-0" />
                <span>12 Estate Road, Chikmagalur, Karnataka, India 577101</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 mr-3 text-emerald-500 shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-3 text-emerald-500 shrink-0" />
                <span>hello@malnadhomes.in</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-slate-900 pt-8 flex flex-col md:flex-row justify-between items-center text-xs">
          <p>© {new Date().getFullYear()} {t('footer.rights')}</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">{t('footer.privacy')}</a>
            <a href="#" className="hover:text-white transition-colors">{t('footer.terms')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
