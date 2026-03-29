import { request } from "./http";

export function getSales() {
  return request("/sales");
}

export function createSale(payload) {
  return request("/sales", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
