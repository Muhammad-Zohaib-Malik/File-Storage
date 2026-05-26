import { axiosWithCreds } from "./axiosInstances";

export const setup2fa = async () => {
  const { data } = await axiosWithCreds.post("/totp/send");
  return data;
};

export const verify2fa = async (token) => {
  const { data } = await axiosWithCreds.post("/totp/verify", { token });
  return data;
};

export const reset2fa = async () => {
  const { data } = await axiosWithCreds.post("/totp/reset");
  return data;
};

export const verifyTotpLogin = async (mfaToken, token) => {
  const { data } = await axiosWithCreds.post("/user/login/verify-2fa", { mfaToken, token });
  return data;
};
