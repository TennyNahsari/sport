import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Linking
} from 'react-native';
import { COLORS, SHADOWS } from '../constants/theme';
import { api } from '../services/api';

export default function BookingModal({ court, initialSlot, initialDate, onClose, onSuccess }) {
  const todayStr = new Date().toISOString().split('T')[0];

  const [bookingDate, setBookingDate] = useState(initialDate || todayStr);
  const [startTime, setStartTime] = useState(initialSlot ? initialSlot.time : '19:00');
  const [durationHours, setDurationHours] = useState('1');

  // Customer Details
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const [step, setStep] = useState(1); // 1 = Form, 2 = Confirmation
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  // Copy status indicators
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedBank, setCopiedBank] = useState(false);

  const pricePerHour = court ? (court.price_per_hour || 80000) : 80000;
  const totalPrice = pricePerHour * parseInt(durationHours || 1);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const handleCopyText = (text, type = 'code') => {
    if (!text) return;
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
    }
    if (type === 'code') {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    } else if (type === 'bank') {
      setCopiedBank(true);
      setTimeout(() => setCopiedBank(false), 2500);
    }
  };

  const handleCreateOrder = async () => {
    if (!name.trim()) {
      setErrorMsg('Nama pemesan wajib diisi.');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('Nomor WhatsApp / HP wajib diisi.');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    const payload = {
      court_id: court.id,
      booking_date: bookingDate,
      start_time: startTime,
      duration_hours: parseInt(durationHours || 1),
      customer_name: name,
      customer_phone: phone,
      customer_email: email,
      payment_status: 'unpaid'
    };

    const res = await api.createBooking(payload);

    setLoading(false);
    if (res.success) {
      setConfirmedOrder(res.data);
      setStep(2);
      if (onSuccess) onSuccess(res.data);
    } else {
      setErrorMsg(res.message || 'Gagal memproses booking. Coba lagi.');
    }
  };

  const handleSendWAConfirmation = () => {
    if (!confirmedOrder) return;
    const text = `Halo Admin SportBook, saya mau konfirmasi pembayaran booking:\n` +
      `Kode Booking: *${confirmedOrder.booking_code}*\n` +
      `Nama: ${confirmedOrder.customer_name}\n` +
      `Lapangan: ${court.name}\n` +
      `Tanggal: ${confirmedOrder.booking_date} (${confirmedOrder.start_time} - ${confirmedOrder.end_time})\n` +
      `Total: ${formatCurrency(confirmedOrder.total_price)}`;
    const url = `https://wa.me/6281234567890?text=${encodeURIComponent(text)}`;
    Linking.openURL(url).catch(err => console.error('Failed to open WA:', err));
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderTitleRow}>
              <Text style={styles.modalHeaderIcon}>📝</Text>
              <Text style={styles.modalHeaderTitle}>
                {step === 1 ? 'Form Sewa Lapangan' : 'Konfirmasi & Pembayaran'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {step === 1 ? (
              /* STEP 1: FORM PEMESANAN */
              <View style={styles.formContainer}>
                
                {/* Court Info Summary */}
                <View style={styles.courtSummaryBox}>
                  <Text style={styles.summaryCourtName}>{court ? court.name : 'Lapangan Selected'}</Text>
                  <Text style={styles.summaryCourtMeta}>
                    📍 {court ? (court.outlet_name || 'Venue Outlet') : 'Venue'} • {court ? (court.sport_name || 'Sport') : ''}
                  </Text>
                  <View style={styles.summaryPriceTag}>
                    <Text style={styles.summaryPriceText}>{formatCurrency(pricePerHour)} / jam</Text>
                  </View>
                </View>

                {errorMsg ? (
                  <View style={styles.errorBanner}>
                    <Text style={styles.errorText}>⚠️ {errorMsg}</Text>
                  </View>
                ) : null}

                {/* Form Fields */}
                <Text style={styles.fieldLabel}>Nama Lengkap Pemesan *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Contoh: Budi Santoso"
                  placeholderTextColor="#94A3B8"
                  value={name}
                  onChangeText={setName}
                />

                <Text style={styles.fieldLabel}>Nomor WhatsApp / Telp *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Contoh: 081234567890"
                  placeholderTextColor="#94A3B8"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />

                <Text style={styles.fieldLabel}>Email (Opsional)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Contoh: budi@gmail.com"
                  placeholderTextColor="#94A3B8"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                />

                {/* Date & Time selection */}
                <View style={styles.rowTwo}>
                  <View style={styles.flexHalf}>
                    <Text style={styles.fieldLabel}>Tanggal Main</Text>
                    <TextInput
                      style={styles.textInputDisabled}
                      value={bookingDate}
                      editable={false}
                    />
                  </View>
                  <View style={styles.flexHalf}>
                    <Text style={styles.fieldLabel}>Jam Mulai</Text>
                    <TextInput
                      style={styles.textInputDisabled}
                      value={startTime}
                      editable={false}
                    />
                  </View>
                </View>

                <Text style={styles.fieldLabel}>Durasi Sewa (Jam)</Text>
                <View style={styles.durationSelectorRow}>
                  {['1', '2', '3'].map((d) => (
                    <TouchableOpacity
                      key={d}
                      style={[
                        styles.durationBtn,
                        durationHours === d && styles.durationBtnSelected
                      ]}
                      onPress={() => setDurationHours(d)}
                    >
                      <Text style={[
                        styles.durationBtnText,
                        durationHours === d && styles.textWhite
                      ]}>
                        {d} Jam
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Total Price Card */}
                <View style={styles.totalPriceCard}>
                  <View>
                    <Text style={styles.totalPriceLabel}>TOTAL PEMBAYARAN</Text>
                    <Text style={styles.totalPriceVal}>{formatCurrency(totalPrice)}</Text>
                  </View>
                  <Text style={styles.dpNotice}>Bayar saat instruksi tampil</Text>
                </View>

                <TouchableOpacity
                  style={styles.submitBtn}
                  onPress={handleCreateOrder}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color={COLORS.white} />
                  ) : (
                    <Text style={styles.submitBtnText}>Proses & Buat Booking →</Text>
                  )}
                </TouchableOpacity>

              </View>
            ) : (
              /* STEP 2: KONFIRMASI PEMBAYARAN */
              <View style={styles.confirmationContainer}>
                
                <View style={styles.successIconBox}>
                  <Text style={styles.successIcon}>🎉</Text>
                  <Text style={styles.successTitle}>Pemesanan Berhasil!</Text>
                  <Text style={styles.successSubtitle}>
                    Silakan selesaikan pembayaran untuk mengamankan slot Anda.
                  </Text>
                </View>

                {/* Booking Code Card with Copy Feature */}
                <View style={styles.codeCard}>
                  <Text style={styles.codeLabel}>KODE BOOKING ANDA</Text>
                  <Text style={styles.codeValue}>{confirmedOrder?.booking_code || 'SB-XXXXXX'}</Text>
                  
                  {/* Copy Booking Code Button */}
                  <TouchableOpacity
                    style={[
                      styles.copyCodeBtn,
                      copiedCode && styles.copyCodeBtnSuccess
                    ]}
                    onPress={() => handleCopyText(confirmedOrder?.booking_code || 'SB-XXXXXX', 'code')}
                    activeOpacity={0.8}
                  >
                    <Text style={[
                      styles.copyCodeBtnText,
                      copiedCode && styles.copyCodeBtnTextSuccess
                    ]}>
                      {copiedCode ? '✓ Kode Berhasil Disalin!' : '📋 Salin Kode Booking'}
                    </Text>
                  </TouchableOpacity>

                  <Text style={styles.codeTip}>Simpan kode ini untuk cek status booking</Text>
                </View>

                {/* Bank Account Info with Copy Feature */}
                <View style={styles.bankBox}>
                  <Text style={styles.bankTitle}>💳 PETUNJUK TRANSFER BANK</Text>
                  <View style={styles.bankRow}>
                    <Text style={styles.bankLabel}>Bank:</Text>
                    <Text style={styles.bankVal}>BCA</Text>
                  </View>
                  
                  <View style={styles.bankRow}>
                    <Text style={styles.bankLabel}>No. Rekening:</Text>
                    <View style={styles.bankAccountCopyRow}>
                      <Text style={styles.bankValHighlight}>8830-1920-3341</Text>
                      <TouchableOpacity
                        style={copiedBank ? styles.miniCopyBtnSuccess : styles.miniCopyBtn}
                        onPress={() => handleCopyText('8830-1920-3341', 'bank')}
                        activeOpacity={0.7}
                      >
                        <Text style={copiedBank ? styles.miniCopyTextSuccess : styles.miniCopyText}>
                          {copiedBank ? '✓ Tersalin' : '📋 Salin'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.bankRow}>
                    <Text style={styles.bankLabel}>Atas Nama:</Text>
                    <Text style={styles.bankVal}>SportBook Management</Text>
                  </View>
                  <View style={styles.bankRow}>
                    <Text style={styles.bankLabel}>Total Transfer:</Text>
                    <Text style={styles.bankValAmount}>{formatCurrency(confirmedOrder?.total_price || totalPrice)}</Text>
                  </View>
                </View>

                {/* Action Buttons */}
                <TouchableOpacity
                  style={styles.waBtn}
                  onPress={handleSendWAConfirmation}
                >
                  <Text style={styles.waBtnText}>💬 Konfirmasi Bayar via WhatsApp</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.doneBtn}
                  onPress={onClose}
                >
                  <Text style={styles.doneBtnText}>Selesai & Kembali</Text>
                </TouchableOpacity>

              </View>
            )}
          </ScrollView>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  modalHeader: {
    backgroundColor: COLORS.navy,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalHeaderIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  modalHeaderTitle: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '800',
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.navyLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '800',
  },
  modalBody: {
    padding: 20,
  },
  formContainer: {
    paddingBottom: 20,
  },
  courtSummaryBox: {
    backgroundColor: COLORS.primaryBg,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  summaryCourtName: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.navy,
  },
  summaryCourtMeta: {
    fontSize: 11,
    color: COLORS.textSlate,
    fontWeight: '600',
    marginTop: 2,
  },
  summaryPriceTag: {
    backgroundColor: COLORS.primary,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 8,
  },
  summaryPriceText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '800',
  },
  errorBanner: {
    backgroundColor: COLORS.dangerBg,
    borderColor: COLORS.danger,
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 11,
    fontWeight: '700',
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.navy,
    marginBottom: 6,
    marginTop: 8,
  },
  textInput: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: COLORS.navy,
    fontWeight: '600',
  },
  textInputDisabled: {
    backgroundColor: '#E2E8F0',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 12,
    color: COLORS.textSlate,
    fontWeight: '700',
  },
  rowTwo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: -4,
  },
  flexHalf: {
    flex: 1,
    marginHorizontal: 4,
  },
  durationSelectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  durationBtn: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  durationBtnSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  durationBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.navy,
  },
  textWhite: {
    color: COLORS.white,
  },
  totalPriceCard: {
    backgroundColor: COLORS.navy,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 14,
  },
  totalPriceLabel: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  totalPriceVal: {
    color: COLORS.sportGreen,
    fontSize: 20,
    fontWeight: '900',
  },
  dpNotice: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '700',
    backgroundColor: COLORS.navyLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  submitBtnText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '900',
  },

  /* Confirmation Step Styles */
  confirmationContainer: {
    alignItems: 'center',
    paddingBottom: 30,
  },
  successIconBox: {
    alignItems: 'center',
    marginBottom: 16,
  },
  successIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.navy,
  },
  successSubtitle: {
    fontSize: 12,
    color: COLORS.textSlate,
    textAlign: 'center',
    marginTop: 4,
  },
  codeCard: {
    backgroundColor: COLORS.navy,
    borderRadius: 16,
    padding: 18,
    width: '100%',
    alignItems: 'center',
    marginVertical: 14,
  },
  codeLabel: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  codeValue: {
    color: COLORS.sportGreen,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 2,
    marginVertical: 4,
  },
  copyCodeBtn: {
    backgroundColor: COLORS.navyLight,
    borderColor: COLORS.primary,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 6,
    marginBottom: 8,
  },
  copyCodeBtnSuccess: {
    backgroundColor: COLORS.sportGreen,
    borderColor: COLORS.sportGreen,
  },
  copyCodeBtnText: {
    color: COLORS.primaryLight,
    fontSize: 12,
    fontWeight: '800',
  },
  copyCodeBtnTextSuccess: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '900',
  },
  codeTip: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '600',
  },
  bankBox: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 16,
    width: '100%',
    marginBottom: 16,
  },
  bankTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.navy,
    marginBottom: 10,
  },
  bankRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  bankLabel: {
    fontSize: 12,
    color: COLORS.textSlate,
    fontWeight: '600',
  },
  bankVal: {
    fontSize: 12,
    color: COLORS.navy,
    fontWeight: '700',
  },
  bankAccountCopyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bankValHighlight: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '900',
    marginRight: 8,
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
    backgroundColor: COLORS.sportGreenBg,
    borderColor: COLORS.sportGreen,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  miniCopyText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '800',
  },
  miniCopyTextSuccess: {
    color: COLORS.sportGreen,
    fontSize: 10,
    fontWeight: '900',
  },
  bankValAmount: {
    fontSize: 14,
    color: COLORS.sportGreen,
    fontWeight: '900',
  },
  waBtn: {
    backgroundColor: COLORS.sportGreen,
    paddingVertical: 14,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
    ...SHADOWS.small,
  },
  waBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '900',
  },
  doneBtn: {
    backgroundColor: COLORS.navy,
    paddingVertical: 12,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  doneBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '800',
  }
});
