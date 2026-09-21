import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
  Image,
  Linking
} from 'react-native';
import { COLORS, SHADOWS } from '../../constants/theme';
import { api, getApiUrl } from '../../services/api';

export default function BookingsTab({ currentUser }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Status Change Modal State
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Image Preview Modal State
  const [previewProofUrl, setPreviewProofUrl] = useState(null);

  const getFullProofUrl = (proofPath) => {
    if (!proofPath || typeof proofPath !== 'string' || !proofPath.trim()) return '';
    if (proofPath.startsWith('http://') || proofPath.startsWith('https://') || proofPath.startsWith('data:image')) {
      return proofPath;
    }
    const baseUrl = getApiUrl().replace(/\/api\/?$/, '');
    return `${baseUrl}${proofPath.startsWith('/') ? '' : '/'}${proofPath}`;
  };

  const loadBookings = async () => {
    setLoading(true);
    try {
      const baseUrl = getApiUrl();
      let url = `${baseUrl}/bookings`;
      const params = [];
      if (searchQuery) params.push(`search=${encodeURIComponent(searchQuery)}`);
      if (statusFilter) params.push(`payment_status=${statusFilter}`);
      if (params.length > 0) url += `?${params.join('&')}`;

      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setBookings(json.data);
      } else {
        setBookings([]);
      }
    } catch (err) {
      console.error('Failed to load bookings:', err);
      setBookings([
        {
          id: 1,
          booking_code: 'SB-892401',
          customer_name: 'Budi Santoso',
          customer_phone: '081234567890',
          court_name: 'Badminton Court 01',
          outlet_name: 'Senayan Sports Hub',
          booking_date: '2026-09-22',
          start_time: '19:00',
          end_time: '21:00',
          total_price: 160000,
          payment_status: 'paid',
          booking_status: 'paid',
          payment_proof: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80'
        },
        {
          id: 2,
          booking_code: 'SB-109283',
          customer_name: 'Andi Wijaya',
          customer_phone: '081399887766',
          court_name: 'Futsal Arena 01',
          outlet_name: 'Kemang Sport Arena',
          booking_date: '2026-09-22',
          start_time: '20:00',
          end_time: '21:00',
          total_price: 180000,
          payment_status: 'unpaid',
          booking_status: 'unpaid'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [statusFilter]);

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      const baseUrl = getApiUrl();
      await fetch(`${baseUrl}/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_status: newStatus, payment_status: newStatus === 'paid' ? 'paid' : newStatus })
      });
      setSelectedBooking(null);
      loadBookings();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleDelete = async (bookingId) => {
    try {
      const baseUrl = getApiUrl();
      await fetch(`${baseUrl}/bookings/${bookingId}?permanent=true`, { method: 'DELETE' });
      setSelectedBooking(null);
      loadBookings();
    } catch (err) {
      console.error('Failed to delete booking:', err);
    }
  };

  const handleWA = (phone, name, code) => {
    if (!phone) return;
    const text = `Halo Kak ${name}, mengenai transaksi booking tempat Kode: *${code}*`;
    const url = `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`;
    Linking.openURL(url).catch(err => console.error('Failed to open WA:', err));
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'paid' || s === 'lunas') {
      return { label: 'LUNAS', bg: COLORS.sportGreenBg, color: COLORS.sportGreen };
    }
    if (s === 'cancelled' || s === 'batal') {
      return { label: 'CANCELLED', bg: COLORS.dangerBg, color: COLORS.danger };
    }
    return { label: 'MENUNGGU BAYAR', bg: COLORS.orangeBg, color: COLORS.orange };
  };

  return (
    <View style={styles.container}>
      
      {/* Search & Filters Card */}
      <View style={styles.filterCard}>
        <Text style={styles.headerTitle}>📋 MANAJEMEN BOOKING & TRANSAKSI</Text>
        
        {/* Search input */}
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="Cari nama, HP, atau Kode Booking..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={loadBookings}
          />
          <TouchableOpacity style={styles.searchBtn} onPress={loadBookings}>
            <Text style={styles.searchBtnText}>Cari</Text>
          </TouchableOpacity>
        </View>

        {/* Status Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          {[
            { label: 'Semua Status', val: '' },
            { label: 'Lunas (Paid)', val: 'paid' },
            { label: 'Belum Bayar (Unpaid)', val: 'unpaid' },
            { label: 'Cancelled', val: 'cancelled' }
          ].map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.filterChip, statusFilter === item.val && styles.filterChipActive]}
              onPress={() => setStatusFilter(item.val)}
            >
              <Text style={[styles.filterChipText, statusFilter === item.val && styles.textWhite]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Bookings List Cards */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Memuat transaksi booking...</Text>
        </View>
      ) : bookings.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyTitle}>Tidak ada data booking ditemukan.</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {bookings.map((booking) => {
            const badge = getStatusBadge(booking.payment_status || booking.booking_status);
            const proofUrl = getFullProofUrl(booking.payment_proof);
            const hasProof = Boolean(proofUrl);

            return (
              <View key={booking.id} style={styles.bookingCard}>
                
                {/* Header Row */}
                <View style={styles.cardHeaderRow}>
                  <View style={styles.codeBadge}>
                    <Text style={styles.codeText}>{booking.booking_code}</Text>
                  </View>
                  <View style={[styles.statusTag, { backgroundColor: badge.bg }]}>
                    <Text style={[styles.statusText, { color: badge.color }]}>{badge.label}</Text>
                  </View>
                </View>

                {/* Details */}
                <Text style={styles.courtName}>{booking.court_name || 'Lapangan Venue'}</Text>
                {booking.outlet_name ? (
                  <Text style={styles.outletName}>📍 {booking.outlet_name}</Text>
                ) : null}

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Pemesan:</Text>
                  <Text style={styles.detailVal}>{booking.customer_name} ({booking.customer_phone})</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Tanggal Main:</Text>
                  <Text style={styles.detailVal}>{booking.booking_date}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Waktu Main:</Text>
                  <Text style={styles.detailVal}>{booking.start_time} - {booking.end_time || ''}</Text>
                </View>

                {/* Proof of Payment Thumbnail Badge */}
                {hasProof ? (
                  <TouchableOpacity
                    style={styles.proofBadgeBtn}
                    onPress={() => setPreviewProofUrl(proofUrl)}
                    activeOpacity={0.8}
                  >
                    <Image source={{ uri: proofUrl }} style={styles.proofMiniThumb} resizeMode="cover" />
                    <Text style={styles.proofBadgeText}>🖼️ Lihat Struk Bukti Transfer</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.noProofBadge}>
                    <Text style={styles.noProofText}>⚠️ Bukti Transfer Belum Diunggah</Text>
                  </View>
                )}

                <View style={styles.divider} />

                <View style={styles.priceRow}>
                  <View>
                    <Text style={styles.totalLabel}>TOTAL SEWA</Text>
                    <Text style={styles.totalPriceVal}>{formatCurrency(booking.total_price)}</Text>
                  </View>

                  <View style={styles.actionBtnRow}>
                    <TouchableOpacity
                      style={styles.waBtn}
                      onPress={() => handleWA(booking.customer_phone, booking.customer_name, booking.booking_code)}
                    >
                      <Text style={styles.waBtnText}>💬 WA</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.editBtn}
                      onPress={() => setSelectedBooking(booking)}
                    >
                      <Text style={styles.editBtnText}>✏️ Status</Text>
                    </TouchableOpacity>
                  </View>
                </View>

              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Change Status / Manage Modal */}
      {selectedBooking && (
        <Modal transparent animationType="fade" visible={true} onRequestClose={() => setSelectedBooking(null)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Kelola Status Booking</Text>
                <TouchableOpacity onPress={() => setSelectedBooking(null)}>
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                <Text style={styles.modalCodeText}>{selectedBooking.booking_code}</Text>
                <Text style={styles.modalSub}>{selectedBooking.customer_name} • {selectedBooking.court_name}</Text>

                {/* Show Proof Image if available */}
                {selectedBooking.payment_proof ? (
                  <View style={styles.modalProofCard}>
                    <Text style={styles.modalProofTitle}>📸 Struk Bukti Transfer Pelanggan:</Text>
                    <TouchableOpacity
                      onPress={() => setPreviewProofUrl(getFullProofUrl(selectedBooking.payment_proof))}
                      activeOpacity={0.9}
                    >
                      <Image
                        source={{ uri: getFullProofUrl(selectedBooking.payment_proof) }}
                        style={styles.modalProofImg}
                        resizeMode="contain"
                      />
                      <Text style={styles.zoomTipText}>🔍 Ketuk foto untuk memperbesar</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.noProofModalCard}>
                    <Text style={styles.noProofModalText}>⚠️ Pelanggan belum mengunggah bukti transfer.</Text>
                  </View>
                )}

                <Text style={styles.statusLabel}>UBAH STATUS PEMBAYARAN & REAKSI:</Text>
                <View style={styles.statusGrid}>
                  <TouchableOpacity
                    style={[styles.statusChoiceBtn, { backgroundColor: COLORS.sportGreenBg }]}
                    onPress={() => handleUpdateStatus(selectedBooking.id, 'paid')}
                  >
                    <Text style={{ color: COLORS.sportGreen, fontWeight: '900', fontSize: 11 }}>🟢 Set Lunas (Paid)</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.statusChoiceBtn, { backgroundColor: COLORS.orangeBg }]}
                    onPress={() => handleUpdateStatus(selectedBooking.id, 'unpaid')}
                  >
                    <Text style={{ color: COLORS.orange, fontWeight: '900', fontSize: 11 }}>🟠 Set Unpaid</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.statusChoiceBtn, { backgroundColor: COLORS.dangerBg }]}
                    onPress={() => handleUpdateStatus(selectedBooking.id, 'cancelled')}
                  >
                    <Text style={{ color: COLORS.danger, fontWeight: '900', fontSize: 11 }}>🔴 Set Cancelled</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.deleteBookingBtn}
                  onPress={() => handleDelete(selectedBooking.id)}
                >
                  <Text style={styles.deleteBookingText}>🗑️ Hapus Permanen Booking Ini</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* Full-size Proof Preview Modal */}
      {previewProofUrl && (
        <Modal transparent animationType="fade" visible={true} onRequestClose={() => setPreviewProofUrl(null)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCardBig}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Struk Bukti Transfer Pelanggan</Text>
                <TouchableOpacity onPress={() => setPreviewProofUrl(null)}>
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.fullProofBox}>
                <Image
                  source={{ uri: previewProofUrl }}
                  style={styles.fullProofImg}
                  resizeMode="contain"
                />
              </View>
            </View>
          </View>
        </Modal>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.navy,
    marginBottom: 10,
  },
  searchRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
    color: COLORS.navy,
    fontWeight: '600',
    marginRight: 6,
  },
  searchBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    justifyContent: 'center',
  },
  searchBtnText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '800',
  },
  chipScroll: {
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 6,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.navy,
  },
  textWhite: {
    color: COLORS.white,
  },
  loadingBox: {
    padding: 30,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 11,
    color: COLORS.textSlate,
  },
  emptyCard: {
    backgroundColor: COLORS.cardBg,
    padding: 30,
    borderRadius: 14,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 6,
  },
  emptyTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.navy,
  },
  bookingCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  codeBadge: {
    backgroundColor: COLORS.primaryBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  codeText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '900',
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '900',
  },
  courtName: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.navy,
  },
  outletName: {
    fontSize: 11,
    color: COLORS.textSlate,
    fontWeight: '600',
    marginBottom: 6,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  detailLabel: {
    fontSize: 11,
    color: COLORS.textSlate,
    fontWeight: '600',
  },
  detailVal: {
    fontSize: 11,
    color: COLORS.navy,
    fontWeight: '800',
  },
  proofBadgeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryBg,
    borderColor: '#BFDBFE',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  proofMiniThumb: {
    width: 24,
    height: 24,
    borderRadius: 4,
    marginRight: 6,
    backgroundColor: COLORS.white,
  },
  proofBadgeText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '800',
  },
  noProofBadge: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  noProofText: {
    color: COLORS.textSlate,
    fontSize: 10,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 10,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.textSlate,
  },
  totalPriceVal: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.primary,
  },
  actionBtnRow: {
    flexDirection: 'row',
  },
  waBtn: {
    backgroundColor: COLORS.sportGreenBg,
    borderColor: COLORS.sportGreen,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 6,
  },
  waBtnText: {
    color: COLORS.sportGreen,
    fontSize: 11,
    fontWeight: '800',
  },
  editBtn: {
    backgroundColor: COLORS.primaryBg,
    borderColor: COLORS.primary,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  editBtnText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    maxHeight: '85%',
    overflow: 'hidden',
  },
  modalCardBig: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    width: '100%',
    maxHeight: '90%',
    overflow: 'hidden',
  },
  modalHeader: {
    backgroundColor: COLORS.navy,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '900',
  },
  modalCloseText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '900',
  },
  modalBody: {
    padding: 16,
  },
  modalCodeText: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.primary,
    textAlign: 'center',
  },
  modalSub: {
    fontSize: 11,
    color: COLORS.textSlate,
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 12,
  },
  modalProofCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    alignItems: 'center',
  },
  modalProofTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.navy,
    marginBottom: 8,
  },
  modalProofImg: {
    width: 220,
    height: 200,
    borderRadius: 8,
    backgroundColor: COLORS.white,
  },
  zoomTipText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 6,
    textAlign: 'center',
  },
  noProofModalCard: {
    backgroundColor: COLORS.surface,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
    alignItems: 'center',
  },
  noProofModalText: {
    fontSize: 10,
    color: COLORS.textSlate,
    fontWeight: '700',
  },
  statusLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.navy,
    marginBottom: 8,
  },
  statusGrid: {
    marginBottom: 14,
  },
  statusChoiceBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 6,
  },
  deleteBookingBtn: {
    backgroundColor: COLORS.dangerBg,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  deleteBookingText: {
    color: COLORS.danger,
    fontSize: 11,
    fontWeight: '800',
  },
  fullProofBox: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullProofImg: {
    width: '100%',
    height: 380,
  }
});
