import { useState } from 'react';
import Map from '../../components/ui/Map';
import { Button } from '../../components/ui/Button'; // Keep for search bar layout if needed
import RideRequestForm from './RideRequestForm';

export default function PassengerDashboard() {
  const [pickup, setPickup] = useState(null);
  const [dropoff, setDropoff] = useState(null);
  const [mode, setMode] = useState('pickup'); // 'pickup' or 'dropoff' selection mode

  // Handler for map clicks - mocked by passing a setter to map? 
  // Map component needs an onClick handler. Let's assume Map accepts onLocationSelect or we click markers.
  // For MVP, since Map is read-only tiles efficiently, we'll simulate setting points with buttons for now
  // OR ideally, update Map.jsx to handle click events if react-leaflet supports it (useMapEvents).
  
  // Temporary Simulator for selecting points
  const simulateSelection = () => {
      // Nairobi coords
      if (!pickup) setPickup({ lat: -1.286389, lng: 36.817223 });
      else if (!dropoff) setDropoff({ lat: -1.2921, lng: 36.8219 });
  };

  const markers = [];
  if (pickup) markers.push({ position: [pickup.lat, pickup.lng], popup: "Pickup" });
  if (dropoff) markers.push({ position: [dropoff.lat, dropoff.lng], popup: "Dropoff" });

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] relative">
      {/* Search Bar / Top UI */}
      <div className="absolute top-4 left-4 right-4 z-[1000] bg-white p-4 rounded-lg shadow-lg max-w-md mx-auto flex gap-2">
         <Button onClick={simulateSelection} variant="outline" className="flex-1">
             {pickup && dropoff ? 'Points Set' : (pickup ? 'Tap for Dropoff (Sim)' : 'Tap for Pickup (Sim)')}
         </Button>
      </div>

      <Map 
        className="h-full w-full"
        center={[-1.2921, 36.8219]}
        markers={markers}
      />

      <RideRequestForm pickupCoords={pickup} dropoffCoords={dropoff} />
    </div>
  );
}
