import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { COLORS, SHADOWS } from '../constants/theme';
import { api } from '../services/api';
import OutletSelector from '../components/OutletSelector';
import SportFilter from '../components/SportFilter';
import CourtCard from '../components/CourtCard';
import SlotGrid from '../components/SlotGrid';
import BookingModal from '../components/BookingModal';

export default function LandingScreen({ onOpenCheckOrder }) {
  const todayStr = new Date().toISOString().split('T')[0];

  const [outlets, setOutlets] = useState([]);
  const [sports, setSports] = useState([]);
  const [courts, setCourts] = useState([]);
  
  const [selectedOutletId, setSelectedOutletId] = useState('');
  const [selectedSportId, setSelectedSportId] = useState('');
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const [availabilityMap, setAvailabilityMap] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Booking Modal state
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingCourt, setBookingCourt] = useState(null);
  const [bookingSlot, setBookingSlot] = useState(null);

  const loadInitialData = async () => {
    setLoading(true);
    const [outletsRes, sportsRes] = await Promise.all([
      api.getOutlets(),
      api.getSports()
    ]);

    if (outletsRes.success) setOutlets(outletsRes.data);
    if (sportsRes.success) setSports(sportsRes.data);
    setLoading(false);
  };

  const loadCourts = async () => {
    const res = await api.getCourts(selectedOutletId, selectedSportId);
    if (res.success) {
      setCourts(res.data);
    }
  };

  const loadAvailability = async () => {
    if (courts.length === 0) return;
    for (const c of courts) {
      const res = await api.getCourtAvailability(c.id, selectedDate);
      if (res.success) {
        setAvailabilityMap(prev => ({
          ...prev,
          [c.id]: res.data
        }));
      }
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadCourts();
  }, [selectedOutletId, selectedSportId]);

  useEffect(() => {
    loadAvailability();
  }, [courts, selectedDate]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    await loadCourts();
    await loadAvailability();
    setRefreshing(false);
  };

  const handleBookCourtDirect = (court) => {
    setBookingCourt(court);
    setBookingSlot(null);
    setShowBookingModal(true);
  };

  const handleSelectSlot = (court, slot) => {
    setBookingCourt(court);
    setBookingSlot(slot);
    setShowBookingModal(true);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        {/* Hero Banner Section */}
        <View style={styles.heroBanner}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>⚡ SEWA LAPANGAN SERBA INSTAN</Text>
          </View>
          <Text style={styles.heroTitle}>
            Main Olahraga Tanpa Antre & Ribet
          </Text>
          <Text style={styles.heroSub}>
            Pilih cabang outlet terdekat, booking jadwal slot jam favoritmu, dan bayar secara online secara cepat.
          </Text>

          {/* Quick Action Button for Check Booking */}
          <TouchableOpacity
            style={styles.heroCheckBtn}
            onPress={onOpenCheckOrder}
            activeOpacity={0.8}
          >
            <Text style={styles.heroCheckBtnText}>🔍 Cek Status Pesanan Saya</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Memuat data venue...</Text>
          </View>
        ) : (
          <>
            {/* Outlet Horizontal Selector */}
            <OutletSelector
              outlets={outlets}
              selectedOutletId={selectedOutletId}
              onSelectOutlet={setSelectedOutletId}
            />

            {/* Sport Category Filter Chips */}
            <SportFilter
              sports={sports}
              selectedSportId={selectedSportId}
              onSelectSport={setSelectedSportId}
            />

            {/* Popular Courts Section */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>DAFTAR LAPANGAN</Text>
                <Text style={styles.sectionMeta}>{courts.length} Lapangan Ditemukan</Text>
              </View>

              {courts.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyIcon}>🏟️</Text>
                  <Text style={styles.emptyText}>Tidak ada lapangan ditemukan untuk filter ini.</Text>
                </View>
              ) : (
                courts.map((court) => (
                  <CourtCard
                    key={court.id}
                    court={court}
                    onBook={handleBookCourtDirect}
                  />
                ))
              )}
            </View>

            {/* Slot Availability Grid */}
            <SlotGrid
              courts={courts}
              availabilityMap={availabilityMap}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onSelectSlot={handleSelectSlot}
            />

            {/* Why Choose Us Feature Cards */}
            <View style={styles.featuresContainer}>
              <Text style={styles.featuresTitle}>KEUNGGULAN VENUE</Text>
              
              <View style={styles.featureGrid}>
                <View style={styles.featureCard}>
                  <Text style={styles.featureIcon}>⚡</Text>
                  <Text style={styles.featureCardTitle}>Auto Booking 24/7</Text>
                  <Text style={styles.featureCardSub}>Slot otomatis terkunci begitu pembayaran terverifikasi.</Text>
                </View>

                <View style={styles.featureCard}>
                  <Text style={styles.featureIcon}>🛡️</Text>
                  <Text style={styles.featureCardTitle}>Jaminan Lapangan</Text>
                  <Text style={styles.featureCardSub}>Fasilitas karpet & pencahayaan LED standar kompetisi.</Text>
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* Booking Modal Sheet */}
      {showBookingModal && (
        <BookingModal
          court={bookingCourt || (courts.length > 0 ? courts[0] : null)}
          initialSlot={bookingSlot}
          initialDate={selectedDate}
          onClose={() => setShowBookingModal(false)}
          onSuccess={() => {
            loadAvailability();
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  heroBanner: {
    backgroundColor: COLORS.navy,
    padding: 20,
    paddingTop: 24,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  heroBadge: {
    backgroundColor: COLORS.navyLight,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  heroBadgeText: {
    color: COLORS.sportGreen,
    fontSize: 10,
    fontWeight: '900',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  heroSub: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
    lineHeight: 18,
    marginBottom: 16,
  },
  heroCheckBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  heroCheckBtnText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '800',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 12,
    color: COLORS.textSlate,
    fontWeight: '600',
  },
  sectionContainer: {
    paddingHorizontal: 16,
    marginVertical: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.navy,
    letterSpacing: 0.5,
  },
  sectionMeta: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textSlate,
  },
  emptyCard: {
    backgroundColor: COLORS.cardBg,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 12,
    color: COLORS.textSlate,
    fontWeight: '600',
    textAlign: 'center',
  },
  featuresContainer: {
    paddingHorizontal: 16,
    marginVertical: 16,
    marginBottom: 30,
  },
  featuresTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.navy,
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  featureGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  featureCard: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
    padding: 14,
    borderRadius: 14,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  featureIcon: {
    fontSize: 20,
    marginBottom: 6,
  },
  featureCardTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.navy,
    marginBottom: 4,
  },
  featureCardSub: {
    fontSize: 10,
    color: COLORS.textSlate,
    lineHeight: 14,
  }
});
