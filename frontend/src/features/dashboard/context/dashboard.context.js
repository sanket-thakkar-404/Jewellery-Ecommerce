import { create } from "zustand";
import { getDashboardAPI } from "../services/dashboard.services";

export const useDashboardStore = create((set) => ({
  dashboard: null,  
  loading: false,

  getDashboard: async () => {
    try {
      set({ loading: true });

      const res = await getDashboardAPI();

      set({ dashboard: res.data });

      return { success: true };
    } catch (err) {
      console.error("Dashboard error:", err.response?.data || err);

      return {
        success: false,
        message: err.response?.data?.message,
      };
    } finally {
      set({ loading: false });
    }
  },
}));