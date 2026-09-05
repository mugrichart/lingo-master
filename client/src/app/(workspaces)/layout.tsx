import { AppSidebar } from "@/components/app-sidebar"

import {
  SidebarTrigger,
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="fixed left-3 top-3 z-50">
          <SidebarTrigger />
        </div>
        { children }
      </SidebarInset>
    </SidebarProvider>
  )
}
