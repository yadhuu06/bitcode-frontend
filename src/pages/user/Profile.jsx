import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutSuccess, updateProfile } from '../../store/slices/authSlice';
import { setLoading, resetLoading } from '../../store/slices/loadingSlice';
import Cookies from 'js-cookie';
import { fetchProfile, updateProfile as updateProfileService, getImageKitAuthParams } from '../../services/ProfileService';
import { logout } from '../../services/AuthService';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { FaUser, FaEnvelope, FaCalendar, FaEdit, FaSave, FaTimes, FaCamera, FaSignOutAlt } from 'react-icons/fa';
import { showError, showSuccess } from '../../utils/toastManager'; 
import StatsSection from '../../components/user/StatsSection';
import RankingSection from '../../components/user/RankingSection';
import ContributionsSection from '../../components/user/ContributionsSection';
import imagekit from '../../config/imagekitConfig';
import MatrixBackground from '../../components/ui/MatrixBackground';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user: reduxUser, isAuthenticated } = useSelector((state) => state.auth);
  const refreshToken = useSelector((state) => state.auth.refreshToken) || Cookies.get('refresh_token');
  const isAdmin = reduxUser?.is_admin;

  const [user, setUser] = useState(reduxUser);
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(reduxUser?.username || '');
  const [profilePic, setProfilePic] = useState(null);
  const [crop, setCrop] = useState({ unit: '%', width: 50, height: 50, x: 0, y: 0, aspect: 1 / 1 });
  const [croppedImage, setCroppedImage] = useState(null);
  const [imageRef, setImageRef] = useState(null);
  const [selectedSection, setSelectedSection] = useState('stats');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [stats, setStats] = useState({});

  useEffect(() => {
    const fetchUserData = async () => {
      dispatch(setLoading({ isLoading: true, message: 'Loading profile...', style: 'default', progress: 50 }));
      try {
        const userData = await fetchProfile();
        setUser(userData);
        setUsername(userData.username || '');
        setStats({ total_matches: userData.total_battles || 0, battles_won: userData.battles_won || 0 });
        dispatch(updateProfile({ user: userData }));
      } catch (error) {
        showError(error.message || 'Failed to load profile data');
        navigate('/login');
      } finally {
        dispatch(resetLoading());
      }
    };

    if (!isAuthenticated) {
      navigate('/login');
    } else if (!reduxUser || reduxUser.total_battles === undefined || reduxUser.battles_won === undefined) {
      fetchUserData();
    } else {
      setUser(reduxUser);
      setUsername(reduxUser.username || '');
      setStats({ total_matches: reduxUser.total_battles || 0, battles_won: reduxUser.battles_won || 0 });
    }

    return () => {
      dispatch(resetLoading());
    };
  }, [dispatch, isAuthenticated, reduxUser, navigate]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showError('Please upload a valid image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showError('Image size must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => setProfilePic(reader.result);
      reader.onerror = () => showError('Failed to read the image file');
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = (crop) => {
    if (imageRef && crop.width && crop.height) {
      getCroppedImg(imageRef, crop);
    }
  };

  const getCroppedImg = (image, crop) => {
    try {
      const canvas = document.createElement('canvas');
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      canvas.width = crop.width;
      canvas.height = crop.height;
      const ctx = canvas.getContext('2d');

      if (!ctx) throw new Error('Failed to get canvas context');

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
    } catch (error) {
      showError('Failed to crop the image');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      showError('Username cannot be empty');
      return;
    }

    dispatch(setLoading({ isLoading: true, message: 'Updating profile...', style: 'compile', progress: 0 }));

    try {
      let imageUrl = null;
      if (croppedImage) {
        const authParams = await getImageKitAuthParams();

        if (!authParams?.token || !authParams?.signature || !authParams?.expire) {
          throw new Error('Invalid ImageKit authentication parameters');
        }

        imagekit.authenticationParameters = {
          token: authParams.token,
          signature: authParams.signature,
          expire: authParams.expire,
        };

        const blob = await fetch(croppedImage).then((res) => res.blob());
        const file = new File([blob], `profile_${Date.now()}.jpg`, { type: 'image/jpeg' });
        const uploadResult = await imagekit.upload({
          file,
          fileName: `profile_${Date.now()}.jpg`,
          folder: '/bitwar-profiles/',
          useUniqueFileName: true,
          token: authParams.token,
          signature: authParams.signature,
          expire: authParams.expire,
        });

        if (uploadResult?.url) imageUrl = uploadResult.url;
        else throw new Error('Upload result does not contain a valid URL');
      }

      const formData = new FormData();
      formData.append('username', username.trim());
      if (imageUrl) formData.append('profile_picture', imageUrl);

      const updatedUser = await updateProfileService(formData);
      showSuccess('Profile updated successfully!');

      setUser(updatedUser);
      setIsEditing(false);
      setProfilePic(null);
      setCroppedImage(null);
      dispatch(updateProfile({ user: updatedUser }));

    } catch (error) {
      showError(error?.message || 'Failed to update profile');
    } finally {
      dispatch(resetLoading());
    }
  };

  const handleLogout = async () => {
    dispatch(setLoading({ isLoading: true, message: 'Logging out...', style: 'default', progress: 0 }));
    try {
      await logout();
      dispatch(logoutSuccess());
      showSuccess('Logged out successfully!');
      navigate('/');
    } catch (error) {
      dispatch(logoutSuccess());
      showError(error.message || 'Logout failed, but session cleared');
      navigate('/');
    } finally {
      dispatch(resetLoading());
    }
  };

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  const handleSelection = (section) => {
    setSelectedSection(section);
    setDropdownOpen(false);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center relative overflow-hidden pt-24">
      <MatrixBackground particleCount={20} color="#00FF40" opacityRange={[0.3, 0.8]} />
      <div className="w-full max-w-7xl flex flex-col lg:flex-row justify-between px-6 py-6 gap-12">
        <div className="w-full lg:w-1/3 lg:order-1">
          <div className="bg-black bg-opacity-80 backdrop-blur-md p-6 rounded-lg border-2 border-green-500 shadow-xl relative">
            <h1 className="text-2xl font-mono text-green-500 mb-4 text-center tracking-wider relative group">
              <span className="animate-pulse">[ User Terminal ]</span>
            </h1>
            <div className="flex justify-center mb-4">
              <div className="relative">
                <img
                  src={
                    user?.profile_picture
                      ? user.profile_picture.startsWith('http')
                        ? user.profile_picture
                        : `${BASE_URL}${user.profile_picture}`
                      : `${BASE_URL}/media/profile_pics/default/coding_hacker.png`
                  }
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-2 border-green-500 shadow-md transition-all duration-300 hover:shadow-lg"
                  onError={(e) => {
                    console.error('Image load error:', user?.profile_picture);
                    e.target.onerror = null;
                    e.target.src = `${BASE_URL}/media/profile_pics/default/coding_hacker.png`;
                  }}
                />
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-green-500 p-2 rounded-full cursor-pointer hover:bg-green-400 transition-colors">
                    <FaCamera />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
            {!isEditing ? (
              <div className="space-y-3 font-mono text-white">
                <div className="flex items-center space-x-2 hover:text-green-300 transition-colors duration-300">
                  <FaUser className="text-green-500" />
                  <span>USER: {user?.username || 'Loading...'}</span>
                </div>
                <div className="flex items-center space-x-2 hover:text-green-300 transition-colors duration-300">
                  <FaEnvelope className="text-green-500" />
                  <span>EMAIL: {user?.email || 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-2 hover:text-green-300 transition-colors duration-300">
                  <FaCalendar className="text-green-500" />
                  <span>BOOT: {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Loading...'}</span>
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
                      onChange={(newCrop, percentCrop) => setCrop(percentCrop)}
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
                    onClick={() => {
                      setIsEditing(false);
                      setProfilePic(null);
                      setCroppedImage(null);
                      setUsername(user?.username || '');
                    }}
                  >
                    <FaTimes />
                    <span>[ ABORT ]</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
        <div className="w-full lg:w-2/3 lg:order-2">
          <div className="flex justify-center mb-6 space-x-4">
            <button
              className={`px-4 py-2 font-mono text-green-500 bg-black bg-opacity-80 backdrop-blur-md border-2 border-green-500 rounded-lg shadow-xl hover:bg-green-500 hover:text-white transition focus:outline-none ${
                selectedSection === 'stats' ? 'bg-green-500 text-white' : ''
              }`}
              onClick={() => setSelectedSection('stats')}
            >
              Stats
            </button>
            <button
              className={`px-4 py-2 font-mono text-green-500 bg-black bg-opacity-80 backdrop-blur-md border-2 border-green-500 rounded-lg shadow-xl hover:bg-green-500 hover:text-white transition focus:outline-none ${
                selectedSection === 'ranking' ? 'bg-green-500 text-white' : ''
              }`}
              onClick={() => setSelectedSection('ranking')}
            >
              Ranking
            </button>
            <button
              className={`px-4 py-2 font-mono text-green-500 bg-black bg-opacity-80 backdrop-blur-md border-2 border-green-500 rounded-lg shadow-xl hover:bg-green-500 hover:text-white transition focus:outline-none ${
                selectedSection === 'contributions' ? 'bg-green-500 text-white' : ''
              }`}
              onClick={() => setSelectedSection('contributions')}
            >
              Contributions
            </button>
          </div>
          {selectedSection === 'stats' && <StatsSection stats={stats} />}
          {selectedSection === 'ranking' && <RankingSection />}
          {selectedSection === 'contributions' && <ContributionsSection />}
        </div>
      </div>
    </div>
  );
};

export default Profile;