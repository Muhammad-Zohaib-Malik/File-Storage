import { axiosWithoutCreds } from "./axiosInstances";

export const loginWithGoogle = async (idToken) => {
  const { data } = await axiosWithoutCreds.post("/user/google", { idToken });
  return data;
};
