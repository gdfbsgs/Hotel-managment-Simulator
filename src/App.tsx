/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Editor2D } from './components/Editor2D';
import { Viewer3D } from './components/Viewer3D';
import { Management } from './components/Management';
import { Analytics } from './components/Analytics';
import { AnimatedMoney } from './components/AnimatedMoney';
import { useHotelStore, DEFAULT_BRANDS } from './store';
import { Box, Layers, LogIn, LogOut, Save, User as UserIcon, Trophy, Sparkles, Star, Building2, TrendingUp, Menu, X, Share2, Check } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  const { 
    viewMode, 
    setViewMode, 
    appMode, 
    setAppMode, 
    user, 
    setUser, 
    login, 
    logout, 
    loadFromCloud, 
    saveToCloud, 
    money, 
    activeMilestoneNotification, 
    dismissMilestoneNotification,
    floors,
    totalGuestsServed,
    guests,
    hotels,
    activeHotelId,
    activeHotelBrandId,
    customBrands,
    graphicsQuality,
    setGraphicsQuality,
    spectatorMode,
    setSpectatorMode
  } = useHotelStore();

  const starRating = React.useMemo(() => {
    const currentFloorsCount = floors.length;
    const currentGuestsCount = totalGuestsServed || 0;
    
    // Average guest satisfaction score
    const inRoomGuests = guests.filter(g => g.state === 'in-room');
    const avgSatisfaction = inRoomGuests.length > 0
      ? inRoomGuests.reduce((acc, g) => acc + (g.isVip ? (g.vipSatisfaction || 50) : (g.satisfaction || 75)), 0) / inRoomGuests.length
      : 75;

    // Award rating points:
    // - Base: 1.0 star
    // - Floors: max 1.5 stars (0.15 stars per floor, capped at 10 floors)
    // - Guests Served: max 1.5 stars (0.05 stars per guest served, up to 30 guests)
    // - Satisfaction: max 1.0 star (avgSatisfaction / 100 * 1.0)
    const floorStars = Math.min(1.5, currentFloorsCount * 0.15);
    const guestStars = Math.min(1.5, currentGuestsCount * 0.05);
    const satisfactionStars = (avgSatisfaction / 100) * 1.0;

    const totalRating = 1.0 + floorStars + guestStars + satisfactionStars;
    return Math.min(5.0, Math.max(1.0, Math.round(totalRating * 10) / 10));
  }, [floors, totalGuestsServed, guests]);

  const activeHotel = (hotels || []).find(h => h.id === activeHotelId) || hotels?.[0] || { name: 'Grand Plaza Resort', brandId: 'b-budget' };
  const allBrands = [...DEFAULT_BRANDS, ...(customBrands || [])];
  const activeBrand = allBrands.find(b => b.id === (activeHotel.brandId || activeHotelBrandId)) || DEFAULT_BRANDS[0];

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        loadFromCloud(u.uid);
      } else {
        useHotelStore.getState().loadPreset('auto-preset');
      }
    });
    return unsub;
  }, []);

  useEffect(() => {
    // Process guests and earn money every 5 seconds
    const interval = setInterval(() => {
      useHotelStore.getState().processGuests();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Tick NPCs for movement and state updates every 1 second
    const interval = setInterval(() => {
      useHotelStore.getState().tickNPCs();
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleShare = async () => {
    if (!activeMilestoneNotification) return;
    const rarityLabel = activeMilestoneNotification.rarity 
      ? activeMilestoneNotification.rarity.charAt(0).toUpperCase() + activeMilestoneNotification.rarity.slice(1)
      : 'Gold';
    const shareText = `🏆 ArchHotel Milestone Unlocked! 🏆
---------------------------------------------
⭐ Achievement: ${activeMilestoneNotification.title} (${rarityLabel} Milestone)
📝 Description: ${activeMilestoneNotification.description}

🏨 Hotel: ${activeHotel.name}
🏷️ Brand: ${activeBrand.name} ${activeBrand.icon}
📐 Layout: ${floors.length} Floor(s)
👥 Guests Served: ${totalGuestsServed}

Built and managed with ArchHotel Suite!`;

    try {
      await navigator.clipboard.writeText(shareText);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  };

  const rarityStyles = {
    bronze: {
      badgeBg: 'bg-orange-950/40 border-orange-500/20 text-orange-400',
      iconColor: 'text-orange-500',
      iconBg: 'border-orange-500/20 bg-orange-950/10',
      cardBorder: 'border-orange-500/30',
      glowColor: 'bg-orange-500/10',
      sparklesColor: 'text-orange-400',
      labelText: 'Bronze Milestone 🥉',
    },
    silver: {
      badgeBg: 'bg-slate-800 border-slate-700 text-slate-300',
      iconColor: 'text-slate-300',
      iconBg: 'border-slate-700 bg-slate-800/20',
      cardBorder: 'border-slate-700',
      glowColor: 'bg-slate-500/10',
      sparklesColor: 'text-slate-400',
      labelText: 'Silver Milestone 🥈',
    },
    gold: {
      badgeBg: 'bg-amber-950/40 border-amber-500/20 text-amber-400',
      iconColor: 'text-amber-400',
      iconBg: 'border-amber-500/20 bg-amber-950/10',
      cardBorder: 'border-amber-500/30',
      glowColor: 'bg-amber-500/10',
      sparklesColor: 'text-amber-400',
      labelText: 'Gold Milestone 🥇',
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-zinc-950 text-zinc-100 font-sans overflow-hidden pb-16 sm:pb-0">
      <nav className="h-16 bg-zinc-900/90 backdrop-blur-md border-b border-zinc-800/80 flex items-center justify-between px-4 sm:px-6 shrink-0 shadow-2xl z-20">
        <div className="flex items-center gap-4 sm:gap-8">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/15 shrink-0">
              <span className="text-zinc-950 font-black text-sm">{activeBrand.icon}</span>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold tracking-tight text-white leading-none text-xs sm:text-sm">
                {activeHotel.name} <span className="text-[10px] sm:text-xs font-semibold text-amber-500 block sm:inline mt-0.5 sm:mt-0 sm:ml-1.5 font-mono uppercase">[{activeBrand.name}]</span>
              </span>
              {/* Stars display */}
              <div className="flex items-center gap-0.5 mt-1">
                {Array.from({ length: 5 }).map((_, i) => {
                  const val = i + 1;
                  const isFilled = val <= Math.round(starRating);
                  return (
                    <Star 
                      key={i} 
                      size={10} 
                      className={`${isFilled ? 'text-amber-400 fill-amber-400 animate-pulse' : 'text-zinc-700'}`} 
                    />
                  );
                })}
                <span className="text-[9px] text-zinc-400 font-bold font-mono ml-1">({starRating.toFixed(1)} ★)</span>
              </div>
            </div>
          </div>
          <div className="flex gap-6 text-xs font-semibold uppercase tracking-wider hidden sm:flex">
            <span 
              onClick={() => setAppMode('Design')}
              className={`cursor-pointer transition-all duration-200 ${appMode === 'Design' ? 'text-amber-400 border-b-2 border-amber-500 pb-2 mt-1 font-bold' : 'text-zinc-400 hover:text-white mt-1'}`}>
              Design
            </span>
            <span 
              onClick={() => setAppMode('Management')}
              className={`cursor-pointer transition-all duration-200 ${appMode === 'Management' ? 'text-amber-400 border-b-2 border-amber-500 pb-2 mt-1 font-bold' : 'text-zinc-400 hover:text-white mt-1'}`}>
              Management
            </span>
            <span 
              onClick={() => setAppMode('Analytics')}
              className={`cursor-pointer transition-all duration-200 ${appMode === 'Analytics' ? 'text-amber-400 border-b-2 border-amber-500 pb-2 mt-1 font-bold' : 'text-zinc-400 hover:text-white mt-1'}`}>
              Analytics
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3">
          <AnimatedMoney money={money} />
          {appMode === 'Design' && (
            <div className="flex items-center gap-1 p-0.5 bg-zinc-950 rounded-xl border border-zinc-800 shadow-inner scale-90 sm:scale-100">
              <button
                onClick={() => setViewMode('2D')}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg text-[10px] sm:text-[11px] font-extrabold transition-all uppercase tracking-wide cursor-pointer ${
                  viewMode === '2D' 
                    ? 'bg-amber-500 text-zinc-950 shadow-sm border border-amber-400/30' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
                }`}
              >
                2D
              </button>
              <button
                onClick={() => setViewMode('3D')}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg text-[10px] sm:text-[11px] font-extrabold transition-all uppercase tracking-wide cursor-pointer ${
                  viewMode === '3D' 
                    ? 'bg-amber-500 text-zinc-950 shadow-sm border border-amber-400/30' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
                }`}
              >
                3D
              </button>
              <button
                onClick={() => setViewMode('Walk')}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg text-[10px] sm:text-[11px] font-extrabold transition-all uppercase tracking-wide cursor-pointer ${
                  viewMode === 'Walk' 
                    ? 'bg-amber-500 text-zinc-950 shadow-sm border border-amber-400/30 shadow-amber-500/5' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
                }`}
              >
                Walk
              </button>
            </div>
          )}

          {/* Realism & Engine Quality Settings Control */}
          <div className="relative group/settings z-30">
            <button className="flex items-center gap-1.5 px-3.5 py-2 text-xs bg-zinc-950 hover:bg-zinc-900 text-zinc-300 border border-zinc-800 rounded-xl transition-colors cursor-pointer font-bold select-none">
              <Sparkles size={13} className="text-amber-500 animate-pulse" />
              <span className="hidden md:inline">Realism Controls</span>
              <span className="md:hidden">Settings</span>
            </button>
            
            {/* Hover dropdown */}
            <div className="absolute right-0 top-full mt-1.5 hidden group-hover/settings:block bg-zinc-900 border-2 border-zinc-800 shadow-2xl rounded-2xl p-4 min-w-[240px] text-left animate-in fade-in slide-in-from-top-1 duration-150">
              <h4 className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-3 border-b border-zinc-850 pb-1.5">Simulation Engine</h4>
              
              {/* Graphics Quality */}
              <div className="flex flex-col gap-1.5 mb-4">
                <label className="text-[10px] font-bold text-zinc-400 uppercase font-mono">Render Quality</label>
                <div className="grid grid-cols-4 gap-1 p-0.5 bg-zinc-950 rounded-xl border border-zinc-800">
                  {(['low', 'medium', 'high', 'ultra'] as const).map((q) => {
                    const active = graphicsQuality === q;
                    return (
                      <button
                        key={q}
                        onClick={() => setGraphicsQuality(q)}
                        className={`py-1 text-[9px] font-black rounded-lg capitalize transition-all cursor-pointer ${
                          active 
                            ? 'bg-amber-500 text-zinc-950' 
                            : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        {q === 'medium' ? 'Med' : q}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Spectator Mode */}
              <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-zinc-350 uppercase">Spectator Mode</span>
                  <span className="text-[8px] text-zinc-500 font-mono">Noclip Flight Mode</span>
                </div>
                <button
                  onClick={() => setSpectatorMode(!spectatorMode)}
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${spectatorMode ? 'bg-amber-500' : 'bg-zinc-800'}`}
                >
                  <div className={`bg-white w-5 h-5 rounded-full shadow-md transition-transform ${spectatorMode ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>
          </div>

          <div className="w-px h-6 bg-zinc-800 mx-1 hidden sm:block"></div>
          {user ? (
            <>
              <button onClick={saveToCloud} className="flex items-center gap-1.5 px-3 py-2 text-xs bg-emerald-600 text-white rounded-xl font-bold shadow-md hover:bg-emerald-700 transition-colors hidden sm:flex">
                <Save size={14} /> Save
              </button>
              <div className="relative group">
                <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center overflow-hidden cursor-pointer">
                  {user.photoURL ? <img src={user.photoURL} alt="User" /> : <UserIcon size={16} className="text-zinc-300" />}
                </div>
                <div className="absolute right-0 top-full mt-1.5 hidden group-hover:block bg-zinc-900 border border-zinc-800 shadow-2xl rounded-xl py-1 z-50 min-w-[140px] overflow-hidden">
                  <div className="px-3 py-2 text-xs text-zinc-400 border-b border-zinc-850 truncate">{user.email}</div>
                  <button onClick={logout} className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-zinc-800 flex items-center gap-2">
                    <LogOut size={14} /> Sign out
                  </button>
                </div>
              </div>
            </>
          ) : (
            <button onClick={login} className="flex items-center gap-1.5 px-3.5 py-2 text-xs bg-amber-500 hover:bg-amber-600 text-zinc-950 rounded-xl font-extrabold shadow-lg shadow-amber-500/10 transition-colors">
              <LogIn size={14} /> Sign In
            </button>
          )}
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden relative">
        {appMode === 'Design' && (
          <>
            {/* Desktop Sidebar */}
            <div className="hidden md:block">
              {viewMode === '2D' && <Sidebar />}
            </div>

            {/* Mobile Sidebar Overlay */}
            {viewMode === '2D' && mobileSidebarOpen && (
              <div className="md:hidden fixed inset-y-16 right-0 w-64 bg-zinc-900 border-l border-zinc-800 z-30 shadow-2xl overflow-y-auto">
                <div className="p-2.5 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Toolbox & Floors</span>
                  <button onClick={() => setMobileSidebarOpen(false)} className="p-1.5 text-zinc-400 hover:text-white">
                    <X size={16} />
                  </button>
                </div>
                <Sidebar />
              </div>
            )}

            {/* Floating Mobile Toolbox Button */}
            {viewMode === '2D' && (
              <button
                onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                className="md:hidden fixed bottom-20 right-4 z-30 bg-amber-500 text-zinc-950 px-4 py-2.5 rounded-full shadow-2xl font-black flex items-center gap-1.5 border border-amber-400 text-xs uppercase tracking-wider transition-all active:scale-95"
              >
                {mobileSidebarOpen ? <X size={14} /> : <Layers size={14} />}
                <span>{mobileSidebarOpen ? 'Close Tools' : 'Tools & Floors'}</span>
              </button>
            )}

            <main className="flex-1 flex flex-col relative overflow-hidden bg-zinc-950">
              {viewMode === '2D' ? <Editor2D /> : <Viewer3D mode={viewMode} />}
            </main>
          </>
        )}
        {appMode === 'Management' && <Management />}
        {appMode === 'Analytics' && <Analytics />}
      </div>
      
      {/* Mobile Bottom Navigation Bar (Visible only on screens < sm) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 h-16 bg-zinc-900 border-t border-zinc-800 z-30 flex items-center justify-around px-2 shadow-xl shrink-0">
        <button
          onClick={() => setAppMode('Design')}
          className={`flex flex-col items-center justify-center w-20 h-full transition-all ${
            appMode === 'Design' ? 'text-amber-400 font-extrabold scale-105' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Layers size={18} />
          <span className="text-[10px] mt-1 font-bold">Design</span>
        </button>
        
        <button
          onClick={() => setAppMode('Management')}
          className={`flex flex-col items-center justify-center w-20 h-full transition-all ${
            appMode === 'Management' ? 'text-amber-400 font-extrabold scale-105' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Building2 size={18} />
          <span className="text-[10px] mt-1 font-bold">HQ & Staff</span>
        </button>
        
        <button
          onClick={() => setAppMode('Analytics')}
          className={`flex flex-col items-center justify-center w-20 h-full transition-all ${
            appMode === 'Analytics' ? 'text-amber-400 font-extrabold scale-105' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <TrendingUp size={18} />
          <span className="text-[10px] mt-1 font-bold">Analytics</span>
        </button>
      </div>

      <footer className="h-7 bg-zinc-950 border-t border-zinc-850 px-4 flex items-center justify-between text-[10px] text-zinc-400 shrink-0 font-medium z-20 relative hidden sm:flex">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Engine Active</span>
          <span>Grid: 0.50m</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-amber-500 cursor-pointer">Auto-saved to Cloud</span>
        </div>
      </footer>

      {/* Milestone Celebratory Modal */}
      <AnimatePresence>
        {activeMilestoneNotification && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={dismissMilestoneNotification}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
              id="milestone-overlay-backdrop"
            />

            {/* Modal Card */}
            {(() => {
              const rStyles = rarityStyles[activeMilestoneNotification.rarity || 'gold'];
              return (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                  className={`relative w-full max-w-md bg-slate-900 border ${rStyles.cardBorder} rounded-2xl shadow-2xl p-6 sm:p-8 text-center overflow-hidden z-10`}
                  id="milestone-celebrate-card"
                >
                  {/* Decorative Background Glows */}
                  <div className={`absolute -top-24 -left-24 w-48 h-48 ${rStyles.glowColor} rounded-full blur-3xl pointer-events-none`} />
                  <div className={`absolute -bottom-24 -right-24 w-48 h-48 ${rStyles.glowColor} rounded-full blur-3xl pointer-events-none`} />

                  {/* Sparkles / Trophy Icon with Pulse & Rotation */}
                  <div className="relative flex justify-center mb-6">
                    <motion.div
                      initial={{ rotate: -15, scale: 0.5 }}
                      animate={{ rotate: [0, -10, 10, -10, 10, 0], scale: 1 }}
                      transition={{ delay: 0.1, duration: 0.8 }}
                      className={`w-20 h-20 bg-slate-950 rounded-2xl flex items-center justify-center border ${rStyles.iconBg} shadow-md relative`}
                    >
                      <Trophy className={`${rStyles.iconColor} w-10 h-10 animate-bounce`} id="milestone-trophy-icon" />
                      <Sparkles className={`absolute top-2 right-2 ${rStyles.sparklesColor} w-4 h-4 animate-pulse`} />
                      <Sparkles className={`absolute bottom-2 left-2 ${rStyles.sparklesColor} w-4 h-4 animate-pulse`} />
                    </motion.div>
                  </div>

                  {/* Congratulatory Text */}
                  <span className={`text-[10px] font-bold ${rStyles.badgeBg} tracking-widest uppercase px-2.5 py-1 rounded-full border inline-block mb-3`}>
                    {rStyles.labelText}
                  </span>
                  
                  <h3 className="text-2xl font-black text-white tracking-tight font-sans leading-none mb-2" id="milestone-title-text">
                    {activeMilestoneNotification.title}
                  </h3>
                  
                  <p className="text-slate-400 text-sm max-w-xs mx-auto mb-6">
                    {activeMilestoneNotification.description}
                  </p>

                  {/* Unlocked Badge Detail */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 mb-6 flex items-center justify-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                      Unlocked on {activeMilestoneNotification.unlockedAt || 'ArchHotel'}
                    </span>
                  </div>

                  {/* Share and Dismiss Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleShare}
                      className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold border transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                        copiedShare 
                          ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' 
                          : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white'
                      }`}
                      id="milestone-share-btn"
                    >
                      {copiedShare ? (
                        <>
                          <Check size={16} className="text-emerald-400" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Share2 size={16} />
                          <span>Share</span>
                        </>
                      )}
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        dismissMilestoneNotification();
                        setCopiedShare(false);
                      }}
                      className="flex-[2] py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-sm font-bold shadow-lg shadow-amber-500/10 border border-amber-400 transition-colors cursor-pointer flex items-center justify-center"
                      id="milestone-dismiss-btn"
                    >
                      Awesome! Let's build on!
                    </motion.button>
                  </div>
                </motion.div>
              );
            })()}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
