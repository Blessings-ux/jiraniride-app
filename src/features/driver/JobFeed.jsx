import { useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useRideStore } from '../../store/rideStore';
import { rideService } from '../../services/rideService';
import { Button } from '../../components/ui/Button';

export default function JobFeed() {
  const { user } = useAuthStore();
  const { pendingRides, addPendingRide, acceptRide, currentRide } = useRideStore();

  useEffect(() => {
    // Subscribe to new pending rides
    const channel = rideService.subscribeToOpenRides((newRide) => {
        console.log("New ride received:", newRide);
        addPendingRide(newRide);
    });

    return () => {
        channel.unsubscribe();
    };
  }, [addPendingRide]);

  if (currentRide) {
      return (
          <div className="absolute top-20 right-4 bg-white p-4 rounded shadow-lg z-[1000] w-80">
              <h3 className="font-bold text-green-600 mb-2">Current Job</h3>
              <p className="text-sm">Passenger waiting at Pickup.</p>
              <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" className="w-full">Navigate</Button>
                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={() => {
                        if (confirm("End ride and collect payment?")) {
                             // Call store action to complete
                             // For this demo, we'll assume driver triggers completion
                             useRideStore.getState().completeRide(currentRide.id);
                        }
                    }}
                  >
                    Complete
                  </Button>
              </div>
          </div>
      );
  }

  return (
    <div className="absolute bottom-4 left-4 right-4 md:right-auto md:left-4 md:top-20 md:bottom-auto bg-white rounded-lg shadow-lg z-[1000] max-w-md w-full max-h-96 overflow-y-auto">
      <div className="p-4 border-b sticky top-0 bg-white">
          <h3 className="font-bold text-lg">New Requests ({pendingRides.length})</h3>
      </div>
      
      <div className="divide-y">
        {pendingRides.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
                No active requests nearby.
            </div>
        ) : (
            pendingRides.map(ride => (
                <div key={ride.id} className="p-4 hover:bg-gray-50">
                    <div className="flex justify-between mb-2">
                        <span className="font-medium">KES {ride.fare}</span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">2.5km away</span>
                    </div>
                    <div className="text-sm text-gray-600 mb-4">
                        <p>Pickup: Point A</p>
                        <p>Dropoff: Point B</p>
                    </div>
                    <Button 
                        className="w-full" 
                        onClick={() => acceptRide(ride.id, user.id)}
                    >
                        Accept Ride
                    </Button>
                </div>
            ))
        )}
      </div>
    </div>
  );
}
