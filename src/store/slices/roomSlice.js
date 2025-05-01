import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchRooms as fetchRoomsApi, createRoom } from '../../services/RoomService';

export const fetchRooms = createAsyncThunk('rooms/fetchRooms', async () => {
  const response = await fetchRoomsApi();
  return response;
});

export const createNewRoom = createAsyncThunk('rooms/createRoom', async (payload) => {
  const response = await createRoom(payload);
  return response;
});

const roomSlice = createSlice({
  name: 'rooms',
  initialState: {
    rooms: [],
    loading: false,
    error: null,
  },
  reducers: {
    addRoom(state, action) {
      state.rooms.push(action.payload);
    },
    updateRooms(state, action) {
      state.rooms = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRooms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRooms.fulfilled, (state, action) => {
        state.rooms = action.payload;
        state.loading = false;
      })
      .addCase(fetchRooms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createNewRoom.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNewRoom.fulfilled, (state, action) => {
        state.rooms.push(action.payload);
        state.loading = false;
      })
      .addCase(createNewRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { addRoom, updateRooms } = roomSlice.actions;
export default roomSlice.reducer;