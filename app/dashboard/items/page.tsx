"use client"

import { useEffect, useState } from "react"
import { DashboardHeaderWithBreadcrumb } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Package2,
  Search,
  Pencil,
  Trash2,
  Plus,
  X,
  AlertCircle
} from "lucide-react"

/* ================= FULL TYPE ================= */
type Item = {
  id: string
  partNo: string
  description: string
  computerName: string
  lotNo?: string | null
  hardness: string
  color: string
  materialName: string
  quantity: number
  binQuantity?: number | null
  unit?: string | null
  netWeight: number
  netWeightUnit?: string | null
  grossWeight: number
  grossWeightUnit?: string | null
  binNetWeight?: number | null
  binNetWeightUnit?: string | null
  binGrossWeight?: number | null
  binGrossWeightUnit?: string | null
  inspector?: string | null
}

/* ================= INPUT COMPONENT ================= */
function InputField({ label, keyName, type = "text", fullWidth = false, value, onChange }: any) {
  return (
    <div className={`space-y-2 ${fullWidth ? 'col-span-full' : ''}`}>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        value={value ?? ""}
        onChange={onChange}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-colors"
      />
    </div>
  )
}

/* ================= SECTION COMPONENT ================= */
function Section({ title, description, children }: any) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
      </div>
      {children}
    </div>
  )
}

/* ================= MAIN ================= */
export default function ItemsPage() {

  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [creatingItem, setCreatingItem] = useState(false)

  const [formData, setFormData] = useState<Partial<Item>>({})

  /* ================= DEBOUNCE ================= */
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(timer)
  }, [search])

  /* ================= FETCH ================= */
  const fetchItems = async () => {
    try {
      setLoading(true)

      const res = await fetch(
        `/api/items${
          debouncedSearch ? `?search=${encodeURIComponent(debouncedSearch)}` : ""
        }`
      )

      const data = await res.json()
      setItems(Array.isArray(data) ? data : [])

    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [debouncedSearch])

  /* ================= DELETE ================= */
  const handleDelete = async (id: string) => {
    if (!confirm("Yakin hapus item ini?")) return
    await fetch(`/api/items/${id}`, { method: "DELETE" })
    fetchItems()
  }

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {

    const method = editingItem ? "PUT" : "POST"
    const url = editingItem
      ? `/api/items/${editingItem.id}`
      : "/api/items"

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    })

    if (!res.ok) return alert("Gagal simpan")

    setEditingItem(null)
    setCreatingItem(false)
    setFormData({})
    fetchItems()
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      <div className="max-w-[1500px] mx-auto space-y-6">

        {/* ================= HEADER ================= */}
        <DashboardHeaderWithBreadcrumb
          heading="Item Master"
          text="Enterprise Manufacturing Item System"
          icon={Package2}
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Item Master" }
          ]}
        >
          <Button
            className="bg-emerald-600 text-white"
            onClick={() => {
              setCreatingItem(true)
              setFormData({})
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Item
          </Button>
        </DashboardHeaderWithBreadcrumb>

        {/* ================= SEARCH ================= */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex gap-3 items-center">
            <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <Input
              placeholder="Search by part number, material, or computer name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-0 bg-transparent focus-visible:ring-0 text-base"
            />
          </CardContent>
        </Card>

        {/* ================= TABLE ================= */}
        <Card className="overflow-auto border-0 shadow-sm">
          <CardContent className="p-0">

            {loading ? (
              <div className="p-12 text-center text-gray-500">
                <div className="text-base">Loading inventory items...</div>
              </div>
            ) : items.length === 0 ? (
              <div className="p-12 text-center">
                <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <div className="text-gray-500">No items found</div>
                <div className="text-sm text-gray-400 mt-1">Create a new item to get started</div>
              </div>
            ) : (

              <table className="w-full text-sm">

                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 text-xs font-semibold text-gray-700 border-b border-gray-200">
                  <tr>
                    <th className="p-4 text-left">Item Information</th>
                    <th className="p-4 text-left">Specifications</th>
                    <th className="p-4 text-center">Quantity</th>
                    <th className="p-4 text-left">Weight</th>
                    <th className="p-4 text-left">Bin Details</th>
                    <th className="p-4 text-center">Inspector</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>

                  {items.map((item, index) => (

                    <tr key={item.id} className={`border-b transition-colors hover:bg-blue-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} align-top`}>

                      {/* ITEM */}
                      <td className="p-4 space-y-1">
                        <div className="font-semibold text-gray-900">{item.partNo}</div>
                        <div className="text-sm text-gray-600">{item.description}</div>
                        <div className="text-xs text-gray-500">{item.computerName}</div>
                        {item.lotNo && <Badge className="mt-2 bg-blue-100 text-blue-800">{item.lotNo}</Badge>}
                      </td>

                      {/* SPEC */}
                      <td className="p-4 space-y-2">
                        <Badge className="block w-fit bg-emerald-100 text-emerald-800">{item.materialName}</Badge>
                        <div className="flex gap-2 flex-wrap">
                          <Badge className="bg-slate-200 text-slate-800">{item.hardness}</Badge>
                          <Badge className="bg-gray-200 text-gray-800">{item.color}</Badge>
                        </div>
                      </td>

                      {/* QTY */}
                      <td className="p-4 text-center">
                        <div className="font-semibold text-gray-900 text-base">{item.quantity}</div>
                        <div className="text-xs text-gray-500">{item.unit || "—"}</div>
                      </td>

                      {/* WEIGHT */}
                      <td className="p-4 text-sm space-y-1 text-gray-600">
                        <div>Net: <span className="font-medium">{item.netWeight} {item.netWeightUnit}</span></div>
                        <div>Gross: <span className="font-medium">{item.grossWeight} {item.grossWeightUnit}</span></div>
                      </td>

                      {/* BIN */}
                      <td className="p-4 text-sm space-y-1 text-gray-600">
                        <div>Qty: <span className="font-medium">{item.binQuantity || "—"}</span></div>
                        <div>Net: <span className="font-medium">{item.binNetWeight || "—"}</span></div>
                        <div>Gross: <span className="font-medium">{item.binGrossWeight || "—"}</span></div>
                      </td>

                      {/* INSPECTOR */}
                      <td className="p-4 text-center text-gray-700">{item.inspector || "—"}</td>

                      {/* ACTION */}
                      <td className="p-4 flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="hover:bg-blue-50 hover:text-blue-600"
                          onClick={() => {
                            setEditingItem(item)
                            setFormData(item)
                          }}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          className="hover:bg-red-50 hover:text-red-600 text-red-600"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            )}

          </CardContent>
        </Card>

        {/* ================= MODAL ================= */}
        {(creatingItem || editingItem) && (

          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-hidden">

            <div className="bg-white w-full max-w-4xl rounded-lg shadow-2xl h-[90vh] flex flex-col overflow-hidden">

              {/* HEADER */}
              <div className="sticky top-0 bg-white border-b px-8 py-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingItem ? "Edit Item Details" : "Create New Item"}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {editingItem ? "Update the item information below" : "Enter the item details to add to inventory"}
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => {
                    setCreatingItem(false)
                    setEditingItem(null)
                  }}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* FORM */}
              <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8">

                {/* BASIC INFO */}
                <Section title="Basic Information" description="Part number, description, and identification details">
                  <div className="grid grid-cols-2 gap-4">
                    <InputField 
                      label="Part Number *" 
                      keyName="partNo"
                      value={formData.partNo}
                      onChange={(e: any) => setFormData({ ...formData, partNo: e.target.value })}
                    />
                    <InputField 
                      label="Lot Number" 
                      keyName="lotNo"
                      value={formData.lotNo}
                      onChange={(e: any) => setFormData({ ...formData, lotNo: e.target.value })}
                    />
                    <InputField 
                      label="Description" 
                      keyName="description" 
                      fullWidth
                      value={formData.description}
                      onChange={(e: any) => setFormData({ ...formData, description: e.target.value })}
                    />
                    <InputField 
                      label="Computer Name" 
                      keyName="computerName"
                      value={formData.computerName}
                      onChange={(e: any) => setFormData({ ...formData, computerName: e.target.value })}
                    />
                  </div>
                </Section>

                {/* SPECIFICATIONS */}
                <Section title="Product Specifications" description="Material properties and characteristics">
                  <div className="grid grid-cols-3 gap-4">
                    <InputField 
                      label="Material Name" 
                      keyName="materialName"
                      value={formData.materialName}
                      onChange={(e: any) => setFormData({ ...formData, materialName: e.target.value })}
                    />
                    <InputField 
                      label="Hardness" 
                      keyName="hardness"
                      value={formData.hardness}
                      onChange={(e: any) => setFormData({ ...formData, hardness: e.target.value })}
                    />
                    <InputField 
                      label="Color" 
                      keyName="color"
                      value={formData.color}
                      onChange={(e: any) => setFormData({ ...formData, color: e.target.value })}
                    />
                  </div>
                </Section>

                {/* QUANTITY */}
                <Section title="Quantity Information" description="Main and bin quantity details">
                  <div className="grid grid-cols-3 gap-4">
                    <InputField 
                      label="Primary Quantity" 
                      keyName="quantity" 
                      type="number"
                      value={formData.quantity}
                      onChange={(e: any) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    />
                    <InputField 
                      label="Unit of Measure" 
                      keyName="unit"
                      value={formData.unit}
                      onChange={(e: any) => setFormData({ ...formData, unit: e.target.value })}
                    />
                    <InputField 
                      label="Bin Quantity" 
                      keyName="binQuantity" 
                      type="number"
                      value={formData.binQuantity}
                      onChange={(e: any) => setFormData({ ...formData, binQuantity: Number(e.target.value) })}
                    />
                  </div>
                </Section>

                {/* WEIGHT */}
                <Section title="Weight & Measurements" description="Net and gross weight information">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <InputField 
                        label="Net Weight (Value)" 
                        keyName="netWeight" 
                        type="number"
                        value={formData.netWeight}
                        onChange={(e: any) => setFormData({ ...formData, netWeight: Number(e.target.value) })}
                      />
                      <InputField 
                        label="Net Weight (Unit)" 
                        keyName="netWeightUnit"
                        value={formData.netWeightUnit}
                        onChange={(e: any) => setFormData({ ...formData, netWeightUnit: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <InputField 
                        label="Gross Weight (Value)" 
                        keyName="grossWeight" 
                        type="number"
                        value={formData.grossWeight}
                        onChange={(e: any) => setFormData({ ...formData, grossWeight: Number(e.target.value) })}
                      />
                      <InputField 
                        label="Gross Weight (Unit)" 
                        keyName="grossWeightUnit"
                        value={formData.grossWeightUnit}
                        onChange={(e: any) => setFormData({ ...formData, grossWeightUnit: e.target.value })}
                      />
                    </div>
                  </div>
                </Section>

                {/* BIN WEIGHT */}
                <Section title="Bin Weight Details" description="Weight information for bin storage">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <InputField 
                        label="Bin Net Weight (Value)" 
                        keyName="binNetWeight" 
                        type="number"
                        value={formData.binNetWeight}
                        onChange={(e: any) => setFormData({ ...formData, binNetWeight: Number(e.target.value) })}
                      />
                      <InputField 
                        label="Bin Net Weight (Unit)" 
                        keyName="binNetWeightUnit"
                        value={formData.binNetWeightUnit}
                        onChange={(e: any) => setFormData({ ...formData, binNetWeightUnit: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <InputField 
                        label="Bin Gross Weight (Value)" 
                        keyName="binGrossWeight" 
                        type="number"
                        value={formData.binGrossWeight}
                        onChange={(e: any) => setFormData({ ...formData, binGrossWeight: Number(e.target.value) })}
                      />
                      <InputField 
                        label="Bin Gross Weight (Unit)" 
                        keyName="binGrossWeightUnit"
                        value={formData.binGrossWeightUnit}
                        onChange={(e: any) => setFormData({ ...formData, binGrossWeightUnit: e.target.value })}
                      />
                    </div>
                  </div>
                </Section>

                {/* QUALITY CONTROL */}
                <Section title="Quality Control" description="Inspector and verification information">
                  <InputField 
                    label="Inspector Name" 
                    keyName="inspector"
                    value={formData.inspector}
                    onChange={(e: any) => setFormData({ ...formData, inspector: e.target.value })}
                  />
                </Section>

              </div>

              {/* FOOTER */}
              <div className="sticky bottom-0 bg-gray-50 border-t px-8 py-4 flex justify-end gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setCreatingItem(false)
                    setEditingItem(null)
                  }}
                >
                  Cancel
                </Button>
                <Button className="bg-emerald-600 text-white hover:bg-emerald-700" onClick={handleSubmit}>
                  {editingItem ? "Update Item" : "Create Item"}
                </Button>
              </div>

            </div>

          </div>

        )}

      </div>
    </div>
  )
}
