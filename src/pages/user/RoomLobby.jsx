import React, { useState, useEffect, memo } from 'react'; // Add memo to imports
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { handleStartBattle } from '../../services/BattleService';
import useWebSocketLobby from '../../hooks/useWebSocketLobby';
import useRoomDetails from '../../hooks/useRoomDetails';
import {
  initiateCountdown,
  handleReadyToggle,
  handleKickParticipant,
  handleCopy,
  handleLeaveRoom,
  handleCloseRoom,
} from '../../utils/lobbyActions';
import 'react-toastify/dist/ReactToastify.css';
import LobbyHeader from '../../components/battle-room/LobbyHeader';
import ParticipantsPanel from '../../components/battle-room/ParticipantsPanel';
import LobbySidebar from '../../components/battle-room/LobbySidebar';
import LobbyFooter from '../../components/battle-room/LobbyFooter';
import LobbyModals from '../../components/battle-room/LobbyModals';
import MatrixBackground from '../../components/ui/MatrixBackground';

const BattleWaitingLobby = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const accessToken = useSelector((state) => state.auth.accessToken);
  const [activeTab, setActiveTab] = useState('details');
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
  );
  const [copied, setCopied] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const { roomDetails, username, role, setRole, isLoading, setRoomDetails } = useRoomDetails(roomId, accessToken);
  const {
    participants,
    setParticipants,
    countdown,
    setCountdown,
    readyStatus,
    setReadyStatus,
    isRoomClosed,
    isKicked,
    lobbyMessages,
    assignedQuestion,
  } = useWebSocketLobby(roomId, accessToken, username, setRole);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getDifficultyStyles = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'hard':
        return 'text-red-500 bg-red-500/10';
      case 'medium':
        return 'text-yellow-500 bg-yellow-500/10';
      case 'easy':
        return 'text-green-500 bg-green-500/10';
      default:
        return 'text-gray-400 bg-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-mono flex flex-col relative overflow-hidden">
      <MatrixBackground particleCount={30} color="#00FF40" opacityRange={[0.1, 0.8]} speed={0.01} />
      <div className="relative z-10 flex flex-col min-h-screen">
        <LobbyModals
          isKicked={isKicked}
          isRoomClosed={isRoomClosed}
          isLoading={isLoading}
          countdown={countdown}
        />
        {!isKicked && !isRoomClosed && !isLoading && roomDetails && (
          <>
            <LobbyHeader
              roomDetails={roomDetails}
              role={role}
              currentTime={currentTime}
              handleLeaveRoom={handleLeaveRoom}
              getDifficultyStyles={getDifficultyStyles}
            />
            <main className="flex-1 max-w-7xl mx-auto w-full py-6 px-4 flex flex-col lg:flex-row gap-6">
              <ParticipantsPanel
                participants={participants}
                username={username}
                role={role}
                readyStatus={readyStatus}
                isLoading={isLoading}
                handleReadyToggle={() => handleReadyToggle(username, readyStatus, setReadyStatus)}
                handleKickParticipant={(targetUsername) =>
                  handleKickParticipant(role, targetUsername)
                }
                lobbyMessages={lobbyMessages}
                roomDetails={roomDetails}
              />
              <LobbySidebar
                roomDetails={roomDetails}
                role={role}
                username={username}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                handleCopy={() => handleCopy(roomDetails?.join_code, setCopied)}
                copied={copied}
                isLoading={isLoading}
                participants={participants}
                initiateCountdown={() =>
                  handleStartBattle({
                    room: roomDetails,
                    participants,
                    currentUser: username,
                    navigate,
                  })
                }
                handleCloseRoom={() => handleCloseRoom(role)}
                handleLeaveRoom={handleLeaveRoom}
                handleReadyToggle={() => handleReadyToggle(username, readyStatus, setReadyStatus)}
                readyStatus={readyStatus}
                getDifficultyStyles={getDifficultyStyles}
                unreadCount={unreadCount}
                setUnreadCount={setUnreadCount}
              />
            </main>
            <LobbyFooter roomDetails={roomDetails} currentTime={currentTime} />
          </>
        )}
      </div>
    </div>
  );
};

export default memo(BattleWaitingLobby);