"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Package, Layers } from "lucide-react"

interface LabelTypeSelectorProps {
  onSelectType: (type: "oqc" | "bin" | "palet") => void
}

export function LabelTypeSelector({ onSelectType }: LabelTypeSelectorProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onSelectType("oqc")}>
        <CardHeader className="text-center">
          <FileText className="h-12 w-12 mx-auto mb-2 text-blue-600" />
          <CardTitle>OQC Inspection Label</CardTitle>
          <CardDescription>Quality control inspection labels with detailed specifications</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full">Create OQC Label</Button>
        </CardContent>
      </Card>

      <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onSelectType("bin")}>
        <CardHeader className="text-center">
          <Package className="h-12 w-12 mx-auto mb-2 text-green-600" />
          <CardTitle>Bin Label</CardTitle>
          <CardDescription>Simple bin labels for inventory management</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" variant="outline">
            Create Bin Label
          </Button>
        </CardContent>
      </Card>

      <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onSelectType("palet")}>
        <CardHeader className="text-center">
          <Layers className="h-12 w-12 mx-auto mb-2 text-purple-600" />
          <CardTitle>Palet Label</CardTitle>
          <CardDescription>Pallet labels for shipping and logistics</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" variant="outline">
            Create Palet Label
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
