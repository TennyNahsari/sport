import React, { useState, useEffect } from 'react';
import { Activity, PlusCircle, Trash2 } from 'lucide-react';

export default function SportsTab() {
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const fetchSports = () => {
    setLoading(true);
    fetch('/api/sports')
      .then(res => res.json())
      .then(res => {
        if (res.success) setSports(res.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSports();
  }, []);

  const handleAddSport = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/sports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description })
      });
      const data = await res.json();
      if (data.success) {
        setName('');
        setDescription('');
        fetchSports();
      }
    } catch (e) {
      alert('Gagal menambah cabang olahraga');
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Form Add */}
        <div className="md:col-span-4 bg-white p-6 rounded-card border border-slate-200 shadow-sm h-fit">
          <h3 className="font-extrabold text-navy text-lg mb-4">Tambah Cabang Olahraga</h3>
          <form onSubmit={handleAddSport} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Olahraga *</label>
              <input
                type="text"
                required
                placeholder="Contoh: Squash"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border rounded-button font-medium"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Deskripsi Singkat</label>
              <textarea
                rows={3}
                placeholder="Penjelasan fasilitas..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border rounded-button font-medium"
              />
            </div>
            <button type="submit" className="w-full py-2.5 bg-primary text-white font-bold rounded-button">
              + TAMBAH OLAHRAGA
            </button>
          </form>
        </div>

        {/* List */}
        <div className="md:col-span-8 bg-white rounded-card border border-slate-200 shadow-sm p-6">
          <h3 className="font-extrabold text-navy text-lg mb-4">Kategori Olahraga Terdaftar</h3>
          <div className="space-y-3">
            {sports.map((s) => (
              <div key={s.id} className="p-4 rounded-button bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-navy text-sm">{s.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{s.description || 'Tidak ada deskripsi'}</p>
                </div>
                <span className="px-2.5 py-1 bg-blue-100 text-primary font-bold text-[10px] rounded uppercase">
                  Active Category
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
