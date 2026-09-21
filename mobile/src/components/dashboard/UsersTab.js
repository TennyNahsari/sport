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

export default function UsersTab({ currentUser }) {
  const isAdmin = (currentUser?.role || '').toLowerCase() === 'admin';

  const [users, setUsers] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Form Fields
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('operator');
  const [outletId, setOutletId] = useState('');
  const [status, setStatus] = useState('active');

  const loadData = async () => {
    setLoading(true);
    try {
      const baseUrl = getApiUrl();
      const [usersRes, outletsRes] = await Promise.all([
        fetch(`${baseUrl}/users`).then(r => r.json()),
        api.getOutlets()
      ]);

      if (usersRes.success) setUsers(usersRes.data);
      if (outletsRes.success) setOutlets(outletsRes.data);
    } catch (err) {
      console.error('Failed to load users:', err);
      setUsers([
        { id: 1, username: 'admin', name: 'Super Admin', role: 'admin', outlet_name: 'Semua Cabang', status: 'active' },
        { id: 2, username: 'operator', name: 'Operator Senayan', role: 'operator', outlet_name: 'SportBook Senayan', status: 'active' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingUser(null);
    setName('');
    setUsername('');
    setPassword('');
    setRole('operator');
    setOutletId(outlets.length > 0 ? String(outlets[0].id) : '');
    setStatus('active');
    setShowModal(true);
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setName(user.name || '');
    setUsername(user.username || '');
    setPassword('');
    setRole(user.role || 'operator');
    setOutletId(user.outlet_id ? String(user.outlet_id) : '');
    setStatus(user.status || 'active');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!name.trim() || !username.trim()) {
      alert('Nama dan Username wajib diisi.');
      return;
    }
    if (!editingUser && !password.trim()) {
      alert('Password wajib diisi untuk akun baru.');
      return;
    }

    const payload = {
      name,
      username,
      role,
      outlet_id: role === 'admin' ? null : (outletId ? parseInt(outletId) : null),
      status
    };
    if (password.trim()) payload.password = password.trim();

    try {
      const baseUrl = getApiUrl();
      const url = editingUser ? `${baseUrl}/users/${editingUser.id}` : `${baseUrl}/users`;
      const method = editingUser ? 'PUT' : 'POST';

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
        alert(data.message || 'Gagal menyimpan user staff');
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi.');
    }
  };

  const handleDelete = async (id, userName) => {
    try {
      const baseUrl = getApiUrl();
      const res = await fetch(`${baseUrl}/users/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        loadData();
      } else {
        alert(data.message || 'Gagal menghapus user');
      }
    } catch (err) {
      alert('Gagal menghapus user');
    }
  };

  const filteredUsers = users.filter(u => {
    const matchSearch = !searchQuery || (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (u.username || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchRole = !roleFilter || (u.role || '').toLowerCase() === roleFilter.toLowerCase();
    return matchSearch && matchRole;
  });

  if (!isAdmin) {
    return (
      <View style={styles.restrictedCard}>
        <Text style={styles.restrictedIcon}>🔒</Text>
        <Text style={styles.restrictedTitle}>Akses Terbatas: Khusus Super Admin</Text>
        <Text style={styles.restrictedSub}>
          Menu Pengelolaan User Staff hanya dapat diakses oleh level **Super Admin**.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      
      {/* Header & Actions */}
      <View style={styles.headerCard}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitle}>👤 MANAJEMEN USER STAFF</Text>
          <TouchableOpacity style={styles.addBtn} onPress={handleOpenAdd} activeOpacity={0.8}>
            <Text style={styles.addBtnText}>+ Tambah Staff</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.searchInput}
          placeholder="Cari nama atau username staff..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {/* Role Filters */}
        <View style={styles.chipRow}>
          {[
            { label: 'Semua Role', val: '' },
            { label: 'Super Admin', val: 'admin' },
            { label: 'Operator', val: 'operator' }
          ].map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.filterChip, roleFilter === item.val && styles.filterChipActive]}
              onPress={() => setRoleFilter(item.val)}
            >
              <Text style={[styles.filterChipText, roleFilter === item.val && styles.textWhite]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Users List Cards */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Memuat data staff...</Text>
        </View>
      ) : filteredUsers.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>👤</Text>
          <Text style={styles.emptyTitle}>Data user staff tidak ditemukan.</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {filteredUsers.map((u) => {
            const isUserAdmin = (u.role || '').toLowerCase() === 'admin';

            return (
              <View key={u.id} style={styles.userCard}>
                
                <View style={styles.cardHeaderRow}>
                  <View style={styles.avatarCircle}>
                    <Text style={styles.avatarText}>{(u.name || 'S').charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={styles.userTextFlex}>
                    <Text style={styles.userName}>{u.name}</Text>
                    <Text style={styles.userUsername}>@{u.username} • {u.outlet_name || 'Semua Cabang'}</Text>
                  </View>
                  <View style={[styles.roleBadge, isUserAdmin ? styles.roleBadgeAdmin : styles.roleBadgeOperator]}>
                    <Text style={styles.roleBadgeText}>{isUserAdmin ? 'ADMIN' : 'OPERATOR'}</Text>
                  </View>
                </View>

                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.editBtn} onPress={() => handleOpenEdit(u)}>
                    <Text style={styles.editBtnText}>✏️ Edit Staff</Text>
                  </TouchableOpacity>

                  {u.username !== currentUser?.username ? (
                    <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(u.id, u.name)}>
                      <Text style={styles.deleteBtnText}>🗑️ Hapus</Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={styles.selfTag}>Akun Anda</Text>
                  )}
                </View>

              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Add / Edit User Modal */}
      {showModal && (
        <Modal transparent animationType="slide" visible={true} onRequestClose={() => setShowModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalHeaderTitle}>{editingUser ? 'Edit User Staff' : 'Tambah Staff Baru'}</Text>
                <TouchableOpacity onPress={() => setShowModal(false)}>
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalFormBody}>
                <Text style={styles.label}>Nama Lengkap *</Text>
                <TextInput style={styles.input} placeholder="Budi Santoso" placeholderTextColor="#94A3B8" value={name} onChangeText={setName} />

                <Text style={styles.label}>Username *</Text>
                <TextInput style={styles.input} placeholder="budi_staff" placeholderTextColor="#94A3B8" autoCapitalize="none" value={username} onChangeText={setUsername} />

                <Text style={styles.label}>{editingUser ? 'Password Baru (Kosongkan jika tidak diubah)' : 'Password *'}</Text>
                <TextInput style={styles.input} placeholder="••••••••" placeholderTextColor="#94A3B8" secureTextEntry value={password} onChangeText={setPassword} />

                <Text style={styles.label}>Role Akses *</Text>
                <View style={styles.chipRowSelect}>
                  <TouchableOpacity
                    style={[styles.selectChip, role === 'admin' && styles.selectChipActive]}
                    onPress={() => setRole('admin')}
                  >
                    <Text style={[styles.selectChipText, role === 'admin' && styles.textWhite]}>Super Admin</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.selectChip, role === 'operator' && styles.selectChipActive]}
                    onPress={() => setRole('operator')}
                  >
                    <Text style={[styles.selectChipText, role === 'operator' && styles.textWhite]}>Operator Cabang</Text>
                  </TouchableOpacity>
                </View>

                {role === 'operator' ? (
                  <>
                    <Text style={styles.label}>Cabang Outlet Terikat *</Text>
                    <View style={styles.chipRowSelect}>
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
                  </>
                ) : null}

                <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.8}>
                  <Text style={styles.saveBtnText}>Simpan Akun Staff →</Text>
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
  chipRow: {
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
  userCard: {
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
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '900',
  },
  userTextFlex: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.navy,
  },
  userUsername: {
    fontSize: 10,
    color: COLORS.textSlate,
    fontWeight: '600',
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  roleBadgeAdmin: {
    backgroundColor: COLORS.primary,
  },
  roleBadgeOperator: {
    backgroundColor: COLORS.orange,
  },
  roleBadgeText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: '900',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  selfTag: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textSlate,
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
  chipRowSelect: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  selectChip: {
    paddingHorizontal: 12,
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
