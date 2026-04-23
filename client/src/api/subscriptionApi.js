import { axiosWithCreds } from "./axiosInstances";

export const createSubscription = async (priceId) => {
  const { data } = await axiosWithCreds.post("/subscriptions", { priceId });
  return data;
};

export const getCurrentSubscription = async () => {
  const { data } = await axiosWithCreds.get("/subscriptions");
  return data;
};
