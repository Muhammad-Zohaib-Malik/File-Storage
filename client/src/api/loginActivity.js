import { axiosWithCreds } from "./axiosInstances";

export const LatestLoginActivity = async () => {
  const res = await axiosWithCreds.get("/latest-login") 
    return res.data;
};