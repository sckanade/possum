import { request } from "./http";

export function getProducts() {
  return request("/products");
}

export function getProduct(productId) {
  return request(`/products/${productId}`);
}

export function createProduct(payload) {
  return request("/products", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateProduct(productId, payload) {
  return request(`/products/${productId}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export function updateProductStock(productId, quantity) {
  return request(`/products/${productId}/stock`, {
    method: "PATCH",
    body: JSON.stringify({ quantity })
  });
}

export function getCategories() {
  return request("/categories");
}

export function createCategory(payload) {
  return request("/categories", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
