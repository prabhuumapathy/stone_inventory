import React, { useState } from "react"
import { Button, Drawer, toast } from "@medusajs/ui"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { sdk } from "../../lib/sdk"
import { FormFields } from "./FormFields"
import type { StoneVendorForm } from "../types"

interface Props {
  onSuccess: () => void
  onCancel: () => void
}

export const CreateVendorForm: React.FC<Props> = ({ onSuccess, onCancel }) => {
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

  const queryClient = useQueryClient()

  const isValidForm = (f: StoneVendorForm) =>
    f.name &&
    f.vendor_code &&
    f.vendor_number &&
    f.city &&
    f.state &&
    f.country &&
    f.carat &&
    f.remove_diamond &&
    f.color &&
    f.clarity &&
    f.certificate &&
    f.sort_order

  const createMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        vendor_number: Number(form.vendor_number),
        carat: parseFloat(form.carat),
        sort_order: Number(form.sort_order),
      }
      return sdk.client.fetch(`/admin/stone_vendor`, {
        method: "POST",
        body: payload,
      })
    },
    onSuccess: () => {
      toast.success("Stone vendor created successfully")
      queryClient.invalidateQueries({ queryKey: ["stone_vendors"] })
      onSuccess()
    },
    onError: (err: any) => {
      console.error("Failed to create stone vendor", err)
      toast.error(err?.message || "Failed to create stone vendor.")
    },
  })

  const disabled = !isValidForm(form) || createMutation.isPending

  return (
    <>
      <FormFields form={form} onChange={(e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))} setForm={setForm} />
      <Drawer.Footer>
        <Button variant="secondary" onClick={onCancel} disabled={createMutation.isPending}>
          Cancel
        </Button>
        <Button variant="primary" onClick={() => createMutation.mutate()} disabled={disabled}>
          {createMutation.isPending ? "Creating..." : "Create"}
        </Button>
      </Drawer.Footer>
    </>
  )
}
