import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SHADOWS } from '../constants/theme';

/**
 * Calculates page numbers array for truncated pagination display:
 * Next, Prev, several initial pages, ellipsis (...), current page range, ellipsis (...), several end pages.
 */
function getPaginationRange(currentPage, totalPages, boundaryCount = 2, siblingCount = 1) {
  if (totalPages <= 1) return [1];

  const totalPageNumbers = boundaryCount * 2 + siblingCount * 2 + 2;
  if (totalPages <= totalPageNumbers) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const startPages = Array.from({ length: Math.min(boundaryCount, totalPages) }, (_, i) => i + 1);
  const endPages = Array.from(
    { length: Math.min(boundaryCount, totalPages) },
    (_, i) => totalPages - Math.min(boundaryCount, totalPages) + i + 1
  );

  const startSibling = Math.max(currentPage - siblingCount, boundaryCount + 1);
  const endSibling = Math.min(currentPage + siblingCount, totalPages - boundaryCount);

  const showStartEllipsis = startSibling > boundaryCount + 1;
  const showEndEllipsis = endSibling < totalPages - boundaryCount;

  const result = [...startPages];

  if (showStartEllipsis) {
    result.push('...');
  } else {
    for (let i = boundaryCount + 1; i < startSibling; i++) {
      if (!result.includes(i)) result.push(i);
    }
  }

  for (let i = startSibling; i <= endSibling; i++) {
    if (i > boundaryCount && i <= totalPages - boundaryCount) {
      if (!result.includes(i)) result.push(i);
    }
  }

  if (showEndEllipsis) {
    result.push('...');
  } else {
    for (let i = endSibling + 1; i <= totalPages - boundaryCount; i++) {
      if (!result.includes(i)) result.push(i);
    }
  }

  endPages.forEach((p) => {
    if (!result.includes(p)) result.push(p);
  });

  return result;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  label = 'data'
}) {
  if (totalPages <= 1 && !totalItems) return null;

  const pages = getPaginationRange(currentPage, totalPages, 2, 1);

  const startIndex = totalItems && itemsPerPage ? (currentPage - 1) * itemsPerPage + 1 : null;
  const endIndex = totalItems && itemsPerPage ? Math.min(currentPage * itemsPerPage, totalItems) : null;

  return (
    <View style={styles.container}>
      {totalItems !== undefined && startIndex !== null && (
        <Text style={styles.summaryText}>
          Menampilkan <Text style={styles.boldNavy}>{startIndex}</Text> -{' '}
          <Text style={styles.boldNavy}>{endIndex}</Text> dari{' '}
          <Text style={styles.boldNavy}>{totalItems}</Text> {label}
        </Text>
      )}

      {totalPages > 1 && (
        <View style={styles.controlsRow}>
          {/* Prev Button */}
          <TouchableOpacity
            style={[styles.navBtn, currentPage === 1 && styles.btnDisabled]}
            disabled={currentPage === 1}
            onPress={() => onPageChange(Math.max(1, currentPage - 1))}
            activeOpacity={0.7}
          >
            <Text style={[styles.navBtnText, currentPage === 1 && styles.textDisabled]}>← Prev</Text>
          </TouchableOpacity>

          {/* Page Numbers */}
          <View style={styles.pagesRow}>
            {pages.map((item, idx) => {
              if (item === '...') {
                return (
                  <Text key={`dots-${idx}`} style={styles.dotsText}>
                    ...
                  </Text>
                );
              }

              const pageNum = item;
              const isActive = currentPage === pageNum;

              return (
                <TouchableOpacity
                  key={pageNum}
                  style={[styles.pageBtn, isActive && styles.pageBtnActive]}
                  onPress={() => onPageChange(pageNum)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.pageBtnText, isActive && styles.pageBtnTextActive]}>
                    {pageNum}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Next Button */}
          <TouchableOpacity
            style={[styles.navBtn, currentPage === totalPages && styles.btnDisabled]}
            disabled={currentPage === totalPages}
            onPress={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            activeOpacity={0.7}
          >
            <Text style={[styles.navBtnText, currentPage === totalPages && styles.textDisabled]}>Next →</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    padding: 12,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  summaryText: {
    fontSize: 11,
    color: COLORS.textSlate,
    fontWeight: '600',
    marginBottom: 8,
  },
  boldNavy: {
    fontWeight: '900',
    color: COLORS.navy,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  navBtn: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  navBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.navy,
  },
  btnDisabled: {
    opacity: 0.3,
  },
  textDisabled: {
    color: '#94A3B8',
  },
  pagesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 2,
    gap: 3,
  },
  pageBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  pageBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.navy,
  },
  pageBtnTextActive: {
    color: COLORS.white,
  },
  dotsText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#94A3B8',
    paddingHorizontal: 2,
  },
});
