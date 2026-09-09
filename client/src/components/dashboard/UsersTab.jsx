import React, { useState, useEffect } from 'react';
import { UserCog, PlusCircle, Edit3, Trash2, Search, Building2, ShieldCheck, UserCheck, ShieldAlert, CheckCircle2, XCircle, FileSpreadsheet, KeyRound, Lock, Users } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { exportToCsv } from '../../utils/excelExport';

export default function UsersTab({ currentAdminUser }) {
  const { t, lang } = useLanguage();
  const [users, setUsers] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [outletFilter, setOutletFilter] = useState('');

  // Form Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    role: 'operator',
    outlet_id: '',
    status: 'active'
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchUsersAndOutlets = async () => {
    setLoading(true);
    try {
      const [usersRes, outletsRes] = await Promise.all([
        fetch('/api/users').then(r => r.json()),
        fetch('/api/outlets').then(r => r.json())
      ]);

      if (usersRes.success) setUsers(usersRes.data);
      if (outletsRes.success) setOutlets(outletsRes.data);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersAndOutlets();
  }, []);

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      username: '',
      password: '',
      role: 'operator',
      outlet_id: outlets.length > 0 ? String(outlets[0].id) : '',
      status: 'active'
    });
    setErrorMsg('');
    setShowModal(true);
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      username: user.username || '',
      password: '', // leave blank if unchanged
      role: user.role || 'operator',
      outlet_id: user.outlet_id ? String(user.outlet_id) : '',
      status: user.status || 'active'
    });
    setErrorMsg('');
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSaving(true);

    try {
      if (!editingUser && !formData.password) {
        throw new Error(t('errPasswordRequired'));
      }

      if (formData.role === 'operator' && !formData.outlet_id) {
        throw new Error(t('errOperatorOutletRequired'));
      }

      const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users';
      const method = editingUser ? 'PUT' : 'POST';

      const payload = {
        name: formData.name,
        username: formData.username,
        role: formData.role,
        outlet_id: formData.role === 'admin' ? null : (formData.outlet_id ? parseInt(formData.outlet_id) : null),
        status: formData.status
      };

      if (formData.password && formData.password.trim()) {
        payload.password = formData.password.trim();
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || t('errSaveUser'));
      }

      setShowModal(false);
      fetchUsersAndOutlets();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user) => {
    if (user.id === 1) {
      alert(t('alertCannotDeleteSuperAdmin'));
      return;
    }

    const confirmMsg = lang === 'en'
      ? `Are you sure you want to delete user "${user.name}" (@${user.username})?`
      : `Apakah Anda yakin ingin menghapus user "${user.name}" (@${user.username})?`;

    if (!confirm(confirmMsg)) return;

    try {
      const res = await fetch(`/api/users/${user.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchUsersAndOutlets();
      } else {
        alert(data.message || t('errDeleteUser'));
      }
    } catch (err) {
      alert((lang === 'en' ? 'Failed to delete user: ' : 'Gagal menghapus user: ') + err.message);
    }
  };

  const handleExportExcel = () => {
    const headers = {
      id: t('excelUserId'),
      name: t('excelFullName'),
      username: t('excelUsername'),
      role: t('excelRole'),
      outlet_name: t('excelOutletName'),
      status: t('excelStatus'),
      created_at: t('excelCreatedAt')
    };
    const todayStr = new Date().toISOString().split('T')[0];
    exportToCsv(`Report_Users_${todayStr}`, filteredUsers, headers);
  };

  const filteredUsers = users.filter((u) => {
    const matchSearch = !searchQuery || 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.outlet_name && u.outlet_name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchRole = !roleFilter || u.role === roleFilter;
    const matchOutlet = !outletFilter || String(u.outlet_id) === String(outletFilter);
    return matchSearch && matchRole && matchOutlet;
  });

  // Stat Counters
  const totalUsers = users.length;
  const adminUsers = users.filter(u => u.role === 'admin').length;
  const operatorUsers = users.filter(u => u.role === 'operator').length;
  const activeUsers = users.filter(u => (u.status || 'active').toLowerCase() === 'active').length;

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="bg-white p-4 sm:p-5 rounded-card border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <UserCog className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-extrabold text-navy">{t('usersMgmtTitle')}</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{t('usersMgmtSub')}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={handleExportExcel}
            className="py-2 px-3.5 bg-sportgreen hover:bg-sportgreen-hover text-white text-xs font-bold rounded-button shadow-md flex items-center space-x-1.5 transition-all shrink-0"
            title={t('exportUsersTitle')}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{t('exportExcel')}</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="py-2 px-3.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-button shadow-md flex items-center space-x-1.5 transition-all shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('addStaffBtn')}</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-card border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase">{t('totalUsersLabel')}</span>
            <h4 className="text-2xl font-extrabold text-navy mt-1">{totalUsers}</h4>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-50 text-primary flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-card border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase">{t('superAdminLabel')}</span>
            <h4 className="text-2xl font-extrabold text-primary mt-1">{adminUsers}</h4>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-100 text-primary flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-card border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase">{t('operatorOutletLabel')}</span>
            <h4 className="text-2xl font-extrabold text-orange mt-1">{operatorUsers}</h4>
          </div>
          <div className="w-10 h-10 rounded-full bg-orange-light text-orange flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-card border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase">{t('activeAccountsLabel')}</span>
            <h4 className="text-2xl font-extrabold text-sportgreen mt-1">{activeUsers}</h4>
          </div>
          <div className="w-10 h-10 rounded-full bg-sportgreen-light text-sportgreen flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-3.5 sm:p-4 rounded-card border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={t('searchUsersPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-button text-xs font-semibold text-navy focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-button text-xs font-bold text-navy focus:outline-none cursor-pointer"
          >
            <option value="">{t('allRoles')}</option>
            <option value="admin">{t('roleSuperAdmin')}</option>
            <option value="operator">{t('roleOperatorOutlet')}</option>
          </select>

          {/* Outlet Filter */}
          <select
            value={outletFilter}
            onChange={(e) => setOutletFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-button text-xs font-bold text-navy focus:outline-none cursor-pointer"
          >
            <option value="">{t('allBranches')}</option>
            {outlets.map(o => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
        </div>

        <span className="text-xs font-semibold text-slate-500 self-end sm:self-auto">
          {filteredUsers.length} {t('registeredStaff')}
        </span>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-card border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="p-3.5 pl-5">{t('colStaffName')}</th>
                <th className="p-3.5">{t('colRole')}</th>
                <th className="p-3.5">{t('colAssignedOutlet')}</th>
                <th className="p-3.5">{t('colStatus')}</th>
                <th className="p-3.5">{t('colCreatedAt')}</th>
                <th className="p-3.5 pr-5 text-right">{t('colActions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500 font-bold">{t('loadingUsers')}</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400">{t('noUsersFound')}</td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 pl-5">
                      <div className="flex items-center space-x-2.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-xs shrink-0 ${
                          user.role === 'admin' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <p className="font-extrabold text-navy text-xs">{user.name}</p>
                          <p className="text-[11px] text-slate-400 font-mono">@{user.username}</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded text-[10px] font-extrabold uppercase ${
                        user.role === 'admin'
                          ? 'bg-primary/10 text-primary border border-primary/20'
                          : 'bg-orange-light text-orange border border-orange/20'
                      }`}>
                        {user.role === 'admin' ? <ShieldCheck className="w-3 h-3" /> : <Building2 className="w-3 h-3" />}
                        <span>{user.role === 'admin' ? t('superAdminLabel') : t('operatorOutletLabel')}</span>
                      </span>
                    </td>

                    <td className="p-3.5">
                      {user.role === 'admin' ? (
                        <span className="text-slate-400 font-medium text-[11px] italic">{t('allBranchesFullAccess')}</span>
                      ) : user.outlet_name ? (
                        <div className="inline-flex items-center space-x-1 text-navy font-bold text-[11px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          <Building2 className="w-3 h-3 text-primary shrink-0" />
                          <span>{user.outlet_name}</span>
                        </div>
                      ) : (
                        <span className="text-amber-600 font-bold text-[11px] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          {t('unassignedRole')}
                        </span>
                      )}
                    </td>

                    <td className="p-3.5">
                      <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        (user.status || 'active').toLowerCase() === 'active'
                          ? 'bg-sportgreen-light text-sportgreen'
                          : 'bg-red-50 text-red-600'
                      }`}>
                        {(user.status || 'active').toLowerCase() === 'active' ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{t('statusActive')}</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" />
                            <span>{t('statusInactive')}</span>
                          </>
                        )}
                      </span>
                    </td>

                    <td className="p-3.5 text-slate-500 font-mono text-[11px]">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString(lang === 'en' ? 'en-US' : 'id-ID') : '-'}
                    </td>

                    <td className="p-3.5 pr-5 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => handleOpenEdit(user)}
                          className="p-1.5 rounded-button bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                          title={t('editUserTooltip')}
                        >
                          <Edit3 className="w-3.5 h-3.5 text-primary" />
                        </button>
                        {user.id !== 1 && (
                          <button
                            onClick={() => handleDelete(user)}
                            className="p-1.5 rounded-button bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                            title={t('deleteUserTooltip')}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/80 backdrop-blur-sm">
          <div className="bg-white rounded-card shadow-2xl max-w-md w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar border border-slate-200">
            <div className="flex items-center space-x-2 border-b pb-3">
              <UserCog className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-extrabold text-navy">
                {editingUser ? t('editStaffTitle') : t('addStaffTitle')}
              </h3>
            </div>

            {errorMsg && (
              <div className="p-3 rounded bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('labelFullNameStaff')}</label>
                <input
                  type="text"
                  required
                  placeholder={t('phFullNameStaff')}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-button font-bold text-navy focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('labelUsernameLogin')}</label>
                <input
                  type="text"
                  required
                  placeholder={t('phUsernameLogin')}
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-button font-mono font-bold text-navy focus:ring-2 focus:ring-primary focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">{t('helpUsername')}</span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {editingUser ? t('labelNewPassword') : t('labelAccountPassword')}
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    placeholder={editingUser ? t('phKeepPassword') : t('phMin6Chars')}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-button font-medium text-navy focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Role Selector */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('labelRoleAccess')}</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  disabled={editingUser && editingUser.id === 1}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-button font-bold text-navy focus:ring-2 focus:ring-primary focus:outline-none disabled:opacity-60"
                >
                  <option value="operator">{t('optOperator')}</option>
                  <option value="admin">{t('optAdmin')}</option>
                </select>
              </div>

              {/* Assigned Outlet Selector (Only for Operator) */}
              {formData.role === 'operator' && (
                <div className="bg-blue-50/60 p-3 rounded-button border border-blue-100 space-y-1.5">
                  <label className="block font-bold text-navy text-[11px] flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-primary" />
                    <span>{t('labelAssignOutlet')}</span>
                  </label>
                  <select
                    required
                    value={formData.outlet_id}
                    onChange={(e) => setFormData({ ...formData, outlet_id: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-button font-bold text-navy focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    <option value="">{t('optSelectOutlet')}</option>
                    {outlets.map(o => (
                      <option key={o.id} value={o.id}>{o.name} ({o.address})</option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-500 leading-tight">
                    {t('helpOutletAssign')}
                  </p>
                </div>
              )}

              {/* Status Selector */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('labelAccountStatus')}</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  disabled={editingUser && editingUser.id === 1}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-button font-bold text-navy focus:ring-2 focus:ring-primary focus:outline-none disabled:opacity-60"
                >
                  <option value="active">{t('optActive')}</option>
                  <option value="inactive">{t('optInactive')}</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 font-bold rounded-button text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  {t('btnCancel')}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-primary hover:bg-primary-hover text-white font-extrabold rounded-button shadow-md disabled:opacity-50 transition-all"
                >
                  {saving ? t('savingMsg') : (editingUser ? t('btnSaveChanges') : t('btnCreateUser'))}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
