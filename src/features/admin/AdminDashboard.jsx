import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Car, TrendingUp, CreditCard, 
  Map as MapIcon, Settings, Bell, Search, LogOut,
  CheckCircle, XCircle, Clock, Menu, X
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { useAuthStore } from '../../store/authStore';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { signOut } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  // Mock Data for the Chart (Revenue this week)
  const revenueData = [
    { name: 'Mon', ksh: 12000 },
    { name: 'Tue', ksh: 18500 },
    { name: 'Wed', ksh: 15000 },
    { name: 'Thu', ksh: 22000 },
    { name: 'Fri', ksh: 28500 },
    { name: 'Sat', ksh: 35000 },
    { name: 'Sun', ksh: 31000 },
  ];

  return (
    <div className="flex h-screen bg-white font-sans text-slate-900">
      
      {/* --- MOBILE HEADER --- */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b border-slate-200 px-4 flex items-center justify-between">
        <button onClick={() => setMobileMenuOpen(true)} className="p-2 hover:bg-slate-100 rounded-xl">
          <Menu className="w-6 h-6 text-slate-700" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center font-bold text-white text-sm">JR</div>
          <span className="font-bold text-lg text-slate-800">Admin</span>
        </div>
        <button className="relative p-2 hover:bg-slate-100 rounded-xl">
          <Bell className="w-6 h-6 text-slate-600" />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
      </div>

      {/* --- MOBILE SIDEBAR OVERLAY --- */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 bg-white shadow-2xl flex flex-col animate-in slide-in-from-left">
            <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center font-bold text-white">JR</div>
                <span className="font-bold text-lg text-slate-800">JiraniRide</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl">
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>
            <nav className="flex-1 py-4 px-3 space-y-1">
              <NavItem icon={LayoutDashboard} label="Dashboard" active isOpen={true} />
              <NavItem icon={MapIcon} label="Live Map" isOpen={true} />
              <NavItem icon={Car} label="Drivers" badge="12" isOpen={true} />
              <NavItem icon={Users} label="Passengers" isOpen={true} />
              <NavItem icon={CreditCard} label="Finance" isOpen={true} />
              <NavItem icon={Settings} label="System Config" isOpen={true} />
            </nav>
            <div className="p-4 border-t border-slate-100">
              <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition">
                <LogOut className="w-5 h-5" /> Log Out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* --- DESKTOP SIDEBAR --- */}
      <aside className={`hidden lg:flex ${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-50 border-r border-slate-200 transition-all duration-300 flex-col`}>
        <div className="h-16 flex items-center px-4 border-b border-slate-100">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center font-bold text-white mr-3">
            JR
          </div>
          {sidebarOpen && <span className="font-bold text-lg text-slate-800">JiraniRide</span>}
        </div>

        <nav className="flex-1 py-6 space-y-1 px-3">
          <NavItem icon={LayoutDashboard} label="Dashboard" active isOpen={sidebarOpen} />
          <NavItem icon={MapIcon} label="Live Map" isOpen={sidebarOpen} />
          <NavItem icon={Car} label="Drivers" badge="12" isOpen={sidebarOpen} />
          <NavItem icon={Users} label="Passengers" isOpen={sidebarOpen} />
          <NavItem icon={CreditCard} label="Finance" isOpen={sidebarOpen} />
          <NavItem icon={Settings} label="System Config" isOpen={sidebarOpen} />
        </nav>

        <div className="p-4 border-t border-slate-100">
           <div className="flex items-center gap-3 mb-4">
             <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">A</div>
             {sidebarOpen && (
               <div className="overflow-hidden">
                 <div className="text-sm font-bold text-slate-900 truncate">Admin User</div>
                 <div className="text-xs text-slate-500">Super Admin</div>
               </div>
             )}
           </div>
           {sidebarOpen && (
             <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition">
               <LogOut className="w-5 h-5" /> Log Out
             </button>
           )}
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 overflow-y-auto pt-16 lg:pt-0">
        
        {/* Desktop Header */}
        <header className="hidden lg:flex h-16 bg-white border-b border-slate-200 px-8 justify-between items-center sticky top-0 z-10">
          <h1 className="text-xl font-bold text-slate-800">System Overview</h1>
          
          <div className="flex items-center gap-6">
            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search rides, drivers..." 
                className="pl-10 pr-4 py-2 rounded-full bg-slate-100 border-none focus:ring-2 focus:ring-emerald-500 text-sm w-64"
              />
            </div>
            <button className="relative p-2 rounded-full hover:bg-slate-100">
              <Bell className="w-6 h-6 text-slate-600" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6 lg:space-y-8">
          
          {/* --- A. KEY METRICS --- */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <StatCard 
              title="Total Revenue" 
              value="KES 1.2M" 
              trend="+12%" 
              icon={TrendingUp} 
              color="bg-emerald-500"
            />
            <StatCard 
              title="Active Drivers" 
              value="142" 
              subtitle="18 Offline" 
              icon={Car} 
              color="bg-emerald-500"
            />
            <StatCard 
              title="Total Rides" 
              value="8,540" 
              trend="+5%" 
              icon={MapIcon} 
              color="bg-emerald-500"
            />
            <StatCard 
              title="SACCO Points" 
              value="450k" 
              subtitle="Liability: KES 45k" 
              icon={Users} 
              color="bg-emerald-500"
            />
          </div>

          {/* --- B. CHARTS & MAPS SECTION --- */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            
            {/* Revenue Chart */}
            <div className="lg:col-span-2 bg-white p-4 lg:p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-center mb-4 lg:mb-6">
                <h3 className="font-bold text-lg text-slate-800">Revenue Overview</h3>
                <select className="bg-slate-50 border-none text-sm font-medium text-slate-600 rounded-lg p-2">
                  <option>Last 7 Days</option>
                  <option>This Month</option>
                </select>
              </div>
              <div className="h-64 lg:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorKsh" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} />
                    <Tooltip 
                      contentStyle={{backgroundColor: '#fff', color: '#1E293B', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                      itemStyle={{color: '#10B981'}}
                    />
                    <Area type="monotone" dataKey="ksh" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorKsh)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quick Actions / System Health */}
            <div className="bg-white p-4 lg:p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="font-bold text-lg text-slate-800 mb-4 lg:mb-6">System Health</h3>
              
              <div className="space-y-4 lg:space-y-6">
                <HealthItem label="Server Status" status="Operational" color="text-emerald-600" />
                <HealthItem label="M-Pesa API" status="Operational" color="text-emerald-600" />
                <HealthItem label="Google Maps API" status="High Latency" color="text-yellow-600" />
                
                <div className="h-px bg-slate-100 my-4"></div>
                
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                  <div className="text-emerald-800 font-bold text-sm mb-1">Pending Driver Approvals</div>
                  <div className="text-emerald-600 text-xs mb-3">5 new drivers waiting for verification.</div>
                  <button className="w-full bg-emerald-600 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-700 transition">
                    Review Applications
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* --- C. RECENT RIDES TABLE --- */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 lg:p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800">Recent Rides</h3>
              <button className="text-emerald-600 font-bold text-sm hover:underline">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs lg:text-sm uppercase">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 font-semibold">Ride ID</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 font-semibold">Passenger</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 font-semibold hidden md:table-cell">Driver</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 font-semibold hidden lg:table-cell">Route</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 font-semibold">Fare</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  <RideRow 
                    id="#JR-8821" user="Alice K." driver="John M. (Boda)" 
                    route="Juja -> Gate C" fare="50" status="completed" 
                  />
                  <RideRow 
                    id="#JR-8822" user="Mark O." driver="Peter K. (Taxi)" 
                    route="Nrb CBD -> Westlands" fare="450" status="ongoing" 
                  />
                  <RideRow 
                    id="#JR-8823" user="Sarah W." driver="-" 
                    route="Thika Rd -> Garden City" fare="-" status="cancelled" 
                  />
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function NavItem({ icon: Icon, label, active, badge, isOpen }) {
  return (
    <button className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${active ? 'bg-emerald-100 text-emerald-700 font-bold' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
      <Icon className="w-5 h-5 flex-shrink-0" />
      {isOpen && <span className="flex-1 text-left whitespace-nowrap">{label}</span>}
      {isOpen && badge && (
        <span className="bg-emerald-600 text-white text-xs px-2 py-0.5 rounded-full">{badge}</span>
      )}
    </button>
  );
}

function StatCard({ title, value, subtitle, trend, icon: Icon, color }) {
  return (
    <div className="bg-white p-4 lg:p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition">
      <div className="flex justify-between items-start mb-3 lg:mb-4">
        <div className={`p-2 lg:p-3 rounded-xl ${color} bg-opacity-10`}>
          <Icon className={`w-5 h-5 lg:w-6 lg:h-6 ${color.replace('bg-', 'text-')}`} />
        </div>
        {trend && (
          <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <div className="text-slate-500 text-xs lg:text-sm font-medium mb-1">{title}</div>
      <div className="text-xl lg:text-2xl font-bold text-slate-800">{value}</div>
      {subtitle && <div className="text-xs text-slate-400 mt-1">{subtitle}</div>}
    </div>
  );
}

function HealthItem({ label, status, color }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-slate-600 font-medium text-sm">{label}</span>
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${status === 'Operational' ? 'bg-emerald-500' : 'bg-yellow-500'}`}></div>
        <span className={`text-sm font-bold ${color}`}>{status}</span>
      </div>
    </div>
  );
}

function RideRow({ id, user, driver, route, fare, status }) {
  const statusColors = {
    completed: 'bg-emerald-100 text-emerald-700',
    ongoing: 'bg-blue-100 text-blue-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  const statusIcons = {
    completed: CheckCircle,
    ongoing: Clock,
    cancelled: XCircle,
  };

  const StatusIcon = statusIcons[status];

  return (
    <tr className="hover:bg-slate-50 transition">
      <td className="px-4 lg:px-6 py-3 lg:py-4 font-medium text-slate-900">{id}</td>
      <td className="px-4 lg:px-6 py-3 lg:py-4 text-slate-600">{user}</td>
      <td className="px-4 lg:px-6 py-3 lg:py-4 text-slate-600 hidden md:table-cell">{driver}</td>
      <td className="px-4 lg:px-6 py-3 lg:py-4 text-slate-600 hidden lg:table-cell">{route}</td>
      <td className="px-4 lg:px-6 py-3 lg:py-4 font-bold text-slate-900">
        {fare !== '-' ? `KES ${fare}` : '-'}
      </td>
      <td className="px-4 lg:px-6 py-3 lg:py-4">
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold capitalize ${statusColors[status]}`}>
          <StatusIcon className="w-3 h-3" />
          {status}
        </span>
      </td>
    </tr>
  );
}
