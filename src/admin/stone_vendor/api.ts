import { sdk } from "../lib/sdk"
import type {
  StoneVendor,
  StoneVendorsResponse,
  StoneVendorImportResponse,
} from "./types"

type JsonRequestInit = Omit<RequestInit, "body"> & {
  body?: unknown
  query?: Record<string, any>
}

/**
 * Helper to keep TS happy with body typing and JSON.
 */
function json<T>(url: string, init?: JsonRequestInit): Promise<T> {
  const { query, ...rest } = init || {}
  const qs = query ? "?" + new URLSearchParams(query as Record<string, string>).toString() : ""
  return sdk.client.fetch<T>(`${url}${qs}`, rest as any)
}

export const stoneVendorsApi = {
  list: ({
    limit,
    offset,
    search,
    orderBy,
    orderDir,
    name,
    vendorCode,
    status,
  }: {
    limit: number
    offset: number
    search?: string
    orderBy?: string
    orderDir?: "asc" | "desc"
    name?: string
    vendorCode?: string
    status?: string
  }) => {
    const query: Record<string, string> = {
      limit: String(limit),
      offset: String(offset),
    }

    if (search) {
      query.q = search
    }
    if (orderBy) {
      query.order_by = orderBy
    }
    if (orderDir) {
      query.order_dir = orderDir
    }
    if (name) {
      query.name = name
    }
    if (vendorCode) {
      query.vendor_code = vendorCode
    }
    if (status) {
      query.status = status
    }

    return json<StoneVendorsResponse>("/admin/stone_vendor", {
      method: "GET",
      query,
    })
  },

  get: (id: string) =>
    json<{ stone_vendor: StoneVendor }>(`/admin/stone_vendor/${id}`, { method: "GET" }),

  create: (payload: StoneVendor) =>
    json<{ stone_vendor: StoneVendor }>("/admin/stone_vendor", {
      method: "POST",
      body: payload,
    }),

  update: (id: string, payload: StoneVendor) =>
    json<{ stone_vendor: StoneVendor }>(`/admin/stone_vendor/${id}`, {
      method: "PUT",
      body: payload,
    }),

  export: (queryParams?: Record<string, any>) =>
    json<Blob>("/admin/stone_vendor/export", {
      method: "GET",
      query: queryParams,
    }),

  deleteMany: (ids: Array<number | string>) =>
    json<{ success: boolean; deleted: number; ids: string[] }>("/admin/stone_vendor", {
      method: "DELETE",
      body: { ids },
    }),

  import: async (file: File, replaceExisting = false) => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("replace", replaceExisting ? "true" : "false")

    const response = await fetch("/admin/stone_vendor/import", {
      method: "POST",
      body: formData,
      credentials: "same-origin",
    })

    if (!response.ok && response.status !== 207) {
      throw response
    }

    return response.json() as Promise<StoneVendorImportResponse>
  },
}






