import React, { useState, useEffect } from "react"
import { Button, Drawer, toast } from "@medusajs/ui"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { sdk } from "../../lib/sdk"
import { FormFields } from "./FormFields"
import type { StoneVendorForm } from "../types"

interface Props {
  id: string | null
  onClose: () => void
  onSuccess: () => void
}

export const EditVendorForm: React.FC<Props> = ({ id, onClose, onSuccess }) => {
  const queryClient = useQueryClient()
  const { data } = useQuery<{ stone_vendor: any }>({
    queryKey: ["stone_vendor", id],
    enabled: Boolean(id),
    queryFn: () => sdk.client.fetch(`/admin/stone_vendor/${id}`),
  })

  const [form, setForm] = useState<StoneVendorForm>({
    name: "",
    vendor_code: "",
    vendor_number: "",
    city: "",
    state: "",
    country: "",
    carat: "",
    remove_diamond: "",
    color: "",
    clarity: "",
    certificate: "",
    sort_order: "",
    image_status: false,
    video_status: false,
    status: true,
  })

  useEffect(() => {
    if (data?.stone_vendor) {
      const v = data.stone_vendor
      setForm({
        name: v.name ?? "",
        vendor_code: v.vendor_code ?? "",
        vendor_number: v.vendor_number !== undefined ? String(v.vendor_number) : "",
        city: v.city ?? "",
        state: v.state ?? "",
        country: v.country ?? "",
        carat: v.carat !== undefined ? String(v.carat) : "",
        remove_diamond: v.remove_diamond ?? "",
        color: v.color ?? "",
        clarity: v.clarity ?? "",
        certificate: v.certificate ?? "",
        sort_order: v.sort_order !== undefined ? String(v.sort_order) : "",
        image_status: Boolean(v.image_status),
        video_status: Boolean(v.video_status),
        status: Boolean(v.status),
      })
    }
  }, [data])

  const isValidForm = (f: StoneVendorForm) =>
    Boolean(f.name && f.vendor_code && f.vendor_number && f.sort_order)

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!id) return

      const vendorNumber = Number(form.vendor_number)
      const sortOrder = Number(form.sort_order)
      if (Number.isNaN(vendorNumber) || Number.isNaN(sortOrder)) {
        throw new Error("Vendor number and sort order must be numeric values.")
      }

      const payload = {
        name: form.name,
        vendor_code: form.vendor_code,
        vendor_number: vendorNumber,
        city: form.city,
        state: form.state,
        country: form.country,
        carat: form.carat,
        remove_diamond: form.remove_diamond,
        color: form.color,
        clarity: form.clarity,
        certificate: form.certificate,
        sort_order: sortOrder,
        image_status: form.image_status,
        video_status: form.video_status,
        status: form.status,
      }

      return sdk.client.fetch(`/admin/stone_vendor/${id}`, {
        method: "PUT",
        body: payload,
      })
    },
    onSuccess: (response: any) => {
      const message = response?.message || "Updated"
      toast.success(message)
      queryClient.invalidateQueries({ queryKey: ["stone_vendors"] })
      if (id) queryClient.invalidateQueries({ queryKey: ["stone_vendor", id] })
      onSuccess()
    },
    onError: (err: any) => {
      console.error("Failed to update stone vendor", err)
      toast.error(err?.message || "Failed to update stone vendor.")
    },
  })

  if (!id) return null
  const disabled = !isValidForm(form) || updateMutation.isPending

  return (
    <>
      <FormFields form={form} onChange={(e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))} setForm={setForm} />
      <Drawer.Footer>
        <Button variant="secondary" onClick={onClose} disabled={updateMutation.isPending}>
          Cancel
        </Button>
        <Button variant="primary" onClick={() => updateMutation.mutate()} disabled={disabled}>
          {updateMutation.isPending ? "Saving..." : "Save changes"}
        </Button>
      </Drawer.Footer>
    </>
  )
}
