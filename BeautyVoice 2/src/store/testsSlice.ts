import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Test, TestResult } from '../types';
import { apiFetchTests, apiSubmitTest } from '../services/api';

interface TestsState {
  available: Test[];
  completed: TestResult[];
  loading: boolean;
  error: string | null;
  submitting: boolean;
}

const initialState: TestsState = {
  available: [],
  completed: [],
  loading: false,
  error: null,
  submitting: false,
};

export const fetchTests = createAsyncThunk(
  'tests/fetchAll',
  async (token: string, { rejectWithValue }) => {
    try {
      return await apiFetchTests(token);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to load tests');
    }
  }
);

export const submitTestAnswers = createAsyncThunk(
  'tests/submit',
  async (
    payload: { testId: string; answers: Record<string, string | string[] | number>; token: string },
    { rejectWithValue }
  ) => {
    try {
      return await apiSubmitTest(payload);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to submit test');
    }
  }
);

const testsSlice = createSlice({
  name: 'tests',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTests.fulfilled, (state, action) => {
        state.loading = false;
        state.available = action.payload;
      })
      .addCase(fetchTests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(submitTestAnswers.pending, (state) => {
        state.submitting = true;
      })
      .addCase(submitTestAnswers.fulfilled, (state, action) => {
        state.submitting = false;
        state.completed.push(action.payload);
      })
      .addCase(submitTestAnswers.rejected, (state) => {
        state.submitting = false;
      });
  },
});

export default testsSlice.reducer;
