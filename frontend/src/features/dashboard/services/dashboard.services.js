import { api } from "../../api/api";

export const getDashboardAPI = async () => {
  const res = await api.get("/admin/dashboard");
  return res.data;
};


