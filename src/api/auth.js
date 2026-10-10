import { post } from "../admin/app/axiosWrapper.js";

export const login = (credentials) => post("auth/login", credentials);

export const register = (account) => post("auth/register", account);

export const isAdminAccount = (user = {}) => {
  const role = user.role?.name || user.role?.type || user.roleName || user.role;
  return user.isAdmin === true || String(role || "").toLowerCase() === "admin";
};

