import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Compass, Sparkles, Building2, ChevronRight, ChevronLeft, User, Check, RefreshCw } from 'lucide-react';
import { useHotelStore, DEFAULT_BRANDS, CHAIN_PRESETS } from '../store';
import { Brand } from '../types';

export function Onboarding() {
  const setOnboarding = useHotelStore(state => state.setOnboarding);
  
  const [step, setStep] = useState(1);
  const [playerName, setPlayerName] = useState('');
  const [chainName, setChainName] = useState('Marriott International');
  const [hotelName, setHotelName] = useState('Courtyard by Marriott');
  
  // Chain option
  const [selectedChainId, setSelectedChainId] = useState('c-marriott');
  
  // Brand options
  const [selectedBrandId, setSelectedBrandId] = useState('b-courtyard');
  const [customBrandName, setCustomBrandName] = useState('');
  const [customBrandDesc, setCustomBrandDesc] = useState('');
  const [customBrandIcon, setCustomBrandIcon] = useState('🌟');
  const [customBrandColor, setCustomBrandColor] = useState('from-indigo-500 to-purple-500');

  // Location options
  const [searchQuery, setSearchQuery] = useState('');
  const [address, setAddress] = useState('Oxford Street, London, UK');
  const [lat, setLat] = useState(51.5074);
  const [lng, setLng] = useState(-0.1278);
  const [sceneryTheme, setSceneryTheme] = useState<'city' | 'beach' | 'mountain' | 'forest' | 'desert'>('city');
  const [isSearching, setIsSearching] = useState(false);

  // Map elements
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // Load Leaflet dynamically to avoid React 19 compile errors
  useEffect(() => {
    if (step !== 3 || !mapContainerRef.current) return;

    let mapInstance: any = null;
    let markerInstance: any = null;

    const initMap = () => {
      // @ts-ignore
      const L = window.L;
      if (!L) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      mapInstance = L.map(mapContainerRef.current).setView([lat, lng], 13);
      mapInstanceRef.current = mapInstance;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstance);

      // Create marker
      markerInstance = L.marker([lat, lng], { draggable: true }).addTo(mapInstance);
      markerRef.current = markerInstance;

      // Update position on drag end
      markerInstance.on('dragend', () => {
        const position = markerInstance.getLatLng();
        setLat(position.lat);
        setLng(position.lng);
        setAddress(`Custom Location (${position.lat.toFixed(4)}, ${position.lng.toFixed(4)})`);
      });

      // Update position on click
      mapInstance.on('click', (e: any) => {
        const position = e.latlng;
        markerInstance.setLatLng(position);
        setLat(position.lat);
        setLng(position.lng);
        setAddress(`Custom Pinpoint (${position.lat.toFixed(4)}, ${position.lng.toFixed(4)})`);
      });
    };

    // Check if Leaflet is loaded
    // @ts-ignore
    if (!window.L) {
      // Append styles
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      // Append script
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.onload = () => {
        // Wait a small bit for Leaflet to parse
        setTimeout(initMap, 100);
      };
      document.body.appendChild(script);
    } else {
      initMap();
    }

    return () => {
      if (mapInstance) {
        mapInstance.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [step]);

  // Handle Nominatim Address search
  const handleAddressSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);

    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`);
      const data = await response.json();
      if (data && data.length > 0) {
        const first = data[0];
        const newLat = parseFloat(first.lat);
        const newLng = parseFloat(first.lon);
        setLat(newLat);
        setLng(newLng);
        setAddress(first.display_name);

        // Auto-detect scenery
        const lower = first.display_name.toLowerCase();
        if (lower.includes('beach') || lower.includes('coast') || lower.includes('sea') || lower.includes('ocean') || lower.includes('copacabana') || lower.includes('malibu') || lower.includes('beachfront') || lower.includes('hawaii')) {
          setSceneryTheme('beach');
        } else if (lower.includes('mountain') || lower.includes('alps') || lower.includes('aspen') || lower.includes('snow') || lower.includes('summit') || lower.includes('hill') || lower.includes('swiss')) {
          setSceneryTheme('mountain');
        } else if (lower.includes('forest') || lower.includes('wood') || lower.includes('park') || lower.includes('lake') || lower.includes('countryside') || lower.includes('jungle')) {
          setSceneryTheme('forest');
        } else if (lower.includes('desert') || lower.includes('dune') || lower.includes('sahara') || lower.includes('vegas') || lower.includes('dubai') || lower.includes('oasis') || lower.includes('egypt')) {
          setSceneryTheme('desert');
        } else {
          setSceneryTheme('city');
        }

        // Fly map
        // @ts-ignore
        const L = window.L;
        if (mapInstanceRef.current && L) {
          mapInstanceRef.current.setView([newLat, newLng], 14);
          if (markerRef.current) {
            markerRef.current.setLatLng([newLat, newLng]);
          }
        }
      } else {
        alert('Address not found. Please try another street name or city.');
      }
    } catch (err) {
      console.error(err);
      alert('Error searching for address. Please click on the map manually.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (!playerName.trim()) {
        alert('Please enter your manager name.');
        return;
      }
      if (!chainName.trim()) {
        alert('Please enter your hotel chain name.');
        return;
      }
      if (!hotelName.trim()) {
        setHotelName(`${chainName} Resort`);
      }
      setStep(2);
    } else if (step === 2) {
      if (selectedBrandId === 'custom') {
        if (!customBrandName.trim()) {
          alert('Please enter a custom brand name.');
          return;
        }
      }
      setStep(3);
    }
  };

  const handleBack = () => {
    setStep(prev => Math.max(1, prev - 1));
  };

  const handleComplete = () => {
    let finalBrandId = selectedBrandId;
    let customBrandObj: Brand | null = null;

    if (selectedBrandId === 'custom') {
      finalBrandId = `b-custom-${Date.now()}`;
      customBrandObj = {
        id: finalBrandId,
        name: customBrandName,
        description: customBrandDesc || 'A fictional custom brand crafted uniquely for this resort.',
        vipMultiplier: 1.4,
        bedMultiplier: 1.2,
        styleColor: `from-purple-600/20 to-purple-900/10 border-purple-500/30 text-purple-400`,
        vipSpawnRate: 0.22,
        icon: customBrandIcon || '✨',
        color: customBrandColor,
        isCustom: true
      };
    }

    setOnboarding(
      playerName,
      chainName,
      finalBrandId,
      customBrandObj,
      hotelName || `${chainName} Hotel`,
      {
        address,
        lat,
        lng,
        sceneryTheme
      }
    );
  };

  const customColors = [
    { label: 'Royal Violet', value: 'from-purple-500 to-indigo-500', bg: 'bg-purple-500' },
    { label: 'Neon Teal', value: 'from-teal-500 to-cyan-500', bg: 'bg-teal-500' },
    { label: 'Cyber Red', value: 'from-red-500 to-rose-500', bg: 'bg-red-500' },
    { label: 'Luxe Amber', value: 'from-amber-500 to-orange-500', bg: 'bg-amber-500' },
    { label: 'Eco Forest', value: 'from-emerald-500 to-green-500', bg: 'bg-emerald-500' },
  ];

  const customIcons = ['🌟', '🏨', '🏰', '🔮', '🍸', '🌊', '🌴', '🐆', '💎', '🎨'];

  return (
    <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto font-sans text-slate-100 animate-in fade-in duration-300">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-slate-950 flex">
          <div className={`h-full bg-amber-500 transition-all duration-300 ${
            step === 1 ? 'w-1/3' : step === 2 ? 'w-2/3' : 'w-full'
          }`} />
        </div>

        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/10">
              <Compass className="text-slate-950 w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white leading-none">ArchHotel Suite</h2>
              <p className="text-xs text-slate-400 mt-1">Start your dream hospitality empire</p>
            </div>
          </div>
          <span className="text-xs font-black font-mono text-slate-400 bg-slate-950 border border-slate-850 px-2.5 py-1 rounded-lg uppercase tracking-wider">
            Step {step} of 3
          </span>
        </div>

        {/* Step Contents */}
        <div className="p-6 overflow-y-auto flex-1">
          
          {/* STEP 1: PLAYER & CHAIN CREATION */}
          {step === 1 && (
            <div className="space-y-5 max-w-md mx-auto py-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-white mb-1">Establish Your Empire</h3>
                <p className="text-xs text-slate-400">Choose a corporate hospitality chain group or design your own custom label.</p>
              </div>

              {/* CHAIN PRESETS SELECTOR */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black uppercase text-slate-450 flex items-center gap-1.5 font-mono">
                  🏢 Select Your Corporate Chain Group
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {CHAIN_PRESETS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setSelectedChainId(c.id);
                        setChainName(c.name);
                        const firstBrandId = c.brands[0]?.id || 'b-courtyard';
                        setSelectedBrandId(firstBrandId);
                        setHotelName(`${c.brands[0]?.name || c.name} Resort`);
                      }}
                      className={`flex flex-col text-left p-3 rounded-xl border transition-all cursor-pointer select-none ${
                        selectedChainId === c.id
                          ? 'bg-slate-950 border-amber-500/60 shadow-md shadow-amber-500/5'
                          : 'bg-slate-950/30 border-slate-850 hover:border-slate-800 hover:bg-slate-950/60'
                      }`}
                    >
                      <span className="text-xs font-black text-white flex items-center gap-1.5">
                        <span className="text-sm">{c.icon}</span> {c.name.split(' ')[0]}
                      </span>
                      <span className="text-[10px] text-slate-450 line-clamp-1 mt-1 font-medium">{c.description}</span>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedChainId('custom');
                      setChainName('');
                      setSelectedBrandId('custom');
                      setHotelName('');
                    }}
                    className={`flex flex-col text-left p-3 rounded-xl border transition-all cursor-pointer select-none ${
                      selectedChainId === 'custom'
                        ? 'bg-slate-950 border-amber-500/60 shadow-md shadow-amber-500/5'
                        : 'bg-slate-950/30 border-slate-850 hover:border-slate-800 hover:bg-slate-950/60'
                    }`}
                  >
                    <span className="text-xs font-black text-amber-400 flex items-center gap-1.5">
                      <span>✨</span> Custom Chain
                    </span>
                    <span className="text-[10px] text-slate-450 line-clamp-1 mt-1 font-medium">Design custom chain and label</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black uppercase text-slate-450 flex items-center gap-1.5 font-mono">
                  <User size={13} className="text-amber-500" /> Player/Manager Name
                </label>
                <input
                  type="text"
                  placeholder="Manager Name (e.g., Arthur Pendragon)"
                  value={playerName}
                  onChange={e => setPlayerName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 hover:border-slate-800 focus:border-amber-500/60 rounded-xl px-4 py-2.5 text-sm font-semibold text-white placeholder-slate-600 outline-none transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black uppercase text-slate-450 flex items-center gap-1.5 font-mono">
                  <Building2 size={13} className="text-amber-500" /> Hospitality Chain Name
                </label>
                <input
                  type="text"
                  placeholder="Chain Name (e.g., Starlight Luxury Group)"
                  value={chainName}
                  disabled={selectedChainId !== 'custom'}
                  onChange={e => {
                    setChainName(e.target.value);
                    setHotelName(`${e.target.value} Grand Resort`);
                  }}
                  className={`w-full bg-slate-950 border border-slate-850 hover:border-slate-800 focus:border-amber-500/60 rounded-xl px-4 py-2.5 text-sm font-semibold text-white placeholder-slate-600 outline-none transition-colors ${
                    selectedChainId !== 'custom' ? 'opacity-60 cursor-not-allowed bg-slate-950/80 text-slate-400' : ''
                  }`}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black uppercase text-slate-450 flex items-center gap-1.5 font-mono">
                  🏨 First Hotel Name
                </label>
                <input
                  type="text"
                  placeholder="Hotel Name (e.g., Starlight Palm Oasis)"
                  value={hotelName}
                  onChange={e => setHotelName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 hover:border-slate-800 focus:border-amber-500/60 rounded-xl px-4 py-2.5 text-sm font-semibold text-white placeholder-slate-600 outline-none transition-colors"
                />
              </div>
            </div>
          )}

          {/* STEP 2: BRAND SELECTION OR FICTIONAL CREATION */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-white mb-1">Choose Brand Preset</h3>
                <p className="text-xs text-slate-400">
                  Select a brand depending on your selected corporate chain: <strong className="text-amber-400">{chainName || "Custom Chain"}</strong>.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(selectedChainId === 'custom'
                  ? DEFAULT_BRANDS
                  : (CHAIN_PRESETS.find(c => c.id === selectedChainId)?.brands || DEFAULT_BRANDS)
                ).map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBrandId(b.id)}
                    className={`flex flex-col text-left p-4 rounded-xl border transition-all cursor-pointer select-none ${
                      selectedBrandId === b.id
                        ? 'bg-slate-950 border-amber-500/60 shadow-lg shadow-amber-500/5'
                        : 'bg-slate-950/40 border-slate-850 hover:border-slate-800 hover:bg-slate-950/75'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-sm font-bold text-white flex items-center gap-2">
                        <span className="text-lg">{b.icon}</span> {b.name}
                      </span>
                      {selectedBrandId === b.id && <div className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center text-slate-950 text-[10px] font-bold">✓</div>}
                    </div>
                    <p className="text-xs text-slate-400 leading-normal line-clamp-2 mt-1">{b.description}</p>
                    <div className="flex items-center gap-3 mt-3 text-[10px] font-bold text-amber-500 uppercase font-mono border-t border-slate-900 pt-2 w-full">
                      <span>VIP mult: {b.vipMultiplier}x</span>
                      <span>Cost mult: {b.bedMultiplier}x</span>
                    </div>
                  </button>
                ))}

                {/* CUSTOM BRAND BUTTON */}
                <button
                  onClick={() => setSelectedBrandId('custom')}
                  className={`flex flex-col text-left p-4 rounded-xl border transition-all cursor-pointer select-none ${
                    selectedBrandId === 'custom'
                      ? 'bg-slate-950 border-amber-500/60 shadow-lg shadow-amber-500/5'
                      : 'bg-slate-950/40 border-slate-850 hover:border-slate-800 hover:bg-slate-950/75'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-sm font-bold text-white flex items-center gap-2">
                      <span className="text-lg">✨</span> Create Custom Brand
                    </span>
                    {selectedBrandId === 'custom' && <div className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center text-slate-950 text-[10px] font-bold">✓</div>}
                  </div>
                  <p className="text-xs text-slate-400 leading-normal mt-1">Design your own name, custom multipliers, theme colors, and icons from scratch!</p>
                  <div className="flex items-center gap-3 mt-3 text-[10px] font-bold text-slate-400 uppercase font-mono border-t border-slate-900 pt-2 w-full">
                    <span>Tailored Style</span>
                    <span>100% Unique</span>
                  </div>
                </button>
              </div>

              {/* Custom brand creation fields */}
              {selectedBrandId === 'custom' && (
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 space-y-4 mt-4 animate-in slide-in-from-top-2 duration-200">
                  <h4 className="text-xs font-black uppercase text-amber-500 tracking-wider font-mono">Custom Brand Configuration</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-500 font-mono">Brand Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Celestial Palace Group"
                        value={customBrandName}
                        onChange={e => setCustomBrandName(e.target.value)}
                        className="bg-slate-900 border border-slate-800 focus:border-purple-500/50 rounded-lg px-3 py-2 text-xs font-semibold text-white outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-500 font-mono">Brand Slogan/Description</label>
                      <input
                        type="text"
                        placeholder="e.g. A serene cosmic luxury sanctuary"
                        value={customBrandDesc}
                        onChange={e => setCustomBrandDesc(e.target.value)}
                        className="bg-slate-900 border border-slate-800 focus:border-purple-500/50 rounded-lg px-3 py-2 text-xs font-semibold text-white outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Brand Icon Selector */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-500 font-mono">Brand Icon (Emoji)</label>
                      <div className="flex flex-wrap gap-1">
                        {customIcons.map(icon => (
                          <button
                            key={icon}
                            type="button"
                            onClick={() => setCustomBrandIcon(icon)}
                            className={`w-7 h-7 flex items-center justify-center rounded-lg text-sm border transition-colors cursor-pointer ${
                              customBrandIcon === icon ? 'bg-amber-500 border-amber-400 text-slate-950' : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            {icon}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Brand Color Selector */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-500 font-mono">Accent Theme Color</label>
                      <div className="grid grid-cols-5 gap-1">
                        {customColors.map(color => (
                          <button
                            key={color.value}
                            type="button"
                            onClick={() => setCustomBrandColor(color.value)}
                            title={color.label}
                            className={`h-6 rounded-lg border transition-all relative cursor-pointer ${color.bg} ${
                              customBrandColor === color.value ? 'ring-2 ring-amber-500 scale-105 border-white' : 'border-slate-800 hover:border-slate-600'
                            }`}
                          >
                            {customBrandColor === color.value && (
                              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">✓</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: INTERACTIVE LOCATION SELECTOR */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-1.5">Select Your Geographic Location</h3>
                <p className="text-xs text-slate-400">Search for a street address, or pinpoint the hotel coordinate on the map. This generates real scenic backdrops in 3D mode!</p>
              </div>

              {/* Nominatim Search Form */}
              <form onSubmit={handleAddressSearch} className="flex gap-2 shrink-0">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Enter street, city, landmark (e.g. Oxford Street, London or Copacabana, Rio)"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 hover:border-slate-800 focus:border-amber-500/60 rounded-xl pl-10 pr-4 py-3 text-xs font-semibold text-white outline-none transition-all placeholder-slate-600"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSearching}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50 shrink-0 cursor-pointer"
                >
                  {isSearching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <MapPin className="w-3.5 h-3.5" />}
                  <span>{isSearching ? 'Locating...' : 'Locate'}</span>
                </button>
              </form>

              {/* Leaflet Map Frame */}
              <div className="relative w-full h-44 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner">
                <div ref={mapContainerRef} className="w-full h-full text-slate-900 z-10" />
                
                {/* Active Info Badge overlay */}
                <div className="absolute bottom-2 left-2 right-2 bg-slate-950/90 backdrop-blur-md border border-slate-850 px-3 py-1.5 rounded-lg text-[10px] text-slate-300 font-medium font-mono z-20 flex items-center gap-2 truncate">
                  <MapPin size={12} className="text-amber-500 shrink-0 animate-bounce" />
                  <span className="truncate flex-1">Address: {address}</span>
                  <span className="text-[9px] text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded uppercase font-black shrink-0">Pinned</span>
                </div>
              </div>

              {/* Scenery Environment Selectors */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider font-mono flex items-center gap-1">
                  <Sparkles size={11} className="text-amber-500" /> Choose Environment Scenery Theme
                </label>
                
                <div className="grid grid-cols-5 gap-2">
                  {(['city', 'beach', 'mountain', 'forest', 'desert'] as const).map((theme) => {
                    const labelStyles = {
                      city: { icon: '🏙️', label: 'City' },
                      beach: { icon: '🏖️', label: 'Beach' },
                      mountain: { icon: '🏔️', label: 'Mountain' },
                      forest: { icon: '🌲', label: 'Forest' },
                      desert: { icon: '🏜️', label: 'Desert' },
                    };
                    const item = labelStyles[theme];
                    const active = sceneryTheme === theme;
                    return (
                      <button
                        key={theme}
                        type="button"
                        onClick={() => setSceneryTheme(theme)}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all cursor-pointer ${
                          active 
                            ? 'bg-amber-500 border-amber-400 text-slate-950 font-extrabold shadow-md' 
                            : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200 hover:border-slate-800'
                        }`}
                      >
                        <span className="text-base mb-1">{item.icon}</span>
                        <span className="text-[9px] uppercase font-bold tracking-wide leading-none">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 shrink-0 flex items-center justify-between bg-slate-950/30">
          <div>
            {step > 1 && (
              <button
                onClick={handleBack}
                className="flex items-center gap-1 text-xs text-slate-450 hover:text-white font-bold transition-all px-3 py-2 cursor-pointer"
              >
                <ChevronLeft size={14} /> Back
              </button>
            )}
          </div>
          
          <button
            onClick={step < 3 ? handleNext : handleComplete}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-5 py-2.5 rounded-xl text-xs font-black tracking-wide flex items-center gap-1 shadow-lg shadow-amber-500/10 cursor-pointer border border-amber-400/35 transition-all"
          >
            <span>{step === 3 ? 'Launch Hotel Empire!' : 'Continue'}</span>
            {step < 3 ? <ChevronRight size={14} /> : <Check size={14} />}
          </button>
        </div>

      </div>
    </div>
  );
}
