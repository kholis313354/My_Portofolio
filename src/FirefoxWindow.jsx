import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

class MapErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Map rendering error:", error, errorInfo);
    this.setState({ errorInfo });
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full bg-[#1e1e1e] text-red-500 font-mono p-4 overflow-auto">
          <h2 className="text-xl font-bold mb-4">CRITICAL RENDER FAILURE</h2>
          <p className="mb-2 uppercase">{this.state.error && this.state.error.toString()}</p>
          <pre className="text-[10px] text-gray-400 break-words whitespace-pre-wrap">
            {this.state.error?.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

// Fix leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom red/cyber marker icon:
const cyberIcon = L.divIcon({
  className: '',
  html: `<div style="
    width: 20px; height: 20px;
    background: #ff2244;
    border: 2px solid #ff6688;
    border-radius: 50%;
    box-shadow: 0 0 12px #ff2244, 0 0 24px #ff224466;
    animation: pulse 1.5s infinite;
  "></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

function LeafletNativeMap({ lat, lng, accuracy, timestamp }) {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const map = L.map(mapRef.current, {
      center: [lat, lng],
      zoom: 15,
      zoomControl: true
    });

    // Remove Leaflet default prefix (which contains the flag & leaflet link)
    if (map.attributionControl) {
      map.attributionControl.setPrefix(false);
    }

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    L.circle([lat, lng], {
      color: '#ff2244',
      fillColor: '#ff224422',
      fillOpacity: 0.3,
      radius: accuracy || 0
    }).addTo(map);

    L.marker([lat, lng], { icon: cyberIcon })
      .bindPopup(`<div style="font-family: monospace; font-size: 12px;"><strong>📍 YOUR LOCATION</strong><br/>Lat: ${(lat || 0).toFixed(6)}<br/>Lng: ${(lng || 0).toFixed(6)}<br/>Accuracy: &plusmn;${Math.round(accuracy || 0)}m<br/>Time: ${timestamp}</div>`)
      .addTo(map);

    return () => {
      map.remove();
    };
  }, [lat, lng, accuracy, timestamp]);

  return <div ref={mapRef} style={{ width: '100%', height: '100%', zIndex: 1 }} />;
}

export default function FirefoxWindow({
  onClose,
  userLocation,
  setUserLocation,
  locationLoading,
  setLocationLoading,
  locationError,
  setLocationError,
  showFirefox
}) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // Terminal drag logic
  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      setPos({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y
      });
    };
    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, pos]);

  // Geolocation logic
  useEffect(() => {
    if (!showFirefox) return;

    const timer = setTimeout(() => {
      if (!navigator.geolocation) {
        setLocationError("Geolocation not supported");
        return;
      }

      // Force high accuracy, no cache
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude: lat, longitude: lon } = position.coords;
          setUserLocation({
            lat,
            lng: lon,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
          });

          // Kirim koordinat presisi ke database untuk ditampilkan di Firefox Map Admin
          axios.post('/api/breach', { lat, lon, source: 'firefox_esr' }).catch(err => console.error("Firefox Tracking Error:", err));

          setLocationLoading(false);
          navigator.geolocation.clearWatch(watchId);
        },
        (error) => {
          console.error(error);
          setLocationError(error.message || "Failed to retrieve location.");
          setLocationLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0  // Force fresh location, no cache
        }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }, 1500);

    return () => clearTimeout(timer);
  }, [showFirefox, setLocationError, setLocationLoading, setUserLocation]);

  if (!showFirefox) return null;

  return (
    <div
      className="fixed z-[9998] flex flex-col rounded-t-[8px] overflow-hidden"
      style={{
        width: 720, height: 500, maxWidth: '95vw',
        top: `calc(50% + ${pos.y}px)`, left: `calc(50% + ${pos.x}px)`,
        transform: 'translate(-50%, -50%)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
        animation: 'firefoxScaleIn 0.3s ease-out forwards',
        backgroundColor: '#ffffff'
      }}
    >
      <style>{`
        @keyframes firefoxScaleIn {
          from { transform: translate(-50%, -50%) scale(0.95); opacity: 0; }
          to { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.7; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        /* Fix Leaflet z-index inside fixed container */
        .leaflet-container {
          z-index: 1 !important;
        }
        .leaflet-pane {
          z-index: 1 !important;  
        }
        .leaflet-top, .leaflet-bottom {
          z-index: 2 !important;
        }
      `}</style>

      {/* Title Bar */}
      <div
        className="h-[36px] cursor-move flex items-center justify-between select-none overflow-hidden"
        style={{ background: 'linear-gradient(to bottom, #3a3a3a, #2d2d2d)', borderBottom: '1px solid #1a1a1a' }}
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center pl-[16px]">
          <div className="flex items-center justify-center">
            <svg viewBox="0 0 16 16" width="16" height="16">
              <circle cx="8" cy="8" r="6" fill="#0060df" />
              <path d="M8 2 C10 3, 13 5, 13 8 C13 11, 10 13, 8 14 C9 12, 10 10, 9 8 C11 7, 11 5, 8 2Z" fill="#ff9500" opacity="0.9" />
              <path d="M8 2 C6 3, 3 5, 3 8 C3 11, 6 13, 8 14 C7 12, 6 10, 7 8 C5 7, 5 5, 8 2Z" fill="#ff4000" opacity="0.8" />
            </svg>
          </div>
          <span className="text-[#e0e0e0] text-[13px] ml-[8px]">Mozilla Firefox ESR</span>
        </div>

        <div className="flex h-full">
          <button className="w-[45px] h-full flex items-center justify-center hover:bg-white/10 text-gray-400 transition-colors">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M19 13H5v-2h14v2z" /></svg>
          </button>
          <button className="w-[45px] h-full flex items-center justify-center hover:bg-white/10 text-gray-400 transition-colors">
            <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" /></svg>
          </button>
          <button onClick={onClose} className="w-[45px] h-full flex items-center justify-center hover:bg-[#e81123] hover:text-white text-gray-400 transition-colors">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>
          </button>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="h-[32px] bg-[#2b2b2b] flex items-end px-[8px]" style={{ borderBottom: '1px solid #111' }}>
        <div className="flex items-center bg-[#1e1e1e] h-[28px] rounded-t-[6px] px-[12px] w-[220px] max-w-full justify-between select-none">
          <div className="flex items-center space-x-[8px] overflow-hidden">
            <span className="text-[12px]">📍</span>
            <span className="text-[#e0e0e0] text-[12px] whitespace-nowrap truncate">Browser — Firefox ESR</span>
          </div>
          <span className="text-gray-400 text-[10px] cursor-pointer hover:text-white ml-[8px] ml-[20px]" onClick={onClose}>✕</span>
        </div>
        <div className="ml-[8px] text-gray-400 hover:text-white cursor-pointer h-[28px] flex items-center px-[8px] text-[18px] select-none">
          +
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="h-[40px] bg-[#1e1e1e] flex items-center px-[12px] gap-[8px]" style={{ borderBottom: '1px solid #111' }}>
        <span className="text-gray-500 cursor-default text-[18px]">←</span>
        <span className="text-gray-500 cursor-default text-[18px]">→</span>
        <span className="text-gray-300 cursor-pointer hover:text-white text-[16px]">↺</span>

        {/* Address Bar */}
        <div className="flex-1 h-[28px] bg-[#2a2a2e] rounded-[4px] flex items-center px-[12px] border border-[#4a4a4f] focus-within:border-[#00b3f4] transition-colors overflow-hidden mx-[8px]">
          <span className="text-green-500 text-[12px] mr-[8px]">🔒</span>
          <input
            type="text"
            className="bg-transparent border-none outline-none text-[#e0e0e0] text-[13px] w-full"
            defaultValue="file:///home/kholis/FirefoxWindow.html"
            readOnly
          />
        </div>

        <div className="flex space-x-[12px] text-gray-400 items-center text-[16px] select-none">
          <span className="cursor-pointer hover:text-white">🧩</span>
          <span className="cursor-pointer hover:text-white">≡</span>
        </div>
      </div>

      {/* Browser Content Area */}
      <div className="flex-1 bg-white relative">
        {locationLoading && !locationError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-[999]">
            <svg viewBox="0 0 16 16" width="48" height="48" className="mb-[16px] animate-pulse">
              <circle cx="8" cy="8" r="6" fill="#0060df" />
              <path d="M8 2 C10 3, 13 5, 13 8 C13 11, 10 13, 8 14 C9 12, 10 10, 9 8 C11 7, 11 5, 8 2Z" fill="#ff9500" opacity="0.9" />
              <path d="M8 2 C6 3, 3 5, 3 8 C3 11, 6 13, 8 14 C7 12, 6 10, 7 8 C5 7, 5 5, 8 2Z" fill="#ff4000" opacity="0.8" />
            </svg>
            <div className="text-[#333] font-sans text-[14px] mb-[12px]">Connecting to Services...</div>
            <div className="w-[200px] h-[4px] bg-gray-200 rounded overflow-hidden">
              <div className="h-full bg-[#0060df]" style={{ width: '100%', animation: 'loadingBarFill 1.5s ease-out' }}></div>
            </div>
            <style>{`@keyframes loadingBarFill { from { width: 0%; } to { width: 100%; } }`}</style>
          </div>
        )}

        {locationError && (
          <div style={{
            background: '#1e1e1e', color: '#e0e0e0',
            height: '100%', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            fontFamily: 'monospace', gap: '16px'
          }}>
            <div style={{ fontSize: '48px', marginTop: 'auto' }}>🚫</div>
            <div style={{ color: '#ff4444', fontSize: '16px' }}>
              Location Access Denied
            </div>
            <div style={{
              background: '#2a2a2e', border: '1px solid #ff4444',
              borderRadius: '8px', padding: '16px', maxWidth: '400px',
              fontSize: '13px', lineHeight: '1.6', color: '#aaa'
            }}>
              Firefox ESR wants to access your location.<br />
              <span style={{ color: '#ff9500' }}>⚠ Allow in browser settings to continue.</span><br /><br />
              Error: {locationError}
            </div>
            <button
              onClick={onClose}
              style={{
                background: '#0060df', color: 'white', border: 'none',
                padding: '8px 24px', borderRadius: '4px', cursor: 'pointer',
                fontFamily: 'monospace', marginTop: '16px', marginBottom: 'auto'
              }}
            >
              Close Firefox
            </button>
          </div>
        )}

        {userLocation && !locationLoading && !locationError && (
          <MapErrorBoundary>
            <div style={{ height: '100%', width: '100%', position: 'relative' }}>
              {/* Top info bar overlay */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0,
                background: 'rgba(0,0,0,0.75)',
                color: '#00ff41', fontFamily: 'monospace', fontSize: '11px',
                padding: '6px 12px', zIndex: 1000,
                display: 'flex', gap: '24px', pointerEvents: 'none'
              }}>
                <span>📍 LAT: {userLocation.lat?.toFixed(6)}</span>
                <span>📍 LNG: {userLocation.lng?.toFixed(6)}</span>
                <span>🎯 ACCURACY: ±{Math.round(userLocation.accuracy || 0)}m</span>
                <span style={{ marginLeft: 'auto', color: '#ff4444' }}>
                  ⚠ LOCATION EXPOSED
                </span>
              </div>

              <LeafletNativeMap
                lat={userLocation.lat || 0}
                lng={userLocation.lng || 0}
                accuracy={userLocation.accuracy || 0}
                timestamp={userLocation.timestamp}
              />

              {/* Bottom status bar */}
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                background: 'rgba(0,0,0,0.75)',
                color: '#00b4d8', fontFamily: 'monospace', fontSize: '10px',
                padding: '4px 12px', zIndex: 1000,
                display: 'flex', justifyContent: 'space-between', pointerEvents: 'none'
              }}>
                <span>🌐 OpenStreetMap • Leaflet</span>
                <span style={{ color: '#ff4444', animation: 'blink 1s infinite' }}>
                  ● LIVE TRACKING ACTIVE
                </span>
                <span>{userLocation.timestamp}</span>
              </div>
            </div>
          </MapErrorBoundary>
        )}
      </div>

    </div>
  );
}
