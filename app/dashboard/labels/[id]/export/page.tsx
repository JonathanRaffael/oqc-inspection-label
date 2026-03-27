import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { ExportOptions } from "@/components/export-options"

interface ExportPageProps {
  params: {
    id: string
  }
}

export default async function ExportPage({ params }: ExportPageProps) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  const label = await db.label.findUnique({
    where: {
      id: params.id,
      userId: session.user.id,
    },
  })

  if (!label) {
    notFound()
  }

  return <ExportOptions label={label} />
}
