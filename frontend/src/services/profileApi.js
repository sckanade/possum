import { request } from "./http";

export function getProfile() {
  return request("/profile");
}

export function upsertProfile(payload) {
  return request("/profile", {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export function changePassword(payload) {
  return request("/profile/password", {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}
