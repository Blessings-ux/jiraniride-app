// src/features/passenger/PassengerHome.jsx
import { useState, useEffect } from 'react';
import { MapPin, Menu, History, Star, CreditCard, User, LogOut, Navigation, Bike, Car, Zap, X, Loader2, Phone, ArrowLeft, Gift, CheckCircle, Save, Users } from 'lucide-react';
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
    <div className="h-[100dvh] w-full bg-slate-100 font-sans text-slate-900 flex flex-col lg:flex-row overflow-hidden">
      
      {/* === LEFT SIDE: MAP (Desktop) / FULL SCREEN (Mobile) === */}
      <div className="relative flex-1 lg:h-full order-1">
        <Map 
          center={pickupLocation ? [pickupLocation.lat, pickupLocation.lng] : defaultCenter}
          zoom={15}
          className="h-full w-full"
          markers={pickupLocation ? [{ position: [pickupLocation.lat, pickupLocation.lng], popup: "You are here" }] : []}
        />

        {/* Mobile-only: Top Header */}
        <div className="lg:hidden absolute top-0 left-0 right-0 z-20 p-3 flex justify-between items-start">
          <button onClick={() => setMenuOpen(true)} className="bg-white p-2.5 rounded-full shadow-lg hover:bg-slate-50 transition active:scale-95">
            <Menu className="w-5 h-5 text-slate-700" />
          </button>
          <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 border border-yellow-100">
            <Star className="w-3 h-3 text-yellow-600 fill-yellow-600" />
            <span className="font-bold text-xs text-slate-800">{userPoints} Pts</span>
          </div>
        </div>

        {/* Mobile-only: Bottom Sheet */}
        <div className="lg:hidden absolute bottom-0 left-0 right-0 z-30">
          <MobileBottomSheet 
            bookingStep={bookingStep} setBookingStep={setBookingStep}
            destination={destination} setDestination={setDestination}
            selectedVehicle={selectedVehicle} setSelectedVehicle={setSelectedVehicle}
            userName={userName} getGreeting={getGreeting} getFare={getFare}
            handleRequestRide={handleRequestRide} handleCancelRide={handleCancelRide}
            isRequestingRide={isRequestingRide}
          />
        </div>
      </div>

      {/* === RIGHT SIDE: SIDEBAR (Desktop Only) === */}
      <div className="hidden lg:flex lg:flex-col lg:w-[420px] xl:w-[480px] h-full bg-white border-l border-slate-200 order-2">
        
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

      {/* === MOBILE SIDEBAR DRAWER === */}
      {menuOpen && <div className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />}
      
      <div className={`lg:hidden fixed top-0 left-0 h-full w-[80%] max-w-[280px] bg-white z-50 shadow-2xl transform transition-transform duration-300 ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
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
        <div className="lg:hidden fixed inset-0 z-50 bg-white overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-slate-100 p-4 flex items-center gap-4">
            <button onClick={() => setActivePanel(null)} className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition"><ArrowLeft className="w-5 h-5 text-slate-700" /></button>
            <h2 className="text-lg font-bold text-slate-900">{activePanel === 'rides' ? 'Your Rides' : activePanel === 'payment' ? 'Payment Methods' : activePanel === 'loyalty' ? 'Loyalty Rewards' : 'Profile Settings'}</h2>
          </div>
          <div className="p-4">
            <PanelContent activePanel={activePanel} isLoadingHistory={isLoadingHistory} rideHistory={rideHistory}
              userPhone={userPhone} userPoints={userPoints} userInitials={userInitials}
              user={user} profileForm={profileForm} setProfileForm={setProfileForm}
              handleSaveProfile={handleSaveProfile} isSavingProfile={isSavingProfile}
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
        <h3 className="text-xl font-bold mb-4 text-slate-800">{getGreeting()}, {userName}!</h3>
        <div onClick={() => setBookingStep('selecting')} className="bg-slate-100 p-4 rounded-xl flex items-center gap-4 mb-6 cursor-pointer hover:bg-slate-200 transition">
          <div className="w-10 h-10 bg-slate-300 rounded-full flex items-center justify-center"><Navigation className="w-5 h-5 text-slate-600" /></div>
          <div className="text-lg font-semibold text-slate-900">Where to?</div>
        </div>
        <h4 className="text-sm font-medium text-slate-500 mb-3">Recent Places</h4>
        <div className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl cursor-pointer transition">
          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center"><History className="w-5 h-5 text-slate-500" /></div>
          <div><div className="font-semibold text-slate-900">Jkuat Main Gate</div><div className="text-xs text-slate-500">Juja, Kiambu</div></div>
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
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full text-sm font-medium mb-3"><div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />Driver on the way</div>
          <h3 className="text-xl font-bold text-slate-800">Your ride is arriving!</h3>
        </div>
        <div className="bg-slate-50 p-4 rounded-xl mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">JK</div>
            <div className="flex-1"><h4 className="font-bold text-slate-900 text-lg">John Kamau</h4><p className="text-sm text-slate-500">Honda CB 125 • KDB 123X</p><div className="flex items-center gap-1 mt-1"><Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /><span className="text-sm font-medium">4.8</span></div></div>
            <button className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center text-white hover:bg-emerald-700 transition"><Phone className="w-5 h-5" /></button>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm mb-4"><span className="text-slate-500">Estimated fare</span><span className="font-bold text-slate-900">KES {getFare(selectedVehicle)}</span></div>
        <button onClick={handleCancelRide} className="w-full py-3 border-2 border-red-200 text-red-600 rounded-xl font-medium hover:bg-red-50 transition">Cancel Ride</button>
      </div>
    );
  }
  return null;
}

function MobileBottomSheet(props) {
  return (
    <div className="bg-white rounded-t-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] max-h-[70vh] overflow-y-auto">
      <div className="p-4 pb-6">
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-4" />
        <BookingPanel {...props} />
      </div>
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

function PanelContent({ activePanel, isLoadingHistory, rideHistory, userPhone, userPoints, userInitials, user, profileForm, setProfileForm, handleSaveProfile, isSavingProfile }) {
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
    <div onClick={onClick} className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${selected ? 'border-emerald-600 bg-emerald-50/50 shadow-sm' : 'border-transparent bg-slate-50 hover:bg-slate-100'}`}>
      <div className="flex items-center gap-4">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center ${selected ? 'bg-white text-emerald-600' : 'bg-slate-200 text-slate-500'}`}><Icon className="w-7 h-7" /></div>
        <div><div className="font-bold text-slate-900">{name}</div><div className="text-xs text-slate-500">{time} away</div></div>
      </div>
      <div className="text-right">
        <div className="font-bold text-lg text-slate-900">KES {price}</div>
        {shared && selected && <div className="text-[10px] text-purple-600 font-bold">40% OFF</div>}
        {!shared && selected && <div className="text-[10px] text-emerald-600 font-bold">BEST VALUE</div>}
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
