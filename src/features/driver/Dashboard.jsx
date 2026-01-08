import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useDriverLocation } from '../../hooks/useDriverLocation';
import { Button } from '../../components/ui/Button';
import Map from '../../components/ui/Map';
import JobFeed from './JobFeed';

export default function DriverDashboard() {
  const { user } = useAuthStore();
  const [isOnline, setIsOnline] = useState(false);
  
  // Use the hook to track location when online
  const { location, error } = useDriverLocation(user?.id, isOnline);

  const toggleOnline = () => setIsOnline(!isOnline);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      <div className="p-4 bg-white shadow-sm z-10 flex justify-between items-center">
        <div>
           <h2 className="text-xl font-bold">Driver Portal</h2>
           <p className="text-sm text-gray-500">Status: <span className={isOnline ? "text-green-600 font-bold" : "text-gray-500"}>{isOnline ? 'ONLINE' : 'OFFLINE'}</span></p>
        </div>
        <Button 
          variant={isOnline ? "secondary" : "primary"}
          onClick={toggleOnline}
        >
          {isOnline ? 'Go Offline' : 'Go Online'}
        </Button>
      </div>

      <div className="flex-1 relative">
         {/* Map View */}
         <Map 
            className="h-full w-full" 
            center={location ? [location.lat, location.lng] : [-1.286389, 36.817223]}
            zoom={15}
            markers={location ? [{ position: [location.lat, location.lng], popup: "You are here" }] : []}
         />
         
         {/* Overlay for error or status */}
         {error && (
            <div className="absolute top-4 left-4 right-4 bg-red-100 p-2 rounded text-red-800 text-sm z-[1000]">
                {error}
            </div>
         )}
         
         {/* Job Feed Overlay - Only when Online */}
         {isOnline && <JobFeed />}
      </div>
    </div>
  );
}
