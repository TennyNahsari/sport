import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS, SHADOWS } from '../constants/theme';

export default function SlotGrid({ courts, availabilityMap, selectedDate, onSelectDate, onSelectSlot }) {
  const getDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 5; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      let label = `${d.getDate()}/${d.getMonth() + 1}`;
      if (i === 0) label = 'Hari Ini';
      if (i === 1) label = 'Besok';
      dates.push({ dateStr, label });
    }
    return dates;
  };

  const dates = getDates();

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>JADWAL KETERSEDIAAN SLOT</Text>
          <Text style={styles.subtitle}>Pilih tanggal & slot jam untuk order instan</Text>
        </View>
      </View>

      {/* Date Switcher */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dateScroll}
      >
        {dates.map((item) => {
          const isSelected = selectedDate === item.dateStr;
          return (
            <TouchableOpacity
              key={item.dateStr}
              style={[
                styles.dateChip,
                isSelected && styles.dateChipSelected
              ]}
              onPress={() => onSelectDate(item.dateStr)}
              activeOpacity={0.8}
            >
              <Text style={[styles.dateLabel, isSelected && styles.textWhite]}>
                {item.label}
              </Text>
              <Text style={[styles.dateVal, isSelected && styles.textWhiteMuted]}>
                {item.dateStr}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Legend Indicator */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.white, borderColor: COLORS.sportGreen, borderWidth: 1.5 }]} />
          <Text style={styles.legendText}>Tersedia</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#F1F5F9', borderColor: '#CBD5E1', borderWidth: 1 }]} />
          <Text style={styles.legendText}>Terisi / Libur</Text>
        </View>
      </View>

      {/* Courts & Time Slots */}
      {courts.map((court) => {
        const rawAvail = availabilityMap[court.id];
        const slots = Array.isArray(rawAvail) 
          ? rawAvail 
          : (rawAvail && Array.isArray(rawAvail.slots) ? rawAvail.slots : []);

        return (
          <View key={court.id} style={styles.courtBlock}>
            <View style={styles.courtBlockHeader}>
              <Text style={styles.courtBlockName}>{court.name}</Text>
              <Text style={styles.courtBlockPrice}>
                Rp {(court.price_per_hour / 1000).toFixed(0)}k/jam
              </Text>
            </View>

            {slots.length === 0 ? (
              <Text style={styles.loadingText}>Memuat jadwal ketersediaan...</Text>
            ) : (
              <View style={styles.slotsGrid}>
                {slots.map((slot, idx) => {
                  const isAvailable = slot.available !== undefined 
                    ? slot.available 
                    : (slot.status === 'Available');

                  return (
                    <TouchableOpacity
                      key={idx}
                      disabled={!isAvailable}
                      style={[
                        styles.slotCard,
                        isAvailable ? styles.slotAvailable : styles.slotBooked
                      ]}
                      onPress={() => onSelectSlot(court, slot)}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.slotTime,
                        isAvailable ? styles.slotTimeAvailable : styles.slotTimeBooked
                      ]}>
                        {slot.time}
                      </Text>
                      <Text style={styles.slotStatusText}>
                        {isAvailable ? 'SEWA' : 'BOOKED'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 14,
    paddingHorizontal: 16,
  },
  headerRow: {
    marginBottom: 10,
  },
  title: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.navy,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 11,
    color: COLORS.textSlate,
    fontWeight: '500',
  },
  dateScroll: {
    paddingVertical: 6,
    marginBottom: 8,
  },
  dateChip: {
    backgroundColor: COLORS.cardBg,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  dateChipSelected: {
    backgroundColor: COLORS.navy,
    borderColor: COLORS.navy,
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.navy,
  },
  dateVal: {
    fontSize: 9,
    fontWeight: '600',
    color: COLORS.textSlate,
    marginTop: 2,
  },
  textWhite: {
    color: COLORS.white,
  },
  textWhiteMuted: {
    color: '#94A3B8',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textSlate,
  },
  courtBlock: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  courtBlockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  courtBlockName: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.navy,
  },
  courtBlockPrice: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
    backgroundColor: COLORS.primaryBg,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  loadingText: {
    fontSize: 11,
    color: COLORS.textSlate,
    fontStyle: 'italic',
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -3,
  },
  slotCard: {
    width: '23%',
    margin: '1%',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  slotAvailable: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.sportGreen,
  },
  slotBooked: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
    opacity: 0.6,
  },
  slotTime: {
    fontSize: 11,
    fontWeight: '800',
  },
  slotTimeAvailable: {
    color: COLORS.navy,
  },
  slotTimeBooked: {
    color: '#94A3B8',
  },
  slotStatusText: {
    fontSize: 8,
    fontWeight: '900',
    marginTop: 2,
    color: COLORS.sportGreen,
  }
});
