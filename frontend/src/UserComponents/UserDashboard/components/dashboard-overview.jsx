"use client";

import {
  CakeSlice,
  Clock,
  DollarSign,
  Package,
  Phone,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RecentOrders } from "./recent-orders";

export function DashboardOverview() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Welcome back, Sarah!
          </h1>
          <Sparkles className="h-6 w-6 text-pink-500" />
        </div>
        <p className="text-gray-500">
          Here&apos;s what&apos;s happening with your orders today.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-md bg-gradient-to-br from-pink-50 to-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-gray-900">24</div>
              <div className="rounded-full bg-pink-100 p-2">
                <Package className="h-5 w-5 text-pink-500" />
              </div>
            </div>
            <div className="mt-3 flex items-center text-xs text-green-600">
              <TrendingUp className="mr-1 h-3 w-3" />
              <span>+2 from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-purple-50 to-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Pending Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-gray-900">3</div>
              <div className="rounded-full bg-purple-100 p-2">
                <Clock className="h-5 w-5 text-purple-500" />
              </div>
            </div>
            <div className="mt-3 flex items-center text-xs text-gray-500">
              <span>1 ready for pickup</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-green-50 to-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Spent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-gray-900">$1,240</div>
              <div className="rounded-full bg-green-100 p-2">
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
            </div>
            <div className="mt-3 flex items-center text-xs text-green-600">
              <TrendingUp className="mr-1 h-3 w-3" />
              <span>+$350 from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Loyalty Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-gray-900">450</div>
              <div className="rounded-full bg-blue-100 p-2">
                <CakeSlice className="h-5 w-5 text-blue-500" />
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>Current</span>
                <span>500 for free cake</span>
              </div>
              <Progress
                value={90}
                className="h-2 bg-blue-100"
                indicatorClassName="bg-blue-500"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        <Card className="border-0 shadow-md md:col-span-8">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-xl font-bold text-gray-900">
                Trending Cakes
              </CardTitle>
              <CardDescription>Most popular cakes this month</CardDescription>
            </div>
            <Button variant="outline" className="text-pink-500 border-pink-200">
              View All
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
              <div className="flex gap-4 items-center p-4 rounded-xl bg-gradient-to-r from-pink-50 to-white border border-pink-100">
                <div className="h-16 w-16 rounded-full overflow-hidden bg-pink-100 flex items-center justify-center">
                  <img
                    src="/placeholder.svg?height=64&width=64"
                    width={64}
                    height={64}
                    alt="Strawberry Cake"
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Strawberry Delight
                  </h3>
                  <p className="text-sm text-gray-500">
                    Fresh strawberries with cream
                  </p>
                  <div className="text-pink-500 font-medium mt-1">$35.99</div>
                </div>
              </div>

              <div className="flex gap-4 items-center p-4 rounded-xl bg-gradient-to-r from-purple-50 to-white border border-purple-100">
                <div className="h-16 w-16 rounded-full overflow-hidden bg-purple-100 flex items-center justify-center">
                  <img
                    src="/placeholder.svg?height=64&width=64"
                    width={64}
                    height={64}
                    alt="Chocolate Cake"
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Chocolate Fusion
                  </h3>
                  <p className="text-sm text-gray-500">
                    Rich chocolate with ganache
                  </p>
                  <div className="text-pink-500 font-medium mt-1">$42.99</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md md:col-span-4">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">
              Quick Actions
            </CardTitle>
            <CardDescription>Frequently used actions</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button className="w-full justify-start bg-pink-500 hover:bg-pink-600">
              <CakeSlice className="mr-2 h-4 w-4" />
              Place New Order
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start border-gray-200"
            >
              <Package className="mr-2 h-4 w-4 text-gray-500" />
              Track Order
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start border-gray-200"
            >
              <Phone className="mr-2 h-4 w-4 text-gray-500" />
              Contact Support
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col items-start pt-0">
            <div className="mt-2 rounded-lg bg-gradient-to-r from-pink-50 to-white p-4 border border-pink-100 w-full">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-pink-500" />
                <h4 className="font-medium text-gray-900">Special Offer</h4>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Get 15% off on birthday cakes this week! Use code{" "}
                <span className="font-bold text-pink-500">BDAY15</span>
              </p>
              <Button
                variant="link"
                asChild
                className="mt-2 h-auto p-0 text-pink-500"
              >
                <Link to="/orders/new">Order Now →</Link>
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>

      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900">
            Recent Orders
          </CardTitle>
          <CardDescription>
            Your order history from the past 30 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4 bg-gray-100">
              <TabsTrigger value="all" className="data-[state=active]:bg-white">
                All Orders
              </TabsTrigger>
              <TabsTrigger
                value="pending"
                className="data-[state=active]:bg-white"
              >
                Pending
              </TabsTrigger>
              <TabsTrigger
                value="completed"
                className="data-[state=active]:bg-white"
              >
                Completed
              </TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <RecentOrdersTable />
            </TabsContent>
            <TabsContent value="pending">
              <RecentOrdersTable filter="pending" />
            </TabsContent>
            <TabsContent value="completed">
              <RecentOrdersTable filter="completed" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
