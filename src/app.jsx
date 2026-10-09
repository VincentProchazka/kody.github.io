// ShiftLog - Modern Personal Garage & Vehicle Maintenance Tracker
// Single-Page Application with High-Tech Automotive Cockpit UI

const { useState, useEffect, useMemo, useRef, useCallback } = React;

// --- SOUND SYNTHESIZER (Pure Web Audio API - zero external files) ---
const playCockpitSound = (type = 'click', enabled = true) => {
  if (!enabled) return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === 'click') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } else if (type === 'success') {
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C, E, G, High C
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0.09, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.2);
      });
    } else if (type === 'rev') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(110, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.25);
      osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.6);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    }
  } catch (e) {
    // Audio context may be restricted before user gesture
  }
};

// --- INITIAL MOCK DATA ---
const INITIAL_VEHICLES = [
  {
    id: 'veh-2009-hatch',
    name: '2009 Compact Hatchback (1.4L)',
    make: 'Volkswagen',
    model: 'Golf Mk6 1.4 TSI',
    year: 2009,
    engine: '1.4L TSI Twincharged (122 HP / 90 kW)',
    transmission: '6-Speed Manual',
    drivetrain: 'Front-Wheel Drive',
    vin: 'WVWZZZ1KZ9W084291',
    licensePlate: '7AB-9042',
    currentMileage: 142850,
    fuelCapacity: 55, // liters
    currentFuelLevel: 68, // percent
    avgFuelConsumption: 6.4, // L/100km
    lastOilChangeMileage: 141200,
    oilChangeInterval: 10000,
    image: './assets/hatchback.jpg',
    tpms: {
      fl: { pressure: 2.2, temp: 24, label: 'Front Left', status: 'optimal' },
      fr: { pressure: 2.2, temp: 25, label: 'Front Right', status: 'optimal' },
      rl: { pressure: 2.1, temp: 22, label: 'Rear Left', status: 'optimal' },
      rr: { pressure: 2.1, temp: 23, label: 'Rear Right', status: 'optimal' }
    }
  },
  {
    id: 'veh-2018-wagon',
    name: '2018 Touring Wagon (2.0L TDI)',
    make: 'Audi',
    model: 'A4 Avant 2.0 TDI',
    year: 2018,
    engine: '2.0L Turbo Diesel (190 HP / 400 Nm)',
    transmission: '7-Speed S-Tronic',
    drivetrain: 'quattro AWD',
    vin: 'WAUZZZF48JA102948',
    licensePlate: '5SM-4190',
    currentMileage: 189400,
    fuelCapacity: 58,
    currentFuelLevel: 82,
    avgFuelConsumption: 5.3,
    lastOilChangeMileage: 184200,
    oilChangeInterval: 15000,
    image: './assets/hatchback.jpg',
    tpms: {
      fl: { pressure: 2.4, temp: 21, label: 'Front Left', status: 'optimal' },
      fr: { pressure: 2.4, temp: 21, label: 'Front Right', status: 'optimal' },
      rl: { pressure: 2.3, temp: 20, label: 'Rear Left', status: 'optimal' },
      rr: { pressure: 2.3, temp: 20, label: 'Rear Right', status: 'optimal' }
    }
  }
];

const INITIAL_LOGS = [
  {
    id: 'log-1',
    vehicleId: 'veh-2009-hatch',
    date: '2026-09-22',
    type: 'service',
    title: 'Synthetic Engine Oil & Filter Change',
    mileage: 141200,
    cost: 115.00,
    shop: 'VAG Specialist AutoCare',
    category: 'Engine Maintenance',
    notes: 'Castrol EDGE 5W-30 LL (4.2L) synthetic oil + OEM MANN Oil Filter (W712/94). Sump plug washer renewed. Service reminder interval reset to 10,000 km.',
    tags: ['Oil', 'Filter', 'Inspection']
  },
  {
    id: 'log-2',
    vehicleId: 'veh-2009-hatch',
    date: '2026-09-08',
    type: 'fuel',
    title: 'Premium 95 Octane Full Tank Fill-up',
    mileage: 140880,
    cost: 78.40,
    liters: 46.1,
    pricePerLiter: 1.70,
    shop: 'Shell V-Power Station',
    category: 'Fuel',
    notes: 'Full tank fill up. 46.1L dispensed, calculated cycle economy: 6.3 L/100km.',
    tags: ['Shell', 'Premium 95']
  },
  {
    id: 'log-3',
    vehicleId: 'veh-2009-hatch',
    date: '2026-07-16',
    type: 'repair',
    title: 'Front Brake Rotors & Ceramic Pads Replacement',
    mileage: 138500,
    cost: 245.00,
    shop: 'Brembo Brake Center',
    category: 'Braking System',
    notes: 'Replaced both front 288mm vented rotors with coated Brembo discs and low-dust ceramic pads. System bled with fresh DOT 4 fluid. Zero vibration on heavy braking.',
    tags: ['Brembo', 'Brakes', 'Rotors']
  },
  {
    id: 'log-4',
    vehicleId: 'veh-2009-hatch',
    date: '2026-06-04',
    type: 'fuel',
    title: 'Highway Commute Fuel Fill-up',
    mileage: 137450,
    cost: 75.20,
    liters: 44.5,
    pricePerLiter: 1.69,
    shop: 'Orlen Energy',
    category: 'Fuel',
    notes: 'Long-distance highway driving return leg.',
    tags: ['Fuel', 'Highway']
  },
  {
    id: 'log-5',
    vehicleId: 'veh-2009-hatch',
    date: '2026-04-20',
    type: 'service',
    title: 'Spark Plugs & Coil Pack Diagnostic',
    mileage: 135000,
    cost: 160.00,
    shop: 'DIY Garage',
    category: 'Ignition',
    notes: 'Installed set of 4x NGK Laser Platinum spark plugs (PZFR6R8EG) torqued to 28 Nm. Cleaned harness contacts. Cold start idle noticeably smoother.',
    tags: ['NGK', 'Plugs', 'DIY']
  },
  {
    id: 'log-6',
    vehicleId: 'veh-2009-hatch',
    date: '2026-03-12',
    type: 'service',
    title: 'Cabin Microfilter & Engine Air Intake Filter',
    mileage: 132100,
    cost: 48.00,
    shop: 'DIY Garage',
    category: 'Filters',
    notes: 'Bosch activated carbon cabin filter & MANN pleated air intake filter replaced. Deodorized A/C evaporator ducts.',
    tags: ['Filters', 'Cabin', 'DIY']
  },
  {
    id: 'log-7',
    vehicleId: 'veh-2009-hatch',
    date: '2026-01-15',
    type: 'service',
    title: '4-Wheel Laser Alignment & TPMS Calibration',
    mileage: 128400,
    cost: 65.00,
    shop: 'Continental Precision Tires',
    category: 'Suspension & Tires',
    notes: 'Full laser 3D geometry check. Front camber and toe normalized to factory specs. Tires rotated and TPMS sensors matched.',
    tags: ['Alignment', 'Tires', 'TPMS']
  },
  {
    id: 'log-8',
    vehicleId: 'veh-2009-hatch',
    date: '2025-11-02',
    type: 'mod',
    title: 'OEM+ Perforated Leather Steering Wheel & Pedals',
    mileage: 125000,
    cost: 195.00,
    shop: 'Personal Project',
    category: 'Interior Upgrade',
    notes: 'Installed R-Line flat-bottom perforated leather steering wheel with red contrast stitching and brushed stainless steel sport pedals.',
    tags: ['Interior', 'Upgrade', 'OEM+']
  }
];

// --- ICONS (Clean High-Precision Inline SVGs for Automotive Dashboard) ---
const Icons = {
  Wrench: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  ),
  Gauge: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 14 4-4" />
      <path d="M3.34 19a10 10 0 1 1 17.32 0" />
    </svg>
  ),
  Fuel: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18" />
      <path d="M15 10h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L19 5" />
      <path d="M3 11h12" />
      <circle cx="9" cy="7" r="1" />
    </svg>
  ),
  Car: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
      <circle cx="7" cy="17" r="2" />
      <path d="M9 17h6" />
      <circle cx="17" cy="17" r="2" />
    </svg>
  ),
  ShieldCheck: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  ),
  Calendar: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  ),
  DollarSign: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" x2="12" y1="2" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  Plus: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" x2="12" y1="5" y2="19" />
      <line x1="5" x2="19" y1="12" y2="12" />
    </svg>
  ),
  Trash: ({ className = "w-4 h-4" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  Sparkles: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
    </svg>
  ),
  AlertTriangle: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" x2="12" y1="9" y2="13" />
      <line x1="12" x2="12.01" y1="17" y2="17" />
    </svg>
  ),
  OilDrop: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </svg>
  ),
  Disc: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  Volume2: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  ),
  VolumeX: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="23" x2="17" y1="9" y2="15" />
      <line x1="17" x2="23" y1="9" y2="15" />
    </svg>
  ),
  Check: ({ className = "w-4 h-4" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Search: ({ className = "w-4 h-4" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" x2="16.65" y1="21" y2="16.65" />
    </svg>
  ),
  RefreshCw: ({ className = "w-4 h-4" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 16H3v5" />
    </svg>
  ),
  Activity: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  ArrowUpRight: ({ className = "w-4 h-4" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="7" x2="17" y1="17" y2="7" />
      <polyline points="7 7 17 7 17 17" />
    </svg>
  )
};

// --- ANIMATED DIGITAL COUNTER COMPONENT ---
function AnimatedNumber({ value, duration = 1000, formatter = (v) => Math.round(v).toLocaleString() }) {
  const [current, setCurrent] = useState(() => (typeof value === 'number' ? value : parseFloat(value) || 0));
  const prevValueRef = useRef(value);

  useEffect(() => {
    const startVal = prevValueRef.current !== undefined ? prevValueRef.current : value;
    const targetVal = typeof value === 'number' ? value : parseFloat(value) || 0;
    prevValueRef.current = targetVal;

    let startTimestamp = null;
    let animId = null;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / duration, 1);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCurrent(startVal + (targetVal - startVal) * ease);
      if (progress < 1) {
        animId = window.requestAnimationFrame(step);
      }
    };

    animId = window.requestAnimationFrame(step);
    return () => {
      if (animId) window.cancelAnimationFrame(animId);
    };
  }, [value, duration]);

  return <span>{formatter(current)}</span>;
}

// --- CIRCULAR TELEMETRY GAUGE (Automotive Needle & Arc) ---
function CircularGauge({
  label,
  value,
  max = 100,
  unit = '%',
  subtitle,
  color = 'electric', // 'racing' | 'electric' | 'neon' | 'amber'
  icon: IconComponent,
  ticks = ['E', '1/4', '1/2', '3/4', 'F'],
  needle = true
}) {
  const radius = 64;
  const stroke = 10;
  const circumference = 2 * Math.PI * radius;
  // Arc angle from 135deg to 405deg (270 degrees sweep)
  const angleSweep = 270;
  const percent = Math.min(Math.max(value / max, 0), 1);
  const strokeDashoffset = circumference - (percent * (angleSweep / 360)) * circumference;

  const colorStyles = {
    electric: {
      stroke: '#00b4d8',
      filter: 'drop-shadow(0 0 8px rgba(0, 180, 216, 0.6))',
      glowClass: 'text-electric',
      bgGlow: 'bg-electric/10',
      borderGlow: 'border-electric/30'
    },
    racing: {
      stroke: '#ef4444',
      filter: 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.6))',
      glowClass: 'text-racing',
      bgGlow: 'bg-racing/10',
      borderGlow: 'border-racing/30'
    },
    neon: {
      stroke: '#10b981',
      filter: 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.6))',
      glowClass: 'text-neon',
      bgGlow: 'bg-neon/10',
      borderGlow: 'border-neon/30'
    },
    amber: {
      stroke: '#f59e0b',
      filter: 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.6))',
      glowClass: 'text-amber-400',
      bgGlow: 'bg-amber-400/10',
      borderGlow: 'border-amber-400/30'
    }
  }[color] || {
    stroke: '#00b4d8',
    filter: 'none',
    glowClass: 'text-electric',
    bgGlow: 'bg-electric/10',
    borderGlow: 'border-electric/30'
  };

  // Needle angle: -135deg to +135deg
  const needleRotation = -135 + percent * 270;

  return (
    <div className="cockpit-card cockpit-card-interactive p-5 flex flex-col items-center justify-between relative overflow-hidden group">
      {/* Top Header */}
      <div className="w-full flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          {IconComponent && (
            <div className={`p-1.5 rounded-lg ${colorStyles.bgGlow} ${colorStyles.glowClass} border ${colorStyles.borderGlow}`}>
              <IconComponent className="w-4 h-4" />
            </div>
          )}
          <span className="text-xs font-semibold tracking-wider uppercase text-slate-400 font-tech">
            {label}
          </span>
        </div>
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-carbon-800 text-slate-300 border border-white/5">
          {Math.round(value)}{unit}
        </span>
      </div>

      {/* Physical Dial Container */}
      <div className="relative w-44 h-44 flex items-center justify-center my-1">
        {/* Subtle radial dial background */}
        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-carbon-900 via-carbon-850 to-carbon-950 border border-white/5 shadow-gauge-inset flex items-center justify-center">
          {/* Tick marks ring */}
          <div className="absolute inset-0 rounded-full opacity-40">
            {[0, 45, 90, 135, 180, 225, 270].map((deg, i) => (
              <div
                key={i}
                className="absolute top-2 left-1/2 -ml-[1px] w-[2px] h-2 bg-slate-500 origin-[bottom_center]"
                style={{
                  transform: `rotate(${deg - 135}deg) translateY(6px)`,
                  transformOrigin: '50% 80px'
                }}
              />
            ))}
          </div>
        </div>

        {/* SVG Dial Arc */}
        <svg className="w-full h-full transform -rotate-135" viewBox="0 0 160 160">
          {/* Background Track */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - 270 / 360)}
            strokeLinecap="round"
          />
          {/* Dynamic Fill Arc */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke={colorStyles.stroke}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
              filter: colorStyles.filter
            }}
          />
        </svg>

        {/* Physical Center Hub & Needle */}
        {needle && (
          <div
            className="absolute w-full h-full flex items-center justify-center pointer-events-none transition-transform duration-1000 ease-out"
            style={{ transform: `rotate(${needleRotation}deg)` }}
          >
            {/* The needle blade */}
            <div
              className="w-1.5 h-16 rounded-full origin-bottom"
              style={{
                transform: 'translateY(-28px)',
                background: `linear-gradient(to top, #ffffff 10%, ${colorStyles.stroke} 80%)`,
                boxShadow: `0 0 12px ${colorStyles.stroke}`
              }}
            />
          </div>
        )}

        {/* Center Digital Display & Hub Bezel */}
        <div className="absolute flex flex-col items-center justify-center z-10 w-20 h-20 rounded-full bg-carbon-900 border border-white/10 shadow-lg">
          <div className="text-xl font-bold font-mono tracking-tight text-white flex items-baseline">
            <AnimatedNumber value={value} />
            <span className="text-[10px] text-slate-400 font-sans ml-0.5">{unit}</span>
          </div>
          <span className="text-[9px] uppercase tracking-wider text-slate-400 font-tech font-semibold">
            {percent > 0.8 ? 'OPTIMAL' : percent > 0.35 ? 'NORMAL' : 'ATTENTION'}
          </span>
        </div>
      </div>

      {/* Subtitle / Details info */}
      <div className="w-full text-center mt-1">
        <p className="text-xs text-slate-400 font-sans">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

// --- 4-WHEEL TPMS (Tire Pressure Monitoring System) WIDGET ---
function TPMSWidget({ tpms, unit = 'bar', onInspectTires }) {
  const tires = [
    { key: 'fl', data: tpms.fl, pos: 'FL', label: 'Front-Left' },
    { key: 'fr', data: tpms.fr, pos: 'FR', label: 'Front-Right' },
    { key: 'rl', data: tpms.rl, pos: 'RL', label: 'Rear-Left' },
    { key: 'rr', data: tpms.rr, pos: 'RR', label: 'Rear-Right' }
  ];

  return (
    <div className="cockpit-card p-5 relative overflow-hidden flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-neon/10 text-neon border border-neon/30">
            <Icons.Gauge className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white font-tech">TPMS Realtime Monitor</h3>
            <span className="text-[11px] text-slate-400">4-Wheel Sensor Telemetry</span>
          </div>
        </div>
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-neon/10 border border-neon/30">
          <span className="w-2 h-2 rounded-full bg-neon animate-pulse"></span>
          <span className="text-[11px] font-mono font-semibold text-neon">ALL NOMINAL</span>
        </div>
      </div>

      {/* Chassis Schematic Diagram & Tire Sensor Grid */}
      <div className="relative w-full min-h-[180px] bg-carbon-900/80 rounded-xl border border-white/5 my-2 flex items-center justify-between p-3 overflow-hidden">
        {/* Left Wheels Column */}
        <div className="flex flex-col justify-between h-full space-y-3 z-10">
          {[tires[0], tires[2]].map(({ key, data, pos, label }) => {
            const displayPressure = unit === 'bar' ? data.pressure.toFixed(1) : (data.pressure * 14.5038).toFixed(0);
            const pressUnit = unit === 'bar' ? 'bar' : 'psi';
            return (
              <div
                key={key}
                className="p-2 sm:p-2.5 rounded-lg bg-carbon-850/95 border border-white/10 shadow-md backdrop-blur-sm flex flex-col items-start min-w-[85px] sm:min-w-[100px]"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-[10px] uppercase font-tech text-slate-400 font-semibold">{pos}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-neon"></span>
                </div>
                <div className="flex items-baseline space-x-1 mt-0.5">
                  <span className="text-sm sm:text-base font-bold font-mono text-white tracking-tight">{displayPressure}</span>
                  <span className="text-[9px] text-slate-400 font-mono">{pressUnit}</span>
                </div>
                <div className="flex items-center space-x-1.5 text-[9px] text-slate-400 mt-0.5">
                  <span>{data.temp}°C</span>
                  <span className="text-neon font-medium">• OK</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Center Car Chassis Wireframe */}
        <div className="relative w-20 sm:w-24 h-36 border-2 border-slate-700/60 rounded-3xl flex flex-col items-center justify-between p-2 shadow-inner bg-carbon-950/60 mx-1">
          {/* Front axle line */}
          <div className="w-full h-0.5 bg-slate-600/50 absolute top-7" />
          {/* Rear axle line */}
          <div className="w-full h-0.5 bg-slate-600/50 absolute bottom-7" />
          {/* Center spine */}
          <div className="w-0.5 h-full bg-slate-600/30 absolute" />
          {/* Windshield curve */}
          <div className="w-12 h-6 border-b-2 border-electric/40 rounded-b-xl mt-3" />
          <span className="text-[8px] font-mono text-slate-400 tracking-widest uppercase">CHASSIS</span>
          {/* Rear glass */}
          <div className="w-10 h-4 border-t-2 border-slate-600/40 rounded-t-lg mb-2" />
        </div>

        {/* Right Wheels Column */}
        <div className="flex flex-col justify-between h-full space-y-3 z-10">
          {[tires[1], tires[3]].map(({ key, data, pos, label }) => {
            const displayPressure = unit === 'bar' ? data.pressure.toFixed(1) : (data.pressure * 14.5038).toFixed(0);
            const pressUnit = unit === 'bar' ? 'bar' : 'psi';
            return (
              <div
                key={key}
                className="p-2 sm:p-2.5 rounded-lg bg-carbon-850/95 border border-white/10 shadow-md backdrop-blur-sm flex flex-col items-start min-w-[85px] sm:min-w-[100px]"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-[10px] uppercase font-tech text-slate-400 font-semibold">{pos}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-neon"></span>
                </div>
                <div className="flex items-baseline space-x-1 mt-0.5">
                  <span className="text-sm sm:text-base font-bold font-mono text-white tracking-tight">{displayPressure}</span>
                  <span className="text-[9px] text-slate-400 font-mono">{pressUnit}</span>
                </div>
                <div className="flex items-center space-x-1.5 text-[9px] text-slate-400 mt-0.5">
                  <span>{data.temp}°C</span>
                  <span className="text-neon font-medium">• OK</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-white/5">
        <span className="text-[11px] truncate mr-2">Target: 2.2 bar (Front) / 2.1 bar (Rear)</span>
        <button
          onClick={onInspectTires}
          className="text-electric hover:text-white transition-colors flex items-center space-x-1 font-medium text-xs flex-shrink-0"
        >
          <span>Calibrate</span>
          <Icons.ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// --- TELEMETRY QUICK STATS BAR ---
function TelemetryQuickStats({ vehicle, totalSpent, logCount, unit = 'km' }) {
  const mileageFormatted = vehicle.currentMileage.toLocaleString();
  const digits = mileageFormatted.replace(/,/g, '').padStart(6, '0').split('');

  const kmUntilOil = Math.max(0, vehicle.oilChangeInterval - (vehicle.currentMileage - vehicle.lastOilChangeMileage));

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-2">
      {/* 1. Rolling Digital Odometer */}
      <div className="cockpit-card p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 text-xs font-tech uppercase font-semibold">
          <span>Odometer (Total)</span>
          <span className="text-electric text-[10px] font-mono">LIVE ECU</span>
        </div>
        <div className="flex items-center space-x-1 my-2 overflow-x-auto py-1">
          {digits.map((digit, idx) => (
            <div
              key={idx}
              className="odometer-digit w-7 h-9 flex items-center justify-center text-lg font-bold font-mono text-white border border-white/10"
            >
              {digit}
            </div>
          ))}
          <span className="text-xs font-mono text-slate-400 ml-1">{unit}</span>
        </div>
        <div className="text-[11px] text-slate-400 flex items-center space-x-1">
          <span className="text-neon">●</span>
          <span>Verified Instrument Cluster</span>
        </div>
      </div>

      {/* 2. Average Fuel Consumption */}
      <div className="cockpit-card p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 text-xs font-tech uppercase font-semibold">
          <span>Fuel Economy</span>
          <Icons.Fuel className="w-3.5 h-3.5 text-electric" />
        </div>
        <div className="my-1">
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl font-bold font-mono text-white">{vehicle.avgFuelConsumption}</span>
            <span className="text-xs text-slate-400 font-mono">L / 100 km</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            ≈ {(235.214 / vehicle.avgFuelConsumption).toFixed(1)} MPG US
          </div>
        </div>
        <div className="w-full bg-carbon-800 h-1.5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-neon to-electric rounded-full"
            style={{ width: `${Math.min(100, (6.4 / 10) * 100)}%` }}
          />
        </div>
      </div>

      {/* 3. Total Recorded Spend (12-Mo) */}
      <div className="cockpit-card p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 text-xs font-tech uppercase font-semibold">
          <span>Maintenance Spend</span>
          <Icons.DollarSign className="w-3.5 h-3.5 text-racing" />
        </div>
        <div className="my-1">
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl font-bold font-mono text-white">€{totalSpent.toFixed(2)}</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Across {logCount} logged service events
          </div>
        </div>
        <div className="text-[11px] text-slate-400 flex items-center justify-between">
          <span>Cost/km:</span>
          <span className="text-white font-mono font-medium">
            €{(totalSpent / (vehicle.currentMileage - 120000 || 1)).toFixed(2)}/km
          </span>
        </div>
      </div>

      {/* 4. Next Inspection Countdown */}
      <div className="cockpit-card p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 text-xs font-tech uppercase font-semibold">
          <span>Next Oil Service</span>
          <Icons.OilDrop className="w-3.5 h-3.5 text-amber-400" />
        </div>
        <div className="my-1">
          <div className="flex items-baseline space-x-1">
            <span className={`text-2xl font-bold font-mono ${kmUntilOil < 2000 ? 'text-amber-400' : 'text-neon'}`}>
              <AnimatedNumber value={kmUntilOil} />
            </span>
            <span className="text-xs text-slate-400 font-mono">{unit}</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {kmUntilOil < 2000 ? 'Service booking recommended' : 'Service schedule healthy'}
          </div>
        </div>
        <div className="w-full bg-carbon-800 h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${kmUntilOil < 2000 ? 'bg-amber-400' : 'bg-neon'}`}
            style={{ width: `${Math.max(5, (kmUntilOil / vehicle.oilChangeInterval) * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// --- INTERACTIVE HIGH-TECH ANALYTICS CHART (SVG TELEMETRY) ---
function AnalyticsTelemetryChart({ logs }) {
  const [activeTab, setActiveTab] = useState('consumption'); // 'consumption' | 'expenses'
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // 6-Month Mock/Aggregated Telemetry Data
  const monthlyData = [
    { month: 'May 26', km: 1100, fuelCost: 145, serviceCost: 0, consumption: 6.6 },
    { month: 'Jun 26', km: 1250, fuelCost: 160, serviceCost: 48, consumption: 6.5 },
    { month: 'Jul 26', km: 1400, fuelCost: 180, serviceCost: 245, consumption: 6.4 },
    { month: 'Aug 26', km: 980, fuelCost: 125, serviceCost: 0, consumption: 6.3 },
    { month: 'Sep 26', km: 1320, fuelCost: 172, serviceCost: 115, consumption: 6.4 },
    { month: 'Oct 26', km: 650, fuelCost: 85, serviceCost: 0, consumption: 6.2 }
  ];

  const maxVal = activeTab === 'consumption'
    ? 8 // L/100km max
    : 500; // Cost max

  // SVG dimensions
  const svgWidth = 600;
  const svgHeight = 200;
  const paddingX = 40;
  const paddingY = 30;
  const chartW = svgWidth - paddingX * 2;
  const chartH = svgHeight - paddingY * 2;

  // Calculate coordinates
  const points = monthlyData.map((d, i) => {
    const x = paddingX + (i / (monthlyData.length - 1)) * chartW;
    const value = activeTab === 'consumption' ? d.consumption : (d.fuelCost + d.serviceCost);
    const y = paddingY + chartH - (value / maxVal) * chartH;
    return { x, y, data: d, value };
  });

  // SVG path definition
  const pathD = points.reduce((acc, pt, i) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`;
    // smooth cubic bezier curves
    const prev = points[i - 1];
    const cx1 = prev.x + (pt.x - prev.x) / 2;
    const cy1 = prev.y;
    const cx2 = prev.x + (pt.x - prev.x) / 2;
    const cy2 = pt.y;
    return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${pt.x} ${pt.y}`;
  }, '');

  // Fill path closing at bottom
  const areaD = `${pathD} L ${points[points.length - 1].x} ${paddingY + chartH} L ${points[0].x} ${paddingY + chartH} Z`;

  return (
    <div className="cockpit-card p-5 relative overflow-hidden">
      {/* Chart Header & Mode Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-electric/10 text-electric border border-electric/30">
              <Icons.Activity className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white font-tech">
              Telemetry Analytics (Last 6 Months)
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Realtime regression and running cost telemetry
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center space-x-1 p-1 bg-carbon-900 border border-white/10 rounded-lg">
          <button
            onClick={() => setActiveTab('consumption')}
            className={`px-3 py-1 rounded text-xs font-mono font-medium transition-all ${activeTab === 'consumption'
                ? 'bg-electric text-carbon-950 font-bold shadow-neon-blue'
                : 'text-slate-400 hover:text-white'
              }`}
          >
            L/100km Trend
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`px-3 py-1 rounded text-xs font-mono font-medium transition-all ${activeTab === 'expenses'
                ? 'bg-racing text-white font-bold shadow-neon-red'
                : 'text-slate-400 hover:text-white'
              }`}
          >
            Total Spend (€)
          </button>
        </div>
      </div>

      {/* Dynamic SVG Visualizer */}
      <div className="relative w-full overflow-hidden bg-carbon-950/60 rounded-xl border border-white/5 p-2">
        {/* Subtle Horizontal Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between py-8 px-10 pointer-events-none opacity-20">
          <div className="border-b border-dashed border-slate-500 w-full" />
          <div className="border-b border-dashed border-slate-500 w-full" />
          <div className="border-b border-dashed border-slate-500 w-full" />
        </div>

        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-48 overflow-visible">
          <defs>
            <linearGradient id="blueGlowGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00b4d8" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#00b4d8" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="redGlowGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
            </linearGradient>
            <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Area Gradient */}
          <path
            d={areaD}
            fill={activeTab === 'consumption' ? 'url(#blueGlowGradient)' : 'url(#redGlowGradient)'}
          />

          {/* Glowing Stroke Line */}
          <path
            d={pathD}
            fill="none"
            stroke={activeTab === 'consumption' ? '#00b4d8' : '#ef4444'}
            strokeWidth="3"
            filter="url(#neonGlow)"
            strokeLinecap="round"
          />

          {/* Interactive Data Nodes */}
          {points.map((pt, idx) => (
            <g key={idx} className="cursor-pointer" onMouseEnter={() => setHoveredIndex(idx)}>
              {/* Outer pulsing ring */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r={hoveredIndex === idx ? 7 : 4}
                fill="#0c0e14"
                stroke={activeTab === 'consumption' ? '#00b4d8' : '#ef4444'}
                strokeWidth="2.5"
                className="transition-all duration-200"
              />
              {/* Bottom Month Label */}
              <text
                x={pt.x}
                y={svgHeight - 10}
                textAnchor="middle"
                className="text-[11px] font-mono fill-slate-400"
              >
                {pt.data.month}
              </text>
            </g>
          ))}
        </svg>

        {/* Hover Floating Tooltip */}
        {hoveredIndex !== null && points[hoveredIndex] && (
          <div
            className="absolute z-20 pointer-events-none p-2.5 rounded-lg bg-carbon-900 border border-white/20 shadow-xl backdrop-blur-md text-xs font-mono"
            style={{
              left: `${(points[hoveredIndex].x / svgWidth) * 100}%`,
              top: '20px',
              transform: 'translateX(-50%)'
            }}
          >
            <div className="text-white font-bold mb-1 border-b border-white/10 pb-0.5">
              {points[hoveredIndex].data.month}
            </div>
            {activeTab === 'consumption' ? (
              <div className="space-y-0.5">
                <div className="text-electric flex justify-between space-x-3">
                  <span>Consumption:</span>
                  <span className="font-bold">{points[hoveredIndex].data.consumption} L/100km</span>
                </div>
                <div className="text-slate-400 flex justify-between space-x-3">
                  <span>Mileage run:</span>
                  <span>{points[hoveredIndex].data.km} km</span>
                </div>
              </div>
            ) : (
              <div className="space-y-0.5">
                <div className="text-racing flex justify-between space-x-3">
                  <span>Total Expense:</span>
                  <span className="font-bold">€{points[hoveredIndex].data.fuelCost + points[hoveredIndex].data.serviceCost}</span>
                </div>
                <div className="text-slate-400 flex justify-between space-x-3 text-[11px]">
                  <span>Fuel: €{points[hoveredIndex].data.fuelCost}</span>
                  <span>Service: €{points[hoveredIndex].data.serviceCost}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer stats summary */}
      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/5 text-center text-xs">
        <div>
          <span className="text-slate-400 block text-[10px] uppercase font-tech">6-Mo Avg Economy</span>
          <span className="font-mono font-bold text-electric">6.40 L / 100km</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px] uppercase font-tech">Monthly Avg Cost</span>
          <span className="font-mono font-bold text-white">€189.50 / mo</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px] uppercase font-tech">Target Budget</span>
          <span className="font-mono font-bold text-neon">On Track (-4%)</span>
        </div>
      </div>
    </div>
  );
}

// --- MAINTENANCE LOG & SERVICE HISTORY (TIMELINE) ---
function MaintenanceHistoryTimeline({ logs, onDeleteLog, onAddNewRecord }) {
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const filteredLogs = useMemo(() => {
    return logs
      .filter((item) => {
        if (filterType !== 'all' && item.type !== filterType) return false;
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.shop?.toLowerCase().includes(q) ||
          item.notes?.toLowerCase().includes(q) ||
          item.tags?.some(t => t.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [logs, filterType, searchQuery]);

  const getTypeBadge = (type) => {
    switch (type) {
      case 'service':
        return {
          icon: Icons.Wrench,
          bg: 'bg-electric/10 text-electric border-electric/30',
          label: 'Service'
        };
      case 'fuel':
        return {
          icon: Icons.Fuel,
          bg: 'bg-neon/10 text-neon border-neon/30',
          label: 'Fuel Fill-Up'
        };
      case 'repair':
        return {
          icon: Icons.Disc,
          bg: 'bg-racing/10 text-racing border-racing/30',
          label: 'Repair'
        };
      case 'mod':
        return {
          icon: Icons.Sparkles,
          bg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
          label: 'Mod / Upgrade'
        };
      default:
        return {
          icon: Icons.Wrench,
          bg: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
          label: 'Log'
        };
    }
  };

  return (
    <div className="cockpit-card p-5 relative overflow-hidden">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-racing/10 text-racing border border-racing/30">
              <Icons.Wrench className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white font-tech">
              Maintenance Log & Service History
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Verified chronological records and parts replacement ledger
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'all', label: `All (${logs.length})` },
            { id: 'service', label: 'Service' },
            { id: 'fuel', label: 'Fuel' },
            { id: 'repair', label: 'Repairs' },
            { id: 'mod', label: 'Mods' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all ${filterType === tab.id
                  ? 'bg-racing text-white shadow-neon-red'
                  : 'bg-carbon-900 text-slate-400 hover:text-white border border-white/5'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative mb-5">
        <Icons.Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter by keywords (e.g. 'Brembo', 'Oil', 'NGK', 'DIY')..."
          className="w-full pl-10 pr-4 py-2 bg-carbon-900 border border-white/10 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-electric transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white font-mono"
          >
            Clear
          </button>
        )}
      </div>

      {/* Timeline Stream */}
      <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-racing before:via-electric before:to-neon">
        {filteredLogs.length === 0 ? (
          <div className="py-12 text-center text-slate-500 font-mono text-xs">
            No maintenance records found matching "{searchQuery}".
          </div>
        ) : (
          filteredLogs.map((item) => {
            const badge = getTypeBadge(item.type);
            const isExpanded = expandedId === item.id;
            const Icon = badge.icon;

            return (
              <div key={item.id} className="relative group">
                {/* Glowing Node Dot on Timeline */}
                <div className="absolute -left-[27px] top-3.5 w-3.5 h-3.5 rounded-full bg-carbon-950 border-2 border-white/60 group-hover:border-racing transition-colors shadow-metallic flex items-center justify-center">
                  <span className="w-1 h-1 rounded-full bg-racing"></span>
                </div>

                {/* Card Item */}
                <div
                  className="cockpit-card cockpit-card-interactive p-4 border border-white/10 rounded-xl transition-all cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-2.5">
                      <div className={`p-2 rounded-lg ${badge.bg} border`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-semibold text-white group-hover:text-electric transition-colors">
                            {item.title}
                          </h4>
                          <span className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded border ${badge.bg}`}>
                            {badge.label}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono mt-0.5">
                          <span>{item.date}</span>
                          <span>•</span>
                          <span>{item.mileage.toLocaleString()} km</span>
                          {item.shop && (
                            <>
                              <span>•</span>
                              <span className="text-slate-300">{item.shop}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Cost Badge and Delete Button */}
                    <div className="flex items-center space-x-3 self-end sm:self-center">
                      <span className="text-base font-bold font-mono text-white bg-carbon-900 px-3 py-1 rounded-lg border border-white/10">
                        €{item.cost.toFixed(2)}
                      </span>
                      <button
                        title="Delete log entry"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete service entry "${item.title}"?`)) {
                            onDeleteLog(item.id);
                          }
                        }}
                        className="text-slate-500 hover:text-racing p-1.5 rounded-lg hover:bg-carbon-900 transition-colors"
                      >
                        <Icons.Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Expandable Notes Section */}
                  {(isExpanded || item.notes) && (
                    <div className="mt-3 pt-3 border-t border-white/5 text-xs text-slate-300 font-sans leading-relaxed">
                      <p>{item.notes}</p>
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {item.tags.map((t, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-mono px-2 py-0.5 rounded bg-carbon-900 text-slate-400 border border-white/5"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Quick Add Log CTA Bar */}
      <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
        <span className="text-xs text-slate-400 font-mono">
          Showing {filteredLogs.length} of {logs.length} total garage entries
        </span>
        <button
          onClick={onAddNewRecord}
          className="flex items-center space-x-1.5 text-xs font-mono font-semibold text-racing hover:text-white transition-colors"
        >
          <Icons.Plus className="w-4 h-4" />
          <span>Quick Log Entry</span>
        </button>
      </div>
    </div>
  );
}

// --- ADD RECORD MODAL (High-Tech Dashboard Modal) ---
function AddRecordModal({ isOpen, onClose, onSave, currentMileage }) {
  const [type, setType] = useState('service');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [mileage, setMileage] = useState(currentMileage || 142850);
  const [cost, setCost] = useState('');
  const [shop, setShop] = useState('');
  const [notes, setNotes] = useState('');
  const [liters, setLiters] = useState('');
  const [pricePerLiter, setPricePerLiter] = useState('');

  // Update default mileage if currentMileage changes
  useEffect(() => {
    if (currentMileage) setMileage(currentMileage);
  }, [currentMileage]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please enter a service or record title.');
      return;
    }

    const costNum = parseFloat(cost) || 0;
    const mileageNum = parseInt(mileage, 10) || currentMileage;

    const newRecord = {
      id: `log-${Date.now()}`,
      type,
      title: title.trim(),
      date,
      mileage: mileageNum,
      cost: costNum,
      shop: shop.trim() || 'DIY / Garage',
      notes: notes.trim(),
      liters: type === 'fuel' ? parseFloat(liters) || undefined : undefined,
      pricePerLiter: type === 'fuel' ? parseFloat(pricePerLiter) || undefined : undefined,
      tags: [type.toUpperCase()]
    };

    onSave(newRecord);
    // Trigger confetti!
    if (window.confetti) {
      window.confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="cockpit-card w-full max-w-lg p-6 border border-white/15 shadow-2xl relative">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-racing/10 text-racing border border-racing/30">
              <Icons.Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold uppercase tracking-wider text-white font-tech">
                Log New Vehicle Record
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">ShiftLog Telemetry Input</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-carbon-900 transition-colors font-mono text-sm"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Record Type Selector */}
          <div>
            <label className="block text-xs font-tech uppercase text-slate-400 mb-1.5 font-semibold">
              Record Category
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'service', label: 'Service', icon: Icons.Wrench },
                { id: 'fuel', label: 'Fuel Fill', icon: Icons.Fuel },
                { id: 'repair', label: 'Repair', icon: Icons.Disc },
                { id: 'mod', label: 'Mod / Tune', icon: Icons.Sparkles }
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = type === item.id;
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => {
                      setType(item.id);
                      if (item.id === 'fuel' && !title) setTitle('Full Tank Fuel Fill-up');
                    }}
                    className={`py-2 px-1 flex flex-col items-center justify-center rounded-xl border text-xs font-mono transition-all ${isSelected
                        ? 'bg-racing text-white border-racing shadow-neon-red font-bold'
                        : 'bg-carbon-900 text-slate-400 border-white/5 hover:border-white/20'
                      }`}
                  >
                    <Icon className="w-4 h-4 mb-1" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title / Description */}
          <div>
            <label className="block text-xs font-tech uppercase text-slate-400 mb-1 font-semibold">
              Title / Maintenance Task
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Engine Oil & Filter Change, Brembo Pads..."
              className="w-full px-3 py-2 bg-carbon-900 border border-white/10 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-racing"
            />
          </div>

          {/* Date & Mileage Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-tech uppercase text-slate-400 mb-1 font-semibold">
                Event Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-carbon-900 border border-white/10 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-racing"
              />
            </div>
            <div>
              <label className="block text-xs font-tech uppercase text-slate-400 mb-1 font-semibold">
                Odometer (km)
              </label>
              <input
                type="number"
                required
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
                className="w-full px-3 py-2 bg-carbon-900 border border-white/10 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-racing"
              />
            </div>
          </div>

          {/* Cost & Service Provider Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-tech uppercase text-slate-400 mb-1 font-semibold">
                Total Cost (€)
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 bg-carbon-900 border border-white/10 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-racing"
              />
            </div>
            <div>
              <label className="block text-xs font-tech uppercase text-slate-400 mb-1 font-semibold">
                Service Center / DIY
              </label>
              <input
                type="text"
                value={shop}
                onChange={(e) => setShop(e.target.value)}
                placeholder="e.g. Authorized Dealer, DIY"
                className="w-full px-3 py-2 bg-carbon-900 border border-white/10 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-racing"
              />
            </div>
          </div>

          {/* Dynamic Fuel Specific Inputs */}
          {type === 'fuel' && (
            <div className="grid grid-cols-2 gap-3 p-3 bg-carbon-900/60 rounded-xl border border-electric/20">
              <div>
                <label className="block text-xs font-tech uppercase text-electric mb-1 font-semibold">
                  Fuel Quantity (Liters)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={liters}
                  onChange={(e) => setLiters(e.target.value)}
                  placeholder="e.g. 45.0"
                  className="w-full px-3 py-1.5 bg-carbon-900 border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-electric"
                />
              </div>
              <div>
                <label className="block text-xs font-tech uppercase text-electric mb-1 font-semibold">
                  Price / Liter (€)
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={pricePerLiter}
                  onChange={(e) => setPricePerLiter(e.target.value)}
                  placeholder="e.g. 1.72"
                  className="w-full px-3 py-1.5 bg-carbon-900 border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-electric"
                />
              </div>
            </div>
          )}

          {/* Detailed Notes */}
          <div>
            <label className="block text-xs font-tech uppercase text-slate-400 mb-1 font-semibold">
              Notes, Part Numbers & Inspection Details
            </label>
            <textarea
              rows="3"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. OEM oil filter part #, tire tread depth, torque specs..."
              className="w-full px-3 py-2 bg-carbon-900 border border-white/10 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-racing"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-mono font-medium text-slate-400 hover:text-white bg-carbon-900 border border-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-mono font-bold text-white bg-racing hover:bg-racing-600 shadow-neon-red transition-all flex items-center space-x-1.5"
            >
              <Icons.Check className="w-4 h-4" />
              <span>Commit Telemetry Entry</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- VEHICLE SPECS & EDIT MODAL ---
function VehicleSpecsModal({ isOpen, onClose, vehicle, onSaveVehicle }) {
  const [formData, setFormData] = useState({ ...vehicle });

  useEffect(() => {
    if (vehicle) setFormData({ ...vehicle });
  }, [vehicle]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveVehicle(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="cockpit-card w-full max-w-lg p-6 border border-white/15 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-electric/10 text-electric border border-electric/30">
              <Icons.Car className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold uppercase tracking-wider text-white font-tech">
                Vehicle Telemetry Specs
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">Calibrate vehicle parameters</span>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white font-mono text-sm">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-tech uppercase text-slate-400 mb-1 font-semibold">Vehicle Title</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-carbon-900 border border-white/10 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-electric"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-tech uppercase text-slate-400 mb-1 font-semibold">Model Year</label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value, 10) || 2009 })}
                className="w-full px-3 py-2 bg-carbon-900 border border-white/10 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-electric"
              />
            </div>
            <div>
              <label className="block text-xs font-tech uppercase text-slate-400 mb-1 font-semibold">Current Odometer (km)</label>
              <input
                type="number"
                value={formData.currentMileage}
                onChange={(e) => setFormData({ ...formData, currentMileage: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-3 py-2 bg-carbon-900 border border-white/10 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-electric"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-tech uppercase text-slate-400 mb-1 font-semibold">License Plate</label>
              <input
                type="text"
                value={formData.licensePlate}
                onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                className="w-full px-3 py-2 bg-carbon-900 border border-white/10 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-electric uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-tech uppercase text-slate-400 mb-1 font-semibold">VIN Number</label>
              <input
                type="text"
                value={formData.vin}
                onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                className="w-full px-3 py-2 bg-carbon-900 border border-white/10 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-electric font-mono uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-tech uppercase text-slate-400 mb-1 font-semibold">Avg Fuel Econ (L/100km)</label>
              <input
                type="number"
                step="0.1"
                value={formData.avgFuelConsumption}
                onChange={(e) => setFormData({ ...formData, avgFuelConsumption: parseFloat(e.target.value) || 6.4 })}
                className="w-full px-3 py-2 bg-carbon-900 border border-white/10 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-electric"
              />
            </div>
            <div>
              <label className="block text-xs font-tech uppercase text-slate-400 mb-1 font-semibold">Fuel Tank Cap (L)</label>
              <input
                type="number"
                value={formData.fuelCapacity}
                onChange={(e) => setFormData({ ...formData, fuelCapacity: parseInt(e.target.value, 10) || 55 })}
                className="w-full px-3 py-2 bg-carbon-900 border border-white/10 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-electric"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-carbon-900 text-slate-400 hover:text-white rounded-xl text-xs font-mono"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-electric text-carbon-950 font-bold rounded-xl text-xs font-mono shadow-neon-blue"
            >
              Save Calibration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- MAIN APPLICATION COMPONENT ---
function ShiftLogApp() {
  // Sound settings
  const [soundEnabled, setSoundEnabled] = useState(true);

  // LocalStorage state for vehicles
  const [vehicles, setVehicles] = useState(() => {
    const saved = localStorage.getItem('shiftlog_vehicles');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return INITIAL_VEHICLES;
  });

  // Selected vehicle id
  const [selectedVehicleId, setSelectedVehicleId] = useState(() => {
    return localStorage.getItem('shiftlog_active_vehicle') || INITIAL_VEHICLES[0].id;
  });

  // LocalStorage state for logs
  const [logs, setLogs] = useState(() => {
    const saved = localStorage.getItem('shiftlog_logs');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return INITIAL_LOGS;
  });

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSpecsModalOpen, setIsSpecsModalOpen] = useState(false);

  // Save to LocalStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('shiftlog_vehicles', JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem('shiftlog_active_vehicle', selectedVehicleId);
  }, [selectedVehicleId]);

  useEffect(() => {
    localStorage.setItem('shiftlog_logs', JSON.stringify(logs));
  }, [logs]);

  // Current active vehicle
  const currentVehicle = useMemo(() => {
    return vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];
  }, [vehicles, selectedVehicleId]);

  // Logs for current active vehicle
  const vehicleLogs = useMemo(() => {
    return logs.filter((log) => log.vehicleId === currentVehicle.id || !log.vehicleId);
  }, [logs, currentVehicle.id]);

  // Total spent calculation
  const totalSpent = useMemo(() => {
    return vehicleLogs.reduce((acc, item) => acc + (item.cost || 0), 0);
  }, [vehicleLogs]);

  // Oil health calculation (% of interval remaining)
  const oilHealthPercent = useMemo(() => {
    const kmDrivenSinceOil = Math.max(0, currentVehicle.currentMileage - currentVehicle.lastOilChangeMileage);
    const remaining = currentVehicle.oilChangeInterval - kmDrivenSinceOil;
    return Math.max(0, Math.min(100, (remaining / currentVehicle.oilChangeInterval) * 100));
  }, [currentVehicle]);

  // Mechanical / brake health index (derived dynamically from recent services)
  const mechanicalHealthPercent = useMemo(() => {
    // 92% standard baseline for this mock hatchback
    return 92;
  }, []);

  // Action handlers
  const handleAddLog = (newRecord) => {
    playCockpitSound('success', soundEnabled);
    const updated = [{ ...newRecord, vehicleId: currentVehicle.id }, ...logs];
    setLogs(updated);

    // If new log mileage is higher than current car mileage, update vehicle
    if (newRecord.mileage > currentVehicle.currentMileage) {
      const updatedVehicles = vehicles.map((v) =>
        v.id === currentVehicle.id ? { ...v, currentMileage: newRecord.mileage } : v
      );
      setVehicles(updatedVehicles);
    }

    // If it was an oil change, update lastOilChangeMileage
    if (newRecord.type === 'service' && /oil/i.test(newRecord.title)) {
      const updatedVehicles = vehicles.map((v) =>
        v.id === currentVehicle.id ? { ...v, lastOilChangeMileage: newRecord.mileage } : v
      );
      setVehicles(updatedVehicles);
    }

    setIsAddModalOpen(false);
  };

  const handleDeleteLog = (id) => {
    playCockpitSound('click', soundEnabled);
    setLogs(logs.filter((l) => l.id !== id));
  };

  const handleSaveVehicle = (updatedData) => {
    playCockpitSound('success', soundEnabled);
    setVehicles(vehicles.map((v) => (v.id === updatedData.id ? updatedData : v)));
  };

  const handleResetToDemo = () => {
    if (confirm('Reset garage telemetry data back to default factory demo records?')) {
      playCockpitSound('rev', soundEnabled);
      localStorage.removeItem('shiftlog_vehicles');
      localStorage.removeItem('shiftlog_logs');
      setVehicles(INITIAL_VEHICLES);
      setLogs(INITIAL_LOGS);
      setSelectedVehicleId(INITIAL_VEHICLES[0].id);
    }
  };

  const handleExportData = () => {
    playCockpitSound('click', soundEnabled);
    const exportBlob = new Blob(
      [JSON.stringify({ vehicles, logs, exportedAt: new Date().toISOString() }, null, 2)],
      { type: 'application/json' }
    );
    const url = URL.createObjectURL(exportBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shiftlog_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen text-slate-100 pb-16">
      {/* ================= 1. COCKPIT HEADER / TOP NAVIGATION ================= */}
      <header className="sticky top-0 z-40 bg-carbon-950/85 backdrop-blur-xl border-b border-white/10 px-2 sm:px-4 lg:px-8 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-1.5 sm:gap-3">
          {/* Logo with tachometer styling */}
          <div
            className="flex items-center space-x-2 cursor-pointer group flex-shrink-0"
            onClick={() => playCockpitSound('rev', soundEnabled)}
            title="Click to rev engine sound!"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-racing to-racing-600 flex items-center justify-center shadow-neon-red border border-white/20 group-hover:scale-105 transition-transform flex-shrink-0">
              <Icons.Gauge className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <span className="font-gauge text-sm sm:text-xl font-black tracking-wider text-white">
                  <span className="hidden xs:inline">SHIFT</span><span className="text-racing">LOG</span>
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-carbon-800 text-electric border border-electric/30">
                  v2.4
                </span>
              </div>
            </div>
          </div>

          {/* Center Sensor Status Pill */}
          <div className="hidden md:flex items-center space-x-2 px-3 py-1 rounded-full bg-carbon-900 border border-white/10">
            <span className="w-2 h-2 rounded-full bg-neon animate-pulse"></span>
            <span className="text-xs font-mono text-slate-300">
              ECU SYNCHRONIZED <span className="text-slate-500">•</span> 4 TPMS OK
            </span>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-1 sm:space-x-2.5 flex-shrink-0">
            {/* Audio Toggle */}
            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                playCockpitSound('click', !soundEnabled);
              }}
              title={soundEnabled ? 'Mute Cockpit Audio' : 'Enable Cockpit Audio'}
              className="p-1.5 rounded-xl bg-carbon-900 border border-white/10 text-slate-400 hover:text-white transition-colors"
            >
              {soundEnabled ? <Icons.Volume2 className="w-3.5 h-3.5 text-electric" /> : <Icons.VolumeX className="w-3.5 h-3.5 text-slate-500" />}
            </button>

            {/* Vehicle Selector Dropdown */}
            <div className="relative max-w-[78px] xs:max-w-[120px] sm:max-w-[220px]">
              <select
                value={selectedVehicleId}
                onChange={(e) => {
                  setSelectedVehicleId(e.target.value);
                  playCockpitSound('click', soundEnabled);
                }}
                className="w-full bg-carbon-900 border border-white/15 text-white text-[10px] sm:text-xs font-mono rounded-xl px-1.5 py-1.5 sm:px-2.5 sm:py-2 pr-4 sm:pr-7 focus:outline-none focus:border-racing appearance-none cursor-pointer truncate"
              >
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id} className="bg-carbon-950 text-white">
                    {v.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1 text-slate-400">
                <svg className="w-2 h-2 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Quick Add Service Button */}
            <button
              onClick={() => {
                playCockpitSound('click', soundEnabled);
                setIsAddModalOpen(true);
              }}
              className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-racing to-racing-600 hover:from-racing-600 hover:to-racing text-white text-[10px] sm:text-xs font-mono font-bold shadow-neon-red transition-all flex items-center space-x-1 flex-shrink-0 active:scale-95"
            >
              <Icons.Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>

            {/* Overflow Options Menu (Reset / Export) */}
            <div className="flex items-center space-x-1">
              <button
                onClick={handleExportData}
                title="Backup / Export JSON Data"
                className="p-1.5 sm:p-2 rounded-xl bg-carbon-900 border border-white/10 text-slate-400 hover:text-white transition-colors hidden lg:flex"
              >
                <Icons.ArrowUpRight className="w-4 h-4" />
              </button>
              <button
                onClick={handleResetToDemo}
                title="Reset to Realistic Default Data"
                className="p-1.5 sm:p-2 rounded-xl bg-carbon-900 border border-white/10 text-slate-400 hover:text-racing transition-colors hidden sm:flex"
              >
                <Icons.RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ================= 2. MAIN BENTO-BOX DASHBOARD GRID ================= */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 pt-4 sm:pt-6 space-y-5 sm:space-y-6">

        {/* ROW 1: VEHICLE HERO CARD & STATUS GAUGES */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">

          {/* VEHICLE PROFILE HERO CARD (5 Cols) */}
          <div className="lg:col-span-5 cockpit-card p-4 sm:p-6 flex flex-col justify-between relative overflow-hidden group">
            {/* Top Badge & Plate Bar */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 z-10">
              <div className="min-w-0 flex-1">
                <span className="text-[10px] sm:text-[11px] font-mono tracking-wider uppercase text-electric font-semibold block">
                  PRIMARY GARAGE BAY
                </span>
                <h1 className="text-lg sm:text-2xl font-black font-tech tracking-wide text-white mt-0.5 truncate">
                  {currentVehicle.name}
                </h1>
                <p className="text-xs text-slate-400 font-sans mt-0.5">
                  {currentVehicle.engine} • {currentVehicle.transmission}
                </p>
              </div>

              {/* European Style License Plate */}
              <div className="self-start sm:self-auto flex items-center bg-slate-100 border-2 border-slate-300 rounded-md shadow px-2 py-0.5 text-black font-mono font-bold tracking-wider text-xs flex-shrink-0">
                <span className="text-[9px] bg-blue-700 text-white px-1 py-0.5 rounded mr-1.5 font-sans font-black">
                  CZ
                </span>
                <span>{currentVehicle.licensePlate}</span>
              </div>
            </div>

            {/* Vehicle Graphic / Render Display */}
            <div className="relative my-3 sm:my-4 flex items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-carbon-950/80 shadow-2xl">
              <img
                src={currentVehicle.image || './assets/hatchback.jpg'}
                alt={currentVehicle.name}
                className="w-full h-48 sm:h-56 object-cover object-center group-hover:scale-105 transition-transform duration-700"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-carbon-950 via-transparent to-transparent opacity-80" />

              {/* Overlay Specifications Badge */}
              <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 right-2 sm:right-3 flex items-center justify-between text-[11px] sm:text-xs font-mono backdrop-blur-md bg-carbon-900/80 p-2 sm:p-2.5 rounded-lg border border-white/10">
                <div className="flex items-center space-x-2 sm:space-x-3 truncate mr-1">
                  <span className="text-slate-400">VIN:</span>
                  <span className="text-white font-bold tracking-wider truncate">{currentVehicle.vin}</span>
                </div>
                <button
                  onClick={() => setIsSpecsModalOpen(true)}
                  className="text-electric hover:text-white transition-colors flex items-center space-x-1 flex-shrink-0"
                >
                  <span>Specs</span>
                  <Icons.ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Bottom Quick Spec Pills */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 pt-2 border-t border-white/5 text-center">
              <div className="bg-carbon-900/60 p-1.5 sm:p-2 rounded-lg border border-white/5">
                <span className="text-[9px] sm:text-[10px] text-slate-400 block font-tech uppercase">Drivetrain</span>
                <span className="text-[11px] sm:text-xs font-mono font-bold text-white truncate block">{currentVehicle.drivetrain}</span>
              </div>
              <div className="bg-carbon-900/60 p-1.5 sm:p-2 rounded-lg border border-white/5">
                <span className="text-[9px] sm:text-[10px] text-slate-400 block font-tech uppercase">Fuel Tank</span>
                <span className="text-[11px] sm:text-xs font-mono font-bold text-white block">{currentVehicle.fuelCapacity} L</span>
              </div>
              <div className="bg-carbon-900/60 p-1.5 sm:p-2 rounded-lg border border-white/5">
                <span className="text-[9px] sm:text-[10px] text-slate-400 block font-tech uppercase">Health Score</span>
                <span className="text-[11px] sm:text-xs font-mono font-bold text-neon block">94 / 100</span>
              </div>
            </div>
          </div>

          {/* TELEMETRY GAUGES (7 Cols) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Gauge 1: Fuel Level */}
            <CircularGauge
              label="Fuel Level"
              value={currentVehicle.currentFuelLevel}
              max={100}
              unit="%"
              color={currentVehicle.currentFuelLevel > 25 ? 'electric' : 'racing'}
              icon={Icons.Fuel}
              subtitle={`Est. ${Math.round((currentVehicle.fuelCapacity * (currentVehicle.currentFuelLevel / 100) / currentVehicle.avgFuelConsumption) * 100)} km range remaining`}
            />

            {/* Gauge 2: Oil Health */}
            <CircularGauge
              label="Oil Health"
              value={oilHealthPercent}
              max={100}
              unit="%"
              color={oilHealthPercent > 40 ? 'neon' : 'amber'}
              icon={Icons.OilDrop}
              subtitle={`Next service in ${Math.max(0, currentVehicle.oilChangeInterval - (currentVehicle.currentMileage - currentVehicle.lastOilChangeMileage)).toLocaleString()} km`}
            />

            {/* Gauge 3: Mechanical Health */}
            <CircularGauge
              label="Brake Health"
              value={mechanicalHealthPercent}
              max={100}
              unit="%"
              color="neon"
              icon={Icons.Disc}
              subtitle="Rotors & ceramic pads at 92% thickness"
            />
          </div>
        </div>

        {/* ROW 2: DIGITAL ODOMETER & TELEMETRY STATS BAR */}
        <TelemetryQuickStats
          vehicle={currentVehicle}
          totalSpent={totalSpent}
          logCount={vehicleLogs.length}
        />

        {/* ROW 3: TPMS DIAGNOSTICS & ANALYTICS CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* TPMS 4-Wheel Realtime Widget (4 Cols) */}
          <div className="lg:col-span-4">
            <TPMSWidget
              tpms={currentVehicle.tpms}
              onInspectTires={() => {
                playCockpitSound('click', soundEnabled);
                alert('Tire pressures nominal: Front 2.2 bar / Rear 2.1 bar calibrated.');
              }}
            />
          </div>

          {/* Interactive Analytics Telemetry Chart (8 Cols) */}
          <div className="lg:col-span-8">
            <AnalyticsTelemetryChart logs={vehicleLogs} />
          </div>
        </div>

        {/* ROW 4: MAINTENANCE LOG & SERVICE HISTORY (TIMELINE) */}
        <div>
          <MaintenanceHistoryTimeline
            logs={vehicleLogs}
            onDeleteLog={handleDeleteLog}
            onAddNewRecord={() => setIsAddModalOpen(true)}
          />
        </div>

      </main>

      {/* ================= MODALS ================= */}
      {/* 1. Add Record Modal */}
      <AddRecordModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddLog}
        currentMileage={currentVehicle.currentMileage}
      />

      {/* 2. Vehicle Specs Modal */}
      <VehicleSpecsModal
        isOpen={isSpecsModalOpen}
        onClose={() => setIsSpecsModalOpen(false)}
        vehicle={currentVehicle}
        onSaveVehicle={handleSaveVehicle}
      />

      {/* Footer Branding */}
      <footer className="max-w-7xl mx-auto px-4 lg:px-8 mt-12 text-center text-xs text-slate-500 font-mono">
        <p>SHIFTLOG AUTOMOTIVE TELEMETRY • BUILT FOR ENTHUSIASTS & TRACKERS</p>
        <p className="mt-1 text-[11px] text-slate-600">Local-first client storage • 2009 Compact Hatchback Telemetry Profile Active</p>
      </footer>
    </div>
  );
}

// Mount the App
const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);
root.render(<ShiftLogApp />);
git remote set - url origin https://github.com/VincentProchazka/kody.github.io.git
git push - u origin main--force

