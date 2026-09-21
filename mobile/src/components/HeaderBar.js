import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/theme';

export default function HeaderBar({ title, activeTab, currentUser, onTabChange, onLogout }) {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.brandRow}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoIcon}>🏆</Text>
        </View>
        <View>
          <Text style={styles.brandTitle}>
            Sport<Text style={styles.brandHighlight}>Book</Text>
          </Text>
          <Text style={styles.brandSub}>COURT RENTAL VENUE</Text>
        </View>
      </View>

      <View style={styles.rightContainer}>
        {currentUser ? (
          <View style={styles.loggedInRow}>
            <TouchableOpacity
              style={styles.userBadge}
              onPress={() => onTabChange('dashboard')}
              activeOpacity={0.8}
            >
              <View style={styles.activeDot} />
              <Text style={styles.userName} numberOfLines={1}>{currentUser.name}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.logoutHeaderBtn}
              onPress={onLogout}
              activeOpacity={0.8}
            >
              <Text style={styles.logoutHeaderText}>🚪 Logout</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.staffBtn}
            onPress={() => onTabChange('login')}
            activeOpacity={0.8}
          >
            <Text style={styles.staffBtnText}>🔐 Staff Login</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: COLORS.navy,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.navyLight,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  logoIcon: {
    fontSize: 18,
  },
  brandTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: -0.5,
  },
  brandHighlight: {
    color: COLORS.primaryLight,
  },
  brandSub: {
    fontSize: 8,
    fontWeight: '800',
    color: COLORS.sportGreen,
    letterSpacing: 0.8,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loggedInRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  staffBtn: {
    backgroundColor: COLORS.navyLight,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  staffBtnText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '800',
  },
  userBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: COLORS.sportGreen,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 6,
    maxWidth: 110,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.sportGreen,
    marginRight: 5,
  },
  userName: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '700',
  },
  logoutHeaderBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: 'rgba(239, 68, 68, 0.5)',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
  },
  logoutHeaderText: {
    color: '#FCA5A5',
    fontSize: 10,
    fontWeight: '800',
  }
});
