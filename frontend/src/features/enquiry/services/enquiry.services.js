import { api } from "../../api/api";

export const getEnquiresAPI = async () => {
  const res = await api.get("/enquiries");
  return res.data;
};

export const createEnquiryAPI = async (data) => {
  const res = await api.post("/enquiries", data);
  return res.data;
};

export const updateEnquiryAPI = async (userId , data) => {
  const res = await api.patch(`/enquiries/${userId}/status` , data);
  return res.data;
};

