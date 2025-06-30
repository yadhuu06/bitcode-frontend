import { useState, useEffect, useRef, memo } from 'react';
import { NavLink, useParams, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setLoading, resetLoading } from '../../store/slices/loadingSlice';
import { toast } from 'react-toastify';
import api from '../../api';
import { getRoomDetails } from '../../services/RoomService';
import { setupBattleWebSocket } from '../../services/BattleSocketService';
import BattleSidebar from '../../components/battle-room/BattleSidebar';
import BattleEditor from '../../components/battle-room/BattleEditor';

const Battle = () => {
  const { roomId, questionId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.loading);
  const { user, accessToken } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('description');
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState('');
  const [functionDetails, setFunctionDetails] = useState({ name: '', params: [] });
  const [isEditorFull, setIsEditorFull] = useState(false);
  const [question, setQuestion] = useState(state?.question || null);
  const [testCases, setTestCases] = useState(state?.question?.testcases || []);
  const [results, setResults] = useState([]);
  const [allPassed, setAllPassed] = useState(false);
  const [roomDetails, setRoomDetails] = useState(null);
  const [battleResults, setBattleResults] = useState([]);
  const [remainingTime, setRemainingTime] = useState(null);
  const [roomEnded, setRoomEnded] = useState(false);
  const wsListenerId = useRef(`battle-${roomId}`);

  const languages = [
    {
      name: 'python',
      language_id: '71',
      icon: 'https://img.icons8.com/?size=100&id=13441&format=png&color=000000',
      placeholder: '# Python code\nprint("Hello, Bit Code!")',
    },
  ];

  useEffect(() => {
    if (!roomId || !questionId) {
      console.error('Invalid roomId or questionId:', { roomId, questionId });
      toast.error('Invalid room or question ID');
      navigate('/user/rooms');
      return;
    }

    const calculateRemainingTime = (startTime, timeLimit) => {
      if (!startTime || timeLimit <= 0) return null;
      const elapsedSeconds = (new Date() - new Date(startTime)) / 1000;
      return Math.max(0, timeLimit * 60 - elapsedSeconds);
    };

    const fetchRoom = async () => {
      try {
        const response = await getRoomDetails(roomId, accessToken);
        setRoomDetails(response.room);
        if (response.room.status === 'completed') {
          setRoomEnded(true);
          toast.error('This battle has ended.');
          navigate('/user/rooms');
          return;
        }
        const initialTime = calculateRemainingTime(response.room.start_time, response.room.time_limit);
        setRemainingTime(initialTime);
        localStorage.setItem(`battle_${roomId}_remainingTime`, initialTime || 0);
      } catch (error) {
        toast.error(error.message || 'Failed to load room details');
        navigate('/user/rooms');
      }
    };

    const fetchQuestionAndFunction = async () => {
      try {
        const response = await api.get(`/battle/${questionId}/`);
        setQuestion(response.data.question);
        setTestCases(response.data.testcases || []);
        setFunctionDetails({
          name: response.data.function_details.function_name || '',
          params: response.data.function_details.parameters || [],
        });
        const paramsStr = response.data.function_details.parameters?.join(', ') || '';
        setCode(
          response.data.function_details.function_name
            ? `def ${response.data.function_details.function_name}(${paramsStr}):\n    # Write your code here\n    `
            : `# Write your code here`
        );
      } catch (error) {
        console.error('Failed to fetch question and function details:', error);
        toast.error(error.response?.data?.error || 'Failed to load question details');
        setCode(`# Write your code here`);
        navigate('/user/rooms');
      }
    };

    const cleanup = setupBattleWebSocket(roomId, { token: accessToken, username: user?.username }, (data) => {
      console.log('WebSocket message received:', data);
      if (data.type === 'battle_started') {
        const initialTime = data.time_limit * 60;
        setRemainingTime(initialTime);
        localStorage.setItem(`battle_${roomId}_remainingTime`, initialTime);
      } else if (data.type === 'code_verified' && !roomEnded) {
        setBattleResults((prev) => [
          ...prev.filter((entry) => entry.username !== data.username),
          { username: data.username, position: data.position, completion_time: data.completion_time },
        ]);
      } else if (data.type === 'time_update') {
        setRemainingTime(data.remaining_seconds);
        localStorage.setItem(`battle_${roomId}_remainingTime`, data.remaining_seconds);
      } else if (data.type === 'battle_completed') {
        setBattleResults(data.winners || []);
        setRoomEnded(true);
        toast.success(data.message || 'Battle Ended!', { autoClose: 3000 });
        localStorage.removeItem(`battle_${roomId}_remainingTime`);
      } else if (data.type === 'start_countdown') {
        // Handle countdown
      }
    });

    fetchRoom();
    fetchQuestionAndFunction();

    const savedTime = localStorage.getItem(`battle_${roomId}_remainingTime`);
    if (savedTime) setRemainingTime(parseInt(savedTime, 10));

    let intervalId;
    if (remainingTime !== null) {
      intervalId = setInterval(() => {
        setRemainingTime((prev) => {
          const newTime = prev > 0 ? prev - 1 : 0;
          localStorage.setItem(`battle_${roomId}_remainingTime`, newTime);
          return newTime;
        });
      }, 1000);
    }

    return () => {
      console.log('Cleaning up WebSocket listener and timer in Battle');
      cleanup();
      if (intervalId) clearInterval(intervalId);
      localStorage.removeItem(`battle_${roomId}_remainingTime`);
    };
  }, [roomId, questionId, user, accessToken, navigate, roomEnded]);

  const verifyCode = async () => {
    if (!question || roomEnded) {
      toast.error(roomEnded ? 'Battle has ended' : 'No question loaded');
      return;
    }
    dispatch(setLoading({ isLoading: true, message: `Verifying ${language} code...`, style: 'terminal', progress: 0 }));
    try {
      const wrappedCode = functionDetails.name
        ? `def ${functionDetails.name}(${functionDetails.params.join(', ')}):\n${code
            .split('\n')
            .slice(1)
            .join('\n')}`
        : code;
      const response = await api.post(`/battle/${questionId}/verify/`, {
        code: wrappedCode,
        language,
        room_id: roomId,
      });
      setResults(response.data.results);
      setAllPassed(response.data.all_passed);
      setActiveTab('results');
      toast.success('Code verification completed');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Verification failed');
    } finally {
      dispatch(resetLoading());
    }
  };

  const toggleEditorFull = () => {
    setIsEditorFull(!isEditorFull);
  };

  const formatTime = (seconds) => {
    if (seconds === null || seconds <= 0) return '0 min 0 sec';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes} min ${remainingSeconds} sec`;
  };

  return (
    <div className={`min-h-screen bg-black text-white font-mono ${isEditorFull ? 'overflow-hidden' : ''}`}>
      <nav className="bg-black border-b-2 border-green-500 h-16 flex items-center px-4 sm:px-6 fixed top-0 left-0 w-full z-50">
        <div className="container mx-auto flex items-center justify-between">
          <NavLink
            to="/user/dashboard"
            className="text-base sm:text-lg font-semibold text-white hover:text-green-500 transition-colors duration-300"
          >
            <span className="text-green-500">{'<'}</span>
            <span>BitCode Battle</span>
            <span className="text-green-500">{'/>'}</span>
          </NavLink>
          {roomDetails && (
            <div className="text-sm text-gray-400">
              Room: {roomDetails.name} | {roomDetails.is_ranked ? 'Ranked' : formatTime(remainingTime)}
            </div>
          )}
        </div>
      </nav>

      <div className="container mx-auto px-4 sm:px-6 pt-20 pb-6 flex flex-col lg:flex-row gap-4 lg:gap-6">
        {!isEditorFull && (
          <BattleSidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            question={question}
            testCases={testCases}
            results={results}
            allPassed={allPassed}
            battleResults={battleResults}
            remainingTime={roomDetails?.is_ranked ? null : remainingTime}
            currentUser={user?.username}
          />
        )}
        <BattleEditor
          language={language}
          setLanguage={setLanguage}
          code={code}
          setCode={setCode}
          isEditorFull={isEditorFull}
          toggleEditorFull={toggleEditorFull}
          verifyCode={verifyCode}
          isLoading={isLoading}
          question={question}
          languages={languages}
        />
      </div>
      <footer className="mt-8 text-center text-gray-400 text-xs border-t border-green-500 pt-4">
        <p>BITCODE BATTLE v1.0 • 2025</p>
        <p className="mt-1">Shortcuts: Ctrl+Enter to run • Ctrl+S to save</p>
      </footer>
    </div>
  );
};

export default memo(Battle);