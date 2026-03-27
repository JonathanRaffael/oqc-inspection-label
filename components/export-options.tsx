"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"
import { jsPDF } from "jspdf"
import { toast } from "@/components/ui/use-toast"

interface ExportOptionsProps {
  label: any
}

export function ExportOptions({ label }: ExportOptionsProps) {
  const router = useRouter()
  const [format, setFormat] = useState<"pdf" | "json">("pdf")
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("landscape")

  const handleExport = () => {
    if (format === "pdf") {
      exportToPDF()
    } else if (format === "json") {
      exportToJSON()
    }
  }

  const exportToPDF = () => {
    const doc = new jsPDF({
      orientation,
      unit: "mm",
      format: "a4",
    })

    doc.setFontSize(16)
    doc.text("PT Hang Tong Manufactory", 105, 20, { align: "center" })
    doc.text("OQC Inspection Label", 105, 30, { align: "center" })

    doc.setFontSize(12)
    doc.text(`Part Description: ${label.partDescription}`, 20, 50)
    doc.text(`Part No: ${label.partNo}`, 20, 60)
    doc.text(`Computer No/Name: ${label.computerNo}`, 20, 70)
    doc.text(`Lot No: ${label.lotNo}`, 20, 80)
    doc.text(`Hardness: ${label.hardness}`, 20, 90)
    doc.text(`Color: ${label.color}`, 20, 100)
    doc.text(`Material Name: ${label.materialName}`, 20, 110)

    doc.text(`Date: ${label.date}`, 120, 50)
    doc.text(`Quantity: ${label.quantity}`, 120, 60)
    doc.text(`Net Weight (KG): ${label.netWeight}`, 120, 70)
    doc.text(`Gross Weight (KG): ${label.grossWeight}`, 120, 80)
    doc.text(`Inspector: ${label.inspector}`, 120, 90)

    if (label.showVulcanization) {
      doc.text("SECONDARY VULCANIZATION AFTER OUT FROM OVEN", 70, 130, { align: "center" })
    }

    doc.text("UL", 70, 150, { align: "center" })
    doc.text("RoHS OK", 70, 160, { align: "center" })
    doc.text("OQC PASSED", 150, 150, { align: "center" })

    doc.save(`label-${label.partNo || "export"}.pdf`)

    toast({
      title: "PDF Exported",
      description: "Your label has been exported as a PDF file.",
    })
  }

  const exportToJSON = () => {
    const dataStr = JSON.stringify(label, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

    const exportFileDefaultName = `label-${label.partNo || "export"}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()

    toast({
      title: "JSON Exported",
      description: "Your label has been exported as a JSON file.",
    })
  }

  return (
    <div className="container mx-auto p-4">
      <Button variant="outline" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Export Label</CardTitle>
          <CardDescription>Choose your export options</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="format">Export Format</Label>
            <Select value={format} onValueChange={(value: "pdf" | "json") => setFormat(value)}>
              <SelectTrigger id="format">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF Document</SelectItem>
                <SelectItem value="json">JSON Data</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {format === "pdf" && (
            <div className="space-y-2">
              <Label htmlFor="orientation">Page Orientation</Label>
              <Select value={orientation} onValueChange={(value: "portrait" | "landscape") => setOrientation(value)}>
                <SelectTrigger id="orientation">
                  <SelectValue placeholder="Select orientation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="portrait">Portrait</SelectItem>
                  <SelectItem value="landscape">Landscape</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleExport}>Export Now</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
