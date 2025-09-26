import { Container, Drawer, Toaster } from "@medusajs/ui"
import { useState, useMemo } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { VendorTable } from "./components/VendorTable"
import { CreateVendorForm } from "./components/CreateVendorForm"
import { EditVendorForm } from "./components/EditVendorForm"
import { stoneVendorsApi } from "./api"
import type { StoneVendorsResponse } from "./types"

const DEFAULT_LIMIT = 10
const DEFAULT_SORT_FIELD = "stone_vendor_id" as const
const DEFAULT_SORT_DIRECTION = "desc" as const

export const StoneVendorPage: React.FC = () => {
  const [pagination, setPagination] = useState({ pageSize: DEFAULT_LIMIT, pageIndex: 0 })
  const [searchQuery, setSearchQuery] = useState("")
  const [sort, setSort] = useState<{ field: string; direction: "asc" | "desc" }>(
    { field: DEFAULT_SORT_FIELD, direction: DEFAULT_SORT_DIRECTION }
  )
  const pageSize = pagination.pageSize
  const offset = useMemo(
    () => pagination.pageIndex * pagination.pageSize,
    [pagination.pageIndex, pagination.pageSize]
  )
  const queryClient = useQueryClient()

  const sanitizedSearch = searchQuery.trim()

  const { data, isLoading } = useQuery<StoneVendorsResponse, Error, StoneVendorsResponse>({
    queryKey: [
      "stone_vendors",
      pageSize,
      offset,
      sanitizedSearch,
      sort.field,
      sort.direction,
    ],
    queryFn: () =>
      stoneVendorsApi.list(
        pageSize,
        offset,
        sanitizedSearch || undefined,
        sort.field,
        sort.direction
      ),
    placeholderData: (previousData) => previousData,
  })

  const handleExport = async () => {
    const params = new URLSearchParams()
    if (sanitizedSearch) {
      params.set("q", sanitizedSearch)
    }
    if (sort.field) {
      params.set("order_by", sort.field)
    }
    if (sort.direction) {
      params.set("order_dir", sort.direction)
    }

    const query = params.toString()
    const response = await fetch(`/admin/stone_vendor/export${query ? `?${query}` : ""}`, {
      method: "GET",
    })
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "stone_vendors.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleSearchChange = (value: string) => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
    setSearchQuery(value)
  }

  const handleSortChange = (field: string, direction: "asc" | "desc") => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
    setSort({ field, direction })
  }

  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)

  const openEdit = (id: number) => {
    setEditId(id)
    setEditOpen(true)
  }

  return (
    <Container className="divide-y p-0">
      <Toaster position="top-right" />
      <VendorTable
        data={data?.stone_vendors ?? []}
        count={data?.count || 0}
        isLoading={isLoading}
        pagination={pagination}
        setPagination={setPagination}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        sortField={sort.field}
        sortDirection={sort.direction}
        onSortChange={handleSortChange}
        onEdit={openEdit}
        onAdd={() => setCreateOpen(true)}
        onExport={handleExport}
      />

      {/* Create Drawer */}
      <Drawer open={createOpen} onOpenChange={setCreateOpen}>
        <Drawer.Content>
          <CreateVendorForm
            onSuccess={() => {
              setCreateOpen(false)
              queryClient.invalidateQueries({ queryKey: ["stone_vendors"] })
            }}
            onCancel={() => setCreateOpen(false)}
          />
        </Drawer.Content>
      </Drawer>

      {/* Edit Drawer */}
      <Drawer open={editOpen} onOpenChange={setEditOpen}>
        <Drawer.Content>
          <EditVendorForm
            id={editId}
            onClose={() => setEditOpen(false)}
            onSuccess={() => {
              setEditOpen(false)
              queryClient.invalidateQueries({ queryKey: ["stone_vendors"] })
            }}
          />
        </Drawer.Content>
      </Drawer>
    </Container>
  )
}

export default StoneVendorPage
