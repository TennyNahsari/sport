import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Image,
  Linking
} from 'react-native';
import { COLORS, SHADOWS } from '../../constants/theme';
import { api, getApiUrl } from '../../services/api';

export default function PaymentsTab({ currentUser }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [previewProof, setPreviewProof] = useState(null);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const baseUrl = getApiUrl();
      let url = `${baseUrl}/bookings`;
      if (statusFilter) url += `?payment_status=${statusFilter}`;
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
        { id: 1, booking_code: 'SB-892401', customer_name: 'Budi Santoso', customer_phone: '081234567890', court_name: 'Badminton Court 01', total_price: 160000, payment_status: 'paid', booking_date: '2026-09-22', payment_proof: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80' },
        { id: 2, booking_code: 'SB-109283', customer_name: 'Andi Wijaya', customer_phone: '081399887766', court_name: 'Futsal Arena 01', total_price: 180000, payment_status: 'unpaid', booking_date: '2026-09-22' }
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
        body: JSON.stringify({ booking_status: newStatus, payment_status: newStatus })
      });
      loadPayments();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleWA = (phone, name, code) => {
    if (!phone) return;
    const text = `Halo Kak ${name}, konfirmasi mengenai bukti pembayaran booking Kode: *${code}*`;
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

  const totalPaid = payments.filter(p => (p.payment_status || '').toLowerCase() === 'paid').reduce((sum, p) => sum + (p.total_price || 0), 0);
  const totalUnpaid = payments.filter(p => (p.payment_status || '').toLowerCase() === 'unpaid').reduce((sum, p) => sum + (p.total_price || 0), 0);

  return (
    <View style={styles.container}>
      
      {/* Financial Summary Card */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>💳 RINGKASAN VERIFIKASI PEMBAYARAN</Text>
        
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

        {/* Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          {[
            { label: 'Semua', val: '' },
            { label: 'Lunas (Paid)', val: 'paid' },
            { label: 'Belum Bayar (Unpaid)', val: 'unpaid' }
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
          <Text style={styles.emptyTitle}>Tidak ada transaksi pembayaran.</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {payments.map((p) => {
            const isPaid = (p.payment_status || '').toLowerCase() === 'paid';
            const hasProof = Boolean(p.payment_proof);

            return (
              <View key={p.id} style={styles.paymentCard}>
                
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.codeText}>{p.booking_code}</Text>
                  <View style={[styles.statusBadge, isPaid ? styles.statusBadgePaid : styles.statusBadgeUnpaid]}>
                    <Text style={[styles.statusText, isPaid ? styles.statusTextPaid : styles.statusTextUnpaid]}>
                      {isPaid ? 'LUNAS' : 'MENUNGGU BAYAR'}
                    </Text>
                  </View>
                </View>

                <Text style={styles.customerText}>{p.customer_name} ({p.customer_phone})</Text>
                <Text style={styles.courtText}>{p.court_name} • {p.booking_date}</Text>

                {hasProof ? (
                  <TouchableOpacity
                    style={styles.proofBadgeBtn}
                    onPress={() => setPreviewProof(p.payment_proof)}
                  >
                    <Text style={styles.proofBadgeText}>🖼️ Lihat Bukti Transfer Pelanggan</Text>
                  </TouchableOpacity>
                ) : null}

                <View style={styles.divider} />

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

                    {isPaid ? (
                      <TouchableOpacity
                        style={styles.unpaidBtn}
                        onPress={() => handleUpdateStatus(p.id, 'unpaid')}
                      >
                        <Text style={styles.unpaidBtnText}>Set Unpaid</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={styles.verifyBtn}
                        onPress={() => handleUpdateStatus(p.id, 'paid')}
                      >
                        <Text style={styles.verifyBtnText}>✓ Verifikasi Lunas</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Payment Proof Preview Modal */}
      {previewProof && (
        <Modal transparent animationType="fade" visible={true} onRequestClose={() => setPreviewProof(null)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Bukti Transfer Pelanggan</Text>
                <TouchableOpacity onPress={() => setPreviewProof(null)}>
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.modalBody}>
                <Image source={{ uri: previewProof }} style={styles.proofImg} resizeMode="contain" />
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
  statusBadgePaid: {
    backgroundColor: COLORS.sportGreenBg,
  },
  statusBadgeUnpaid: {
    backgroundColor: COLORS.orangeBg,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '900',
  },
  statusTextPaid: {
    color: COLORS.sportGreen,
  },
  statusTextUnpaid: {
    color: COLORS.orange,
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
    backgroundColor: COLORS.primaryBg,
    borderColor: '#BFDBFE',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  proofBadgeText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 8,
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
  verifyBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  verifyBtnText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '900',
  },
  unpaidBtn: {
    backgroundColor: COLORS.orangeBg,
    borderColor: COLORS.orange,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  unpaidBtnText: {
    color: COLORS.orange,
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
    alignItems: 'center',
  },
  proofImg: {
    width: '100%',
    height: 300,
  }
});
