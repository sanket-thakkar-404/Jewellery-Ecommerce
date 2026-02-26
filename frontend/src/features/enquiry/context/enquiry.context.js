import { create } from "zustand";
import { updateEnquiryAPI, createEnquiryAPI, getEnquiresAPI } from "../services/enquiry.services";

export const useEnquiryStore = create((set) => ({
  enquiry: [],
  loading: false,

  createEnquiry: async (data) => {
    try {
      set({ loading: true });
      await createEnquiryAPI(data);
      return { success: true };
    } catch (err) {
      console.error("Error in Enquiry store ", err.response?.data || err);
      return {
        success: false,
        message: err.response?.data?.message,
        errors: err.response?.data?.errors || null,
      };
    } finally {
      set({ loading: false });
    }
  },

  getEnquires: async () => {
    try {
      set({ loading: true });
      const response = await getEnquiresAPI();
      set({ enquiry: response.data });  // Most likely correct
      return { success: true };
    } catch (err) {
      console.error("Error in Enguiry store ", err.response?.data || err);
      return {
        success: false,
        message: err.response?.data?.message,
        errors: err.response?.data?.errors || null,
      };
    } finally {
      set({ loading: false });
    }
  },

  updateEnquiry: async (id, data) => {
    try {
      set({ loading: true });

      const response = await updateEnquiryAPI(id, data);
      console.log(response)

      set((state) => ({
        enquiry: state.enquiry.map((e) =>
          e._id === id ? { ...e, ...data } : e
        ),
      }));
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message,
      };
    } finally {
      set({ loading: false });
    }
  },
}));