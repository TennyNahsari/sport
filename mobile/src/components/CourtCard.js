import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { COLORS, SHADOWS } from '../constants/theme';

export default function CourtCard({ court, onBook }) {
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const getFloorTypeBadge = (courtName) => {
    const nameLower = (courtName || '').toLowerCase();
    if (nameLower.includes('karpet') || nameLower.includes('vinyl')) return 'Karpet Vinyl Premium';
    if (nameLower.includes('rumput') || nameLower.includes('sintetis')) return 'Rumput Sintetis FIFA';
    if (nameLower.includes('kayu') || nameLower.includes('parquet')) return 'Parquet Kayu Solid';
    if (nameLower.includes('interlock')) return 'Interlock Mat';
    return 'Matrass Standar';
  };

  const defaultImage = 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80';
  const imageUrl = court.image_url && court.image_url.startsWith('http') ? court.image_url : defaultImage;

  return (
    <View style={styles.card}>
      
      {/* Top Banner Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.courtImage}
          resizeMode="cover"
        />
        <View style={styles.imageOverlayBadgeRow}>
          <View style={styles.sportBadge}>
            <Text style={styles.sportBadgeText}>{court.sport_name || 'Sport'}</Text>
          </View>
          {court.outlet_name && (
            <View style={styles.outletBadge}>
              <Text style={styles.outletBadgeText} numberOfLines={1}>📍 {court.outlet_name}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Card Content Body */}
      <View style={styles.cardBody}>
        <Text style={styles.courtName}>{court.name}</Text>

        <View style={styles.floorRow}>
          <Text style={styles.floorBadge}>✨ {getFloorTypeBadge(court.name)}</Text>
          <Text style={styles.statusBadge}>● Aktif</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.footerRow}>
          <View>
            <Text style={styles.priceLabel}>HARGA SEWA</Text>
            <Text style={styles.priceValue}>{formatCurrency(court.price_per_hour)}</Text>
            <Text style={styles.priceUnit}>/ jam bermain</Text>
          </View>

          <TouchableOpacity
            style={styles.bookBtn}
            onPress={() => onBook(court)}
            activeOpacity={0.8}
          >
            <Text style={styles.bookBtnText}>Pesan Sekarang</Text>
          </TouchableOpacity>
        </View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  imageContainer: {
    height: 140,
    width: '100%',
    position: 'relative',
    backgroundColor: COLORS.navyLight,
  },
  courtImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlayBadgeRow: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sportBadge: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sportBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  outletBadge: {
    backgroundColor: 'rgba(37, 99, 235, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    maxWidth: 160,
  },
  outletBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '700',
  },
  cardBody: {
    padding: 14,
  },
  courtName: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.navy,
    marginBottom: 4,
  },
  floorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  floorBadge: {
    fontSize: 11,
    color: COLORS.textSlate,
    fontWeight: '600',
  },
  statusBadge: {
    fontSize: 10,
    color: COLORS.sportGreen,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 8,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.textSlate,
    letterSpacing: 0.5,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.primary,
  },
  priceUnit: {
    fontSize: 9,
    color: COLORS.textSlate,
    fontWeight: '600',
  },
  bookBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    ...SHADOWS.small,
  },
  bookBtnText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '800',
  }
});
