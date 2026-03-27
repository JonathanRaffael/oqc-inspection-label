"use client"

import { forwardRef } from "react"
import Image from "next/image"

interface OQCPackPrintLayoutProps {
  formData: {
    partDescription: string
    partNo: string
    computerNo: string
    lotNo: string
    hardness: string
    color: string
    materialName: string
    date: string
    quantity: string
    netWeight: string
    grossWeight: string
    inspector: string
  }
  showVulcanization: boolean
}

export const OQCPackPrintLayout = forwardRef<HTMLDivElement, OQCPackPrintLayoutProps>(
  ({ formData, showVulcanization }, ref) => {
    return (
      <div
        ref={ref}
        className="w-[210mm] h-[297mm] p-4 bg-white hidden print:block"
        style={{ pageBreakAfter: "always" }}
      >
        <style jsx global>{`
          @media print {
            @page {
              size: portrait;
              margin: 0;
            }
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .print-underline {
              border-bottom: 1px solid black;
              padding-bottom: 2px;
              min-height: 1.2em;
            }
          }
        `}</style>

        {/* 2x3 Grid of Labels */}
        <div className="grid grid-cols-2 grid-rows-3 gap-2 h-full">
          {[1, 2, 3, 4, 5, 6].map((index) => (
            <div key={index} className="border border-black p-2">
              {/* Header */}
              <div className="text-center mb-2">
                <h1 className="text-sm font-bold">PT Hang Tong Manufactory</h1>
                <h2 className="text-xs font-bold">OQC Inspection Label</h2>
              </div>

              {/* Form Content */}
              <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                <div className="flex items-center">
                  <div className="w-16 font-medium">Part Desc.</div>
                  <div className="flex-1 print-underline text-xs">{formData.partDescription}</div>
                </div>

                <div className="flex items-center">
                  <div className="w-8 font-medium">Date</div>
                  <div className="flex-1 print-underline text-xs">{formData.date}</div>
                </div>

                <div className="flex items-center">
                  <div className="w-16 font-medium">Part No</div>
                  <div className="flex-1 print-underline text-xs">{formData.partNo}</div>
                </div>

                <div className="flex items-center">
                  <div className="w-16 font-medium">Quantity (PCS/M)</div>
                  <div className="flex-1 print-underline text-xs">{formData.quantity}</div>
                </div>

                <div className="flex items-center">
                  <div className="w-16 font-medium">Computer No</div>
                  <div className="flex-1 print-underline text-xs">{formData.computerNo}</div>
                </div>

                <div className="flex items-center">
                  <div className="w-16 font-medium">Net Weight (KG)</div>
                  <div className="flex-1 print-underline text-xs">{formData.netWeight}</div>
                </div>

                <div className="flex items-center">
                  <div className="w-16 font-medium">Lot No</div>
                  <div className="flex-1 print-underline text-xs">{formData.lotNo}</div>
                </div>

                <div className="flex items-center">
                  <div className="w-16 font-medium">Gross Weight (KG)</div>
                  <div className="flex-1 print-underline text-xs">{formData.grossWeight}</div>
                </div>

                <div className="flex items-center">
                  <div className="w-16 font-medium">Hardness (A)</div>
                  <div className="flex-1 print-underline text-xs">{formData.hardness}</div>
                </div>

                <div className="flex items-center">
                  <div className="w-16 font-medium">Inspector</div>
                  <div className="flex-1 print-underline text-xs">{formData.inspector}</div>
                </div>

                <div className="flex items-center">
                  <div className="w-16 font-medium">Color</div>
                  <div className="flex-1 print-underline text-xs">{formData.color}</div>
                </div>

                <div></div>

                <div className="flex items-center col-span-2">
                  <div className="w-20 font-medium">Material Name</div>
                  <div className="flex-1 print-underline text-xs">{formData.materialName}</div>
                  <Image src="/images/logo-ul.png" alt="UL" width={15} height={15} className="ml-2" />
                </div>
              </div>

              {/* Logos Section */}
              <div className="mt-2 grid grid-cols-3 gap-1">
                <div className="flex justify-center items-center">
                  {showVulcanization && (
                    <div className="border border-blue-600 p-1 text-center text-blue-600 text-xs font-bold">
                      <div>SECONDARY VULCANIZATION</div>
                      <div>AFTER OUT FROM OVEN</div>
                    </div>
                  )}
                </div>

                <div className="flex justify-center items-center">
                  <div className="border border-green-700 p-1">
                    <Image src="/images/rohs-ok.png" alt="RoHS OK" width={40} height={20} />
                  </div>
                </div>

                <div className="flex justify-center items-center">
                  <Image src="/images/oqc-passed.png" alt="OQC Passed" width={30} height={30} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  },
)

OQCPackPrintLayout.displayName = "OQCPackPrintLayout"
