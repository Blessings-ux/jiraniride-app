import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useRideStore } from '../../store/rideStore';
import { Button } from '../../components/ui/Button';

export default function RideRequestForm({ pickupCoords, dropoffCoords }) {
  const { user } = useAuthStore();
  const { requestRide, isLoading, currentRide } = useRideStore();
  
  const handleRequest = async () => {
    if (!pickupCoords || !dropoffCoords) {
        alert("Please set pickup and dropoff locations on the map.");
        return;
    }
    await requestRide(user.id, pickupCoords, dropoffCoords);
  };

  if (currentRide) {
      if (currentRide.status === 'completed') {
           return (
              <div className="absolute bottom-4 left-4 right-4 bg-white p-6 rounded-lg shadow-lg z-[1000] max-w-md mx-auto text-center">
                  <h3 className="font-bold text-lg text-green-600 mb-2">Ride Completed</h3>
                  <p>You have arrived at your destination.</p>
                  <p className="text-sm text-gray-500 mt-2">+10 Loyalty Points</p>
                  <Button className="mt-4 w-full" onClick={() => window.location.reload()}>Book Another</Button>
              </div>
           )
      }

      return (
          <div className="absolute bottom-4 left-4 right-4 bg-white p-6 rounded-lg shadow-lg z-[1000] max-w-md mx-auto animate-in slide-in-from-bottom">
              <h3 className="font-bold text-lg mb-2">
                 Ride {currentRide.status === 'accepted' ? 'Accepted' : currentRide.status}
              </h3>
              <p className="text-gray-600 mb-4">
                  {currentRide.status === 'pending' ? 'Searching for nearby drivers...' : 'Your driver is en route.'}
              </p>
              <div className="flex justify-between text-sm">
                  <span>Fare: KES {currentRide.fare}</span>
              </div>
          </div>
      )
  }

  return (
    <div className="absolute bottom-4 left-4 right-4 bg-white p-6 rounded-lg shadow-lg z-[1000] max-w-md mx-auto">
      <h3 className="font-bold text-lg mb-4">Request a Ride</h3>
      
      <div className="space-y-4">
        <div className="flex gap-2 items-center">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <div className="text-sm text-gray-600">
                {pickupCoords ? `Pickup: ${pickupCoords.lat.toFixed(4)}, ${pickupCoords.lng.toFixed(4)}` : 'Tap map to set Pickup'}
            </div>
        </div>
        <div className="flex gap-2 items-center">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <div className="text-sm text-gray-600">
                {dropoffCoords ? `Dropoff: ${dropoffCoords.lat.toFixed(4)}, ${dropoffCoords.lng.toFixed(4)}` : 'Tap map to set Dropoff'}
            </div>
        </div>

        <Button 
            className="w-full" 
            onClick={handleRequest}
            disabled={!pickupCoords || !dropoffCoords || isLoading}
            isLoading={isLoading}
        >
          Request Ride (Est. KES 500)
        </Button>
      </div>
    </div>
  );
}
