import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const API = '';

/* ── MODAL FORM ─────────────────────────────── */
function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md" style={{ background: 'rgba(0,0,0,0.8)' }}>
      <div className="w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl overflow-hidden glass-depth" style={{ background: '#0e101a', border: '1px solid rgba(0,180,216,0.2)', boxShadow: '0 0 40px rgba(0,0,0,0.5), inset 0 0 20px rgba(0,180,216,0.05)' }}>
        <div className="flex items-center justify-between px-6 py-5 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'linear-gradient(90deg, rgba(0,180,216,0.05), transparent)' }}>
          <span className="text-white font-bold text-[16px] tracking-tight">{title}</span>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all text-[18px]">✕</button>
        </div>
        <div className="overflow-y-auto p-6 flex-1 stylish-scroll">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, name, value, onChange, type = 'text', placeholder = '' }) {
  const isTextarea = type === 'textarea';
  return (
    <div className="mb-5 group">
      <label className="block text-[10px] font-bold mb-2 uppercase tracking-[0.15em] transition-colors group-focus-within:text-[#00b4d8]" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</label>
      {isTextarea
        ? <textarea name={name} value={value} onChange={onChange} placeholder={placeholder} rows={3}
            className="w-full rounded-xl px-4 py-3 text-[13px] text-white outline-none resize-none transition-all focus:border-[#00b4d8]/50"
            style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff' }} />
        : <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder}
            className="w-full rounded-xl px-4 py-3 text-[13px] text-white outline-none transition-all focus:border-[#00b4d8]/50"
            style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff' }} />
      }
    </div>
  );
}

function FileField({ label, onUpload, currentUrl }) {
  const [loading, setLoading] = useState(false);
  const inputId = React.useRef(`file-upload-${Math.random().toString(36).slice(2)}`).current;
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const { data } = await axios.post(`${API}/api/upload`, formData);
      onUpload(data.url);
    } catch (e) { alert('Upload gagal: ' + e.message); }
    finally { setLoading(false); }
  };
  return (
    <div className="mb-5">
      {label ? <label className="block text-[10px] font-bold mb-2 uppercase tracking-[0.15em]" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</label> : null}
      <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
        {currentUrl ? (
          <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/10 flex-shrink-0">
            <img src={currentUrl} className="w-full h-full object-cover" alt="Preview" onError={(e) => e.target.src='/images/profile2.png'} />
          </div>
        ) : (
          <div className="w-12 h-12 rounded-lg bg-white/5 border border-dashed border-white/20 flex items-center justify-center text-lg">🖼️</div>
        )}
        <div className="flex-1 min-w-0">
           <input type="file" onChange={handleFileChange} className="hidden" id={inputId} />
           <label htmlFor={inputId} className="inline-block px-4 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer transition-all" 
             style={{ background: loading ? '#333' : 'rgba(0,180,216,0.1)', color: '#00b4d8', border: '1px solid rgba(0,180,216,0.2)' }}>
             {loading ? 'MODULATING...' : 'PILIH FILE'}
           </label>
           <p className="text-[10px] text-gray-500 mt-1 truncate">{currentUrl ? currentUrl.split('/').pop() : 'Belum ada file dipilih'}</p>
        </div>
      </div>
    </div>
  );
}

/* ── TABLE WRAPPER ──────────────────────────── */
function CrudTable({ columns, data, onEdit, onDelete, emptyMsg }) {
  if (!data.length) return (
    <div className="text-center py-20" style={{ color: '#333' }}>
      <div style={{ fontSize: '48px', marginBottom: '12px', opacity: 0.3 }}>📭</div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', letterSpacing: '0.2em', color: '#444', textTransform: 'uppercase' }}>{emptyMsg || 'Belum ada data.'}</div>
    </div>
  );
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
        <thead>
          <tr style={{ background: 'rgba(0,0,0,0.4)' }}>
            {columns.map(c => (
              <th key={c.key} style={{ textAlign: 'left', padding: '14px 18px', fontWeight: 800, fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', borderBottom: '1px solid rgba(255,255,255,0.05)', whiteSpace: 'nowrap' }}>{c.label}</th>
            ))}
            <th style={{ padding: '14px 18px', textAlign: 'right', fontWeight: 800, fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={row.id}
              style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', background: i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent', transition: 'background 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,180,216,0.04)'}
              onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent'}
            >
              {columns.map(c => (
                <td key={c.key} style={{ padding: '14px 18px', color: c.highlight ? '#00b4d8' : 'rgba(255,255,255,0.65)', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', verticalAlign: 'middle' }} title={typeof row[c.key] === 'string' ? row[c.key] : ''}>
                  {c.render ? c.render(row[c.key], row) : (row[c.key] || <span style={{ color: '#333' }}>—</span>)}
                </td>
              ))}
              <td style={{ padding: '14px 18px', textAlign: 'right', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                <button onClick={() => onEdit(row)}
                  style={{ fontSize: '11px', padding: '5px 14px', borderRadius: '8px', marginRight: '8px', background: 'rgba(0,180,216,0.1)', color: '#00b4d8', border: '1px solid rgba(0,180,216,0.2)', cursor: 'pointer', fontWeight: 700, letterSpacing: '0.05em', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,180,216,0.25)'; e.currentTarget.style.borderColor = '#00b4d8'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,180,216,0.1)'; e.currentTarget.style.borderColor = 'rgba(0,180,216,0.2)'; }}
                >✏ Edit</button>
                <button onClick={() => onDelete(row.id)}
                  style={{ fontSize: '11px', padding: '5px 14px', borderRadius: '8px', background: 'rgba(230,57,70,0.1)', color: '#e63946', border: '1px solid rgba(230,57,70,0.2)', cursor: 'pointer', fontWeight: 700, letterSpacing: '0.05em', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(230,57,70,0.25)'; e.currentTarget.style.borderColor = '#e63946'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(230,57,70,0.1)'; e.currentTarget.style.borderColor = 'rgba(230,57,70,0.2)'; }}
                >🗑 Hapus</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── CONFIRM DIALOG ─────────────────────────── */
function ConfirmDelete({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div className="rounded-xl p-6 w-80" style={{ background: '#1a1d2e', border: '1px solid #2a2d3e' }}>
        <div className="text-white font-semibold text-[15px] mb-2">Konfirmasi Hapus</div>
        <div className="text-[13px] mb-5" style={{ color: '#888' }}>Data ini akan dihapus permanen dan tidak bisa dikembalikan.</div>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-1.5 rounded-lg text-[13px] transition-colors" style={{ background: '#2a2d3e', color: '#aaa' }}>Batal</button>
          <button onClick={onConfirm} className="px-4 py-1.5 rounded-lg text-[13px] transition-colors" style={{ background: '#e63946', color: '#fff' }}>Hapus</button>
        </div>
      </div>
    </div>
  );
}

/* ── NAV ────────────────────────────────────── */
const NAV = [
  { id: 'dashboard', icon: '⊞', label: 'Dashboard' },
  { id: 'projects',  icon: '📁', label: 'Projects' },
  { id: 'skills',    icon: '⚡', label: 'Skills' },
  { id: 'certs',     icon: '🏆', label: 'Certifications' },
  { id: 'experiences',icon: '🌟', label: 'My Experience' },
  { id: 'messages',  icon: '✉️', label: 'Messages' },
  { id: 'osint_logs',icon: '🎯', label: 'OSINT Logs' },
  { id: 'logs',      icon: '📡', label: 'Visitor Logs' },
  { id: 'firefox_map', icon: '🌍', label: 'Firefox Map' },
];

function Sidebar({ active, setActive, onLogout }) {
  return (
    <aside className="w-[240px] flex-shrink-0 h-full flex flex-col" style={{ background: '#080a12', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="flex items-center gap-4 px-6 py-8">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black shadow-[0_0_15px_rgba(0,180,216,0.3)]" 
             style={{ background: 'linear-gradient(135deg,#00b4d8,#7000ff)', color: '#fff' }}>H</div>
        <div>
          <div className="text-white text-[15px] font-black tracking-tight">Kholis.OS</div>
          <div className="flex items-center gap-1.5 mt-0.5">
             <div className="w-1.5 h-1.5 rounded-full bg-[#00ff88]"></div>
             <span className="text-[9px] uppercase font-bold tracking-widest text-gray-500">Kernel Active</span>
          </div>
        </div>
      </div>
      <nav className="flex-1 py-4 px-4 flex flex-col gap-1.5">
        {NAV.map(n => {
          const isActive = active === n.id;
          return (
            <button key={n.id} onClick={() => setActive(n.id)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-[13px] text-left transition-all duration-300 relative overflow-hidden group`}
              style={{ 
                background: isActive ? 'linear-gradient(90deg, rgba(0,180,216,0.1), transparent)' : 'transparent', 
                color: isActive ? '#00b4d8' : 'rgba(255,255,255,0.4)'
              }}>
              {isActive && <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#00b4d8] shadow-[0_0_10px_#00b4d8]"></div>}
              <span className={`text-[16px] transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110 opacity-70'}`}>{n.icon}</span>
              <span className={`font-bold tracking-tight uppercase ${isActive ? 'text-[12px]' : 'text-[11px] opacity-70 group-hover:opacity-100 group-hover:text-white'}`}>{n.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="p-6">
        <button onClick={onLogout} className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all hover:gap-5" 
                style={{ color: '#fff', background: 'linear-gradient(135deg, #e63946, #b02e38)', boxShadow: '0 4px 15px rgba(230,57,70,0.2)' }}>
          LOGOUT <span className="rotate-180">⎋</span>
        </button>
      </div>
    </aside>
  );
}

function Topbar({ title, count, onAdd }) {
  const now = new Date();
  return (
    <header className="h-[70px] flex items-center justify-between px-8 flex-shrink-0" style={{ background: '#0e101a', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="flex items-center gap-6">
        <div>
          <h1 className="text-white font-black text-[20px] tracking-tight leading-none mb-1">{title}</h1>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#444]">
             <span>SYSTEM</span>
             <span className="opacity-30">/</span>
             <span className="text-gray-500">{now.toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'numeric' })}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 px-4 py-2 rounded-full border border-white/5" style={{ background: 'rgba(0,0,0,0.2)' }}>
          <div className="w-2 h-2 rounded-full bg-[#00ff88] shadow-[0_0_8px_#00ff88] animate-pulse"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Node Secure</span>
        </div>
        {onAdd && (
          <button onClick={onAdd} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all transform hover:scale-105 active:scale-95" 
                  style={{ background: 'linear-gradient(135deg, #00b4d8, #0077b6)', color: '#fff', boxShadow: '0 4px 15px rgba(0,180,216,0.3)' }}>
            ＋ ADD NEW
          </button>
        )}
      </div>
    </header>
  );
}

/* ── FOX MAP ────────────────────────────────── */
function LogMap({ logs }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  // Filter logs specifically from Firefox ESR
  const trackedEntities = logs.filter(l => l.user_agent && l.user_agent.includes('[FIREFOX_OSINT]'));
  // All points with coordinates for the map
  const points = logs.filter(l => Number(l.lat) != 0 && Number(l.lon) != 0);

  useEffect(() => {
    if (!mapRef.current) return;
    
    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current, {
        center: [-2, 118], 
        zoom: 5,
        zoomControl: true
      });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OSINT OS'
      }).addTo(mapInstance.current);
      
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });
    }

    const map = mapInstance.current;
    map.eachLayer(l => { if (l instanceof L.Marker) map.removeLayer(l); });

    points.forEach(p => {
      const isFirefox = p.user_agent && p.user_agent.includes('[FIREFOX_OSINT]');
      const marker = L.marker([Number(p.lat), Number(p.lon)]).addTo(map);
      
      marker.bindPopup(`
        <div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #fff; background: #0e101a; border: 1px solid ${isFirefox ? '#00ff88' : '#00b4d8'}; padding: 10px; border-radius: 8px;">
          <strong style="color: ${isFirefox ? '#00ff88' : '#00b4d8'}">${isFirefox ? '[TARGET_VERIFIED]' : '[INTEL_LOG]'} #${p.id}</strong><br/>
          <div style="margin-top: 5px; opacity: 0.8;">
            IP: ${p.ip}<br/>
            LOC: ${p.city}, ${p.country}<br/>
            GPS: ${Number(p.lat).toFixed(4)}, ${Number(p.lon).toFixed(4)}<br/>
            TIME: ${new Date(p.created_at).toLocaleTimeString()}
          </div>
        </div>
      `);
    });

  }, [logs, points]);

  const handleEntityClick = (entity) => {
    if (mapInstance.current) {
      mapInstance.current.flyTo([Number(entity.lat), Number(entity.lon)], 15, {
        duration: 1.5
      });
    }
  };

  return (
    <div className="p-8 h-full flex flex-col xl:flex-row gap-6" style={{ height: 'calc(100vh - 70px)' }}>
      {/* Map Section */}
      <div className="rounded-2xl overflow-hidden shadow-2xl flex-[2] relative" style={{ background: '#0e101a', border: '1px solid rgba(255,255,255,0.05)', minHeight: '400px' }}>
        <div className="absolute top-4 left-4 z-[1000] flex items-center gap-3 px-4 py-2 rounded-full border border-white/5 backdrop-blur-md" style={{ background: 'rgba(14,16,26,0.8)' }}>
           <div className="w-2 h-2 rounded-full bg-[#00ff88] shadow-[0_0_8px_#00ff88] animate-pulse"></div>
           <span className="text-[10px] font-black uppercase tracking-widest text-[#00ff88]">Live Grid Status: ACTIVE</span>
        </div>
        <div ref={mapRef} className="w-full h-full" style={{ filter: 'invert(1) hue-rotate(180deg) brightness(0.8) contrast(1.2)' }} />
      </div>

      {/* Side Panel: Tracked Entities */}
      <div className="flex-1 flex flex-col rounded-2xl overflow-hidden shadow-2xl" style={{ background: '#0e101a', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="px-6 py-5 bg-white/5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-white font-black text-[12px] uppercase tracking-widest">Monitored Entities</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#00ff88]/10 text-[#00ff88] font-bold">{trackedEntities.length}</span>
          </div>
          <span className="text-[10px] font-mono text-gray-500">FIREFOX_OSINT_V2</span>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
          {trackedEntities.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-20 py-10">
               <span className="text-4xl mb-4">📡</span>
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-center">Awaiting data stream...<br/>No Firefox nodes detected</p>
            </div>
          ) : trackedEntities.map(entity => (
            <div key={entity.id} 
                 onClick={() => handleEntityClick(entity)}
                 className="p-4 rounded-xl border border-white/5 transition-all hover:border-[#00ff88]/30 group cursor-pointer active:scale-95" 
                 style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-mono text-[#00ff88]">#{entity.id}</span>
                <span className="text-[9px] font-black py-0.5 px-2 rounded bg-white/5 text-gray-500 uppercase">{new Date(entity.created_at).toLocaleTimeString()}</span>
              </div>
              <h4 className="text-white font-black text-[13px] mb-1 tracking-tight group-hover:text-[#00ff88] transition-colors">{entity.ip}</h4>
              <p className="text-[11px] text-gray-400 font-medium mb-3">{entity.city}, {entity.country}</p>
              
              <div className="flex gap-2">
                 <div className="flex-1 px-2 py-1.5 rounded-md bg-black/40 border border-white/5 text-center">
                    <span className="block text-[8px] text-gray-600 font-bold uppercase mb-0.5">Latitude</span>
                    <span className="text-[10px] font-mono text-gray-300">{Number(entity.lat).toFixed(4)}</span>
                 </div>
                 <div className="flex-1 px-2 py-1.5 rounded-md bg-black/40 border border-white/5 text-center">
                    <span className="block text-[8px] text-gray-600 font-bold uppercase mb-0.5">Longitude</span>
                    <span className="text-[10px] font-mono text-gray-300">{Number(entity.lon).toFixed(4)}</span>
                 </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── STAT CARD ──────────────────────────────── */
function StatCard({ icon, label, value, color, sub }) {
  return (
    <div className="rounded-2xl p-6 flex items-center gap-5 transition-transform hover:scale-[1.02]" 
         style={{ background: '#11131f', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 animate-pulse-slow" 
           style={{ background: `linear-gradient(135deg, ${color}22, ${color}05)`, border: `1px solid ${color}33`, color }}>{icon}</div>
      <div>
        <div className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>{label}</div>
        <div className="text-white font-black text-[28px] leading-none tracking-tight">{value}</div>
        {sub && <div className="text-[10px] mt-2 font-bold uppercase tracking-wider opacity-30">{sub}</div>}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   SECTION: PROJECTS
══════════════════════════════════════════════ */
function ProjectsSection() {
  const [data, setData] = useState([]);
  const [modal, setModal] = useState(null); // null | 'add' | rowObj
  const [confirmId, setConfirmId] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', tech_stack: '', image_url: '', image_url_2: '', github_url: '', live_url: '', label: '' });

  useEffect(() => { fetchData(); }, []);
  const fetchData = async () => {
    try { const { data } = await axios.get(`${API}/api/projects`); setData(data); } catch {}
  };

  const openAdd = () => { setForm({ title: '', description: '', tech_stack: '', image_url: '', image_url_2: '', github_url: '', live_url: '', label: '' }); setModal('add'); };
  const openEdit = (row) => { setForm(row); setModal(row); };
  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    try {
      if (modal === 'add') await axios.post(`${API}/api/projects`, form);
      else await axios.put(`${API}/api/projects/${form.id}`, form);
      fetchData(); setModal(null);
    } catch (e) { alert('Gagal menyimpan: ' + e.message); }
  };

  const handleDelete = async () => {
    await axios.delete(`${API}/api/projects/${confirmId}`);
    setConfirmId(null); fetchData();
  };

  return (
    <div className="p-6">
      <div className="rounded-xl overflow-hidden" style={{ background: '#141622', border: '1px solid #1e2130' }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #1e2130' }}>
          <span className="text-white font-semibold text-[14px]">Daftar Projects ({data.length})</span>
        </div>
        <CrudTable
          columns={[
            { key: 'id', label: 'ID' },
            { key: 'title', label: 'Judul', highlight: true },
            { key: 'label', label: 'Kategori' },
            { key: 'tech_stack', label: 'Tech Stack' },
            { key: 'github_url', label: 'GitHub', render: v => v ? <a href={v} target="_blank" rel="noreferrer" style={{ color: '#00b4d8' }}>🔗 Link</a> : '—' },
          ]}
          data={data} onEdit={openEdit} onDelete={setConfirmId}
          emptyMsg="Belum ada project. Klik Tambah untuk menambahkan."
        />
      </div>

      {modal && (
        <Modal title={modal === 'add' ? '➕ Tambah Project' : '✏️ Edit Project'} onClose={() => setModal(null)}>
          <Field label="Judul Project *" name="title" value={form.title} onChange={handleChange} placeholder="e.g. HijauLoka" />
          <Field label="Deskripsi" name="description" value={form.description} onChange={handleChange} type="textarea" placeholder="Deskripsi singkat project..." />
          <Field label="Tech Stack" name="tech_stack" value={form.tech_stack} onChange={handleChange} placeholder="e.g. React, Node.js, PostgreSQL" />
          <Field label="Kategori/Label" name="label" value={form.label} onChange={handleChange} placeholder="e.g. Web, Mobile, Desktop" />
          <FileField label="Visual Confirmation (Card Thumbnail)" currentUrl={form.image_url} onUpload={(url) => setForm(f => ({ ...f, image_url: url }))} />
          <FileField label="Visual Confirmation (Detail Banner)" currentUrl={form.image_url_2} onUpload={(url) => setForm(f => ({ ...f, image_url_2: url }))} />
          <Field label="URL GitHub" name="github_url" value={form.github_url} onChange={handleChange} placeholder="https://github.com/..." />
          <Field label="URL Live Demo" name="live_url" value={form.live_url} onChange={handleChange} placeholder="https://..." />
          <div className="flex gap-3 justify-end mt-2">
            <button onClick={() => setModal(null)} className="px-4 py-2 rounded-lg text-[13px]" style={{ background: '#2a2d3e', color: '#aaa' }}>Batal</button>
            <button onClick={handleSave} className="px-5 py-2 rounded-lg text-[13px] font-semibold" style={{ background: '#00b4d8', color: '#fff' }}>Simpan</button>
          </div>
        </Modal>
      )}
      {confirmId && <ConfirmDelete onConfirm={handleDelete} onCancel={() => setConfirmId(null)} />}
    </div>
  );
}

/* ══════════════════════════════════════════════
   SECTION: SKILLS
══════════════════════════════════════════════ */
const SKILL_ICONS = ['FaReact','FaNodeJs','FaHtml5','FaCss3Alt','SiExpress','SiPostgresql','SiMysql','FaLaravel','FaShieldAlt','3D','CI4','SiTypescript','SiMongodb','SiFirebase'];

function SkillsSection() {
  const [data, setData] = useState([]);
  const [modal, setModal] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [form, setForm] = useState({ name: '', category: '', icon_key: '', level: 80 });

  useEffect(() => { fetchData(); }, []);
  const fetchData = async () => {
    try { const { data } = await axios.get(`${API}/api/skills`); setData(data); } catch {}
  };

  const openAdd = () => { setForm({ name: '', category: '', icon_key: '', level: 80 }); setModal('add'); };
  const openEdit = (row) => { setForm(row); setModal(row); };
  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    try {
      if (modal === 'add') await axios.post(`${API}/api/skills`, form);
      else await axios.put(`${API}/api/skills/${form.id}`, form);
      fetchData(); setModal(null);
    } catch (e) { alert('Gagal: ' + e.message); }
  };

  const handleDelete = async () => { await axios.delete(`${API}/api/skills/${confirmId}`); setConfirmId(null); fetchData(); };

  return (
    <div className="p-6">
      <div className="rounded-xl overflow-hidden" style={{ background: '#141622', border: '1px solid #1e2130' }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #1e2130' }}>
          <span className="text-white font-semibold text-[14px]">Daftar Skills ({data.length})</span>
        </div>
        <CrudTable
          columns={[
            { key: 'id', label: 'ID' },
            { key: 'name', label: 'Nama Skill', highlight: true },
            { key: 'category', label: 'Kategori' },
            { key: 'icon_key', label: 'Icon Key' },
            { key: 'level', label: 'Level', render: v => (
              <div className="flex items-center gap-2">
                <div className="w-20 h-1.5 rounded-full" style={{ background: '#2a2d3e' }}>
                  <div className="h-full rounded-full" style={{ width: `${v}%`, background: '#00b4d8' }} />
                </div>
                <span style={{ color: '#666' }}>{v}%</span>
              </div>
            )},
          ]}
          data={data} onEdit={openEdit} onDelete={setConfirmId}
          emptyMsg="Belum ada skill."
        />
      </div>

      {modal && (
        <Modal title={modal === 'add' ? '➕ Tambah Skill' : '✏️ Edit Skill'} onClose={() => setModal(null)}>
          <Field label="Nama Skill *" name="name" value={form.name} onChange={handleChange} placeholder="e.g. React.js" />
          <Field label="Kategori" name="category" value={form.category} onChange={handleChange} placeholder="e.g. Frontend, Backend, Database" />
          <div className="mb-4">
            <label className="block text-[11px] font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#666' }}>Icon Key</label>
            <select name="icon_key" value={form.icon_key} onChange={handleChange}
              className="w-full rounded-lg px-3 py-2 text-[13px] text-white outline-none"
              style={{ background: '#0f1117', border: '1px solid #2a2d3e', color: '#fff' }}>
              <option value="">-- Pilih Icon --</option>
              {SKILL_ICONS.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-[11px] font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#666' }}>Level ({form.level}%)</label>
            <input type="range" name="level" min="0" max="100" value={form.level} onChange={handleChange} className="w-full accent-[#00b4d8]" />
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setModal(null)} className="px-4 py-2 rounded-lg text-[13px]" style={{ background: '#2a2d3e', color: '#aaa' }}>Batal</button>
            <button onClick={handleSave} className="px-5 py-2 rounded-lg text-[13px] font-semibold" style={{ background: '#00b4d8', color: '#fff' }}>Simpan</button>
          </div>
        </Modal>
      )}
      {confirmId && <ConfirmDelete onConfirm={handleDelete} onCancel={() => setConfirmId(null)} />}
    </div>
  );
}

/* ══════════════════════════════════════════════
   SECTION: CERTIFICATIONS
══════════════════════════════════════════════ */
function CertificationsSection() {
  const [data, setData] = useState([]);
  const [modal, setModal] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [form, setForm] = useState({ name: '', issuer: '', issued_date: '', pdf_url: '', image_url: '' });

  useEffect(() => { fetchData(); }, []);
  const fetchData = async () => {
    try { const { data } = await axios.get(`${API}/api/certifications`); setData(data); } catch {}
  };

  const openAdd = () => { setForm({ name: '', issuer: '', issued_date: '', pdf_url: '', image_url: '' }); setModal('add'); };
  const openEdit = (row) => { setForm(row); setModal(row); };
  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    try {
      if (!form.name) return alert('Nama sertifikat wajib diisi');
      if (modal === 'add') await axios.post(`${API}/api/certifications`, form);
      else await axios.put(`${API}/api/certifications/${form.id}`, form);
      fetchData(); setModal(null);
    } catch (e) { alert('Gagal menyimpan: ' + e.message); }
  };

  const handleDelete = async () => { await axios.delete(`${API}/api/certifications/${confirmId}`); setConfirmId(null); fetchData(); };

  return (
    <div className="p-8">
      <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ background: '#0e101a', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center justify-between px-6 py-5 bg-white/5 border-b border-white/5">
          <span className="text-white font-black text-[14px] uppercase tracking-widest">Validated Credentials <span className="text-[#febc2e] ml-2">[{data.length}]</span></span>
        </div>
        <CrudTable
          columns={[
            { key: 'id', label: 'ID' },
            { key: 'name', label: 'Nama Sertifikat', highlight: true },
            { key: 'issuer', label: 'Penerbit' },
            { key: 'issued_date', label: 'Tanggal' },
            { key: 'pdf_url', label: 'Files', render: v => v ? <a href={v} target="_blank" rel="noreferrer" style={{ color: '#00b4d8' }} className="font-bold underline">OPEN_PDF</a> : '—' },
          ]}
          data={data} onEdit={openEdit} onDelete={setConfirmId}
          emptyMsg="NO_CREDENTIALS_FOUND // SYSTEM_IDLE"
        />
      </div>

      {modal && (
        <Modal title={modal === 'add' ? '➕ ADD_CERTIFICATE' : '✏️ MODIFY_CERTIFICATE'} onClose={() => setModal(null)}>
          <Field label="Certificate Name *" name="name" value={form.name} onChange={handleChange} placeholder="e.g. CEH v12" />
          <Field label="Issuer" name="issuer" value={form.issuer} onChange={handleChange} placeholder="e.g. EC-Council, Coursera" />
          <Field label="Issue Date" name="issued_date" value={form.issued_date} onChange={handleChange} placeholder="e.g. March 2024" />
          <Field label="PDF Link / Path" name="pdf_url" value={form.pdf_url} onChange={handleChange} placeholder="e.g. /files/cert.pdf" />
          <FileField label="Preview Image (Optional)" currentUrl={form.image_url} onUpload={(url) => setForm(f => ({ ...f, image_url: url }))} />
          <div className="flex gap-4 justify-end mt-4 pt-4 border-t border-white/5">
            <button onClick={() => setModal(null)} className="px-6 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all" style={{ color: '#666' }}>Abort</button>
            <button onClick={handleSave} className="px-8 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest" style={{ background: '#febc2e', color: '#000' }}>Commit Changes</button>
          </div>
        </Modal>
      )}
      {confirmId && <ConfirmDelete onConfirm={handleDelete} onCancel={() => setConfirmId(null)} />}
    </div>
  );
}

/* ══════════════════════════════════════════════
   SECTION: DASHBOARD HOME
══════════════════════════════════════════════ */
function LogsTable({ logs }) {
  if (!logs.length) return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-700">
      <div className="text-5xl mb-4 opacity-20">📡</div>
      <div className="text-[12px] font-black uppercase tracking-widest opacity-40">Zero Incoming Packets // No Logs Found</div>
    </div>
  );
  return (
    <div className="overflow-x-auto stylish-scroll">
      <table className="w-full text-[12px]">
        <thead>
          <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
            {['ID','IP Address','Location','Coordinates','OS / Agent','Session Time'].map(h => (
              <th key={h} className="text-left px-5 py-4 font-black uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.2)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {logs.map((log, i) => (
            <tr key={log.id} 
              className="hover:bg-white/[0.02] transition-colors group"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
              <td className="px-5 py-4 font-mono opacity-30 group-hover:opacity-100">#{log.id}</td>
              <td className="px-5 py-4 font-black text-[#00b4d8] tracking-tighter">
                <span className="bg-[#00b4d8]/10 px-2 py-0.5 rounded-md">{log.ip}</span>
              </td>
              <td className="px-5 py-4">
                <div className="flex flex-col">
                  <span className="text-white font-bold">{log.city || 'Undisclosed'}</span>
                  <span className="text-[10px] uppercase tracking-widest font-bold opacity-30">{log.country || 'Neutral Zone'}</span>
                </div>
              </td>
              <td className="px-5 py-4 font-mono text-[10px] opacity-50 group-hover:opacity-100">
                {log.lat || 0}, {log.lon || 0}
              </td>
              <td className="px-5 py-4 max-w-[200px] truncate opacity-50 group-hover:opacity-100 text-[10px] font-medium" title={log.user_agent}>
                {log.user_agent}
              </td>
              <td className="px-5 py-4 font-mono text-[11px] opacity-40 group-hover:opacity-100 group-hover:text-[#00ff88]">
                {new Date(log.created_at).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: 'short' })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DashboardHome({ logs }) {
  return (
    <div className="p-8 space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard icon="📊" label="Total Intrusion Logs" value={logs.length} color="#00b4d8" sub="Packets sniffed all time" />
        <StatCard icon="🌐" label="Affected Regions" value={[...new Set(logs.map(l=>l.country))].filter(Boolean).length} color="#7000ff" sub="Distinct geolocations" />
        <StatCard icon="🏢" label="Nodes Detected" value={[...new Set(logs.map(l=>l.city))].filter(Boolean).length} color="#00ff88" sub="Unique city clusters" />
        <StatCard icon="☣️" label="Last Breach Status" color="#febc2e" 
          value={logs.length ? 'RESOLVED' : 'STABLE'} 
          sub={logs[0] ? `Detected: ${new Date(logs[0].created_at).toLocaleDateString()}` : 'Buffer cleared'} />
      </div>
      
      <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ background: '#0e101a', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center justify-between px-6 py-5 bg-white/5 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#00ff88] shadow-[0_0_8px_#00ff88]"></div>
            <span className="text-white font-black text-[12px] uppercase tracking-widest">Real-time Stream // Recent Incoming</span>
          </div>
          <span className="text-[10px] font-black tracking-widest text-[#00b4d8] bg-[#00b4d8]/10 px-3 py-1 rounded-full">MONITORING_ACTIVE</span>
        </div>
        <LogsTable logs={logs.slice(0, 5)} />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════ */
export default function AdminDashboard({ onLogout }) {
  const [active, setActive] = useState('dashboard');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const addHandlers = { projects: null, skills: null, certs: null, experiences: null };
  const projectsRef = useRef();
  const skillsRef   = useRef();
  const certsRef    = useRef();
  const experiencesRef = useRef();

  useEffect(() => { 
    fetchLogs(); 
    const interval = setInterval(fetchLogs, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  const fetchLogs = async () => {
    try { const { data } = await axios.get(`${API}/v1/kernel-access/logs`); setLogs(data); }
    catch {} finally { setLoading(false); }
  };

  const titles = { dashboard: 'Dashboard', projects: 'Projects', skills: 'Skills', certs: 'Certifications', experiences: 'My Experience', messages: 'Messages', osint_logs: 'OSINT Scan Logs', logs: 'Visitor Logs', firefox_map: 'Firefox Map' };

  // Top-bar Add button handler
  const handleTopAdd = () => {
    if (active === 'projects' && projectsRef.current) projectsRef.current.openAdd();
    if (active === 'skills'   && skillsRef.current)   skillsRef.current.openAdd();
    if (active === 'certs'    && certsRef.current)    certsRef.current.openAdd();
    if (active === 'experiences' && experiencesRef.current) experiencesRef.current.openAdd();
  };

  return (
    <div className="flex w-screen h-screen overflow-hidden" style={{ background: '#0c0e18', fontFamily: "'Inter','Segoe UI',sans-serif" }}>
      <Sidebar active={active} setActive={setActive} onLogout={onLogout} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar
          title={titles[active] || 'Dashboard'}
          onAdd={['projects','skills','certs','experiences'].includes(active) ? handleTopAdd : null}
        />
        <main className="flex-1 overflow-y-auto" style={{ background: '#0c0e18' }}>
          {loading && active === 'dashboard' ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-6 h-6 border-2 border-[#00b4d8] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : <>
            {active === 'dashboard' && <DashboardHome logs={logs} />}
            {active === 'logs' && (
              <div className="p-8">
                <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ background: '#0e101a', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="flex items-center justify-between px-6 py-5 bg-white/5 border-b border-white/5">
                    <div className="flex items-center gap-3">
                      <span className="text-white font-black text-[14px] uppercase tracking-widest">Master Log File</span>
                      <span className="text-[#00b4d8] font-mono text-[14px] bg-[#00b4d8]/10 px-3 py-1 rounded-md">/var/logs/access.log ({logs.length})</span>
                    </div>
                    <button onClick={fetchLogs} 
                      className="text-[11px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all hover:bg-white/10 flex items-center gap-2" 
                      style={{ background: 'rgba(255,255,255,0.03)', color: '#00b4d8' }}>
                      <span className="text-lg">⟳</span> SYNC_DATABASE
                    </button>
                  </div>
                  <LogsTable logs={logs} />
                </div>
              </div>
            )}
            {active === 'firefox_map' && <LogMap logs={logs} />}
            {active === 'projects' && <ProjectsWithRef ref={projectsRef} />}
            {active === 'skills'   && <SkillsWithRef   ref={skillsRef}   />}
            {active === 'certs'    && <CertsWithRef    ref={certsRef}    />}
            {active === 'experiences' && <ExperiencesWithRef ref={experiencesRef} />}
            {active === 'messages' && <MessagesList />}
            {active === 'osint_logs' && <OsintLogsSection />}
          </>}
        </main>
      </div>
    </div>
  );
}

// Forwarded ref wrappers so Topbar can trigger openAdd
const ProjectsWithRef = React.forwardRef((_, ref) => {
  const [data, setData] = useState([]);
  const [modal, setModal] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [form, setForm] = useState({ title:'', description:'', tech_stack:'', image_url:'', image_url_2:'', image_url_3:'', github_url:'', live_url:'', label:'' });

  useEffect(() => { fetchData(); }, []);
  const fetchData = async () => { try { const { data } = await axios.get(`${API}/api/projects`); setData(data); } catch {} };

  React.useImperativeHandle(ref, () => ({
    openAdd: () => { setForm({ title:'', description:'', tech_stack:'', image_url:'', image_url_2:'', image_url_3:'', github_url:'', live_url:'', label:'' }); setModal('add'); }
  }));

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleSave = async () => {
    try {
      if (!form.title) return alert('MISSION_TITLE REQUIRED');
      if (modal === 'add') await axios.post(`${API}/api/projects`, form);
      else await axios.put(`${API}/api/projects/${form.id}`, form);
      fetchData(); setModal(null);
    } catch (e) { alert('CRITICAL_FAILURE: ' + e.message); }
  };
  const handleDelete = async () => { await axios.delete(`${API}/api/projects/${confirmId}`); setConfirmId(null); fetchData(); };

  return (
    <div className="p-8">
      <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ background: '#0e101a', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center justify-between px-6 py-5 bg-white/5 border-b border-white/5">
          <span className="text-white font-black text-[14px] uppercase tracking-widest">Active Missions <span className="text-[#00b4d8] ml-2">[{data.length}]</span></span>
        </div>
        <CrudTable
          columns={[
            { key: 'id', label: 'ID', render: v => <span style={{ fontFamily: 'monospace', color: 'rgba(255,255,255,0.2)', fontSize: '11px' }}>#{v}</span> },
            { key: 'image_url', label: 'Banner', render: v => v ? (
              <div style={{ width: '60px', height: '40px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
                <img src={v} alt="banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.src='/images/profile2.png'} />
              </div>
            ) : <div style={{ width: '60px', height: '40px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>🖼️</div> },
            { key: 'title', label: 'Mission Name', highlight: true },
            { key: 'label', label: 'Sector', render: v => v ? <span style={{ fontSize: '10px', padding: '3px 10px', borderRadius: '20px', background: 'rgba(0,180,216,0.08)', color: '#00b4d8', border: '1px solid rgba(0,180,216,0.15)', fontWeight: 700, letterSpacing: '0.05em' }}>{v}</span> : <span style={{ color: '#333' }}>—</span> },
            { key: 'tech_stack', label: 'Tech Arsenal', render: v => v ? <span style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', fontSize: '11px' }}>{v.slice(0, 35)}{v.length > 35 ? '…' : ''}</span> : <span style={{ color: '#333' }}>—</span> },
            { key: 'github_url', label: 'Repo', render: v => v ? <a href={v} target="_blank" rel="noreferrer" style={{ color: '#00b4d8', fontWeight: 700, fontSize: '11px', textDecoration: 'none', padding: '3px 10px', borderRadius: '6px', background: 'rgba(0,180,216,0.08)', border: '1px solid rgba(0,180,216,0.15)' }}>🔗 ACCESS</a> : <span style={{ color: '#333' }}>—</span> },
          ]}
          data={data} onEdit={r => { setForm(r); setModal(r); }} onDelete={setConfirmId}
          emptyMsg="NO_MISSIONS_LOGGED // STANDBY"
        />
      </div>

      {modal && (
        <Modal title={modal === 'add' ? '➕ INITIATE_MISSION_FILE' : '✏️ PATCH_MISSION_FILE'} onClose={() => setModal(null)}>
          <Field label="Mission Designation *" name="title" value={form.title} onChange={handleChange} placeholder="Operation: CyberShield" />
          <Field label="Intelligence Brief" name="description" value={form.description} onChange={handleChange} type="textarea" placeholder="Detailed mission specs..." />
          <Field label="Tech Stacks" name="tech_stack" value={form.tech_stack} onChange={handleChange} placeholder="Vite, Node, PostgreSQL" />
          <Field label="Operational Sector" name="label" value={form.label} onChange={handleChange} placeholder="Web / Cyber / OSINT" />
          <FileField label="Visual Confirmation (Card Thumbnail)" currentUrl={form.image_url} onUpload={(url) => setForm(f => ({ ...f, image_url: url }))} />
          <FileField label="Visual Confirmation (Detail Banner) — IMG 1" currentUrl={form.image_url_2} onUpload={(url) => setForm(f => ({ ...f, image_url_2: url }))} />
          <FileField label="Visual Confirmation (Detail Banner) — IMG 2" currentUrl={form.image_url_3} onUpload={(url) => setForm(f => ({ ...f, image_url_3: url }))} />
          <Field label="Repository Link" name="github_url" value={form.github_url} onChange={handleChange} placeholder="https://github.com/..." />
          <Field label="Live Endpoint" name="live_url" value={form.live_url} onChange={handleChange} placeholder="https://..." />
          <div className="flex gap-4 justify-end mt-4 pt-4 border-t border-white/5">
            <button onClick={() => setModal(null)} className="px-6 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest" style={{ color: '#666' }}>Abort</button>
            <button onClick={handleSave} className="px-8 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest" style={{ background: '#00b4d8', color: '#fff', boxShadow: '0 4px 15px rgba(0,180,216,0.3)' }}>Execute Sync</button>
          </div>
        </Modal>
      )}
      {confirmId && <ConfirmDelete onConfirm={handleDelete} onCancel={() => setConfirmId(null)} />}
    </div>
  );
});

const SkillsWithRef = React.forwardRef((_, ref) => {
  const [data, setData] = useState([]);
  const [modal, setModal] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [form, setForm] = useState({ name:'', category:'', icon_key:'', level:80 });

  useEffect(() => { fetchData(); }, []);
  const fetchData = async () => { try { const { data } = await axios.get(`${API}/api/skills`); setData(data); } catch {} };

  React.useImperativeHandle(ref, () => ({
    openAdd: () => { setForm({ name:'', category:'', icon_key:'', level:80 }); setModal('add'); }
  }));

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleSave = async () => {
    try {
      if (modal === 'add') await axios.post(`${API}/api/skills`, form);
      else await axios.put(`${API}/api/skills/${form.id}`, form);
      fetchData(); setModal(null);
    } catch (e) { alert('FAILURE: ' + e.message); }
  };
  const handleDelete = async () => { await axios.delete(`${API}/api/skills/${confirmId}`); setConfirmId(null); fetchData(); };

  return (
    <div className="p-8">
      <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ background: '#0e101a', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center justify-between px-6 py-5 bg-white/5 border-b border-white/5">
          <span className="text-white font-black text-[14px] uppercase tracking-widest">Skill Inventory <span className="text-[#00ff88] ml-2">[{data.length}]</span></span>
        </div>
        <CrudTable
          columns={[
            { key: 'id', label: 'ID' },
            { key: 'name', label: 'Skill Designation', highlight: true },
            { key: 'category', label: 'Type' },
            { key: 'level', label: 'Mastery', render: v => (
              <div className="flex items-center gap-3">
                <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <div className="h-full" style={{ width: `${v}%`, background: 'linear-gradient(90deg, #00b4d8, #00ff88)' }} />
                </div>
                <span className="font-black text-[10px] text-[#00ff88]">{v}%</span>
              </div>
            )},
          ]}
          data={data} onEdit={r => { setForm(r); setModal(r); }} onDelete={setConfirmId}
          emptyMsg="NO_SKILLS_LOGGED // SYSTEM_PENDING"
        />
      </div>
      {modal && (
        <Modal title={modal === 'add' ? '➕ ADD_SKILL_NODE' : '✏️ MODIFY_SKILL_NODE'} onClose={() => setModal(null)}>
          <Field label="Skill Designation *" name="name" value={form.name} onChange={handleChange} placeholder="React.js" />
          <Field label="Operational Category" name="category" value={form.category} onChange={handleChange} placeholder="Frontend / Backend" />
          <div className="mb-5">
            <label className="block text-[10px] font-bold mb-2 uppercase tracking-[0.15em] opacity-40">System Icon</label>
            <select name="icon_key" value={form.icon_key} onChange={handleChange} className="w-full rounded-xl px-4 py-3 text-[13px] outline-none" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>
              <option value="">-- UNKNOWN --</option>
              {['FaReact','FaNodeJs','SiExpress','SiPostgresql','SiMysql','FaLaravel','FaShieldAlt','3D','CI4','SiTypescript','SiMongodb','SiFirebase'].map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
          <div className="mb-5">
            <div className="flex justify-between items-center mb-2">
               <label className="text-[10px] font-bold uppercase tracking-[0.15em] opacity-40">Mastery Level</label>
               <span className="text-[#00ff88] font-black text-[14px]">{form.level}%</span>
            </div>
            <input type="range" name="level" min="0" max="100" value={form.level} onChange={handleChange} className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-white/10 accent-[#00ff88]" />
          </div>
          <div className="flex gap-4 justify-end mt-4 pt-4 border-t border-white/5">
            <button onClick={() => setModal(null)} className="px-6 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest" style={{ color: '#666' }}>Abort</button>
            <button onClick={handleSave} className="px-8 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest" style={{ background: '#00ff88', color: '#000' }}>Save Node</button>
          </div>
        </Modal>
      )}
      {confirmId && <ConfirmDelete onConfirm={handleDelete} onCancel={() => setConfirmId(null)} />}
    </div>
  );
});

const CertsWithRef = React.forwardRef((_, ref) => {
  const [data, setData] = useState([]);
  const [modal, setModal] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [form, setForm] = useState({ name:'', issuer:'', issued_date:'', pdf_url:'', image_url:'' });

  useEffect(() => { fetchData(); }, []);
  const fetchData = async () => { try { const { data } = await axios.get(`${API}/api/certifications`); setData(data); } catch {} };

  React.useImperativeHandle(ref, () => ({
    openAdd: () => { setForm({ name:'', issuer:'', issued_date:'', pdf_url:'', image_url:'' }); setModal('add'); }
  }));

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleSave = async () => {
    try {
      if (!form.name) return alert('CREDENTIAL_NAME REQUIRED');
      if (modal === 'add') await axios.post(`${API}/api/certifications`, form);
      else await axios.put(`${API}/api/certifications/${form.id}`, form);
      fetchData(); setModal(null);
    } catch (e) { alert('DEPLOYMENT_ERROR: ' + e.message); }
  };
  const handleDelete = async () => { await axios.delete(`${API}/api/certifications/${confirmId}`); setConfirmId(null); fetchData(); };

  return (
    <div className="p-8">
      <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ background: '#0e101a', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center justify-between px-6 py-5 bg-white/5 border-b border-white/5">
          <span className="text-white font-black text-[14px] uppercase tracking-widest">Validated Credentials <span className="text-[#febc2e] ml-2">[{data.length}]</span></span>
        </div>
        <CrudTable
          columns={[
            { key: 'id', label: 'ID' },
            { key: 'name', label: 'Credential Name', highlight: true },
            { key: 'issuer', label: 'Issuing Body' },
            { key: 'issued_date', label: 'Timeline' },
            { key: 'pdf_url', label: 'Assets', render: v => v ? <a href={v} target="_blank" rel="noreferrer" className="text-[#00b4d8] font-bold underline">ACCESS_FILE</a> : '—' },
          ]}
          data={data} onEdit={r => { setForm(r); setModal(r); }} onDelete={setConfirmId}
          emptyMsg="NO_CREDENTIALS_ON_FILE // READY_TO_INIT"
        />
      </div>
      {modal && (
        <Modal title={modal === 'add' ? '➕ ARCHIVE_NEW_CREDENTIAL' : '✏️ PATCH_CREDENTIAL_DATA'} onClose={() => setModal(null)}>
          <Field label="Credential Designation *" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Offensive Security Certified Professional" />
          <Field label="Issuing Body" name="issuer" value={form.issuer} onChange={handleChange} placeholder="e.g. OffSec, Cisco, SANS" />
          <Field label="Timeline" name="issued_date" value={form.issued_date} onChange={handleChange} placeholder="e.g. Q1 2024" />
          <Field label="PDF Link / Path" name="pdf_url" value={form.pdf_url} onChange={handleChange} placeholder="e.g. /docs/oscp.pdf" />
          <FileField label="Visual Proof (Card/Logo)" currentUrl={form.image_url} onUpload={(url) => setForm(f => ({ ...f, image_url: url }))} />
          <div className="flex gap-4 justify-end mt-4 pt-4 border-t border-white/5">
            <button onClick={() => setModal(null)} className="px-6 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest" style={{ color: '#666' }}>Abort</button>
            <button onClick={handleSave} className="px-8 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest" style={{ background: '#febc2e', color: '#000' }}>Commit Data</button>
          </div>
        </Modal>
      )}
      {confirmId && <ConfirmDelete onConfirm={handleDelete} onCancel={() => setConfirmId(null)} />}
    </div>
  );
});

const ExperiencesWithRef = React.forwardRef((_, ref) => {
  const [data, setData] = useState([]);
  const [modal, setModal] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [form, setForm] = useState({ title:'', date:'', description:'', link_url:'', image_url:'', image_url_2:'', image_url_3:'' });

  useEffect(() => { fetchData(); }, []);
  const fetchData = async () => { try { const { data } = await axios.get(`${API}/api/experiences`); setData(data); } catch {} };

  React.useImperativeHandle(ref, () => ({
    openAdd: () => { setForm({ title:'', date:'', description:'', link_url:'', image_url:'', image_url_2:'', image_url_3:'' }); setModal('add'); }
  }));

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleSave = async () => {
    try {
      if (!form.title) return alert('JUDUL REQUIRED');
      if (modal === 'add') await axios.post(`${API}/api/experiences`, form);
      else await axios.put(`${API}/api/experiences/${form.id}`, form);
      fetchData(); setModal(null);
    } catch (e) { alert('ERROR: ' + e.message); }
  };
  const handleDelete = async () => { await axios.delete(`${API}/api/experiences/${confirmId}`); setConfirmId(null); fetchData(); };

  return (
    <div className="p-8">
      <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ background: '#0e101a', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center justify-between px-6 py-5 bg-white/5 border-b border-white/5">
          <span className="text-white font-black text-[14px] uppercase tracking-widest">My Experience <span className="text-[#00ff88] ml-2">[{data.length}]</span></span>
        </div>
        <CrudTable
          columns={[
            { key: 'id', label: 'ID' },
            { key: 'image_url', label: 'Image', render: v => v ? (
              <div style={{ width: '60px', height: '40px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
                <img src={v} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.src='/images/profile2.png'} />
              </div>
            ) : '—' },
            { key: 'title', label: 'Judul', highlight: true },
            { key: 'date', label: 'Waktu' },
            { key: 'link_url', label: 'Link', render: v => v ? <a href={v} target="_blank" rel="noreferrer" className="text-[#00b4d8] font-bold underline">ACCESS_LINK</a> : '—' },
          ]}
          data={data} onEdit={r => { setForm(r); setModal(r); }} onDelete={setConfirmId}
          emptyMsg="NO_EXPERIENCES_FOUND"
        />
      </div>
      {modal && (
        <Modal title={modal === 'add' ? '➕ ADD_EXPERIENCE' : '✏️ MODIFY_EXPERIENCE'} onClose={() => setModal(null)}>
          <Field label="Judul *" name="title" value={form.title} onChange={handleChange} placeholder="e.g. Delegate of Asian Creative & Digital Economy..." />
          <Field label="Waktu" name="date" value={form.date} onChange={handleChange} placeholder="e.g. October 2023 - October 2024" />
          <Field label="Deskripsi" name="description" value={form.description} onChange={handleChange} type="textarea" placeholder="Deskripsi mengenai pengalaman..." />
          <Field label="Link (See More)" name="link_url" value={form.link_url} onChange={handleChange} placeholder="https://..." />
          <FileField label="Visual (Banner Event 1) *" currentUrl={form.image_url} onUpload={(url) => setForm(f => ({ ...f, image_url: url }))} />
          <FileField label="Visual (Banner Event 2) (Optional)" currentUrl={form.image_url_2} onUpload={(url) => setForm(f => ({ ...f, image_url_2: url }))} />
          <FileField label="Visual (Banner Event 3) (Optional)" currentUrl={form.image_url_3} onUpload={(url) => setForm(f => ({ ...f, image_url_3: url }))} />
          <div className="flex gap-4 justify-end mt-4 pt-4 border-t border-white/5">
            <button onClick={() => setModal(null)} className="px-6 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest" style={{ color: '#666' }}>Abort</button>
            <button onClick={handleSave} className="px-8 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest" style={{ background: '#00ff88', color: '#000' }}>Commit Data</button>
          </div>
        </Modal>
      )}
      {confirmId && <ConfirmDelete onConfirm={handleDelete} onCancel={() => setConfirmId(null)} />}
    </div>
  );
});

/* ══════════════════════════════════════════════
   SECTION: OSINT SCAN LOGS — Nama Lengkap only
══════════════════════════════════════════════ */
const OsintLogsSection = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmId, setConfirmId] = useState(null);

  useEffect(() => { fetchData(); }, []);
  const fetchData = async () => {
    setLoading(true);
    try { const { data } = await axios.get(`${API}/api/osint/scans`); setData(data); }
    catch (e) { console.error('OSINT fetch error', e); }
    finally { setLoading(false); }
  };
  const handleDelete = async () => {
    await axios.delete(`${API}/api/osint/scans/${confirmId}`);
    setConfirmId(null); fetchData();
  };

  // Group by date
  const grouped = data.reduce((acc, row) => {
    const d = new Date(row.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
    if (!acc[d]) acc[d] = [];
    acc[d].push(row);
    return acc;
  }, {});

  // IP per-day count per ip
  const ipDayCounts = {};
  data.forEach(row => {
    const d = new Date(row.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
    const k = `${row.ip}|${d}`;
    ipDayCounts[k] = (ipDayCounts[k] || 0) + 1;
  });

  // Mask IP: show first 2 octets only
  const maskIp = (ip) => {
    if (!ip) return '—';
    const parts = ip.split('.');
    if (parts.length === 4) return `${parts[0]}.${parts[1]}.*.*`;
    return ip.slice(0, 8) + '***';
  };

  return (
    <div className="p-8">
      <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ background: '#0e101a', border: '1px solid rgba(0,180,216,0.1)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b" style={{ background: 'linear-gradient(90deg, rgba(0,180,216,0.06), rgba(155,89,182,0.04))', borderColor: 'rgba(255,255,255,0.04)' }}>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#9b59b6', boxShadow: '0 0 8px #9b59b6' }} />
            <span className="text-white font-black text-[14px] uppercase tracking-widest">OSINT Name Scan Log</span>
            <span className="text-[11px] px-3 py-1 rounded-full font-black" style={{ background: 'rgba(155,89,182,0.1)', color: '#9b59b6', border: '1px solid rgba(155,89,182,0.2)' }}>
              {data.length} RECORDS
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-mono text-gray-600 uppercase tracking-widest">LIMIT: 3 scan/IP/day</span>
              <span className="text-[9px] font-mono text-gray-700">Stored: name + date only</span>
            </div>
            <button onClick={fetchData}
              className="text-[11px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all hover:scale-105"
              style={{ background: 'rgba(155,89,182,0.08)', color: '#9b59b6', border: '1px solid rgba(155,89,182,0.2)' }}>
              ⟳ SYNC
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: '#9b59b6', borderTopColor: 'transparent' }} />
              <span className="text-[12px] font-mono uppercase tracking-widest" style={{ color: '#9b59b6' }}>LOADING SCAN DATABASE...</span>
            </div>
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="text-5xl mb-4 opacity-20">🎯</div>
            <div className="text-[11px] font-black uppercase tracking-[0.2em] text-center" style={{ color: '#333' }}>NO_SCANS_LOGGED</div>
            <div className="mt-2 text-[10px] text-gray-700 text-center">Muncul ketika user menginput nama di OSINT Terminal</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: 'rgba(0,0,0,0.35)' }}>
                  {['#', 'Nama Lengkap Target', 'IP (masked)', 'Scan ke-', 'Waktu Scan', 'Actions'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '14px 18px', fontWeight: 800, fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', borderBottom: '1px solid rgba(255,255,255,0.04)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, i) => {
                  const d = new Date(row.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
                  const scanN = ipDayCounts[`${row.ip}|${d}`];
                  const isNew = i === 0;
                  return (
                    <tr
                      key={row.id}
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', background: i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent', transition: 'background 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(155,89,182,0.05)'}
                      onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent'}
                    >
                      {/* ID */}
                      <td style={{ padding: '14px 18px', color: '#2a2a40', fontFamily: 'monospace', fontSize: '11px' }}>#{row.id}</td>

                      {/* Full Name */}
                      <td style={{ padding: '14px 18px' }}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-[13px] flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg, rgba(155,89,182,0.15), rgba(0,180,216,0.1))', border: '1px solid rgba(155,89,182,0.2)', color: '#9b59b6' }}>
                            {row.full_name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <div className="font-black tracking-tight" style={{ color: '#fff', fontSize: '13px' }}>
                              {row.full_name}
                            </div>
                            {isNew && (
                              <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded" style={{ background: 'rgba(0,255,136,0.1)', color: '#00ff88', border: '1px solid rgba(0,255,136,0.2)' }}>NEW</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* IP Masked */}
                      <td style={{ padding: '14px 18px' }}>
                        <span className="font-mono text-[11px]" style={{ color: '#444', background: 'rgba(0,0,0,0.3)', padding: '3px 8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.04)' }}>
                          {maskIp(row.ip)}
                        </span>
                      </td>

                      {/* Scan count that day */}
                      <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 3 }, (_, j) => (
                            <div key={j} className="w-3 h-3 rounded-sm" style={{
                              background: j < scanN ? '#9b59b6' : 'rgba(255,255,255,0.05)',
                              boxShadow: j < scanN ? '0 0 4px #9b59b6' : 'none',
                            }} />
                          ))}
                          <span className="text-[10px] font-mono ml-1" style={{ color: scanN >= 3 ? '#ff4444' : '#555' }}>{scanN}/3</span>
                        </div>
                      </td>

                      {/* Timestamp */}
                      <td style={{ padding: '14px 18px', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                        <div style={{ color: '#555', fontSize: '11px' }}>{d}</div>
                        <div style={{ color: '#333', fontSize: '10px' }}>
                          {new Date(row.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </div>
                      </td>

                      {/* Delete */}
                      <td style={{ padding: '14px 18px' }}>
                        <button
                          onClick={() => setConfirmId(row.id)}
                          style={{ fontSize: '10px', padding: '5px 12px', borderRadius: '6px', background: 'rgba(230,57,70,0.08)', color: '#e63946', border: '1px solid rgba(230,57,70,0.15)', cursor: 'pointer', fontWeight: 800, letterSpacing: '0.05em', transition: 'all 0.2s' }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(230,57,70,0.2)'; e.currentTarget.style.borderColor = '#e63946'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(230,57,70,0.08)'; e.currentTarget.style.borderColor = 'rgba(230,57,70,0.15)'; }}
                        >
                          🗑 DEL
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {confirmId && <ConfirmDelete onConfirm={handleDelete} onCancel={() => setConfirmId(null)} />}
    </div>
  );
};
const MessagesList = () => {

  const [data, setData] = useState([]);
  const [confirmId, setConfirmId] = useState(null);

  useEffect(() => { fetchData(); }, []);
  const fetchData = async () => { try { const { data } = await axios.get(`${API}/api/messages`); setData(data); } catch {} };
  const handleDelete = async () => { await axios.delete(`${API}/api/messages/${confirmId}`); setConfirmId(null); fetchData(); };

  return (
    <div className="p-8">
      <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ background: '#0e101a', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center justify-between px-6 py-5 bg-white/5 border-b border-white/5">
          <span className="text-white font-black text-[14px] uppercase tracking-widest">Incoming Messages <span className="text-[#00b4d8] ml-2">[{data.length}]</span></span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', background: '#0c0e18' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <th style={{ padding: '15px 20px', color: '#666', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>ID</th>
                <th style={{ padding: '15px 20px', color: '#666', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Date</th>
                <th style={{ padding: '15px 20px', color: '#666', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Email</th>
                <th style={{ padding: '15px 20px', color: '#666', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Content</th>
                <th style={{ padding: '15px 20px', color: '#666', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map(row => (
                <tr key={row.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', transition: 'background 0.2s', ':hover': { background: 'rgba(255,255,255,0.01)' } }}>
                  <td style={{ padding: '15px 20px', color: '#888', fontSize: '13px' }}>#{row.id}</td>
                  <td style={{ padding: '15px 20px', color: '#888', fontSize: '13px' }}>{new Date(row.created_at).toLocaleString()}</td>
                  <td style={{ padding: '15px 20px', color: '#fff', fontSize: '14px', fontWeight: 'bold' }}>{row.email}</td>
                  <td style={{ padding: '15px 20px', color: '#aaa', fontSize: '13px', maxWidth: '300px', whiteSpace: 'pre-wrap' }}>{row.content}</td>
                  <td style={{ padding: '15px 20px', textAlign: 'right' }}>
                    <button onClick={() => setConfirmId(row.id)} style={{ color: '#ff4444', fontSize: '12px', background: 'transparent', border: 'none', cursor: 'pointer', padding: '5px' }}>DEL</button>
                  </td>
                </tr>
              ))}
              {data.length === 0 && <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#555', fontSize: '12px', letterSpacing: '0.1em', fontFamily: "'VT323',monospace" }}>NO_MESSAGES_FOUND</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      {confirmId && <ConfirmDelete onConfirm={handleDelete} onCancel={() => setConfirmId(null)} />}
    </div>
  );
};
