import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS, SHADOWS } from '../constants/theme';

export default function OutletSelector({ outlets, selectedOutletId, onSelectOutlet }) {
  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>PILIH CABANG VENUE</Text>
        <Text style={styles.sectionBadge}>
          {outlets.length} Cabang Aktif
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <TouchableOpacity
          style={[
            styles.outletCard,
            selectedOutletId === '' && styles.outletCardSelected
          ]}
          onPress={() => onSelectOutlet('')}
          activeOpacity={0.8}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>📍</Text>
            {selectedOutletId === '' && (
              <View style={styles.activeCheckBadge}>
                <Text style={styles.checkIcon}>✓</Text>
              </View>
            )}
          </View>
          <Text style={[styles.outletName, selectedOutletId === '' && styles.textWhite]}>
            Semua Cabang
          </Text>
          <Text style={[styles.outletMeta, selectedOutletId === '' && styles.textSlateLight]}>
            Tampilkan seluruh lokasi venue
          </Text>
        </TouchableOpacity>

        {outlets.map((outlet) => {
          const isSelected = selectedOutletId === outlet.id;
          return (
            <TouchableOpacity
              key={outlet.id}
              style={[
                styles.outletCard,
                isSelected && styles.outletCardSelected
              ]}
              onPress={() => onSelectOutlet(outlet.id)}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardIcon}>🏢</Text>
                {isSelected && (
                  <View style={styles.activeCheckBadge}>
                    <Text style={styles.checkIcon}>✓</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.outletName, isSelected && styles.textWhite]} numberOfLines={1}>
                {outlet.name}
              </Text>
              <Text style={[styles.outletMeta, isSelected && styles.textSlateLight]} numberOfLines={1}>
                {outlet.city || outlet.address || 'Venue Sport'}
              </Text>
              {outlet.phone && (
                <Text style={[styles.phoneBadge, isSelected && styles.phoneBadgeSelected]}>
                  📞 {outlet.phone}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.navy,
    letterSpacing: 0.5,
  },
  sectionBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
    backgroundColor: COLORS.primaryBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 6,
  },
  outletCard: {
    width: 170,
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    padding: 14,
    marginRight: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  outletCardSelected: {
    backgroundColor: COLORS.navy,
    borderColor: COLORS.primary,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardIcon: {
    fontSize: 22,
  },
  activeCheckBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.sportGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIcon: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '900',
  },
  outletName: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.navy,
    marginBottom: 2,
  },
  outletMeta: {
    fontSize: 10,
    color: COLORS.textSlate,
    fontWeight: '500',
    marginBottom: 6,
  },
  textWhite: {
    color: COLORS.white,
  },
  textSlateLight: {
    color: '#94A3B8',
  },
  phoneBadge: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.primary,
    backgroundColor: COLORS.primaryBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  phoneBadgeSelected: {
    backgroundColor: COLORS.navyLight,
    color: COLORS.sportGreen,
  }
});
