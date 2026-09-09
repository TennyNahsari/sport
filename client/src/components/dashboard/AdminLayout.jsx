import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, CalendarCheck, CalendarDays, ShieldAlert,
  Trophy, Activity, Users, CreditCard, BarChart3, UserCog, Settings,
  PlusCircle, ExternalLink, Menu, X, Globe, LogOut, ShieldCheck, Lock, Building2
} from 'lucide-react';

import OverviewTab from './OverviewTab';
import BookingsTab from './BookingsTab';
import CalendarTab from './CalendarTab';
import OutletsTab from './OutletsTab';
import CourtsTab from './CourtsTab';
import SportsTab from './SportsTab';
import CustomersTab from './CustomersTab';
import ReportsTab from './ReportsTab';
import UsersTab from './UsersTab';
import SettingsTab from './SettingsTab';
import ManualBookingModal from './ManualBookingModal';
import AdminLoginModal from './AdminLoginModal';
import { useLanguage } from '../../i18n/LanguageContext';

export default function AdminLayout({ onSwitchToCustomer }) {
  const { lang, setLang, t } = useLanguage();

  // Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('sportbook_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [showManualBooking, setShowManualBooking] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const toggleLanguage = () => {
    setLang(lang === 'id' ? 'en' : 'id');
  };

  const handleLogout = () => {
    localStorage.removeItem('sportbook_user');
    setCurrentUser(null);
  };

  const menuItems = [
    { id: 'dashboard', label: t('navDashboard'), icon: LayoutDashboard },
    { id: 'calendar', label: t('navCalendar'), icon: CalendarDays },
    { id: 'outlets', label: t('navOutlets'), icon: Building2, adminOnly: true },
    { id: 'courts', label: t('navCourts'), icon: ShieldAlert },
    { id: 'sports', label: t('navSports'), icon: Activity, adminOnly: true },
    { id: 'customers', label: t('navCustomers'), icon: Users },
    { id: 'bookings', label: t('navBookings'), icon: CalendarCheck },
    { id: 'payments', label: t('navPayments'), icon: CreditCard },
    { id: 'reports', label: t('navReports'), icon: BarChart3 },
    { id: 'users', label: t('navUsers'), icon: UserCog, adminOnly: true },
    { id: 'settings', label: t('navSettings'), icon: Settings, adminOnly: true },
  ];

  // If NOT logged in, show Login Gate Modal
  if (!currentUser) {
    return (
      <AdminLoginModal
        onLoginSuccess={(user) => setCurrentUser(user)}
        onCancelReturnHome={onSwitchToCustomer}
      />
    );
  }

  const isAdmin = (currentUser.role || '').toLowerCase() === 'admin';

  return (
    <div className="min-h-screen bg-surface flex flex-col md:flex-row font-sans text-navy">
      
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex w-64 bg-navy text-slate-300 flex-shrink-0 border-r border-slate-800 flex-col justify-between">
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-white">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-extrabold text-white text-lg leading-tight">Sport<span className="text-primary">Book</span></h1>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t('adminTitle')}</span>
              </div>
            </div>
          </div>

          {/* User Profile Badge */}
          <div className="p-4 border-b border-slate-800 bg-slate-900/60">
            <div className="flex items-center justify-between text-xs">
              <div className="min-w-0 pr-2">
                <span className="font-extrabold text-white block truncate">{currentUser.name}</span>
                <span className="text-[10px] text-slate-400 font-mono block">@{currentUser.username}</span>
                {currentUser.outlet_name && (
                  <span className="text-[10px] text-primary-light font-bold flex items-center gap-1 mt-0.5 truncate">
                    <Building2 className="w-3 h-3 shrink-0" />
                    <span className="truncate">{currentUser.outlet_name}</span>
                  </span>
                )}
              </div>
              <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase shrink-0 ${
                isAdmin ? 'bg-primary text-white' : 'bg-orange text-white'
              }`}>
                {currentUser.role || 'OPERATOR'}
              </span>
            </div>
          </div>

          {/* Quick Action Button for Manual Staff Booking */}
          <div className="p-4">
            <button
              onClick={() => setShowManualBooking(true)}
              className="w-full py-2.5 px-4 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-button shadow-md flex items-center justify-center space-x-2 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('btnManualStaff')}</span>
            </button>
          </div>

          {/* Nav Items List */}
          <nav className="px-3 space-y-1 py-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-button text-xs font-bold transition-colors ${
                    isActive 
                      ? 'bg-primary text-white shadow-md' 
                      : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.adminOnly && !isAdmin && (
                    <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" title="Khusus Super Admin" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer & Logout */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <button
            onClick={onSwitchToCustomer}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-button bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-sportgreen" />
            <span>{t('btnViewMainWeb')}</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-button bg-red-950/40 hover:bg-red-900/60 text-red-300 text-xs font-bold border border-red-900/40 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout Staff ({currentUser.username})</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Header Bar */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="md:hidden p-2 rounded-button bg-slate-100 text-navy"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-navy capitalize">
                {menuItems.find(m => m.id === activeTab)?.label || t('navDashboard')}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium hidden sm:block">
                {currentUser.outlet_name ? `Cabang Terikat: ${currentUser.outlet_name}` : 'Sports Venue Management Console (Super Admin)'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            
            {/* User Badge Top Header */}
            <div className="hidden sm:flex items-center space-x-2 bg-slate-100 px-3 py-1.5 rounded-full text-xs font-bold text-navy">
              <span className="w-2.5 h-2.5 rounded-full bg-sportgreen animate-pulse" />
              <span>{currentUser.name}</span>
              {currentUser.outlet_name && (
                <span className="text-primary font-mono text-[11px]">({currentUser.outlet_name})</span>
              )}
              <span className="px-2 py-0.2 rounded text-[10px] uppercase font-extrabold bg-navy text-white">
                {currentUser.role}
              </span>
            </div>

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-button bg-slate-100 hover:bg-slate-200 text-xs font-bold text-navy border border-slate-200 uppercase"
            >
              <Globe className="w-3.5 h-3.5 text-primary" />
              <span>{lang === 'id' ? '🇮🇩 ID' : '🇬🇧 EN'}</span>
            </button>

            <button
              onClick={handleLogout}
              className="p-2 sm:px-3 sm:py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-button flex items-center space-x-1 border border-red-200"
              title="Logout Staff"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Mobile Sidebar Overlay Drawer */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 bg-navy/80 backdrop-blur-sm flex">
            <div className="w-64 bg-navy text-slate-300 h-full p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-5 h-5 text-primary" />
                    <span className="font-extrabold text-white text-base">SportBook</span>
                  </div>
                  <button onClick={() => setMobileSidebarOpen(false)} className="text-slate-400">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="mb-3 p-2.5 rounded bg-slate-800 text-xs">
                  <div className="font-extrabold text-white">{currentUser.name}</div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Role: {currentUser.role}</div>
                  {currentUser.outlet_name && (
                    <div className="text-[10px] text-primary-light font-bold mt-0.5">{currentUser.outlet_name}</div>
                  )}
                </div>

                <nav className="space-y-1">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => { setActiveTab(item.id); setMobileSidebarOpen(false); }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-button text-xs font-bold ${
                          activeTab === item.id ? 'bg-primary text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </div>
                        {item.adminOnly && !isAdmin && (
                          <Lock className="w-3.5 h-3.5 text-slate-500" />
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => { setMobileSidebarOpen(false); onSwitchToCustomer(); }}
                  className="w-full py-2 bg-slate-800 text-slate-200 text-xs font-bold rounded-button flex items-center justify-center space-x-2"
                >
                  <ExternalLink className="w-4 h-4 text-sportgreen" />
                  <span>{t('btnViewMainWeb')}</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full py-2 bg-red-900/60 text-red-200 text-xs font-bold rounded-button flex items-center justify-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
            <div className="flex-1" onClick={() => setMobileSidebarOpen(false)} />
          </div>
        )}

        {/* Content Views */}
        <div className="p-4 sm:p-6">
          {activeTab === 'dashboard' && <OverviewTab currentUser={currentUser} onOpenManualBooking={() => setShowManualBooking(true)} />}
          {activeTab === 'bookings' && <BookingsTab currentUser={currentUser} onOpenManualBooking={() => setShowManualBooking(true)} />}
          {activeTab === 'calendar' && <CalendarTab currentUser={currentUser} />}
          {activeTab === 'courts' && <CourtsTab currentUser={currentUser} />}
          {activeTab === 'customers' && <CustomersTab currentUser={currentUser} />}
          {activeTab === 'payments' && <BookingsTab currentUser={currentUser} filterPaymentOnly={true} />}
          {activeTab === 'reports' && <ReportsTab currentUser={currentUser} />}

          {/* Admin Only: Manage Outlets */}
          {activeTab === 'outlets' && (
            isAdmin ? (
              <OutletsTab />
            ) : (
              <div className="bg-white p-8 rounded-card border border-amber-200 text-center space-y-3">
                <Lock className="w-12 h-12 text-amber-500 mx-auto" />
                <h3 className="text-lg font-extrabold text-navy">Akses Terbatas: Khusus Super Admin</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Menu <strong>Manage Outlets</strong> hanya dapat dikelola oleh level <strong>Super Admin</strong>. Akun Anda (@{currentUser.username}) berstatus Operator Cabang ({currentUser.outlet_name || 'Outlet'}).
                </p>
              </div>
            )
          )}

          {/* Admin Only: Manage Sports */}
          {activeTab === 'sports' && (
            isAdmin ? (
              <SportsTab />
            ) : (
              <div className="bg-white p-8 rounded-card border border-amber-200 text-center space-y-3">
                <Lock className="w-12 h-12 text-amber-500 mx-auto" />
                <h3 className="text-lg font-extrabold text-navy">Akses Terbatas: Khusus Super Admin</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Menu <strong>Manage Sports</strong> hanya dapat dikelola oleh level <strong>Super Admin</strong>.
                </p>
              </div>
            )
          )}

          {/* Admin Only: Manage Users */}
          {activeTab === 'users' && (
            isAdmin ? (
              <UsersTab currentAdminUser={currentUser} />
            ) : (
              <div className="bg-white p-8 rounded-card border border-amber-200 text-center space-y-3">
                <Lock className="w-12 h-12 text-amber-500 mx-auto" />
                <h3 className="text-lg font-extrabold text-navy">Akses Terbatas: Khusus Super Admin</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Menu <strong>Manage Users</strong> hanya dapat diakses dan dikelola oleh level <strong>Super Admin</strong>.
                </p>
              </div>
            )
          )}

          {/* Admin Only: Settings */}
          {activeTab === 'settings' && (
            isAdmin ? (
              <SettingsTab />
            ) : (
              <div className="bg-white p-8 rounded-card border border-amber-200 text-center space-y-3">
                <Lock className="w-12 h-12 text-amber-500 mx-auto" />
                <h3 className="text-lg font-extrabold text-navy">Akses Terbatas: Khusus Super Admin</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Pengaturan venue dan rekening pembayaran hanya dapat diubah oleh level <strong>Super Admin</strong>.
                </p>
              </div>
            )
          )}
        </div>

      </main>

      {/* Manual Booking Modal */}
      {showManualBooking && (
        <ManualBookingModal currentUser={currentUser} onClose={() => setShowManualBooking(false)} />
      )}

    </div>
  );
}
