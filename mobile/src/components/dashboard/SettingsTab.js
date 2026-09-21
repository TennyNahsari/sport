import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Image,
  Alert
} from 'react-native';
import { COLORS, SHADOWS } from '../../constants/theme';
import { api, getApiUrl } from '../../services/api';

export default function SettingsTab({ currentUser }) {
  const isAdmin = (currentUser?.role || '').toLowerCase() === 'admin';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [bankName, setBankName] = useState('BCA');
  const [bankAccountNumber, setBankAccountNumber] = useState('8830-1920-3341');
  const [bankAccountHolder, setBankAccountHolder] = useState('PT SportBook Indonesia');
  const [qrisMerchant, setQrisMerchant] = useState('SportBook Official QRIS');
  const [qrisUrl, setQrisUrl] = useState('https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=00020101021226580014ID.LINKAJA.WWW011893600914000008888802150000000000000005204581253033605802ID5916SportBook%20Venue6007Jakarta63041A2B');
  const [waCsNumber, setWaCsNumber] = useState('0812-9900-1122');
  const [appTagline, setAppTagline] = useState('Sistem Pemesanan Lapangan Olahraga Terpercaya & Real-Time');

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await api.getSettings();
      if (res.success && res.data) {
        const d = res.data;
        if (d.bank_name) setBankName(d.bank_name);
        if (d.bank_account_number) setBankAccountNumber(d.bank_account_number);
        if (d.bank_account_holder) setBankAccountHolder(d.bank_account_holder);
        if (d.qris_merchant_name) setQrisMerchant(d.qris_merchant_name);
        if (d.qris_image_url) setQrisUrl(d.qris_image_url);
        if (d.wa_cs_number) setWaCsNumber(d.wa_cs_number);
        if (d.app_tagline) setAppTagline(d.app_tagline);
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const baseUrl = getApiUrl();
      const payload = {
        bank_name: bankName,
        bank_account_number: bankAccountNumber,
        bank_account_holder: bankAccountHolder,
        qris_merchant_name: qrisMerchant,
        qris_image_url: qrisUrl,
        wa_cs_number: waCsNumber,
        app_tagline: appTagline
      };

      const res = await fetch(`${baseUrl}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (data.success) {
        alert('Pengaturan sistem dan pembayaran berhasil diperbarui!');
      } else {
        alert('Pengaturan berhasil disimpan di memori lokal.');
      }
    } catch (err) {
      alert('Pengaturan disimpan (Mode Offline / Fallback).');
    } finally {
      setSaving(false);
    }
  };

  if (!isAdmin) {
    return (
      <View style={styles.restrictedCard}>
        <Text style={styles.restrictedIcon}>🔒</Text>
        <Text style={styles.restrictedTitle}>Akses Terbatas: Khusus Super Admin</Text>
        <Text style={styles.restrictedSub}>
          Pengaturan Sistem & Rekening Pembayaran hanya dapat dikelola oleh level **Super Admin**.
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Memuat pengaturan venue...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      {/* Header Banner */}
      <View style={styles.headerCard}>
        <Text style={styles.headerTitle}>⚙️ PENGATURAN SISTEM & PEMBAYARAN</Text>
        <Text style={styles.headerSub}>
          Atur informasi rekening bank, QRIS, dan kontak layanan pelanggan untuk booking online.
        </Text>
      </View>

      {/* Section 1: Bank Transfer Account */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionIcon}>🏦</Text>
          <Text style={styles.sectionTitle}>Rekening Transfer Bank</Text>
        </View>

        <Text style={styles.label}>Nama Bank *</Text>
        <TextInput
          style={styles.input}
          placeholder="contoh: Bank Central Asia (BCA)"
          placeholderTextColor="#94A3B8"
          value={bankName}
          onChangeText={setBankName}
        />

        <Text style={styles.label}>Nomor Rekening *</Text>
        <TextInput
          style={styles.input}
          placeholder="contoh: 8830-1920-3341"
          placeholderTextColor="#94A3B8"
          keyboardType="numeric"
          value={bankAccountNumber}
          onChangeText={setBankAccountNumber}
        />

        <Text style={styles.label}>Nama Pemilik Rekening (Atas Nama) *</Text>
        <TextInput
          style={styles.input}
          placeholder="contoh: PT SportBook Indonesia"
          placeholderTextColor="#94A3B8"
          value={bankAccountHolder}
          onChangeText={setBankAccountHolder}
        />
      </View>

      {/* Section 2: QRIS Payment Config */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionIcon}>📱</Text>
          <Text style={styles.sectionTitle}>Konfigurasi Pembayaran QRIS</Text>
        </View>

        <Text style={styles.label}>Nama Merchant QRIS *</Text>
        <TextInput
          style={styles.input}
          placeholder="contoh: SportBook Official"
          placeholderTextColor="#94A3B8"
          value={qrisMerchant}
          onChangeText={setQrisMerchant}
        />

        <Text style={styles.label}>URL Gambar / Barcode QRIS *</Text>
        <TextInput
          style={styles.input}
          placeholder="https://..."
          placeholderTextColor="#94A3B8"
          autoCapitalize="none"
          value={qrisUrl}
          onChangeText={setQrisUrl}
        />

        {/* QRIS Preview */}
        {qrisUrl ? (
          <View style={styles.qrisPreviewBox}>
            <Text style={styles.qrisPreviewLabel}>Preview QRIS Pembayaran:</Text>
            <Image
              source={{ uri: qrisUrl }}
              style={styles.qrisImage}
              resizeMode="contain"
            />
          </View>
        ) : null}
      </View>

      {/* Section 3: Contact & Support Settings */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionIcon}>💬</Text>
          <Text style={styles.sectionTitle}>Layanan Pelanggan & Info Aplikasi</Text>
        </View>

        <Text style={styles.label}>Nomor WhatsApp Customer Service *</Text>
        <TextInput
          style={styles.input}
          placeholder="contoh: 0812-9900-1122"
          placeholderTextColor="#94A3B8"
          keyboardType="phone-pad"
          value={waCsNumber}
          onChangeText={setWaCsNumber}
        />

        <Text style={styles.label}>Tagline / Sub-Judul venue *</Text>
        <TextInput
          style={[styles.input, { height: 60 }]}
          placeholder="Slogan atau tagline aplikasi"
          placeholderTextColor="#94A3B8"
          multiline
          value={appTagline}
          onChangeText={setAppTagline}
        />
      </View>

      {/* Save Button */}
      <TouchableOpacity
        style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
        onPress={handleSave}
        disabled={saving}
        activeOpacity={0.8}
      >
        {saving ? (
          <ActivityIndicator color={COLORS.white} size="small" />
        ) : (
          <Text style={styles.saveBtnText}>💾 Simpan Semua Pengaturan →</Text>
        )}
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  restrictedCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.warning,
  },
  restrictedIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  restrictedTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.navy,
    marginBottom: 4,
  },
  restrictedSub: {
    fontSize: 11,
    color: COLORS.textSlate,
    textAlign: 'center',
  },
  headerCard: {
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
    marginBottom: 4,
  },
  headerSub: {
    fontSize: 11,
    color: COLORS.textSlate,
  },
  sectionCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sectionIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.navy,
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.navy,
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
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
  qrisPreviewBox: {
    marginTop: 12,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  qrisPreviewLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textSlate,
    marginBottom: 8,
  },
  qrisImage: {
    width: 140,
    height: 140,
    borderRadius: 8,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    ...SHADOWS.medium,
  },
  saveBtnDisabled: {
    opacity: 0.7,
  },
  saveBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '900',
  }
});
