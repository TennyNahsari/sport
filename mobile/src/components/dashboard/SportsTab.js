import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal
} from 'react-native';
import { COLORS, SHADOWS } from '../../constants/theme';
import { api, getApiUrl } from '../../services/api';

export default function SportsTab({ currentUser }) {
  const isAdmin = (currentUser?.role || '').toLowerCase() === 'admin';

  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingSport, setEditingSport] = useState(null);

  // Form Fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [icon, setIcon] = useState('badminton');
  const [description, setDescription] = useState('');

  const loadSports = async () => {
    setLoading(true);
    const res = await api.getSports();
    if (res.success) {
      setSports(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadSports();
  }, []);

  const handleOpenAdd = () => {
    setEditingSport(null);
    setName('');
    setSlug('');
    setIcon('badminton');
    setDescription('');
    setShowModal(true);
  };

  const handleOpenEdit = (sport) => {
    setEditingSport(sport);
    setName(sport.name);
    setSlug(sport.slug);
    setIcon(sport.icon || 'badminton');
    setDescription(sport.description || '');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Nama olahraga wajib diisi.');
      return;
    }

    const payload = {
      name,
      slug: slug.trim() || name.toLowerCase().replace(/\s+/g, '-'),
      icon,
      description
    };

    try {
      const baseUrl = getApiUrl();
      const url = editingSport ? `${baseUrl}/sports/${editingSport.id}` : `${baseUrl}/sports`;
      const method = editingSport ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        loadSports();
      } else {
        alert(data.message || 'Gagal menyimpan kategori olahraga');
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi.');
    }
  };

  const handleDelete = async (id, sportName) => {
    try {
      const baseUrl = getApiUrl();
      const res = await fetch(`${baseUrl}/sports/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        loadSports();
      } else {
        alert(data.message || 'Gagal menghapus olahraga');
      }
    } catch (err) {
      alert('Gagal menghapus olahraga');
    }
  };

  const getEmoji = (iconName) => {
    const s = (iconName || '').toLowerCase();
    if (s.includes('badminton')) return '🏸';
    if (s.includes('futsal') || s.includes('soccer')) return '⚽';
    if (s.includes('basket')) return '🏀';
    if (s.includes('tenis') || s.includes('tennis')) return '🎾';
    if (s.includes('padel')) return '🎾';
    if (s.includes('pingpong')) return '🏓';
    return '🏆';
  };

  if (!isAdmin) {
    return (
      <View style={styles.restrictedCard}>
        <Text style={styles.restrictedIcon}>🔒</Text>
        <Text style={styles.restrictedTitle}>Akses Terbatas: Khusus Super Admin</Text>
        <Text style={styles.restrictedSub}>
          Menu Pengelolaan Cabang Olahraga hanya dapat dikelola oleh level **Super Admin**.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      
      {/* Header Card */}
      <View style={styles.headerCard}>
        <View>
          <Text style={styles.headerTitle}>🏆 MANAJEMEN CABANG OLAHRAGA</Text>
          <Text style={styles.headerSub}>Kelola daftar jenis olahraga venue</Text>
        </View>

        <TouchableOpacity style={styles.addBtn} onPress={handleOpenAdd} activeOpacity={0.8}>
          <Text style={styles.addBtnText}>+ Tambah Olahraga</Text>
        </TouchableOpacity>
      </View>

      {/* Sports List Grid */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Memuat kategori olahraga...</Text>
        </View>
      ) : sports.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>🏆</Text>
          <Text style={styles.emptyTitle}>Belum ada cabang olahraga terdaftar.</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {sports.map((sport) => (
            <View key={sport.id} style={styles.sportCard}>
              <View style={styles.cardHeaderRow}>
                <View style={styles.iconCircle}>
                  <Text style={styles.emojiIcon}>{getEmoji(sport.icon || sport.name)}</Text>
                </View>
                <View style={styles.textFlex}>
                  <Text style={styles.sportName}>{sport.name}</Text>
                  <Text style={styles.slugBadge}>slug: {sport.slug}</Text>
                </View>
              </View>

              {sport.description ? (
                <Text style={styles.sportDesc}>{sport.description}</Text>
              ) : null}

              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.editBtn} onPress={() => handleOpenEdit(sport)}>
                  <Text style={styles.editBtnText}>✏️ Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(sport.id, sport.name)}>
                  <Text style={styles.deleteBtnText}>🗑️ Hapus</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Add / Edit Sport Modal */}
      {showModal && (
        <Modal transparent animationType="slide" visible={true} onRequestClose={() => setShowModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalHeaderTitle}>{editingSport ? 'Edit Olahraga' : 'Tambah Olahraga Baru'}</Text>
                <TouchableOpacity onPress={() => setShowModal(false)}>
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalFormBody}>
                <Text style={styles.label}>Nama Olahraga *</Text>
                <TextInput style={styles.input} placeholder="Contoh: Badminton" placeholderTextColor="#94A3B8" value={name} onChangeText={setName} />

                <Text style={styles.label}>Slug URL (Kosongkan untuk otomatis)</Text>
                <TextInput style={styles.input} placeholder="badminton" placeholderTextColor="#94A3B8" value={slug} onChangeText={setSlug} />

                <Text style={styles.label}>Kata Kunci Ikon</Text>
                <TextInput style={styles.input} placeholder="badminton / futsal / basketball / tennis" placeholderTextColor="#94A3B8" value={icon} onChangeText={setIcon} />

                <Text style={styles.label}>Deskripsi Singkat</Text>
                <TextInput style={styles.inputArea} placeholder="Deskripsi jenis olahraga..." placeholderTextColor="#94A3B8" multiline numberOfLines={2} value={description} onChangeText={setDescription} />

                <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.8}>
                  <Text style={styles.saveBtnText}>Simpan Kategori Olahraga →</Text>
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
  sportCard: {
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
    alignItems: 'center',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  emojiIcon: {
    fontSize: 20,
  },
  textFlex: {
    flex: 1,
  },
  sportName: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.navy,
  },
  slugBadge: {
    fontSize: 10,
    color: COLORS.textSlate,
    fontWeight: '600',
  },
  sportDesc: {
    fontSize: 11,
    color: COLORS.textSlate,
    backgroundColor: COLORS.surface,
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
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
