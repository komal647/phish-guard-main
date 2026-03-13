import { Shield } from "lucide-react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { UserMenu } from "./UserMenu";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export function Header() {
  const location = useLocation();
  const { isAdmin } = useAuth();

  return (
    <header className="border-b border-border/50 bg-card/30 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <motion.div 
          className="flex items-center gap-6"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <div className="relative">
              <Shield className="w-8 h-8 text-primary" />
              <motion.div
                className="absolute inset-0 bg-primary/30 blur-lg rounded-full"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold gradient-text">PhishGuard</h1>
              <span className="text-xs text-muted-foreground tracking-widest uppercase">
                AI Phishing Detection
              </span>
            </div>
          </Link>

          <nav className="hidden sm:flex items-center gap-1">
            <Link
              to="/"
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                location.pathname === "/" 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              Scanner
            </Link>
            <Link
              to="/about"
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                location.pathname === "/about" 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              About
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded-md transition-colors border border-transparent flex items-center gap-2",
                  location.pathname === "/admin" 
                    ? "text-primary bg-primary/10 border-primary/30 shadow-[0_0_15px_-3px_rgba(0,255,100,0.3)]" 
                    : "text-muted-foreground hover:text-primary hover:bg-muted/50"
                )}
              >
                <Shield className="w-3 h-3" />
                Admin
              </Link>
            )}
          </nav>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <UserMenu />
        </motion.div>
      </div>
    </header>
  );
}
