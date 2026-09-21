import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  Modal,
  Linking
} from 'react-native';
import { COLORS, SHADOWS } from '../constants/theme';
import { api } from '../services/api';

export default function CheckOrderScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [searched, setSearched] = useState(false);

  // Settings for dynamic bank, QRIS & WA CS info
  const [settings, setSettings] = useState({
    bank_name: 'BCA',
    bank_account_number: '8830-1920-3341',
    bank_account_holder: 'SportBook Management',
    qris_merchant_name: 'SportBook Official QRIS',
    qris_image_url: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=00020101021226580014ID.LINKAJA.WWW011893600914000008888802150000000000000005204581253033605802ID5916SportBook%20Venue6007Jakarta63041A2B',
    wa_cs_number: '0812-9900-1122'
  });

  // Copy state trackers
  const [copiedCodeId, setCopiedCodeId] = useState(null);
  const [copiedBankId, setCopiedBankId] = useState(null);

  // Upload Payment Proof Modal state
  const [selectedBookingForUpload, setSelectedBookingForUpload] = useState(null);
  const [proofUrl, setProofUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadedSuccess, setUploadedSuccess] = useState(false);

  useEffect(() => {
    api.getSettings().then(res => {
      if (res.success && res.data) {
        setSettings(prev => ({ ...prev, ...res.data }));
      }
    }).catch(err => console.warn('Using default settings for payment info:', err));
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setSearched(true);
    const res = await api.searchBooking(searchQuery.trim());
    setLoading(false);
    if (res.success) {
      setResults(res.data);
    } else {
      setResults([]);
    }
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

  const handleCopyText = (text, type, id) => {
    if (!text) return;
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
    }
    if (type === 'code') {
      setCopiedCodeId(id);
      setTimeout(() => setCopiedCodeId(null), 2500);
    } else if (type === 'bank') {
      setCopiedBankId(id);
      setTimeout(() => setCopiedBankId(null), 2500);
    }
  };

  const handleSendWA = (booking) => {
    let cleanWa = (settings.wa_cs_number || '081299001122').replace(/\D/g, '');
    if (cleanWa.startsWith('0')) {
      cleanWa = '62' + cleanWa.slice(1);
    }

    const message = `Halo CS SportBook, saya mau konfirmasi pembayaran booking:\n` +
      `Kode Booking: *${booking.booking_code}*\n` +
      `Nama Pemesan: ${booking.customer_name}\n` +
      `Lapangan: ${booking.court_name || 'Lapangan Venue'}\n` +
      `Tanggal: ${booking.booking_date} (${booking.start_time} - ${booking.end_time})\n` +
      `Total Sewa: ${formatCurrency(booking.total_price)}\n` +
      `Mohon dibantu konfirmasi lunas. Terima kasih!`;

    const url = `https://wa.me/${cleanWa}?text=${encodeURIComponent(message)}`;
    Linking.openURL(url).catch(err => console.error('Failed to open WA link:', err));
  };

  const handleOpenUploadModal = (booking) => {
    setSelectedBookingForUpload(booking);
    setProofUrl('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop'); // default sample payment receipt photo
    setUploadedSuccess(false);
  };

  const handleSavePaymentProof = () => {
    if (!selectedBookingForUpload) return;
    setUploading(true);
    setTimeout(() => {
      // Update local booking status to reflect proof uploaded
      if (results) {
        setResults(prev => prev.map(b => {
          if (b.id === selectedBookingForUpload.id) {
            return {
              ...b,
              payment_proof: proofUrl,
              has_proof: true
            };
          }
          return b;
        }));
      }
      setUploading(false);
      setUploadedSuccess(true);
      setTimeout(() => {
        setSelectedBookingForUpload(null);
      }, 1500);
    }, 1000);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      
      {/* Search Header Banner */}
      <View style={styles.cardHeader}>
        <Text style={styles.headerIcon}>🔍</Text>
        <Text style={styles.headerTitle}>Cek Status & Pembayaran Booking</Text>
        <Text style={styles.headerSub}>
          Masukkan Nomor WhatsApp HP atau Kode Booking (Contoh: SB-892401)
        </Text>
      </View>

      {/* Search Bar Input */}
      <View style={styles.searchBox}>
        <TextInput
          style={styles.input}
          placeholder="No. HP / Kode Booking..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity
          style={styles.searchBtn}
          onPress={handleSearch}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} size="small" />
          ) : (
            <Text style={styles.searchBtnText}>Cari</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Results Container */}
      {searched && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>
            HASIL PENCARIAN ({results ? results.length : 0})
          </Text>

          {results && results.length > 0 ? (
            results.map((booking) => {
              const statusStr = (booking.payment_status || booking.booking_status || '').toLowerCase();
              const isPaid = statusStr === 'paid' || statusStr === 'lunas';
              const badge = getStatusBadge(statusStr);
              const isCodeCopied = copiedCodeId === booking.id;
              const isBankCopied = copiedBankId === booking.id;

              return (
                <View key={booking.id} style={styles.bookingCard}>
                  
                  {/* Card Header: Code Badge & Status */}
                  <View style={styles.bookingTopRow}>
                    <TouchableOpacity
                      style={[styles.codeBadge, isCodeCopied && styles.codeBadgeSuccess]}
                      onPress={() => handleCopyText(booking.booking_code, 'code', booking.id)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.codeText, isCodeCopied && styles.textWhite]}>
                        {booking.booking_code} {isCodeCopied ? '✓ Salin' : '📋'}
                      </Text>
                    </TouchableOpacity>

                    <View style={[styles.statusTag, { backgroundColor: badge.bg }]}>
                      <Text style={[styles.statusText, { color: badge.color }]}>{badge.label}</Text>
                    </View>
                  </View>

                  {/* Booking Core Info */}
                  <Text style={styles.courtName}>{booking.court_name || 'Lapangan Venue'}</Text>
                  <Text style={styles.outletName}>📍 {booking.outlet_name || 'SportBook Outlet'}</Text>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Tanggal Main:</Text>
                    <Text style={styles.detailVal}>{booking.booking_date}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Waktu Main:</Text>
                    <Text style={styles.detailVal}>{booking.start_time} - {booking.end_time}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Nama Pemesan:</Text>
                    <Text style={styles.detailVal}>{booking.customer_name} ({booking.customer_phone})</Text>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.priceRow}>
                    <Text style={styles.totalLabel}>Total Biaya Sewa:</Text>
                    <Text style={styles.totalVal}>{formatCurrency(booking.total_price)}</Text>
                  </View>

                  {/* UNPAID/PENDING BOOKING INSTRUCTIONS & PAYMENT INFO */}
                  {!isPaid && (
                    <View style={styles.unpaidSection}>
                      <Text style={styles.unpaidTitle}>💳 PETUNJUK PEMBAYARAN REKENING & QRIS</Text>
                      
                      {/* Bank Account Transfer Box */}
                      <View style={styles.bankCard}>
                        <View style={styles.bankRow}>
                          <Text style={styles.bankLabel}>Bank Transfer:</Text>
                          <Text style={styles.bankValBold}>{settings.bank_name}</Text>
                        </View>

                        <View style={styles.bankRow}>
                          <Text style={styles.bankLabel}>Nomor Rekening:</Text>
                          <View style={styles.copyRow}>
                            <Text style={styles.accountNumberHighlight}>{settings.bank_account_number}</Text>
                            <TouchableOpacity
                              style={[styles.miniCopyBtn, isBankCopied && styles.miniCopyBtnSuccess]}
                              onPress={() => handleCopyText(settings.bank_account_number, 'bank', booking.id)}
                              activeOpacity={0.8}
                            >
                              <Text style={[styles.miniCopyText, isBankCopied && styles.textWhite]}>
                                {isBankCopied ? '✓ Tersalin' : '📋 Salin'}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>

                        <View style={styles.bankRow}>
                          <Text style={styles.bankLabel}>Atas Nama:</Text>
                          <Text style={styles.bankVal}>{settings.bank_account_holder}</Text>
                        </View>
                      </View>

                      {/* QRIS Barcode Box */}
                      {settings.qris_image_url ? (
                        <View style={styles.qrisCard}>
                          <Text style={styles.qrisTitle}>📱 QRIS Pembayaran Instant</Text>
                          <Text style={styles.qrisMerchant}>{settings.qris_merchant_name}</Text>
                          <Image
                            source={{ uri: settings.qris_image_url }}
                            style={styles.qrisImage}
                            resizeMode="contain"
                          />
                          <Text style={styles.qrisNote}>Scan QRIS di atas melalui GoPay, OVO, Dana, ShopeePay, atau Mobile Banking.</Text>
                        </View>
                      ) : null}

                      {/* Proof Status Badge if uploaded */}
                      {booking.has_proof || booking.payment_proof ? (
                        <View style={styles.proofUploadedBanner}>
                          <Text style={styles.proofUploadedText}>
                            ✓ Bukti Transfer Telah Diunggah! Menunggu konfirmasi admin.
                          </Text>
                        </View>
                      ) : null}

                      {/* Customer Action Buttons: Upload Proof & WhatsApp CS */}
                      <View style={styles.actionButtonsRow}>
                        <TouchableOpacity
                          style={styles.uploadBtn}
                          onPress={() => handleOpenUploadModal(booking)}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.uploadBtnText}>📤 Upload Bukti Transfer</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.waBtn}
                          onPress={() => handleSendWA(booking)}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.waBtnText}>💬 Konfirmasi WA CS</Text>
                        </TouchableOpacity>
                      </View>

                    </View>
                  )}

                  {/* PAID BOOKING SUCCESS NOTICE */}
                  {isPaid && (
                    <View style={styles.paidSuccessCard}>
                      <Text style={styles.paidSuccessIcon}>✅</Text>
                      <View style={styles.paidSuccessTextFlex}>
                        <Text style={styles.paidSuccessTitle}>Pembayaran Telah Diverifikasi Lunas</Text>
                        <Text style={styles.paidSuccessSub}>Silakan tunjukkan kode booking ini saat tiba di lokasi venue.</Text>
                      </View>
                    </View>
                  )}

                </View>
              );
            })
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>📂</Text>
              <Text style={styles.emptyTitle}>Data Tidak Ditemukan</Text>
              <Text style={styles.emptySub}>
                Periksa kembali nomor WhatsApp atau kode booking yang Anda masukkan.
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Upload Payment Proof Modal */}
      {selectedBookingForUpload && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={true}
          onRequestClose={() => setSelectedBookingForUpload(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalHeaderTitle}>Upload Bukti Pembayaran</Text>
                <TouchableOpacity onPress={() => setSelectedBookingForUpload(null)}>
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                <View style={styles.bookingModalSummary}>
                  <Text style={styles.modalSummaryCode}>
                    Kode: {selectedBookingForUpload.booking_code}
                  </Text>
                  <Text style={styles.modalSummaryCourt}>
                    {selectedBookingForUpload.court_name || 'Lapangan Venue'}
                  </Text>
                  <Text style={styles.modalSummaryPrice}>
                    Total: {formatCurrency(selectedBookingForUpload.total_price)}
                  </Text>
                </View>

                {uploadedSuccess ? (
                  <View style={styles.uploadSuccessBox}>
                    <Text style={styles.uploadSuccessIcon}>🎉</Text>
                    <Text style={styles.uploadSuccessTitle}>Bukti Transfer Berhasil Diunggah!</Text>
                    <Text style={styles.uploadSuccessSub}>Status booking Anda sedang dalam tahap verifikasi admin.</Text>
                  </View>
                ) : (
                  <>
                    <Text style={styles.label}>URL / Foto Struk Pembayaran Transfer *</Text>
                    <TextInput
                      style={styles.inputModal}
                      placeholder="https://... (URL foto struk)"
                      placeholderTextColor="#94A3B8"
                      value={proofUrl}
                      onChangeText={setProofUrl}
                    />

                    {proofUrl ? (
                      <View style={styles.previewImageContainer}>
                        <Text style={styles.previewLabel}>Preview Struk Bukti Transfer:</Text>
                        <Image
                          source={{ uri: proofUrl }}
                          style={styles.previewImage}
                          resizeMode="cover"
                        />
                      </View>
                    ) : null}

                    <TouchableOpacity
                      style={styles.submitUploadBtn}
                      onPress={handleSavePaymentProof}
                      disabled={uploading}
                      activeOpacity={0.8}
                    >
                      {uploading ? (
                        <ActivityIndicator color={COLORS.white} />
                      ) : (
                        <Text style={styles.submitUploadBtnText}> Kirim Bukti Pembayaran →</Text>
                      )}
                    </TouchableOpacity>
                  </>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  content: {
    padding: 16,
  },
  cardHeader: {
    backgroundColor: COLORS.navy,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    ...SHADOWS.medium,
  },
  headerIcon: {
    fontSize: 32,
    marginBottom: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.white,
    textAlign: 'center',
  },
  headerSub: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
  searchBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    padding: 6,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    marginBottom: 16,
    ...SHADOWS.small,
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    fontSize: 13,
    color: COLORS.navy,
    fontWeight: '600',
  },
  searchBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBtnText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '800',
  },
  resultsContainer: {
    marginTop: 8,
  },
  resultsTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.navy,
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  bookingCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  bookingTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  codeBadge: {
    backgroundColor: COLORS.primaryBg,
    borderColor: '#BFDBFE',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  codeBadgeSuccess: {
    backgroundColor: COLORS.sportGreen,
    borderColor: COLORS.sportGreen,
  },
  codeText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  textWhite: {
    color: COLORS.white,
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '900',
  },
  courtName: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.navy,
  },
  outletName: {
    fontSize: 11,
    color: COLORS.textSlate,
    fontWeight: '600',
    marginBottom: 10,
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
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.navy,
  },
  totalVal: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.primary,
  },
  unpaidSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  unpaidTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.navy,
    marginBottom: 10,
  },
  bankCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  bankRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3,
  },
  bankLabel: {
    fontSize: 11,
    color: COLORS.textSlate,
    fontWeight: '600',
  },
  bankVal: {
    fontSize: 11,
    color: COLORS.navy,
    fontWeight: '700',
  },
  bankValBold: {
    fontSize: 12,
    color: COLORS.navy,
    fontWeight: '900',
  },
  copyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountNumberHighlight: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.primary,
    marginRight: 6,
  },
  miniCopyBtn: {
    backgroundColor: COLORS.primaryBg,
    borderColor: '#BFDBFE',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  miniCopyBtnSuccess: {
    backgroundColor: COLORS.sportGreen,
    borderColor: COLORS.sportGreen,
  },
  miniCopyText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '800',
  },
  qrisCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  qrisTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.navy,
  },
  qrisMerchant: {
    fontSize: 10,
    color: COLORS.textSlate,
    fontWeight: '700',
    marginBottom: 8,
  },
  qrisImage: {
    width: 150,
    height: 150,
    borderRadius: 8,
    marginBottom: 6,
  },
  qrisNote: {
    fontSize: 9,
    color: COLORS.textSlate,
    textAlign: 'center',
  },
  proofUploadedBanner: {
    backgroundColor: COLORS.sportGreenBg,
    borderColor: COLORS.sportGreen,
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
  },
  proofUploadedText: {
    color: COLORS.sportGreen,
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'center',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  uploadBtn: {
    flex: 1,
    marginRight: 4,
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  uploadBtnText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '800',
  },
  waBtn: {
    flex: 1,
    marginLeft: 4,
    backgroundColor: COLORS.sportGreen,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  waBtnText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '800',
  },
  paidSuccessCard: {
    marginTop: 10,
    padding: 12,
    backgroundColor: COLORS.sportGreenBg,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.sportGreen,
  },
  paidSuccessIcon: {
    fontSize: 22,
    marginRight: 10,
  },
  paidSuccessTextFlex: {
    flex: 1,
  },
  paidSuccessTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.sportGreen,
  },
  paidSuccessSub: {
    fontSize: 10,
    color: COLORS.navy,
    fontWeight: '600',
    marginTop: 2,
  },
  emptyCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.navy,
  },
  emptySub: {
    fontSize: 11,
    color: COLORS.textSlate,
    textAlign: 'center',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    maxHeight: '85%',
    overflow: 'hidden',
  },
  modalHeader: {
    backgroundColor: COLORS.navy,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalHeaderTitle: {
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
  bookingModalSummary: {
    backgroundColor: COLORS.primaryBg,
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  modalSummaryCode: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.primary,
  },
  modalSummaryCourt: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.navy,
    marginTop: 2,
  },
  modalSummaryPrice: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.sportGreen,
    marginTop: 2,
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.navy,
    marginBottom: 6,
  },
  inputModal: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: COLORS.navy,
    fontWeight: '600',
  },
  previewImageContainer: {
    marginTop: 12,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  previewLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textSlate,
    marginBottom: 6,
  },
  previewImage: {
    width: 180,
    height: 180,
    borderRadius: 8,
  },
  submitUploadBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 10,
  },
  submitUploadBtnText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '900',
  },
  uploadSuccessBox: {
    padding: 24,
    alignItems: 'center',
  },
  uploadSuccessIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  uploadSuccessTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.navy,
  },
  uploadSuccessSub: {
    fontSize: 11,
    color: COLORS.textSlate,
    textAlign: 'center',
    marginTop: 4,
  }
});
