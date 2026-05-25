import { axiosWithCreds } from "./axiosInstances";

export const createSubscription = async (priceId) => {
  const { data } = await axiosWithCreds.post("/subscriptions", { priceId });
  return data;
};

export const getCurrentSubscription = async () => {
  const { data } = await axiosWithCreds.get("/subscriptions");
  return data;
};

export const getAllSubscriptions = async () => {
  const { data } = await axiosWithCreds.get("/subscriptions/all");
  return data;
};

export const pauseSubscription = async () => {
  const { data } = await axiosWithCreds.post("/subscriptions/pause");
  return data;
};

export const resumeSubscription = async () => {
  const { data } = await axiosWithCreds.post("/subscriptions/resume");
  return data;
};

export const cancelSubscription = async () => {
  const { data } = await axiosWithCreds.post("/subscriptions/cancel");
  return data;
};
