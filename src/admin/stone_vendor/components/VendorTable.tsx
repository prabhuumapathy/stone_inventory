import React from "react"
import type { StoneVendor } from "../types"
import {
  Button,
  DataTable,
  DataTablePaginationState,
  DropdownMenu,
  Heading,
  Input,
  createDataTableColumnHelper,
  useDataTable,
} from "@medusajs/ui"
import { ArrowUpDown } from "@medusajs/icons"

const columnHelper = createDataTableColumnHelper<StoneVendor>()

interface Props {
  data: StoneVendor[]
  count: number
  isLoading: boolean
  pagination: DataTablePaginationState
  setPagination: (p: DataTablePaginationState) => void
  searchQuery: string
  onSearchChange: (value: string) => void
  sortField: string
  sortDirection: "asc" | "desc"
  onSortChange: (field: string, direction: "asc" | "desc") => void
  onEdit: (id: number) => void
  onAdd: () => void
  onExport: () => void
}

export const VendorTable: React.FC<Props> = ({
  data,
  count,
  isLoading,
  pagination,
  setPagination,
  searchQuery,
  onSearchChange,
  sortField,
  sortDirection,
  onSortChange,
  onEdit,
  onAdd,
  onExport,
}) => {
  const sortableColumns = [
    { value: "stone_vendor_id", label: "ID" },
    { value: "name", label: "Name" },
    { value: "vendor_code", label: "Vendor Code" },
    { value: "vendor_number", label: "Vendor Number" },
    { value: "city", label: "City" },
    { value: "state", label: "State" },
    { value: "country", label: "Country" },
    { value: "status", label: "Status" },
  ]

  const activeSort = sortableColumns.find((col) => col.value === sortField)
  const directionLabel = sortDirection === "asc" ? "↑" : "↓"

  const buildColumns = () => [
    columnHelper.accessor("stone_vendor_id", { header: "ID" }),
    columnHelper.accessor("name", { header: "Name" }),
    columnHelper.accessor("vendor_code", { header: "Vendor Code" }),
    columnHelper.accessor("vendor_number", { header: "Vendor Number" }),
    columnHelper.accessor("city", { header: "City" }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: ({ getValue }) => (getValue() ? "Active" : "Inactive"),
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button
          size="small"
          variant="secondary"
          onClick={() => onEdit(row.original.stone_vendor_id)}
        >
          Edit
        </Button>
      ),
    }),
  ]

  const table = useDataTable({
    columns: buildColumns(),
    data,
    getRowId: (row) => row.stone_vendor_id.toString(),
    rowCount: count,
    isLoading,
    pagination: { state: pagination, onPaginationChange: setPagination },
  })

  return (
    <DataTable instance={table}>
      {/* Toolbar */}
      <DataTable.Toolbar className="flex items-center justify-between">
        <Heading>Stone Vendors</Heading>
        <div className="flex gap-2">
          <Button size="base" variant="secondary" onClick={onExport}>
            Export
          </Button>
          <Button size="base" variant="secondary">
            Import
          </Button>
          <Button size="base" variant="primary" onClick={onAdd}>
            Create
          </Button>
        </div>
      </DataTable.Toolbar>

      {/* Search + Sort */}
      <div className="divide-y border rounded">
        <div className="flex items-start justify-between gap-x-4 px-6 py-4">
          <Button size="base" variant="secondary">
            Add filter
          </Button>
          <div className="flex items-center gap-3">
            <Input
              placeholder="Search keyword"
              id="input-id"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            <DropdownMenu>
              <DropdownMenu.Trigger asChild>
                <Button size="base" variant="secondary">
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  {activeSort ? `${activeSort.label}` : "Sort"} {directionLabel}
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content align="end" className="min-w-[220px]">
                <DropdownMenu.Label>Sort by</DropdownMenu.Label>
                <DropdownMenu.RadioGroup
                  value={sortField}
                  onValueChange={(value) => onSortChange(value, sortDirection)}
                >
                  {sortableColumns.map((col) => (
                    <DropdownMenu.RadioItem key={col.value} value={col.value}>
                      {col.label}
                    </DropdownMenu.RadioItem>
                  ))}
                </DropdownMenu.RadioGroup>
                <DropdownMenu.Separator />
                <DropdownMenu.Label>Direction</DropdownMenu.Label>
                <DropdownMenu.RadioGroup
                  value={sortDirection}
                  onValueChange={(value) =>
                    onSortChange(sortField, value as "asc" | "desc")
                  }
                >
                  <DropdownMenu.RadioItem value="asc">Ascending</DropdownMenu.RadioItem>
                  <DropdownMenu.RadioItem value="desc">Descending</DropdownMenu.RadioItem>
                </DropdownMenu.RadioGroup>
              </DropdownMenu.Content>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Table */}
      <DataTable.Table />
      <DataTable.Pagination />
    </DataTable>
  )
}
