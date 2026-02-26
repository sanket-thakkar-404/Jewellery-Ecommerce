import { api } from "../../api/api";

export const loginAPI = async (data) => {
  const res = await api.post("/auth/login", data);
  return res.data;
};

export const signupAPI = async (data) => {
  const res = await api.post("/auth/create", data);
  return res.data;
};

export const getProfileAPI = async () => {
  const res = await api.get("/auth/me");
  return res.data;
};
export const logoutApi = async () => {
  await api.post("/auth/logout");
  return;
};
export const getAllUsersAPI = async () => {
  const res = await api.get("/auth/");
  return res.data;
};
export const checkAuthAPI = async () => {
  const res = await api.get("/auth/check-auth");
  return res.data;
};
export const updateProfileAPI = async (data) => {
  const res = await api.patch("/auth/update-profile" ,data);
  return res.data;
};

