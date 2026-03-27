import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { DashboardHeader } from "@/components/dashboard/header"
import { DashboardShell } from "@/components/dashboard/shell"
import { NewLabelClient } from "@/components/new-label-client"

export default async function NewLabelPage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  // Fetch templates for the user
  const templates = await db.template.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return (
    <DashboardShell>
      <DashboardHeader heading="Create Label" text="Choose the type of label you want to create." />
      <div className="grid gap-4">
        <NewLabelClient templates={templates} />
      </div>
    </DashboardShell>
  )
}
