import { axiosWithCreds, axiosWithoutCreds } from "./axiosInstances";

export const sendOtp = async (email) => {
  const { data } = await axiosWithoutCreds.post("/user/send-otp", { email });
  return data;
};

export const verifyOtp = async (email, otp) => {
  const { data } = await axiosWithoutCreds.post("/user/verify-otp", {
    email,
    otp,
  });
  return data;
};

export const loginWithGoogle = async (idToken) => {
  const { data } = await axiosWithCreds.post("/user/google", { idToken });
  return data;
};
