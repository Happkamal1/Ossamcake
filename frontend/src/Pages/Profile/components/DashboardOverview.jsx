import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ShoppingBag, 
  Clock, 
  Heart, 
  MapPin, 
  Gift, 
  ShieldCheck, 
  CheckCircle,
  ArrowRight,
  TrendingUp
} from "lucide-react";
import { motion } from "framer-motion";

export default function DashboardOverview({ user, wishlistCount, onNavigateTab }) {
  const addressesCount = user.addresses ? user.addresses.length : 0;

  // Compute a security score from 0 to 100
  let securityScore = 20; // base score for account creation
  if (user.isEmailVerified) securityScore += 30;
  if (user.is2FAEnabled) securityScore += 30;
  if (user.passkeys && user.passkeys.length > 0) securityScore += 20;

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const dashboardStats = [
    {
      title: "Total Orders",
      value: "0",
      description: "Lifetime order count",
      icon: ShoppingBag,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      tab: "orders",
    },
    {
      title: "Pending Orders",
      value: "0",
      description: "Active delivery tracking",
      icon: Clock,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      tab: "orders",
    },
    {
      title: "Wishlist Items",
      value: wishlistCount,
      description: "Items saved for later",
      icon: Heart,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      tab: "wishlist",
    },
    {
      title: "Saved Addresses",
      value: addressesCount,
      description: "Stored shipping locations",
      icon: MapPin,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      tab: "addresses",
    },
    {
      title: "Reward Points",
      value: user.loyaltyPoints || 0,
      description: "Earn 10 points per $1 spent",
      icon: Gift,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      tab: "rewards",
    },
    {
      title: "Security Score",
      value: `${securityScore}%`,
      description: securityScore >= 80 ? "Account secure" : "Needs enhancement",
      icon: ShieldCheck,
      color: securityScore >= 80 ? "text-emerald-500" : "text-amber-500",
      bgColor: securityScore >= 80 ? "bg-emerald-500/10" : "bg-amber-500/10",
      tab: "security",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/10 border border-border p-6 sm:p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm text-left"
      >
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-black text-foreground">
            Welcome back, {user.name ? user.name.split(" ")[0] : "Customer"}! 👋
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Review your order status, loyalty progress, security configuration, and manage your address book.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-card border border-border px-4 py-2.5 rounded-2xl shadow-sm self-stretch md:self-auto justify-between">
          <div className="text-left">
            <span className="text-[10px] font-black uppercase text-primary tracking-wider">Account Tier</span>
            <p className="text-xs font-bold text-foreground">VIP Guest Member</p>
          </div>
          <Badge className="bg-primary/20 text-primary border border-primary/30">Active</Badge>
        </div>
      </motion.div>

      {/* Rewards Overview Progress */}
      <Card className="border border-border shadow-sm rounded-3xl text-left bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-extrabold text-foreground flex items-center gap-2">
              <Gift className="h-5 w-5 text-primary" /> Loyalty Rewards Status
            </CardTitle>
            <Badge className="bg-primary/10 text-primary font-bold text-xs pointer-events-none">
              Level 1
            </Badge>
          </div>
          <CardDescription>Earn rewards point for each order to unlock exclusive dessert items.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-foreground">
            <span>Points Earned: {user.loyaltyPoints || 0} pts</span>
            <span>Next Tier: 500 pts</span>
          </div>
          <Progress value={Math.min(((user.loyaltyPoints || 0) / 500) * 100, 100)} className="h-2.5 rounded-full" />
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            <span>You are <strong>{Math.max(500 - (user.loyaltyPoints || 0), 0)} points</strong> away from receiving a free customized celebration cupcake!</span>
          </div>
        </CardContent>
      </Card>

      {/* Summary grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={idx}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ scale: 1.02 }}
              onClick={() => onNavigateTab(stat.tab)}
              className="cursor-pointer"
            >
              <Card className="border border-border hover:border-primary/30 shadow-sm rounded-3xl transition-all h-full bg-card flex flex-col justify-between">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <span className="text-sm font-bold text-muted-foreground">{stat.title}</span>
                  <div className={`h-10 w-10 rounded-2xl ${stat.bgColor} flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent className="pt-2 text-left">
                  <div className="text-2xl font-black text-foreground">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center justify-between font-medium">
                    <span>{stat.description}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/60 group-hover:text-primary transition-colors" />
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
