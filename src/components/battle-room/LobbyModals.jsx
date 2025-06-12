import React from 'react';
import { XCircle } from 'lucide-react';
import BitCodeProgressLoading from '../ui/LoadingAnimation';

const LobbyModals = ({ isKicked, isRoomClosed, isLoading, countdown, navigate }) => {
  if (isKicked) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#00FF40] font-['Orbitron']">Kicked from Room</h2>
          <p className="text-gray-400 mt-2">You have been kicked from the room. Redirecting to rooms list...</p>
        </div>
      </div>
    );
  }

  if (isRoomClosed) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#00FF40] font-['Orbitron']">Room Closed</h2>
          <p className="text-gray-400 mt-2">The host has closed the room. Redirecting to rooms list...</p>
        </div>
      </div>
    );
  }

  if (countdown !== null) {
    return (
      <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50">
        <div className="text-center">
          <div className="text-8xl font-bold text-[#00FF40] font-['Orbitron'] tracking-wider animate-pulse">
            {countdown > 0 ? countdown : 'START!'}
          </div>
          <div className="text-xl text-gray-300 mt-4 font-mono">
            {countdown > 0 ? 'Preparing battle...' : 'Engage now!'}
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <BitCodeProgressLoading message="Initializing systems..." />;
  }

  return null;
};

export default LobbyModals;