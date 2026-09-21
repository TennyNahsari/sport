import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { COLORS, SHADOWS } from '../constants/theme';
import { api } from '../services/api';
import CalendarTab from '../components/dashboard/CalendarTab';
import OutletsTab from '../components/dashboard/OutletsTab';
import CourtsTab from '../components/dashboard/CourtsTab';
import SportsTab from '../components/dashboard/SportsTab';
import BookingsTab from '../components/dashboard/BookingsTab';
import CustomersTab from '../components/dashboard/CustomersTab';
import PaymentsTab from '../components/dashboard/PaymentsTab';
import ReportsTab from '../components/dashboard/ReportsTab';
import UsersTab from '../components/dashboard/UsersTab';
import SettingsTab from '../components/dashboard/SettingsTab';

export default function DashboardScreen({ currentUser, onLogout, onSwitchToCustomer }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const isAdmin = (currentUser?.role || '').toLowerCase() === 'admin';

  const loadDashboardData = async () => {
    setLoading(true);
    const res = await api.getReports();
    if (res.success && res.data) {
      setStats(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
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
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
      }
    >
      {/* Staff User Profile Header Card */}
      <View style={styles.profileCard}>
        <View style={styles.profileHeaderRow}>
          <View>
            <Text style={styles.greetingText}>SELAMAT DATANG, STAFF</Text>
            <Text style={styles.userNameText}>{currentUser?.name || 'Staff User'}</Text>
            <Text style={styles.userMetaText}>@{currentUser?.username} • {currentUser?.outlet_name || 'Semua Cabang'}</Text>
          </View>
          <View style={[
            styles.roleBadge,
            isAdmin ? styles.roleBadgeAdmin : styles.roleBadgeOperator
          ]}>
            <Text style={styles.roleBadgeText}>
              {isAdmin ? 'SUPER ADMIN' : 'OPERATOR'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={onLogout}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutBtnText}>🚪 Logout Sesi Staff ({currentUser?.username})</Text>
        </TouchableOpacity>
      </View>

      {/* Scrollable Sub Navigation Bar for Dashboard Modules */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.subNavScroll}
        contentContainerStyle={styles.subNavContentStyle}
      >
        {[
          { id: 'overview', label: '📊 Ringkasan' },
          { id: 'calendar', label: '🗓️ Kalender' },
          { id: 'bookings', label: '📋 Transaksi' },
          { id: 'payments', label: '💳 Pembayaran' },
          { id: 'customers', label: '👥 Pelanggan' },
          { id: 'reports', label: '📊 Laporan' },
          { id: 'courts', label: '🏟️ Lapangan' },
          { id: 'users', label: '👤 Users Staff' },
          { id: 'settings', label: '⚙️ Settings' },
          { id: 'outlets', label: '🏢 Outlets' },
          { id: 'sports', label: '🏆 Olahraga' }
        ].map(item => (
          <TouchableOpacity
            key={item.id}
            style={[styles.subNavTab, activeTab === item.id && styles.subNavTabActive]}
            onPress={() => setActiveTab(item.id)}
            activeOpacity={0.8}
          >
            <Text style={[styles.subNavText, activeTab === item.id && styles.subNavTextActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Dynamic Module Content View */}
      {activeTab === 'overview' && (
        <>
          <Text style={styles.sectionTitle}>METRIK OPERASIONAL VENUE</Text>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Memuat ringkasan data...</Text>
            </View>
          ) : (
            <>
              {/* Key Metrics 2x2 Grid */}
              <View style={styles.metricsGrid}>
                
                <TouchableOpacity style={styles.metricCard} onPress={() => setActiveTab('payments')}>
                  <View style={styles.metricIconBgGreen}>
                    <Text style={styles.metricIcon}>💰</Text>
                  </View>
                  <Text style={styles.metricLabel}>TOTAL REVENUE</Text>
                  <Text style={styles.metricValGreen}>
                    {formatCurrency(stats?.total_revenue || 4250000)}
                  </Text>
                  <Text style={styles.metricSub}>Bulan Ini</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.metricCard} onPress={() => setActiveTab('bookings')}>
                  <View style={styles.metricIconBgBlue}>
                    <Text style={styles.metricIcon}>📅</Text>
                  </View>
                  <Text style={styles.metricLabel}>BOOKING AKTIF</Text>
                  <Text style={styles.metricValBlue}>
                    {stats?.total_bookings || 18} Pesanan
                  </Text>
                  <Text style={styles.metricSub}>Status Konfirmasi</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.metricCard} onPress={() => setActiveTab('courts')}>
                  <View style={styles.metricIconBgOrange}>
                    <Text style={styles.metricIcon}>🏟️</Text>
                  </View>
                  <Text style={styles.metricLabel}>LAPANGAN</Text>
                  <Text style={styles.metricValOrange}>
                    {stats?.total_courts || 6} Beroperasi
                  </Text>
                  <Text style={styles.metricSub}>Siap Digunakan</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.metricCard} onPress={() => setActiveTab('customers')}>
                  <View style={styles.metricIconBgPurple}>
                    <Text style={styles.metricIcon}>👥</Text>
                  </View>
                  <Text style={styles.metricLabel}>PELANGGAN</Text>
                  <Text style={styles.metricValPurple}>
                    {stats?.total_customers || 14} Member
                  </Text>
                  <Text style={styles.metricSub}>Terdaftar</Text>
                </TouchableOpacity>

              </View>

              {/* Management Modules Shortcut Card */}
              <View style={styles.modulesCard}>
                <Text style={styles.modulesTitle}>MODUL PENGELOLAAN VENUE</Text>
                
                <TouchableOpacity style={styles.moduleItem} onPress={() => setActiveTab('calendar')}>
                  <Text style={styles.moduleIcon}>🗓️</Text>
                  <View style={styles.moduleTextFlex}>
                    <Text style={styles.moduleName}>Jadwal Kalender Interaktif</Text>
                    <Text style={styles.moduleSub}>Pantau ketersediaan waktu bermain real-time</Text>
                  </View>
                  <Text style={styles.moduleStatus}>Buka →</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.moduleItem} onPress={() => setActiveTab('bookings')}>
                  <Text style={styles.moduleIcon}>📋</Text>
                  <View style={styles.moduleTextFlex}>
                    <Text style={styles.moduleName}>Manajemen Transaksi Booking</Text>
                    <Text style={styles.moduleSub}>Daftar transaksi, update lunas & hapus</Text>
                  </View>
                  <Text style={styles.moduleStatus}>Buka →</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.moduleItem} onPress={() => setActiveTab('payments')}>
                  <Text style={styles.moduleIcon}>💳</Text>
                  <View style={styles.moduleTextFlex}>
                    <Text style={styles.moduleName}>Verifikasi Pembayaran</Text>
                    <Text style={styles.moduleSub}>Ringkasan total lunas vs pending</Text>
                  </View>
                  <Text style={styles.moduleStatus}>Buka →</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.moduleItem} onPress={() => setActiveTab('customers')}>
                  <Text style={styles.moduleIcon}>👥</Text>
                  <View style={styles.moduleTextFlex}>
                    <Text style={styles.moduleName}>Direktori Pelanggan (Customers)</Text>
                    <Text style={styles.moduleSub}>Daftar kontak & riwayat total spent</Text>
                  </View>
                  <Text style={styles.moduleStatus}>Buka →</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.moduleItem} onPress={() => setActiveTab('reports')}>
                  <Text style={styles.moduleIcon}>📊</Text>
                  <View style={styles.moduleTextFlex}>
                    <Text style={styles.moduleName}>Laporan & Analisis Kinerja</Text>
                    <Text style={styles.moduleSub}>Analisis pendapatan per cabang olahraga</Text>
                  </View>
                  <Text style={styles.moduleStatus}>Buka →</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.moduleItem} onPress={() => setActiveTab('courts')}>
                  <Text style={styles.moduleIcon}>🏟️</Text>
                  <View style={styles.moduleTextFlex}>
                    <Text style={styles.moduleName}>Manajemen Lapangan (Courts)</Text>
                    <Text style={styles.moduleSub}>Tambah & kelola harga sewa per jam</Text>
                  </View>
                  <Text style={styles.moduleStatus}>Buka →</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.moduleItem} onPress={() => setActiveTab('users')}>
                  <Text style={styles.moduleIcon}>👤</Text>
                  <View style={styles.moduleTextFlex}>
                    <Text style={styles.moduleName}>Manajemen User Staff</Text>
                    <Text style={styles.moduleSub}>Kelola akun Super Admin & Operator</Text>
                  </View>
                  <Text style={styles.moduleStatus}>{isAdmin ? 'Super Admin' : 'Terbatas'}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.moduleItem} onPress={() => setActiveTab('settings')}>
                  <Text style={styles.moduleIcon}>⚙️</Text>
                  <View style={styles.moduleTextFlex}>
                    <Text style={styles.moduleName}>Pengaturan Sistem & Rekening</Text>
                    <Text style={styles.moduleSub}>Transfer bank, QRIS & kontak CS</Text>
                  </View>
                  <Text style={styles.moduleStatus}>{isAdmin ? 'Super Admin' : 'Terbatas'}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.moduleItem} onPress={() => setActiveTab('outlets')}>
                  <Text style={styles.moduleIcon}>🏢</Text>
                  <View style={styles.moduleTextFlex}>
                    <Text style={styles.moduleName}>Manajemen Cabang Outlets</Text>
                    <Text style={styles.moduleSub}>Kelola data cabang venue & lokasi</Text>
                  </View>
                  <Text style={styles.moduleStatus}>{isAdmin ? 'Super Admin' : 'Terbatas'}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.moduleItem} onPress={() => setActiveTab('sports')}>
                  <Text style={styles.moduleIcon}>🏆</Text>
                  <View style={styles.moduleTextFlex}>
                    <Text style={styles.moduleName}>Manajemen Cabang Olahraga</Text>
                    <Text style={styles.moduleSub}>Kategori Badminton, Futsal, Basket, dll.</Text>
                  </View>
                  <Text style={styles.moduleStatus}>{isAdmin ? 'Super Admin' : 'Terbatas'}</Text>
                </TouchableOpacity>
              </View>

              {/* Switch to Web customer view */}
              <TouchableOpacity
                style={styles.switchWebBtn}
                onPress={onSwitchToCustomer}
                activeOpacity={0.8}
              >
                <Text style={styles.switchWebText}>🌐 Tampilkan Halaman Utama Customer</Text>
              </TouchableOpacity>
            </>
          )}
        </>
      )}

      {activeTab === 'calendar' && (
        <CalendarTab currentUser={currentUser} />
      )}

      {activeTab === 'bookings' && (
        <BookingsTab currentUser={currentUser} />
      )}

      {activeTab === 'payments' && (
        <PaymentsTab currentUser={currentUser} />
      )}

      {activeTab === 'customers' && (
        <CustomersTab currentUser={currentUser} />
      )}

      {activeTab === 'reports' && (
        <ReportsTab currentUser={currentUser} />
      )}

      {activeTab === 'courts' && (
        <CourtsTab currentUser={currentUser} />
      )}

      {activeTab === 'users' && (
        <UsersTab currentUser={currentUser} />
      )}

      {activeTab === 'settings' && (
        <SettingsTab currentUser={currentUser} />
      )}

      {activeTab === 'outlets' && (
        <OutletsTab currentUser={currentUser} />
      )}

      {activeTab === 'sports' && (
        <SportsTab currentUser={currentUser} />
      )}

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
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: COLORS.navy,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    ...SHADOWS.medium,
  },
  profileHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  greetingText: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.sportGreen,
    letterSpacing: 0.8,
  },
  userNameText: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.white,
    marginVertical: 2,
  },
  userMetaText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
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
  logoutBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.4)',
    borderWidth: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutBtnText: {
    color: '#FCA5A5',
    fontSize: 11,
    fontWeight: '800',
  },
  subNavScroll: {
    marginBottom: 14,
    flexGrow: 0,
    height: 42,
  },
  subNavContentStyle: {
    alignItems: 'center',
    paddingVertical: 2,
  },
  subNavTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subNavTabActive: {
    backgroundColor: COLORS.navy,
    borderColor: COLORS.navy,
  },
  subNavText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.navy,
  },
  subNavTextActive: {
    color: COLORS.white,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.navy,
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  loadingBox: {
    padding: 30,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 11,
    color: COLORS.textSlate,
    marginTop: 8,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
    marginBottom: 14,
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
  metricIconBgGreen: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.sportGreenBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricIconBgBlue: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricIconBgOrange: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.orangeBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricIconBgPurple: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricIcon: {
    fontSize: 16,
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.textSlate,
    letterSpacing: 0.5,
  },
  metricValGreen: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.sportGreen,
    marginVertical: 2,
  },
  metricValBlue: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.primary,
    marginVertical: 2,
  },
  metricValOrange: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.orange,
    marginVertical: 2,
  },
  metricValPurple: {
    fontSize: 15,
    fontWeight: '900',
    color: '#9333EA',
    marginVertical: 2,
  },
  metricSub: {
    fontSize: 9,
    color: COLORS.textSlate,
    fontWeight: '600',
  },
  modulesCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    ...SHADOWS.small,
  },
  modulesTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.navy,
    marginBottom: 12,
  },
  moduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  moduleIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  moduleTextFlex: {
    flex: 1,
  },
  moduleName: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.navy,
  },
  moduleSub: {
    fontSize: 10,
    color: COLORS.textSlate,
  },
  moduleStatus: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
    backgroundColor: COLORS.primaryBg,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  switchWebBtn: {
    backgroundColor: COLORS.navy,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  switchWebText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '800',
  }
});
