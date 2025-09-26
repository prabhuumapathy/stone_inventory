import { sdk } from "../lib/sdk"
import type { StoneVendor, StoneVendorsResponse } from "./types"

/**
 * Helper to keep TS happy with body typing and JSON.
 */
function json<T>(url: string, init?: RequestInit & { query?: Record<string, any> }): Promise<T> {
  const { query, ...rest } = init || {}
  const qs = query ? "?" + new URLSearchParams(query as Record<string, string>).toString() : ""
  return sdk.client.fetch<T>(`${url}${qs}`, rest as any)
}

export const stoneVendorsApi = {
  list: (
    limit: number,
    offset: number,
    search?: string,
    orderBy?: string,
    orderDir?: "asc" | "desc"
  ) =>
    json<StoneVendorsResponse>("/admin/stone_vendor", {
      method: "GET",
      query: {
        limit: String(limit),
        offset: String(offset),
        ...(search ? { q: search } : {}),
        ...(orderBy ? { order_by: orderBy } : {}),
        ...(orderDir ? { order_dir: orderDir } : {}),
      },
    }),

  get: (id: number) =>
    json<{ stone_vendor: StoneVendor }>(`/admin/stone_vendor/${id}`, { method: "GET" }),

  create: (payload: StoneVendor) =>
    json<{ stone_vendor: StoneVendor }>("/admin/stone_vendor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),

  update: (id: number, payload: StoneVendor) =>
    json<{ stone_vendor: StoneVendor }>(`/admin/stone_vendor/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),

  export: (queryParams?: Record<string, any>) =>
    json<Blob>("/admin/stone_vendor/export", {
      method: "GET",
      query: queryParams,
    }),
}
