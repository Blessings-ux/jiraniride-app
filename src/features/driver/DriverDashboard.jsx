// src/features/driver/DriverDashboard.jsx
import { useState, useEffect } from 'react';
import { Power, MapPin, Navigation, DollarSign, Bell, Shield, Menu, X, Phone, Star, Settings, Moon, Globe, ChevronRight, ArrowLeft } from 'lucide-react';
import { supabase } from '../../services/supabase';
import { useWakeLock } from '../../hooks/useWakeLock';

export default function DriverDashboard() {
  const [isOnline, setIsOnline] = useState(false);
  const [incomingRequest, setIncomingRequest] = useState(null);
  const [activeRide, setActiveRide] = useState(null);
  const [earnings, setEarnings] = useState(1250);
  
  // Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [appSettings, setAppSettings] = useState({
    notifications: true,
    darkMode: false,
    language: 'English'
  });

  // Dark mode effect
  useEffect(() => {
    if (appSettings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [appSettings.darkMode]);
  
  // Keep screen awake
  useWakeLock(); 

  // Mock incoming request
  useEffect(() => {
    let timeout;
    if (isOnline && !activeRide && !incomingRequest) {
      timeout = setTimeout(() => {
        setIncomingRequest({
          id: 'ride_123',
          passengerName: 'Kevin M.',
          rating: 4.8,
          pickup: 'Juja City Mall',
          dropoff: 'Jkuat Gate C',
          fare: 150,
          distance: '2.5 km',
          paymentMethod: 'M-Pesa'
        });
      }, 3000);
    }
    return () => clearTimeout(timeout);
  }, [isOnline, activeRide, incomingRequest]);

  const handleGoOnline = () => setIsOnline(true);
  const handleGoOffline = () => { setIsOnline(false); setIncomingRequest(null); };
  const acceptRide = () => { setActiveRide(incomingRequest); setIncomingRequest(null); };
  const completeRide = () => { setEarnings(prev => prev + activeRide.fare); setActiveRide(null); };

  return (
    <div className="h-[100dvh] w-full bg-white font-sans text-slate-900 flex flex-col overflow-hidden">
      
      {/* --- FIXED HEADER (Passenger Style) --- */}
      <div 
        className="fixed top-0 left-0 right-0 z-50 px-5 py-4 bg-gradient-to-b from-white/90 via-white/70 to-transparent backdrop-blur-sm"
        style={{ paddingTop: 'max(20px, env(safe-area-inset-top))' }}
      >
        <div className="flex justify-between items-center">
          {/* Earnings Badge (Styled like Passenger Points) */}
          <div className="bg-white px-4 py-2.5 rounded-2xl shadow-lg flex items-center gap-3 border border-slate-200/50">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center text-white shadow-inner">
              <span className="text-[10px] font-bold">KES</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-slate-500">Today</span>
              <span className="font-bold text-base text-slate-800">KES {earnings}</span>
            </div>
          </div>

          {/* Settings Button */}
          <button 
            onClick={() => setShowSettings(true)}
            className="bg-white p-3 rounded-2xl shadow-lg hover:bg-slate-50 transition active:scale-95 border border-slate-200/50 text-slate-700"
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* --- SETTINGS OVERLAY --- */}
      {showSettings && (
        <div className="fixed inset-0 z-[2000] bg-white overflow-y-auto animate-in slide-in-from-right duration-300">
          <div className="sticky top-0 z-10 bg-white border-b border-slate-100 p-4 flex items-center gap-4" style={{ paddingTop: 'max(16px, env(safe-area-inset-top))' }}>
            <button onClick={() => setShowSettings(false)} className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition active:scale-95">
              <ArrowLeft className="w-6 h-6 text-slate-700" />
            </button>
            <h2 className="text-lg font-bold text-slate-900">Settings</h2>
          </div>
          
          <div className="p-5 space-y-6">
            {/* App Settings */}
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">App Settings</h3>
              
              <button 
                onClick={() => setAppSettings(prev => ({ ...prev, notifications: !prev.notifications }))}
                className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shadow-sm transition-colors ${appSettings.notifications ? 'bg-purple-100 text-purple-600' : 'bg-white text-slate-400'}`}>
                    <Bell className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-slate-700">Notifications</span>
                </div>
                <div className={`w-10 h-6 rounded-full relative transition-colors ${appSettings.notifications ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${appSettings.notifications ? 'right-1' : 'left-1'}`} />
                </div>
              </button>

              <button 
                onClick={() => setAppSettings(prev => ({ ...prev, darkMode: !prev.darkMode }))}
                className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition group mt-2"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shadow-sm transition-colors ${appSettings.darkMode ? 'bg-slate-800 text-white' : 'bg-white text-slate-600'}`}>
                    <Moon className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-slate-700">Dark Mode</span>
                </div>
                <div className={`w-10 h-6 rounded-full relative transition-colors ${appSettings.darkMode ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${appSettings.darkMode ? 'right-1' : 'left-1'}`} />
                </div>
              </button>

              <button 
                onClick={() => setAppSettings(prev => ({ ...prev, language: prev.language === 'English' ? 'Swahili' : 'English' }))}
                className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition group mt-2"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-sm"><Globe className="w-5 h-5" /></div>
                  <span className="font-medium text-slate-700">Language</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  {appSettings.language} <ChevronRight className="w-4 h-4" />
                </div>
              </button>
            </div>

            {/* Support & Legal */}
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Support & Legal</h3>
              
              <a href="#" target="_blank" className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition group">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-emerald-600 shadow-sm"><Shield className="w-5 h-5" /></div>
                  <span className="font-medium text-slate-700">Privacy & Security</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 transition" />
              </a>

              <button onClick={() => alert('Rating feature coming soon!')} className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition group mt-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-yellow-500 shadow-sm"><Star className="w-5 h-5" /></div>
                  <span className="font-medium text-slate-700">Rate the App</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 transition" />
              </button>
            </div>

            {/* App Info */}
            <div className="pt-8 pb-4 text-center">
              <div className="w-12 h-12 bg-slate-100 rounded-xl mx-auto mb-3 flex items-center justify-center text-xl font-bold text-slate-400">J</div>
              <h4 className="font-bold text-slate-900">JiraniRide Driver</h4>
              <p className="text-xs text-slate-400 mt-1">Version 2.0.1 (Build 452)</p>
            </div>
          </div>
        </div>
      )}

      {/* --- TOP HALF: MAP --- */}
      <div className="relative h-[45vh] flex-shrink-0 mt-20">
        <iframe 
          width="100%" height="100%" frameBorder="0" 
          src="https://www.openstreetmap.org/export/embed.html?bbox=36.7%2C-1.3%2C37.1%2C-1.1&layer=mapnik" 
          className="w-full h-full opacity-80"
        ></iframe>
        
        {/* Navigation Overlay (when active) */}
        {activeRide && (
          <div className="absolute top-4 left-4 right-4 bg-emerald-600/90 backdrop-blur text-white p-4 rounded-xl shadow-lg flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
             <Navigation className="w-8 h-8" />
             <div>
               <div className="text-xs text-emerald-100 uppercase font-bold tracking-wider">Next Turn</div>
               <div className="font-bold text-lg">Turn Right in 200m</div>
             </div>
          </div>
        )}
      </div>

      {/* --- BOTTOM HALF: CONTENT --- */}
      <div className="flex-1 bg-white rounded-t-3xl -mt-6 z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] overflow-y-auto relative">
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto my-3" />
        
        <div className="p-5 pb-8 space-y-6">
          
          {/* 1. OFFLINE STATE */}
          {!isOnline && (
            <div className="text-center py-8">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Power className="w-10 h-10 text-slate-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">You are Offline</h2>
              <p className="text-slate-500 mb-8 max-w-xs mx-auto">Go online to start receiving ride requests and earning money.</p>
              <button 
                onClick={handleGoOnline}
                className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition active:scale-95"
              >
                GO ONLINE
              </button>
            </div>
          )}

          {/* 2. ONLINE / SEARCHING */}
          {isOnline && !incomingRequest && !activeRide && (
            <div className="text-center py-10">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <span className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-75"></span>
                <div className="relative w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center border-2 border-emerald-100">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Finding Rides...</h3>
              <p className="text-slate-500 mb-8">Stay in high demand areas for more requests.</p>
              <button 
                onClick={handleGoOffline}
                className="px-8 py-3 rounded-full border-2 border-red-100 text-red-500 font-bold hover:bg-red-50 transition"
              >
                Go Offline
              </button>
            </div>
          )}

          {/* 3. INCOMING REQUEST */}
          {incomingRequest && (
            <div className="animate-in slide-in-from-bottom duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">M-Pesa</div>
                  <span className="text-slate-400 text-sm font-medium">• 2 min away</span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-900">KES {incomingRequest.fare}</div>
                  <div className="text-xs text-slate-400 font-medium uppercase">Est. Fare</div>
                </div>
              </div>

              {/* Route */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6 relative overflow-hidden">
                <div className="absolute left-7 top-4 bottom-4 w-0.5 border-l-2 border-dashed border-slate-300"></div>
                <div className="relative z-10 space-y-6">
                  <div className="flex gap-4">
                    <div className="w-6 h-6 rounded-full border-4 border-emerald-500 bg-white shadow-sm flex-shrink-0 mt-0.5"></div>
                    <div>
                      <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-0.5">Pickup</div>
                      <div className="font-semibold text-slate-900 text-lg leading-tight">{incomingRequest.pickup}</div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-6 h-6 rounded-full bg-slate-900 shadow-sm flex-shrink-0 mt-0.5"></div>
                    <div>
                      <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-0.5">Dropoff</div>
                      <div className="font-semibold text-slate-900 text-lg leading-tight">{incomingRequest.dropoff}</div>
                    </div>
                  </div>
                </div>
                <div className="absolute top-4 right-4 text-right">
                  <div className="text-xl font-bold text-slate-700">{incomingRequest.distance}</div>
                  <div className="text-xs text-slate-400">Distance</div>
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-4 gap-4">
                <button 
                  onClick={() => setIncomingRequest(null)}
                  className="col-span-1 bg-slate-100 text-slate-600 rounded-xl flex flex-col items-center justify-center py-3 hover:bg-slate-200 transition"
                >
                  <X className="w-6 h-6" />
                </button>
                <button 
                  onClick={acceptRide}
                  className="col-span-3 bg-emerald-600 text-white rounded-xl flex items-center justify-center gap-3 py-4 shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition active:scale-95"
                >
                  <Bell className="w-6 h-6 fill-white/20" />
                  <span className="font-bold text-lg">Accept Ride</span>
                </button>
              </div>
            </div>
          )}

          {/* 4. ACTIVE RIDE */}
          {activeRide && (
            <div className="animate-in fade-in">
              {/* Passenger Info Card */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xl font-bold">
                  {activeRide.passengerName.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-slate-900 text-lg">{activeRide.passengerName}</div>
                  <div className="flex items-center gap-1 text-slate-500 text-sm">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /> {activeRide.rating} Rating
                  </div>
                </div>
                <button className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center hover:bg-emerald-200 transition">
                  <Phone className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                 <div className="flex justify-between items-center px-2">
                   <div>
                      <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Destination</div>
                      <div className="text-xl font-bold text-slate-900">{activeRide.dropoff}</div>
                   </div>
                   <div className="text-right">
                      <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Fare</div>
                      <div className="text-xl font-bold text-emerald-600">KES {activeRide.fare}</div>
                   </div>
                 </div>

                 <button 
                   onClick={completeRide}
                   className="w-full bg-emerald-600 text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition active:scale-95 mt-4"
                 >
                   Complete Trip
                 </button>
              </div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}
