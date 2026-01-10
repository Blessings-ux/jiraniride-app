// src/features/passenger/PassengerHome.jsx
import { useState, useEffect } from 'react';
import { MapPin, Menu, History, Star, CreditCard, User, LogOut, Navigation, Bike, Car, Zap, X, Loader2, Phone, ArrowLeft, Gift, CheckCircle, Save, Users, Settings, Bell, Moon, Globe, Shield, ChevronRight } from 'lucide-react';
import { supabase } from '../../services/supabase';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import Map from '../../components/ui/Map';

export default function PassengerHome() {
  const navigate = useNavigate();
  const { profile, user } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activePanel, setActivePanel] = useState(null);
  const [bookingStep, setBookingStep] = useState('idle');
  const [selectedVehicle, setSelectedVehicle] = useState('boda');
  const [pickupLocation, setPickupLocation] = useState(null);
  const [isRequestingRide, setIsRequestingRide] = useState(false);
  const [currentRide, setCurrentRide] = useState(null);
  const [destination, setDestination] = useState('');
  const [rideHistory, setRideHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [profileForm, setProfileForm] = useState({ full_name: profile?.full_name || '', phone: profile?.phone || '' });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
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

  const userName = profile?.full_name?.split(' ')[0] || 'there';
  const userPoints = profile?.loyalty_points || 0;
  const userInitials = profile?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  const userPhone = profile?.phone || '+254 7XX XXX XXX';
  const defaultCenter = [-1.2921, 36.8219];

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setPickupLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
        () => setPickupLocation({ lat: -1.2921, lng: 36.8219 })
      );
    }
  }, []);

  useEffect(() => {
    if (activePanel === 'rides' && user) fetchRideHistory();
  }, [activePanel, user]);

  const fetchRideHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const { data } = await supabase.from('rides').select('*').eq('passenger_id', user.id).order('created_at', { ascending: false }).limit(10);
      if (data) setRideHistory(data);
    } catch (err) { console.error('Error fetching rides:', err); }
    finally { setIsLoadingHistory(false); }
  };

  const handleLogout = async () => { await supabase.auth.signOut(); navigate('/login'); };
  const getGreeting = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'; };
  const getFare = (v) => ({ boda: 100, tuktuk: 200, taxi: 400 }[v] || 200);

  const handleRequestRide = async () => {
    if (!destination || !pickupLocation) return;
    setIsRequestingRide(true);
    setBookingStep('searching');
    try {
      const { data: ride, error } = await supabase.from('rides').insert({
        passenger_id: user.id,
        pickup_location: `POINT(${pickupLocation.lng} ${pickupLocation.lat})`,
        dropoff_location: `POINT(${pickupLocation.lng + 0.01} ${pickupLocation.lat + 0.01})`,
        fare: getFare(selectedVehicle),
        status: 'pending'
      }).select().single();
      if (error) throw error;
      setCurrentRide(ride);
      setTimeout(() => setBookingStep('matched'), 3000);
    } catch (error) { console.error('Error requesting ride:', error); setBookingStep('selecting'); }
    finally { setIsRequestingRide(false); }
  };

  const handleCancelRide = async () => {
    if (currentRide) await supabase.from('rides').update({ status: 'cancelled' }).eq('id', currentRide.id);
    setCurrentRide(null);
    setBookingStep('idle');
    setDestination('');
  };

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      const { error } = await supabase.from('profiles').update({ full_name: profileForm.full_name, phone: profileForm.phone }).eq('id', user.id);
      if (!error) { setActivePanel(null); window.location.reload(); }
    } catch (err) { console.error('Error saving profile:', err); }
    finally { setIsSavingProfile(false); }
  };

  const openPanel = (panel) => { setMenuOpen(false); setActivePanel(panel); if (panel === 'profile') setProfileForm({ full_name: profile?.full_name || '', phone: profile?.phone || '' }); };

  return (
    <div className="h-[100dvh] w-full bg-white font-sans text-slate-900 flex flex-col lg:flex-row overflow-hidden">
      
      {/* === MOBILE LAYOUT: Split Screen === */}
      <div className="lg:hidden flex flex-col h-full">
        
        {/* FIXED HEADER - Always visible on mobile */}
        <div 
          className="fixed top-0 left-0 right-0 z-50 px-5 py-4 lg:hidden bg-gradient-to-b from-white/90 via-white/70 to-transparent backdrop-blur-sm"
          style={{ paddingTop: 'max(20px, env(safe-area-inset-top))' }}
        >
          <div className="flex justify-between items-center">
            {/* User Greeting + Points */}
            <div onClick={() => openPanel('profile')} className="bg-white px-4 py-2.5 rounded-2xl shadow-lg flex items-center gap-3 border border-slate-200/50 cursor-pointer active:scale-95 transition">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-inner">
                {userInitials}
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-slate-500">Points</span>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-bold text-base text-slate-800">{userPoints}</span>
                </div>
              </div>
            </div>

            {/* Settings Button */}
            <button 
              onClick={() => openPanel('settings')}
              className="bg-white p-3 rounded-2xl shadow-lg hover:bg-slate-50 transition active:scale-95 border border-slate-200/50 text-slate-700"
            >
              <Settings className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        {/* TOP HALF: Map (with padding for fixed header) */}
        <div className="relative h-[40vh] flex-shrink-0 mt-20">
          <Map 
            center={pickupLocation ? [pickupLocation.lat, pickupLocation.lng] : defaultCenter}
            zoom={15}
            className="h-full w-full"
            markers={pickupLocation ? [{ position: [pickupLocation.lat, pickupLocation.lng], popup: "You are here" }] : []}
          />
        </div>
        
        {/* BOTTOM HALF: Booking Content */}
        <div className="flex-1 bg-white overflow-y-auto">
          <div className="p-5">
            <BookingPanel 
              bookingStep={bookingStep} setBookingStep={setBookingStep}
              destination={destination} setDestination={setDestination}
              selectedVehicle={selectedVehicle} setSelectedVehicle={setSelectedVehicle}
              userName={userName} getGreeting={getGreeting} getFare={getFare}
              handleRequestRide={handleRequestRide} handleCancelRide={handleCancelRide}
              isRequestingRide={isRequestingRide}
            />
          </div>
          {/* Safe area for iOS */}
          <div className="h-[env(safe-area-inset-bottom)]" />
        </div>
      </div>

      {/* === DESKTOP LAYOUT: Side by Side === */}
      <div className="hidden lg:flex lg:flex-row w-full h-full">
        
        {/* LEFT: Map */}
        <div className="flex-1 relative">
          <Map 
            center={pickupLocation ? [pickupLocation.lat, pickupLocation.lng] : defaultCenter}
            zoom={15}
            className="h-full w-full"
            markers={pickupLocation ? [{ position: [pickupLocation.lat, pickupLocation.lng], popup: "You are here" }] : []}
          />
        </div>
        
        {/* RIGHT: Sidebar */}
        <div className="w-[420px] xl:w-[480px] h-full bg-white border-l border-slate-200 flex flex-col">
          
          {/* Header with User Info */}
          <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-lg font-bold">
                  {userInitials}
                </div>
                <div>
                  <h2 className="font-bold text-lg">{profile?.full_name || 'Guest'}</h2>
                  <p className="text-emerald-100 text-sm">{userPhone}</p>
                </div>
              </div>
              <div className="bg-white/20 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="font-bold text-sm">{userPoints} Pts</span>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="flex gap-2">
              <QuickAction icon={History} label="Rides" onClick={() => openPanel('rides')} />
              <QuickAction icon={CreditCard} label="Pay" onClick={() => openPanel('payment')} />
              <QuickAction icon={Gift} label="Rewards" onClick={() => openPanel('loyalty')} />
              <QuickAction icon={User} label="Profile" onClick={() => openPanel('profile')} />
              <QuickAction icon={Settings} label="Settings" onClick={() => openPanel('settings')} />
            </div>
          </div>

          {/* Booking Panel */}
          <div className="flex-1 overflow-y-auto p-6">
            {activePanel ? (
              <DesktopPanel activePanel={activePanel} setActivePanel={setActivePanel}
                isLoadingHistory={isLoadingHistory} rideHistory={rideHistory}
                userPhone={userPhone} userPoints={userPoints} userInitials={userInitials}
                user={user} profileForm={profileForm} setProfileForm={setProfileForm}
                handleSaveProfile={handleSaveProfile} isSavingProfile={isSavingProfile}
                appSettings={appSettings} setAppSettings={setAppSettings}
              />
            ) : (
              <BookingPanel 
                bookingStep={bookingStep} setBookingStep={setBookingStep}
                destination={destination} setDestination={setDestination}
                selectedVehicle={selectedVehicle} setSelectedVehicle={setSelectedVehicle}
                userName={userName} getGreeting={getGreeting} getFare={getFare}
                handleRequestRide={handleRequestRide} handleCancelRide={handleCancelRide}
                isRequestingRide={isRequestingRide}
              />
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-100 bg-slate-50">
            <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 p-3 text-red-600 hover:bg-red-50 rounded-xl transition font-medium">
              <LogOut className="w-4 h-4" />
              Log Out
            </button>
          </div>
        </div>
      </div>

      {/* === MOBILE SIDEBAR DRAWER === */}
      {menuOpen && <div className="lg:hidden fixed inset-0 bg-black/50 z-[55] backdrop-blur-sm" onClick={() => setMenuOpen(false)} />}
      
      <div className={`lg:hidden fixed top-0 left-0 h-full w-[80%] max-w-[280px] bg-white z-[60] shadow-2xl transform transition-transform duration-300 ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 bg-emerald-600 text-white relative">
          <button onClick={() => setMenuOpen(false)} className="absolute top-3 right-3 p-1 text-white/80 hover:text-white"><X className="w-5 h-5" /></button>
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3 text-xl font-bold">{userInitials}</div>
          <h2 className="text-lg font-bold truncate">{profile?.full_name || 'Guest User'}</h2>
          <p className="text-emerald-100 text-xs">{userPhone}</p>
        </div>
        <nav className="p-3 space-y-1">
          <MenuItem icon={History} label="Your Rides" onClick={() => openPanel('rides')} />
          <MenuItem icon={CreditCard} label="Payment Methods" subtitle="M-Pesa Active" onClick={() => openPanel('payment')} />
          <MenuItem icon={Star} label="Loyalty Rewards" badge={userPoints > 100 ? "Redeem" : null} onClick={() => openPanel('loyalty')} />
          <MenuItem icon={User} label="Profile Settings" onClick={() => openPanel('profile')} />
          <div className="h-px bg-slate-100 my-3" />
          <button onClick={handleLogout} className="w-full flex items-center gap-3 p-2.5 rounded-xl text-red-600 hover:bg-red-50 transition">
            <LogOut className="w-4 h-4" /><span className="font-medium text-sm">Log Out</span>
          </button>
        </nav>
      </div>

      {/* === MOBILE PANEL OVERLAYS === */}
      {activePanel && (
        <div className="lg:hidden fixed inset-0 z-[2000] bg-white overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-slate-100 p-4 flex items-center gap-4">
            <button onClick={() => setActivePanel(null)} className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition"><ArrowLeft className="w-5 h-5 text-slate-700" /></button>
            <h2 className="text-lg font-bold text-slate-900">{activePanel === 'rides' ? 'Your Rides' : activePanel === 'payment' ? 'Payment Methods' : activePanel === 'loyalty' ? 'Loyalty Rewards' : 'Profile Settings'}</h2>
          </div>
          <div className="p-4">
            <PanelContent activePanel={activePanel} isLoadingHistory={isLoadingHistory} rideHistory={rideHistory}
              userPhone={userPhone} userPoints={userPoints} userInitials={userInitials}
              user={user} profileForm={profileForm} setProfileForm={setProfileForm}
              handleSaveProfile={handleSaveProfile} isSavingProfile={isSavingProfile}
              appSettings={appSettings} setAppSettings={setAppSettings}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// === COMPONENTS ===

function QuickAction({ icon: Icon, label, onClick }) {
  return (
    <button onClick={onClick} className="flex-1 flex flex-col items-center gap-1 p-2 bg-white/10 rounded-xl hover:bg-white/20 transition">
      <Icon className="w-5 h-5" />
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}

function BookingPanel({ bookingStep, setBookingStep, destination, setDestination, selectedVehicle, setSelectedVehicle, userName, getGreeting, getFare, handleRequestRide, handleCancelRide, isRequestingRide }) {
  if (bookingStep === 'idle') {
    return (
      <div>
        {/* Where to? Search Box */}
        <div 
          onClick={() => setBookingStep('selecting')} 
          className="bg-slate-100 p-4 rounded-xl flex items-center gap-4 mb-6 cursor-pointer hover:bg-slate-200 transition active:scale-[0.99]"
        >
          <div className="w-10 h-10 bg-slate-300 rounded-full flex items-center justify-center">
            <MapPin className="w-5 h-5 text-slate-600" />
          </div>
          <div className="flex-1">
            <div className="text-lg font-semibold text-slate-900">Where to?</div>
          </div>
          <div className="text-slate-400">
            <Navigation className="w-5 h-5" />
          </div>
        </div>
        
        {/* Quick Action Shortcuts - Uber Style */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <button className="bg-slate-50 p-4 rounded-2xl flex flex-col items-center gap-2 active:scale-95 transition">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <MapPin className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-slate-700">Home</span>
          </button>
          <button className="bg-slate-50 p-4 rounded-2xl flex flex-col items-center gap-2 active:scale-95 transition">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <MapPin className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-slate-700">Work</span>
          </button>
          <button className="bg-slate-50 p-4 rounded-2xl flex flex-col items-center gap-2 active:scale-95 transition">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Star className="w-6 h-6 text-emerald-600" />
            </div>
            <span className="text-sm font-medium text-slate-700">Saved</span>
          </button>
        </div>
        
        {/* Recent Rides */}
        <h4 className="text-sm font-bold text-slate-500 mb-3 uppercase tracking-wide">Recent</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl cursor-pointer transition active:scale-[0.99]">
            <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
              <History className="w-5 h-5 text-slate-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-slate-900 truncate">Jkuat Main Gate</div>
              <div className="text-sm text-slate-500">Juja, Kiambu</div>
            </div>
            <Navigation className="w-4 h-4 text-slate-400 flex-shrink-0" />
          </div>
        </div>
      </div>
    );
  }

  if (bookingStep === 'selecting') {
    return <SelectingStep {...{ destination, setDestination, selectedVehicle, setSelectedVehicle, handleRequestRide, isRequestingRide, setBookingStep }} />;
  }

  if (bookingStep === 'searching') {
    return (
      <div className="text-center py-8">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-100 flex items-center justify-center"><Loader2 className="w-10 h-10 text-emerald-600 animate-spin" /></div>
        <h3 className="text-xl font-bold mb-2 text-slate-800">Finding your ride...</h3>
        <p className="text-sm text-slate-500 mb-6">Looking for nearby {selectedVehicle}s</p>
        <button onClick={handleCancelRide} className="text-red-600 font-medium hover:text-red-700">Cancel Request</button>
      </div>
    );
  }

  if (bookingStep === 'matched') {
    return (
      <div>
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium mb-3">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            Driver on the way
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-800">Your ride is arriving!</h3>
        </div>
        <div className="bg-slate-50 p-5 rounded-2xl mb-6">
          <div className="flex items-center gap-4">
            <div className="w-18 h-18 bg-emerald-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">JK</div>
            <div className="flex-1">
              <h4 className="font-bold text-slate-900 text-lg">John Kamau</h4>
              <p className="text-sm text-slate-500">Honda CB 125 • KDB 123X</p>
              <div className="flex items-center gap-1 mt-1.5">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-medium">4.8</span>
                <span className="text-xs text-slate-400 ml-1">(256 trips)</span>
              </div>
            </div>
            <button className="w-14 h-14 bg-emerald-600 rounded-full flex items-center justify-center text-white hover:bg-emerald-700 transition active:scale-95 shadow-lg">
              <Phone className="w-6 h-6" />
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between text-base mb-5 px-1">
          <span className="text-slate-500">Estimated fare</span>
          <span className="font-bold text-slate-900 text-lg">KES {getFare(selectedVehicle)}</span>
        </div>
        <button onClick={handleCancelRide} className="w-full py-4 border-2 border-red-200 text-red-600 rounded-2xl font-bold hover:bg-red-50 transition active:scale-[0.98]">
          Cancel Ride
        </button>
      </div>
    );
  }
  return null;
}

function MobileBottomSheet(props) {
  return (
    <div className="bg-white rounded-t-3xl shadow-[0_-10px_50px_rgba(0,0,0,0.15)] max-h-[75vh] overflow-y-auto">
      {/* Enhanced grab handle */}
      <div className="sticky top-0 bg-white pt-3 pb-2 z-10">
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto" />
      </div>
      <div className="px-5 pb-8">
        <BookingPanel {...props} />
      </div>
      {/* Safe area for iOS home indicator */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </div>
  );
}

function SelectingStep({ destination, setDestination, selectedVehicle, setSelectedVehicle, handleRequestRide, isRequestingRide, setBookingStep }) {
  const [shareRide, setShareRide] = useState(false);
  const [shareCode, setShareCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [showJoinInput, setShowJoinInput] = useState(false);
  
  // Mock corporate data - in production, fetch from Supabase
  const isCorporate = false; // Will be true if user is linked to corporate account
  const companyName = "TechCorp Ltd";
  
  const baseFares = { boda: 100, tuktuk: 200, taxi: 400 };
  const getBaseFare = (v) => baseFares[v] || 200;
  const getSharedFare = (v) => Math.round(getBaseFare(v) * 0.6); // 40% off when sharing
  
  const generateShareCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setShareCode(code);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-800">Book a Ride</h3>
        <button onClick={() => setBookingStep('idle')} className="text-slate-400 hover:text-slate-700 text-sm">Cancel</button>
      </div>
      
      {/* Corporate Badge - Shows if user is linked to company */}
      {isCorporate && (
        <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl mb-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            {companyName.split(' ').map(w => w[0]).join('')}
          </div>
          <div className="flex-1">
            <div className="font-medium text-blue-900 text-sm">{companyName}</div>
            <div className="text-xs text-blue-600">Corporate Account • Ride Covered</div>
          </div>
          <CheckCircle className="w-5 h-5 text-blue-600" />
        </div>
      )}
      
      {/* Destination Input */}
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full" />
          <span className="text-sm text-slate-500">Current Location</span>
        </div>
        <input 
          type="text" 
          value={destination} 
          onChange={(e) => setDestination(e.target.value)} 
          placeholder="Enter destination..." 
          className="w-full p-4 bg-slate-100 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500" 
        />
      </div>
      
      {/* Share Ride Toggle */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 p-4 rounded-xl mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            <span className="font-medium text-slate-800">Share This Ride</span>
          </div>
          <button 
            onClick={() => { setShareRide(!shareRide); if (!shareRide && !shareCode) generateShareCode(); }}
            className={`w-12 h-6 rounded-full transition-colors ${shareRide ? 'bg-purple-600' : 'bg-slate-300'}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${shareRide ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
        </div>
        
        {shareRide && (
          <div className="mt-3 pt-3 border-t border-purple-200">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-purple-700">Save 40% by sharing!</span>
              <span className="font-bold text-purple-600">KES {getSharedFare(selectedVehicle)} each</span>
            </div>
            
            {/* Share Code */}
            <div className="bg-white p-3 rounded-lg mb-2">
              <div className="text-xs text-slate-500 mb-1">Your Share Code</div>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold tracking-wider text-purple-700">{shareCode}</span>
                <button 
                  onClick={() => navigator.clipboard?.writeText(shareCode)}
                  className="text-xs text-purple-600 font-medium px-3 py-1 bg-purple-50 rounded-full"
                >
                  Copy
                </button>
              </div>
            </div>
            
            {/* Join with Code */}
            {!showJoinInput ? (
              <button 
                onClick={() => setShowJoinInput(true)}
                className="text-xs text-purple-600 font-medium"
              >
                Or join someone else's ride →
              </button>
            ) : (
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="Enter code..."
                  maxLength={6}
                  className="flex-1 p-2 bg-white border border-purple-200 rounded-lg text-sm uppercase tracking-wider"
                />
                <button className="px-3 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium">
                  Join
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Vehicle Options */}
      <h4 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Choose a Ride</h4>
      <div className="space-y-3 mb-4">
        <VehicleOption 
          name="Boda Boda" 
          price={shareRide ? getSharedFare('boda') : getBaseFare('boda')} 
          time="2 min" 
          icon={Bike} 
          selected={selectedVehicle === 'boda'} 
          onClick={() => setSelectedVehicle('boda')}
          shared={shareRide}
        />
        <VehicleOption 
          name="TukTuk" 
          price={shareRide ? getSharedFare('tuktuk') : getBaseFare('tuktuk')} 
          time="5 min" 
          icon={Zap} 
          selected={selectedVehicle === 'tuktuk'} 
          onClick={() => setSelectedVehicle('tuktuk')}
          shared={shareRide}
        />
        <VehicleOption 
          name="Taxi" 
          price={shareRide ? getSharedFare('taxi') : getBaseFare('taxi')} 
          time="7 min" 
          icon={Car} 
          selected={selectedVehicle === 'taxi'} 
          onClick={() => setSelectedVehicle('taxi')}
          shared={shareRide}
        />
      </div>
      
      {/* Payment Row */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
          <div className="w-6 h-4 bg-green-600 rounded-sm" />
          {isCorporate ? 'Paid by Company' : 'M-Pesa'}
        </div>
        <div className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded">
          +{shareRide ? 20 : 15} Loyalty Pts
        </div>
      </div>
      
      {/* Confirm Button */}
      <button 
        onClick={handleRequestRide} 
        disabled={!destination || isRequestingRide} 
        className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition disabled:opacity-50"
      >
        {isRequestingRide ? 'Requesting...' : (
          shareRide 
            ? `Share ${selectedVehicle === 'boda' ? 'Boda' : selectedVehicle === 'tuktuk' ? 'TukTuk' : 'Taxi'} • KES ${getSharedFare(selectedVehicle)}`
            : `Confirm ${selectedVehicle === 'boda' ? 'Boda' : selectedVehicle === 'tuktuk' ? 'TukTuk' : 'Taxi'}`
        )}
      </button>
    </div>
  );
}

function DesktopPanel(props) {
  return (
    <div>
      <button onClick={() => props.setActivePanel(null)} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-4">
        <ArrowLeft className="w-4 h-4" /><span className="text-sm">Back to booking</span>
      </button>
      <PanelContent {...props} />
    </div>
  );
}

function PanelContent({ activePanel, isLoadingHistory, rideHistory, userPhone, userPoints, userInitials, user, profileForm, setProfileForm, handleSaveProfile, isSavingProfile, appSettings, setAppSettings }) {
  if (activePanel === 'rides') {
    return isLoadingHistory ? (
      <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 text-emerald-600 animate-spin" /></div>
    ) : rideHistory.length === 0 ? (
      <div className="text-center py-12 text-slate-500"><History className="w-12 h-12 mx-auto mb-3 text-slate-300" /><p>No rides yet</p></div>
    ) : (
      <div className="space-y-3">{rideHistory.map((ride) => (
        <div key={ride.id} className="bg-slate-50 p-4 rounded-xl">
          <div className="flex justify-between items-start mb-2">
            <span className={`text-xs font-medium px-2 py-0.5 rounded ${ride.status === 'completed' ? 'bg-green-100 text-green-700' : ride.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{ride.status}</span>
            <span className="font-bold">KES {ride.fare}</span>
          </div>
          <p className="text-xs text-slate-500">{new Date(ride.created_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      ))}</div>
    );
  }

  if (activePanel === 'payment') {
    return (
      <div className="space-y-4">
        <div className="bg-green-50 border-2 border-green-200 p-4 rounded-xl flex items-center gap-4">
          <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">M</div>
          <div className="flex-1"><h4 className="font-bold text-slate-900">M-Pesa</h4><p className="text-xs text-slate-500">{userPhone}</p></div>
          <CheckCircle className="w-6 h-6 text-green-600" />
        </div>
        <div className="bg-slate-50 p-4 rounded-xl flex items-center gap-4 opacity-50">
          <div className="w-12 h-12 bg-slate-200 rounded-xl flex items-center justify-center"><CreditCard className="w-6 h-6 text-slate-400" /></div>
          <div className="flex-1"><h4 className="font-medium text-slate-600">Card Payment</h4><p className="text-xs text-slate-400">Coming Soon</p></div>
        </div>
        <p className="text-xs text-slate-500 text-center mt-6">All payments are processed securely via Safaricom M-Pesa</p>
      </div>
    );
  }

  if (activePanel === 'loyalty') {
    return (
      <>
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4"><Star className="w-10 h-10 text-yellow-600 fill-yellow-600" /></div>
          <h3 className="text-3xl font-bold text-slate-900">{userPoints}</h3>
          <p className="text-slate-500">Loyalty Points</p>
        </div>
        <div className="bg-emerald-50 p-4 rounded-xl mb-6">
          <h4 className="font-bold text-emerald-800 mb-2">How to Earn Points</h4>
          <ul className="text-sm text-emerald-700 space-y-1"><li>• Complete a ride: +15 points</li><li>• Refer a friend: +50 points</li><li>• 5-star rating: +5 points</li></ul>
        </div>
        <h4 className="font-bold text-slate-800 mb-3">Redeem Rewards</h4>
        <div className="space-y-3">
          <RewardItem title="Free Boda Ride" points={100} available={userPoints >= 100} />
          <RewardItem title="50% Off TukTuk" points={75} available={userPoints >= 75} />
          <RewardItem title="KES 100 Credit" points={200} available={userPoints >= 200} />
        </div>
      </>
    );
  }

  if (activePanel === 'profile') {
    return (
      <div className="space-y-4">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 text-white text-2xl font-bold">{userInitials}</div>
          <p className="text-xs text-slate-500">{user?.email}</p>
        </div>
        <div><label className="text-sm font-medium text-slate-700 block mb-1">Full Name</label><input type="text" value={profileForm.full_name} onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })} className="w-full p-3 bg-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
        <div><label className="text-sm font-medium text-slate-700 block mb-1">Phone Number</label><input type="tel" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} className="w-full p-3 bg-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
        <button onClick={handleSaveProfile} disabled={isSavingProfile} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition disabled:opacity-50">
          {isSavingProfile ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}Save Changes
        </button>
      </div>
    );
  }

  if (activePanel === 'settings') {
    return (
      <div className="space-y-6">
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
          
          <button 
            onClick={() => window.open('#', '_blank')}
            className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-emerald-600 shadow-sm"><Shield className="w-5 h-5" /></div>
              <span className="font-medium text-slate-700">Privacy & Security</span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>
          
          <button 
            onClick={() => alert('Thank you for rating JiraniRide!')}
            className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition group mt-2"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-orange-600 shadow-sm"><Star className="w-5 h-5" /></div>
              <span className="font-medium text-slate-700">Rate the App</span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* App Info */}
        <div className="text-center pt-6 pb-2">
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-3 text-emerald-600 font-bold text-xl">JR</div>
          <h4 className="font-bold text-slate-900">JiraniRide</h4>
          <p className="text-xs text-slate-500">Version 2.0.1 (Build 452)</p>
        </div>
      </div>
    );
  }
  return null;
}

function MenuItem({ icon: Icon, label, subtitle, badge, onClick }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition group">
      <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 group-hover:bg-white group-hover:shadow-sm transition flex-shrink-0"><Icon className="w-4 h-4" /></div>
      <div className="flex-1 text-left min-w-0"><div className="font-semibold text-slate-800 text-sm truncate">{label}</div>{subtitle && <div className="text-xs text-slate-400 truncate">{subtitle}</div>}</div>
      {badge && <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full flex-shrink-0">{badge}</span>}
    </button>
  );
}

function VehicleOption({ name, price, time, icon: Icon, selected, onClick, shared }) {
  return (
    <div 
      onClick={onClick} 
      className={`flex items-center justify-between p-5 rounded-2xl border-2 cursor-pointer transition-all active:scale-[0.98] ${
        selected 
          ? 'border-emerald-600 bg-emerald-50/50 shadow-md shadow-emerald-100' 
          : 'border-transparent bg-slate-50 hover:bg-slate-100 active:bg-slate-200'
      }`}
    >
      <div className="flex items-center gap-4">
        <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shadow-sm ${
          selected ? 'bg-white text-emerald-600' : 'bg-slate-200 text-slate-500'
        }`}>
          <Icon className="w-7 h-7 sm:w-8 sm:h-8" />
        </div>
        <div>
          <div className="font-bold text-slate-900 text-base sm:text-lg">{name}</div>
          <div className="text-sm text-slate-500">{time} away</div>
        </div>
      </div>
      <div className="text-right">
        <div className="font-bold text-xl text-slate-900">KES {price}</div>
        {shared && selected && <div className="text-xs text-purple-600 font-bold mt-1">40% OFF</div>}
        {!shared && selected && <div className="text-xs text-emerald-600 font-bold mt-1">BEST VALUE</div>}
      </div>
    </div>
  );
}

function RewardItem({ title, points, available }) {
  return (
    <div className={`flex items-center justify-between p-4 rounded-xl ${available ? 'bg-emerald-50 border border-emerald-200' : 'bg-slate-50'}`}>
      <div className="flex items-center gap-3"><Gift className={`w-5 h-5 ${available ? 'text-emerald-600' : 'text-slate-400'}`} /><span className={`font-medium ${available ? 'text-slate-900' : 'text-slate-500'}`}>{title}</span></div>
      <div className="text-right"><span className={`text-sm font-bold ${available ? 'text-emerald-600' : 'text-slate-400'}`}>{points} pts</span>{available && <button className="block text-xs text-emerald-600 font-medium mt-0.5">Redeem →</button>}</div>
    </div>
  );
}
