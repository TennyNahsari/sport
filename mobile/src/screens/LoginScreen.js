import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SHADOWS } from '../constants/theme';
import { api } from '../services/api';

export default function LoginScreen({ onLoginSuccess, onReturnToLanding }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Username dan password wajib diisi.');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    const res = await api.login(username.trim(), password.trim());
    setLoading(false);

    if (res.success) {
      await AsyncStorage.setItem('sportbook_user', JSON.stringify(res.data));
      if (onLoginSuccess) onLoginSuccess(res.data);
    } else {
      setErrorMsg(res.message || 'Login gagal. Periksa username dan password.');
    }
  };

  const handleQuickDemo = (demoUser, demoPass) => {
    setUsername(demoUser);
    setPassword(demoPass);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        
        {/* Brand Header */}
        <View style={styles.brandHeader}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoIcon}>🏆</Text>
          </View>
          <Text style={styles.brandTitle}>
            Sport<Text style={styles.brandHighlight}>Book</Text>
          </Text>
          <Text style={styles.brandSub}>STAFF MANAGEMENT CONSOLE</Text>
        </View>

        <View style={styles.formBody}>
          <Text style={styles.loginTitle}>Login Pengelola Venue</Text>
          <Text style={styles.loginSub}>
            Masukkan akun kredensial Anda untuk mengakses dashboard manajemen.
          </Text>

          {errorMsg ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {errorMsg}</Text>
            </View>
          ) : null}

          {/* Username Input */}
          <Text style={styles.label}>Username Staff</Text>
          <TextInput
            style={styles.input}
            placeholder="Masukkan username..."
            placeholderTextColor="#94A3B8"
            autoCapitalize="none"
            value={username}
            onChangeText={setUsername}
          />

          {/* Password Input */}
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Masukkan password..."
            placeholderTextColor="#94A3B8"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {/* Login Button */}
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.loginBtnText}>Masuk Ke Dashboard →</Text>
            )}
          </TouchableOpacity>

          {/* Quick Demo Accounts */}
          <View style={styles.demoSection}>
            <Text style={styles.demoTitle}>💡 QUICK DEMO ACCOUNTS</Text>
            <View style={styles.demoGrid}>
              
              <TouchableOpacity
                style={styles.demoBtnAdmin}
                onPress={() => handleQuickDemo('admin', 'admin123')}
                activeOpacity={0.7}
              >
                <Text style={styles.demoRoleAdmin}>SUPER ADMIN</Text>
                <Text style={styles.demoUserText}>admin / admin123</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.demoBtnOperator}
                onPress={() => handleQuickDemo('operator', 'op123')}
                activeOpacity={0.7}
              >
                <Text style={styles.demoRoleOperator}>OPERATOR</Text>
                <Text style={styles.demoUserText}>operator / op123</Text>
              </TouchableOpacity>

            </View>
          </View>

          {/* Return button */}
          <TouchableOpacity
            style={styles.returnBtn}
            onPress={onReturnToLanding}
          >
            <Text style={styles.returnBtnText}>← Kembali ke Halaman Utama Customer</Text>
          </TouchableOpacity>

        </View>

      </View>
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
    paddingTop: 30,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.medium,
  },
  brandHeader: {
    backgroundColor: COLORS.navy,
    padding: 24,
    alignItems: 'center',
  },
  logoBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoIcon: {
    fontSize: 22,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.white,
  },
  brandHighlight: {
    color: COLORS.primaryLight,
  },
  brandSub: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.sportGreen,
    letterSpacing: 1,
    marginTop: 2,
  },
  formBody: {
    padding: 20,
  },
  loginTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.navy,
  },
  loginSub: {
    fontSize: 11,
    color: COLORS.textSlate,
    marginTop: 2,
    marginBottom: 16,
  },
  errorBox: {
    backgroundColor: COLORS.dangerBg,
    borderColor: COLORS.danger,
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 11,
    fontWeight: '700',
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.navy,
    marginBottom: 6,
    marginTop: 6,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: COLORS.navy,
    fontWeight: '600',
    marginBottom: 4,
  },
  loginBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    ...SHADOWS.small,
  },
  loginBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '900',
  },
  demoSection: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  demoTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.textSlate,
    textAlign: 'center',
    marginBottom: 10,
  },
  demoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  demoBtnAdmin: {
    flex: 1,
    marginRight: 6,
    backgroundColor: COLORS.primaryBg,
    borderColor: '#BFDBFE',
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
  },
  demoRoleAdmin: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.primary,
  },
  demoBtnOperator: {
    flex: 1,
    marginLeft: 6,
    backgroundColor: COLORS.orangeBg,
    borderColor: '#FED7AA',
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
  },
  demoRoleOperator: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.orange,
  },
  demoUserText: {
    fontSize: 9,
    color: COLORS.textSlate,
    fontWeight: '700',
    marginTop: 2,
  },
  returnBtn: {
    alignItems: 'center',
    marginTop: 18,
  },
  returnBtnText: {
    fontSize: 11,
    color: COLORS.textSlate,
    fontWeight: '700',
    textDecorationLine: 'underline',
  }
});
