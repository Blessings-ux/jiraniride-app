import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { Button } from '../../components/ui/Button';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
      totalRides: 0,
      activeDrivers: 0,
      totalRevenue: 0
  });
  const [recentRides, setRecentRides] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
        // Mock data usually, but we can try fetching if DB exists
        // Since we are mocking most DB triggers, let's fetch what we can or mock reasonable numbers
        const { count: ridesCount } = await supabase.from('rides').select('*', { count: 'exact', head: true });
        const { count: driversCount } = await supabase.from('drivers').select('*', { count: 'exact', head: true }).eq('is_online', true);

        // Calculate revenue mock for now
        setStats({
            totalRides: ridesCount || 1240,
            activeDrivers: driversCount || 12,
            totalRevenue: (ridesCount || 1240) * 500 // Avg fare 500
        });

        // Fetch recent rides
        const { data: rides } = await supabase
            .from('rides')
            .select('id, pickup_location, status, fare, created_at')
            .order('created_at', { ascending: false })
            .limit(5);

        if (rides) setRecentRides(rides);
        else {
            // Mock if empty
            setRecentRides([
                { id: '1', status: 'completed', fare: 500, created_at: new Date().toISOString() },
                { id: '2', status: 'ongoing', fare: 450, created_at: new Date().toISOString() },
                { id: '3', status: 'cancelled', fare: 0, created_at: new Date().toISOString() }
            ]);
        }

    } catch (err) {
        console.error("Admin stats error", err);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
          <Button onClick={fetchStats} variant="outline" size="sm">Refresh</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Stat Cards */}
        <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
            <div className="mt-2 flex items-baseline">
                <span className="text-3xl font-semibold">KES {stats.totalRevenue.toLocaleString()}</span>
            </div>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500">Total Rides</h3>
            <div className="mt-2 flex items-baseline">
                <span className="text-3xl font-semibold">{stats.totalRides.toLocaleString()}</span>
            </div>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500">Active Drivers</h3>
            <div className="mt-2 flex items-baseline">
                <span className="text-3xl font-semibold text-green-600">{stats.activeDrivers}</span>
                <span className="ml-2 text-sm text-gray-500">online now</span>
            </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b bg-gray-50/50">
              <h3 className="font-semibold text-gray-900">Recent Rides</h3>
          </div>
          <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-500 uppercase">
                      <tr>
                          <th className="px-6 py-3">Ride ID</th>
                          <th className="px-6 py-3">Status</th>
                          <th className="px-6 py-3">Amount</th>
                          <th className="px-6 py-3">Date</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                      {recentRides.map(ride => (
                          <tr key={ride.id} className="hover:bg-gray-50/50">
                              <td className="px-6 py-4 font-mono text-xs">{ride.id.slice(0,8)}...</td>
                              <td className="px-6 py-4">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium 
                                      ${ride.status === 'completed' ? 'bg-green-100 text-green-700' : 
                                        ride.status === 'ongoing' ? 'bg-blue-100 text-blue-700' :
                                        ride.status === 'cancelled' ? 'bg-red-100 text-red-700' : 
                                        'bg-gray-100 text-gray-700'}`}>
                                      {ride.status}
                                  </span>
                              </td>
                              <td className="px-6 py-4">KES {ride.fare}</td>
                              <td className="px-6 py-4">{new Date(ride.created_at).toLocaleDateString()}</td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      </div>
    </div>
  );
}
