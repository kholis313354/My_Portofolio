import React, { useState, useEffect, useRef } from 'react';
import useDraggable from './hooks/useDraggable';
import WindowControls from './components/WindowControls';

export default function FilesWindow({ onClose }) {
  const { pos, setPos, isDragging, handleMouseDown } = useDraggable();
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [parrotAlert, setParrotAlert] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const alertAudio = useRef(null);

  useEffect(() => {
    alertAudio.current = new Audio('/audio/danger-alarm-sound-effect-meme2.mp3');
    // Center the window on mount
    const w = Math.min(750, window.innerWidth - 16);
    const h = Math.min(500, window.innerHeight - 60);
    setPos({ x: (window.innerWidth - w) / 2, y: (window.innerHeight - h) / 2 });
  }, []);

  const handleSidebarClick = (label) => {
    setShowSidebar(false);
    setParrotAlert(label);
    alertAudio.current?.play().catch(() => { });
  };

  const places = [
    { icon: '🏠', label: 'Home' },
    { icon: '🖥️', label: 'Desktop' },
    { icon: '📄', label: 'Documents' },
    { icon: '⬇️', label: 'Downloads' },
    { icon: '🎵', label: 'Music' },
    { icon: '🖼️', label: 'Pictures', active: true },
    { icon: '🎬', label: 'Videos' },
    { icon: '🗑️', label: 'Trash' },
  ];

  const isMobile = window.innerWidth < 600;

  return (
    <>
      <div
        className="fixed z-[9995] flex flex-col pointer-events-auto rounded-[8px] overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.8)]"
        style={{
          width: Math.min(750, window.innerWidth - 16),
          height: Math.min(500, window.innerHeight - 60),
          top: Math.max(0, pos.y),
          left: Math.max(0, pos.x),
          backgroundColor: '#1E2124',
          animation: 'fileWinIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
        }}
      >
        <style>{`
          @keyframes fileWinIn { 0% { transform: scale(0.9); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
          @keyframes alertSlideIn { 0% { transform: translateY(-20px) scale(0.95); opacity: 0; } 100% { transform: translateY(0) scale(1); opacity: 1; } }
          @keyframes parrotPulse { 0%,100% { box-shadow: 0 0 10px rgba(0,154,102,0.4); } 50% { box-shadow: 0 0 25px rgba(0,154,102,0.8); } }
          .dolphin-btn { padding: 3px 7px; border-radius: 4px; transition: background 0.15s; cursor: pointer; }
          .dolphin-btn:hover { background: rgba(255,255,255,0.1); }
        `}</style>

        {/* Windows-style Title Bar */}
        <div
          className="h-[34px] bg-[#16181A] flex items-center justify-between select-none border-b border-black flex-shrink-0 overflow-hidden"
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center pl-3 gap-2 overflow-hidden">
            {/* Mobile: hamburger to toggle sidebar */}
            <button
              className="flex sm:hidden items-center justify-center w-6 h-6 text-gray-400 hover:text-white"
              onClick={(e) => { e.stopPropagation(); setShowSidebar(!showSidebar); }}
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" /></svg>
            </button>
            <svg viewBox="0 0 24 24" width="13" height="13" fill="#3b82f6">
              <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
            </svg>
            <span className="text-[#A0A0A0] text-[11px] truncate">/home/kholis/Pictures — Dolphin</span>
          </div>

          <WindowControls onClose={onClose} buttonWidth={38} iconSize={11} className="flex-shrink-0" />
        </div>

        {/* Toolbar */}
        <div className="h-[38px] bg-[#222629] flex items-center px-2 border-b border-[#1A1C1E] flex-shrink-0 gap-1">
          <div className="flex items-center gap-0.5 text-[#A0A0A0] text-[13px] flex-shrink-0">
            <div className="dolphin-btn opacity-50 text-[11px]">&lt;</div>
            <div className="dolphin-btn opacity-50 text-[11px]">&gt;</div>
          </div>
          <div className="flex-1 flex items-center mx-1 min-w-0">
            <div className="flex items-center bg-[#1A1C1E] rounded px-2 py-1 w-full border border-[#333] text-[#cfcfcf] text-[11px] min-w-0 overflow-hidden">
              <span className="text-[#666] mr-1 flex-shrink-0">/ &gt;</span>
              <span className="truncate">home &gt; kholis &gt; <strong className="text-white">Pictures</strong></span>
            </div>
          </div>
          <div className="dolphin-btn text-[#A0A0A0] text-[13px] flex-shrink-0">🔍</div>
        </div>

        {/* Main Body */}
        <div className="flex flex-1 overflow-hidden relative">

          {/* Sidebar — hidden on mobile, overlay-toggle */}
          <div
            className={'flex-col py-2 overflow-y-auto flex-shrink-0 bg-[#1E2124] border-r border-[#151719] transition-all duration-200 '
              + (isMobile
                ? (showSidebar ? 'absolute inset-y-0 left-0 z-20 w-[155px] flex shadow-xl' : 'hidden')
                : 'hidden sm:flex w-[155px]'
              )
            }
          >
            <SidebarContent places={places} handleSidebarClick={handleSidebarClick} />
          </div>

          {/* Mobile overlay backdrop */}
          {isMobile && showSidebar && (
            <div className="absolute inset-0 z-10 bg-black/50" onClick={() => setShowSidebar(false)} />
          )}

          {/* Content Area */}
          <div className="flex-1 flex flex-col bg-[#2A2E32] overflow-y-auto">
            <div className="p-3 grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))' }}>
              <div
                onClick={() => setShowImagePreview(true)}
                className="flex flex-col items-center gap-1.5 cursor-pointer p-2 rounded hover:bg-white/10 transition-colors group"
              >
                <div className="w-[70px] h-[70px] bg-[#1E2124] rounded border border-[#444] flex items-center justify-center overflow-hidden shadow-md group-hover:shadow-[0_0_12px_rgba(0,154,102,0.6)] group-hover:border-[#009A66] transition-all">
                  <img src="/images/profile2.png" alt="profile2" className="w-full h-full object-cover" />
                </div>
                <span className="text-[#cfcfcf] text-[10px] truncate max-w-full text-center group-hover:text-white">profile2.png</span>
              </div>
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div className="h-[20px] bg-[#1E2124] border-t border-[#151719] flex items-center px-3 text-[10px] text-[#777] flex-shrink-0">
          0 folders, 1 file
        </div>
      </div>

      {/* Image Lightbox */}
      {showImagePreview && (
        <div
          className="fixed inset-0 z-[99998] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
          onClick={() => setShowImagePreview(false)}
        >
          <div
            className="relative flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: 'fileWinIn 0.2s ease-out forwards', maxWidth: '90vw' }}
          >
            <button
              onClick={() => setShowImagePreview(false)}
              className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-[#e81123] text-white flex items-center justify-center hover:bg-red-700 transition-colors z-10 shadow-lg"
            >
              <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>
            </button>
            <img
              src="/images/profile2.png"
              alt="profile2.png"
              style={{
                maxWidth: '80vw',
                maxHeight: '65vh',
                width: 'auto',
                height: 'auto',
              }}
              className="rounded-lg shadow-[0_0_30px_rgba(0,154,102,0.5)] border border-[#009A66]/50 object-contain"
            />
            <div className="text-[#a0a0a0] text-[10px] mt-2 font-mono">profile2.png — /home/kholis/Pictures/</div>
          </div>
        </div>
      )}

      {/* Parrot OS Alert */}
      {parrotAlert && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 pointer-events-none">
          <div
            className="pointer-events-auto bg-[#1E2124] border border-[#009A66] rounded-lg shadow-[0_0_30px_rgba(0,154,102,0.4)] overflow-hidden w-full"
            style={{ maxWidth: 360, animation: 'alertSlideIn 0.25s ease-out forwards' }}
          >
            <div className="h-[32px] bg-[#16181A] flex items-center justify-between px-3 border-b border-[#009A66]/30">
              <div className="flex items-center gap-2">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="#009A66"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" /></svg>
                <span className="text-[#cfcfcf] text-[11px] font-mono">Parrot OS — System Alert</span>
              </div>
              <button onClick={() => setParrotAlert(null)} className="w-5 h-5 flex items-center justify-center hover:bg-[#e81123] rounded text-gray-400 hover:text-white transition-colors">
                <svg viewBox="0 0 24 24" width="9" height="9" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>
              </button>
            </div>
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[#009A66]/20 border border-[#009A66]/50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  <img src="/images/parrot-logo.jpg" alt="Parrot Logo" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[#009A66] font-mono font-bold text-[13px] mb-1">ACCESS RESTRICTED</div>
                  <div className="text-[#cfcfcf] text-[11px] leading-relaxed font-mono">
                    <span className="text-[#febc2e]">[WARN]</span> Lokasi{' '}
                    <span className="text-[#00f3ff] break-all">"/home/kholis/{parrotAlert}"</span> tidak dapat diakses.
                  </div>
                  <div className="mt-2 bg-[#0d0d0d] rounded p-2 border border-[#333] font-mono text-[9px]">
                    <div className="text-[#00f3ff]">kholis@parrot:~$ <span className="text-[#cfcfcf]">cd "{parrotAlert}"</span></div>
                    <div className="text-[#ff4444]">bash: Permission denied</div>
                    <div className="text-[#888]">Exit code: 1</div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-3">
                <button
                  onClick={() => setParrotAlert(null)}
                  className="px-4 py-1.5 bg-[#009A66] text-white text-[11px] font-mono rounded hover:bg-[#007a52] transition-colors"
                >
                  [ OK ]
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function SidebarContent({ places, handleSidebarClick }) {
  return (
    <>
      <div className="text-[9px] text-[#A0A0A0] uppercase px-3 mb-1 font-semibold tracking-wider">Places</div>
      {places.map((place, i) => (
        <div
          key={i}
          onClick={() => !place.active && handleSidebarClick(place.label)}
          className={'flex items-center gap-2 px-3 py-1.5 text-[11px] transition-colors '
            + (place.active ? 'bg-[#009A66] text-white cursor-default' : 'text-[#cfcfcf] hover:bg-white/5 cursor-pointer')}
        >
          <span className="text-[12px] flex-shrink-0">{place.icon}</span>
          <span className="truncate">{place.label}</span>
        </div>
      ))}

      <div className="text-[9px] text-[#A0A0A0] uppercase px-3 mt-3 mb-1 font-semibold tracking-wider">Remote</div>
      <div onClick={() => handleSidebarClick('Network')} className="flex items-center gap-2 px-3 py-1.5 text-[11px] text-[#cfcfcf] hover:bg-white/5 cursor-pointer transition-colors">
        <span className="text-[12px]">🌐</span><span>Network</span>
      </div>

      <div className="text-[9px] text-[#A0A0A0] uppercase px-3 mt-3 mb-1 font-semibold tracking-wider">Recent</div>
      <div onClick={() => handleSidebarClick('Recent Files')} className="flex items-center gap-2 px-3 py-1.5 text-[11px] text-[#cfcfcf] hover:bg-white/5 cursor-pointer transition-colors">
        <span className="text-[12px]">🕒</span><span>Recent Files</span>
      </div>

      <div className="text-[9px] text-[#A0A0A0] uppercase px-3 mt-3 mb-1 font-semibold tracking-wider">Devices</div>
      <div onClick={() => handleSidebarClick('Internal Drive (sda1)')} className="flex items-center gap-2 px-3 py-1.5 text-[11px] text-[#cfcfcf] hover:bg-white/5 cursor-pointer transition-colors">
        <span className="flex-shrink-0">💽</span>
        <div className="flex-1 min-w-0">
          <div className="text-white text-[9px] truncate">90.0 GiB Internal Drive (sda1)</div>
          <div className="w-full h-[3px] bg-[#333] rounded mt-0.5"><div className="w-[70%] h-full bg-[#009A66] rounded"></div></div>
        </div>
      </div>
      <div onClick={() => handleSidebarClick('Parrot security 7.1')} className="flex items-center gap-2 px-3 py-1.5 text-[11px] text-[#a0a0a0] hover:bg-white/5 cursor-pointer transition-colors mt-0.5">
        <span className="text-[12px]">💿</span><span>Parrot security 7.1</span>
      </div>
    </>
  );
}
