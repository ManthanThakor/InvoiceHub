"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { insightApi } from "@/lib/api/endpoints";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageLoading } from "@/components/ui/loading";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, TrendingDown, AlertTriangle, Clock, Zap, Target,
  Lightbulb, RefreshCw, Brain, BarChart3, Send, Bot, User,
  MessageSquare, X, Sparkles
} from "lucide-react";
import toast from "react-hot-toast";

const insightTypeConfig: Record<string, { label: string; variant: "primary" | "success" | "warning" | "danger" | "info" | "purple"; icon: any }> = {
  SalesTrend: { label: "Sales Trend", variant: "success", icon: TrendingUp },
  TopCustomer: { label: "Top Customer", variant: "primary", icon: Target },
  TopProduct: { label: "Top Product", variant: "info", icon: Zap },
  ProfitAlert: { label: "Profit Alert", variant: "warning", icon: TrendingDown },
  StockAlert: { label: "Stock Alert", variant: "danger", icon: AlertTriangle },
  LowStockAlert: { label: "Low Stock", variant: "danger", icon: AlertTriangle },
  PaymentReminder: { label: "Payment Reminder", variant: "warning", icon: Clock },
  SeasonalPattern: { label: "Seasonal Pattern", variant: "purple", icon: BarChart3 },
  AnomalyDetection: { label: "Anomaly", variant: "danger", icon: AlertTriangle },
};

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function InsightsPage() {
  const queryClient = useQueryClient();
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const { data: insights, isLoading } = useQuery({
    queryKey: ["insights"],
    queryFn: async () => {
      const res = await insightApi.list();
      return res.data.data;
    },
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => insightApi.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["insights"] });
    },
    onError: () => toast.error("Failed to update insight"),
  });

  const generateMutation = useMutation({
    mutationFn: () => insightApi.generate(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["insights"] });
      toast.success("New insights generated");
    },
    onError: () => toast.error("Failed to generate insights"),
  });

  const askMutation = useMutation({
    mutationFn: (q: string) => insightApi.ask(q),
    onSuccess: (res) => {
      const answer = res.data.data;
      const msgId = `a-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        { id: msgId, role: "assistant", content: "", timestamp: new Date() },
      ]);
      let i = 0;
      const speed = 18;
      const next = () => {
        if (i >= answer.length) return;
        const chars = i === 0 ? 3 : 1;
        const chunk = answer.slice(i, i + chars);
        i += chars;
        setMessages((prev) =>
          prev.map((m) => (m.id === msgId ? { ...m, content: answer.slice(0, i) } : m))
        );
        setTimeout(next, speed);
      };
      next();
    },
    onError: () => {
      toast.error("AI service is unavailable. Please try again later.");
    },
  });

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleAsk = () => {
    const q = question.trim();
    if (!q || askMutation.isPending) return;

    setMessages((prev) => [
      ...prev,
      {
        id: `q-${Date.now()}`,
        role: "user",
        content: q,
        timestamp: new Date(),
      },
    ]);
    setQuestion("");
    askMutation.mutate(q);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  if (isLoading) return <PageLoading />;

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  const itemAnim = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">AI Insights</h2>
          <p className="text-surface-400 text-sm mt-1">Smart recommendations, analytics, and AI chat for your business</p>
        </div>
        <Button variant="glow" onClick={() => generateMutation.mutate()} isLoading={generateMutation.isPending}>
          <Brain className="h-4 w-4 mr-2" />
          Generate Insights
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
            {(!insights || insights.length === 0) ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="h-16 w-16 rounded-2xl bg-primary-500/10 flex items-center justify-center mb-4">
                    <Lightbulb className="h-8 w-8 text-primary-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-1">No insights yet</h3>
                  <p className="text-sm text-surface-400 text-center max-w-md">
                    Click &quot;Generate Insights&quot; to let AI analyze your business data and provide actionable recommendations.
                  </p>
                </CardContent>
              </Card>
            ) : (
              insights.map((insight) => {
                const config = insightTypeConfig[insight.insightType] || { label: insight.insightType, variant: "default" as const, icon: Lightbulb };
                const Icon = config.icon;
                return (
                  <motion.div key={insight.id} variants={itemAnim}>
                    <Card glass={!insight.isRead} className={insight.isRead ? "opacity-60" : ""}>
                      <div className="flex items-start gap-4">
                        <div className={`p-2.5 rounded-xl shrink-0 ${
                          insight.isRead
                            ? "bg-surface-800/50 text-surface-500"
                            : "bg-primary-500/10 text-primary-400"
                        }`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className={`text-base font-semibold ${insight.isRead ? "text-surface-400" : "text-white"}`}>
                              {insight.title}
                            </h3>
                            <Badge variant={config.variant} size="sm">{config.label}</Badge>
                            {!insight.isRead && (
                              <span className="h-2 w-2 rounded-full bg-primary-500 animate-pulse" />
                            )}
                          </div>
                          <p className="text-sm text-surface-400 mb-1">{insight.description}</p>
                          {insight.recommendation && (
                            <div className="flex items-start gap-2 mt-2 p-3 rounded-lg bg-primary-500/5 border border-primary-500/10">
                              <Lightbulb className="h-4 w-4 text-primary-400 mt-0.5 shrink-0" />
                              <p className="text-xs text-surface-300">{insight.recommendation}</p>
                            </div>
                          )}
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-xs text-surface-500">
                              {new Date(insight.generatedAt).toLocaleDateString("en-IN", {
                                day: "numeric", month: "short", year: "numeric",
                                hour: "2-digit", minute: "2-digit",
                              })}
                            </span>
                            {insight.impactValue != null && (
                              <span className="text-xs font-medium text-emerald-400">
                                Impact: ₹{insight.impactValue.toLocaleString("en-IN")}
                              </span>
                            )}
                          </div>
                        </div>
                        {!insight.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markReadMutation.mutate(insight.id)}
                            disabled={markReadMutation.isPending}
                          >
                            Mark read
                          </Button>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        </div>

        <div className="lg:col-span-1">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-3 border-b border-surface-700/50">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary-400" />
                <div>
                  <CardTitle className="text-sm">AI Financial Assistant</CardTitle>
                  <CardDescription className="text-xs">Ask anything about your business</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0">
              <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[400px]">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-8">
                    <Sparkles className="h-8 w-8 text-primary-400/50 mb-3" />
                    <p className="text-sm text-surface-400 max-w-xs">
                      Ask me about revenue, expenses, cash flow, or any financial question about your business.
                    </p>
                    <div className="flex flex-wrap gap-2 mt-4 justify-center">
                      {[
                        "What's my profit margin?",
                        "How can I reduce expenses?",
                        "Any overdue invoices?",
                        "Cash flow analysis",
                      ].map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => {
                            setMessages((prev) => [
                              ...prev,
                              { id: `q-${Date.now()}`, role: "user", content: suggestion, timestamp: new Date() },
                            ]);
                            askMutation.mutate(suggestion);
                          }}
                          className="text-xs px-3 py-1.5 rounded-full bg-surface-800 text-surface-400 hover:bg-surface-700 hover:text-white transition-colors border border-surface-700"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
                      >
                        {msg.role === "assistant" && (
                          <div className="h-8 w-8 rounded-xl bg-primary-500/10 flex items-center justify-center shrink-0 mt-1">
                            <Bot className="h-4 w-4 text-primary-400" />
                          </div>
                        )}
                        <div className={`max-w-[85%] ${msg.role === "user" ? "order-1" : ""}`}>
                          <div className={`rounded-2xl px-4 py-2.5 text-sm ${
                            msg.role === "user"
                              ? "bg-primary-500/20 text-white border border-primary-500/20"
                              : "bg-surface-800/50 text-surface-200 border border-surface-700/50"
                          }`}>
                            {msg.content}
                          </div>
                          <p className="text-[10px] text-surface-500 mt-1 px-1">
                            {msg.timestamp.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                        {msg.role === "user" && (
                          <div className="h-8 w-8 rounded-xl bg-surface-800 flex items-center justify-center shrink-0 mt-1">
                            <User className="h-4 w-4 text-surface-400" />
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
                {askMutation.isPending && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3"
                  >
                    <div className="h-8 w-8 rounded-xl bg-primary-500/10 flex items-center justify-center shrink-0 mt-1">
                      <Bot className="h-4 w-4 text-primary-400" />
                    </div>
                    <div className="rounded-2xl px-4 py-2.5 bg-surface-800/50 border border-surface-700/50">
                      <div className="flex gap-1">
                        <span className="h-2 w-2 rounded-full bg-surface-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="h-2 w-2 rounded-full bg-surface-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="h-2 w-2 rounded-full bg-surface-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="border-t border-surface-700/50 p-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask a financial question..."
                    disabled={askMutation.isPending}
                    className="flex-1 bg-surface-800/50 border border-surface-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-surface-500 focus:outline-none focus:border-primary-500/50 transition-colors disabled:opacity-50"
                  />
                  <Button
                    size="sm"
                    variant="glow"
                    onClick={handleAsk}
                    isLoading={askMutation.isPending}
                    disabled={!question.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
