import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { setLoading, resetLoading } from '../../store/slices/loadingSlice';
import { 
  Swords, 
  Users, 
  Lock, 
  Clock, 
  Layers, 
  AlertTriangle, 
  X, 
  Hash 
} from 'lucide-react';
import Sidebar from '../../components/admin/Sidebar';// Adjust the path based on your project structure

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Battles = () => {
  const dispatch = useDispatch();
  const { accessToken } = useSelector((state) => state.auth);
  const [battles, setBattles] = useState([]);
  const [selectedBattle, setSelectedBattle] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Handle sidebar collapse state
  const handleCollapseChange = useCallback((collapsed) => {
    setIsSidebarCollapsed(collapsed);
  }, []);

  // Fetch battles
  const fetchBattles = useCallback(async () => {
    if (!accessToken) {
      toast.error('Please log in to view battles');
      return;
    }

    dispatch(setLoading({ isLoading: true, message: 'Loading battles...', style: 'terminal', progress: 50 }));
    try {
      const response = await fetch(`${API_BASE_URL}/admin-panel/battles/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setBattles(data.battles || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching battles:', err);
      setError('Failed to load battles');
      toast.error('Failed to load battles');
    } finally {
      dispatch(resetLoading());
    }
  }, [accessToken, dispatch]);

  useEffect(() => {
    fetchBattles();
  }, [fetchBattles]);

  // Open modal with battle details
  const handleBattleClick = useCallback((battle) => {
    setSelectedBattle(battle);
    setIsModalOpen(true);
  }, []);

  // Close modal
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedBattle(null);
  }, []);

  // Memoized battle list
  const battleList = useMemo(() => {
    return battles.map((battle) => (
      <div
        key={battle.room_id}
        onClick={() => handleBattleClick(battle)}
        className="bg-gray-900/80 p-6 rounded-lg border border-gray-800 hover:border-[#73E600] transition-all duration-300 cursor-pointer hover:shadow-[0_0_15px_rgba(115,230,0,0.3)] transform hover:-translate-y-1"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleBattleClick(battle)}
        aria-label={`View details for ${battle.name}`}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-semibold text-white truncate">{battle.name}</h3>
          <Swords className="text-[#73E600] w-5 h-5" />
        </div>
        <div className="space-y-2 text-sm">
          <p className="flex items-center text-gray-400">
            <Users className="w-4 h-4 mr-2" />
            Host: <span className="text-white ml-1">{battle.owner__username}</span>
          </p>
          <p className="flex items-center text-gray-400">
            <Users className="w-4 h-4 mr-2" />
            {battle.participant_count}/{battle.capacity} Participants
          </p>
          <p className="flex items-center text-gray-400">
            <Clock className="w-4 h-4 mr-2" />
            {battle.time_limit} Minutes
          </p>
          <p className="flex items-center text-gray-400">
            <Layers className="w-4 h-4 mr-2" />
            Status: 
            <span className={`ml-1 capitalize ${
              battle.status === 'active' ? 'text-yellow-400' : 
              battle.status === 'in_progress' ? 'text-green-400' : 
              'text-red-400'
            }`}>
              {battle.status}
            </span>
          </p>
        </div>
        <div className="flex gap-2 mt-3">
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            battle.difficulty === 'easy' ? 'bg-green-900/50 text-green-400 border border-green-500/50' :
            battle.difficulty === 'medium' ? 'bg-yellow-900/50 text-yellow-400 border border-yellow-500/50' :
            'bg-red-900/50 text-red-400 border border-red-500/50'
          }`}>
            {battle.difficulty.toUpperCase()}
          </span>
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            battle.visibility === 'public' ? 'bg-blue-900/50 text-blue-400 border border-blue-500/50' :
            'bg-purple-900/50 text-purple-400 border border-purple-500/50'
          }`}>
            {battle.visibility.toUpperCase()}
          </span>
        </div>
      </div>
    ));
  }, [battles, handleBattleClick]);

  return (
    <div className="flex min-h-screen bg-black">
      {/* Sidebar */}
      <Sidebar onCollapseChange={handleCollapseChange} />

      {/* Main Content */}
      <main 
        className={`flex-1 p-8 text-white font-mono transition-all duration-300 ${
          isSidebarCollapsed ? 'ml-16' : 'ml-64'
        }`}
      >
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-[#73E600] flex items-center gap-2 border-b-2 border-[#73E600] pb-2">
            <Swords className="w-8 h-8" />
            Battle Rooms
          </h1>
        </header>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-700 text-red-400 rounded-lg flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        {/* Battles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {battles.length > 0 ? battleList : (
            <p className="col-span-full text-center text-gray-500 text-lg">
              No battles found.
            </p>
          )}
        </div>

        {/* Modal */}
        {isModalOpen && selectedBattle && (
          <div 
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            role="dialog"
            aria-labelledby="battle-modal-title"
            aria-modal="true"
          >
            <div className="bg-gray-900/95 p-8 rounded-lg border border-gray-800 max-w-2xl w-full max-h-[80vh] overflow-y-auto relative">
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-gray-400 hover:text-[#73E600] transition-colors"
                aria-label="Close modal"
              >
                <X className="w-6 h-6" />
              </button>
              <h2 id="battle-modal-title" className="text-2xl font-bold text-[#73E600] mb-6 flex items-center gap-2">
                <Swords className="w-6 h-6" />
                {selectedBattle.name}
              </h2>
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-gray-400">Room ID:</span>
                  <span className="text-white font-mono">{selectedBattle.room_id}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-gray-400">Join Code:</span>
                  <span className="text-[#73E600] font-mono flex items-center gap-1">
                    <Hash className="w-4 h-4" />
                    {selectedBattle.join_code}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-gray-400">Status:</span>
                  <span className={`capitalize ${
                    selectedBattle.status === 'active' ? 'text-yellow-400' :
                    selectedBattle.status === 'in_progress' ? 'text-green-400' :
                    'text-red-400'
                  }`}>
                    {selectedBattle.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-gray-400">Difficulty:</span>
                  <span className={`capitalize ${
                    selectedBattle.difficulty === 'easy' ? 'text-green-400' :
                    selectedBattle.difficulty === 'medium' ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {selectedBattle.difficulty}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-gray-400">Time Limit:</span>
                  <span className="text-white flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {selectedBattle.time_limit} minutes
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-gray-400">Capacity:</span>
                  <span className="text-white flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {selectedBattle.participant_count}/{selectedBattle.capacity}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-gray-400">Visibility:</span>
                  <span className={`flex items-center gap-1 ${
                    selectedBattle.visibility === 'private' ? 'text-purple-400' : 'text-blue-400'
                  }`}>
                    {selectedBattle.visibility === 'private' && <Lock className="w-4 h-4" />}
                    {selectedBattle.visibility.toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-gray-400">Topic:</span>
                  <span className="text-white">{selectedBattle.topic || 'N/A'}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-gray-400">Host:</span>
                  <span className="text-white">{selectedBattle.owner__username}</span>
                </div>
              </div>
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-[#73E600] mb-3">Participants</h3>
                {selectedBattle.participants && selectedBattle.participants.length > 0 ? (
                  <ul className="space-y-2">
                    {selectedBattle.participants.map((participant, index) => (
                      <li 
                        key={index} 
                        className="flex justify-between items-center bg-gray-800/50 p-3 rounded border border-gray-700"
                      >
                        <span className="text-white">{participant.user__username}</span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          participant.role === 'host' ? 'bg-green-900/50 text-green-400' : 
                          'bg-gray-700 text-gray-400'
                        }`}>
                          {participant.role.toUpperCase()}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No participants yet.</p>
                )}
              </div>
              <button
                onClick={closeModal}
                className="mt-6 w-full py-3 bg-gray-800 text-[#73E600] rounded hover:bg-gray-700 transition-all duration-300 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Battles;