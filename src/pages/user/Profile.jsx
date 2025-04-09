import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { FaUser, FaEnvelope, FaCalendar, FaEdit, FaSave, FaTimes, FaCamera, FaSignOutAlt } from 'react-icons/fa';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  const [crop, setCrop] = useState({ unit: '%', width: 50, aspect: 1 / 1 });
  const [croppedImage, setCroppedImage] = useState(null);
  const [imageRef, setImageRef] = useState(null);
  const [binaryElements, setBinaryElements] = useState([]);

  // Fetch user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('/api/auth/profile/', {
          headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
        });
        setUser(response.data);
        setUsername(response.data.username || '');
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    fetchUserData();
  }, []);

  // Generate random 0s and 1s
  useEffect(() => {
    const generateBinary = () => {
      const newBinary = [];
      for (let i = 0; i < 20; i++) {
        newBinary.push({
          value: Math.random() > 0.5 ? '1' : '0',
          left: Math.random() * 100,
          top: Math.random() * 100,
          key: i,
        });
      }
      setBinaryElements(newBinary);
    };
    generateBinary();
    const interval = setInterval(generateBinary, 4000);
    return () => clearInterval(interval);
  }, []);

  // Handle file input for profile picture
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setProfilePic(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Handle cropping completion
  const onCropComplete = (crop) => {
    if (imageRef && crop.width && crop.height) {
      getCroppedImg(imageRef, crop);
    }
  };

  const getCroppedImg = (image, crop) => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    const croppedImgUrl = canvas.toDataURL('image/jpeg');
    setCroppedImage(croppedImgUrl);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('username', username);
    if (croppedImage) {
      const blob = await fetch(croppedImage).then((res) => res.blob());
      formData.append('profile_picture', blob, 'profile.jpg');
    }

    try {
      const response = await axios.patch('/api/auth/profile/', formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setUser(response.data);
      setIsEditing(false);
      setProfilePic(null);
      setCroppedImage(null);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout/', null, {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
      });
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Dummy stats data
  const stats = {
    solvedQuestions: 42,
    attemptedDays: 15,
    activeStreak: 7,
    lastWin: '2025-04-07',
    recentHistory: ['Solved "Binary Search"', 'Attempted "Dynamic Programming"', 'Won "Code Challenge #3"'],
  };

  if (!user) return (
    <div className="text-green-500 animate-pulse font-mono text-center absolute inset-0 flex items-center justify-center z-10">
      Initializing...
    </div>
  );

  return (
    <div className="min-h-screen bg-black flex flex-col items-center relative overflow-hidden pt-26">
      {/* Main Content */}
      <div className="w-full max-w-7xl flex flex-col lg:flex-row justify-between px-6 py-6 gap-14">
        {/* User Terminal Section (Left) */}
        <div className="w-full lg:w-1/3 lg:order-1">
          <div className="bg-black bg-opacity-80 backdrop-blur-md p-6 rounded-lg border-2 border-green-500 shadow-xl relative">
            <h1 className="text-2xl font-mono text-green-500 mb-4 text-center tracking-wider relative group">
              <span className="animate-pulse">[ User Terminal ]</span>
              <span className="absolute -left-2 top-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-green-300"></span>
            </h1>

            <div className="flex justify-center mb-4">
              <img
                src={
                  user.profile_picture
                    ? `http://localhost:8000${user.profile_picture}`
                    : 'http://localhost:8000/media/profile_pics/default/coding_hacker.png'
                }
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-2 border-green-500 shadow-md transition-all duration-300 hover:shadow-lg"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'http://localhost:8000/media/profile_pics/default/coding_hacker.png';
                }}
              />
            </div>

            {!isEditing ? (
              <div className="space-y-3 font-mono text-white">
                <div className="flex items-center space-x-2 hover:text-green-300 transition-colors duration-300">
                  <FaUser className="text-green-500" />
                  <span>USER: {user.username}</span>
                </div>
                <div className="flex items-center space-x-2 hover:text-green-300 transition-colors duration-300">
                  <FaEnvelope className="text-green-500" />
                  <span>EMAIL: {user.email}</span>
                </div>
                <div className="flex items-center space-x-2 hover:text-green-300 transition-colors duration-300">
                  <FaCalendar className="text-green-500" />
                  <span>BOOT: {new Date(user.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex space-x-2 mt-4">
                  <button
                    className="flex-1 flex items-center justify-center space-x-2 bg-black border border-green-500 text-white py-2 rounded hover:bg-green-500 hover:text-black transition-all duration-300"
                    onClick={() => setIsEditing(true)}
                  >
                    <FaEdit />
                    <span>[ MODIFY ]</span>
                  </button>
                  <button
                    className="flex-1 flex items-center justify-center space-x-2 bg-black border border-green-500 text-white py-2 rounded hover:bg-green-500 hover:text-black transition-all duration-300"
                    onClick={handleLogout}
                  >
                    <FaSignOutAlt />
                    <span>[ LOGOUT ]</span>
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 font-mono text-white">
                <div className="space-y-1">
                  <label className="flex items-center space-x-2 text-green-500">
                    <FaUser />
                    <span>USER:</span>
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full p-2 bg-black border border-green-500 rounded text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300"
                  />
                </div>
                <div className="space-y-1">
                  <label className="flex items-center space-x-2 text-green-500">
                    <FaCamera />
                    <span>AVATAR:</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full text-white file:bg-black file:border file:border-green-500 file:text-white file:rounded file:p-1 file:mr-4 hover:file:bg-green-500 hover:file:text-black transition-all duration-300"
                  />
                </div>

                {profilePic && (
                  <div className="mt-4">
                    <ReactCrop
                      crop={crop}
                      onChange={(_, percentCrop) => setCrop(percentCrop)}
                      onComplete={onCropComplete}
                      aspect={1}
                    >
                      <img
                        src={profilePic}
                        onLoad={(e) => setImageRef(e.target)}
                        alt="Crop preview"
                        className="border border-green-500"
                      />
                    </ReactCrop>
                  </div>
                )}

                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="flex-1 flex items-center justify-center space-x-2 bg-black border border-green-500 text-white py-2 rounded hover:bg-green-500 hover:text-black transition-all duration-300"
                  >
                    <FaSave />
                    <span>[ COMMIT ]</span>
                  </button>
                  <button
                    type="button"
                    className="flex-1 flex items-center justify-center space-x-2 bg-black border border-green-500 text-white py-2 rounded hover:bg-green-500 hover:text-black transition-all duration-300"
                    onClick={() => setIsEditing(false)}
                  >
                    <FaTimes />
                    <span>[ ABORT ]</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Stats Section (Right) */}
        <div className="w-full lg:w-2/3 lg:order-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8">
            {/* Solved Questions */}
            <div className="bg-black bg-opacity-80 backdrop-blur-md p-6 rounded-lg border-2 border-green-500 shadow-xl text-center">
              <h2 className="text-lg font-mono text-green-500 mb-4">Solved Questions</h2>
              <p className="text-5xl font-mono text-white">{stats.solvedQuestions}</p>
            </div>

            {/* Attempted Days */}
            <div className="bg-black bg-opacity-80 backdrop-blur-md p-6 rounded-lg border-2 border-green-500 shadow-xl text-center">
              <h2 className="text-lg font-mono text-green-500 mb-4">Attempted Days</h2>
              <p className="text-5xl font-mono text-white">{stats.attemptedDays}</p>
            </div>

            {/* Active Streak */}
            <div className="bg-black bg-opacity-80 backdrop-blur-md p-6 rounded-lg border-2 border-green-500 shadow-xl text-center">
              <h2 className="text-lg font-mono text-green-500 mb-4">Active Streak</h2>
              <p className="text-5xl font-mono text-white">{stats.activeStreak}</p>
            </div>

            {/* Last Win */}
            <div className="bg-black bg-opacity-80 backdrop-blur-md p-6 rounded-lg border-2 border-green-500 shadow-xl text-center">
              <h2 className="text-lg font-mono text-green-500 mb-4">Last Win</h2>
              <p className="text-3xl font-mono text-white">{stats.lastWin}</p>
            </div>

            {/* Recent History */}
            <div className="bg-black bg-opacity-80 backdrop-blur-md p-6 rounded-lg border-2 border-green-500 shadow-xl col-span-1 sm:col-span-2 lg:col-span-2">
              <h2 className="text-lg font-mono text-green-500 mb-4">Recent History</h2>
              <ul className="list-disc pl-5 text-white font-mono text-base">
                {stats.recentHistory.map((item, index) => (
                  <li key={index} className="mb-2">{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;