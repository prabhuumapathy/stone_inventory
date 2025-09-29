import { Container, Drawer, Toaster } from "@medusajs/ui"
import type { DataTableRowSelectionState } from "@medusajs/ui"
import { useState, useMemo } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { VendorTable } from "./components/VendorTable"
import { CreateVendorForm } from "./components/CreateVendorForm"
import { EditVendorForm } from "./components/EditVendorForm"
import { stoneVendorsApi } from "./api"
import type { StoneVendorImportResponse, StoneVendorsResponse } from "./types"
import { useResourceActions } from "../hooks/useResourceActions"

const DEFAULT_LIMIT = 10
const DEFAULT_SORT_FIELD = "stone_vendor_id" as const
const DEFAULT_SORT_DIRECTION = "desc" as const

type StatusFilterValue = "" | "active" | "inactive"

export const StoneVendorPage: React.FC = () => {
  const [pagination, setPagination] = useState({ pageSize: DEFAULT_LIMIT, pageIndex: 0 })
  const [searchQuery, setSearchQuery] = useState("")
  const [nameFilter, setNameFilter] = useState("")
  const [vendorCodeFilter, setVendorCodeFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>("")
  const [sort, setSort] = useState<{ field: string; direction: "asc" | "desc" }>({
    field: DEFAULT_SORT_FIELD,
    direction: DEFAULT_SORT_DIRECTION,
  })
  const [rowSelection, setRowSelection] = useState<DataTableRowSelectionState>({})

  const pageSize = pagination.pageSize
  const offset = useMemo(
    () => pagination.pageIndex * pagination.pageSize,
    [pagination.pageIndex, pagination.pageSize]
  )
  const queryClient = useQueryClient()

  const sanitizedSearch = searchQuery.trim()
  const sanitizedName = nameFilter.trim()
  const sanitizedVendorCode = vendorCodeFilter.trim()
  const statusParam = statusFilter || undefined

  const selectedVendorIds = useMemo(() => {
    return Object.entries(rowSelection)
      .filter(([, value]) => Boolean(value))
      .map(([key]) => key)
  }, [rowSelection])

  const buildExportUrl = () => {
    const params = new URLSearchParams()
    if (sanitizedSearch) {
      params.set("q", sanitizedSearch)
    }
    if (sanitizedName) {
      params.set("name", sanitizedName)
    }
    if (sanitizedVendorCode) {
      params.set("vendor_code", sanitizedVendorCode)
    }
    if (statusParam) {
      params.set("status", statusParam)
    }
    if (sort.field) {
      params.set("order_by", sort.field)
    }
    if (sort.direction) {
      params.set("order_dir", sort.direction)
    }

    const query = params.toString()
    return `/admin/stone_vendor/export${query ? `?${query}` : ""}`
  }

  const {
    fileInputRef: bulkActionsFileInputRef,
    handleExport,
    handleImportClick,
    handleImportFileChange,
    handleDeleteSelected,
    isDeleting,
    isImporting,
  } = useResourceActions<string, StoneVendorImportResponse>({
    resourceName: "stone vendor",
    resourceNamePlural: "stone vendors",
    queryKey: ["stone_vendors"],
    selectedIds: selectedVendorIds,
    deleteFn: async (ids) => stoneVendorsApi.deleteMany(ids),
    buildExportUrl,
    onClearSelection: () => setRowSelection({}),
    importConfig: {
      importFn: (file, replaceExisting) => stoneVendorsApi.import(file, replaceExisting),
      confirmMessage:
        "Importing this file will delete existing stone vendors not present in the file. Continue?",
      formatResult: (result) => {
        const { success, message, created, updated, deleted, replaced, errors } = result
        const createdLabel = created ? `created ${created}` : ""
        const updatedLabel = updated ? `updated ${updated}` : ""
        const deletedLabel = deleted ? `deleted ${deleted}` : ""
        const detail = [createdLabel, updatedLabel, deletedLabel].filter(Boolean).join(", ")
        const summary = detail ? ` (${detail})` : ""
        const fallbackMessage = replaced
          ? "Stone vendors replaced successfully"
          : "Stone vendors imported successfully"

        let toastType: "success" | "warning" = success ? "success" : "warning"
        let finalMessage = (message || fallbackMessage) + summary

        if (!success && errors?.length) {
          const problemRows = errors
            .slice(0, 5)
            .map((err) => err.row)
            .join(", ")
          finalMessage += ` Problem rows: ${problemRows}${errors.length > 5 ? "..." : ""}`
        }

        return {
          toastType,
          message: finalMessage,
          consoleWarnings: success ? undefined : errors,
        }
      },
    },
  })

  const { data, isLoading } = useQuery<StoneVendorsResponse, Error, StoneVendorsResponse>({
    queryKey: [
      "stone_vendors",
      pageSize,
      offset,
      sanitizedSearch,
      sanitizedName,
      sanitizedVendorCode,
      statusFilter,
      sort.field,
      sort.direction,
    ],
    queryFn: () =>
      stoneVendorsApi.list({
        limit: pageSize,
        offset,
        search: sanitizedSearch || undefined,
        orderBy: sort.field,
        orderDir: sort.direction,
        name: sanitizedName || undefined,
        vendorCode: sanitizedVendorCode || undefined,
        status: statusParam,
      }),
    placeholderData: (previousData) => previousData,
  })

  const handleSearchChange = (value: string) => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
    setSearchQuery(value)
  }

  const handleSortChange = (field: string, direction: "asc" | "desc") => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
    setSort({ field, direction })
  }

  const handleNameFilterChange = (value: string) => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
    setNameFilter(value)
  }

  const handleVendorCodeFilterChange = (value: string) => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
    setVendorCodeFilter(value)
  }

  const handleStatusFilterChange = (value: string) => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
    setStatusFilter(value === "active" || value === "inactive" ? value : "")
  }

  const handleClearFilters = () => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
    setNameFilter("")
    setVendorCodeFilter("")
    setStatusFilter("")
  }

  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)

  const openEdit = (id: string) => {
    setEditId(id)
    setEditOpen(true)
  }

  return (
    <Container className="divide-y p-0">
      <Toaster position="top-right" />
      <input
        ref={bulkActionsFileInputRef}
        type="file"
        accept=".csv"
        style={{ display: "none" }}
        onChange={handleImportFileChange}
      />
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
        onImport={handleImportClick}
        isImporting={isImporting}
        nameFilter={nameFilter}
        vendorCodeFilter={vendorCodeFilter}
        statusFilter={statusFilter}
        onNameFilterChange={handleNameFilterChange}
        onVendorCodeFilterChange={handleVendorCodeFilterChange}
        onStatusFilterChange={handleStatusFilterChange}
        onClearFilters={handleClearFilters}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        selectedCount={selectedVendorIds.length}
        onDeleteSelected={handleDeleteSelected}
        isDeleting={isDeleting}
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
