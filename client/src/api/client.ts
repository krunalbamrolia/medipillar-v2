import { apiRequest } from "@/lib/queryClient";

export async function request<T>(
  method: string,
  url: string,
  data?: unknown
): Promise<T> {
  const res = await apiRequest(method, url, data);
  if (res.status === 204) {
    return {} as T;
  }
  return res.json();
}

export const client = {
  get: <T>(url: string) => request<T>("GET", url),
  post: <T>(url: string, data?: unknown) => request<T>("POST", url, data),
  patch: <T>(url: string, data?: unknown) => request<T>("PATCH", url, data),
  put: <T>(url: string, data?: unknown) => request<T>("PUT", url, data),
  delete: <T>(url: string) => request<T>("DELETE", url),
};
