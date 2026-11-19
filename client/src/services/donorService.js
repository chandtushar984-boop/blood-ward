import api from "./api";

export const donorService = {
  async getProfile() {
    try {
      const response = await api.get("/donors/me");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch donor profile" };
    }
  },

  async updateProfile(data) {
    try {
      const response = await api.put("/donors/me", data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to update donor profile" };
    }
  },

  async updateAvailability(availability) {
    if (availability !== "available" && availability !== "not_available") {
      throw new Error("Availability must be either 'available' or 'not_available'");
    }
    try {
      const response = await api.patch("/donors/me/availability", { availability });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to update availability" };
    }
  },

  async search(params) {
    try {
      const response = await api.get("/donors/search", { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to search donors" };
    }
  },

  async getHealthQuestionnaire() {
    try {
      const response = await api.get("/donors/me/health-questionnaire");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch health questionnaire" };
    }
  },

  async updateHealthQuestionnaire(data) {
    try {
      const response = await api.put("/donors/me/health-questionnaire", data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to update health questionnaire" };
    }
  },
};

export default donorService;
