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
import { COLORS, SHADOWS } from '../../constants/theme';
import { api, getApiUrl } from '../../services/api';

export default function CourtsTab({ currentUser }) {
  const isAdmin = (currentUser?.role || '').toLowerCase() === 'admin';

  const [courts, setCourts] = useState([]);
  const [sports, setSports] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSportFilter, setSelectedSportFilter] = useState('');

  // Modal Form State
  const [showModal, setShowModal] = useState(false);
  const [editingCourt, setEditingCourt] = useState(null);

  // Form Fields
  const [name, setName] = useState('');
  const [sportId, setSportId] = useState('');
  const [outletId, setOutletId] = useState('');
  const [pricePerHour, setPricePerHour] = useState('80000');
  const [imageUrl, setImageUrl] = useState('');
  const [facilitiesStr, setFacilitiesStr] = useState('Indoor, AC, Wooden Floor');
  const [status, setStatus] = useState('active');

  const loadData = async () => {
    setLoading(true);
    const [courtsRes, sportsRes, outletsRes] = await Promise.all([
      api.getCourts(),
      api.getSports(),
      api.getOutlets()
    ]);

    if (courtsRes.success) setCourts(courtsRes.data);
    if (sportsRes.success) {
      setSports(sportsRes.data);
      if (sportsRes.data.length > 0 && !sportId) setSportId(String(sportsRes.data[0].id));
    }
    if (outletsRes.success) {
      setOutlets(outletsRes.data);
      if (outletsRes.data.length > 0 && !outletId) setOutletId(String(outletsRes.data[0].id));
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingCourt(null);
    setName('');
    setSportId(sports.length > 0 ? String(sports[0].id) : '');
    setOutletId(outlets.length > 0 ? String(outlets[0].id) : '');
    setPricePerHour('80000');
    setImageUrl('https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80');
    setFacilitiesStr('Indoor, AC, Wooden Floor');
    setStatus('active');
    setShowModal(true);
  };

  const handleOpenEdit = (court) => {
    setEditingCourt(court);
    setName(court.name);
    setSportId(String(court.sport_id));
    setOutletId(court.outlet_id ? String(court.outlet_id) : '');
    setPricePerHour(String(court.price_per_hour));
    setImageUrl(court.image_url || '');
    setFacilitiesStr(Array.isArray(court.facilities) ? court.facilities.join(', ') : (court.facilities || ''));
    setStatus(court.status || 'active');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Nama lapangan wajib diisi.');
      return;
    }

    const facilitiesArray = facilitiesStr.split(',').map(f => f.trim()).filter(Boolean);

    const payload = {
      name,
      sport_id: parseInt(sportId || '1'),
      outlet_id: outletId ? parseInt(outletId) : null,
      price_per_hour: parseInt(pricePerHour || '80000'),
      image_url: imageUrl,
      facilities: facilitiesArray,
      status
    };

    try {
      const baseUrl = getApiUrl();
      const url = editingCourt ? `${baseUrl}/courts/${editingCourt.id}` : `${baseUrl}/courts`;
      const method = editingCourt ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        loadData();
      } else {
        alert(data.message || 'Gagal menyimpan data lapangan');
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi saat menyimpan lapangan.');
    }
  };

  const handleDelete = async (id, courtName) => {
    try {
      const baseUrl = getApiUrl();
      const res = await fetch(`${baseUrl}/courts/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        loadData();
      } else {
        alert(data.message || 'Gagal menghapus lapangan');
      }
    } catch (err) {
      alert('Gagal menghapus lapangan');
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const filteredCourts = courts.filter(c => {
    const matchSearch = !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase()) || (c.sport_name && c.sport_name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchSport = !selectedSportFilter || String(c.sport_id) === String(selectedSportFilter);
    return matchSearch && matchSport;
  });

  return (
    <View style={styles.container}>
      
      {/* Top Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitle}>🏟️ MANAJEMEN LAPANGAN</Text>
          <TouchableOpacity style={styles.addBtn} onPress={handleOpenAdd} activeOpacity={0.8}>
            <Text style={styles.addBtnText}>+ Tambah Lapangan</Text>
          </TouchableOpacity>
        </View>

        {/* Search & Sport Filter */}
        <View style={styles.filterRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="Cari lapangan..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sportFilterScroll}>
            <TouchableOpacity
              style={[styles.sportChip, selectedSportFilter === '' && styles.sportChipActive]}
              onPress={() => setSelectedSportFilter('')}
            >
              <Text style={[styles.sportChipText, selectedSportFilter === '' && styles.textWhite]}>Semua</Text>
            </TouchableOpacity>
            {sports.map(s => (
              <TouchableOpacity
                key={s.id}
                style={[styles.sportChip, selectedSportFilter === String(s.id) && styles.sportChipActive]}
                onPress={() => setSelectedSportFilter(String(s.id))}
              >
                <Text style={[styles.sportChipText, selectedSportFilter === String(s.id) && styles.textWhite]}>
                  {s.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Courts List Cards */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Memuat data lapangan...</Text>
        </View>
      ) : filteredCourts.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>🏟️</Text>
          <Text style={styles.emptyTitle}>Tidak ada lapangan ditemukan.</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {filteredCourts.map((court) => {
            const defaultImg = 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80';
            const imgUri = court.image_url && court.image_url.startsWith('http') ? court.image_url : defaultImg;

            return (
              <View key={court.id} style={styles.courtCard}>
                
                {/* Court Image Banner */}
                <View style={styles.imageBox}>
                  <Image source={{ uri: imgUri }} style={styles.coverImg} resizeMode="cover" />
                  <View style={styles.imageOverlayRow}>
                    <View style={styles.sportBadge}>
                      <Text style={styles.sportBadgeText}>{court.sport_name || 'Sport'}</Text>
                    </View>
                    <View style={styles.statusPill}>
                      <Text style={styles.statusPillText}>{(court.status || 'active').toUpperCase()}</Text>
                    </View>
                  </View>
                </View>

                {/* Court Body */}
                <View style={styles.cardBody}>
                  <Text style={styles.courtName}>{court.name}</Text>
                  {court.outlet_name && (
                    <Text style={styles.outletName}>📍 {court.outlet_name}</Text>
                  )}
                  <Text style={styles.priceVal}>{formatCurrency(court.price_per_hour)} <Text style={styles.priceUnit}>/ jam</Text></Text>

                  {/* Facilities list */}
                  {Array.isArray(court.facilities) && court.facilities.length > 0 ? (
                    <View style={styles.facilitiesRow}>
                      {court.facilities.map((fac, idx) => (
                        <View key={idx} style={styles.facilityPill}>
                          <Text style={styles.facilityText}>✨ {fac}</Text>
                        </View>
                      ))}
                    </View>
                  ) : null}

                  {/* Action buttons */}
                  <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.editBtn} onPress={() => handleOpenEdit(court)}>
                      <Text style={styles.editBtnText}>✏️ Edit Lapangan</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(court.id, court.name)}>
                      <Text style={styles.deleteBtnText}>🗑️ Hapus</Text>
                    </TouchableOpacity>
                  </View>
                </View>

              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Add / Edit Court Modal */}
      {showModal && (
        <Modal transparent animationType="slide" visible={true} onRequestClose={() => setShowModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalHeaderTitle}>{editingCourt ? 'Edit Lapangan' : 'Tambah Lapangan Baru'}</Text>
                <TouchableOpacity onPress={() => setShowModal(false)}>
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalFormBody}>
                <Text style={styles.label}>Nama Lapangan *</Text>
                <TextInput style={styles.input} placeholder="Contoh: Badminton Court 01" placeholderTextColor="#94A3B8" value={name} onChangeText={setName} />

                <Text style={styles.label}>Kategori Olahraga *</Text>
                <View style={styles.chipRow}>
                  {sports.map(s => (
                    <TouchableOpacity
                      key={s.id}
                      style={[styles.selectChip, sportId === String(s.id) && styles.selectChipActive]}
                      onPress={() => setSportId(String(s.id))}
                    >
                      <Text style={[styles.selectChipText, sportId === String(s.id) && styles.textWhite]}>{s.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.label}>Cabang Outlet</Text>
                <View style={styles.chipRow}>
                  {outlets.map(o => (
                    <TouchableOpacity
                      key={o.id}
                      style={[styles.selectChip, outletId === String(o.id) && styles.selectChipActive]}
                      onPress={() => setOutletId(String(o.id))}
                    >
                      <Text style={[styles.selectChipText, outletId === String(o.id) && styles.textWhite]}>{o.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.label}>Harga Per Jam (Rp) *</Text>
                <TextInput style={styles.input} placeholder="80000" placeholderTextColor="#94A3B8" keyboardType="numeric" value={pricePerHour} onChangeText={setPricePerHour} />

                <Text style={styles.label}>URL Foto Sampul (Image URL)</Text>
                <TextInput style={styles.input} placeholder="https://images.unsplash.com/..." placeholderTextColor="#94A3B8" value={imageUrl} onChangeText={setImageUrl} />

                <Text style={styles.label}>Fasilitas (Dipisah koma)</Text>
                <TextInput style={styles.input} placeholder="Indoor, AC, Wooden Floor" placeholderTextColor="#94A3B8" value={facilitiesStr} onChangeText={setFacilitiesStr} />

                <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.8}>
                  <Text style={styles.saveBtnText}>Simpan Data Lapangan →</Text>
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
    ...SHADOWS.small,
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.navy,
  },
  addBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  addBtnText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '800',
  },
  filterRow: {
    marginTop: 4,
  },
  searchInput: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 12,
    color: COLORS.navy,
    fontWeight: '600',
    marginBottom: 8,
  },
  sportFilterScroll: {
    flexDirection: 'row',
  },
  sportChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 6,
  },
  sportChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  sportChipText: {
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
  courtCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  imageBox: {
    height: 130,
    width: '100%',
    position: 'relative',
    backgroundColor: COLORS.navy,
  },
  coverImg: {
    width: '100%',
    height: '100%',
  },
  imageOverlayRow: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sportBadge: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  sportBadgeText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: '900',
  },
  statusPill: {
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
  courtName: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.navy,
  },
  outletName: {
    fontSize: 11,
    color: COLORS.textSlate,
    fontWeight: '600',
    marginTop: 2,
  },
  priceVal: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.primary,
    marginTop: 4,
  },
  priceUnit: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textSlate,
  },
  facilitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  facilityPill: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 4,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  facilityText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textSlate,
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
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  selectChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 6,
    marginBottom: 6,
  },
  selectChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  selectChipText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.navy,
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
