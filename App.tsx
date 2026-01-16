
import React, { Suspense, useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Services } from './components/Services';
import { FeaturedPlaces } from './components/FeaturedPlaces';
import { AboutSection } from './components/AboutSection';
import { Footer } from './components/Footer';
import { OwnerDashboardPage } from './components/OwnerDashboardPage';
import { AdminDashboardPage } from './components/AdminDashboardPage';
import { MapModal } from './components/MapModal';
import { AuthModal } from './components/AuthModal';
import { AllPropertiesPage } from './components/AllPropertiesPage';
import { ProfilePage } from './components/ProfilePage';
import { SettingsPage } from './components/SettingsPage';
import { OwnerContactPage } from './components/OwnerContactPage';
import { PropertyDetailsPage } from './components/PropertyDetailsPage';
import { useAuth } from './contexts/AuthContext';
import { useUI } from './contexts/UIContext';
import { AppTheme, Property } from './types';
import { CustomCursor } from './components/CustomCursor';
import { Chatbot } from './components/Chatbot';
import { ArrowUp } from 'lucide-react';

interface SearchState {
  query: string;
  location: { lat: number; lng: number } | null;
}

type ViewState = 'home' | 'all-listings' | 'profile' | 'settings' | 'owner-contact' | 'owner-dashboard' | 'admin-dashboard' | 'property-details';

function App() {
  const { isAuthenticated } = useAuth();
  const { isAuthModalOpen, openAuthModal, closeAuthModal } = useUI();
  
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [activePropertyForContact, setActivePropertyForContact] = useState<Property | null>(null);
  
  const [view, setView] = useState<ViewState>('home');
  const [lastView, setLastView] = useState<ViewState>('home'); // Track previous view for back navigation
  const [searchState, setSearchState] = useState<SearchState>({ query: '', location: null });
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  // Initialize theme from localStorage or default to dark
  const [theme, setTheme] = useState<AppTheme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('malnad_theme') as AppTheme;
      return saved || 'dark';
    }
    return 'dark';
  });

  // Robust Theme Effect
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    root.style.colorScheme = theme;
    localStorage.setItem('malnad_theme', theme);
    window.dispatchEvent(new Event('theme-change'));
  }, [theme]);

  // Scroll to top detection
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // View Navigation Scroll Logic
  useEffect(() => {
    // We strictly control scrolling:
    // 1. If entering Property Details, scroll to top.
    // 2. If entering any other page (except Home), scroll to top.
    // 3. If returning to Home, we DO NOT auto-scroll here. The trigger (nav click or back button) handles it.
    if (view === 'property-details') {
       window.scrollTo(0, 0);
    } else if (view !== 'home') {
       window.scrollTo(0, 0);
    }
  }, [view]);

  // Universal Auth Guard
  useEffect(() => {
    const protectedViews: ViewState[] = ['profile', 'owner-contact', 'owner-dashboard', 'admin-dashboard'];
    if (!isAuthenticated && protectedViews.includes(view)) {
      setView('home');
      openAuthModal();
    }

    if (view === 'property-details' && !selectedProperty) {
      setView('home');
    }
  }, [view, isAuthenticated, selectedProperty]);

  const resetToHome = (sectionId?: string) => {
    setView('home');
    setSelectedProperty(null);
    setActivePropertyForContact(null);
    setSearchState({ query: '', location: null });
    
    // If a section ID is provided, scroll to it after a brief delay to allow rendering
    if (sectionId && typeof sectionId === 'string') {
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      // Explicitly scroll to top when user clicks Home / Logo
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSearch = (query: string, location?: { lat: number; lng: number }) => {
    setSearchState({ query, location: location || null });
    setView('all-listings');
  };

  const handleOpenDashboard = () => {
    if (isAuthenticated) {
      setView('owner-dashboard');
    } else {
      openAuthModal();
    }
  };

  const handleReserve = (property: Property) => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    setActivePropertyForContact(property);
    setView('owner-contact');
    setIsMapOpen(false);
  };

  const handleViewProperty = (property: Property) => {
    setLastView(view); // Store current view before navigating
    setSelectedProperty(property);
    setView('property-details');
    setIsMapOpen(false);
  };

  const handleBackFromDetails = () => {
    setView(lastView);
    if (lastView === 'home') {
      // If returning to home, explicitly scroll to places section
      setTimeout(() => {
        const placesSection = document.getElementById('places');
        if (placesSection) {
          placesSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const renderContent = () => {
    switch (view) {
      case 'all-listings':
        return (
          <AllPropertiesPage 
            onBack={() => {
               setView('home');
               window.scrollTo({ top: 0, behavior: 'smooth' });
            }} 
            initialSearchState={searchState}
            onViewProperty={handleViewProperty}
          />
        );
      case 'profile':
        return isAuthenticated ? (
          <ProfilePage 
            onBack={() => {
               setView('home');
               window.scrollTo({ top: 0, behavior: 'smooth' });
            }} 
            onViewProperty={handleViewProperty} 
          />
        ) : null;
      case 'settings':
        return (
          <SettingsPage 
            onBack={() => {
               setView('home');
               window.scrollTo({ top: 0, behavior: 'smooth' });
            }} 
          />
        );
      case 'owner-dashboard':
        return isAuthenticated ? <OwnerDashboardPage onBack={() => {
               setView('home');
               window.scrollTo({ top: 0, behavior: 'smooth' });
            }} /> : null;
      case 'admin-dashboard':
        return isAuthenticated ? <AdminDashboardPage onBack={() => {
               setView('home');
               window.scrollTo({ top: 0, behavior: 'smooth' });
            }} /> : null;
      case 'property-details':
        return selectedProperty ? (
          <PropertyDetailsPage 
            property={selectedProperty} 
            onBack={handleBackFromDetails} 
            onReserve={handleReserve} 
          />
        ) : null;
      case 'owner-contact':
        return isAuthenticated && activePropertyForContact ? (
          <OwnerContactPage 
            property={activePropertyForContact} 
            onBack={() => setView('property-details')} 
          />
        ) : null;
      default:
        return (
          <>
            <Hero onOpenDashboard={handleOpenDashboard} />
            <FeaturedPlaces onViewAllClick={() => setView('all-listings')} onViewProperty={handleViewProperty} />
            <Services />
            <AboutSection />
          </>
        );
    }
  };

  return (
    <div className="font-sans bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 min-h-screen selection:bg-emerald-500/30 selection:text-emerald-200 transition-colors duration-300 cursor-none">
      <CustomCursor />
      <Navbar 
        onHome={resetToHome}
        onOpenMap={() => setIsMapOpen(true)}
        onOpenDashboard={handleOpenDashboard}
        onOpenAdminDashboard={() => {
           if (isAuthenticated) setView('admin-dashboard');
           else openAuthModal();
        }} 
        onSearch={handleSearch}
        onOpenProfile={() => {
           if (isAuthenticated) setView('profile');
           else openAuthModal();
        }}
        onOpenSettings={() => setView('settings')}
        onOpenAuthModal={openAuthModal}
        alwaysSolid={view !== 'home'}
      />
      
      <main className="min-h-screen">
        {renderContent()}
      </main>

      <Footer />

      <Chatbot />

      <MapModal 
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        onViewProperty={handleViewProperty}
      />

      <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
      
      <button
        onClick={scrollToTop}
        className={`fixed bottom-24 right-6 z-40 p-3 rounded-full bg-slate-900/80 dark:bg-white/80 backdrop-blur-md text-white dark:text-slate-900 shadow-lg border border-white/10 transition-all duration-300 transform hover:scale-110 active:scale-95 ${showScrollTop ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}
        aria-label="Scroll to top"
      >
        <ArrowUp className="h-5 w-5" />
      </button>
    </div>
  );
}

export default App;
