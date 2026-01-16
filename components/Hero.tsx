
import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { ArrowRight, Upload, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useUI } from '../contexts/UIContext';

interface HeroProps {
  onOpenDashboard: () => void;
}

const BACKGROUND_IMAGES = [
  "https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Sri_Mahalingeshwar_Temple_Puttur_Entrance.jpg/1920px-Sri_Mahalingeshwar_Temple_Puttur_Entrance.jpg?20161015141220",
  "https://upload.wikimedia.org/wikipedia/commons/e/ed/Sri_Mahalingeshwar_Temple_Puttur.jpg",
  "https://blog-img-dev.s3.ap-south-1.amazonaws.com/blog/wp-content/uploads/2024/11/Kadri-Manjunath-Temple.jpg",
  "https://d3sftlgbtusmnv.cloudfront.net/blog/wp-content/uploads/2024/11/Nelyadi-Betta.jpg",
  "https://d3sftlgbtusmnv.cloudfront.net/blog/wp-content/uploads/2024/11/Bendru-Theertha.jpg",
  "https://d3sftlgbtusmnv.cloudfront.net/blog/wp-content/uploads/2024/11/Beeramale-Hill.jpg",
  "https://d3sftlgbtusmnv.cloudfront.net/blog/wp-content/uploads/2024/11/Puttur-Fort.jpg",
  "https://d3sftlgbtusmnv.cloudfront.net/blog/wp-content/uploads/2024/11/Peer-Mohalla-Juma-Masjid.jpg",
  "https://d3sftlgbtusmnv.cloudfront.net/blog/wp-content/uploads/2024/11/Mai-De-Deus-Church.jpg",
  "https://assets.thehansindia.com/h-upload/2024/03/30/1435066-karanth.webp",
  "https://content.jdmagicbox.com/comp/hassan/b2/9999p8172.8172.180627114905.q4b2/catalogue/manjarabad-fort-donigal-hassan-v9un4tcbvg.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/c/ce/Falnir_skylines_viewed_from_Kankanady.jpg",
  "https://mindtrip.ai/cdn-cgi/image/format=webp,w=1200/https://images.mindtrip.ai/attractions/78f2/65d8/9f7e/27c6/00a9/4ff1/d142/7497",
  "https://upload.wikimedia.org/wikipedia/commons/8/8c/Mangaluru_City_Skyline_Sunset.jpg",
];

export const Hero: React.FC<HeroProps> = ({ onOpenDashboard }) => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const { openAuthModal } = useUI();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % BACKGROUND_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleListProperty = () => {
    if (isAuthenticated) {
      onOpenDashboard();
    } else {
      openAuthModal();
    }
  };

  return (
    <section id="home" className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden">
      {/* Background Slideshow */}
      <div className="absolute inset-0 z-0">
        {BACKGROUND_IMAGES.map((src, index) => (
          <div
            key={src}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img 
              src={src} 
              alt={`Malnad Landscape ${index + 1}`} 
              className="w-full h-full object-cover"
            />
            {/* Individual Dark Overlay for text readability */}
            <div className="absolute inset-0 bg-slate-950/60"></div>
          </div>
        ))}
        {/* Gradient Overlay for bottom transition */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/30 via-transparent to-slate-950"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 mb-8 px-5 py-2 rounded-full border border-emerald-500/30 bg-emerald-950/40 backdrop-blur-md hover:border-emerald-500/50 transition-colors cursor-default">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-emerald-100 font-semibold text-xs sm:text-sm tracking-wide uppercase">
            {t('hero.badge')}
          </span>
        </div>
        
        <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-8 tracking-tight leading-tight drop-shadow-lg">
          {t('hero.title1')} <br className="hidden md:block"/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200 block mt-2 md:mt-0 md:inline">
            {t('hero.title2')}
          </span>
        </h1>
        
        <p className="max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-slate-100 mb-10 leading-relaxed px-4 drop-shadow-md font-medium">
          {t('hero.subtitle')}
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button variant="primary" size="lg" onClick={() => document.getElementById('places')?.scrollIntoView({behavior: 'smooth'})} className="w-full sm:w-auto shadow-2xl shadow-emerald-900/50">
            {t('hero.ctaFind')}
          </Button>
          <Button variant="outline" size="lg" className="group w-full sm:w-auto bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20" onClick={handleListProperty}>
            <Upload className="mr-2 h-5 w-5" />
            {t('hero.ctaList')}
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-10 left-10 hidden md:block animate-bounce">
        <div className="w-px h-24 bg-gradient-to-b from-emerald-500 to-transparent mx-auto mb-4"></div>
        <span className="vertical-text text-slate-300 text-xs tracking-widest uppercase">{t('hero.scroll')}</span>
      </div>
    </section>
  );
};
