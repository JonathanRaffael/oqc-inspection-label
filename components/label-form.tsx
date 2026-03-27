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
import { PrintLayout } from "./print-layout"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trash2, Eye, Loader2, Copy, RotateCcw } from "lucide-react"

interface LabelData {
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

interface Template {
  id: string
  name: string
  type: string
  data: any
  createdAt: string
}

interface LabelFormProps {
  label?: any
  templates?: Template[]
}

export function LabelForm({ label, templates: initialTemplates = [] }: LabelFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isPrintLoading, setIsPrintLoading] = useState(false)
  const [showVulcanization, setShowVulcanization] = useState(label?.showVulcanization || false)
  const [templateName, setTemplateName] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [templates, setTemplates] = useState<Template[]>(initialTemplates)
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false)

  // New state for multiple labels - maximum 20
  const maxLabels = 20
  const [labelList, setLabelList] = useState<LabelData[]>([])
  const [previewIndex, setPreviewIndex] = useState<number | null>(null)
  const [labelQuantity, setLabelQuantity] = useState(1)

  const [formData, setFormData] = useState({
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
  })

  const componentRef = useRef<HTMLDivElement>(null)

  // Load templates on component mount
  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    setIsLoadingTemplates(true)
    try {
      const response = await fetch("/api/templates")
      if (response.ok) {
        const allTemplates = await response.json()
        // Filter templates by type (pack for label form)
        const filteredTemplates = allTemplates.filter((t: Template) => t.type === "pack")
        setTemplates(filteredTemplates)
      }
    } catch (error) {
      console.error("Error loading templates:", error)
    } finally {
      setIsLoadingTemplates(false)
    }
  }

  // Preload images function
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
          checkComplete() // Continue even if some images fail
        }

        img.src = url
      })

      // Timeout after 10 seconds
      setTimeout(() => {
        if (loadedCount < imageUrls.length) {
          console.warn("Image preloading timeout")
          resolve() // Continue with printing even if not all images loaded
        }
      }, 10000)
    })
  }, [])

  // Save print history function
  const savePrintHistory = async (labels: LabelData[]) => {
    try {
      const printHistoryData = labels.flatMap((label) =>
        Array(label.labelQuantity)
          .fill(null)
          .map(() => ({
            labelType: "pack",
            labelCount: 1,
            partNo: label.partNo,
            partDescription: label.partDescription,
            computerNo: label.computerNo,
            lotNo: label.lotNo,
            hardness: label.hardness,
            color: label.color,
            materialName: label.materialName,
            quantity: label.quantity,
            netWeight: label.netWeight,
            grossWeight: label.grossWeight,
            inspector: label.inspector,
            date: label.date,
            showVulcanization: label.showVulcanization,
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
      // Don't block printing if history save fails
    }
  }

  const handlePrintClick = useCallback(async () => {
    if (labelList.length === 0) return

    setIsPrintLoading(true)

    try {
      // Save print history first
      await savePrintHistory(labelList)

      // Preload all images before printing
      await preloadImages()
      // Add small delay to ensure DOM is ready
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Trigger print
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
  }, [labelList])

  // Add this new function to expand labels for printing:
  const getExpandedLabelList = useCallback(() => {
    const expandedList: LabelData[] = []

    labelList.forEach((label) => {
      // Create the specified number of copies for each label
      for (let i = 0; i < label.labelQuantity; i++) {
        expandedList.push({
          ...label,
          labelQuantity: 1, // Reset to 1 since we're creating individual copies
        })
      }
    })

    return expandedList
  }, [labelList])

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: "OQC Inspection Labels",
    onAfterPrint: () => {
      toast({
        title: "Print completed",
        description: "Labels have been sent to printer successfully.",
      })
    },
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleComputerNoLookup = async () => {
    if (!formData.computerNo) return

    try {
      const res = await fetch(`/api/items?computerName=${encodeURIComponent(formData.computerNo)}`)
      if (!res.ok) throw new Error("Item not found")

      const item = await res.json()

      setFormData((prev) => ({
        ...prev,
        partDescription: item.description || "",
        partNo: item.partNo || "",
        computerNo: item.computerName || "",
        lotNo: item.lotNo || "",
        hardness: item.hardness || "",
        color: item.color || "",
        materialName: item.materialName || "",
        quantity: item.quantity?.toString() || "",
        quantityUnit: item.unit || "",
        netWeight: item.netWeight?.toString() || "",
        netWeightUnit: item.netWeightUnit || "",
        grossWeight: item.grossWeight?.toString() || "",
        grossWeightUnit: item.grossWeightUnit || "",
        inspector: item.inspector || "",
      }))

      toast({
        title: "Item loaded",
        description: "Field otomatis terisi dari database berdasarkan Computer No/Name.",
      })
    } catch (error) {
      toast({
        title: "Gagal mengambil data",
        description: "Item tidak ditemukan atau error.",
        variant: "destructive",
      })
    }
  }

  // Add label to list - Allow empty labels
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

    const newLabel: LabelData = {
      ...formData,
      showVulcanization,
      labelQuantity,
    }

    setLabelList((prev) => [...prev, newLabel])

    // Reset form
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
    })
    setShowVulcanization(false)
    setLabelQuantity(1)

    toast({
      title: "Label added",
      description: `${labelQuantity} copies of this label added to print list.`,
    })
  }

  // NEW FEATURE: Fill all remaining slots with current form data - Allow empty labels
  const handleFillAllWithSameData = () => {
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

    const newLabel: LabelData = {
      ...formData,
      showVulcanization,
      labelQuantity: remainingSlots,
    }

    setLabelList((prev) => [...prev, newLabel])

    // Reset form after filling
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
    })
    setShowVulcanization(false)
    setLabelQuantity(1)

    toast({
      title: "All labels filled",
      description: `${remainingSlots} labels added (empty or filled). Ready to print!`,
    })
  }

  // NEW FEATURE: Quick print - fill all and print immediately - Allow empty labels
  const handleQuickPrint = async () => {
    const currentTotal = labelList.reduce((sum, label) => sum + label.labelQuantity, 0)
    const remainingSlots = maxLabels - currentTotal

    let finalLabelList = [...labelList]

    if (remainingSlots > 0) {
      const newLabel: LabelData = {
        ...formData,
        showVulcanization,
        labelQuantity: remainingSlots,
      }
      finalLabelList = [...labelList, newLabel]
      setLabelList(finalLabelList)
    }

    // Wait a moment for state to update, then print
    setTimeout(async () => {
      await handlePrintClick()
    }, 100)

    toast({
      title: "Quick print initiated",
      description: `All ${maxLabels} labels filled (empty or filled) and sent to printer.`,
    })
  }

  // Remove label from list
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

  // Clear all labels
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
        showVulcanization,
        type: "pack", // Changed from "oqc" to "pack"
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
    })
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
          type: "pack", 
          data: {
            ...formData,
            showVulcanization,
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to save template")
      }

      const newTemplate = await response.json()

      // Add new template to the list
      setTemplates((prev) => [newTemplate, ...prev])

      // Clear template name
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

      // Load template data into form
      if (template.data) {
        setFormData({
          partDescription: template.data.partDescription || "",
          partNo: template.data.partNo || "",
          computerNo: template.data.computerNo || "",
          lotNo: template.data.lotNo || "",
          hardness: template.data.hardness || "",
          color: template.data.color || "",
          materialName: template.data.materialName || "",
          date: template.data.date || "",
          quantity: template.data.quantity || "",
          quantityUnit: template.data.unit || "",
          netWeight: template.data.netWeight || "",
          netWeightUnit: template.data.netWeightUnit || "",
          grossWeight: template.data.grossWeight || "",
          grossWeightUnit: template.data.grossWeightUnit || "",
          inspector: template.data.inspector || "",
        })

        if (template.data.showVulcanization !== undefined) {
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

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <Tabs defaultValue="form">
          <TabsList className="mb-4">
            <TabsTrigger value="form">Label Form</TabsTrigger>
            <TabsTrigger value="list">
              Print List ({labelList.reduce((sum, label) => sum + label.labelQuantity, 0)}/{maxLabels})
            </TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="form">
            <form onSubmit={handleSubmit}>
              {/* Label Layout */}
              <div className="border-2 border-black bg-white max-w-4xl mx-auto p-6" style={{ aspectRatio: "1.5/1" }}>
                {/* Header */}
                <div className="text-center mb-6">
                  <h1 className="text-xl font-bold mb-1">PT Hang Tong Manufactory</h1>
                  <h2 className="text-lg font-bold mb-4">OQC Inspection Label</h2>
                  <div className="border-b-2 border-black mb-4"></div>
                </div>

                {/* Form Fields with Perfect Alignment */}
                <div className="space-y-4">
                  {/* Part Description - Full Width */}
                  <div className="flex items-center">
                    <div className="w-40 font-medium text-black">Part Description</div>
                    <div className="flex-1 border-b-2 border-black h-8 flex items-center ml-4">
                      <Input
                        id="partDescription"
                        value={formData.partDescription}
                        onChange={handleChange}
                        className="border-0 rounded-none bg-transparent p-1 focus:ring-0 focus:border-0 h-6 w-full"
                        style={{ boxShadow: "none" }}
                      />
                    </div>
                  </div>

                  {/* Part No and Date */}
                  <div className="flex items-center">
                    <div className="w-40 font-medium text-black">Part No</div>
                    <div className="w-64 border-b-2 border-black h-8 flex items-center ml-4">
                      <Input
                        id="partNo"
                        value={formData.partNo}
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
                        value={formData.date}
                        onChange={handleChange}
                        className="border-0 rounded-none bg-transparent p-1 focus:ring-0 focus:border-0 h-6 w-full"
                        style={{ boxShadow: "none" }}
                      />
                    </div>
                  </div>

                  {/* Computer No/Name and Quantity */}
                  <div className="flex items-center">
                    <div className="w-40 font-medium text-black">Computer No/Name</div>
                    <div className="w-64 border-b-2 border-black h-8 flex items-center ml-4">
                      <Input
                        id="computerNo"
                        value={formData.computerNo}
                        onChange={handleChange}
                        onBlur={handleComputerNoLookup}
                        className="border-0 rounded-none bg-transparent p-1 focus:ring-0 focus:border-0 h-6 w-full"
                        style={{ boxShadow: "none" }}
                      />
                    </div>
                    <div className="w-32 font-medium text-black ml-8">Quantity</div>
                    <div className="w-64 border-b-2 border-black h-8 flex items-center ml-4">
                      <Input
                        id="quantity"
                        type="number"
                        value={formData.quantity}
                        onChange={handleChange}
                        className="border-0 rounded-none bg-transparent p-1 focus:ring-0 focus:border-0 h-6 flex-1"
                        style={{ boxShadow: "none" }}
                      />
                      {formData.quantityUnit && (
                        <span className="ml-2 text-sm font-medium text-gray-600">{formData.quantityUnit}</span>
                      )}
                    </div>
                  </div>

                  {/* Lot No and Net Weight */}
                  <div className="flex items-center">
                    <div className="w-40 font-medium text-black">Lot No</div>
                    <div className="w-64 border-b-2 border-black h-8 flex items-center ml-4">
                      <Input
                        id="lotNo"
                        value={formData.lotNo}
                        onChange={handleChange}
                        className="border-0 rounded-none bg-transparent p-1 focus:ring-0 focus:border-0 h-6 w-full"
                        style={{ boxShadow: "none" }}
                      />
                    </div>
                    <div className="w-32 font-medium text-black ml-8">Net Weight</div>
                    <div className="w-64 border-b-2 border-black h-8 flex items-center ml-4">
                      <Input
                        id="netWeight"
                        type="number"
                        step="0.01"
                        value={formData.netWeight}
                        onChange={handleChange}
                        className="border-0 rounded-none bg-transparent p-1 focus:ring-0 focus:border-0 h-6 flex-1"
                        style={{ boxShadow: "none" }}
                      />
                      {formData.netWeightUnit && (
                        <span className="ml-2 text-sm font-medium text-gray-600">{formData.netWeightUnit}</span>
                      )}
                    </div>
                  </div>

                  {/* Hardness and Gross Weight */}
                  <div className="flex items-center">
                    <div className="w-40 font-medium text-black">Hardness</div>
                    <div className="w-64 border-b-2 border-black h-8 flex items-center ml-4">
                      <Input
                        id="hardness"
                        value={formData.hardness}
                        onChange={handleChange}
                        className="border-0 rounded-none bg-transparent p-1 focus:ring-0 focus:border-0 h-6 w-full"
                        style={{ boxShadow: "none" }}
                      />
                    </div>
                    <div className="w-32 font-medium text-black ml-8">Gross Weight</div>
                    <div className="w-64 border-b-2 border-black h-8 flex items-center ml-4">
                      <Input
                        id="grossWeight"
                        type="number"
                        step="0.01"
                        value={formData.grossWeight}
                        onChange={handleChange}
                        className="border-0 rounded-none bg-transparent p-1 focus:ring-0 focus:border-0 h-6 flex-1"
                        style={{ boxShadow: "none" }} 
                      />
                      {formData.grossWeightUnit && (
                        <span className="ml-2 text-sm font-medium text-gray-600">{formData.grossWeightUnit}</span>
                      )}
                    </div>
                  </div>

                  {/* Color - Half Width */}
                  <div className="flex items-center">
                    <div className="w-40 font-medium text-black">Color</div>
                    <div className="w-64 border-b-2 border-black h-8 flex items-center ml-4">
                      <Input
                        id="color"
                        value={formData.color}
                        onChange={handleChange}
                        className="border-0 rounded-none bg-transparent p-1 focus:ring-0 focus:border-0 h-6 w-full"
                        style={{ boxShadow: "none" }}
                      />
                    </div>
                  </div>

                  {/* Material Name and Inspector - Removed UL logo from Material Name field */}
                  <div className="flex items-center">
                    <div className="w-40 font-medium text-black">Material Name</div>
                    <div className="w-64 border-b-2 border-black h-8 flex items-center ml-4">
                      <Input
                        id="materialName"
                        value={formData.materialName}
                        onChange={handleChange}
                        className="border-0 rounded-none bg-transparent p-1 focus:ring-0 focus:border-0 h-6 w-full"
                        style={{ boxShadow: "none" }}
                      />
                    </div>
                    <div className="w-32 font-medium text-black ml-8">Inspector</div>
                    <div className="w-64 border-b-2 border-black h-8 flex items-center ml-4">
                      <Input
                        id="inspector"
                        value={formData.inspector}
                        onChange={handleChange}
                        className="border-0 rounded-none bg-transparent p-1 focus:ring-0 focus:border-0 h-6 w-full"
                        style={{ boxShadow: "none" }}
                      />
                    </div>
                  </div>
                </div>

                {/* Bottom Section */}
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

                  {/* Separator line above logos */}
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

              {/* Enhanced Action Buttons */}
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
                        <div className="font-medium">{label.partDescription || "No Description"}</div>
                        <div className="text-sm text-muted-foreground">
                          Part No: {label.partNo} | Lot: {label.lotNo} | Qty: {label.quantity} {label.quantityUnit} |
                          Copies: {label.labelQuantity}
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

              {/* Preview */}
              {previewIndex !== null && labelList[previewIndex] && (
                <div className="mt-6">
                  <h4 className="font-medium mb-2">Preview Label {previewIndex + 1}:</h4>
                  <div className="border-2 border-black bg-white max-w-md mx-auto p-2 text-xs">
                    <div className="text-center mb-2">
                      <div className="font-bold">PT Hang Tong Manufactory</div>
                      <div className="font-bold">OQC Inspection Label</div>
                    </div>
                    <div className="space-y-1">
                      <div>Part Description: {labelList[previewIndex].partDescription}</div>
                      <div>Part No: {labelList[previewIndex].partNo}</div>
                      <div>Date: {labelList[previewIndex].date}</div>
                      <div>Quantity: {labelList[previewIndex].quantity}</div>
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

      {/* Hidden Print Layout */}
      <PrintLayout ref={componentRef} labelList={getExpandedLabelList()} orientation="landscape" />
    </div>
  )
}
