import React from "react"
import type { StoneVendor } from "../types"
import {
  Button,
  Checkbox,
  DataTable,
  DataTablePaginationState,
  DropdownMenu,
  Heading,
  Input,
  createDataTableColumnHelper,
  useDataTable,
} from "@medusajs/ui"
import type { DataTableRowSelectionState } from "@medusajs/ui"
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
  onEdit: (id: string) => void
  onAdd: () => void
  onExport: () => void
  onImport: () => void
  isImporting?: boolean
  nameFilter: string
  vendorCodeFilter: string
  statusFilter: string
  onNameFilterChange: (value: string) => void
  onVendorCodeFilterChange: (value: string) => void
  onStatusFilterChange: (value: string) => void
  onClearFilters: () => void
  rowSelection: DataTableRowSelectionState
  onRowSelectionChange: (state: DataTableRowSelectionState) => void
  selectedCount: number
  onDeleteSelected: () => void
  isDeleting?: boolean
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
  onImport,
  isImporting = false,
  nameFilter,
  vendorCodeFilter,
  statusFilter,
  onNameFilterChange,
  onVendorCodeFilterChange,
  onStatusFilterChange,
  onClearFilters,
  rowSelection,
  onRowSelectionChange,
  selectedCount,
  onDeleteSelected,
  isDeleting = false,
}) => {
  const sortableColumns = [
    
    { value: "name", label: "Name" },
    { value: "vendor_code", label: "Vendor Code" },
    { value: "vendor_number", label: "Vendor Number" },
    { value: "city", label: "City" },
    { value: "state", label: "State" },
    { value: "country", label: "Country" },  
    { value: "status", label: "Status" },
  ]

  const activeSort = sortableColumns.find((col) => col.value === sortField)
  const directionLabel = sortDirection === "asc" ? "Asc" : "Desc"
  const statusLabel =
    statusFilter === "active"
      ? "Active"
      : statusFilter === "inactive"
        ? "Inactive"
        : "All statuses"
  const hasActiveFilters = Boolean(
    nameFilter.trim() || vendorCodeFilter.trim() || statusFilter
  )

  const buildColumns = () => [
    columnHelper.display({
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsSomePageRowsSelected()
              ? "indeterminate"
              : table.getIsAllPageRowsSelected()
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(Boolean(value))}
          aria-label="Select all stone vendors"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(Boolean(value))}
          onClick={(event) => event.stopPropagation()}
          aria-label={`Select stone vendor ${row.original.stone_vendor_id}`}
        />
      ),
      meta: {
        size: 36,
      },
    }),
   
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

  const tableCommands = React.useMemo(
    () => [
      {
        label: isDeleting ? "Deleting..." : "Delete",
        shortcut: "⌫",
        action: () => {
          if (!selectedCount || isDeleting) {
            return
          }
          onDeleteSelected()
        },
      },
    ],
    [isDeleting, onDeleteSelected, selectedCount]
  )

  const table = useDataTable({
    columns: buildColumns(),
    data,
    getRowId: (row) => row.stone_vendor_id,
    rowCount: count,
    isLoading,
    pagination: { state: pagination, onPaginationChange: setPagination },
    rowSelection: {
      state: rowSelection,
      onRowSelectionChange,
      enableRowSelection: true,
    },
    commands: tableCommands,
  })

  return (
    <DataTable instance={table}>
      {/* Toolbar */}
      <DataTable.Toolbar className="flex items-center justify-between">
        <Heading>Stone Vendors</Heading>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="base" variant="secondary" onClick={onExport}>
            Export
          </Button>
          <Button
            size="base"
            variant="secondary"
            onClick={onImport}
            disabled={isImporting}
          >
            {isImporting ? "Importing..." : "Import"}
          </Button>
          <Button
            size="base"
            variant="primary"
            onClick={onAdd}
          >
            Create
          </Button>
        </div>
      </DataTable.Toolbar>

      <div className="divide-y border rounded">
        <div className="flex flex-wrap items-center gap-3 px-6 py-4">
          <Input
            placeholder="Filter by name"
            value={nameFilter}
            onChange={(e) => onNameFilterChange(e.target.value)}
            className="w-full sm:w-56"
          />
          <Input
            placeholder="Filter by vendor code"
            value={vendorCodeFilter}
            onChange={(e) => onVendorCodeFilterChange(e.target.value)}
            className="w-full sm:w-56"
          />
          <DropdownMenu>
            <DropdownMenu.Trigger asChild>
              <Button size="base" variant="secondary">
                Status: {statusLabel}
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content align="start" className="min-w-[180px]">
              <DropdownMenu.Label>Status</DropdownMenu.Label>
              <DropdownMenu.RadioGroup
                value={statusFilter || "all"}
                onValueChange={(value) =>
                  onStatusFilterChange(value === "all" ? "" : value)
                }
              >
                <DropdownMenu.RadioItem value="all">All statuses</DropdownMenu.RadioItem>
                <DropdownMenu.RadioItem value="active">Active</DropdownMenu.RadioItem>
                <DropdownMenu.RadioItem value="inactive">Inactive</DropdownMenu.RadioItem>
              </DropdownMenu.RadioGroup>
            </DropdownMenu.Content>
          </DropdownMenu>
          {hasActiveFilters && (
            <Button size="base" variant="secondary" onClick={onClearFilters}>
              Clear filters
            </Button>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-end gap-3 px-6 py-4">
          <Input
            placeholder="Search keyword"
            id="input-id"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full sm:w-60"
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
        <DataTable.Table />
      </div>

      <DataTable.CommandBar selectedLabel={(count) => `${count} selected`} />

      <div className="mt-4">
        <DataTable.Pagination />
      </div>
    </DataTable>
  )
}
