import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { DashboardHeader } from "@/components/dashboard/header"
import { DashboardShell } from "@/components/dashboard/shell"
import { LabelForm } from "@/components/label-form"

interface LabelPageProps {
  params: {
    id: string
  }
}

export default async function LabelPage({ params }: LabelPageProps) {
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

  // Fetch templates and convert date fields to string
  const templatesRaw = await db.template.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  const templates = templatesRaw.map((template) => ({
    ...template,
    createdAt: template.createdAt.toISOString(),
    updatedAt: template.updatedAt.toISOString(),
  }))

  return (
    <DashboardShell>
      <DashboardHeader heading="Edit Label" text="Edit your OQC inspection label." />
      <div className="grid gap-4">
        <LabelForm label={label} templates={templates} />
      </div>
    </DashboardShell>
  )
}
