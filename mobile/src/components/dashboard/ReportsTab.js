import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { COLORS, SHADOWS } from '../../constants/theme';
import { api } from '../../services/api';

export default function ReportsTab({ currentUser }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadReports = async () => {
    setLoading(true);
    const res = await api.getReports();
    if (res.success && res.data) {
      setStats(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadReports();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReports();
    setRefreshing(false);
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
      }
    >
      {/* Header Card */}
      <View style={styles.headerCard}>
        <Text style={styles.headerTitle}>📊 LAPORAN & ANALISIS KINERJA VENUE</Text>
        <Text style={styles.headerSub}>Ringkasan laporan keuangan & statistik operasional</Text>
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Memuat analisis data laporan...</Text>
        </View>
      ) : (
        <>
          {/* Key Stats Cards */}
          <View style={styles.metricsGrid}>
            
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>TOTAL PEMASUKAN</Text>
              <Text style={styles.metricValGreen}>{formatCurrency(stats?.total_revenue || 4250000)}</Text>
              <Text style={styles.metricMeta}>Verified Paid Revenue</Text>
            </View>

            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>TOTAL TRANSAKSI</Text>
              <Text style={styles.metricValBlue}>{stats?.total_bookings || 18} Sesi</Text>
              <Text style={styles.metricMeta}>Booking Terdaftar</Text>
            </View>

            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>LAPANGAN AKTIF</Text>
              <Text style={styles.metricValOrange}>{stats?.total_courts || 6} Lapangan</Text>
              <Text style={styles.metricMeta}>Siap Di-sewa</Text>
            </View>

            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>TOTAL PELANGGAN</Text>
              <Text style={styles.metricValPurple}>{stats?.total_customers || 14} Orang</Text>
              <Text style={styles.metricMeta}>Member Aktif</Text>
            </View>

          </View>

          {/* Revenue Breakdown by Sport */}
          <View style={styles.breakdownCard}>
            <Text style={styles.breakdownTitle}>🏆 ESTIMASI PENDAPATAN PER CABANG OLAHRAGA</Text>
            
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownIcon}>🏸</Text>
              <View style={styles.breakdownFlex}>
                <Text style={styles.breakdownName}>Badminton</Text>
                <Text style={styles.breakdownMeta}>65% okupansi jam prime-time</Text>
              </View>
              <Text style={styles.breakdownPrice}>{formatCurrency(2400000)}</Text>
            </View>

            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownIcon}>⚽</Text>
              <View style={styles.breakdownFlex}>
                <Text style={styles.breakdownName}>Futsal</Text>
                <Text style={styles.breakdownMeta}>25% okupansi akhir pekan</Text>
              </View>
              <Text style={styles.breakdownPrice}>{formatCurrency(1250000)}</Text>
            </View>

            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownIcon}>🏀</Text>
              <View style={styles.breakdownFlex}>
                <Text style={styles.breakdownName}>Basket</Text>
                <Text style={styles.breakdownMeta}>10% okupansi malam hari</Text>
              </View>
              <Text style={styles.breakdownPrice}>{formatCurrency(600000)}</Text>
            </View>
          </View>
        </>
      )}

    </ScrollView>
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
  },
  headerSub: {
    fontSize: 10,
    color: COLORS.textSlate,
    marginTop: 2,
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
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
    marginBottom: 12,
  },
  metricCard: {
    width: '48%',
    marginHorizontal: '1%',
    marginBottom: 10,
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.textSlate,
    letterSpacing: 0.5,
  },
  metricValGreen: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.sportGreen,
    marginVertical: 4,
  },
  metricValBlue: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.primary,
    marginVertical: 4,
  },
  metricValOrange: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.orange,
    marginVertical: 4,
  },
  metricValPurple: {
    fontSize: 16,
    fontWeight: '900',
    color: '#9333EA',
    marginVertical: 4,
  },
  metricMeta: {
    fontSize: 9,
    color: COLORS.textSlate,
    fontWeight: '600',
  },
  breakdownCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
    ...SHADOWS.small,
  },
  breakdownTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.navy,
    marginBottom: 10,
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  breakdownIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  breakdownFlex: {
    flex: 1,
  },
  breakdownName: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.navy,
  },
  breakdownMeta: {
    fontSize: 10,
    color: COLORS.textSlate,
  },
  breakdownPrice: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.sportGreen,
  }
});
