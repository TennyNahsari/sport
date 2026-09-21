import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/theme';

export default function SportFilter({ sports, selectedSportId, onSelectSport }) {
  const getSportEmoji = (iconName) => {
    switch ((iconName || '').toLowerCase()) {
      case 'badminton': return '🏸';
      case 'futsal':
      case 'soccer': return '⚽';
      case 'basketball':
      case 'basket': return '🏀';
      case 'tennis':
      case 'tenis': return '🎾';
      case 'volleyball':
      case 'voli': return '🏐';
      default: return '🏆';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>KATEGORI OLAHRAGA</Text>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <TouchableOpacity
          style={[
            styles.chip,
            selectedSportId === '' && styles.chipActive
          ]}
          onPress={() => onSelectSport('')}
          activeOpacity={0.8}
        >
          <Text style={styles.chipEmoji}>🔥</Text>
          <Text style={[styles.chipText, selectedSportId === '' && styles.chipTextActive]}>
            Semua Cabang
          </Text>
        </TouchableOpacity>

        {sports.map((sport) => {
          const isSelected = selectedSportId === sport.id;
          return (
            <TouchableOpacity
              key={sport.id}
              style={[
                styles.chip,
                isSelected && styles.chipActive
              ]}
              onPress={() => onSelectSport(sport.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.chipEmoji}>{getSportEmoji(sport.icon || sport.name)}</Text>
              <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                {sport.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.navy,
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipEmoji: {
    fontSize: 14,
    marginRight: 6,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.navy,
  },
  chipTextActive: {
    color: COLORS.white,
  }
});
