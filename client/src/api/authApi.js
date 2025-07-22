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

export const loginWithGoogle = async (code) => {
  const { data } = await axiosWithCreds.post("/user/google", { code });
  return data;
};

export const changePasswordForGoogleUser = async (password) => {
  const { data } = await axiosWithCreds.post("/user/set-password-for-google", {
    password,
  });
  return data;
};

export const connectWithGoogleDrive = async (code) => {
  const { data } = await axiosWithCreds.post("/user/google/drive", { code });
  return data;
};

