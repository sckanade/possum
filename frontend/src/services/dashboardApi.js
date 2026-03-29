import { request } from "./http";

export function getTodaySales() {
  return request("/dashboard/today");
}

export function getWeeklySales() {
  return request("/dashboard/weekly");
}

export function getForecast() {
  return request("/dashboard/forecast");
}
