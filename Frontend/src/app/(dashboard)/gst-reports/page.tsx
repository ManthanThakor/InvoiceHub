"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { invoiceApi } from "@/lib/api/endpoints";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { PageLoading } from "@/components/ui/loading";
import { motion } from "framer-motion";
import {
  FileText, Download, BarChart3, Globe, Hash,
  ChevronDown, IndianRupee, TrendingUp, ArrowUpRight
} from "lucide-react";
import { formatCurrency } from "@/lib/utils/cn";
import { documentApi } from "@/lib/api/endpoints";
import toast from "react-hot-toast";

const months = [
  { value: "1", label: "January" }, { value: "2", label: "February" },
  { value: "3", label: "March" }, { value: "4", label: "April" },
  { value: "5", label: "May" }, { value: "6", label: "June" },
  { value: "7", label: "July" }, { value: "8", label: "August" },
  { value: "9", label: "September" }, { value: "10", label: "October" },
  { value: "11", label: "November" }, { value: "12", label: "December" },
];

const years = Array.from({ length: 5 }, (_, i) => {
  const y = new Date().getFullYear() - 2 + i;
  return { value: String(y), label: String(y) };
});

export default function GSTReportsPage() {
  const now = new Date();
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [year, setYear] = useState(String(now.getFullYear()));

  const { data: gstData, isLoading } = useQuery({
    queryKey: ["gst-summary", month, year],
    queryFn: async () => {
      const res = await invoiceApi.gstSummary(parseInt(month), parseInt(year));
      return res.data.data;
    },
  });

  const handleExport = async () => {
    try {
      const res = await documentApi.exportGSTR1(parseInt(month), parseInt(year));
      const url = window.URL.createObjectURL(new Blob([res.data as any]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `GSTR1-${month}-${year}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("GSTR-1 exported successfully");
    } catch {
      toast.error("Failed to export GSTR-1");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">GST Reports</h2>
          <p className="text-surface-400 text-sm mt-1">Monthly GST summary and compliance reports</p>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Export GSTR-1
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="w-40">
          <Select
            label="Month"
            options={months}
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        </div>
        <div className="w-32">
          <Select
            label="Year"
            options={years}
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <PageLoading />
      ) : !gstData ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-16 w-16 rounded-2xl bg-surface-800/50 flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-surface-500" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">No data for this period</h3>
            <p className="text-sm text-surface-400">No invoices found for {months[parseInt(month) - 1]?.label} {year}.</p>
          </CardContent>
        </Card>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Taxable Amount", value: gstData.taxableAmount ?? 0, icon: IndianRupee, color: "from-blue-500 to-blue-600" },
              { label: "Total IGST", value: gstData.totalIGST ?? 0, icon: TrendingUp, color: "from-purple-500 to-purple-600" },
              { label: "Total CGST", value: gstData.totalCGST ?? 0, icon: TrendingUp, color: "from-emerald-500 to-emerald-600" },
              { label: "Total SGST", value: gstData.totalSGST ?? 0, icon: TrendingUp, color: "from-amber-500 to-amber-600" },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card rounded-xl p-4 hover-lift"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-surface-400 uppercase tracking-wider">{stat.label}</span>
                    <div className={`p-1.5 rounded-lg bg-gradient-to-br ${stat.color} bg-opacity-10`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div className="text-xl font-bold text-white">{formatCurrency(stat.value)}</div>
                </motion.div>
              );
            })}
          </div>

          {/* Total Tax + Cess */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Total Tax</CardTitle>
                <CardDescription>Combined tax liability</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-white">{formatCurrency(gstData.totalTax ?? 0)}</p>
                <div className="flex items-center gap-2 mt-2 text-xs text-surface-400">
                  <ArrowUpRight className="h-3 w-3 text-emerald-400" />
                  <span className="text-emerald-400">Includes IGST + CGST + SGST</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Cess Amount</CardTitle>
                <CardDescription>Additional cess collected</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-white">{formatCurrency(gstData.totalCess ?? 0)}</p>
              </CardContent>
            </Card>
          </div>

          {/* HSN Summary */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Hash className="h-5 w-5 text-primary-400" />
                <div>
                  <CardTitle>HSN-wise Summary</CardTitle>
                  <CardDescription>Tax summary by HSN code</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {(gstData.hsnSummary?.length ?? 0) === 0 ? (
                <p className="text-sm text-surface-500 text-center py-8">No HSN data for this period</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-surface-700/50">
                        <th className="text-left py-3 px-2 text-surface-400 font-medium">HSN Code</th>
                        <th className="text-right py-3 px-2 text-surface-400 font-medium">Taxable Amount</th>
                        <th className="text-right py-3 px-2 text-surface-400 font-medium">IGST</th>
                        <th className="text-right py-3 px-2 text-surface-400 font-medium">CGST</th>
                        <th className="text-right py-3 px-2 text-surface-400 font-medium">SGST</th>
                        <th className="text-right py-3 px-2 text-surface-400 font-medium">Total Tax</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(gstData.hsnSummary ?? []).map((hsn, i) => (
                        <tr key={hsn.hsnCode} className={`border-b border-surface-700/30 hover:bg-surface-800/30 transition-colors ${i % 2 === 0 ? "bg-surface-800/10" : ""}`}>
                          <td className="py-3 px-2 text-white font-medium">{hsn.hsnCode}</td>
                          <td className="py-3 px-2 text-right text-surface-200">{formatCurrency(hsn.taxableAmount)}</td>
                          <td className="py-3 px-2 text-right text-purple-400">{formatCurrency(hsn.igstAmount)}</td>
                          <td className="py-3 px-2 text-right text-emerald-400">{formatCurrency(hsn.cgstAmount)}</td>
                          <td className="py-3 px-2 text-right text-amber-400">{formatCurrency(hsn.sgstAmount)}</td>
                          <td className="py-3 px-2 text-right text-white font-semibold">{formatCurrency(hsn.totalTax)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* State-wise Summary */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary-400" />
                <div>
                  <CardTitle>State-wise Summary</CardTitle>
                  <CardDescription>Inter-state and intra-state tax breakdown</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {(gstData.statewiseSummary?.length ?? 0) === 0 ? (
                <p className="text-sm text-surface-500 text-center py-8">No state-wise data for this period</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-surface-700/50">
                        <th className="text-left py-3 px-2 text-surface-400 font-medium">State</th>
                        <th className="text-center py-3 px-2 text-surface-400 font-medium">Code</th>
                        <th className="text-right py-3 px-2 text-surface-400 font-medium">Invoices</th>
                        <th className="text-right py-3 px-2 text-surface-400 font-medium">Taxable Amount</th>
                        <th className="text-right py-3 px-2 text-surface-400 font-medium">IGST</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(gstData.statewiseSummary ?? []).map((sw, i) => (
                        <tr key={sw.stateCode} className={`border-b border-surface-700/30 hover:bg-surface-800/30 transition-colors ${i % 2 === 0 ? "bg-surface-800/10" : ""}`}>
                          <td className="py-3 px-2 text-white font-medium">{sw.state}</td>
                          <td className="py-3 px-2 text-center text-surface-400">{sw.stateCode}</td>
                          <td className="py-3 px-2 text-right">
                            <Badge variant="info" size="sm">{sw.invoiceCount}</Badge>
                          </td>
                          <td className="py-3 px-2 text-right text-surface-200">{formatCurrency(sw.taxableAmount)}</td>
                          <td className="py-3 px-2 text-right text-purple-400">{formatCurrency(sw.igstAmount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
