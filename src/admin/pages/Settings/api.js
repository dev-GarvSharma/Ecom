import { get, post, put } from "../../app/axiosWrapper.js";

export const getStoreSettings = async () => await get("admin/settings");
export const saveStoreSettings = async (settings) =>
  await put("admin/settings", settings);
export const requestPasswordReset = async () =>
  await post("admin/settings/password-reset", {});
