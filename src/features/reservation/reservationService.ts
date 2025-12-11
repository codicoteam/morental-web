// src/features/reservations/reservationService.ts
import axiosInstance from "../../api/axiosInstance";
import { loadAuthFromStorage } from "../auth/authService"; 

const BASE_URL = "http://13.61.185.238:5050";

export interface Reservation {
  id: string;
  [key: string]: any;
}

export const getAllReservations = async (): Promise<Reservation[]> => {
  // Get the stored token
  const token = loadAuthFromStorage();

  // Attach the token manually (only for this request)
  const response = await axiosInstance.get<Reservation[]>(
    `${BASE_URL}/api/v1/reservations`,
    {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    }
  );

  return response.data;
};
