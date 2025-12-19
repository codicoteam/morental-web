import axios from "axios";

const BASE_URL = "http://13.61.185.238:5050/api/v1/notifications";

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
 * Service for handling notification-related API requests
 */
const NotificationService = {
  /**
   * List all notifications (global)
   * GET /api/v1/notifications
   */
  getAllNotifications: async (): Promise<any> => {
    try {
      const token = getAuthToken();
      const response = await axios.get(`${BASE_URL}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw error.response?.data || "Failed to retrieve notifications";
      } else {
        throw "An unexpected error occurred";
      }
    }
  },

  /**
   * Get my notifications
   * GET /api/v1/notifications/mine
   */
  getMyNotifications: async (): Promise<any> => {
    try {
      const token = getAuthToken();
      const response = await axios.get(`${BASE_URL}/mine`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw error.response?.data || "Failed to retrieve your notifications";
      } else {
        throw "An unexpected error occurred";
      }
    }
  },

  /**
   * Get a single notification by ID
   * GET /api/v1/notifications/{id}
   */
  getNotificationById: async (id: string): Promise<any> => {
    try {
      const token = getAuthToken();
      const response = await axios.get(`${BASE_URL}/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw error.response?.data || "Failed to retrieve notification";
      } else {
        throw "An unexpected error occurred";
      }
    }
  },

  /**
   * Delete a notification
   * DELETE /api/v1/notifications/{id}
   */
  deleteNotification: async (id: string): Promise<any> => {
    try {
      const token = getAuthToken();
      const response = await axios.delete(`${BASE_URL}/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw error.response?.data || "Failed to delete notification";
      } else {
        throw "An unexpected error occurred";
      }
    }
  },

  /**
   * Bulk mark notifications as read for the current user
   * POST /api/v1/notifications/bulk/read
   */
  bulkMarkAsRead: async (data?: any): Promise<any> => {
    try {
      const token = getAuthToken();
      const response = await axios.post(
        `${BASE_URL}/bulk/read`,
        data || {},
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw error.response?.data || "Failed to mark notifications as read";
      } else {
        throw "An unexpected error occurred";
      }
    }
  },

  /**
   * Get notification acknowledgements
   * GET /api/v1/notifications/{id}/acks
   */
  getNotificationAcks: async (id: string): Promise<any> => {
    try {
      const token = getAuthToken();
      const response = await axios.get(`${BASE_URL}/${id}/acks`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw error.response?.data || "Failed to retrieve notification acknowledgements";
      } else {
        throw "An unexpected error occurred";
      }
    }
  },
};

export default NotificationService;
