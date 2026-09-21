import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, StatusBar, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SHADOWS } from './src/constants/theme';
import HeaderBar from './src/components/HeaderBar';
import LandingScreen from './src/screens/LandingScreen';
import CheckOrderScreen from './src/screens/CheckOrderScreen';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';

export default function App() {
  const [activeTab, setActiveTab] = useState('landing'); // 'landing' | 'check_order' | 'login' | 'dashboard'
  const [currentUser, setCurrentUser] = useState(null);

  // Load persistent user session
  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const saved = await AsyncStorage.getItem('sportbook_user');
        if (saved) {
          setCurrentUser(JSON.parse(saved));
        }
      } catch (err) {
        console.error('Failed to load user session:', err);
      }
    };
    checkUserSession();
  }, []);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setActiveTab('dashboard');
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('sportbook_user');
      setCurrentUser(null);
      setActiveTab('landing');
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  const handleStaffTabPress = () => {
    if (currentUser) {
      setActiveTab('dashboard');
    } else {
      setActiveTab('login');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.navy} />

      {/* Top Header */}
      <HeaderBar
        title="SportBook"
        activeTab={activeTab}
        currentUser={currentUser}
        onTabChange={(tab) => {
          if (tab === 'login' && currentUser) {
            setActiveTab('dashboard');
          } else {
            setActiveTab(tab);
          }
        }}
      />

      {/* Main Screen Router */}
      <View style={styles.bodyContent}>
        {activeTab === 'landing' && (
          <LandingScreen
            onOpenCheckOrder={() => setActiveTab('check_order')}
          />
        )}

        {activeTab === 'check_order' && (
          <CheckOrderScreen />
        )}

        {activeTab === 'login' && (
          <LoginScreen
            onLoginSuccess={handleLoginSuccess}
            onReturnToLanding={() => setActiveTab('landing')}
          />
        )}

        {activeTab === 'dashboard' && (
          currentUser ? (
            <DashboardScreen
              currentUser={currentUser}
              onLogout={handleLogout}
              onSwitchToCustomer={() => setActiveTab('landing')}
            />
          ) : (
            <LoginScreen
              onLoginSuccess={handleLoginSuccess}
              onReturnToLanding={() => setActiveTab('landing')}
            />
          )
        )}
      </View>

      {/* Bottom Navigation Tab Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={[styles.navTab, activeTab === 'landing' && styles.navTabActive]}
          onPress={() => setActiveTab('landing')}
          activeOpacity={0.8}
        >
          <Text style={styles.navIcon}>🏆</Text>
          <Text style={[styles.navLabel, activeTab === 'landing' && styles.navLabelActive]}>
            Sewa Lapangan
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navTab, activeTab === 'check_order' && styles.navTabActive]}
          onPress={() => setActiveTab('check_order')}
          activeOpacity={0.8}
        >
          <Text style={styles.navIcon}>🔍</Text>
          <Text style={[styles.navLabel, activeTab === 'check_order' && styles.navLabelActive]}>
            Cek Order
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navTab, (activeTab === 'login' || activeTab === 'dashboard') && styles.navTabActive]}
          onPress={handleStaffTabPress}
          activeOpacity={0.8}
        >
          <Text style={styles.navIcon}>{currentUser ? '🛡️' : '🔒'}</Text>
          <Text style={[
            styles.navLabel,
            (activeTab === 'login' || activeTab === 'dashboard') && styles.navLabelActive
          ]}>
            {currentUser ? 'Dashboard' : 'Staff Login'}
          </Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.navy,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  bodyContent: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: COLORS.navy,
    borderTopWidth: 1,
    borderTopColor: COLORS.navyLight,
    paddingVertical: 8,
    paddingHorizontal: 12,
    justifyContent: 'space-around',
  },
  navTab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  navTabActive: {
    backgroundColor: COLORS.navyLight,
  },
  navIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
  },
  navLabelActive: {
    color: COLORS.white,
    fontWeight: '900',
  }
});
