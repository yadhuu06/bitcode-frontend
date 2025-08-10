import React from 'react';
import { useNavigate } from 'react-router-dom';
import MatrixBackground from '../../components/ui/MatrixBackground';
import RoomFilter from '../../components/rooms/RoomFilter';
import RoomList from '../../components/rooms/RoomList';
import CreateRoomModal from '../../components/modals/CreateRoomModal';
import 'react-toastify/dist/ReactToastify.css';
import CustomButton from '../../components/ui/CustomButton';
import { useRooms } from '../../hooks/useRooms';


const Rooms = () => {
  const navigate = useNavigate();
  const {
    rooms,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    showModal,
    setShowModal,
    activeFilter,
    setActiveFilter,
    passwordRoomId,
    passwords,
    handleJoinRoom,
    handlePasswordSubmit,
    handlePasswordChange,
    handleCancel,
    filteredRooms,
    handleRoomCreated,
  } = useRooms();

  return (
    <div className="min-h-screen bg-black text-white font-mono pt-16 overflow-y-auto relative">
      <MatrixBackground particleCount={40} color="#00FF40" fontSizeRange={[8, 20]} changeInterval={6000} baseOpacity={0.3} transitionDuration={2000} />
      <div className="max-w-6xl mx-auto px-4 py-8 relative z-10">
        <div className="flex justify-between items-center mb-8 border-b border-green-500/30 pb-4">
          <h1 className="text-4xl md:text-5xl text-white font-orbitron tracking-widest font-bold flex items-center justify-center space-x-2">
            <span className="text-green-500">{'<'}</span>
            <span>Battle</span>
            <span className="text-green-500">{'/>'}</span>
          </h1>
          <CustomButton variant="create" onClick={() => setShowModal(true)}>
            Create Room
          </CustomButton>
        </div>
        <RoomFilter searchTerm={searchTerm} onSearchChange={setSearchTerm} activeFilter={activeFilter} onFilterChange={setActiveFilter} />
        <RoomList
          rooms={rooms}
          loading={loading}
          error={error}
          filteredRooms={filteredRooms}
          onJoin={handleJoinRoom}
          passwordRoomId={passwordRoomId}
          passwords={passwords}
          handlePasswordSubmit={handlePasswordSubmit}
          handlePasswordChange={handlePasswordChange}
          handleCancel={handleCancel}
        />
      </div>
      {showModal && (
        <CreateRoomModal
          onClose={() => setShowModal(false)}
          onRoomCreated={handleRoomCreated}
        />
      )}
    </div>
  );
};

export default Rooms;