import { motion } from "framer-motion";
import { Shield, Target, Users, Zap, Lock, Eye, CheckCircle } from "lucide-react";
import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Zap,
    title: "AI-Powered Detection",
    description: "Advanced machine learning algorithms analyze URLs, emails, and messages in real-time to identify phishing attempts."
  },
  {
    icon: Eye,
    title: "Multi-Source Analysis",
    description: "We cross-reference content against PhishTank databases, pattern matching, and AI analysis for comprehensive protection."
  },
  {
    icon: Lock,
    title: "Privacy First",
    description: "Your scanned content is analyzed securely and never stored without your consent. Your privacy is our priority."
  },
  {
    icon: Target,
    title: "QR Code & Screenshot Scanning",
    description: "Extract and analyze URLs from QR codes and screenshots using advanced OCR technology."
  }
];

const stats = [
  { value: "99.2%", label: "Detection Accuracy" },
  { value: "< 3s", label: "Average Scan Time" },
  { value: "24/7", label: "Real-time Protection" },
  { value: "Free", label: "For Everyone" }
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
            Your trusted companion in the fight against phishing attacks. 
            We're on a mission to make the internet safer for everyone.
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
                Our AI-powered platform analyzes suspicious URLs, emails, SMS messages, QR codes, 
                and screenshots to help you identify potential threats before they cause harm. 
                We combine cutting-edge machine learning with real-time threat intelligence to 
                provide accurate, instant protection.
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
            <h2 className="text-2xl md:text-3xl font-bold mb-2">What We Offer</h2>
            <p className="text-muted-foreground">Comprehensive protection powered by AI</p>
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

        {/* How It Works Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-16"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">How It Works</h2>
            <p className="text-muted-foreground">Simple, fast, and effective protection</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: "1", title: "Paste or Scan", description: "Enter a URL, paste an email/SMS, scan a QR code, or upload a screenshot." },
              { step: "2", title: "AI Analysis", description: "Our multi-layered AI engine analyzes the content against known threats and patterns." },
              { step: "3", title: "Get Results", description: "Receive a detailed risk assessment with clear recommendations in seconds." }
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                className="text-center"
              >
                <div className="relative inline-flex mb-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-2xl font-bold gradient-text">{item.step}</span>
                  </div>
                  {index < 2 && (
                    <div className="hidden md:block absolute top-1/2 left-full w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent -translate-y-1/2" />
                  )}
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Team Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
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
                {["Free to Use", "No Account Required", "Instant Results", "Privacy Focused"].map((tag) => (
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
          <p>© {new Date().getFullYear()} PhishGuard. Protecting you from phishing, one scan at a time.</p>
        </div>
      </footer>
    </div>
  );
}
