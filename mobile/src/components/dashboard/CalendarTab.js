import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
  Linking
} from 'react-native';
import { COLORS, SHADOWS } from '../../constants/theme';
import { api, getApiUrl } from '../../services/api';

export default function CalendarTab({ currentUser }) {
  const todayStr = new Date().toISOString().split('T')[0];
  const isAdmin = (currentUser?.role || '').toLowerCase() === 'admin';

  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [outlets, setOutlets] = useState([]);
  const [selectedOutletId, setSelectedOutletId] = useState('');
  const [calendarData, setCalendarData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    api.getOutlets().then(res => {
      if (res.success) setOutlets(res.data);
    });
  }, []);

  const loadCalendar = async () => {
    setLoading(true);
    try {
      const baseUrl = getApiUrl();
      let url = `${baseUrl}/bookings/calendar?date=${selectedDate}`;
      if (selectedOutletId) url += `&outlet_id=${selectedOutletId}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setCalendarData(json.data);
      } else {
        setCalendarData(null);
      }
    } catch (err) {
      console.error('Failed to load calendar:', err);
      // Generate fallback calendar data if offline
      setCalendarData({
        date: selectedDate,
        courts: [
          { id: 1, name: 'Court A - Badminton', outlet_name: 'Senayan' },
          { id: 2, name: 'Court B - Badminton', outlet_name: 'Senayan' },
          { id: 3, name: 'Futsal Arena 1', outlet_name: 'BSD Hub' }
        ],
        grid: [
          { time: '08:00', 1: { status: 'Available' }, 2: { status: 'Booked', customer_name: 'Budi S.', booking_code: 'SB-109283', booking_status: 'paid', customer_phone: '0812345678' } },
          { time: '09:00', 1: { status: 'Booked', customer_name: 'Andi M.', booking_code: 'SB-892401', booking_status: 'unpaid', customer_phone: '0813998877' } }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCalendar();
  }, [selectedDate, selectedOutletId]);

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      const baseUrl = getApiUrl();
      await fetch(`${baseUrl}/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_status: newStatus })
      });
      setSelectedBooking(null);
      loadCalendar();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    try {
      const baseUrl = getApiUrl();
      await fetch(`${baseUrl}/bookings/${bookingId}?permanent=true`, { method: 'DELETE' });
      setSelectedBooking(null);
      loadCalendar();
    } catch (err) {
      console.error('Failed to delete booking:', err);
    }
  };

  const handleWA = (phone, name, code) => {
    if (!phone) return;
    const text = `Halo Kak ${name}, mengenai pemesanan tempat dengan Kode Booking: *${code}*`;
    const url = `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`;
    Linking.openURL(url).catch(err => console.error('Failed to open WA:', err));
  };

  return (
    <View style={styles.container}>
      
      {/* Date & Filter Header */}
      <View style={styles.filterCard}>
        <Text style={styles.filterTitle}>🗓️ KALENDER JADWAL MAIN</Text>
        
        <View style={styles.filterRow}>
          <View style={styles.dateBox}>
            <Text style={styles.dateLabel}>Tanggal:</Text>
            <TextInput
              style={styles.dateInput}
              value={selectedDate}
              onChangeText={setSelectedDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#94A3B8"
            />
          </View>

          {isAdmin ? (
            <View style={styles.outletFilterBox}>
              <Text style={styles.dateLabel}>Cabang:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <TouchableOpacity
                  style={[styles.outletChip, selectedOutletId === '' && styles.outletChipActive]}
                  onPress={() => setSelectedOutletId('')}
                >
                  <Text style={[styles.outletChipText, selectedOutletId === '' && styles.textWhite]}>Semua</Text>
                </TouchableOpacity>
                {outlets.map(o => (
                  <TouchableOpacity
                    key={o.id}
                    style={[styles.outletChip, selectedOutletId === String(o.id) && styles.outletChipActive]}
                    onPress={() => setSelectedOutletId(String(o.id))}
                  >
                    <Text style={[styles.outletChipText, selectedOutletId === String(o.id) && styles.textWhite]}>
                      {o.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          ) : null}
        </View>
      </View>

      {/* Calendar Grid View */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Memuat jadwal kalender...</Text>
        </View>
      ) : !calendarData || !calendarData.courts || calendarData.courts.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>📅</Text>
          <Text style={styles.emptyTitle}>Tidak Ada Data Kalender</Text>
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.horizontalScroll}>
          <View>
            
            {/* Table Header */}
            <View style={styles.tableHeaderRow}>
              <View style={styles.timeHeaderCell}>
                <Text style={styles.timeHeaderText}>JAM</Text>
              </View>
              {calendarData.courts.map(court => (
                <View key={court.id} style={styles.courtHeaderCell}>
                  <Text style={styles.courtHeaderText} numberOfLines={1}>{court.name}</Text>
                  <Text style={styles.courtSubText} numberOfLines={1}>{court.outlet_name || 'Outlet'}</Text>
                </View>
              ))}
            </View>

            {/* Table Rows */}
            <ScrollView style={styles.verticalScroll} showsVerticalScrollIndicator={true}>
              {(calendarData.grid || []).map((row, rIdx) => (
                <View key={rIdx} style={styles.tableBodyRow}>
                  <View style={styles.timeBodyCell}>
                    <Text style={styles.timeBodyText}>{row.time}</Text>
                  </View>

                  {calendarData.courts.map(court => {
                    const slot = row[court.id];
                    const isBooked = slot && (slot.status === 'Booked' || slot.customer_name);

                    return (
                      <View key={court.id} style={styles.slotBodyCell}>
                        {isBooked ? (
                          <TouchableOpacity
                            style={[
                              styles.bookedCard,
                              slot.booking_status === 'paid' ? styles.bookedCardPaid : styles.bookedCardUnpaid
                            ]}
                            onPress={() => setSelectedBooking({ ...slot, court_name: court.name, time: row.time })}
                            activeOpacity={0.8}
                          >
                            <Text style={styles.bookedName} numberOfLines={1}>
                              {slot.customer_name || 'Pemesan'}
                            </Text>
                            <Text style={styles.bookedCode}>{slot.booking_code}</Text>
                            <View style={styles.statusPill}>
                              <Text style={styles.statusPillText}>
                                {(slot.booking_status || 'PAID').toUpperCase()}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        ) : (
                          <View style={styles.availableCard}>
                            <Text style={styles.availableText}>TERSEDIA</Text>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              ))}
            </ScrollView>

          </View>
        </ScrollView>
      )}

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <Modal transparent animationType="fade" visible={true} onRequestClose={() => setSelectedBooking(null)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Detail Jadwal Booking</Text>
                <TouchableOpacity onPress={() => setSelectedBooking(null)}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Kode Booking:</Text>
                  <Text style={styles.modalValCode}>{selectedBooking.booking_code}</Text>
                </View>

                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Nama Pemesan:</Text>
                  <Text style={styles.modalVal}>{selectedBooking.customer_name}</Text>
                </View>

                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Lapangan:</Text>
                  <Text style={styles.modalVal}>{selectedBooking.court_name}</Text>
                </View>

                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Waktu:</Text>
                  <Text style={styles.modalVal}>{selectedBooking.time}</Text>
                </View>

                {/* Status Switcher Buttons */}
                <Text style={styles.statusSectionTitle}>UBAH STATUS BOOKING:</Text>
                <View style={styles.statusBtnGrid}>
                  <TouchableOpacity
                    style={[styles.statusOptionBtn, { backgroundColor: COLORS.sportGreenBg }]}
                    onPress={() => handleUpdateStatus(selectedBooking.id, 'paid')}
                  >
                    <Text style={{ color: COLORS.sportGreen, fontWeight: '800', fontSize: 11 }}>Paid (Lunas)</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.statusOptionBtn, { backgroundColor: COLORS.orangeBg }]}
                    onPress={() => handleUpdateStatus(selectedBooking.id, 'occupied')}
                  >
                    <Text style={{ color: COLORS.orange, fontWeight: '800', fontSize: 11 }}>Occupied (Main)</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.statusOptionBtn, { backgroundColor: COLORS.dangerBg }]}
                    onPress={() => handleUpdateStatus(selectedBooking.id, 'cancelled')}
                  >
                    <Text style={{ color: COLORS.danger, fontWeight: '800', fontSize: 11 }}>Cancelled</Text>
                  </TouchableOpacity>
                </View>

                {/* WA Chat & Delete */}
                {selectedBooking.customer_phone ? (
                  <TouchableOpacity
                    style={styles.waChatBtn}
                    onPress={() => handleWA(selectedBooking.customer_phone, selectedBooking.customer_name, selectedBooking.booking_code)}
                  >
                    <Text style={styles.waChatText}>💬 Chat WhatsApp Pelanggan</Text>
                  </TouchableOpacity>
                ) : null}

                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDeleteBooking(selectedBooking.id)}
                >
                  <Text style={styles.deleteBtnText}>🗑️ Hapus Permanen Booking</Text>
                </TouchableOpacity>

              </View>
            </View>
          </View>
        </Modal>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  filterTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.navy,
    marginBottom: 10,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  dateLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSlate,
    marginRight: 6,
  },
  dateInput: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.navy,
    minWidth: 100,
  },
  outletFilterBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  outletChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 6,
  },
  outletChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  outletChipText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.navy,
  },
  textWhite: {
    color: COLORS.white,
  },
  loadingBox: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 11,
    color: COLORS.textSlate,
  },
  emptyCard: {
    backgroundColor: COLORS.cardBg,
    padding: 30,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 6,
  },
  emptyTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.navy,
  },
  horizontalScroll: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.navy,
  },
  timeHeaderCell: {
    width: 60,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: COLORS.navyLight,
  },
  timeHeaderText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '900',
  },
  courtHeaderCell: {
    width: 140,
    padding: 10,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: COLORS.navyLight,
  },
  courtHeaderText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '900',
  },
  courtSubText: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '600',
  },
  verticalScroll: {
    maxHeight: 400,
  },
  tableBodyRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  timeBodyCell: {
    width: 60,
    padding: 10,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  timeBodyText: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.navy,
  },
  slotBodyCell: {
    width: 140,
    padding: 4,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
    justifyContent: 'center',
  },
  bookedCard: {
    borderRadius: 8,
    padding: 6,
    alignItems: 'center',
    borderWidth: 1,
  },
  bookedCardPaid: {
    backgroundColor: COLORS.primaryBg,
    borderColor: '#BFDBFE',
  },
  bookedCardUnpaid: {
    backgroundColor: COLORS.orangeBg,
    borderColor: '#FED7AA',
  },
  bookedName: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.navy,
  },
  bookedCode: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 1,
  },
  statusPill: {
    backgroundColor: COLORS.navy,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    marginTop: 3,
  },
  statusPillText: {
    color: COLORS.white,
    fontSize: 8,
    fontWeight: '900',
  },
  availableCard: {
    backgroundColor: COLORS.sportGreenBg,
    borderColor: COLORS.sportGreen,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  availableText: {
    color: COLORS.sportGreen,
    fontSize: 9,
    fontWeight: '900',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    backgroundColor: COLORS.navy,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '900',
  },
  modalClose: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '900',
  },
  modalBody: {
    padding: 16,
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  modalLabel: {
    fontSize: 11,
    color: COLORS.textSlate,
    fontWeight: '600',
  },
  modalVal: {
    fontSize: 11,
    color: COLORS.navy,
    fontWeight: '800',
  },
  modalValCode: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '900',
  },
  statusSectionTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.navy,
    marginTop: 12,
    marginBottom: 6,
  },
  statusBtnGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statusOptionBtn: {
    flex: 1,
    marginHorizontal: 2,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  waChatBtn: {
    backgroundColor: COLORS.sportGreen,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 6,
  },
  waChatText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '800',
  },
  deleteBtn: {
    backgroundColor: COLORS.dangerBg,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  deleteBtnText: {
    color: COLORS.danger,
    fontSize: 11,
    fontWeight: '800',
  }
});
