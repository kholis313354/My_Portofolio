import React, { useState, useEffect } from 'react';
import OsintTerminal from './OsintTerminal';
import FirefoxWindow from './FirefoxWindow';
import TryHackMeWindow from './TryHackMeWindow';
import HackTheBoxWindow from './HackTheBoxWindow';
import TerminalPage from './TerminalPage';
import FilesWindow from './FilesWindow';

export default function ParrotDesktop({ setPage }) {
  const [showNotepad, setShowNotepad] = useState(false);
  const [showOsint, setShowOsint] = useState(false);
  const [showFirefox, setShowFirefox] = useState(false);
  const [showTHM, setShowTHM] = useState(false);
  const [showHTB, setShowHTB] = useState(false);
  const [showTerminalQuiz, setShowTerminalQuiz] = useState(false);
  const [showFiles, setShowFiles] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState(null);
  const [time, setTime] = useState("");
  const [dateStr, setDateStr] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }));
      setDateStr(now.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }));
    };
    updateTime();
    const intv = setInterval(updateTime, 1000);

    const notepadTimeout = setTimeout(() => {
      setShowNotepad(true);
    }, 1200);

    return () => {
      clearInterval(intv);
      clearTimeout(notepadTimeout);
    };
  }, []);

  const handleClose = () => {
    setShowNotepad(false);
  };

  return (
    <div className="w-full h-full bg-black fixed inset-0 z-50 flex flex-col font-sans overflow-hidden">
      <style>
        {`
          @keyframes slideIn {
            from { transform: translateY(-20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          .icon-label { text-shadow: 1px 1px 2px black, 0 0 4px black; }

          @keyframes cpuGraph1 { 0% { height: 30%; } 20% { height: 80%; } 40% { height: 50%; } 60% { height: 90%; } 80% { height: 40%; } 100% { height: 30%; } }
          @keyframes cpuGraph2 { 0% { height: 50%; } 20% { height: 30%; } 40% { height: 70%; } 60% { height: 40%; } 80% { height: 80%; } 100% { height: 50%; } }
          @keyframes cpuGraph3 { 0% { height: 80%; } 20% { height: 40%; } 40% { height: 90%; } 60% { height: 50%; } 80% { height: 70%; } 100% { height: 80%; } }
          @keyframes cpuGraph4 { 0% { height: 40%; } 20% { height: 90%; } 40% { height: 30%; } 60% { height: 80%; } 80% { height: 50%; } 100% { height: 40%; } }
          
          .cpu-bar { background-color: #00ff41; bottom: 0; transition: height 0.1s; }
          .ram-bar { background-color: #00b4d8; bottom: 0; transition: height 0.1s; }
          
          .cpu-bar-1 { animation: cpuGraph1 1.5s infinite; }
          .cpu-bar-2 { animation: cpuGraph2 1.2s infinite; }
          .cpu-bar-3 { animation: cpuGraph3 1.8s infinite; }
          .cpu-bar-4 { animation: cpuGraph4 1.4s infinite; }
          .cpu-bar-5 { animation: cpuGraph1 1.6s infinite alternate; }
          .cpu-bar-6 { animation: cpuGraph2 1.3s infinite alternate; }
          .cpu-bar-7 { animation: cpuGraph3 1.7s infinite alternate; }
          .cpu-bar-8 { animation: cpuGraph4 1.1s infinite alternate; }
        `}
      </style>

      {/* Taskbar */}
      <div className="w-full h-[28px] bg-[#101010] border-b border-[#222] flex justify-between items-center px-2 z-50 relative select-none shadow-[0_2px_4px_rgba(0,0,0,0.5)]">

        {/* Left Icons */}
        <div className="flex space-x-3 items-center h-full">
          <div className="flex items-center justify-center w-6 h-6 hover:bg-white/10 rounded cursor-pointer overflow-hidden p-0.5">
            <img src="/images/parrot-logo.jpg" alt="Parrot OS" className="w-full h-full object-cover rounded-full" />
          </div>

          {/* Top Menu Labels (Parrot OS Style) */}
          <div className="hidden md:flex space-x-1 items-center h-full text-[12px] text-[#e0e0e0]">
            <span className="hover:bg-white/10 px-2 py-1 rounded cursor-pointer transition-colors">Applications</span>
            <span className="hover:bg-white/10 px-2 py-1 rounded cursor-pointer transition-colors">Places</span>
            <span className="hover:bg-white/10 px-2 py-1 rounded cursor-pointer transition-colors">System</span>
          </div>

          {/* Quick Action Icons */}
          <div className="hidden sm:flex items-center space-x-1 border-l border-gray-700 pl-2 ml-2">
            {/* Menu Alternate Context */}
            <div className="flex items-center justify-center w-6 h-6 hover:bg-white/10 border border-transparent hover:border-gray-600 rounded cursor-pointer text-gray-300">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
              </svg>
            </div>
            {/* Firefox */}
            <div className="flex items-center justify-center w-6 h-6 hover:bg-white/10 border border-transparent hover:border-gray-600 rounded cursor-pointer transition-all" onClick={() => setShowFirefox(true)}>
              <div className="w-[14px] h-[14px] rounded-full overflow-hidden shadow-sm">
                <img src="/images/firefox.jpg" className="w-full h-full object-cover" alt="Firefox" />
              </div>
            </div>
            {/* Terminal */}
            <div className="flex items-center justify-center w-6 h-6 hover:bg-white/10 border border-transparent hover:border-gray-600 rounded cursor-pointer text-gray-300 transition-all" onClick={() => setShowTerminalQuiz(true)}>
              <div className="w-[16px] h-[12px] bg-[#1a1a1a] border border-gray-500 rounded flex items-center px-0.5 shadow-inner">
                <span className="text-[6px] text-green-500 font-mono font-bold leading-none">{'>_'}</span>
              </div>
            </div>
            {/* Files */}
            <div className="flex items-center justify-center w-6 h-6 hover:bg-white/10 border border-transparent hover:border-gray-600 rounded cursor-pointer text-[#00b4d8] transition-all" onClick={() => setShowFiles(true)}>
              <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Center Graphic CPU */}
        <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center space-x-5 h-full pointer-events-none">
          {/* CPU Graph */}
          <div className="flex items-center space-x-1.5" title="CPU Usage">
            <span className="text-[10px] text-gray-300 font-mono tracking-wider">CPU</span>
            <div className="flex items-end space-x-[1px] w-[28px] h-[14px] bg-black border border-gray-800 p-[1px] rounded-[2px] overflow-hidden shadow-inner flex-nowrap shrink-0">
              <div className="cpu-bar cpu-bar-1 w-[2px]"></div>
              <div className="cpu-bar cpu-bar-2 w-[2px]"></div>
              <div className="cpu-bar cpu-bar-3 w-[2px]"></div>
              <div className="cpu-bar cpu-bar-4 w-[2px]"></div>
              <div className="cpu-bar cpu-bar-5 w-[2px]"></div>
              <div className="cpu-bar cpu-bar-6 w-[2px]"></div>
              <div className="cpu-bar cpu-bar-7 w-[2px]"></div>
              <div className="cpu-bar cpu-bar-8 w-[2px]"></div>
            </div>
          </div>
          {/* RAM Graph */}
          <div className="flex items-center space-x-1.5" title="Memory Usage">
            <span className="text-[10px] text-gray-300 font-mono tracking-wider">MEM</span>
            <div className="flex items-end space-x-[1px] w-[28px] h-[14px] bg-black border border-gray-800 p-[1px] rounded-[2px] overflow-hidden shadow-inner flex-nowrap shrink-0">
              <div className="ram-bar cpu-bar-4 w-[2px]"></div>
              <div className="ram-bar cpu-bar-2 w-[2px]"></div>
              <div className="ram-bar cpu-bar-7 w-[2px]"></div>
              <div className="ram-bar cpu-bar-1 w-[2px]"></div>
              <div className="ram-bar cpu-bar-5 w-[2px]"></div>
              <div className="ram-bar cpu-bar-8 w-[2px]"></div>
              <div className="ram-bar cpu-bar-3 w-[2px]"></div>
              <div className="ram-bar cpu-bar-6 w-[2px]"></div>
            </div>
          </div>
        </div>

        {/* Right Info */}
        <div className="flex items-center h-full pr-1 space-x-4 text-gray-300">

          {/* Workspaces */}
          <div className="hidden lg:flex border border-gray-600 rounded-[3px] overflow-hidden opacity-80 hover:opacity-100 transition-opacity cursor-pointer">
            <div className="px-1.5 py-[1px] text-[9.5px] font-mono border-r border-gray-600 bg-[#222] hover:bg-gray-700">1</div>
            <div className="px-1.5 py-[1px] text-[9.5px] font-mono border-r border-gray-600 bg-[#222] hover:bg-gray-700">2</div>
            <div className="px-1.5 py-[1px] text-[9.5px] font-mono border-r border-gray-600 bg-[#222] hover:bg-gray-700">3</div>
            <div className="px-1.5 py-[1px] text-[9.5px] font-mono bg-[#00b4d8] text-white">4</div>
          </div>

          {/* System Tray Icons */}
          <div className="flex items-center space-x-3">
            {/* Monitor/Network */}
            <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" className="hover:text-white cursor-pointer transition-colors"><path d="M21 2H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h7v2H8v2h8v-2h-2v-2h7c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H3V4h18v12z" /></svg>
            {/* Battery */}
            <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" className="hover:text-white cursor-pointer transition-colors"><path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z" /></svg>
            {/* Volume */}
            <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" className="hover:text-white cursor-pointer transition-colors"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" /></svg>
            {/* Settings */}
            <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" className="hover:text-white cursor-pointer transition-colors"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" /></svg>
          </div>

          {/* Time & Date */}
          <div className="flex flex-col items-end leading-none justify-center h-full cursor-pointer hover:bg-white/10 px-1 rounded transition-colors">
            <span className="text-[11.5px] font-mono whitespace-nowrap text-[#e0e0e0] font-semibold">{time}</span>
            <span className="text-[9px] text-[#909090] font-sans mt-[2px]">{dateStr}</span>
          </div>
        </div>
      </div>

      {/* Main Desktop Space */}
      <div className="relative flex-grow h-full w-full">

        {/* Real Wallpaper Image */}
        <img src="/images/parrot-wallpaper.jpg" alt="Wallpaper" className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0" />

        {/* Desktop Icons Container */}
        <div className="absolute top-4 left-4 flex flex-col items-center space-y-[30px] z-10">

          <div className="flex flex-col items-center w-16 cursor-pointer hover:bg-white/10 rounded p-1">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="white">
              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm-2 16c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm1-4h-2V7h2v7z" />
            </svg>
            <span className="text-white text-[10px] mt-1 icon-label">README.md</span>
          </div>

          <div className="flex flex-col items-center w-16 cursor-pointer hover:bg-white/10 rounded p-1" onClick={() => setShowTerminalQuiz(true)}>
            <div className="w-10 h-10 rounded bg-[#1e1e1e] flex flex-col justify-between border border-gray-600 shadow-md">
              <div className="h-3 bg-gray-300 rounded-t-sm flex items-center px-1">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
              </div>
              <div className="text-[#00ff41] text-[10px] pl-1 font-mono leading-none">&gt;_</div>
            </div>
            <span className="text-white text-[10px] mt-1 icon-label">Terminal</span>
          </div>

          <div className="flex flex-col items-center w-16 cursor-pointer hover:bg-white/10 rounded p-1" onClick={() => setShowFiles(true)}>
            <svg viewBox="0 0 24 24" width="32" height="32" fill="#3b82f6">
              <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
            </svg>
            <span className="text-white text-[10px] mt-1 icon-label">Files</span>
          </div>

          <div className="flex flex-col items-center w-16 cursor-pointer hover:bg-white/10 rounded p-1" onClick={() => setShowFirefox(true)}>
            <div className="w-8 h-8 rounded-full overflow-hidden border border-orange-500/30 shadow-md">
              <img src="/images/firefox.jpg" className="w-full h-full object-cover" alt="Firefox ESR" />
            </div>
            <span className="text-white text-[10px] mt-1 icon-label whitespace-nowrap">Firefox ESR</span>
          </div>

          {/* OSINT Tool */}
          <div className="flex flex-col items-center w-16 cursor-pointer hover:bg-white/10 rounded p-1 group" onClick={() => setShowOsint(true)}>
            <div className="w-10 h-10 rounded-full border border-[#00b4d8] flex items-center justify-center bg-[#0d0d0d] transition-shadow group-hover:shadow-[0_0_10px_#00b4d8]">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="#00b4d8">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                <circle cx="9.5" cy="9.5" r="2.5" fill="#00b4d8" />
              </svg>
            </div>
            <span className="text-[#00b4d8] text-[10px] mt-1 font-mono font-bold icon-label transition-colors">OSINT</span>
          </div>

          <div className="flex flex-col items-center w-16 cursor-pointer hover:bg-white/10 rounded p-1 group" onClick={() => setShowTHM(true)}>
            <div className="w-12 h-12 rounded-full overflow-hidden transition-all duration-200 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_#c11111]">
              <img src="/images/TryHackMe.png" alt="TryHackMe" className="w-full h-full object-cover" />
            </div>
            <span className="text-white text-[11px] mt-1 font-mono icon-label">TryHackMe</span>
          </div>

          <div className="flex flex-col items-center w-16 cursor-pointer hover:bg-white/10 rounded p-1 group" onClick={() => setShowHTB(true)}>
            <div className="w-12 h-12 rounded-full overflow-hidden transition-all duration-200 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_#9fef00]">
              <img src="/images/hackthebox.png" alt="HackTheBox" className="w-full h-full object-cover" />
            </div>
            <span className="text-white text-[11px] mt-1 font-mono icon-label whitespace-nowrap">HackTheBox</span>
          </div>

          <div
            onClick={() => setPage(4)}
            className="flex flex-col items-center w-16 cursor-pointer hover:bg-white/10 rounded p-1 group mt-4 transition-transform hover:scale-110"
          >
            <div className="w-10 h-10 rounded-full border-2 border-[#00b4d8] flex items-center justify-center bg-black shadow-[0_0_8px_#00b4d8] group-hover:shadow-[0_0_15px_#00b4d8] transition-shadow">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="#00b4d8">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
            <span className="text-[#00b4d8] text-[10px] mt-1 whitespace-nowrap font-bold icon-label">[ My Profile ]</span>
          </div>

        </div>

        {/* Auto-open gedit Window */}
        {showNotepad && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 pointer-events-none">
            <div className="w-full max-w-[420px] bg-[#1e1e1e] border border-gray-600 rounded shadow-2xl flex flex-col pointer-events-auto"
              style={{ animation: 'slideIn 0.3s ease-out forwards' }}>

              {/* Title Bar */}
              <div className="h-[28px] sm:h-[32px] bg-[#2d2d2d] rounded-t flex justify-between items-center px-2 border-b border-[#222]">
                <div className="flex items-center space-x-2 overflow-hidden pr-2">
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="#a0a0a0" className="flex-shrink-0"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm-2 16c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm1-4h-2V7h2v7z" /></svg>
                  <span className="text-white text-[10px] sm:text-[12px] whitespace-nowrap truncate">README.md - Notepad</span>
                </div>
                <div className="flex space-x-1">
                  <button className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center hover:bg-gray-600 rounded text-gray-300">
                    <svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor"><path d="M19 13H5v-2h14v2z" /></svg>
                  </button>
                  <button className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center hover:bg-gray-600 rounded text-gray-300">
                    <svg viewBox="0 0 24 24" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /></svg>
                  </button>
                  <button onClick={handleClose} className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center hover:bg-[#cc3333] hover:text-white rounded text-gray-300 transition-colors">
                    <svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>
                  </button>
                </div>
              </div>

              {/* Menu Bar */}
              <div className="h-[20px] sm:h-[24px] bg-[#383838] flex items-center px-1 border-b border-[#2b2b2b] gap-1 sm:gap-2 overflow-x-auto hide-scrollbar flex-nowrap">
                {['File', 'Edit', 'View', 'Search', 'Tools', 'Documents', 'Help'].map(m => (
                  <span key={m} className="text-[#cccccc] text-[9px] sm:text-[11px] px-1 hover:bg-black/20 rounded cursor-pointer whitespace-nowrap">{m}</span>
                ))}
              </div>

              {/* Editor Area */}
              <div className="flex bg-[#1e1e1e] h-[190px] sm:h-[230px] rounded-b overflow-hidden w-full min-w-0">
                {/* Content */}
                <div className="flex-1 w-full min-w-0 p-[10px] sm:p-[14px] overflow-y-auto overflow-x-hidden text-[#d4d4d4] text-[9px] sm:text-[11.5px] leading-[1.6] whitespace-pre-wrap break-words" style={{ fontFamily: "'Courier New', monospace" }}>
                  {`  1  [ ARAHAN TOMBOL BUTTON ]
  2  ---
  3  [*] Terminal
  4  [*] Firefox ESR
  5  [*] OSINT
  6  [*] TryHackMe
  7  [*] HackTheBox
  8  [*] My Profile
  9  --- `}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* OSINT Terminal Window Modal */}
        {showOsint && <OsintTerminal onClose={() => setShowOsint(false)} />}

        {showTerminalQuiz && <TerminalPage onAccessGranted={() => setPage(4)} onClose={() => setShowTerminalQuiz(false)} />}

        {showTHM && <TryHackMeWindow onClose={() => setShowTHM(false)} />}
        {showHTB && <HackTheBoxWindow onClose={() => setShowHTB(false)} />}
        {showFiles && <FilesWindow onClose={() => setShowFiles(false)} />}

        {/* Firefox ESR GeoLocation Modal */}
        <FirefoxWindow
          showFirefox={showFirefox}
          onClose={() => {
            setShowFirefox(false);
            setUserLocation(null);
            setLocationLoading(true);
            setLocationError(null);
          }}
          userLocation={userLocation}
          setUserLocation={setUserLocation}
          locationLoading={locationLoading}
          setLocationLoading={setLocationLoading}
          locationError={locationError}
          setLocationError={setLocationError}
        />

      </div>
    </div>
  );
}
