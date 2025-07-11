// src/store/slices/dashboardSlice.js
import { createSlice } from '@reduxjs/toolkit';

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    activeMatches: 0,
    activeQuestions: 0,
    activeRooms: 0,
    totalUsers: 0,
    topUsers: [],
    isLoading: false,
    error: null,
    shouldRefresh: false,
  },
  reducers: {
    setDashboardData: (state, action) => {
      state.activeMatches = action.payload.active_matches;
      state.activeQuestions = action.payload.active_questions;
      state.activeRooms = action.payload.active_rooms;
      state.totalUsers = action.payload.total_users;
      state.topUsers = action.payload.top_users;
      state.isLoading = false;
      state.error = null;
      state.shouldRefresh = false;
    },
    setLoading: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    setError: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    setRefresh: (state) => {
      state.shouldRefresh = true;
    },
  },
});

export const { setDashboardData, setLoading, setError, setRefresh } = dashboardSlice.actions;
export default dashboardSlice.reducer;