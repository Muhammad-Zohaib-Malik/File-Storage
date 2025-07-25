import { axiosWithCreds, axiosWithoutCreds } from "./axiosInstances";

export const fetchUser = async () => {
  const { data } = await axiosWithCreds.get("/user");
  return data;
};

export const fetchAllUsers = async () => {
  const { data } = await axiosWithCreds.get("/user/all");
  return data.users;
};

export const logoutUser = async () => {
  const { data } = await axiosWithCreds.post("/user/logout");
  return data;
};

export const logoutAllSessions = async () => {
  const { data } = await axiosWithCreds.post("/user/logout-all");
  return data;
};

export const logoutUserById = async (id) => {
  const { data } = await axiosWithCreds.post(`/user/${id}/logout`);
  return data;
};

export const loginUser = async (formData) => {
  const { data } = await axiosWithCreds.post("/user/login", formData);
  return data;
};

export const registerUser = async (formData) => {
  const { data } = await axiosWithoutCreds.post("/user/register", formData);
  return data;
};

export const deleteUserById = async (id) => {
  const { data } = await axiosWithCreds.delete(`/user/${id}`);
  return data;
};

export const permanentDeleteUserById = async (id) => {
  const { data } = await axiosWithCreds.delete(`/user/${id}/hard`);
  return data;
};

export const recoverUserById = async (id) => {
  const { data } = await axiosWithCreds.patch(`/user/${id}/recover`);
  return data;
};

export const changeUserRoleById = async (id, newRole) => {
  const res = await axiosWithCreds.patch(`/user/${id}/change-role`, {
    role: newRole,
  });
  return res.data;
};
