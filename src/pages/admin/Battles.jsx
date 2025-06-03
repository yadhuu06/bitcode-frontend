import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { setLoading, resetLoading } from '../../store/slices/loadingSlice';
import api from '../../api';
import {
  Swords,
  Users,
  Lock,
  Clock,
  Layers,
  AlertTriangle,
  X,
  Hash,
  User,
  Crown,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const Battles = () => {
  const dispatch = useDispatch();
  const { accessToken } = useSelector((state) => state.auth);
  const [battles, setBattles] = useState([]);
  const [selectedBattle, setSelectedBattle] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortStatus, setSortStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const fetchBattles = useCallback(async () => {
    if (!accessToken) {
      toast.error('Please log in to view battles');
      setError('Authentication required');
      return;
    }

    dispatch(setLoading({ isLoading: true, message: 'Loading battles...', style: 'terminal', progress: 50 }));
    try {
      const response = await api.get('/admin-panel/battles/');
      setBattles(response.data.battles || []);
      setError(null);
    } catch (err) {
      const errorMessage = err.response
        ? `Server error: ${err.response.status} - ${err.response.data?.detail || err.message}`
        : `Network error: ${err.message}`;
      console.error('Error fetching battles:', errorMessage);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      dispatch(resetLoading());
    }
  }, [accessToken, dispatch]);

  useEffect(() => {
    fetchBattles();
  }, [fetchBattles]);

  const handleBattleClick = useCallback((battle) => {
    setSelectedBattle(battle);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedBattle(null);
  }, []);

  const handleBackgroundClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  }, [closeModal]);

  // Calculate room counts
  const roomCounts = useMemo(() => ({
    active: battles.filter(b => b.status === 'active').length,
    playing: battles.filter(b => b.status === 'in_progress').length,
  }), [battles]);

  // Filter and sort battles
  const filteredBattles = useMemo(() => {
    let result = battles;

    // Search filter
    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase().trim();
      result = result.filter(
        (battle) =>
          battle.name.toLowerCase().includes(lowerSearch) ||
          (battle.topic && battle.topic.toLowerCase().includes(lowerSearch))
      );
    }

    // Status filter
    if (sortStatus !== 'all') {
      result = result.filter((battle) => {
        if (sortStatus === 'active') return battle.status === 'active';
        if (sortStatus === 'started') return battle.status === 'in_progress';
        if (sortStatus === 'finished') return battle.status === 'finished';
        return true;
      });
    }

    return result;
  }, [battles, searchTerm, sortStatus]);

  // Paginate battles
  const paginatedBattles = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredBattles.slice(startIndex, startIndex + pageSize);
  }, [filteredBattles, currentPage]);

  const totalPages = Math.ceil(filteredBattles.length / pageSize);

  const battleList = useMemo(() => (
    paginatedBattles.map((battle) => (
      <div
        key={battle.room_id}
        onClick={() => handleBattleClick(battle)}
        className="bg-gray-900/80 p-6 rounded-lg border border-gray-800 hover:border-[#73E600] transition-all duration-300 cursor-pointer hover:shadow-[0_0_15px_rgba(115,230,0,0.3)] transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#73E600]"
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
            Host: <span className="text-white ml-1 truncate">{battle.owner__username}</span>
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
            <span
              className={`ml-1 capitalize ${
                battle.status === 'active' ? 'text-yellow-400' :
                battle.status === 'in_progress' ? 'text-green-400' :
                'text-red-400'
              }`}
            >
              {battle.status}
            </span>
          </p>
        </div>
        <div className="flex gap-2 mt-3">
          <span
            className={`px-2 py-1 rounded text-xs font-semibold ${
              battle.difficulty === 'easy' ? 'bg-green-900/50 text-green-400 border border-green-500/50' :
              battle.difficulty === 'medium' ? 'bg-yellow-500/50 text-yellow-400 border border-yellow-500/50' :
              'bg-red-600/50 text-red-400 border border-red-600/50'
            }`}
          >
            {battle.difficulty.toUpperCase()}
          </span>
          <span
            className={`px-2 py-1 rounded text-xs font-semibold ${
              battle.visibility === 'public' ? 'bg-blue-900/50 text-blue-400 border border-blue-500/50' :
              'bg-purple-900/50 text-purple-400 border border-purple-500/50'
            }`}
          >
            {battle.visibility.toUpperCase()}
          </span>
        </div>
      </div>
    ))
  ), [paginatedBattles, handleBattleClick]);

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2 border-b-1 border-[#73E600] pb-2">
          <Swords className="w-8 h-8" />
          Battle Rooms
        </h1>
        <div className="flex items-center gap-4 mt-4 text-sm text-gray-400">
          <span>Active Rooms: {roomCounts.active}</span>
          <span>Playing Rooms: {roomCounts.playing}</span>
        </div>
      </header>

      {error && (
        <div className="mb-6 p-4 bg-red-900/50 border border-red-700 text-red-400 rounded-lg flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      <div className="mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1">
          <label htmlFor="search-battles" className="block text-sm text-gray-400 mb-2">Search Battles</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              id="search-battles"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or topic..."
              className="w-full bg-black text-white text-sm rounded-lg border border-gray-700/50 focus:ring-2 focus:ring-[#73E600] focus:outline-none pl-10 py-2 font-mono transition-all duration-300"
              aria-label="Search battles"
            />
          </div>
        </div>
        <div>
          <label htmlFor="sort-status" className="block text-sm text-gray-400 mb-2">Sort by Status</label>
          <select
            id="sort-status"
            value={sortStatus}
            onChange={(e) => {
              setSortStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-black text-white text-sm rounded-lg border border-gray-700/50 focus:ring-2 focus:ring-[#73E600] focus:outline-none px-4 py-2 font-mono transition-all duration-300"
            aria-label="Sort battles by status"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="started">Started</option>
            <option value="finished">Finished</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedBattles.length > 0 ? (
          battleList
        ) : (
          <p className="col-span-full text-center text-gray-500 text-lg">
            No battles found.
          </p>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <div className="group relative">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 bg-black text-[#73E600] rounded-lg border border-gray-700/50 hover:bg-[#73E600] hover:text-black transition-all duration-300 disabled:opacity-50"
              aria-label="Previous page"
              title="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="absolute left-1/2 transform -translate-x-1/2 -top-8 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              Previous
            </span>
          </div>
          <span className="text-gray-400 text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <div className="group relative">
            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={currentPage === totalPages}
              className="p-2 bg-black text-[#73E600] rounded-lg border border-gray-700/50 hover:bg-[#73E600] hover:text-black transition-all duration-300 disabled:opacity-50"
              aria-label="Next page"
              title="Next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <span className="absolute left-1/2 transform -translate-x-1/2 -top-8 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              Next
            </span>
          </div>
        </div>
      )}

      {isModalOpen && selectedBattle && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={handleBackgroundClick}
          role="dialog"
          aria-labelledby="battle-modal-title"
          aria-modal="true"
        >
          <div className="relative bg-black p-6 md:p-8 rounded-xl border-[1.5px] border-[#73E600] w-full max-w-3xl transform transition-all duration-300 scale-100 hover:scale-[1.02]">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 text-sm text-gray-300">
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-gray-400">Room ID:</span>
                  <span className="text-white font-mono truncate">{selectedBattle.room_id}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-gray-400">Join Code:</span>
                  <span className="text-[#73E600] font-mono flex items-center gap-1 truncate">
                    <Hash className="w-4 h-4" />
                    {selectedBattle.join_code || 'N/A'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-gray-400">Status:</span>
                  <span
                    className={`capitalize ${
                      selectedBattle.status === 'active' ? 'text-yellow-400' :
                      selectedBattle.status === 'in_progress' ? 'text-green-400' :
                      'text-red-400'
                    }`}
                  >
                    {selectedBattle.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-gray-400">Difficulty:</span>
                  <span
                    className={`capitalize ${
                      selectedBattle.difficulty === 'easy' ? 'text-green-400' :
                      selectedBattle.difficulty === 'medium' ? 'text-yellow-400' :
                      'text-red-400'
                    }`}
                  >
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
                  <span
                    className={`flex items-center gap-1 ${
                      selectedBattle.visibility === 'private' ? 'text-purple-400' : 'text-blue-400'
                    }`}
                  >
                    {selectedBattle.visibility === 'private' && <Lock className="w-4 h-4" />}
                    {selectedBattle.visibility.toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-gray-400">Topic:</span>
                  <span className="text-white truncate">{selectedBattle.topic || 'N/A'}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-gray-400">Host:</span>
                  <span className="text-white truncate">{selectedBattle.owner__username}</span>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#73E600] mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Participants ({selectedBattle.participant_count || 0}/10)
                </h3>
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                  {selectedBattle.participants && selectedBattle.participants.length > 0 ? (
                    selectedBattle.participants.slice(0, 10).map((participant, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-800/50 p-3 rounded border border-gray-700"
                      >
                        <div className="flex items-center gap-2">
                          {participant.role === 'host' ? (
                            <Crown className="w-4 h-4 text-yellow-400" />
                          ) : (
                            <User className="w-4 h-4 text-gray-400" />
                          )}
                          <span className="text-white truncate">{participant.user__username || 'Unknown'}</span>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            participant.role === 'host' ? 'bg-yellow-900/50 text-yellow-400' :
                            'bg-gray-700 text-gray-400'
                          }`}
                        >
                          {participant.role.toUpperCase()}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No participants yet.</p>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={closeModal}
              className="mt-6 w-full py-3 bg-black text-[#73E600] rounded-lg border border-gray-700/50 hover:bg-[#73E600] hover:text-black transition-all duration-300 font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Battles;