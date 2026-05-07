import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, Language } from '../types';
import { apiRegister, apiGetProfile } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../i18n';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
};

export const registerUser = createAsyncThunk(
  'auth/register',
  async (
    payload: { firstName: string; lastName: string; email: string; phone: string; language: Language },
    { rejectWithValue }
  ) => {
    try {
      const { user, token } = await apiRegister(payload);
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('userId', user.id);
      i18n.changeLanguage(user.language);
      return { user, token };
    } catch (err: any) {
      return rejectWithValue(err.message || 'Registration failed');
    }
  }
);

export const loadStoredSession = createAsyncThunk('auth/loadSession', async (_, { rejectWithValue }) => {
  try {
    const token = await AsyncStorage.getItem('token');
    const userId = await AsyncStorage.getItem('userId');
    if (!token || !userId) return null;
    const user = await apiGetProfile(userId, token);
    i18n.changeLanguage(user.language);
    return { user, token };
  } catch {
    return rejectWithValue(null);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLanguage(state, action: PayloadAction<Language>) {
      if (state.user) {
        state.user.language = action.payload;
        i18n.changeLanguage(action.payload);
      }
    },
    signOut(state) {
      state.user = null;
      state.token = null;
      AsyncStorage.multiRemove(['token', 'userId']);
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(loadStoredSession.fulfilled, (state, action) => {
        if (action.payload) {
          state.user = action.payload.user;
          state.token = action.payload.token;
        }
      });
  },
});

export const { setLanguage, signOut, clearError } = authSlice.actions;
export default authSlice.reducer;
