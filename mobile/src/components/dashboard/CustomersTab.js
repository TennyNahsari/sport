import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Linking
} from 'react-native';
import { COLORS, SHADOWS } from '../../constants/theme';
import { getApiUrl } from '../../services/api';

export default function CustomersTab({ currentUser }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const baseUrl = getApiUrl();
      const res = await fetch(`${baseUrl}/reports/customers`);
      const json = await res.json();
      if (json.success) {
        setCustomers(json.data);
      } else {
        setCustomers([]);
      }
    } catch (err) {
      console.error('Failed to load customers:', err);
      // Fallback customer list
      setCustomers([
        { id: 1, name: 'Budi Santoso', phone: '081234567890', email: 'budi@gmail.com', total_bookings: 5, total_spent: 400000 },
        { id: 2, name: 'Andi Wijaya', phone: '081399887766', email: 'andi@yahoo.com', total_bookings: 3, total_spent: 450000 },
        { id: 3, name: 'Citra Dewi', phone: '081122334455', email: 'citra@gmail.com', total_bookings: 2, total_spent: 180000 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleDelete = async (id, name) => {
    try {
      const baseUrl = getApiUrl();
      const res = await fetch(`${baseUrl}/reports/customers/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchCustomers();
      } else {
        alert(data.message || 'Gagal menghapus customer');
      }
    } catch (err) {
      alert('Gagal menghapus customer');
    }
  };

  const handleWA = (phone, name) => {
    if (!phone) return;
    const text = `Halo Kak ${name}, mengenai layanan venue SportBook`;
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

  const filteredCustomers = customers.filter(c =>
    (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.phone || '').includes(searchTerm) ||
    (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <View style={styles.container}>
      
      {/* Header & Search */}
      <View style={styles.headerCard}>
        <Text style={styles.headerTitle}>👥 DIREKTORI PELANGGAN (CUSTOMERS)</Text>
        
        <TextInput
          style={styles.searchInput}
          placeholder="Cari nama, No. HP, atau email..."
          placeholderTextColor="#94A3B8"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>

      {/* Customer List Cards */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Memuat data pelanggan...</Text>
        </View>
      ) : filteredCustomers.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>👥</Text>
          <Text style={styles.emptyTitle}>Data pelanggan tidak ditemukan.</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {filteredCustomers.map((c) => (
            <View key={c.id} style={styles.customerCard}>
              
              {/* Top Row Profile */}
              <View style={styles.profileRow}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>{(c.name || 'C').charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.profileTextFlex}>
                  <Text style={styles.customerName}>{c.name}</Text>
                  <Text style={styles.customerMeta}>📞 {c.phone} • {c.email || 'No email'}</Text>
                </View>
              </View>

              {/* Stats Bar */}
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>TOTAL SESI</Text>
                  <Text style={styles.statValBlue}>{c.total_bookings} Booking</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>TOTAL SPENT</Text>
                  <Text style={styles.statValGreen}>{formatCurrency(c.total_spent)}</Text>
                </View>
              </View>

              {/* Actions */}
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.waBtn}
                  onPress={() => handleWA(c.phone, c.name)}
                >
                  <Text style={styles.waBtnText}>💬 Chat WhatsApp</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDelete(c.id, c.name)}
                >
                  <Text style={styles.deleteBtnText}>🗑️ Hapus</Text>
                </TouchableOpacity>
              </View>

            </View>
          ))}
        </ScrollView>
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
  headerTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.navy,
    marginBottom: 8,
  },
  searchInput: {
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
  customerCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
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
  profileTextFlex: {
    flex: 1,
  },
  customerName: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.navy,
  },
  customerMeta: {
    fontSize: 11,
    color: COLORS.textSlate,
    fontWeight: '600',
    marginTop: 1,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 8,
    marginVertical: 4,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: COLORS.textSlate,
  },
  statValBlue: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.primary,
    marginTop: 2,
  },
  statValGreen: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.sportGreen,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  waBtn: {
    backgroundColor: COLORS.sportGreenBg,
    borderColor: COLORS.sportGreen,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  waBtnText: {
    color: COLORS.sportGreen,
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
  }
});
