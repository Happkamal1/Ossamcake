import { AppSidebar } from "@/UserComponents/UserDashboard/components/app-sidebar"
import { DashboardHeader } from "@/UserComponents/UserDashboard/components/dashboard-header"
import { DashboardOverview } from "@/UserComponents/UserDashboard/components//dashboard-overview"
import { SidebarInset } from "@/components/ui/sidebar"

export function Dashboard() {
  return (
    <div className="flex min-h-screen w-full bg-gray-50">
      <AppSidebar />
      <SidebarInset className="bg-gray-50">
        <DashboardHeader />
        <main className="flex-1 p-6 md:p-8">
          <DashboardOverview />
        </main>
      </SidebarInset>
    </div>
  )
}
