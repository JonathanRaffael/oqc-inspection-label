"use client"

import type React from "react"
import { useState, useRef, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useReactToPrint } from "react-to-print"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { BinPaletPrintLayout } from "./bin-palet-print-layout"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trash2, Eye, Loader2, Copy, RotateCcw } from "lucide-react"

interface BinLabelData {
  partDescription: string
  partNo: string
  computerNo: string
  lotNo: string
  hardness: string
  color: string
  materialName: string
  date: string
  quantity: string
  quantityUnit: string
  netWeight: string
  netWeightUnit: string
  grossWeight: string
  grossWeightUnit: string
  inspector: string
  showVulcanization: boolean
  labelQuantity: number
}

interface PaletLabelData {
  partNo: string // di palet: ini dipakai sebagai "Computer Name" (input)
  productName: string
  doNo: string
  poNo: string
  qty: string
  qtyUnit: string
  package: string
  date: string
  labelQuantity: number
}

interface BinFormData {
  partDescription: string
  partNo: string
  computerNo: string
  lotNo: string
  hardness: string
  color: string
  materialName: string
  date: string
  quantity: string
  quantityUnit: string
  netWeight: string
  netWeightUnit: string
  grossWeight: string
  grossWeightUnit: string
  inspector: string
}

interface PaletFormData {
  partNo: string // di palet: di-label sebagai "Computer Name"
  productName: string
  doNo: string
  poNo: string
  qty: string
  qtyUnit: string
  package: string
  date: string
}

interface Template {
  id: string
  name: string
  type: string
  data: any
  createdAt: string
}

interface BinPaletFormProps {
  label?: any
  type: "bin" | "palet"
  templates?: Template[]
}

export function BinPaletForm({ label, type, templates: initialTemplates = [] }: BinPaletFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isPrintLoading, setIsPrintLoading] = useState(false)
  const [showVulcanization, setShowVulcanization] = useState(label?.showVulcanization || false)
  const [templateName, setTemplateName] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [templates, setTemplates] = useState<Template[]>(initialTemplates)
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false)

  // Max labels per page (individual copies)
  const maxLabels = type === "bin" ? 6 : 4
  const [labelList, setLabelList] = useState<(BinLabelData | PaletLabelData)[]>([])
  const [previewIndex, setPreviewIndex] = useState<number | null>(null)
  const [labelQuantity, setLabelQuantity] = useState(1)

  // Form data (dinamis by type)
  const [formData, setFormData] = useState(() => {
    if (type === "palet") {
      return {
        partNo: label?.partNo || "",
        productName: label?.productName || "",
        // ⬇⬇ DO No auto prefixed HTMF-
        doNo: label?.doNo || "HTMF-",
        poNo: label?.poNo || "",
        qty: label?.qty || "",
        qtyUnit: label?.unit || "",
        package: label?.package || "",
        date: label?.date || "",
      } as PaletFormData
    } else {
      return {
        partDescription: label?.partDescription || "",
        partNo: label?.partNo || "",
        computerNo: label?.computerNo || "",
        lotNo: label?.lotNo || "",
        hardness: label?.hardness || "",
        color: label?.color || "",
        materialName: label?.materialName || "",
        date: label?.date || "",
        quantity: label?.quantity || "",
        quantityUnit: label?.unit || "",
        netWeight: label?.netWeight || "",
        netWeightUnit: label?.netWeightUnit || "",
        grossWeight: label?.grossWeight || "",
        grossWeightUnit: label?.grossWeightUnit || "",
        inspector: label?.inspector || "",
      } as BinFormData
    }
  })

  const componentRef = useRef<HTMLDivElement>(null)

  // Load templates on component mount / type change
  useEffect(() => {
    loadTemplates()
  }, [type])

  const loadTemplates = async () => {
    setIsLoadingTemplates(true)
    try {
      const response = await fetch("/api/templates")
      if (response.ok) {
        const allTemplates = await response.json()
        const filteredTemplates = allTemplates.filter((t: Template) => t.type === type)
        setTemplates(filteredTemplates)
      }
    } catch (error) {
      console.error("Error loading templates:", error)
    } finally {
      setIsLoadingTemplates(false)
    }
  }

  // Preload images for print
  const preloadImages = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      const imageUrls = ["/images/vulcanization.png", "/images/rohs-ok.png", "/images/oqc-passed.png"]

      let loadedCount = 0

      const checkComplete = () => {
        if (loadedCount === imageUrls.length) {
          resolve()
        }
      }

      if (imageUrls.length === 0) {
        resolve()
        return
      }

      imageUrls.forEach((url) => {
        const img = document.createElement("img")
        img.crossOrigin = "anonymous"

        img.onload = () => {
          loadedCount++
          checkComplete()
        }

        img.onerror = () => {
          console.warn(`Failed to load image: ${url}`)
          loadedCount++
          checkComplete()
        }

        img.src = url
      })

      setTimeout(() => {
        if (loadedCount < imageUrls.length) {
          console.warn("Image preloading timeout")
          resolve()
        }
      }, 10000)
    })
  }, [])

  // Save print history (respect labelQuantity)
  const savePrintHistory = async (labels: (BinLabelData | PaletLabelData)[]) => {
    try {
      const printHistoryData = labels.flatMap((label) =>
        Array(label.labelQuantity)
          .fill(null)
          .map(() => ({
            labelType: type,
            labelCount: 1,
            partNo: label.partNo,
            partDescription: type === "bin" ? (label as BinLabelData).partDescription : undefined,
            productName: type === "palet" ? (label as PaletLabelData).productName : undefined,
            computerNo: type === "bin" ? (label as BinLabelData).computerNo : undefined,
            lotNo: type === "bin" ? (label as BinLabelData).lotNo : undefined,
            hardness: type === "bin" ? (label as BinLabelData).hardness : undefined,
            color: type === "bin" ? (label as BinLabelData).color : undefined,
            materialName: type === "bin" ? (label as BinLabelData).materialName : undefined,
            quantity: type === "bin" ? (label as BinLabelData).quantity : (label as PaletLabelData).qty,
            netWeight: type === "bin" ? (label as BinLabelData).netWeight : undefined,
            grossWeight: type === "bin" ? (label as BinLabelData).grossWeight : undefined,
            inspector: type === "bin" ? (label as BinLabelData).inspector : undefined,
            doNo: type === "palet" ? (label as PaletLabelData).doNo : undefined,
            poNo: type === "palet" ? (label as PaletLabelData).poNo : undefined,
            package: type === "palet" ? (label as PaletLabelData).package : undefined,
            date: type === "bin" ? (label as BinLabelData).date : (label as PaletLabelData).date,
            showVulcanization: type === "bin" ? (label as BinLabelData).showVulcanization : false,
          })),
      )

      const response = await fetch("/api/print-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ printHistory: printHistoryData }),
      })

      if (!response.ok) {
        throw new Error("Failed to save print history")
      }

      console.log("Print history saved successfully")
    } catch (error) {
      console.error("Error saving print history:", error)
    }
  }

  // Expand label list by labelQuantity for print layout
  const getExpandedLabelList = useCallback(() => {
    const expandedList: (BinLabelData | PaletLabelData)[] = []

    labelList.forEach((label) => {
      for (let i = 0; i < label.labelQuantity; i++) {
        expandedList.push({
          ...label,
          labelQuantity: 1,
        })
      }
    })

    return expandedList
  }, [labelList])

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `${type.toUpperCase()} Labels`,
    onAfterPrint: () => {
      toast({
        title: "Print completed",
        description: "Labels have been sent to printer successfully.",
      })
    },
  })

  const handlePrintClick = useCallback(async () => {
    if (labelList.length === 0) return

    setIsPrintLoading(true)

    try {
      await savePrintHistory(labelList)
      await preloadImages()
      await new Promise((resolve) => setTimeout(resolve, 1000))

      handlePrint()

      toast({
        title: "Print initiated",
        description: "Print dialog should open shortly. History saved.",
      })
    } catch (error) {
      console.error("Error preparing print:", error)
      toast({
        title: "Print preparation failed",
        description: "There was an error preparing the print.",
        variant: "destructive",
      })
    } finally {
      setIsPrintLoading(false)
    }
  }, [labelList, preloadImages, handlePrint])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev: any) => ({ ...prev, [id]: value }))
  }

  /**
   * 🔑 Lookup utama berbasis COMPUTER NAME:
   * - type === "palet" → pakai formData.partNo (field UI: "Computer Name")
   * - type === "bin"   → pakai formData.computerNo
   */
  const handlePartNoLookup = async () => {
    try {
      let res: Response

      if (type === "palet") {
        // 👇 Narrow ke PaletFormData
        const data = formData as PaletFormData
        if (!data.partNo) return

        res = await fetch(`/api/items?computerName=${encodeURIComponent(data.partNo)}`)
      } else {
        // 👇 Narrow ke BinFormData
        const data = formData as BinFormData
        if (!data.computerNo) return

        res = await fetch(`/api/items?computerName=${encodeURIComponent(data.computerNo)}`)
      }

      if (!res.ok) throw new Error("Item not found")

      const item = await res.json()

      if (type === "bin") {
        // BIN: auto-fill dari Computer No
        setFormData((prev) => {
          const prevBin = prev as BinFormData
          return {
            ...prevBin,
            partDescription: item.description || "",
            partNo: item.partNo || "",
            computerNo: item.computerName || "",
            lotNo: item.lotNo || "",
            hardness: item.hardness || "",
            color: item.color || "",
            materialName: item.materialName || "",
            quantity: item.binQuantity?.toString() || "",
            quantityUnit: item.unit || "",
            netWeight: item.binNetWeight?.toString() || "",
            netWeightUnit: item.binNetWeightUnit || "",
            grossWeight: item.binGrossWeight?.toString() || "",
            grossWeightUnit: item.binGrossWeightUnit || "",
            inspector: item.inspector || "",
          }
        })
      } else {
        // PALET: Computer Name → Product Name
        setFormData((prev) => {
          const prevPalet = prev as PaletFormData
          return {
            ...prevPalet,
            productName: `${item.partNo} - ${item.description}` || "",
            // ⬇⬇ DO No jangan dikosongin, minimal prefiks HTMF-
            doNo: prevPalet.doNo || "HTMF-",
            poNo: "",
            qty: "",
            qtyUnit: "",
            package: "",
            date: "",
          }
        })
      }

      toast({
        title: "Item loaded",
        description:
          type === "palet"
            ? "Product name auto-filled from computer name lookup."
            : "Fields automatically filled from database (Computer No).",
      })
    } catch (error) {
      toast({
        title: "Failed to fetch data",
        description:
          type === "palet"
            ? "Computer name not found or error occurred."
            : "Computer No not found or error occurred.",
        variant: "destructive",
      })
    }
  }

  const handleAddToList = () => {
    const totalLabelsNeeded = labelList.reduce((sum, label) => sum + label.labelQuantity, 0) + labelQuantity

    if (totalLabelsNeeded > maxLabels) {
      toast({
        title: "Maximum labels exceeded",
        description: `Adding ${labelQuantity} labels would exceed the maximum of ${maxLabels} labels. Currently have ${labelList.reduce((sum, label) => sum + label.labelQuantity, 0)} labels.`,
        variant: "destructive",
      })
      return
    }

    const requiredField = type === "bin" ? "partDescription" : "partNo"
    if (!(formData as any)[requiredField] || !(formData as any).partNo) {
      toast({
        title: "Required fields missing",
        description: `Please fill in ${
          type === "bin" ? "Part Description and " : ""
        }${type === "palet" ? "Computer Name (Part No field) and " : ""}Part No.`,
        variant: "destructive",
      })
      return
    }

    const newLabel =
      type === "bin"
        ? ({ ...(formData as BinFormData), showVulcanization, labelQuantity } as BinLabelData)
        : ({ ...(formData as PaletFormData), labelQuantity } as PaletLabelData)

    setLabelList((prev) => [...prev, newLabel])

    if (type === "palet") {
      setFormData({
        partNo: "",
        productName: "",
        // ⬇⬇ habis add, DO No tetap auto prefiks HTMF-
        doNo: "HTMF-",
        poNo: "",
        qty: "",
        qtyUnit: "",
        package: "",
        date: "",
      } as PaletFormData)
    } else {
      setFormData({
        partDescription: "",
        partNo: "",
        computerNo: "",
        lotNo: "",
        hardness: "",
        color: "",
        materialName: "",
        date: "",
        quantity: "",
        quantityUnit: "",
        netWeight: "",
        netWeightUnit: "",
        grossWeight: "",
        grossWeightUnit: "",
        inspector: "",
      } as BinFormData)
    }
    setShowVulcanization(false)
    setLabelQuantity(1)

    toast({
      title: "Label added",
      description: `${labelQuantity} copies of this label added to print list.`,
    })
  }

  const handleFillAllWithSameData = () => {
    const requiredField = type === "bin" ? "partDescription" : "partNo"
    if (!(formData as any)[requiredField] || !(formData as any).partNo) {
      toast({
        title: "Required fields missing",
        description: `Please fill in ${
          type === "bin" ? "Part Description and " : ""
        }${type === "palet" ? "Computer Name (Part No field) and " : ""}Part No before filling all labels.`,
        variant: "destructive",
      })
      return
    }

    const currentTotal = labelList.reduce((sum, label) => sum + label.labelQuantity, 0)
    const remainingSlots = maxLabels - currentTotal

    if (remainingSlots <= 0) {
      toast({
        title: "No remaining slots",
        description: "All label slots are already filled.",
        variant: "destructive",
      })
      return
    }

    const newLabel =
      type === "bin"
        ? ({ ...(formData as BinFormData), showVulcanization, labelQuantity: remainingSlots } as BinLabelData)
        : ({ ...(formData as PaletFormData), labelQuantity: remainingSlots } as PaletLabelData)

    setLabelList((prev) => [...prev, newLabel])

    if (type === "palet") {
      setFormData({
        partNo: "",
        productName: "",
        // ⬇⬇ lagi-lagi, DO No balik ke HTMF-
        doNo: "HTMF-",
        poNo: "",
        qty: "",
        qtyUnit: "",
        package: "",
        date: "",
      } as PaletFormData)
    } else {
      setFormData({
        partDescription: "",
        partNo: "",
        computerNo: "",
        lotNo: "",
        hardness: "",
        color: "",
        materialName: "",
        date: "",
        quantity: "",
        quantityUnit: "",
        netWeight: "",
        netWeightUnit: "",
        grossWeight: "",
        grossWeightUnit: "",
        inspector: "",
      } as BinFormData)
    }
    setShowVulcanization(false)
    setLabelQuantity(1)

    toast({
      title: "All labels filled",
      description: `${remainingSlots} labels added with the same data. Ready to print!`,
    })
  }

  const handleQuickPrint = async () => {
    const requiredField = type === "bin" ? "partDescription" : "partNo"
    if (!(formData as any)[requiredField] || !(formData as any).partNo) {
      toast({
        title: "Required fields missing",
        description: `Please fill in ${
          type === "bin" ? "Part Description and " : ""
        }${type === "palet" ? "Computer Name (Part No field) and " : ""}Part No before quick print.`,
        variant: "destructive",
      })
      return
    }

    const currentTotal = labelList.reduce((sum, label) => sum + label.labelQuantity, 0)
    const remainingSlots = maxLabels - currentTotal

    let finalLabelList = [...labelList]

    if (remainingSlots > 0) {
      const newLabel =
        type === "bin"
          ? ({ ...(formData as BinFormData), showVulcanization, labelQuantity: remainingSlots } as BinLabelData)
          : ({ ...(formData as PaletFormData), labelQuantity: remainingSlots } as PaletLabelData)

      finalLabelList = [...labelList, newLabel]
      setLabelList(finalLabelList)
    }

    setTimeout(async () => {
      await handlePrintClick()
    }, 100)

    toast({
      title: "Quick print initiated",
      description: `All ${maxLabels} labels filled and sent to printer.`,
    })
  }

  const handleRemoveLabel = (index: number) => {
    setLabelList((prev) => prev.filter((_, i) => i !== index))
    if (previewIndex === index) {
      setPreviewIndex(null)
    }
    toast({
      title: "Label removed",
      description: "Label removed from print list.",
    })
  }

  const handleClearAll = () => {
    setLabelList([])
    setPreviewIndex(null)
    toast({
      title: "All labels cleared",
      description: "Print list has been cleared.",
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const payload = {
        ...formData,
        showVulcanization: type === "bin" ? showVulcanization : false,
        type,
      }

      if (label) {
        const response = await fetch(`/api/labels/${label.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })

        if (!response.ok) {
          throw new Error("Failed to update label")
        }
      } else {
        const response = await fetch("/api/labels", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })

        if (!response.ok) {
          throw new Error("Failed to create label")
        }
      }

      toast({
        title: label ? "Label updated" : "Label created",
        description: "Your label has been saved successfully.",
      })

      router.push("/dashboard")
      router.refresh()
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    if (type === "palet") {
      setFormData({
        partNo: "",
        productName: "",
        // ⬇⬇ reset palet → DO No langsung HTMF-
        doNo: "HTMF-",
        poNo: "",
        qty: "",
        qtyUnit: "",
        package: "",
        date: "",
      } as PaletFormData)
    } else {
      setFormData({
        partDescription: "",
        partNo: "",
        computerNo: "",
        lotNo: "",
        hardness: "",
        color: "",
        materialName: "",
        date: "",
        quantity: "",
        quantityUnit: "",
        netWeight: "",
        netWeightUnit: "",
        grossWeight: "",
        grossWeightUnit: "",
        inspector: "",
      } as BinFormData)
    }
    setShowVulcanization(false)
  }

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      toast({
        title: "Template name required",
        description: "Please enter a name for your template.",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: templateName.trim(),
          type,
          data: {
            ...formData,
            showVulcanization: type === "bin" ? showVulcanization : false,
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to save template")
      }

      const newTemplate = await response.json()
      setTemplates((prev) => [newTemplate, ...prev])
      setTemplateName("")

      toast({
        title: "Template saved",
        description: "Your template has been saved successfully.",
      })
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleLoadTemplate = async (templateId: string) => {
    if (!templateId) return

    try {
      const response = await fetch(`/api/templates/${templateId}`)

      if (!response.ok) {
        throw new Error("Failed to load template")
      }

      const template = await response.json()

      if (template.data) {
        setFormData(template.data)
        if (type === "bin" && template.data.showVulcanization !== undefined) {
          setShowVulcanization(template.data.showVulcanization)
        }
      }

      toast({
        title: "Template loaded",
        description: `Template "${template.name}" has been loaded successfully.`,
      })
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      })
    }
  }

  // ========================= PALLET FORM =========================
  if (type === "palet") {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <Tabs defaultValue="form">
            <TabsList className="mb-4">
              <TabsTrigger value="form">Palet Form</TabsTrigger>
              <TabsTrigger value="list">
                Print List ({labelList.reduce((sum, label) => sum + label.labelQuantity, 0)}/{maxLabels})
              </TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
            </TabsList>

            <TabsContent value="form">
              <form onSubmit={handleSubmit}>
                <div className="border-2 border-black bg-white max-w-2xl mx-auto p-6">
                  {/* Header */}
                  <div className="text-center mb-6">
                    <h1 className="text-xl font-bold mb-4">PT Hang Tong Manufactory</h1>
                    <div className="border-b-2 border-black mb-4"></div>
                  </div>

                  {/* Fields */}
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="w-32 font-medium text-black">Computer Name</div>
                      <div className="flex-1 border-b-2 border-black h-8 flex items-center ml-4">
                        <Input
                          id="partNo"
                          value={(formData as PaletFormData).partNo}
                          onChange={handleChange}
                          onBlur={handlePartNoLookup}
                          placeholder="Enter computer name"
                          className="border-0 rounded-none bg-transparent p-1 focus:ring-0 focus:border-0 h-6 w-full"
                          style={{ boxShadow: "none" }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="w-32 font-medium text-black">Product Name</div>
                      <div className="flex-1 border-b-2 border-black h-8 flex items-center ml-4">
                        <Input
                          id="productName"
                          value={(formData as PaletFormData).productName}
                          onChange={handleChange}
                          readOnly
                          placeholder="Auto-filled from computer name"
                          className="border-0 rounded-none bg-gray-50 p-1 focus:ring-0 focus:border-0 h-6 w-full"
                          style={{ boxShadow: "none" }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="w-32 font-medium text-black">DO No</div>
                      <div className="flex-1 border-b-2 border-black h-8 flex items-center ml-4">
                        <Input
                          id="doNo"
                          value={(formData as PaletFormData).doNo}
                          onChange={handleChange}
                          className="border-0 rounded-none bg-transparent p-1 focus:ring-0 focus:border-0 h-6 w-full"
                          style={{ boxShadow: "none" }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="w-32 font-medium text-black">PO No</div>
                      <div className="flex-1 border-b-2 border-black h-8 flex items-center ml-4">
                        <Input
                          id="poNo"
                          value={(formData as PaletFormData).poNo}
                          onChange={handleChange}
                          className="border-0 rounded-none bg-transparent p-1 focus:ring-0 focus:border-0 h-6 w-full"
                          style={{ boxShadow: "none" }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="w-32 font-medium text-black">QTY</div>
                      <div className="flex-1 border-b-2 border-black h-8 flex items-center ml-4">
                        <Input
                          id="qty"
                          type="number"
                          value={(formData as PaletFormData).qty}
                          onChange={handleChange}
                          className="border-0 rounded-none bg-transparent p-1 focus:ring-0 focus:border-0 h-6 flex-1"
                          style={{ boxShadow: "none" }}
                        />
                        {(formData as PaletFormData).qtyUnit && (
                          <span className="ml-2 text-sm font-medium text-gray-600">
                            {(formData as PaletFormData).qtyUnit}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="w-32 font-medium text-black">Package</div>
                      <div className="flex-1 border-b-2 border-black h-8 flex items-center ml-4">
                        <Input
                          id="package"
                          value={(formData as PaletFormData).package}
                          onChange={handleChange}
                          className="border-0 rounded-none bg-transparent p-1 focus:ring-0 focus:border-0 h-6 w-full"
                          style={{ boxShadow: "none" }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="w-32 font-medium text-black">Date</div>
                      <div className="flex-1 border-b-2 border-black h-8 flex items-center ml-4">
                        <Input
                          id="date"
                          type="date"
                          value={(formData as PaletFormData).date}
                          onChange={handleChange}
                          className="border-0 rounded-none bg-transparent p-1 focus:ring-0 focus:border-0 h-6 w-full"
                          style={{ boxShadow: "none" }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> Enter the computer name in the "Computer Name" field above. The "Product
                      Name" will automatically be filled with the format "Part No - Description" when you finish typing
                      the computer name.
                    </p>
                  </div>
                </div>

                {/* Label Quantity Selector */}
                <div className="mt-4 flex justify-center">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="labelQuantity" className="text-sm font-medium">
                      Number of copies:
                    </Label>
                    <Select
                      value={labelQuantity.toString()}
                      onValueChange={(value) => setLabelQuantity(Number.parseInt(value))}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Buttons */}
                <div className="mt-6 flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
                  <Button type="button" variant="outline" onClick={handleReset}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reset Form
                  </Button>
                  <Button
                    type="button"
                    onClick={handleAddToList}
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={labelList.reduce((sum, label) => sum + label.labelQuantity, 0) + labelQuantity > maxLabels}
                  >
                    Add {labelQuantity} to List ({labelList.reduce((sum, label) => sum + label.labelQuantity, 0)}/
                    {maxLabels})
                  </Button>
                  <Button
                    type="button"
                    onClick={handleFillAllWithSameData}
                    className="bg-purple-600 hover:bg-purple-700"
                    disabled={labelList.reduce((sum, label) => sum + label.labelQuantity, 0) >= maxLabels}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Fill All ({maxLabels - labelList.reduce((sum, label) => sum + label.labelQuantity, 0)} remaining)
                  </Button>
                  <Button
                    type="button"
                    onClick={handleQuickPrint}
                    className="bg-green-600 hover:bg-green-700"
                    disabled={isPrintLoading}
                  >
                    {isPrintLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Printing...
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        Fill All & Print
                      </>
                    )}
                  </Button>
                  <Button type="submit" disabled={isLoading} className="bg-gray-800 hover:bg-gray-900">
                    {isLoading ? "Saving..." : label ? "Update Label" : "Save Label"}
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="list">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">
                    Print List ({labelList.reduce((sum, label) => sum + label.labelQuantity, 0)}/{maxLabels})
                  </h3>
                  <div className="space-x-2">
                    <Button
                      onClick={handlePrintClick}
                      disabled={labelList.length === 0 || isPrintLoading}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isPrintLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Preparing Print...
                        </>
                      ) : (
                        "Print All Labels"
                      )}
                    </Button>
                    <Button variant="outline" onClick={handleClearAll} disabled={labelList.length === 0}>
                      Clear All
                    </Button>
                  </div>
                </div>

                {isPrintLoading && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin text-blue-600" />
                      <span className="text-blue-800">Loading images and preparing print layout...</span>
                    </div>
                  </div>
                )}

                {labelList.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No labels added yet. Use the form to add labels to the print list.
                  </div>
                ) : (
                  <div className="grid gap-2">
                    {labelList.map((label, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">
                            {(label as PaletLabelData).productName || "No Product Name"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Computer Name: {label.partNo} | DO: {(label as PaletLabelData).doNo} | QTY:{" "}
                            {(label as PaletLabelData).qty} {(label as PaletLabelData).qtyUnit} | Copies:{" "}
                            {label.labelQuantity}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setPreviewIndex(previewIndex === index ? null : index)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleRemoveLabel(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {previewIndex !== null && labelList[previewIndex] && (
                  <div className="mt-6">
                    <h4 className="font-medium mb-2">Preview Label {previewIndex + 1}:</h4>
                    <div className="border-2 border-black bg-white max-w-md mx-auto p-2 text-xs">
                      <div className="text-center mb-2">
                        <div className="font-bold">PT Hang Tong Manufactory</div>
                      </div>
                      <div className="space-y-1">
                        <div>Computer Name: {labelList[previewIndex].partNo}</div>
                        <div>Product Name: {(labelList[previewIndex] as PaletLabelData).productName}</div>
                        <div>QTY: {(labelList[previewIndex] as PaletLabelData).qty}</div>
                        <div>Copies: {labelList[previewIndex].labelQuantity}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="templates">
              <div className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="templateName">Save Current Form as Template</Label>
                    <div className="flex gap-2">
                      <Input
                        id="templateName"
                        placeholder="Enter template name"
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                      />
                      <Button onClick={handleSaveTemplate} disabled={!templateName.trim()}>
                        Save Template
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="templateSelect">Load Template</Label>
                    <Select
                      value={selectedTemplate || ""}
                      onValueChange={(value) => {
                        setSelectedTemplate(value)
                        if (value && value !== "none") {
                          handleLoadTemplate(value)
                        }
                      }}
                    >
                      <SelectTrigger id="templateSelect">
                        <SelectValue placeholder={isLoadingTemplates ? "Loading templates..." : "Select a template"} />
                      </SelectTrigger>
                      <SelectContent>
                        {isLoadingTemplates ? (
                          <SelectItem value="loading" disabled>
                            Loading templates...
                          </SelectItem>
                        ) : templates.length > 0 ? (
                          templates.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>
                            No templates available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        <BinPaletPrintLayout ref={componentRef} labelList={getExpandedLabelList()} type={type} />
      </div>
    )
  }

  // ========================= BIN FORM =========================
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <Tabs defaultValue="form">
          <TabsList className="mb-4">
            <TabsTrigger value="form">Bin Form</TabsTrigger>
            <TabsTrigger value="list">
              Print List ({labelList.reduce((sum, label) => sum + label.labelQuantity, 0)}/{maxLabels})
            </TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="form">
            <form onSubmit={handleSubmit}>
              <div className="border-2 border-black bg-white max-w-4xl mx-auto p-6" style={{ aspectRatio: "1.5/1" }}>
                {/* Header */}
                <div className="text-center mb-6">
                  <h1 className="text-xl font-bold mb-1">PT Hang Tong Manufactory</h1>
                  <h2 className="text-lg font-bold mb-4">OQC Inspection Label</h2>
                  <div className="border-b-2 border-black mb-4"></div>
                </div>

                <div className="space-y-4">
                  {/* Part Description */}
                  <div className="flex items-center">
                    <div className="w-40 font-medium text-black">Part Desc.</div>
                    <div className="flex-1 border-b-2 border-black h-8 flex items-center ml-4">
                      <Input
                        id="partDescription"
                        value={(formData as BinFormData).partDescription}
                        onChange={handleChange}
                        className="border-0 rounded-none bg-transparent p-1 focus:ring-0 focus:border-0 h-6 w-full"
                        style={{ boxShadow: "none" }}
                      />
                    </div>
                  </div>

                  {/* Part No + Date */}
                  <div className="flex items-center">
                    <div className="w-40 font-medium text-black">Part No</div>
                    <div className="w-64 border-b-2 border-black h-8 flex items-center ml-4">
                      <Input
                        id="partNo"
                        value={(formData as BinFormData).partNo}
                        onChange={handleChange}
                        className="border-0 rounded-none bg-transparent p-1 focus:ring-0 focus:border-0 h-6 w-full"
                        style={{ boxShadow: "none" }}
                      />
                    </div>
                    <div className="w-32 font-medium text-black ml-8">Date</div>
                    <div className="w-64 border-b-2 border-black h-8 flex items-center ml-4">
                      <Input
                        id="date"
                        type="date"
                        value={(formData as BinFormData).date}
                        onChange={handleChange}
                        className="border-0 rounded-none bg-transparent p-1 focus:ring-0 focus:border-0 h-6 w-full"
                        style={{ boxShadow: "none" }}
                      />
                    </div>
                  </div>

                  {/* Computer No + Quantity */}
                  <div className="flex items-center">
                    <div className="w-40 font-medium text-black">Computer No</div>
                    <div className="w-64 border-b-2 border-black h-8 flex items-center ml-4">
                      <Input
                        id="computerNo"
                        value={(formData as BinFormData).computerNo}
                        onChange={handleChange}
                        onBlur={handlePartNoLookup} // 🔑 BIN lookup di sini (Computer No)
                        className="border-0 rounded-none bg-transparent p-1 focus:ring-0 focus:border-0 h-6 w-full"
                        style={{ boxShadow: "none" }}
                      />
                    </div>
                    <div className="w-32 font-medium text-black ml-8">Quantity (PCS/M)</div>
                    <div className="w-64 border-b-2 border-black h-8 flex items-center ml-4">
                      <Input
                        id="quantity"
                        type="number"
                        value={(formData as BinFormData).quantity}
                        onChange={handleChange}
                        className="border-0 rounded-none bg-transparent p-1 focus:ring-0 focus:border-0 h-6 flex-1"
                        style={{ boxShadow: "none" }}
                      />
                      {(formData as BinFormData).quantityUnit && (
                        <span className="ml-2 text-sm font-medium text-gray-600">
                          {(formData as BinFormData).quantityUnit}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Lot No + Net Weight */}
                  <div className="flex items-center">
                    <div className="w-40 font-medium text-black">Lot No</div>
                    <div className="w-64 border-b-2 border-black h-8 flex items-center ml-4">
                      <Input
                        id="lotNo"
                        value={(formData as BinFormData).lotNo}
                        onChange={handleChange}
                        className="border-0 rounded-none bg-transparent p-1 focus:ring-0 focus:border-0 h-6 w-full"
                        style={{ boxShadow: "none" }}
                      />
                    </div>
                    <div className="w-32 font-medium text-black ml-8">Net Weight (KG)</div>
                    <div className="w-64 border-b-2 border-black h-8 flex items-center ml-4">
                      <Input
                        id="netWeight"
                        type="number"
                        step="0.01"
                        value={(formData as BinFormData).netWeight}
                        onChange={handleChange}
                        className="border-0 rounded-none bg-transparent p-1 focus:ring-0 focus:border-0 h-6 flex-1"
                        style={{ boxShadow: "none" }}
                      />
                      {(formData as BinFormData).netWeightUnit && (
                        <span className="ml-2 text-sm font-medium text-gray-600">
                          {(formData as BinFormData).netWeightUnit}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Hardness + Gross Weight */}
                  <div className="flex items-center">
                    <div className="w-40 font-medium text-black">Hardness (A)</div>
                    <div className="w-64 border-b-2 border-black h-8 flex items-center ml-4">
                      <Input
                        id="hardness"
                        value={(formData as BinFormData).hardness}
                        onChange={handleChange}
                        className="border-0 rounded-none bg-transparent p-1 focus:ring-0 focus:border-0 h-6 w-full"
                        style={{ boxShadow: "none" }}
                      />
                    </div>
                    <div className="w-32 font-medium text-black ml-8">Gross Weight (KG)</div>
                    <div className="w-64 border-b-2 border-black h-8 flex items-center ml-4">
                      <Input
                        id="grossWeight"
                        type="number"
                        step="0.01"
                        value={(formData as BinFormData).grossWeight}
                        onChange={handleChange}
                        className="border-0 rounded-none bg-transparent p-1 focus:ring-0 focus:border-0 h-6 flex-1"
                        style={{ boxShadow: "none" }}
                      />
                      {(formData as BinFormData).grossWeightUnit && (
                        <span className="ml-2 text-sm font-medium text-gray-600">
                          {(formData as BinFormData).grossWeightUnit}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Color */}
                  <div className="flex items-center">
                    <div className="w-40 font-medium text-black">Color</div>
                    <div className="w-64 border-b-2 border-black h-8 flex items-center ml-4">
                      <Input
                        id="color"
                        value={(formData as BinFormData).color}
                        onChange={handleChange}
                        className="border-0 rounded-none bg-transparent p-1 focus:ring-0 focus:border-0 h-6 w-full"
                        style={{ boxShadow: "none" }}
                      />
                    </div>
                  </div>

                  {/* Material Name + Inspector */}
                  <div className="flex items-center">
                    <div className="w-40 font-medium text-black">Material Name</div>
                    <div className="w-64 border-b-2 border-black h-8 flex items-center ml-4">
                      <Input
                        id="materialName"
                        value={(formData as BinFormData).materialName}
                        onChange={handleChange}
                        className="border-0 rounded-none bg-transparent p-1 focus:ring-0 focus:border-0 h-6 w-full"
                        style={{ boxShadow: "none" }}
                      />
                    </div>
                    <div className="w-32 font-medium text-black ml-8">Inspector</div>
                    <div className="w-64 border-b-2 border-black h-8 flex items-center ml-4">
                      <Input
                        id="inspector"
                        value={(formData as BinFormData).inspector}
                        onChange={handleChange}
                        className="border-0 rounded-none bg-transparent p-1 focus:ring-0 focus:border-0 h-6 w-full"
                        style={{ boxShadow: "none" }}
                      />
                    </div>
                  </div>
                </div>

                {/* Bottom logos */}
                <div className="mt-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Checkbox
                      id="vulcanization"
                      checked={showVulcanization}
                      onCheckedChange={(checked) => setShowVulcanization(checked === true)}
                    />
                    <Label htmlFor="vulcanization" className="text-sm font-medium">
                      With Vulcanization
                    </Label>
                  </div>

                  <div className="border-t-2 border-black mb-2"></div>

                  <div className="grid grid-cols-3 gap-0 h-20">
                    <div className="flex items-center justify-center border-r-2 border-black p-2">
                      {showVulcanization && (
                        <Image
                          src="/images/vulcanization.png"
                          alt="Secondary Vulcanization"
                          width={120}
                          height={60}
                          className="object-contain max-h-16"
                          priority
                        />
                      )}
                    </div>
                    <div className="flex items-center justify-center border-r-2 border-black p-2">
                      <Image
                        src="/images/rohs-ok.png"
                        alt="RoHS OK"
                        width={100}
                        height={50}
                        className="object-contain"
                        priority
                      />
                    </div>
                    <div className="flex items-center justify-center p-2">
                      <Image
                        src="/images/oqc-passed.png"
                        alt="OQC Passed"
                        width={80}
                        height={80}
                        className="object-contain"
                        priority
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Label Quantity Selector */}
              <div className="mt-4 flex justify-center">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="labelQuantity" className="text-sm font-medium">
                    Number of copies:
                  </Label>
                  <Select
                    value={labelQuantity.toString()}
                    onValueChange={(value) => setLabelQuantity(Number.parseInt(value))}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Buttons */}
              <div className="mt-6 flex flex-wrap justify-center gap-2 max-w-4xl mx-auto">
                <Button type="button" variant="outline" onClick={handleReset}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset Form
                </Button>
                <Button
                  type="button"
                  onClick={handleAddToList}
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={labelList.reduce((sum, label) => sum + label.labelQuantity, 0) + labelQuantity > maxLabels}
                >
                  Add {labelQuantity} to List ({labelList.reduce((sum, label) => sum + label.labelQuantity, 0)}/
                  {maxLabels})
                </Button>
                <Button
                  type="button"
                  onClick={handleFillAllWithSameData}
                  className="bg-purple-600 hover:bg-purple-700"
                  disabled={labelList.reduce((sum, label) => sum + label.labelQuantity, 0) >= maxLabels}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Fill All ({maxLabels - labelList.reduce((sum, label) => sum + label.labelQuantity, 0)} remaining)
                </Button>
                <Button
                  type="button"
                  onClick={handleQuickPrint}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={isPrintLoading}
                >
                  {isPrintLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Printing...
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Fill All & Print
                    </>
                  )}
                </Button>
                <Button type="submit" disabled={isLoading} className="bg-gray-800 hover:bg-gray-900">
                  {isLoading ? "Saving..." : label ? "Update Label" : "Save Label"}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="list">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                  Print List ({labelList.reduce((sum, label) => sum + label.labelQuantity, 0)}/{maxLabels})
                </h3>
                <div className="space-x-2">
                  <Button
                    onClick={handlePrintClick}
                    disabled={labelList.length === 0 || isPrintLoading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isPrintLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Preparing Print...
                      </>
                    ) : (
                      "Print All Labels"
                    )}
                  </Button>
                  <Button variant="outline" onClick={handleClearAll} disabled={labelList.length === 0}>
                    Clear All
                  </Button>
                </div>
              </div>

              {isPrintLoading && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-blue-600" />
                    <span className="text-blue-800">Loading images and preparing print layout...</span>
                  </div>
                </div>
              )}

              {labelList.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No labels added yet. Use the form to add labels to the print list.
                </div>
              ) : (
                <div className="grid gap-2">
                  {labelList.map((label, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{(label as BinLabelData).partDescription || "No Description"}</div>
                        <div className="text-sm text-muted-foreground">
                          Part No: {label.partNo} | Lot: {(label as BinLabelData).lotNo} | Qty:{" "}
                          {(label as BinLabelData).quantity} {(label as BinLabelData).quantityUnit} | Copies:{" "}
                          {label.labelQuantity}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setPreviewIndex(previewIndex === index ? null : index)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleRemoveLabel(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {previewIndex !== null && labelList[previewIndex] && (
                <div className="mt-6">
                  <h4 className="font-medium mb-2">Preview Label {previewIndex + 1}:</h4>
                  <div className="border-2 border-black bg-white max-w-md mx-auto p-2 text-xs">
                    <div className="text-center mb-2">
                      <div className="font-bold">PT Hang Tong Manufactory</div>
                      <div className="font-bold">OQC Inspection Label</div>
                    </div>
                    <div className="space-y-1">
                      <div>Part Description: {(labelList[previewIndex] as BinLabelData).partDescription}</div>
                      <div>Part No: {labelList[previewIndex].partNo}</div>
                      <div>Date: {(labelList[previewIndex] as BinLabelData).date}</div>
                      <div>Quantity: {(labelList[previewIndex] as BinLabelData).quantity}</div>
                      <div>Copies: {labelList[previewIndex].labelQuantity}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="templates">
            <div className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="templateName">Save Current Form as Template</Label>
                  <div className="flex gap-2">
                    <Input
                      id="templateName"
                      placeholder="Enter template name"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                    />
                    <Button onClick={handleSaveTemplate} disabled={!templateName.trim()}>
                      Save Template
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="templateSelect">Load Template</Label>
                  <Select
                    value={selectedTemplate || ""}
                    onValueChange={(value) => {
                      setSelectedTemplate(value)
                      if (value && value !== "none") {
                        handleLoadTemplate(value)
                      }
                    }}
                  >
                    <SelectTrigger id="templateSelect">
                      <SelectValue placeholder={isLoadingTemplates ? "Loading templates..." : "Select a template"} />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingTemplates ? (
                        <SelectItem value="loading" disabled>
                          Loading templates...
                        </SelectItem>
                      ) : templates.length > 0 ? (
                        templates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>
                          No templates available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      <BinPaletPrintLayout ref={componentRef} labelList={getExpandedLabelList()} type={type} />
    </div>
  )
}
