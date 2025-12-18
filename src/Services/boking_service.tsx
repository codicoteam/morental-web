import axios from "axios";

const BASE_URL = "http://13.61.185.238:5050/api/v1/driver-bookings";

/**
 * Helper to get the stored token
 */
const getAuthToken = (): string | null => {
  const stored = localStorage.getItem("car_rental_auth");
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored);
    return parsed.token || null;
  } catch {
    return null;
  }
};

/**
 * Service for handling driver booking-related API requests
 */
const BookingDriverService = {
  /**
   * Create a new driver booking (POST)
   */
  createBooking: async (data: any): Promise<any> => {
    try {
      const token = getAuthToken();
      const response = await axios.post(`${BASE_URL}`, data, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw error.response?.data || "Failed to create driver booking";
      } else {
        throw "An unexpected error occurred";
      }
    }
  },

  /**
   * Get my own bookings (GET)
   * GET /api/v1/driver-bookings/me
   */
  getMyBookings: async (): Promise<any> => {
    try {
      const token = getAuthToken();
      const response = await axios.get(`${BASE_URL}/me`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw error.response?.data || "Failed to retrieve your bookings";
      } else {
        throw "An unexpected error occurred";
      }
    }
  },

  /**
   * Confirm payment for a booking (PATCH)
   * PATCH /api/v1/driver-bookings/me/{id}/confirm-payment
   */
  confirmPayment: async (id: string): Promise<any> => {
    try {
      const token = getAuthToken();
      const response = await axios.patch(
        `${BASE_URL}/me/${id}/confirm-payment`,
        {},
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw error.response?.data || "Failed to confirm payment";
      } else {
        throw "An unexpected error occurred";
      }
    }
  },
};

export default BookingDriverService;
