/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Editor2D } from './components/Editor2D';
import { Viewer3D } from './components/Viewer3D';
import { Management } from './components/Management';
import { Analytics } from './components/Analytics';
import { useHotelStore } from './store';
import { Box, Layers, LogIn, LogOut, Save, User as UserIcon } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

export default function App() {
  const { viewMode, setViewMode, appMode, setAppMode, user, setUser, login, logout, loadFromCloud, saveToCloud, money } = useHotelStore();

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

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 text-slate-800 font-sans overflow-hidden">
      <nav className="h-12 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0 shadow-sm z-20">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-xs">A</span>
            </div>
            <span className="font-semibold tracking-tight text-slate-800">ArchHotel <span className="font-normal text-slate-500">Suite</span></span>
          </div>
          <div className="flex gap-4 text-xs font-medium text-slate-500 uppercase tracking-widest hidden sm:flex">
            <span 
              onClick={() => setAppMode('Design')}
              className={`cursor-pointer ${appMode === 'Design' ? 'text-blue-600 border-b-2 border-blue-600 pb-1' : 'hover:text-slate-800'}`}>
              Design
            </span>
            <span 
              onClick={() => setAppMode('Management')}
              className={`cursor-pointer ${appMode === 'Management' ? 'text-blue-600 border-b-2 border-blue-600 pb-1' : 'hover:text-slate-800'}`}>
              Management
            </span>
            <span 
              onClick={() => setAppMode('Analytics')}
              className={`cursor-pointer ${appMode === 'Analytics' ? 'text-blue-600 border-b-2 border-blue-600 pb-1' : 'hover:text-slate-800'}`}>
              Analytics
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-emerald-700 font-bold text-xs bg-emerald-100 px-3 py-1.5 rounded-full border border-emerald-200">
            ${money.toLocaleString()}
          </div>
          {appMode === 'Design' && (
            <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded border border-slate-200 shadow-inner">
              <button
                onClick={() => setViewMode('2D')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-[11px] font-bold transition-all uppercase tracking-wide ${
                  viewMode === '2D' 
                    ? 'bg-white text-blue-600 shadow-sm border border-slate-200/60' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                }`}
              >
                <Layers size={14} />
                2D
              </button>
              <button
                onClick={() => setViewMode('3D')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-[11px] font-bold transition-all uppercase tracking-wide ${
                  viewMode === '3D' 
                    ? 'bg-white text-blue-600 shadow-sm border border-slate-200/60' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                }`}
              >
                <Box size={14} />
                3D
              </button>
              <button
                onClick={() => setViewMode('Walk')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-[11px] font-bold transition-all uppercase tracking-wide ${
                  viewMode === 'Walk' 
                    ? 'bg-white text-blue-600 shadow-sm border border-slate-200/60' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                }`}
              >
                Walk
              </button>
            </div>
          )}
          <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block"></div>
          {user ? (
            <>
              <button onClick={saveToCloud} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-emerald-600 text-white rounded font-medium shadow-sm hover:bg-emerald-700 transition-colors hidden sm:flex">
                <Save size={14} /> Save
              </button>
              <div className="relative group">
                <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-300 flex items-center justify-center overflow-hidden cursor-pointer">
                  {user.photoURL ? <img src={user.photoURL} alt="User" /> : <UserIcon size={16} className="text-blue-600" />}
                </div>
                <div className="absolute right-0 top-full mt-1 hidden group-hover:block bg-white border border-slate-200 shadow-lg rounded py-1 z-50 min-w-[120px]">
                  <div className="px-3 py-2 text-xs text-slate-500 border-b border-slate-100 truncate">{user.email}</div>
                  <button onClick={logout} className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2">
                    <LogOut size={14} /> Sign out
                  </button>
                </div>
              </div>
            </>
          ) : (
            <button onClick={login} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-600 text-white rounded font-medium shadow-sm hover:bg-blue-700 transition-colors">
              <LogIn size={14} /> Sign In
            </button>
          )}
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden">
        {appMode === 'Design' && (
          <>
            {viewMode === '2D' && <Sidebar />}
            <main className="flex-1 flex flex-col relative overflow-hidden bg-slate-200">
              {viewMode === '2D' ? <Editor2D /> : <Viewer3D mode={viewMode} />}
            </main>
          </>
        )}
        {appMode === 'Management' && <Management />}
        {appMode === 'Analytics' && <Analytics />}
      </div>
      
      <footer className="h-7 bg-slate-100 border-t border-slate-200 px-4 flex items-center justify-between text-[10px] text-slate-500 shrink-0 font-medium z-20 relative">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Engine Active</span>
          <span>Grid: 0.50m</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-blue-600 cursor-pointer">Auto-save: just now</span>
        </div>
      </footer>
    </div>
  );
}
