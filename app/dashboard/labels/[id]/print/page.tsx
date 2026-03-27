import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { PrintPreview } from "@/components/print-preview"

interface PrintPageProps {
  params: {
    id: string
  }
}

export default async function PrintPage({ params }: PrintPageProps) {
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

  return <PrintPreview label={label} />
}
