"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuthStore } from "@/lib/stores/authStore";
import { PageLoading } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, Check, FileText, Shield, BarChart3, Globe, Zap, Users,
  RefreshCw, Download, MessageSquare, ChevronRight, Menu, X, Star
} from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const features = [
  { icon: FileText, title: "GST-Compliant Invoicing", description: "Generate professional GST invoices with automatic tax calculations, HSN codes, and e-way bill integration." },
  { icon: BarChart3, title: "Real-time Dashboard", description: "Monitor revenue, expenses, receivables, and business performance with interactive charts and metrics." },
  { icon: Users, title: "Customer Management", description: "Manage customers, track outstanding balances, and maintain comprehensive contact histories." },
  { icon: Shield, title: "Inventory Tracking", description: "Track stock levels, receive low-stock alerts, and manage inventory across multiple locations." },
  { icon: Globe, title: "GST Reports", description: "Auto-generated GSTR-1, HSN-wise summaries, and state-wise tax reports for seamless compliance." },
  { icon: RefreshCw, title: "Purchase Management", description: "Create purchase orders, manage suppliers, and track expenses with full audit trails." },
  { icon: Download, title: "PDF & Excel Exports", description: "Export invoices, reports, and statements in PDF and Excel formats with a single click." },
  { icon: MessageSquare, title: "AI-Powered Insights", description: "Get smart business recommendations, payment reminders, and anomaly detection powered by AI." },
  { icon: Zap, title: "Multi-User Access", description: "Role-based access control for your team with customizable permissions and audit logging." },
];

const steps = [
  { num: "01", title: "Create Your Account", description: "Sign up in under 2 minutes. Set up your business profile, GSTIN, and preferences." },
  { num: "02", title: "Add Customers & Products", description: "Import or add your customers and product catalog with HSN codes and pricing." },
  { num: "03", title: "Generate Invoices", description: "Create GST-compliant invoices with auto-calculated taxes and send them instantly." },
  { num: "04", title: "Track & Grow", description: "Monitor payments, generate reports, and let AI help you make smarter decisions." },
];

const plans = [
  {
    name: "Starter", price: "Free", period: "forever", popular: false,
    features: ["Up to 25 invoices/month", "Basic dashboard", "1 user", "PDF exports", "Email support"],
  },
  {
    name: "Professional", price: "₹499", period: "/month", popular: true,
    features: ["Unlimited invoices", "Advanced analytics", "5 team members", "AI insights", "GST reports", "Priority support", "API access"],
  },
  {
    name: "Enterprise", price: "Custom", period: "", popular: false,
    features: ["Everything in Pro", "Unlimited users", "Custom integrations", "Dedicated manager", "SLA guarantee", "On-premise option", "White-labeling"],
  },
];

const faqs = [
  { q: "Is InvoiceHub GST-compliant?", a: "Yes, InvoiceHub is fully GST-compliant with automatic calculation of CGST, SGST, IGST, and cess based on your GSTIN and place of supply." },
  { q: "Can I generate e-way bills?", a: "Yes, InvoiceHub supports e-way bill generation for inter-state transactions above the threshold limit." },
  { q: "Is my data secure?", a: "Absolutely. We use AES-256 encryption at rest and TLS 1.3 in transit. All data is hosted on secure AWS servers." },
  { q: "Can I export my data?", a: "Yes, you can export invoices, reports, and customer data in PDF and Excel formats anytime." },
  { q: "Do you offer a free trial?", a: "The Starter plan is free forever with 25 invoices per month. Upgrade anytime as you grow." },
  { q: "Can I invite my team members?", a: "Yes, Professional and Enterprise plans support multi-user access with role-based permissions." },
];

export default function LandingPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    } else {
      setChecking(false);
    }
  }, [isAuthenticated, router]);

  if (checking) return <PageLoading />;

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-surface-700/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                <span className="text-white font-bold text-sm">IH</span>
              </div>
              <span className="text-lg font-bold text-white">InvoiceHub</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-sm text-surface-300 hover:text-white transition-colors">Features</Link>
              <Link href="#how-it-works" className="text-sm text-surface-300 hover:text-white transition-colors">How it Works</Link>
              <Link href="#pricing" className="text-sm text-surface-300 hover:text-white transition-colors">Pricing</Link>
              <Link href="#faq" className="text-sm text-surface-300 hover:text-white transition-colors">FAQ</Link>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Link href="/login"><Button variant="ghost">Sign In</Button></Link>
              <Link href="/register"><Button variant="glow" size="sm">Get Started <ArrowRight className="ml-1.5 h-3.5 w-3.5" /></Button></Link>
            </div>

            <button className="md:hidden text-surface-300" onClick={() => setMobileMenu(!mobileMenu)}>
              {mobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {mobileMenu && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="md:hidden glass-dark border-t border-surface-700/30 px-4 py-4 space-y-3">
            {["Features", "How it Works", "Pricing", "FAQ"].map((s) => (
              <Link key={s} href={`#${s.toLowerCase().replace(/\s+/g, "-")}`} onClick={() => setMobileMenu(false)}
                className="block text-sm text-surface-300 hover:text-white transition-colors py-2">{s}</Link>
            ))}
            <div className="flex gap-3 pt-2 border-t border-surface-700/30">
              <Link href="/login" className="flex-1"><Button variant="secondary" className="w-full">Sign In</Button></Link>
              <Link href="/register" className="flex-1"><Button className="w-full">Get Started</Button></Link>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute top-0 -left-40 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-0 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-40 left-1/2 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-blob animation-delay-4000" />

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 mb-6">
            <Star className="h-3.5 w-3.5 text-primary-400" />
            <span className="text-xs font-medium text-primary-300">Trusted by 10,000+ businesses across India</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
            <span className="text-white">Smart GST Invoicing</span>
            <br />
            <span className="text-gradient">for Your Business</span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg text-surface-400 mb-8">
            InvoiceHub streamlines GST-compliant invoicing, inventory management, and financial reporting with AI-powered insights. Save time, stay compliant, and grow your business.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/register">
              <Button variant="glow" size="xl">
                Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="secondary" size="xl">
                Explore Features <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-8 mt-12 text-sm text-surface-500">
            <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-emerald-400" /> No credit card</span>
            <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-emerald-400" /> Free forever plan</span>
            <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-emerald-400" /> GST compliant</span>
            <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-emerald-400" /> 24/7 support</span>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Everything You Need to <span className="text-gradient">Run Your Business</span></h2>
            <p className="text-surface-400 max-w-2xl mx-auto">From invoicing to compliance, InvoiceHub provides all the tools you need in one platform.</p>
          </motion.div>

          <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div key={i} variants={item} className="glass-card rounded-xl p-6 hover-lift">
                  <div className="h-10 w-10 rounded-lg bg-primary-500/10 flex items-center justify-center mb-4">
                    <Icon className="h-5 w-5 text-primary-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-surface-400 leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-surface-950/0 via-primary-950/10 to-surface-950/0 pointer-events-none" />
        <div className="max-w-5xl mx-auto relative">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Get Started in <span className="text-gradient">4 Simple Steps</span></h2>
            <p className="text-surface-400 max-w-2xl mx-auto">Set up your entire invoicing system in minutes, not days.</p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="relative text-center">
                <div className="h-14 w-14 mx-auto rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-lg mb-4 relative z-10">
                  {step.num}
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-7 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary-500/50 to-primary-500/10" />
                )}
                <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-surface-400">{step.description}</p>
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mt-12">
            <Link href="/register"><Button variant="glow" size="lg">Start Your Journey <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Simple, Transparent <span className="text-gradient">Pricing</span></h2>
            <p className="text-surface-400 max-w-2xl mx-auto">Choose the plan that fits your business. Upgrade, downgrade, or cancel anytime.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan, i) => {
              const Icon = plan.popular ? Star : Check;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`rounded-2xl p-8 relative ${plan.popular ? "gradient-border bg-surface-900/80" : "glass-card"}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary-600 text-white text-xs font-semibold">
                      Most Popular
                    </div>
                  )}

                  <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-surface-400 text-sm ml-1">{plan.period}</span>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-surface-300">
                        <Icon className="h-4 w-4 text-primary-400 mt-0.5 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Link href="/register">
                    <Button className="w-full" variant={plan.popular ? "glow" : "secondary"} size="lg">
                      {plan.name === "Enterprise" ? "Contact Sales" : "Get Started"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Frequently Asked <span className="text-gradient">Questions</span></h2>
          </motion.div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full glass-card rounded-xl p-4 text-left hover-lift"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white">{faq.q}</span>
                    <ChevronRight className={`h-4 w-4 text-surface-400 transition-transform duration-200 ${openFaq === i ? "rotate-90" : ""}`} />
                  </div>
                  {openFaq === i && (
                    <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="text-sm text-surface-400 mt-3 leading-relaxed">
                      {faq.a}
                    </motion.p>
                  )}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
          className="max-w-4xl mx-auto glass-card rounded-2xl p-8 sm:p-12 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 -right-20 w-64 h-64 bg-primary-600/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl" />
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to Transform Your Business?</h2>
            <p className="text-surface-400 max-w-xl mx-auto mb-8">Join 10,000+ businesses that trust InvoiceHub for their GST invoicing and compliance needs. Start free, upgrade when you grow.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/register"><Button variant="glow" size="xl">Get Started Free <ArrowRight className="ml-2 h-5 w-5" /></Button></Link>
              <Link href="/login"><Button variant="secondary" size="xl">Sign In <ChevronRight className="ml-1 h-4 w-4" /></Button></Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-700/30 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">IH</span>
                </div>
                <span className="text-lg font-bold text-white">InvoiceHub</span>
              </div>
              <p className="text-sm text-surface-400 leading-relaxed">Modern GST-compliant invoicing and business management platform for Indian businesses.</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-surface-400">
                <li><Link href="#features" className="hover:text-primary-400 transition-colors">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-primary-400 transition-colors">Pricing</Link></li>
                <li><Link href="#how-it-works" className="hover:text-primary-400 transition-colors">How it Works</Link></li>
                <li><Link href="#faq" className="hover:text-primary-400 transition-colors">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-surface-400">
                <li><span className="hover:text-primary-400 transition-colors cursor-pointer">About</span></li>
                <li><span className="hover:text-primary-400 transition-colors cursor-pointer">Blog</span></li>
                <li><span className="hover:text-primary-400 transition-colors cursor-pointer">Careers</span></li>
                <li><span className="hover:text-primary-400 transition-colors cursor-pointer">Contact</span></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-surface-400">
                <li><span className="hover:text-primary-400 transition-colors cursor-pointer">Privacy Policy</span></li>
                <li><span className="hover:text-primary-400 transition-colors cursor-pointer">Terms of Service</span></li>
                <li><span className="hover:text-primary-400 transition-colors cursor-pointer">GDPR</span></li>
                <li><span className="hover:text-primary-400 transition-colors cursor-pointer">Cookie Policy</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-surface-700/30 mt-8 pt-8 text-center text-sm text-surface-500">
            &copy; {new Date().getFullYear()} InvoiceHub. All rights reserved. Made with ❤️ in India.
          </div>
        </div>
      </footer>
    </div>
  );
}
