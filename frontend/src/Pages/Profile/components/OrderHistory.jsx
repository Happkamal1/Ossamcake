import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ShoppingBag, 
  ChevronRight, 
  MapPin, 
  Calendar,
  CreditCard,
  Truck,
  Eye,
  RefreshCw,
  XCircle,
  HelpCircle
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function OrderHistory() {
  const [expandedOrder, setExpandedOrder] = useState(null);

  // Mock professional orders
  const mockOrders = [
    {
      id: "ORD-98317-2026",
      date: "2026-06-15",
      status: "Delivered",
      paymentStatus: "Paid",
      paymentMethod: "Card Ending in 4242",
      amount: 89.90,
      shippingAddress: "123 Sweet Treat Ln, Apt 3B, New York, NY 10001",
      items: [
        { name: "Premium Red Velvet Cake", qty: 1, flavor: "Red Velvet", weight: "1.5 kg", price: 54.90, image: "https://images.unsplash.com/photo-1616260841936-681846018224?w=400" },
        { name: "Customized Chocolate Fudge Cupcakes", qty: 1, flavor: "Chocolate Fudge", weight: "6 Pack", price: 35.00, image: "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=400" }
      ],
      tracking: {
        carrier: "FedEx",
        number: "FX-83921-A92",
        estDelivery: "Delivered on June 16, 2026"
      }
    },
    {
      id: "ORD-72154-2026",
      date: "2026-06-28",
      status: "In Transit",
      paymentStatus: "Paid",
      paymentMethod: "Google Pay",
      amount: 45.00,
      shippingAddress: "123 Sweet Treat Ln, Apt 3B, New York, NY 10001",
      items: [
        { name: "Classic Vanilla Strawberry Cake", qty: 1, flavor: "Vanilla Strawberry", weight: "1 kg", price: 45.00, image: "https://images.unsplash.com/photo-1535141192574-5d4897c13636?w=400" }
      ],
      tracking: {
        carrier: "DHL Express",
        number: "DH-29381-Z10",
        estDelivery: "Expected July 2, 2026"
      }
    }
  ];

  const handleCancelOrder = (orderId) => {
    toast.error(`Cancellation request sent for order ${orderId}. Customer support will review.`);
  };

  const handleReorder = (orderId) => {
    toast.success(`Items from order ${orderId} have been added back to your cart!`);
  };

  return (
    <Card className="border border-border shadow-sm rounded-3xl text-left bg-card">
      <CardHeader>
        <CardTitle className="text-xl font-extrabold text-foreground flex items-center gap-2">
          <ShoppingBag className="h-5.5 w-5.5 text-primary" /> Order History
        </CardTitle>
        <CardDescription>View, track, reorder, or verify details for your recent cake orders.</CardDescription>
      </CardHeader>
      <CardContent>
        {mockOrders.length > 0 ? (
          <div className="space-y-6">
            {mockOrders.map((order) => {
              const isExpanded = expandedOrder === order.id;
              
              return (
                <motion.div 
                  key={order.id}
                  layout
                  className="border border-border rounded-2xl overflow-hidden hover:border-primary/20 transition-colors bg-secondary/10"
                >
                  {/* Order header row */}
                  <div 
                    onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                    className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer select-none"
                  >
                    <div className="space-y-1 text-left">
                      <span className="text-[10px] font-black uppercase text-primary tracking-wider">{order.id}</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs font-bold text-foreground">
                          {new Date(order.date).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    
                    {/* Status badges */}
                    <div className="flex flex-wrap gap-2.5 items-center">
                      <Badge className={`font-bold text-[10px] uppercase border px-2 h-5 flex items-center pointer-events-none ${
                        order.status === "Delivered" 
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                          : "bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse"
                      }`}>
                        {order.status}
                      </Badge>
                      <Badge className="font-bold text-[10px] uppercase border px-2 h-5 bg-blue-500/10 text-blue-500 border-blue-500/20 pointer-events-none">
                        {order.paymentStatus}
                      </Badge>
                      <span className="text-sm font-black text-foreground sm:ml-2">
                        ${order.amount.toFixed(2)}
                      </span>
                      <ChevronRight className={`h-5 w-5 text-muted-foreground/60 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                    </div>
                  </div>

                  {/* Expanded Order Details */}
                  {isExpanded && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="border-t border-border p-5 bg-card text-xs space-y-5 text-left"
                    >
                      {/* Shipping & Payment Meta */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pb-4 border-b border-border/60">
                        <div className="space-y-1">
                          <span className="font-bold text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-primary" /> Delivery Address
                          </span>
                          <p className="text-foreground font-medium pl-4.5">{order.shippingAddress}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="font-bold text-muted-foreground flex items-center gap-1">
                            <CreditCard className="h-3.5 w-3.5 text-primary" /> Payment Method
                          </span>
                          <p className="text-foreground font-medium pl-4.5">{order.paymentMethod}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="font-bold text-muted-foreground flex items-center gap-1">
                            <Truck className="h-3.5 w-3.5 text-primary" /> Logistics Info
                          </span>
                          <p className="text-foreground font-medium pl-4.5">
                            {order.tracking.carrier} ({order.tracking.number})
                            <br />
                            <span className="text-[10px] text-primary font-bold">{order.tracking.estDelivery}</span>
                          </p>
                        </div>
                      </div>

                      {/* Items details list */}
                      <div className="space-y-3.5">
                        <h4 className="font-extrabold text-foreground text-xs uppercase tracking-wider">Ordered Items</h4>
                        <div className="divide-y divide-border/60">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <img src={item.image} alt={item.name} className="h-12 w-12 rounded-xl object-cover border border-border" />
                                <div className="text-left space-y-0.5">
                                  <p className="font-extrabold text-foreground text-xs">{item.name}</p>
                                  <p className="text-[10px] text-muted-foreground font-medium">{item.flavor} / {item.weight}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="font-extrabold text-foreground">${item.price.toFixed(2)}</span>
                                <p className="text-[10px] text-muted-foreground font-medium">Qty: {item.qty}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-wrap gap-2.5 pt-4 border-t border-border/60 justify-end">
                        <Button 
                          onClick={() => handleReorder(order.id)} 
                          size="sm" 
                          variant="outline"
                          className="rounded-xl text-xs font-bold border-border h-9"
                        >
                          <RefreshCw className="h-3.5 w-3.5 mr-1" /> Reorder Items
                        </Button>
                        <Button 
                          asChild
                          size="sm" 
                          variant="outline"
                          className="rounded-xl text-xs font-bold border-border h-9"
                        >
                          <Link to={`/track-order?orderId=${order.id}`}>
                            <Truck className="h-3.5 w-3.5 mr-1" /> Track Delivery
                          </Link>
                        </Button>
                        {order.status === "In Transit" ? (
                          <Button 
                            onClick={() => handleCancelOrder(order.id)} 
                            size="sm" 
                            variant="ghost"
                            className="rounded-xl text-xs font-bold text-destructive hover:bg-destructive/10 hover:text-destructive h-9"
                          >
                            <XCircle className="h-3.5 w-3.5 mr-1" /> Cancel Order
                          </Button>
                        ) : (
                          <Button 
                            onClick={() => toast.info(`FAQ panel opened. Contact bakery at support@ossamcake.com`)}
                            size="sm"
                            variant="ghost"
                            className="rounded-xl text-xs font-bold border-border h-9"
                          >
                            <HelpCircle className="h-3.5 w-3.5 mr-1" /> Need Help?
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 space-y-4">
            <div className="h-16 w-16 bg-secondary rounded-full flex items-center justify-center mx-auto text-muted-foreground">
              <ShoppingBag className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">No orders placed yet!</p>
              <p className="text-xs text-muted-foreground mt-1">Start shopping our delicious cakes to see your history here.</p>
            </div>
            <Button asChild className="bg-primary hover:bg-primary/95 rounded-xl font-bold h-11">
              <Link to="/shop">Shop Cakes Now</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
