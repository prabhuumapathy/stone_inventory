import { Input, Label, Switch } from "@medusajs/ui"
import React from "react"
import type { StoneVendorForm } from "../types"

interface Props {
  form: StoneVendorForm
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  setForm: React.Dispatch<React.SetStateAction<StoneVendorForm>>
}

export const FormFields: React.FC<Props> = ({ form, onChange, setForm }) => (
  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
    {[
      "name",
      "vendor_code",
      "vendor_number",
      "city",
      "state",
      "country",
      "carat",
      "remove_diamond",
      "color",
      "clarity",
      "certificate",
      "sort_order",
    ].map((field) => (
      <div key={field}>
        <Label htmlFor={field}>{field.replace("_", " ")} *</Label>
        <Input
          id={field}
          name={field}
          type={["vendor_number", "carat", "sort_order"].includes(field) ? "number" : "text"}
          value={(form as any)[field]}
          onChange={onChange}
          required
        />
      </div>
    ))}

    <div className="flex items-center gap-3 pt-2">
      <Switch
        checked={form.image_status}
        onCheckedChange={(val) => setForm((f) => ({ ...f, image_status: Boolean(val) }))}
        id="image_status"
      />
      <Label htmlFor="image_status">Image Status *</Label>
    </div>

    <div className="flex items-center gap-3 pt-2">
      <Switch
        checked={form.video_status}
        onCheckedChange={(val) => setForm((f) => ({ ...f, video_status: Boolean(val) }))}
        id="video_status"
      />
      <Label htmlFor="video_status">Video Status *</Label>
    </div>

    <div className="flex items-center gap-3 pt-2 md:col-span-2">
      <Switch
        checked={form.status}
        onCheckedChange={(val) => setForm((f) => ({ ...f, status: Boolean(val) }))}
        id="status"
      />
      <Label htmlFor="status">Active</Label>
    </div>
  </div>
)
