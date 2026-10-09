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
  Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SHADOWS } from '../../constants/theme';
import { api, getApiUrl } from '../../services/api';

export default function OutletsTab({ currentUser }) {
  const isAdmin = (currentUser?.role || '').toLowerCase() === 'admin';

  const [outlets, setOutlets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal Form State
  const [showModal, setShowModal] = useState(false);
  const [editingOutlet, setEditingOutlet] = useState(null);

  // Form Fields
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageTab, setImageTab] = useState('upload'); // 'upload' | 'url'
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('active');

  const loadOutlets = async () => {
    setLoading(true);
    const res = await api.getOutlets();
    if (res.success) {
      setOutlets(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadOutlets();
  }, []);

  const handleOpenAdd = () => {
    setEditingOutlet(null);
    setName('');
    setAddress('');
    setPhone('');
    setImageUrl('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80');
    setImageTab('upload');
    setDescription('');
    setStatus('active');
    setShowModal(true);
  };

  const handleOpenEdit = (outlet) => {
    setEditingOutlet(outlet);
    setName(outlet.name);
    setAddress(outlet.address);
    setPhone(outlet.phone || '');
    setImageUrl(outlet.image_url || '');
    setImageTab(outlet.image_url && outlet.image_url.startsWith('http') ? 'url' : 'upload');
    setDescription(outlet.description || '');
    setStatus(outlet.status || 'active');
    setShowModal(true);
  };

  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Izin Ditolak', 'Akses galeri foto dibutuhkan untuk mengunggah gambar outlet.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        if (asset.base64) {
          const mimeType = asset.mimeType || 'image/jpeg';
          const base64Data = `data:${mimeType};base64,${asset.base64}`;
          setImageUrl(base64Data);
        } else if (asset.uri) {
          setImageUrl(asset.uri);
        }
      }
    } catch (err) {
      Alert.alert('Gagal Memilih Gambar', err.message || 'Terjadi kesalahan saat memilih gambar.');
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Perhatian', 'Nama outlet wajib diisi.');
      return;
    }

    const payload = {
      name,
      address,
      phone,
      image_url: imageUrl,
      description,
      status
    };

    try {
      const baseUrl = getApiUrl();
      const url = editingOutlet ? `${baseUrl}/outlets/${editingOutlet.id}` : `${baseUrl}/outlets`;
      const method = editingOutlet ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        loadOutlets();
      } else {
        Alert.alert('Gagal', data.message || 'Gagal menyimpan data outlet');
      }
    } catch (err) {
      Alert.alert('Error', 'Terjadi kesalahan koneksi saat menyimpan outlet.');
    }
  };

  const handleDelete = async (id, outletName) => {
    Alert.alert(
      'Konfirmasi Hapus',
      `Apakah Anda yakin ingin menghapus outlet "${outletName}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              const baseUrl = getApiUrl();
              const res = await fetch(`${baseUrl}/outlets/${id}`, { method: 'DELETE' });
              const data = await res.json();
              if (data.success) {
                loadOutlets();
              } else {
                Alert.alert('Gagal', data.message || 'Gagal menghapus outlet');
              }
            } catch (err) {
              Alert.alert('Error', 'Gagal menghapus outlet');
            }
          }
        }
      ]
    );
  };

  if (!isAdmin) {
    return (
      <View style={styles.restrictedCard}>
        <Text style={styles.restrictedIcon}>🔒</Text>
        <Text style={styles.restrictedTitle}>Akses Terbatas: Khusus Super Admin</Text>
        <Text style={styles.restrictedSub}>
          Menu Pengelolaan Cabang Outlet hanya dapat diakses oleh level **Super Admin**. Akun Anda (@{currentUser?.username}) berstatus Operator Cabang ({currentUser?.outlet_name || 'Outlet'}).
        </Text>
      </View>
    );
  }

  const resolveImageUri = (rawUrl) => {
    const defaultImg = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80';
    if (!rawUrl) return defaultImg;
    if (rawUrl.startsWith('http') || rawUrl.startsWith('data:')) return rawUrl;
    if (rawUrl.startsWith('/uploads/')) {
      const serverHost = getApiUrl().replace(/\/api$/, '');
      return `${serverHost}${rawUrl}`;
    }
    return defaultImg;
  };

  return (
    <View style={styles.container}>
      
      {/* Top Action Header */}
      <View style={styles.headerCard}>
        <View>
          <Text style={styles.headerTitle}>🏢 MANAJEMEN CABANG VENUE</Text>
          <Text style={styles.headerSub}>Kelola data lokasi & cabang olahraga</Text>
        </View>

        <TouchableOpacity
          style={styles.addBtn}
          onPress={handleOpenAdd}
          activeOpacity={0.8}
        >
          <Text style={styles.addBtnText}>+ Tambah Outlet</Text>
        </TouchableOpacity>
      </View>

      {/* Outlets Cards Grid */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Memuat data cabang outlet...</Text>
        </View>
      ) : outlets.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>🏢</Text>
          <Text style={styles.emptyTitle}>Belum Ada Outlet Terdaftar</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {outlets.map((outlet) => {
            const imgUri = resolveImageUri(outlet.image_url);

            return (
              <View key={outlet.id} style={styles.outletCard}>
                
                {/* Outlet Cover Banner */}
                <View style={styles.imageBox}>
                  <Image source={{ uri: imgUri }} style={styles.coverImg} resizeMode="cover" />
                  <View style={styles.statusPill}>
                    <Text style={styles.statusPillText}>{(outlet.status || 'active').toUpperCase()}</Text>
                  </View>
                </View>

                {/* Outlet Content Details */}
                <View style={styles.cardBody}>
                  <Text style={styles.outletName}>{outlet.name}</Text>
                  <Text style={styles.outletAddress}>📍 {outlet.address}</Text>
                  {outlet.phone ? (
                    <Text style={styles.outletPhone}>📞 {outlet.phone}</Text>
                  ) : null}

                  {outlet.description ? (
                    <Text style={styles.outletDesc} numberOfLines={2}>
                      {outlet.description}
                    </Text>
                  ) : null}

                  {/* Actions Row */}
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={styles.editBtn}
                      onPress={() => handleOpenEdit(outlet)}
                    >
                      <Text style={styles.editBtnText}>✏️ Edit Outlet</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => handleDelete(outlet.id, outlet.name)}
                    >
                      <Text style={styles.deleteBtnText}>🗑️ Hapus</Text>
                    </TouchableOpacity>
                  </View>

                </View>

              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Add / Edit Outlet Modal Form */}
      {showModal && (
        <Modal transparent animationType="slide" visible={true} onRequestClose={() => setShowModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              
              <View style={styles.modalHeader}>
                <Text style={styles.modalHeaderTitle}>
                  {editingOutlet ? 'Edit Data Outlet' : 'Tambah Outlet Baru'}
                </Text>
                <TouchableOpacity onPress={() => setShowModal(false)}>
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalFormBody}>
                <Text style={styles.label}>Nama Outlet *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Contoh: SportBook BSD Hub"
                  placeholderTextColor="#94A3B8"
                  value={name}
                  onChangeText={setName}
                />

                <Text style={styles.label}>Alamat Lengkap *</Text>
                <TextInput
                  style={styles.inputArea}
                  placeholder="Jl. BSD Green Office Park No. 12..."
                  placeholderTextColor="#94A3B8"
                  multiline
                  numberOfLines={2}
                  value={address}
                  onChangeText={setAddress}
                />

                <Text style={styles.label}>Nomor Telepon / WA</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0812-3456-7890"
                  placeholderTextColor="#94A3B8"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />

                {/* Foto Outlet Tabbed Picker */}
                <Text style={styles.label}>Foto Outlet</Text>
                <View style={styles.tabToggleRow}>
                  <TouchableOpacity
                    style={[styles.tabToggleBtn, imageTab === 'upload' && styles.tabToggleActive]}
                    onPress={() => setImageTab('upload')}
                  >
                    <Text style={[styles.tabToggleText, imageTab === 'upload' && styles.tabToggleTextActive]}>
                      📤 Upload Gambar
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.tabToggleBtn, imageTab === 'url' && styles.tabToggleActive]}
                    onPress={() => setImageTab('url')}
                  >
                    <Text style={[styles.tabToggleText, imageTab === 'url' && styles.tabToggleTextActive]}>
                      🔗 Input URL
                    </Text>
                  </TouchableOpacity>
                </View>

                {imageTab === 'upload' ? (
                  <TouchableOpacity style={styles.pickImgBtn} onPress={handlePickImage} activeOpacity={0.8}>
                    <Text style={styles.pickImgBtnText}>📷 Pilih Foto Dari Galeri Perangkat</Text>
                  </TouchableOpacity>
                ) : (
                  <TextInput
                    style={styles.input}
                    placeholder="https://images.unsplash.com/..."
                    placeholderTextColor="#94A3B8"
                    value={imageUrl && imageUrl.startsWith('data:') ? '' : imageUrl}
                    onChangeText={setImageUrl}
                  />
                )}

                {/* Image Preview Box */}
                {imageUrl ? (
                  <View style={styles.previewBox}>
                    <View style={styles.previewHeader}>
                      <Text style={styles.previewTitle}>Pratinjau Foto Outlet:</Text>
                      <TouchableOpacity onPress={() => setImageUrl('')}>
                        <Text style={styles.resetImgText}>✕ Hapus Foto</Text>
                      </TouchableOpacity>
                    </View>
                    <Image source={{ uri: resolveImageUri(imageUrl) }} style={styles.previewImg} resizeMode="cover" />
                  </View>
                ) : null}

                <Text style={styles.label}>Deskripsi Fasilitas</Text>
                <TextInput
                  style={styles.inputArea}
                  placeholder="Kompleks venue olahraga indoor & outdoor..."
                  placeholderTextColor="#94A3B8"
                  multiline
                  numberOfLines={2}
                  value={description}
                  onChangeText={setDescription}
                />

                {/* Submit button */}
                <TouchableOpacity
                  style={styles.saveBtn}
                  onPress={handleSave}
                  activeOpacity={0.8}
                >
                  <Text style={styles.saveBtnText}>Simpan Data Outlet →</Text>
                </TouchableOpacity>
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
  headerCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.navy,
  },
  headerSub: {
    fontSize: 10,
    color: COLORS.textSlate,
    marginTop: 2,
  },
  addBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addBtnText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '800',
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
    lineHeight: 16,
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
  outletCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  imageBox: {
    height: 120,
    width: '100%',
    position: 'relative',
    backgroundColor: COLORS.navy,
  },
  coverImg: {
    width: '100%',
    height: '100%',
  },
  statusPill: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: COLORS.sportGreen,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusPillText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: '900',
  },
  cardBody: {
    padding: 14,
  },
  outletName: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.navy,
  },
  outletAddress: {
    fontSize: 11,
    color: COLORS.textSlate,
    fontWeight: '600',
    marginTop: 2,
  },
  outletPhone: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '700',
    marginTop: 2,
  },
  outletDesc: {
    fontSize: 10,
    color: COLORS.textSlate,
    backgroundColor: COLORS.surface,
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  editBtn: {
    backgroundColor: COLORS.primaryBg,
    borderColor: '#BFDBFE',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  editBtnText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '800',
  },
  deleteBtn: {
    backgroundColor: COLORS.dangerBg,
    borderColor: COLORS.danger,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  deleteBtnText: {
    color: COLORS.danger,
    fontSize: 11,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    justifyContent: 'center',
    padding: 20,
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
  modalFormBody: {
    padding: 16,
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
  inputArea: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: COLORS.navy,
    fontWeight: '600',
    textAlignVertical: 'top',
  },
  tabToggleRow: {
    flexDirection: 'row',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tabToggleBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginRight: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabToggleActive: {
    borderBottomColor: COLORS.primary,
  },
  tabToggleText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSlate,
  },
  tabToggleTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  pickImgBtn: {
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  pickImgBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
  },
  previewBox: {
    marginTop: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: COLORS.border,
  },
  previewTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.navy,
  },
  resetImgText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.danger,
  },
  previewImg: {
    width: '100%',
    height: 110,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  saveBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '900',
  }
});

