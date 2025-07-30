import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Sidebar from '../../components/admin/Sidebar';
import { setLoading, resetLoading } from '../../store/slices/loadingSlice';
import api from '../../api';
import { Award, Trophy, Users, MessageSquare, Play, Settings } from 'lucide-react';

const AdminDashboard = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [activeMatches, setActiveMatches] = useState(0);
  const [activeQuestions, setActiveQuestions] = useState(0);
  const [activeRooms, setActiveRooms] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [topUsers, setTopUsers] = useState([]);
  const [showRankingFullScreen, setShowRankingFullScreen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, accessToken } = useSelector((state) => state.auth);
  const { isLoading: loadingLoading } = useSelector((state) => state.loading);

  useEffect(() => {
    if (!user || !accessToken) {
      toast.error('Please log in to access the admin dashboard');
      navigate('/login');
      return;
    }

    dispatch(setLoading({ isLoading: true, message: 'Loading dashboard...', style: 'terminal' }));
    api.get('/admin-panel/dashboard/', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((response) => {
        const data = response.data;
        setActiveMatches(data.active_matches || 0);
        setActiveQuestions(data.active_questions || 0);
        setActiveRooms(data.active_rooms || 0);
        setTotalUsers(data.total_users || 0);
        setTopUsers(data.top_users || []);
      })
      .catch((error) => toast.error(error.message || 'Failed to fetch dashboard data'))
      .finally(() => dispatch(resetLoading()));
  }, [user, accessToken, navigate, dispatch]);

  const handleCollapseChange = (collapsed) => {
    setIsSidebarCollapsed(collapsed);
  };

  const toggleRankingFullScreen = () => {
    setShowRankingFullScreen(!showRankingFullScreen);
  };

  const statsCards = [
    {
      title: 'Ongoing Battles',
      value: activeMatches,
      icon: Play,
      color: 'text-blue-400',
      bgColor: 'bg-blue-900/20',
      borderColor: 'border-blue-500/50'
    },
    {
      title: 'Active Questions',
      value: activeQuestions,
      icon: MessageSquare,
      color: 'text-green-400',
      bgColor: 'bg-green-900/20',
      borderColor: 'border-green-500/50'
    },
    {
      title: 'Active Rooms',
      value: activeRooms,
      icon: Settings,
      color: 'text-purple-400',
      bgColor: 'bg-purple-900/20',
      borderColor: 'border-purple-500/50'
    },
    {
      title: 'Total Users',
      value: totalUsers,
      icon: Users,
      color: 'text-orange-400',
      bgColor: 'bg-orange-900/20',
      borderColor: 'border-orange-500/50'
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white font-sans flex overflow-hidden">
      <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'} h-screen overflow-y-auto`}>
        
        {/* Header */}
        <header className="p-4 md:p-6 border-b border-gray-800">
          <h1 className="text-3xl font-bold text-[#73E600] border-b-2 border-[#73E600] pb-2 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-400">Overview of your platform's performance and statistics</p>
        </header>

        {loadingLoading && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center text-gray-400">Loading dashboard...</div>
          </div>
        )}

        {!loadingLoading && (
          <div className="p-4 md:p-6 space-y-6">
            
            {/* Stats Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {statsCards.map((card, index) => {
                const IconComponent = card.icon;
                return (
                  <div
                    key={index}
                    className={`relative bg-gray-900/80 p-4 rounded-lg border ${card.borderColor} hover:border-[#73E600] transition-all duration-300 cursor-pointer hover:shadow-[0_0_15px_rgba(115,230,0,0.3)] transform hover:-translate-y-1 ${card.bgColor}`}
                    onClick={() => console.log(`${card.title} clicked`)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`p-2 rounded-lg ${card.bgColor}`}>
                        <IconComponent className={`w-6 h-6 ${card.color}`} />
                      </div>
                      <span className="text-2xl font-bold text-white">{card.value}</span>
                    </div>
                    <h3 className="text-sm font-medium text-gray-300">{card.title}</h3>
                  </div>
                );
              })}
            </div>

            {/* Main Content Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Rankings Panel - Left Side (2/3 width) */}
              <div className="lg:col-span-2">
                <div className="bg-gray-900/80 p-6 rounded-lg border border-gray-800 hover:border-[#73E600] transition-all duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-[#73E600] flex items-center gap-2">
                      <Award className="w-6 h-6 text-yellow-400" />
                      Top 5 Ranked Warriors
                    </h2>
                    <button 
                      onClick={toggleRankingFullScreen} 
                      className="text-[#73E600] hover:text-yellow-400 transition-all duration-300"
                      title="View Full Screen"
                    >
                      <Award className="w-6 h-6" />
                    </button>
                  </div>
                  
                  {topUsers.length === 0 ? (
                    <div className="text-center py-12">
                      <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                      <p className="text-gray-400 text-lg">No ranked users yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {topUsers.slice(0, 10).map((user, index) => (
                        <div
                          key={user.user.id}
                          className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-all duration-300 border border-gray-700 hover:border-[#73E600]"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3">
                              <Trophy
                                className={`w-6 h-6 ${
                                  index === 0 ? 'text-yellow-400' : 
                                  index === 1 ? 'text-gray-300' : 
                                  index === 2 ? 'text-orange-400' : 
                                  'text-gray-500'
                                }`}
                              />
                              <span className="text-lg font-bold text-white min-w-[3rem]">
                                #{index + 1}
                              </span>
                            </div>
                            <span className="text-lg font-medium text-white truncate">
                              {user.user.username}
                            </span>
                          </div>
                          <span className="text-[#73E600] font-mono text-lg font-bold">
                            {user.points} pts
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Activity Panel - Right Side (1/3 width) */}
              <div className="lg:col-span-1">
                <div className="bg-gray-900/80 p-4 rounded-lg border border-gray-800">
                  <h2 className="text-lg font-semibold text-[#73E600] mb-4 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Recent Activity
                  </h2>
                  <div className="text-gray-400 text-center py-8">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                    <p className="text-sm">Activity feed will be displayed here</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Full Screen Ranking Modal */}
        {showRankingFullScreen && (
          <div 
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={(e) => e.target === e.currentTarget && toggleRankingFullScreen()}
          >
            <div className="relative bg-black p-6 rounded-xl border-[1.5px] border-[#73E600] w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#73E600] flex items-center gap-2">
                  <Trophy className="w-8 h-8 text-yellow-400" />
                  Top 5 Ranked Warriors
                </h2>
                <button
                  onClick={toggleRankingFullScreen}
                  className="text-gray-400 hover:text-[#73E600] transition-colors"
                >
                  <Award className="w-6 h-6" />
                </button>
              </div>
              
              {topUsers.length === 0 ? (
                <div className="text-center py-12">
                  <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <p className="text-gray-400 text-lg">No ranked users yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {topUsers.map((user, index) => (
                    <div
                      key={user.user.id}
                      className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-800 hover:border-[#73E600] transition-all duration-300"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                          <Trophy
                            className={`w-8 h-8 ${
                              index === 0 ? 'text-yellow-400' : 
                              index === 1 ? 'text-gray-300' : 
                              index === 2 ? 'text-orange-400' : 
                              'text-gray-500'
                            }`}
                          />
                          <span className="text-xl font-bold text-white">
                            #{index + 1}
                          </span>
                        </div>
                        <span className="text-xl font-medium text-white">
                          {user.user.username}
                        </span>
                      </div>
                      <span className="text-[#73E600] font-mono text-xl font-bold">
                        {user.points} pts
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;