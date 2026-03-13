import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface RiskMeterProps {
  percentage: number;
  label: 'safe' | 'suspicious' | 'phishing';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function RiskMeter({ percentage, label, size = 'lg', showLabel = true }: RiskMeterProps) {
  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-36 h-36',
    lg: 'w-48 h-48'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl'
  };

  const labelSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const getColor = () => {
    if (label === 'safe') return 'hsl(var(--safe))';
    if (label === 'suspicious') return 'hsl(var(--warning))';
    return 'hsl(var(--danger))';
  };

  const getGlowClass = () => {
    if (label === 'safe') return 'glow-safe';
    if (label === 'suspicious') return 'glow-warning';
    return 'glow-danger';
  };

  const getBgClass = () => {
    if (label === 'safe') return 'bg-safe/10';
    if (label === 'suspicious') return 'bg-warning/10';
    return 'bg-danger/10';
  };

  const getTextClass = () => {
    if (label === 'safe') return 'text-safe';
    if (label === 'suspicious') return 'text-warning';
    return 'text-danger';
  };

  const circumference = 2 * Math.PI * 44;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className={cn("relative", sizeClasses[size])}>
        {/* Background glow */}
        <motion.div 
          className={cn("absolute inset-0 rounded-full blur-xl opacity-30", getBgClass())}
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* SVG Meter */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke="hsl(var(--secondary))"
            strokeWidth="8"
          />
          
          {/* Progress circle */}
          <motion.circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke={getColor()}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className={getGlowClass()}
            style={{ filter: `drop-shadow(0 0 6px ${getColor()})` }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span 
            className={cn("font-bold font-mono", textSizes[size], getTextClass())}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          >
            {percentage.toFixed(1)}%
          </motion.span>
          <span className={cn("text-muted-foreground uppercase tracking-wider", labelSizes[size])}>
            risk
          </span>
        </div>
      </div>

      {showLabel && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className={cn(
            "px-4 py-2 rounded-full font-semibold uppercase tracking-wider text-sm",
            getBgClass(),
            getTextClass(),
            getGlowClass()
          )}
        >
          {label}
        </motion.div>
      )}
    </div>
  );
}
