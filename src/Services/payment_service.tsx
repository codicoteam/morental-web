import axios from "axios";

const BASE_URL = "http://13.61.185.238:5050/api/v1/payments";

/**
 * Helper to get the stored auth token
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
 * Service for handling payment-related API requests
 * Covers reservations and driver bookings payments
 */
const PaymentService = {
  /**
   * Initiate a payment (POST)
   * POST /api/v1/payments/initiate
   */
  initiatePayment: async (data: any): Promise<any> => {
    try {
      const token = getAuthToken();
      const response = await axios.post(`${BASE_URL}/initiate`, data, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw error.response?.data || "Failed to initiate payment";
      } else {
        throw "An unexpected error occurred";
      }
    }
  },

  /**
   * Initiate a mobile payment (POST)
   * POST /api/v1/payments/mobile
   */
  initiateMobilePayment: async (data: any): Promise<any> => {
    try {
      const token = getAuthToken();
      const response = await axios.post(`${BASE_URL}/mobile`, data, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw error.response?.data || "Failed to initiate mobile payment";
      } else {
        throw "An unexpected error occurred";
      }
    }
  },

  /**
   * Get payment status (GET)
   * GET /api/v1/payments/{id}/status
   */
  getPaymentStatus: async (id: string): Promise<any> => {
    try {
      const token = getAuthToken();
      const response = await axios.get(`${BASE_URL}/${id}/status`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw error.response?.data || "Failed to fetch payment status";
      } else {
        throw "An unexpected error occurred";
      }
    }
  },

  /**
   * Explicitly poll Paynow for a payment (POST)
   * Same as GET /{id}/status
   * POST /api/v1/payments/{id}/poll
   */
  pollPaymentStatus: async (id: string): Promise<any> => {
    try {
      const token = getAuthToken();
      const response = await axios.post(
        `${BASE_URL}/${id}/poll`,
        {},
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw error.response?.data || "Failed to poll payment status";
      } else {
        throw "An unexpected error occurred";
      }
    }
  },

  /**
   * Get payment details (GET)
   * GET /api/v1/payments/{id}
   */
  getPaymentById: async (id: string): Promise<any> => {
    try {
      const token = getAuthToken();
      const response = await axios.get(`${BASE_URL}/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw error.response?.data || "Failed to retrieve payment details";
      } else {
        throw "An unexpected error occurred";
      }
    }
  },

  /**
   * Paynow webhook callback (POST)
   * PUBLIC ENDPOINT — NO AUTH REQUIRED
   * POST /api/v1/payments/webhook/paynow
   *
   * ⚠️ This is typically called by Paynow, not manually from the frontend.
   */
  paynowWebhook: async (data: any): Promise<any> => {
    try {
      const response = await axios.post(
        `${BASE_URL}/webhook/paynow`,
        data
      );
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw error.response?.data || "Paynow webhook processing failed";
      } else {
        throw "An unexpected error occurred";
      }
    }
  },
};

export default PaymentService;
