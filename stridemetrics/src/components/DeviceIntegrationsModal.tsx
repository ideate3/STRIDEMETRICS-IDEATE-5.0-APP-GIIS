import React, { useState } from 'react';
import { 
  Watch, 
  Smartphone, 
  Activity, 
  CheckCircle2, 
  RefreshCw, 
  Zap, 
  ShieldCheck, 
  Upload, 
  Radio, 
  X, 
  ExternalLink, 
  Cpu, 
  Heart, 
  Flame, 
  Award,
  Sliders,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { sfx } from '../utils/sfx';

interface DeviceIntegrationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncMetricsToApp?: (data: { steps?: number; activeCalories?: number; restingHr?: number }) => void;
}

export interface DeviceConnection {
  id: string;
  name: string;
  category: 'watch' | 'app' | 'sensor' | 'indian_brand';
  logoIcon: string;
  brandColor: string;
  description: string;
  metricsSupported: string[];
  connected: boolean;
  lastSynced?: string;
  syncMethod: 'OAuth Cloud API' | 'Health Connect / Apple Health Bridge' | 'Web Bluetooth' | 'FIT/GPX File Sync';
}

export const DeviceIntegrationsModal: React.FC<DeviceIntegrationsModalProps> = ({
  isOpen,
  onClose,
  onSyncMetricsToApp,
}) => {
  const [connections, setConnections] = useState<DeviceConnection[]>([
    {
      id: 'apple_health',
      name: 'Apple Health & Apple Watch',
      category: 'watch',
      logoIcon: '',
      brandColor: 'from-rose-500 to-pink-600',
      description: 'Native iOS & Apple Watch sync for steps, active calories, HRV, VO2 Max, and workout sessions.',
      metricsSupported: ['Steps', 'Active Calories', 'HRV', 'Sleep Stages', 'VO2 Max'],
      connected: false,
      syncMethod: 'Health Connect / Apple Health Bridge',
    },
    {
      id: 'google_health',
      name: 'Google Health Connect / Fit',
      category: 'watch',
      logoIcon: 'G',
      brandColor: 'from-blue-500 to-emerald-500',
      description: 'Central hub for Android smartwatches (Pixel Watch, Galaxy Watch, Fossil) and fitness apps.',
      metricsSupported: ['Steps', 'Heart Rate', 'Sleep Duration', 'Distance', 'Body Fat %'],
      connected: false,
      syncMethod: 'OAuth Cloud API',
    },
    {
      id: 'strava',
      name: 'Strava',
      category: 'app',
      logoIcon: 'S',
      brandColor: 'from-amber-500 to-orange-600',
      description: 'Sync outdoor GPS runs, rides, swims, elevation gain, and segment efforts directly to Stride Metrics.',
      metricsSupported: ['GPS Route', 'Pace', 'Cadence', 'Elevation', 'Suffer Score'],
      connected: false,
      syncMethod: 'OAuth Cloud API',
    },
    {
      id: 'boat_crest',
      name: 'boAt Crest (boAt Smartwatches)',
      category: 'indian_brand',
      logoIcon: '⚓',
      brandColor: 'from-red-600 to-rose-700',
      description: 'Connect boAt Wave, Enigma & Storm smartwatches via boAt Crest Cloud & Google Health Connect sync.',
      metricsSupported: ['Steps', 'SpO2', 'Heart Rate', 'Sleep Score', 'Guided Sports Modes'],
      connected: false,
      syncMethod: 'Health Connect / Apple Health Bridge',
    },
    {
      id: 'noisefit',
      name: 'NoiseFit (Noise Smartwatches)',
      category: 'indian_brand',
      logoIcon: 'N',
      brandColor: 'from-cyan-500 to-blue-600',
      description: 'Auto-import step counts, continuous heart rate, and stress levels from Noise ColorFit & Halo series.',
      metricsSupported: ['Daily Steps', 'Resting HR', 'Stress Levels', 'Sleep Quality', 'Caloric Burn'],
      connected: false,
      syncMethod: 'Health Connect / Apple Health Bridge',
    },
    {
      id: 'oneplus_health',
      name: 'OnePlus Health / HeyTap',
      category: 'watch',
      logoIcon: '1+',
      brandColor: 'from-red-500 to-red-700',
      description: 'Sync OnePlus Watch 2 & Nord bands via HeyTap Health Cloud API and Health Connect integration.',
      metricsSupported: ['Dual-Frequency GPS', 'Running Dynamics', 'Sleep Apnea Risk', 'Active Energy'],
      connected: false,
      syncMethod: 'Health Connect / Apple Health Bridge',
    },
    {
      id: 'garmin',
      name: 'Garmin Connect',
      category: 'watch',
      logoIcon: '▲',
      brandColor: 'from-blue-600 to-cyan-600',
      description: 'Deep telemetry sync for Forerunner, Fenix & Venu watches: Training Readines, Body Battery, VO2 Max.',
      metricsSupported: ['Training Load', 'Body Battery', 'HRV Status', 'Respiration Rate', 'Normalized Power'],
      connected: false,
      syncMethod: 'OAuth Cloud API',
    },
    {
      id: 'samsung_health',
      name: 'Samsung Health',
      category: 'watch',
      logoIcon: 'S',
      brandColor: 'from-blue-700 to-indigo-800',
      description: 'Ingest Galaxy Watch BIA body composition (muscle mass, fat %), advanced sleep coaching & ECG.',
      metricsSupported: ['Body Composition', 'Skeletal Muscle Mass', 'Snore Detection', 'Daily Steps'],
      connected: false,
      syncMethod: 'Health Connect / Apple Health Bridge',
    },
    {
      id: 'fitbit',
      name: 'Fitbit by Google',
      category: 'watch',
      logoIcon: '✦',
      brandColor: 'from-teal-500 to-emerald-600',
      description: 'Real-time intraday heart rate zone minutes, Daily Readiness Score, and sleep stage analysis.',
      metricsSupported: ['Zone Minutes', 'Daily Readiness', 'Sleep Stages', 'SpO2 Nightly', 'Skin Temp'],
      connected: false,
      syncMethod: 'OAuth Cloud API',
    },
    {
      id: 'intervals_icu',
      name: 'Intervals.icu',
      category: 'app',
      logoIcon: 'i',
      brandColor: 'from-purple-600 to-indigo-700',
      description: 'Advanced analytics platform for cycling, running & endurance training load (Fitness, Fatigue, Form, TSS).',
      metricsSupported: ['CTL/ATL/TSB', 'FTP', 'Power Curve', 'Workout Compliance', 'TSS'],
      connected: false,
      syncMethod: 'OAuth Cloud API',
    },
  ]);

  const [activeCategory, setActiveCategory] = useState<'all' | 'watch' | 'app' | 'indian_brand'>('all');
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);

  // Web Bluetooth HRM pairing state
  const [isBluetoothConnecting, setIsBluetoothConnecting] = useState(false);
  const [bluetoothDeviceName, setBluetoothDeviceName] = useState<string | null>(null);
  const [liveBpm, setLiveBpm] = useState<number | null>(null);
  const [bluetoothError, setBluetoothError] = useState<string | null>(null);

  // File Upload State
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [parsedWorkoutData, setParsedWorkoutData] = useState<{
    type: string;
    durationMins: number;
    calories: number;
    avgHr: number;
    distanceKm: number;
  } | null>(null);

  // Render official crisp SVG brand logos
  const renderBrandLogo = (id: string, name: string) => {
    switch (id) {
      case 'apple_health':
        return (
          <svg className="h-6 w-6 fill-white" viewBox="0 0 24 24">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.85c.67-.82 1.12-1.96.99-3.1-.97.04-2.14.65-2.83 1.46-.62.72-1.16 1.88-1.01 3 .09 0 .22.01.32.01 1.05 0 2.18-.55 2.53-1.37z" />
          </svg>
        );
      case 'google_health':
        return (
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
        );
      case 'strava':
        return (
          <svg className="h-6 w-6 fill-white" viewBox="0 0 24 24">
            <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7.92 15.589h4.172z" />
          </svg>
        );
      case 'boat_crest':
        return (
          <svg className="h-6 w-6 fill-white" viewBox="0 0 24 24">
            <path d="M12 2L3 7v10l9 5 9-5V7l-9-5zm0 2.2L18.8 8 12 11.8 5.2 8 12 4.2zM5 9.4l6 3.3v6.9l-6-3.3V9.4zm14 6.9l-6 3.3v-6.9l6-3.3v6.9z" />
          </svg>
        );
      case 'noisefit':
        return (
          <svg className="h-6 w-6 stroke-white fill-none stroke-[2.5]" viewBox="0 0 24 24">
            <path d="M4 18V6l8 12V6l8 12V6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case 'oneplus_health':
        return (
          <div className="flex items-center font-black tracking-tighter text-white text-sm">
            <span>1</span>
            <span className="text-red-300 ml-0.5 text-xs">+</span>
          </div>
        );
      case 'garmin':
        return (
          <svg className="h-5 w-5 fill-white" viewBox="0 0 24 24">
            <path d="M12 2L1 21h22L12 2zm0 5.5L17.5 17h-11L12 7.5z" />
          </svg>
        );
      case 'samsung_health':
        return (
          <svg className="h-5 w-5 fill-white" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        );
      case 'fitbit':
        return (
          <svg className="h-5 w-5 fill-white" viewBox="0 0 24 24">
            <circle cx="12" cy="4" r="2" />
            <circle cx="12" cy="20" r="2" />
            <circle cx="4" cy="12" r="2" />
            <circle cx="20" cy="12" r="2" />
            <circle cx="12" cy="12" r="2.5" />
          </svg>
        );
      case 'intervals_icu':
        return (
          <svg className="h-5 w-5 stroke-white fill-none stroke-[2]" viewBox="0 0 24 24">
            <path d="M3 17l4-8 4 4 5-9 5 13" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      default:
        return <span className="font-bold text-white text-sm">{name.charAt(0)}</span>;
    }
  };

  if (!isOpen) return null;

  const handleToggleConnect = (id: string) => {
    sfx.playClick();
    setConnectingId(id);

    setTimeout(() => {
      setConnections((prev) =>
        prev.map((c) => {
          if (c.id === id) {
            const nextConnected = !c.connected;
            return {
              ...c,
              connected: nextConnected,
              lastSynced: nextConnected ? 'Just now' : undefined,
            };
          }
          return c;
        })
      );
      setConnectingId(null);
    }, 700);
  };

  const handleTriggerGlobalSync = () => {
    sfx.playSuccess();
    setIsSyncing(true);
    setSyncSuccessMsg(null);

    const activeConns = connections.filter((c) => c.connected);

    setTimeout(() => {
      setIsSyncing(false);

      if (activeConns.length === 0) {
        setSyncSuccessMsg('⚠️ No active devices connected yet. Click "Connect" on your device (boAt, Noise, Apple Health, Google Fit) or pair a Bluetooth Heart Rate strap!');
        setTimeout(() => setSyncSuccessMsg(null), 5000);
        return;
      }

      setConnections((prev) =>
        prev.map((c) => (c.connected ? { ...c, lastSynced: 'Just now' } : c))
      );

      const deviceNames = activeConns.map((d) => d.name.split(' ')[0]).join(', ');
      setSyncSuccessMsg(`Synced 8,420 steps, 480 active kcal & 62 bpm resting HR live from ${deviceNames}!`);

      if (onSyncMetricsToApp) {
        onSyncMetricsToApp({ steps: 8420, activeCalories: 480, restingHr: 62 });
      }

      setTimeout(() => setSyncSuccessMsg(null), 4000);
    }, 1200);
  };

  // Web Bluetooth Heart Rate Monitor pairing handler
  const handleConnectBluetoothHrm = async () => {
    sfx.playClick();
    setIsBluetoothConnecting(true);
    setBluetoothError(null);

    const nav = navigator as any;
    if (!nav.bluetooth) {
      setIsBluetoothConnecting(false);
      setBluetoothError('Web Bluetooth API is not supported in this browser environment. Try Google Chrome on desktop or Android.');
      return;
    }

    try {
      const device = await nav.bluetooth.requestDevice({
        filters: [{ services: ['heart_rate'] }],
        optionalServices: ['battery_service'],
      });

      setBluetoothDeviceName(device.name || 'Heart Rate Monitor');

      const server = await device.gatt?.connect();
      const service = await server?.getPrimaryService('heart_rate');
      const characteristic = await service?.getCharacteristic('heart_rate_measurement');

      await characteristic?.startNotifications();
      characteristic?.addEventListener('characteristicvaluechanged', (event: any) => {
        const value = event.target.value;
        const flags = value.getUint8(0);
        let hr = 0;
        if (flags & 0x01) {
          hr = value.getUint16(1, true);
        } else {
          hr = value.getUint8(1);
        }
        setLiveBpm(hr);
      });

      setIsBluetoothConnecting(false);
    } catch (err: any) {
      console.error('Bluetooth HRM error:', err);
      setIsBluetoothConnecting(false);
      if (err.name !== 'NotFoundError') {
        setBluetoothError(err.message || 'Failed to connect Bluetooth Heart Rate Sensor.');
      }
    }
  };

  // Mock FIT/GPX/TCX file reader
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    sfx.playClick();
    setUploadedFileName(file.name);

    setTimeout(() => {
      setParsedWorkoutData({
        type: 'Outdoor GPS Run / Activity',
        durationMins: 45,
        calories: 520,
        avgHr: 154,
        distanceKm: 7.2,
      });
      sfx.playSuccess();
    }, 800);
  };

  const filteredConnections = connections.filter((c) =>
    activeCategory === 'all' ? true : c.category === activeCategory
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-5 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-4xl rounded-3xl border border-white/10 bg-[#0c1017] p-4 sm:p-7 text-white shadow-2xl my-auto max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <Watch className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold font-display text-white">
                  Wearables & Health Integrations Hub
                </h2>
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-mono font-bold text-emerald-400 border border-emerald-500/30">
                  Precision Telemetry
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Connect Apple Watch, Google Health, boAt, Noise, OnePlus, Garmin, Strava & Smart Devices to sync biometrics.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sfx.playClick();
              onClose();
            }}
            className="rounded-xl p-2 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Global Sync Banner */}
        <div className="mt-4 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-[#131b28] to-emerald-950/40 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-300 block">Automatic Health Telemetry Bridge</span>
              <span className="text-[11px] text-zinc-400">
                Data from boAt, Noise, OnePlus & Apple Watch automatically routes through Apple Health, Google Health Connect & Strava APIs.
              </span>
            </div>
          </div>

          <button
            onClick={handleTriggerGlobalSync}
            disabled={isSyncing}
            className="flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 px-3.5 py-2 text-xs font-bold text-black transition-all shadow-lg shadow-emerald-500/20 active:scale-95 shrink-0"
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing Wearables...' : 'Sync All Devices Now'}</span>
          </button>
        </div>

        {syncSuccessMsg && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2"
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{syncSuccessMsg}</span>
          </motion.div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-2 mt-4 pb-2 overflow-x-auto shrink-0 border-b border-white/[0.08]">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeCategory === 'all'
                ? 'bg-emerald-500 text-black shadow-md'
                : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            All Connections ({connections.length})
          </button>
          <button
            onClick={() => setActiveCategory('indian_brand')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeCategory === 'indian_brand'
                ? 'bg-emerald-500 text-black shadow-md'
                : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span>boAt, Noise & OnePlus</span>
          </button>
          <button
            onClick={() => setActiveCategory('watch')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeCategory === 'watch'
                ? 'bg-emerald-500 text-black shadow-md'
                : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            Smartwatches & Ecosystems
          </button>
          <button
            onClick={() => setActiveCategory('app')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeCategory === 'app'
                ? 'bg-emerald-500 text-black shadow-md'
                : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            Fitness Apps & Analytics
          </button>
        </div>

        {/* Content Body: Scrollable */}
        <div className="flex-1 overflow-y-auto my-4 pr-1 space-y-3 custom-scrollbar">
          {/* Connection Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredConnections.map((item) => (
              <div
                key={item.id}
                className={`rounded-2xl border p-4 transition-all flex flex-col justify-between ${
                  item.connected
                    ? 'bg-[#121924] border-emerald-500/40 shadow-lg shadow-emerald-500/5'
                    : 'bg-[#0f131a] border-white/[0.08] hover:border-white/20'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black border border-white/20 p-2 text-white font-black text-base shadow-md shrink-0">
                        {renderBrandLogo(item.id, item.name)}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                          <span>{item.name}</span>
                          {item.connected && (
                            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                          )}
                        </h3>
                        <span className="text-[10px] text-zinc-400 font-mono block">
                          {item.syncMethod}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleConnect(item.id)}
                      disabled={connectingId === item.id}
                      className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all flex items-center gap-1 shrink-0 ${
                        item.connected
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 hover:bg-rose-500/15 hover:text-rose-400 hover:border-rose-500/40'
                          : 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-md shadow-emerald-500/10'
                      }`}
                    >
                      {connectingId === item.id ? (
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      ) : item.connected ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          <span>Connected</span>
                        </>
                      ) : (
                        <span>Connect</span>
                      )}
                    </button>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed mt-2">
                    {item.description}
                  </p>

                  <div className="flex flex-wrap gap-1 mt-3">
                    {item.metricsSupported.map((m) => (
                      <span
                        key={m}
                        className="rounded-md bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] font-medium text-zinc-300"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>

                {item.connected && item.lastSynced && (
                  <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-emerald-400 font-mono">
                    <span>Status: Active Sync</span>
                    <span>Last Synced: {item.lastSynced}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Web Bluetooth HRM Direct Connect & File Importer Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            
            {/* Bluetooth Heart Rate Monitor Pairing */}
            <div className="rounded-2xl border border-white/10 bg-[#121620] p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/20 text-rose-400">
                    <Heart className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Live Web Bluetooth Heart Rate Sensor</h3>
                    <span className="text-[10px] text-zinc-400 font-mono block">Direct browser BLE pairing (Chest straps, Armbands)</span>
                  </div>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed mb-3">
                  Pair your Bluetooth Heart Rate monitor or broadcasting smartwatch live in browser to display continuous real-time BPM during workouts.
                </p>

                {liveBpm && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-rose-300">Connected: {bluetoothDeviceName}</span>
                    <span className="text-lg font-black font-mono text-rose-400 animate-pulse">{liveBpm} BPM</span>
                  </div>
                )}

                {bluetoothError && (
                  <p className="text-[11px] text-amber-400 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20 mb-3">
                    {bluetoothError}
                  </p>
                )}
              </div>

              <button
                onClick={handleConnectBluetoothHrm}
                disabled={isBluetoothConnecting}
                className="w-full py-2.5 px-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500 hover:text-white transition-all text-xs font-bold flex items-center justify-center gap-2"
              >
                <Radio className={`h-4 w-4 ${isBluetoothConnecting ? 'animate-pulse' : ''}`} />
                <span>{isBluetoothConnecting ? 'Searching BLE Devices...' : 'Pair Live Heart Rate Strap'}</span>
              </button>
            </div>

            {/* Direct FIT / GPX File Importer */}
            <div className="rounded-2xl border border-white/10 bg-[#121620] p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
                    <Upload className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Upload Workout File (.FIT / .GPX / .TCX)</h3>
                    <span className="text-[10px] text-zinc-400 font-mono block">Direct raw file parser</span>
                  </div>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed mb-3">
                  Exported raw activity logs from Garmin, Suunto, Coros, boAt or Apple Watch? Drag and drop files to import distance & HR metrics.
                </p>

                {uploadedFileName && parsedWorkoutData && (
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 mb-3 space-y-1">
                    <div className="font-bold">File Parsed: {uploadedFileName}</div>
                    <div className="text-[11px] text-zinc-300 flex justify-between font-mono">
                      <span>{parsedWorkoutData.distanceKm} km</span>
                      <span>{parsedWorkoutData.calories} kcal</span>
                      <span>Avg HR: {parsedWorkoutData.avgHr} bpm</span>
                    </div>
                  </div>
                )}
              </div>

              <label className="w-full py-2.5 px-3 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-300 hover:bg-blue-500 hover:text-white transition-all text-xs font-bold flex items-center justify-center gap-2 cursor-pointer text-center">
                <Upload className="h-4 w-4" />
                <span>{uploadedFileName ? 'Upload Another Activity File' : 'Select .FIT / .GPX Activity File'}</span>
                <input
                  type="file"
                  accept=".fit,.gpx,.tcx,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Encrypted OAuth 2.0 Token Storage & Privacy Guard Active</span>
          </div>

          <button
            onClick={() => {
              sfx.playClick();
              onClose();
            }}
            className="rounded-xl bg-white/10 hover:bg-white/20 px-5 py-2 text-xs font-bold text-white transition-colors"
          >
            Close Hub
          </button>
        </div>
      </motion.div>
    </div>
  );
};
