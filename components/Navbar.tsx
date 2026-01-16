
import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, User, LogOut, Search, Bell, Settings, ChevronDown, ChevronRight, Map, Crosshair, Loader2, ShieldCheck, Home, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';

interface NavbarProps {
  onHome?: (sectionId?: string) => void;
  onOpenMap?: () => void;
  onOpenDashboard?: () => void;
  onOpenAdminDashboard?: () => void;
  onSearch?: (query: string, location?: { lat: number; lng: number }) => void;
  onOpenProfile?: () => void;
  onOpenSettings?: () => void;
  onOpenAuthModal?: () => void;
  alwaysSolid?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onHome,
  onOpenMap, 
  onOpenDashboard, 
  onOpenAdminDashboard, 
  onSearch,
  onOpenProfile,
  onOpenSettings,
  onOpenAuthModal,
  alwaysSolid = false
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  
  // Dropdown states
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  
  // Notification State
  const [notifications, setNotifications] = useState<any[]>([]);
  const [hasUnread, setHasUnread] = useState(false);

  const { user, isAuthenticated, logout } = useAuth();
  const { t } = useLanguage();
  
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Scroll Spy & Background Effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      
      const sections = ['home', 'places', 'services', 'about'];
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top >= -100 && rect.top < window.innerHeight / 2) {
            setActiveSection(section);
          }
        }
      }
    };
    
    // Initial check
    handleScroll();
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll Lock when Mobile Menu is Open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  // Combined state for visual style
  const isSolid = isScrolled || alwaysSolid;

  // Fetch Notifications Logic
  useEffect(() => {
    if (isAuthenticated) {
      const fetchNotifications = async () => {
        try {
          // Fetch latest approved properties to show as notifications
          const { data, error } = await supabase
            .from('properties')
            .select('title, location, created_at')
            .eq('status', 'approved')
            .order('created_at', { ascending: false })
            .limit(5);

          if (data && data.length > 0) {
            const newNotifs = data.map((prop: any, index: number) => ({
              id: index,
              text: `New listing in ${prop.location}: ${prop.title}`,
              time: "Recently added",
              unread: index < 2 // First 2 are unread for demo logic
            }));
            setNotifications(newNotifs);
            setHasUnread(true);
          } else {
            // Default welcome notification if no properties found
            setNotifications([
              { id: 1, text: "Welcome to Malnad Homes!", time: "Just now", unread: true }
            ]);
            setHasUnread(true);
          }
        } catch (err) {
          console.error("Error fetching notifications:", err);
        }
      };
      
      fetchNotifications();
    } else {
      setNotifications([]);
    }
  }, [isAuthenticated]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (isSearchOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isSearchOpen]);

  const navLinks = [
    { name: t('nav.home'), href: '#home', id: 'home' },
    { name: t('nav.places'), href: '#places', id: 'places' },
    { name: t('nav.services'), href: '#services', id: 'services' },
    { name: t('nav.about'), href: '#about', id: 'about' }
  ];

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    setIsMenuOpen(false);
  };

  const handleSearchSubmit = () => {
    if (onSearch) {
      onSearch(searchQuery);
      setIsSearchOpen(false);
      setIsMenuOpen(false);
    }
  };

  const handleNearMe = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        if (onSearch) {
          setSearchQuery('');
          onSearch('', {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setIsSearchOpen(false);
          setIsMenuOpen(false);
        }
      },
      (error) => {
        setIsLocating(false);
        alert("Unable to retrieve your location.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleMarkAllRead = () => {
    const updated = notifications.map(n => ({ ...n, unread: false }));
    setNotifications(updated);
    setHasUnread(false);
  };

  const handleHomeClick = () => {
    if (onHome) {
      onHome(); // Defaults to no section (top)
      setIsMenuOpen(false);
      setIsSearchOpen(false);
    }
  };

  const handleSectionClick = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
    } else {
      // If element not found, we are on another page. Navigate to Home with section target.
      if (onHome) onHome(sectionId);
    }
    setIsMenuOpen(false);
  };

  return (
    <>
      <nav 
        className={`fixed w-full z-50 transition-all duration-300 border-b ${
          isSolid 
            ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-slate-200/50 dark:border-slate-800/50 py-2 shadow-lg' 
            : 'bg-transparent border-transparent py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 md:h-16">
            
            {/* Logo Group */}
            <div 
              className="flex items-center space-x-2 md:space-x-3 cursor-pointer group shrink-0" 
              onClick={handleHomeClick}
            >
              {/* Logo: The Heritage Pearl (Animated Interactive Version) */}
              <div className={`relative h-10 w-10 md:h-12 md:w-12 transition-all duration-500 ease-out group-hover:scale-110 ${isSolid ? 'text-emerald-600 dark:text-emerald-500' : 'text-emerald-400 drop-shadow-md'}`}>
                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full overflow-visible">
                    
                    {/* The Pearl/Sun - Rises behind the roof on hover */}
                    <circle 
                      cx="12" cy="14" r="6" 
                      className="text-amber-400/90 fill-amber-400/30 transition-all duration-700 ease-in-out group-hover:-translate-y-3 group-hover:fill-amber-400/80 group-hover:shadow-[0_0_30px_rgba(251,191,36,0.8)]" 
                      strokeWidth="0" 
                      style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                    />
                    
                    {/* The Heritage House Structure */}
                    <g className="transition-transform duration-500 ease-out group-hover:-translate-y-0.5">
                      {/* Top Tier Roof */}
                      <path d="M12 2L3 8h18L12 2z" strokeWidth="2" fill="currentColor" className="opacity-10 transition-opacity duration-300 group-hover:opacity-25" />
                      <path d="M12 2L3 8h18L12 2" strokeWidth="2" />
                      
                      {/* Decorative Finial - Bobs slightly */}
                      <path d="M12 0.5V2" strokeWidth="2" className="transition-transform duration-300 group-hover:-translate-y-0.5" />

                      {/* Bottom Tier & Pillars */}
                      <path d="M2 9l-1 4h22l-1-4" strokeWidth="2" />
                      <path d="M5 13v8h14v-8" strokeWidth="2" />
                      
                      {/* Central Doorway - Lights up on hover */}
                      <rect x="10" y="16" width="4" height="5" className="fill-amber-200/0 transition-all duration-500 group-hover:fill-amber-200/90" strokeWidth="0" />
                      <path d="M10 21v-5h4v5" strokeWidth="1.5" />
                      
                      {/* Wisp of smoke (Home vibe) */}
                      <circle cx="17" cy="5" r="0.5" className="fill-slate-400/0 transition-all duration-700 delay-100 group-hover:fill-slate-400/50 group-hover:-translate-y-2 group-hover:scale-[2]" strokeWidth="0" />
                    </g>
                 </svg>
              </div>
              <div className="flex flex-col -space-y-0.5">
                <span className={`font-serif text-lg md:text-xl font-bold tracking-tight leading-none ${isSolid ? 'text-slate-900 dark:text-white' : 'text-white drop-shadow-md'}`}>
                  Malnad<span className={isSolid ? "text-emerald-500" : "text-emerald-400"}>Homes</span>
                </span>
                <span className={`text-[9px] uppercase font-bold tracking-[0.25em] hidden sm:block ${isSolid ? 'text-slate-500' : 'text-slate-200 drop-shadow-sm'}`}>
                  Puttur
                </span>
              </div>
            </div>

            {/* Desktop Center Navigation - Visible on Large screens only */}
            {!isSearchOpen && (
              <div className="hidden lg:flex items-center bg-slate-100/10 dark:bg-white/5 backdrop-blur-md px-1.5 py-1.5 rounded-full border border-white/10 shadow-inner">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      handleSectionClick(link.id);
                    }}
                    className={`px-5 py-2 rounded-full text-[13px] font-bold transition-all duration-300 ${
                      activeSection === link.id
                        ? 'text-white bg-emerald-600 shadow-lg shadow-emerald-900/30'
                        : isSolid 
                          ? 'text-slate-600 dark:text-slate-300 hover:text-emerald-500' 
                          : 'text-slate-100 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {link.name}
                  </a>
                ))}
                <div className="w-px h-4 bg-white/20 mx-2"></div>
                <button
                  onClick={onOpenMap}
                  className={`px-5 py-2 rounded-full text-[13px] font-bold transition-all duration-300 flex items-center gap-2 ${
                      isSolid 
                        ? 'text-slate-600 dark:text-slate-300 hover:text-emerald-500' 
                        : 'text-slate-100 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Map className="h-4 w-4" /> {t('nav.map')}
                </button>
              </div>
            )}

            {/* Search Input Expanded (Desktop) */}
            {isSearchOpen && (
              <div className="hidden lg:flex flex-1 max-w-lg mx-12 relative animate-in fade-in slide-in-from-right-4 duration-500">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-emerald-500 z-10" />
                <input 
                  ref={searchRef}
                  type="text"
                  placeholder={t('nav.searchPlaceholder')}
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-emerald-500/20 rounded-2xl py-3 pl-12 pr-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 shadow-2xl transition-all placeholder:text-slate-400 font-bold text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                />
                <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                   <button 
                      onClick={handleNearMe}
                      disabled={isLocating}
                      className="px-4 py-2 text-[10px] font-black text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50 uppercase tracking-widest flex items-center gap-2"
                   >
                      {isLocating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Crosshair className="h-3 w-3" />}
                      {t('nav.nearMe')}
                   </button>
                   <button onClick={() => setIsSearchOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                     <X className="h-4 w-4" />
                   </button>
                </div>
              </div>
            )}

            {/* Action Bar (Right Side) */}
            <div className="flex items-center space-x-1.5 md:space-x-3">
              {/* Search Toggle (Desktop) */}
              <button 
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className={`hidden lg:flex p-2.5 rounded-xl transition-all ${
                  isSearchOpen ? 'bg-slate-100 dark:bg-slate-800 text-emerald-500' : isSolid ? 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800' : 'text-white hover:bg-white/10'
                }`}
              >
                <Search className="h-5 w-5" />
              </button>

              {/* Notifications - Only show when authenticated */}
              {isAuthenticated && (
                <div className="relative" ref={notifRef}>
                  <button 
                    onClick={() => setIsNotifOpen(!isNotifOpen)}
                    className={`p-2.5 rounded-xl transition-all relative ${
                      isSolid ? 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800' : 'text-white hover:bg-white/10'
                    }`}
                  >
                    <Bell className="h-5 w-5" />
                    {hasUnread && (
                      <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                    )}
                  </button>
                  {isNotifOpen && (
                    <div className="absolute right-0 top-full mt-3 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/30">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">New Listings & Updates</span>
                        <button onClick={handleMarkAllRead} className="text-[10px] font-black text-emerald-500 uppercase tracking-widest hover:underline">Mark Read</button>
                      </div>
                      <div className="max-h-64 overflow-y-auto custom-scrollbar">
                        {notifications.length > 0 ? notifications.map(notif => (
                          <div key={notif.id} className="p-4 border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer flex gap-3">
                             <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${notif.unread ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}></div>
                             <div className="min-w-0">
                               <p className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-snug">{notif.text}</p>
                               <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold">{notif.time}</p>
                             </div>
                          </div>
                        )) : (
                          <div className="p-6 text-center text-slate-500 text-sm">No new notifications</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* User Menu / Profile */}
              <div className="hidden md:flex items-center">
                <div className={`h-8 w-px mx-3 ${isSolid ? 'bg-slate-200 dark:bg-slate-800' : 'bg-white/20'}`}></div>
                {isAuthenticated && user ? (
                  <div className="relative" ref={userMenuRef}>
                    <button 
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center space-x-2 px-3 py-1.5 rounded-xl border border-transparent hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all active:scale-95"
                    >
                      <div className="h-8 w-8 rounded-full border-2 border-white/20 overflow-hidden shadow-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-xs uppercase">
                        {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user.name.charAt(0)}
                      </div>
                      <span className={`text-sm font-bold truncate max-w-[100px] ${isSolid ? 'text-slate-900 dark:text-slate-200' : 'text-white'}`}>
                        {user.name.split(' ')[0]}
                      </span>
                      <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isUserMenuOpen && (
                      <div className="absolute right-0 top-full mt-3 w-60 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95">
                        <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/30">
                           <div className="flex items-center gap-3 mb-2">
                             <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-black text-sm uppercase overflow-hidden">
                                {user.avatar ? (
                                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                  user.name.charAt(0)
                                )}
                             </div>
                             <div className="min-w-0">
                               <p className="text-slate-900 dark:text-white font-bold text-sm truncate">{user.name}</p>
                               <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest">{user.role}</p>
                             </div>
                           </div>
                        </div>
                        <div className="p-2 space-y-1">
                          {user.role === 'admin' ? (
                             <button onClick={() => { onOpenAdminDashboard?.(); setIsUserMenuOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-all font-bold">
                               <ShieldCheck className="h-4 w-4" /> Admin Dashboard
                             </button>
                          ) : (
                            <button onClick={() => { onOpenDashboard?.(); setIsUserMenuOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-all font-bold">
                              <Home className="h-4 w-4" /> Owner Portal
                            </button>
                          )}
                          <button onClick={() => { setIsUserMenuOpen(false); onOpenProfile?.(); }} className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all font-medium">
                            <User className="h-4 w-4" /> {t('nav.profile')}
                          </button>
                          <button onClick={() => { setIsUserMenuOpen(false); onOpenSettings?.(); }} className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all font-medium">
                            <Settings className="h-4 w-4" /> {t('nav.settings')}
                          </button>
                        </div>
                        <div className="p-2 border-t border-slate-100 dark:border-slate-800">
                          <button onClick={handleLogout} className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all font-bold">
                            <LogOut className="h-4 w-4" /> {t('nav.logout')}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <button onClick={() => onOpenAuthModal?.()} className={`text-sm font-bold transition-colors ${isSolid ? 'text-slate-600 dark:text-slate-400 hover:text-slate-900' : 'text-slate-200 hover:text-white'}`}>{t('nav.login')}</button>
                    <button onClick={() => onOpenAuthModal?.()} className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-900/20 active:scale-95">{t('nav.signup')}</button>
                  </div>
                )}
              </div>

              {/* Mobile/Tablet Menu Toggles (Visible up to Large screens) */}
              <div className="lg:hidden flex items-center gap-1">
                <button 
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className={`p-2.5 rounded-xl transition-all active:scale-90 ${isSolid ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400' : 'bg-white/10 text-white backdrop-blur-md'}`}
                >
                  <Search className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className={`p-2.5 rounded-xl transition-all active:scale-90 ${isSolid ? 'bg-slate-900 text-white' : 'bg-emerald-600 text-white'}`}
                >
                  {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Search Overlay */}
          {isSearchOpen && (
            <div className="lg:hidden absolute top-full left-0 right-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 animate-in slide-in-from-top-1 shadow-2xl z-50">
              <div className="relative flex items-center gap-2">
                <div className="relative flex-1">
                   <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-emerald-500" />
                   <input 
                      ref={searchRef}
                      type="text"
                      placeholder={t('nav.searchPlaceholder')}
                      className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-11 pr-4 text-slate-900 dark:text-white font-bold text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                   />
                </div>
                <button 
                  onClick={handleNearMe}
                  disabled={isLocating}
                  className="p-3.5 bg-emerald-600 text-white rounded-xl shadow-lg active:scale-95 disabled:opacity-50"
                >
                  {isLocating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Crosshair className="h-5 w-5" />}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Side Drawer Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="fixed inset-0 z-[60] lg:hidden">
            {/* Dark Overlay - Closes menu on click */}
            <div 
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm animate-fade-in"
              onClick={() => setIsMenuOpen(false)}
            ></div>
            
            {/* Drawer Content - Positioned Right */}
            <div 
              className="absolute inset-y-0 right-0 w-[75%] max-w-[320px] bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 mobile-menu-slide-in-right flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
                 <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
                       <Home className="h-5 w-5" />
                    </div>
                    <span className="font-serif font-bold text-lg text-slate-900 dark:text-white">Menu</span>
                 </div>
                 <button 
                   onClick={() => setIsMenuOpen(false)}
                   className="p-2 rounded-full bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-red-500 transition-colors shadow-sm border border-slate-200 dark:border-slate-700"
                 >
                   <X className="h-5 w-5" />
                 </button>
              </div>

              {/* Drawer Scrollable Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                
                {/* Navigation Links */}
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-600 mb-3 px-2">Explore</p>
                  {navLinks.map(link => (
                    <a 
                      key={link.name} 
                      href={link.href}
                      onClick={(e) => {
                        e.preventDefault();
                        handleSectionClick(link.id);
                      }}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/50 group transition-colors"
                    >
                      <span className="text-base font-bold text-slate-700 dark:text-slate-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">{link.name}</span>
                      <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                    </a>
                  ))}
                  <button 
                    onClick={() => { setIsMenuOpen(false); onOpenMap?.(); }}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/50 group transition-colors text-left"
                  >
                    <span className="text-base font-bold text-slate-700 dark:text-slate-300 flex items-center gap-3">
                       {t('nav.map')}
                    </span>
                    <Map className="h-4 w-4 text-emerald-500" />
                  </button>
                </div>

                {/* Account / Logic Operations */}
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-600 mb-2 px-2">Account</p>
                  
                  {isAuthenticated && user ? (
                    <div className="space-y-3">
                      <div className="bg-slate-100 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 mb-4">
                          <div className="flex items-center gap-3 mb-2">
                             <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg shadow-lg overflow-hidden">
                                {user.avatar ? (
                                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                  user.name.charAt(0)
                                )}
                             </div>
                             <div className="min-w-0">
                                <p className="font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{user.role}</p>
                             </div>
                          </div>
                      </div>

                      {user.role === 'admin' ? (
                         <button onClick={() => { setIsMenuOpen(false); onOpenAdminDashboard?.(); }} className="w-full flex items-center gap-3 p-3 text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-500/10 rounded-xl transition-all">
                           <ShieldCheck className="h-5 w-5" /> Admin Dashboard
                         </button>
                      ) : (
                         <button onClick={() => { setIsMenuOpen(false); onOpenDashboard?.(); }} className="w-full flex items-center gap-3 p-3 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-500/10 rounded-xl transition-all">
                           <Home className="h-5 w-5" /> Owner Portal
                         </button>
                      )}
                      
                      <button onClick={() => { setIsMenuOpen(false); onOpenProfile?.(); }} className="w-full flex items-center gap-3 p-3 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
                        <User className="h-5 w-5 text-slate-400" /> {t('nav.profile')}
                      </button>
                      
                      <button onClick={() => { setIsMenuOpen(false); onOpenSettings?.(); }} className="w-full flex items-center gap-3 p-3 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
                        <Settings className="h-5 w-5 text-slate-400" /> {t('nav.settings')}
                      </button>
                      
                      <div className="h-px bg-slate-100 dark:bg-slate-800 my-2"></div>
                      
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all">
                        <LogOut className="h-5 w-5" /> {t('nav.logout')}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <button 
                        onClick={() => { setIsMenuOpen(false); onOpenAuthModal?.(); }} 
                        className="w-full p-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold rounded-2xl border border-slate-200 dark:border-slate-700 active:scale-95 transition-transform flex items-center justify-center gap-2"
                      >
                        <LogIn className="h-4 w-4" /> {t('nav.login')}
                      </button>
                      <button 
                        onClick={() => { setIsMenuOpen(false); onOpenAuthModal?.(); }} 
                        className="w-full p-4 bg-emerald-600 text-white font-black rounded-2xl shadow-lg active:scale-95 transition-transform uppercase tracking-widest text-xs"
                      >
                        {t('nav.signup')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Drawer Footer */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 text-center">
                 <p className="text-[10px] text-slate-400 font-medium">© 2024 Malnad Homes</p>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};
