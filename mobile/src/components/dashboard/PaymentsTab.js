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
  Linking,
  Alert
} from 'react-native';
import { COLORS, SHADOWS } from '../../constants/theme';
import { api, getApiUrl } from '../../services/api';

export default function PaymentsTab({ currentUser }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals state
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [previewProofPayment, setPreviewProofPayment] = useState(null);
  const [deletingProof, setDeletingProof] = useState(false);

  const getFullProofUrl = (proofPath) => {
    if (!proofPath || typeof proofPath !== 'string' || !proofPath.trim()) return '';
    if (proofPath.startsWith('http://') || proofPath.startsWith('https://') || proofPath.startsWith('data:image')) {
      return proofPath;
    }
    const baseUrl = getApiUrl().replace(/\/api\/?$/, '');
    return `${baseUrl}${proofPath.startsWith('/') ? '' : '/'}${proofPath}`;
  };

  const loadPayments = async () => {
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
        setPayments(json.data);
      } else {
        setPayments([]);
      }
    } catch (err) {
      console.error('Failed to load payments:', err);
      setPayments([
        {
          id: 1,
          booking_code: 'SB-892401',
          customer_name: 'Budi Santoso',
          customer_phone: '081234567890',
          court_name: 'Badminton Court 01',
          total_price: 160000,
          payment_status: 'paid',
          booking_status: 'paid',
          booking_date: '2026-09-22',
          payment_proof: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80'
        },
        {
          id: 2,
          booking_code: 'SB-109283',
          customer_name: 'Andi Wijaya',
          customer_phone: '081399887766',
          court_name: 'Futsal Arena 01',
          total_price: 180000,
          payment_status: 'unpaid',
          booking_status: 'unpaid',
          booking_date: '2026-09-22'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [statusFilter]);

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      const baseUrl = getApiUrl();
      await fetch(`${baseUrl}/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_status: newStatus,
          payment_status: newStatus === 'paid' ? 'paid' : newStatus
        })
      });
      setSelectedPayment(null);
      setPreviewProofPayment(null);
      loadPayments();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleDeletePaymentProof = async (bookingId) => {
    setDeletingProof(true);
    try {
      const baseUrl = getApiUrl();
      const res = await fetch(`${baseUrl}/bookings/${bookingId}/payment-proof`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setPreviewProofPayment(null);
        if (selectedPayment) {
          setSelectedPayment(prev => prev ? { ...prev, payment_proof: null } : null);
        }
        loadPayments();
      } else {
        alert(data.message || 'Gagal menghapus bukti pembayaran.');
      }
    } catch (err) {
      console.error('Failed to delete payment proof:', err);
      alert('Gagal menghapus bukti pembayaran.');
    } finally {
      setDeletingProof(false);
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    try {
      const baseUrl = getApiUrl();
      await fetch(`${baseUrl}/bookings/${bookingId}?permanent=true`, { method: 'DELETE' });
      setSelectedPayment(null);
      loadPayments();
    } catch (err) {
      console.error('Failed to delete booking:', err);
    }
  };

  const handleWA = (phone, name, code) => {
    if (!phone) return;
    const text = `Halo Kak ${name}, konfirmasi mengenai pembayaran booking Kode: *${code}*`;
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

  const getStatusBadge = (statusStr) => {
    const s = (statusStr || '').toLowerCase();
    switch (s) {
      case 'paid':
      case 'lunas':
        return { label: 'LUNAS (PAID)', bg: COLORS.sportGreenBg, color: COLORS.sportGreen };
      case 'occupied':
        return { label: 'OCCUPIED', bg: COLORS.orangeBg, color: COLORS.orange };
      case 'finished':
        return { label: 'FINISHED', bg: COLORS.primaryBg, color: COLORS.primary };
      case 'cancelled':
      case 'batal':
        return { label: 'CANCELLED', bg: COLORS.dangerBg, color: COLORS.danger };
      default:
        return { label: 'MENUNGGU BAYAR (UNPAID)', bg: COLORS.orangeBg, color: COLORS.orange };
    }
  };

  const totalPaid = payments
    .filter(p => (p.payment_status || p.booking_status || '').toLowerCase() === 'paid')
    .reduce((sum, p) => sum + (p.total_price || 0), 0);

  const totalUnpaid = payments
    .filter(p => (p.payment_status || p.booking_status || '').toLowerCase() === 'unpaid')
    .reduce((sum, p) => sum + (p.total_price || 0), 0);

  return (
    <View style={styles.container}>
      
      {/* Financial Summary & Search Card */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>💳 VERIFIKASI & LOG PEMBAYARAN</Text>
        
        {/* Metric boxes */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryBoxGreen}>
            <Text style={styles.summaryBoxLabel}>TOTAL LUNAS (PAID)</Text>
            <Text style={styles.summaryBoxValGreen}>{formatCurrency(totalPaid)}</Text>
          </View>

          <View style={styles.summaryBoxOrange}>
            <Text style={styles.summaryBoxLabel}>PENDING (UNPAID)</Text>
            <Text style={styles.summaryBoxValOrange}>{formatCurrency(totalUnpaid)}</Text>
          </View>
        </View>

        {/* Search input */}
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="Cari nama, HP, atau Kode Booking..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={loadPayments}
          />
          <TouchableOpacity style={styles.searchBtn} onPress={loadPayments}>
            <Text style={styles.searchBtnText}>Cari</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          {[
            { label: 'Semua Status', val: '' },
            { label: 'Lunas (Paid)', val: 'paid' },
            { label: 'Belum Bayar (Unpaid)', val: 'unpaid' },
            { label: 'Occupied', val: 'occupied' },
            { label: 'Finished', val: 'finished' },
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

      {/* Payments List */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Memuat log pembayaran...</Text>
        </View>
      ) : payments.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>💳</Text>
          <Text style={styles.emptyTitle}>Tidak ada data pembayaran ditemukan.</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {payments.map((p) => {
            const badge = getStatusBadge(p.payment_status || p.booking_status);
            const proofUrl = getFullProofUrl(p.payment_proof);
            const hasProof = Boolean(proofUrl);

            return (
              <View key={p.id} style={styles.paymentCard}>
                
                {/* Header Row */}
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.codeText}>{p.booking_code}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                    <Text style={[styles.statusText, { color: badge.color }]}>{badge.label}</Text>
                  </View>
                </View>

                {/* Info */}
                <Text style={styles.customerText}>{p.customer_name} ({p.customer_phone})</Text>
                <Text style={styles.courtText}>{p.court_name} • {p.booking_date}</Text>

                {/* Proof Thumbnail Badge Button */}
                {hasProof ? (
                  <TouchableOpacity
                    style={styles.proofBadgeBtn}
                    onPress={() => setPreviewProofPayment(p)}
                    activeOpacity={0.8}
                  >
                    <Image source={{ uri: proofUrl }} style={styles.proofMiniThumb} resizeMode="cover" />
                    <Text style={styles.proofBadgeText}>🖼️ Lihat Bukti Transfer Pelanggan</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.noProofBadge}>
                    <Text style={styles.noProofText}>⚠️ Bukti Transfer Belum Diunggah</Text>
                  </View>
                )}

                <View style={styles.divider} />

                {/* Footer Row */}
                <View style={styles.cardFooterRow}>
                  <View>
                    <Text style={styles.amountLabel}>JUMLAH TRANSFER</Text>
                    <Text style={styles.amountValue}>{formatCurrency(p.total_price)}</Text>
                  </View>

                  <View style={styles.actionBtnRow}>
                    <TouchableOpacity
                      style={styles.waBtn}
                      onPress={() => handleWA(p.customer_phone, p.customer_name, p.booking_code)}
                    >
                      <Text style={styles.waBtnText}>💬 WA</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.manageBtn}
                      onPress={() => setSelectedPayment(p)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.manageBtnText}>✏️ Kelola Status</Text>
                    </TouchableOpacity>
                  </View>
                </View>

              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Full Manage Payment Status Modal */}
      {selectedPayment && (
        <Modal transparent animationType="slide" visible={true} onRequestClose={() => setSelectedPayment(null)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Kelola Status Pembayaran</Text>
                <TouchableOpacity onPress={() => setSelectedPayment(null)}>
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                <Text style={styles.modalCodeText}>{selectedPayment.booking_code}</Text>
                <Text style={styles.modalSub}>{selectedPayment.customer_name} • {selectedPayment.court_name}</Text>
                <Text style={styles.modalPriceText}>{formatCurrency(selectedPayment.total_price)}</Text>

                {/* Struk Proof View inside Modal if available */}
                {selectedPayment.payment_proof ? (
                  <View style={styles.proofContainerInModal}>
                    <Text style={styles.proofModalTitle}>📸 Foto Struk Bukti Transfer Pelanggan:</Text>
                    <Image
                      source={{ uri: getFullProofUrl(selectedPayment.payment_proof) }}
                      style={styles.proofImgInModal}
                      resizeMode="contain"
                    />

                    <TouchableOpacity
                      style={styles.deleteProofBtn}
                      onPress={() => handleDeletePaymentProof(selectedPayment.id)}
                      disabled={deletingProof}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.deleteProofBtnText}>
                        {deletingProof ? 'Menghapus...' : '🗑️ Hapus Foto Bukti Pembayaran Ini'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.noProofInModal}>
                    <Text style={styles.noProofModalText}>⚠️ Pelanggan belum mengunggah foto bukti transfer.</Text>
                  </View>
                )}

                <Text style={styles.statusLabel}>PILIH STATUS PEMBAYARAN BARU:</Text>
                <View style={styles.statusGrid}>
                  <TouchableOpacity
                    style={[styles.statusChoiceBtn, { backgroundColor: COLORS.sportGreenBg }]}
                    onPress={() => handleUpdateStatus(selectedPayment.id, 'paid')}
                  >
                    <Text style={{ color: COLORS.sportGreen, fontWeight: '900', fontSize: 12 }}>🟢 Set Lunas (Paid)</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.statusChoiceBtn, { backgroundColor: COLORS.orangeBg }]}
                    onPress={() => handleUpdateStatus(selectedPayment.id, 'unpaid')}
                  >
                    <Text style={{ color: COLORS.orange, fontWeight: '900', fontSize: 12 }}>🟠 Set Unpaid (Menunggu Bayar)</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.statusChoiceBtn, { backgroundColor: COLORS.primaryBg }]}
                    onPress={() => handleUpdateStatus(selectedPayment.id, 'occupied')}
                  >
                    <Text style={{ color: COLORS.primary, fontWeight: '900', fontSize: 12 }}>🟡 Set Occupied (Sedang Bermain)</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.statusChoiceBtn, { backgroundColor: '#F3E8FF' }]}
                    onPress={() => handleUpdateStatus(selectedPayment.id, 'finished')}
                  >
                    <Text style={{ color: '#9333EA', fontWeight: '900', fontSize: 12 }}>🔵 Set Finished (Selesai)</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.statusChoiceBtn, { backgroundColor: COLORS.dangerBg }]}
                    onPress={() => handleUpdateStatus(selectedPayment.id, 'cancelled')}
                  >
                    <Text style={{ color: COLORS.danger, fontWeight: '900', fontSize: 12 }}>🔴 Set Cancelled (Dibatalkan)</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.deleteBookingBtn}
                  onPress={() => handleDeleteBooking(selectedPayment.id)}
                >
                  <Text style={styles.deleteBookingText}>🗑️ Hapus Permanen Transaksi Ini</Text>
                </TouchableOpacity>

              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* Payment Proof Preview Modal */}
      {previewProofPayment && (
        <Modal transparent animationType="fade" visible={true} onRequestClose={() => setPreviewProofPayment(null)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCardBig}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Bukti Transfer ({previewProofPayment.booking_code})</Text>
                <TouchableOpacity onPress={() => setPreviewProofPayment(null)}>
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                <Image
                  source={{ uri: getFullProofUrl(previewProofPayment.payment_proof) }}
                  style={styles.fullProofImg}
                  resizeMode="contain"
                />

                <View style={styles.proofModalActions}>
                  {(previewProofPayment.payment_status || '').toLowerCase() !== 'paid' ? (
                    <TouchableOpacity
                      style={styles.verifyPaidBtn}
                      onPress={() => handleUpdateStatus(previewProofPayment.id, 'paid')}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.verifyPaidBtnText}>✓ Verifikasi Set Lunas (Paid)</Text>
                    </TouchableOpacity>
                  ) : null}

                  <TouchableOpacity
                    style={styles.deleteProofBtn}
                    onPress={() => handleDeletePaymentProof(previewProofPayment.id)}
                    disabled={deletingProof}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.deleteProofBtnText}>
                      {deletingProof ? 'Menghapus...' : '🗑️ Hapus Foto Bukti Pembayaran'}
                    </Text>
                  </TouchableOpacity>
                </View>

              </ScrollView>
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
  summaryCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.navy,
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryBoxGreen: {
    flex: 1,
    backgroundColor: COLORS.sportGreenBg,
    borderColor: COLORS.sportGreen,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginRight: 4,
  },
  summaryBoxOrange: {
    flex: 1,
    backgroundColor: COLORS.orangeBg,
    borderColor: COLORS.orange,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginLeft: 4,
  },
  summaryBoxLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: COLORS.textSlate,
  },
  summaryBoxValGreen: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.sportGreen,
    marginTop: 2,
  },
  summaryBoxValOrange: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.orange,
    marginTop: 2,
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
  paymentCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  codeText: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.primary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '900',
  },
  customerText: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.navy,
  },
  courtText: {
    fontSize: 11,
    color: COLORS.textSlate,
    fontWeight: '600',
    marginTop: 2,
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
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: COLORS.textSlate,
  },
  amountValue: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.sportGreen,
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
  manageBtn: {
    backgroundColor: COLORS.primaryBg,
    borderColor: COLORS.primary,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  manageBtnText: {
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
  },
  modalPriceText: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.sportGreen,
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 12,
  },
  proofContainerInModal: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    alignItems: 'center',
  },
  proofModalTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.navy,
    marginBottom: 8,
  },
  proofImgInModal: {
    width: 220,
    height: 180,
    borderRadius: 8,
    backgroundColor: COLORS.white,
  },
  noProofInModal: {
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
  deleteProofBtn: {
    backgroundColor: COLORS.dangerBg,
    borderColor: COLORS.danger,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
    width: '100%',
  },
  deleteProofBtnText: {
    color: COLORS.danger,
    fontSize: 11,
    fontWeight: '800',
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
  fullProofImg: {
    width: '100%',
    height: 320,
    borderRadius: 8,
    marginBottom: 14,
  },
  proofModalActions: {
    width: '100%',
  },
  verifyPaidBtn: {
    backgroundColor: COLORS.sportGreen,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 8,
  },
  verifyPaidBtnText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '900',
  }
});
