import { get, patch, post, put, remove } from "../../app/axiosWrapper.js";

export const getAllProducts = async (page = 1, records = 20) =>
  await get(`admin/products?page=${page}&recordPerPage=${records}`);
export const getProductDetails = async (productId) =>
  await get(`admin/products/${productId}`);
export const createProduct = async (product) =>
  await post("admin/products", product);
export const updateProduct = async (productId, product) =>
  await put(`admin/products/${productId}`, product);
export const updateProductsVisibility = async (productIds, showOnShop) =>
  await patch("admin/products/visibility", { productIds, showOnShop });
export const deleteProduct = async (productId) =>
  await remove(`admin/products/${productId}`);
export const exportProducts = async () =>
  await post("admin/products/export", {});
