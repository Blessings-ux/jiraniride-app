import { useState } from 'react';
import { 
  LayoutDashboard, Users, Car, TrendingUp, CreditCard, 
  Map as MapIcon, Settings, Bell, Search, MoreVertical,
  CheckCircle, XCircle, Clock
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* --- 1. SIDEBAR NAVIGATION --- */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-900 text-white transition-all duration-300 flex flex-col`}>
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <div className="w-8 h-8 bg-brand-green rounded-lg flex items-center justify-center font-bold text-slate-900 mr-3">
            JR
          </div>
          {sidebarOpen && <span className="font-bold text-lg tracking-tight">JiraniRide</span>}
        </div>

        <nav className="flex-1 py-6 space-y-1 px-3">
          <NavItem icon={LayoutDashboard} label="Dashboard" active isOpen={sidebarOpen} />
          <NavItem icon={MapIcon} label="Live Map" isOpen={sidebarOpen} />
          <NavItem icon={Car} label="Drivers" badge="12" isOpen={sidebarOpen} />
          <NavItem icon={Users} label="Passengers" isOpen={sidebarOpen} />
          <NavItem icon={CreditCard} label="Finance" isOpen={sidebarOpen} />
          <NavItem icon={Settings} label="System Config" isOpen={sidebarOpen} />
        </nav>

        <div className="p-4 border-t border-slate-800">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold">A</div>
             {sidebarOpen && (
               <div className="overflow-hidden">
                 <div className="text-sm font-bold truncate">Admin User</div>
                 <div className="text-xs text-slate-400">Super Admin</div>
               </div>
             )}
           </div>
        </div>
      </aside>

      {/* --- 2. MAIN CONTENT AREA --- */}
      <main className="flex-1 overflow-y-auto">
        
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex justify-between items-center sticky top-0 z-10">
          <h1 className="text-xl font-bold text-slate-800">System Overview</h1>
          
          <div className="flex items-center gap-6">
            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search rides, drivers..." 
                className="pl-10 pr-4 py-2 rounded-full bg-slate-100 border-none focus:ring-2 focus:ring-brand-green text-sm w-64"
              />
            </div>
            <button className="relative p-2 rounded-full hover:bg-slate-100">
              <Bell className="w-6 h-6 text-slate-600" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto space-y-8">
          
          {/* --- A. KEY METRICS --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              title="Total Revenue" 
              value="KES 1.2M" 
              trend="+12%" 
              icon={TrendingUp} 
              color="bg-green-500"
            />
            <StatCard 
              title="Active Drivers" 
              value="142" 
              subtitle="18 Offline" 
              icon={Car} 
              color="bg-blue-500"
            />
            <StatCard 
              title="Total Rides" 
              value="8,540" 
              trend="+5%" 
              icon={MapIcon} 
              color="bg-indigo-500"
            />
            <StatCard 
              title="SACCO Points" 
              value="450k" 
              subtitle="Liability: KES 45k" 
              icon={Users} 
              color="bg-orange-500"
            />
          </div>

          {/* --- B. CHARTS & MAPS SECTION --- */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Revenue Chart */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-slate-800">Revenue Overview</h3>
                <select className="bg-slate-50 border-none text-sm font-medium text-slate-600 rounded-lg p-2">
                  <option>Last 7 Days</option>
                  <option>This Month</option>
                </select>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorKsh" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00C853" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#00C853" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B'}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B'}} />
                    <Tooltip 
                      contentStyle={{backgroundColor: '#1E293B', color: '#fff', borderRadius: '8px', border: 'none'}}
                      itemStyle={{color: '#fff'}}
                    />
                    <Area type="monotone" dataKey="ksh" stroke="#00C853" strokeWidth={3} fillOpacity={1} fill="url(#colorKsh)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quick Actions / System Health */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="font-bold text-lg text-slate-800 mb-6">System Health</h3>
              
              <div className="space-y-6">
                <HealthItem label="Server Status" status="Operational" color="text-green-500" />
                <HealthItem label="M-Pesa API" status="Operational" color="text-green-500" />
                <HealthItem label="Google Maps API" status="High Latency" color="text-yellow-500" />
                
                <div className="h-px bg-slate-100 my-4"></div>
                
                <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                  <div className="text-orange-800 font-bold text-sm mb-1">Pending Driver Approvals</div>
                  <div className="text-orange-600 text-xs mb-3">5 new drivers waiting for verification.</div>
                  <button className="w-full bg-orange-100 text-orange-700 py-2 rounded-lg text-sm font-bold hover:bg-orange-200 transition">
                    Review Applications
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* --- C. RECENT RIDES TABLE --- */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800">Recent Rides</h3>
              <button className="text-brand-green font-bold text-sm hover:underline">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-sm uppercase">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Ride ID</th>
                    <th className="px-6 py-4 font-semibold">Passenger</th>
                    <th className="px-6 py-4 font-semibold">Driver</th>
                    <th className="px-6 py-4 font-semibold">Route</th>
                    <th className="px-6 py-4 font-semibold">Fare</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
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
    <button className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${active ? 'bg-brand-green text-slate-900 font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
      <Icon className="w-5 h-5 flex-shrink-0" />
      {isOpen && <span className="flex-1 text-left whitespace-nowrap">{label}</span>}
      {isOpen && badge && (
        <span className="bg-slate-700 text-white text-xs px-2 py-0.5 rounded-full">{badge}</span>
      )}
    </button>
  );
}

function StatCard({ title, value, subtitle, trend, icon: Icon, color }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
          <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
        </div>
        {trend && (
          <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <div className="text-slate-500 text-sm font-medium mb-1">{title}</div>
      <div className="text-2xl font-bold text-slate-800">{value}</div>
      {subtitle && <div className="text-xs text-slate-400 mt-1">{subtitle}</div>}
    </div>
  );
}

function HealthItem({ label, status, color }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-slate-600 font-medium text-sm">{label}</span>
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${status === 'Operational' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
        <span className={`text-sm font-bold ${color}`}>{status}</span>
      </div>
    </div>
  );
}

function RideRow({ id, user, driver, route, fare, status }) {
  const statusColors = {
    completed: 'bg-green-100 text-green-700',
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
      <td className="px-6 py-4 font-medium text-slate-900">{id}</td>
      <td className="px-6 py-4 text-slate-600">{user}</td>
      <td className="px-6 py-4 text-slate-600">{driver}</td>
      <td className="px-6 py-4 text-slate-600">{route}</td>
      <td className="px-6 py-4 font-bold text-slate-900">
        {fare !== '-' ? `KES ${fare}` : '-'}
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold capitalize ${statusColors[status]}`}>
          <StatusIcon className="w-3.5 h-3.5" />
          {status}
        </span>
      </td>
    </tr>
  );
}
