import { create } from "zustand";
import { loginAPI, signupAPI, getProfileAPI, logoutApi, getAllUsersAPI, checkAuthAPI,updateProfileAPI } from "../services/auth.services";

export const useAuthStore = create((set) => ({
  admin: null,
  loading: false,
  allAdmin: null,

  checkAuth: async () => {
    try {
      set({ loading: true });
      const response = await checkAuthAPI();
      set({ admin: response.data });
      return { success: true }
    } catch (err) {
      console.error("Error in checkAuth store ", err.message)
      let message = err.response?.data?.message
      return { success: false, message }
    } finally {
      set({ loading: false });
    }
  },

  login: async (data) => {
    try {
      set({ loading: true });
      const response = await loginAPI(data);
      set({ admin: response.data.admin });
      return { success: true }
    } catch (err) {
      console.error("Error in login store ", err.message)
      let message = err.response?.data?.message
      let fieldErrors = err.response?.data?.errors || null;
      return { success: false, message, errors: fieldErrors, }
    } finally {
      set({ loading: false })
    }
  },

  signup: async (data) => {
    try {
      set({ loading: true });
      const response = await signupAPI(data);
      set({ admin: response.data.admin });
      return { success: true, name: admin.name, role: admin.role }
    } catch (err) {
      console.error("Error in signup store ", err.message)
      let message = err.response?.data?.message
      let fieldErrors = err.response?.data?.errors || null;
      return { success: false, message, errors: fieldErrors, }
    } finally {
      set({ loading: false, })
    }
  },

  getProfile: async () => {
    try {
      set({ loading: true });
      const response = await getProfileAPI();
      console.log(response)
      set({ admin: response.data });
      return { success: true }
    } catch (err) {
      console.error("Error in profile store ", err.message)
      let message = err.response?.data?.message
      return { success: false, message }
    } finally {
      set({ loading: false });
    }
  },
  
  getAllUsers: async () => {
    try {
      set({ loading: true });
      const response = await getAllUsersAPI();
      set({ allAdmin: response.data });
      return { success: true }
    } catch (err) {
      console.error("Error in get All Users store ", err.message)
      let message = err.response?.data?.message
      return { success: false, message }
    } finally {
      set({ loading: false });
    }
  },

  updateProfile: async (data) => {
    try {
      set({ loading: true });
      const response = await updateProfileAPI(data);
      // console.log(response)
      set({ admin: response.data });
      return { success: true }
    } catch (err) {
      console.error("Error in update Profile store ", err.message)
      let message = err.response?.data?.message
      let fieldErrors = err.response?.data?.errors || null;
      return { success: false, message, errors: fieldErrors, }
    } finally {
      set({ loading: false, })
    }
  },

  logout: async () => {
    try {
      set({ loading: true });
      await logoutApi();
      set({ admin: null });
      return { success: true }
    } catch (err) {
      console.error("Error in profile store ", err.message)
      let message = err.response?.data?.message
      return { success: false, message }
    } finally {
      set({ loading: false });
    }
  },
}));