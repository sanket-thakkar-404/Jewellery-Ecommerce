import { api } from "../../api/api";

export const createProductAPI = async (data) => {
  const res = await api.post("/products", data);
  return res.data;
};
export const getProductAPI = async () => {
  const res = await api.get("/products");
  return res.data;
};

export const updateProductAPI = async (userId,data) => {
  const res = await api.put(`/products/${userId}` , data);
  return res.data;
};
export const deleteProductAPI = async (userId) => {
  const res = await api.delete(`/products/${userId}`);
  return res.data;
};






