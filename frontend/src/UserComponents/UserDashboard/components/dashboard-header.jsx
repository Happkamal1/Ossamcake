"use client";

import { Bell, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-20 items-center gap-4 border-b border-gray-200 bg-white px-6 shadow-sm">
      <SidebarTrigger className="md:hidden" />
      <div className="flex flex-1 items-center gap-4 md:gap-8">
        <h1 className="text-xl font-bold text-gray-800 hidden md:block">OssamCake Dashboard</h1>
        <form className="flex-1 md:max-w-xs">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full bg-gray-50 border-gray-200 pl-10 py-2 focus-visible:ring-pink-500"
            />
          </div>
        </form>
        <div className="ml-auto flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="relative border-gray-200">
                <Bell className="h-5 w-5 text-gray-600" />
                <Badge className="absolute -right-1 -top-1 h-5 w-5 bg-pink-500 p-0 text-[10px]">3</Badge>
                <span className="sr-only">Notifications</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-80 overflow-auto">
                <DropdownMenuItem className="flex flex-col items-start p-3 cursor-pointer">
                  <div className="font-medium">Order Shipped</div>
                  <div className="text-sm text-muted-foreground">Your order #3210 has been shipped</div>
                  <div className="text-xs text-muted-foreground mt-1">2 hours ago</div>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start p-3 cursor-pointer">
                  <div className="font-medium">New Cake Flavor</div>
                  <div className="text-sm text-muted-foreground">New cake flavor available: Strawberry Delight</div>
                  <div className="text-xs text-muted-foreground mt-1">Yesterday</div>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start p-3 cursor-pointer">
                  <div className="font-medium">Special Discount</div>
                  <div className="text-sm text-muted-foreground">Special discount: 20% off on your next order</div>
                  <div className="text-xs text-muted-foreground mt-1">3 days ago</div>
                </DropdownMenuItem>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center font-medium text-pink-500">
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative flex items-center gap-2 rounded-full">
                <img
                  src="/placeholder.svg?height=32&width=32"
                  width={32}
                  height={32}
                  className="rounded-full border border-gray-200"
                  alt="User avatar"
                />
                <span className="hidden text-sm font-medium text-gray-700 md:inline-block">Sarah Johnson</span>
                <span className="sr-only">User menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
