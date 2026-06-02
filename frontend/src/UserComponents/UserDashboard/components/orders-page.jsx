"use client"

import { Filter, Search, Sparkles } from "lucide-react"

import { AppSidebar } from "@/components/app-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SidebarInset } from "@/components/ui/sidebar"
import { OrdersTable } from "@/components/orders-table"

export function OrdersPage() {
  return (
    <div className="flex min-h-screen w-full bg-gray-50">
      <AppSidebar />
      <SidebarInset className="bg-gray-50">
        <DashboardHeader />
        <main className="flex-1 p-6 md:p-8">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Orders</h1>
                <Sparkles className="h-6 w-6 text-pink-500" />
              </div>
              <p className="text-gray-500">
                View and manage all your cake orders
              </p>
            </div>
            
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex w-full max-w-sm items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Search orders..."
                    className="w-full bg-white border-gray-200 pl-10 py-2 focus-visible:ring-pink-500"
                  />
                </div>
                <Button variant="outline" size="icon" className="border-gray-200">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <span className="sr-only">Filter</span>
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Select defaultValue="all">
                  <SelectTrigger className="w-[180px] border-gray-200 bg-white focus:ring-pink-500">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Orders</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="newest">
                  <SelectTrigger className="w-[180px] border-gray-200 bg-white focus:ring-pink-500">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="rounded-lg border-0 bg-white shadow-md">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">All Orders</h2>
                <p className="text-sm text-gray-500">Manage and track all your cake orders</p>
              </div>
              <OrdersTable />
            </div>
          </div>
        </main>
      </SidebarInset>
    </div>
  )
}