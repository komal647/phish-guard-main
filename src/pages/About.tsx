import { motion } from "framer-motion";
import { Shield, Target, Users, Zap, Lock, Eye, CheckCircle, Brain, Cpu, Globe, ScanLine, FileSearch, Camera } from "lucide-react";
import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Brain,
    title: "Logistic Regression ML Model",
    description: "A custom-built binary classifier using 16 weighted features and the sigmoid function to calculate phishing probability in real-time."
  },
  {
    icon: Eye,
    title: "6-Source Threat Intelligence",
    description: "Cross-references URLs against VirusTotal, Google Safe Browsing, PhishTank, IPQualityScore, Cloudmersive, and URLhaus through secure serverless APIs."
  },
  {
    icon: Lock,
    title: "Secure API Architecture",
    description: "All third-party API keys are stored in Vercel environment variables and proxied through serverless functions — never exposed to the browser."
  },
  {
    icon: Cpu,
    title: "NLP Feature Extraction",
    description: "Analyzes text for urgency keywords, grammar patterns, credential requests, cryptocurrency addresses, and sender reputation signals."
  },
  {
    icon: ScanLine,
    title: "Lookalike & Homograph Detection",
    description: "Detects Unicode-based domain impersonation (e.g., g00gle.com, pаypal.com) using character substitution tables across 11 known brands."
  },
  {
    icon: Camera,
    title: "QR Code & Screenshot Scanning",
    description: "Extract and analyze URLs from QR codes (html5-qrcode) and screenshots (Tesseract.js OCR) with brand color mismatch analysis."
  },
  {
    icon: FileSearch,
    title: "PDF Email Extraction",
    description: "Upload email PDFs to extract content, headers, and embedded URLs using pdfjs-dist with Tesseract.js OCR fallback for image-based PDFs."
  },
  {
    icon: Globe,
    title: "DNS Forensics & Domain Age",
    description: "Queries Cloudflare DNS-over-HTTPS for A/MX/TXT records and verifies domain age via RDAP/WHOIS — newly registered domains trigger high-risk alerts."
  }
];

const stats = [
  { value: "16", label: "ML Features" },
  { value: "6", label: "Threat Intel APIs" },
  { value: "11", label: "Brand Monitors" },
  { value: "Free", label: "For Everyone" }
];

const techStack = [
  { category: "AI / ML", items: ["Logistic Regression Classifier", "NLP Feature Extraction", "Tesseract.js OCR", "Brand Color Analysis (Canvas API)"] },
  { category: "Frontend", items: ["React 18 + TypeScript", "Vite 5", "TailwindCSS", "Framer Motion", "shadcn/ui (Radix)"] },
  { category: "Backend", items: ["Vercel Serverless Functions", "Firebase Auth", "Cloud Firestore", "Cloudflare DNS-over-HTTPS"] },
  { category: "Scanning", items: ["html5-qrcode (QR)", "pdfjs-dist (PDF)", "Tesseract.js (OCR)", "URL Expansion (unshorten.me)"] }
];

const algorithms = [
  { name: "Logistic Regression", description: "σ(z) = 1/(1+e^(-z)) with 16 weighted features for binary phishing classification" },
  { name: "Homograph Detection", description: "Unicode character substitution mapping against 11 known brand domains" },
  { name: "Regex-based NLP", description: "Pattern matching for urgency, credential requests, crypto wallets, and suspicious attachments" },
  { name: "DNS Forensics", description: "Cloudflare DoH queries for A/MX/TXT records to detect infrastructure anomalies" },
  { name: "Domain Age Verification", description: "RDAP → WHOIS fallback to flag domains registered < 30 days ago" },
  { name: "URL Risk Scoring", description: "Multi-source score aggregation: min(local ML + server API scores, 100)" }
];

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Shield className="w-20 h-20 text-primary" />
              <motion.div
                className="absolute inset-0 bg-primary/30 blur-xl rounded-full"
                animate={{ 
                  scale: [1, 1.3, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            About <span className="gradient-text">PhishGuard</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            AI-powered phishing detection combining machine learning, NLP, computer vision, 
            and multi-source threat intelligence to protect you in real-time.
          </p>
        </motion.section>

        {/* Stats Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-16"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
              >
                <Card className="bg-card/50 border-border/50 hover:border-primary/50 transition-colors text-center">
                  <CardContent className="pt-6">
                    <p className="text-3xl md:text-4xl font-bold gradient-text mb-1">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Mission Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16"
        >
          <Card className="bg-card/50 border-border/50 overflow-hidden">
            <CardContent className="p-8 md:p-12">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Target className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">Our Mission</h2>
                  <div className="h-1 w-16 bg-gradient-to-r from-primary to-primary/50 rounded-full" />
                </div>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Phishing attacks are responsible for over 90% of data breaches worldwide, 
                costing individuals and businesses billions of dollars every year. At PhishGuard, 
                we believe everyone deserves access to powerful cybersecurity tools—not just large corporations.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed mt-4">
                Our platform combines a <strong>custom logistic regression ML model</strong> with 
                <strong> 6 real-time threat intelligence APIs</strong>, <strong>DNS forensics</strong>, 
                <strong> domain age verification</strong>, and <strong>NLP-based content analysis </strong> 
                to deliver accurate, instant protection across URLs, emails, SMS, QR codes, screenshots, and PDFs.
              </p>
            </CardContent>
          </Card>
        </motion.section>

        {/* Features Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-16"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Core Capabilities</h2>
            <p className="text-muted-foreground">Multi-layered detection powered by AI and threat intelligence</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
              >
                <Card className="bg-card/50 border-border/50 hover:border-primary/50 transition-all h-full group">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <feature.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                        <p className="text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Algorithms Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-16"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Algorithms & Models</h2>
            <p className="text-muted-foreground">The intelligence behind the detection</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {algorithms.map((algo, index) => (
              <motion.div
                key={algo.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 + index * 0.08 }}
              >
                <Card className="bg-card/50 border-border/50 hover:border-primary/30 transition-all h-full">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <Cpu className="w-4 h-4 text-primary" />
                      <h3 className="font-semibold text-sm">{algo.name}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{algo.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Tech Stack Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-16"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Technology Stack</h2>
            <p className="text-muted-foreground">Built with modern, production-ready technologies</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {techStack.map((stack, index) => (
              <motion.div
                key={stack.category}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
              >
                <Card className="bg-card/50 border-border/50 h-full">
                  <CardContent className="p-5">
                    <h3 className="font-bold text-primary mb-3 text-sm uppercase tracking-wider">{stack.category}</h3>
                    <ul className="space-y-2">
                      {stack.items.map((item) => (
                        <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="w-3.5 h-3.5 text-primary/70 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* How It Works Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-16"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">How It Works</h2>
            <p className="text-muted-foreground">Multi-layered detection pipeline</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: "1", title: "Input", description: "Paste a URL, email, or SMS — or scan a QR code, screenshot, or PDF document." },
              { step: "2", title: "ML Analysis", description: "Our 16-feature logistic regression model extracts NLP features and calculates phishing probability." },
              { step: "3", title: "Threat Intel", description: "URLs are checked against 6 threat intelligence APIs through secure serverless functions." },
              { step: "4", title: "Results", description: "Scores are merged and you get a detailed risk assessment with forensics, indicators, and recommendations." }
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                className="text-center"
              >
                <div className="relative inline-flex mb-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-2xl font-bold gradient-text">{item.step}</span>
                  </div>
                  {index < 3 && (
                    <div className="hidden md:block absolute top-1/2 left-full w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent -translate-y-1/2" />
                  )}
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Bottom CTA */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-8 md:p-12 text-center">
              <Users className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Built for Everyone</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
                PhishGuard was created by cybersecurity enthusiasts who believe that 
                protection from phishing attacks should be accessible to all—whether you're 
                a tech-savvy professional or someone just learning about online safety.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {["Free to Use", "No Account Required", "Instant Results", "Privacy Focused", "Open Source", "PWA Installable"].map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {tag}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>© {new Date().getFullYear()} PhishGuard. AI-Powered Phishing Detection — Protecting you one scan at a time.</p>
        </div>
      </footer>
    </div>
  );
}
