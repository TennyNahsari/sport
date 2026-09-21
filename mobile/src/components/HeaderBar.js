import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/theme';

export default function HeaderBar({ title, activeTab, currentUser, onTabChange }) {
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
          <TouchableOpacity
            style={styles.userBadge}
            onPress={() => onTabChange('dashboard')}
          >
            <View style={styles.activeDot} />
            <Text style={styles.userName} numberOfLines={1}>{currentUser.name}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.staffBtn}
            onPress={() => onTabChange('login')}
          >
            <Text style={styles.staffBtnText}>Staff Login</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: COLORS.navy,
    paddingHorizontal: 16,
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
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  logoIcon: {
    fontSize: 20,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: -0.5,
  },
  brandHighlight: {
    color: COLORS.primaryLight,
  },
  brandSub: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.sportGreen,
    letterSpacing: 0.8,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  staffBtn: {
    backgroundColor: COLORS.navyLight,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
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
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 130,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.sportGreen,
    marginRight: 6,
  },
  userName: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
  }
});
