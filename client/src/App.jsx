import React, { useState, useEffect } from 'react';

import { LanguageProvider } from './i18n/LanguageContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import WhatsAppFloatingButton from './components/common/WhatsAppFloatingButton';
import HeroSection from './components/landing/HeroSection';
import SportCategories from './components/landing/SportCategories';
import PopularCourts from './components/landing/PopularCourts';
import AvailabilityGrid from './components/landing/AvailabilityGrid';
import WhyChooseUs from './components/landing/WhyChooseUs';
import BookingModal from './components/booking/BookingModal';
import CheckBookingModal from './components/booking/CheckBookingModal';
import AdminLayout from './components/dashboard/AdminLayout';

function MainContent() {
  const todayStr = new Date().toISOString().split('T')[0];

  // URL Path Routing: if URL contains /admin or /dashboard or #admin -> 'dashboard'
  const checkInitialView = () => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    if (path.includes('/admin') || path.includes('/dashboard') || hash.includes('admin') || hash.includes('dashboard')) {
      return 'dashboard';
    }
    return 'customer';
  };

  const [activeView, setActiveViewState] = useState(checkInitialView);

  const setActiveView = (view) => {
    setActiveViewState(view);
    if (view === 'dashboard') {
      window.history.pushState({}, '', '/admin');
    } else {
      window.history.pushState({}, '', '/');
    }
  };

  // Sync back/forward browser buttons
  useEffect(() => {
    const handlePopState = () => {
      setActiveViewState(checkInitialView());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const [sports, setSports] = useState([]);
  const [courts, setCourts] = useState([]);
  const [selectedSportId, setSelectedSportId] = useState('');
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [availabilityMap, setAvailabilityMap] = useState({});

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingCourt, setBookingCourt] = useState(null);
  const [bookingSlot, setBookingSlot] = useState(null);

  const [showCheckBookingModal, setShowCheckBookingModal] = useState(false);

  useEffect(() => {
    fetch('/api/sports')
      .then(res => res.json())
      .then(res => {
        if (res.success) setSports(res.data);
      })
      .catch(err => console.error('Error loading sports:', err));
  }, []);

  useEffect(() => {
    let url = '/api/courts?status=active';
    if (selectedSportId) {
      url += `&sport_id=${selectedSportId}`;
    }
    fetch(url)
      .then(res => res.json())
      .then(res => {
        if (res.success) setCourts(res.data);
      })
      .catch(err => console.error('Error loading courts:', err));
  }, [selectedSportId]);

  useEffect(() => {
    if (courts.length === 0) return;

    courts.forEach(court => {
      fetch(`/api/courts/${court.id}/availability?date=${selectedDate}`)
        .then(res => res.json())
        .then(res => {
          if (res.success) {
            setAvailabilityMap(prev => ({
              ...prev,
              [court.id]: res.data
            }));
          }
        });
    });
  }, [courts, selectedDate]);

  const handleHeroSearch = ({ sportId, date, time }) => {
    if (sportId) setSelectedSportId(sportId);
    if (date) setSelectedDate(date);

    const el = document.getElementById('courts');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectSlot = (court, slot) => {
    setBookingCourt(court);
    setBookingSlot(slot);
    setShowBookingModal(true);
  };

  const handleBookCourtDirect = (court) => {
    setBookingCourt(court);
    setBookingSlot(null);
    setShowBookingModal(true);
  };

  const handleBookingCompleted = (bookingData) => {
    if (bookingCourt) {
      fetch(`/api/courts/${bookingCourt.id}/availability?date=${selectedDate}`)
        .then(res => res.json())
        .then(res => {
          if (res.success) {
            setAvailabilityMap(prev => ({
              ...prev,
              [bookingCourt.id]: res.data
            }));
          }
        });
    }
  };

  if (activeView === 'dashboard') {
    return <AdminLayout onSwitchToCustomer={() => setActiveView('customer')} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface font-sans text-navy">
      
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        onQuickBooking={() => {
          if (courts.length > 0) handleBookCourtDirect(courts[0]);
        }}
        onOpenCheckBooking={() => setShowCheckBookingModal(true)}
      />

      <HeroSection sports={sports} onSearch={handleHeroSearch} />

      <SportCategories
        sports={sports}
        selectedSportId={selectedSportId}
        onSelectSport={setSelectedSportId}
      />

      <PopularCourts
        courts={courts}
        availabilityMap={availabilityMap}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        onSelectSlot={handleSelectSlot}
        onBookCourt={handleBookCourtDirect}
      />

      <AvailabilityGrid
        courts={courts}
        availabilityMap={availabilityMap}
        selectedDate={selectedDate}
        onSelectSlot={handleSelectSlot}
      />

      <WhyChooseUs />

      <Footer />

      <WhatsAppFloatingButton />

      {showBookingModal && (
        <BookingModal
          court={bookingCourt || (courts.length > 0 ? courts[0] : null)}
          sports={sports}
          initialSlot={bookingSlot}
          initialDate={selectedDate}
          onClose={() => setShowBookingModal(false)}
          onBookingSuccess={handleBookingCompleted}
        />
      )}

      {showCheckBookingModal && (
        <CheckBookingModal
          onClose={() => setShowCheckBookingModal(false)}
        />
      )}

    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <MainContent />
    </LanguageProvider>
  );
}
