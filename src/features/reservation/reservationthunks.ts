// src/features/reservations/reservationThunk.ts
import { createAsyncThunk } from '@reduxjs/toolkit';
import { getAllReservations, type Reservation } from './reservationService';

export const fetchReservations = createAsyncThunk<Reservation[], void>(
  'reservations/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await getAllReservations();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch reservations');
    }
  }
);