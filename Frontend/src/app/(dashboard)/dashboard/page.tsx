"use client";

import { useQuery } from "@tanstack/react-query";
import { tenantApi, inventoryApi } from "@/lib/api/endpoints";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageLoading } from "@/components/ui/loading";
import { StatusBadge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils/cn";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  IndianRupee, TrendingUp, TrendingDown, Wallet, Users,
  FileText, AlertTriangle, Package, ArrowUp, ArrowDown,
  Receipt, ShoppingCart, ChevronRight
} from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemAnim = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const router = useRouter();

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => { const res = await tenantApi.dashboard(); return res.data.data; },
  });

  const { data: lowStockData } = useQuery({
    queryKey: ["low-stock-products"],
    queryFn: async () => { const res = await inventoryApi.lowStock(); return res.data.data; },
  });

  if (isLoading) return <PageLoading />;

  const metrics = [
    {
      title: "Total Revenue",
      value: formatCurrency(dashboard?.totalRevenue || 0),
      change: dashboard?.revenueGrowthPct,
      icon: IndianRupee,
      color: "text-emerald-400 bg-emerald-500/10",
      href: "/invoices",
    },
    {
      title: "Total Expenses",
      value: formatCurrency(dashboard?.totalExpenses || 0),
      icon: Wallet,
      color: "text-red-400 bg-red-500/10",
      href: "/expenses",
    },
    {
      title: "Net Profit",
      value: formatCurrency(dashboard?.netProfit || 0),
      icon: TrendingUp,
      color: dashboard && dashboard.netProfit >= 0 ? "text-blue-400 bg-blue-500/10" : "text-red-400 bg-red-500/10",
      href: "/insights",
    },
    {
      title: "Outstanding Receivables",
      value: formatCurrency(dashboard?.outstandingReceivables || 0),
      icon: Receipt,
      color: "text-amber-400 bg-amber-500/10",
      href: "/invoices?overdue=true",
    },
    {
      title: "Outstanding Payables",
      value: formatCurrency(dashboard?.outstandingPayables || 0),
      icon: ShoppingCart,
      color: "text-purple-400 bg-purple-500/10",
      href: "/purchase-orders",
    },
    {
      title: "Total Customers",
      value: dashboard?.totalCustomers || 0,
      subtext: `+${dashboard?.newCustomersThisPeriod || 0} this period`,
      icon: Users,
      color: "text-cyan-400 bg-cyan-500/10",
      href: "/customers",
    },
    {
      title: "Overdue Invoices",
      value: dashboard?.overdueInvoices || 0,
      icon: AlertTriangle,
      color: "text-red-400 bg-red-500/10",
      href: "/invoices",
    },
    {
      title: "Low Stock Products",
      value: lowStockData?.length || 0,
      icon: Package,
      color: "text-orange-400 bg-orange-500/10",
      href: "/products",
    },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Dashboard</h2>
        <p className="text-surface-400 text-sm mt-1">
          {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      <motion.div variants={container} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <motion.div key={metric.title} variants={itemAnim} onClick={() => router.push(metric.href)}>
              <Card hover glass className="h-full cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2 rounded-lg ${metric.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    {"change" in metric && metric.change !== undefined && (
                      <div className={`flex items-center gap-0.5 text-xs font-medium ${metric.change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {metric.change >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                        {Math.abs(metric.change).toFixed(1)}%
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-surface-400 mb-1">{metric.title}</p>
                  <p className="text-xl font-bold text-white">{metric.value}</p>
                  {"subtext" in metric && metric.subtext && (
                    <p className="text-xs text-surface-500 mt-0.5">{metric.subtext}</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemAnim} className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>AI Insights</CardTitle>
                  <CardDescription>Smart recommendations for your business</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => router.push("/insights")}>
                  View All <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {dashboard?.recentInsights && dashboard.recentInsights.length > 0 ? (
                <div className="space-y-3">
                  {dashboard.recentInsights.slice(0, 5).map((insight) => (
                    <div key={insight.id} className="flex items-start gap-3 p-3 rounded-lg bg-surface-800/30 border border-surface-700/30">
                      <div className="p-1.5 rounded-lg bg-primary-500/10 mt-0.5">
                        <TrendingUp className="h-4 w-4 text-primary-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white">{insight.title}</p>
                        <p className="text-xs text-surface-400 mt-0.5">{insight.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-surface-500 text-center py-8">No insights available yet. Generate insights from the Insights page.</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemAnim}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Low Stock Alerts</CardTitle>
                  <CardDescription>Products below minimum stock</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => router.push("/products")}>
                  View All <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {lowStockData && lowStockData.length > 0 ? (
                <div className="space-y-2">
                  {lowStockData.slice(0, 6).map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-2.5 rounded-lg bg-surface-800/30 border border-surface-700/30">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{product.name}</p>
                        <p className="text-xs text-surface-400">{product.sku}</p>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <p className="text-sm font-semibold text-red-400">{product.currentStock}</p>
                        <p className="text-xs text-surface-500">min: {product.minimumStock}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-surface-500 text-center py-8">All products are well-stocked</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
