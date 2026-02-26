import { create } from "zustand";
import { createProductAPI, getProductAPI, updateProductAPI ,deleteProductAPI} from "../services/product.services";

export const useProductStore = create((set) => ({
  products: [],
  loading: false,

  createProduct: async (data) => {
    try {
      set({ loading: true });
      const response = await createProductAPI(data);
      set((state) => ({
        products: [response.data, ...state.products]
      }));
      return { success: true };
    } catch (err) {
      console.error("Error in Product store ", err.response?.data || err);
      return {
        success: false,
        message: err.response?.data?.message,
        errors: err.response?.data?.errors || null,
      };
    } finally {
      set({ loading: false });
    }
  },

  getProduct: async () => {
    try {
      set({ loading: true });

      const response = await getProductAPI();
      set({ products: response.data });  // Most likely correct

      return { success: true };

    } catch (err) {
      console.error("Error in Product store ", err.response?.data || err);

      return {
        success: false,
        message: err.response?.data?.message,
        errors: err.response?.data?.errors || null,
      };

    } finally {
      set({ loading: false });
    }
  },

  updateProduct: async (id, data) => {
    try {
      set({ loading: true });

      const response = await updateProductAPI(id, data);
      const updatedProduct = response.data; // verify key

      set((state) => ({
        products: state.products.map((p) =>
          p._id === id ? updatedProduct : p
        )
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
 deleteProduct: async (id) => {
  try {
    set({ loading: true });

    await deleteProductAPI(id);

    set((state) => ({
      products: state.products.filter((p) => p._id !== id)
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
}
}));