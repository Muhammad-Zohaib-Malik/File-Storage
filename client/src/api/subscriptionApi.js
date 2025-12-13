import { axiosWithCreds } from "./axiosInstances";

export const createSubscription = async (priceId) => {
  const { data } = await axiosWithCreds.post("/subscriptions", { priceId });
  return data;
};
