import { motion, AnimatePresence } from "framer-motion";
import { Shield, ShieldAlert, ShieldX, ChevronDown, ChevronUp, AlertTriangle, CheckCircle, Info, XCircle, ExternalLink } from "lucide-react";
import { useState } from "react";
import { RiskMeter } from "./RiskMeter";
import { ManualChecklist } from "./ManualChecklist";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { DetectionResult } from "@/lib/api";
import { cn } from "@/lib/utils";

// Check if result has PhishTank verification
function hasPhishTankVerification(result: DetectionResult): { checked: boolean; confirmed: boolean; phishId?: string } {
  const phishTankIndicator = result.details.indicators.find(
    ind => ind.name === 'PhishTank Confirmed' || ind.name === 'PhishTank Known'
  );

  if (!phishTankIndicator) {
    return { checked: false, confirmed: false };
  }

  const isConfirmed = phishTankIndicator.name === 'PhishTank Confirmed';
  const idMatch = phishTankIndicator.description.match(/ID: (\d+)/);

  return {
    checked: true,
    confirmed: isConfirmed,
    phishId: idMatch ? idMatch[1] : undefined
  };
}

interface ScanResultProps {
  result: DetectionResult;
  onNewScan: () => void;
}

export function ScanResult({ result, onNewScan }: ScanResultProps) {
  const [showDetails, setShowDetails] = useState(false);

  const getStatusIcon = () => {
    switch (result.label) {
      case 'safe':
        return <Shield className="w-8 h-8 text-safe" />;
      case 'suspicious':
        return <ShieldAlert className="w-8 h-8 text-warning" />;
      case 'phishing':
        return <ShieldX className="w-8 h-8 text-danger" />;
    }
  };

  const getStatusColor = () => {
    switch (result.label) {
      case 'safe':
        return 'backdrop-blur-xl bg-safe/5 border-safe/30 shadow-[0_0_40px_-15px_rgba(34,197,94,0.3)]';
      case 'suspicious':
        return 'backdrop-blur-xl bg-warning/5 border-warning/30 shadow-[0_0_40px_-15px_rgba(234,179,8,0.3)]';
      case 'phishing':
        return 'backdrop-blur-xl bg-danger/5 border-danger/30 shadow-[0_0_40px_-15px_rgba(239,68,68,0.3)]';
    }
  };

  const getSeverityIcon = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'low':
        return <Info className="w-4 h-4 text-muted-foreground" />;
      case 'medium':
        return <AlertTriangle className="w-4 h-4 text-warning" />;
      case 'high':
        return <XCircle className="w-4 h-4 text-danger" />;
    }
  };

  const getSeverityBadge = (severity: 'low' | 'medium' | 'high') => {
    const classes = {
      low: 'bg-muted text-muted-foreground',
      medium: 'bg-warning/20 text-warning',
      high: 'bg-danger/20 text-danger'
    };
    return classes[severity];
  };

  // PhishTank Badge Component
  const PhishTankBadge = ({ result }: { result: DetectionResult }) => {
    const phishTank = hasPhishTankVerification(result);

    if (!phishTank.checked) {
      return null;
    }

    if (phishTank.confirmed) {
      return (
        <motion.a
          href={phishTank.phishId ? `https://phishtank.org/phish_detail.php?phish_id=${phishTank.phishId}` : 'https://phishtank.org'}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-danger/20 border border-danger/40 text-danger text-sm font-medium hover:bg-danger/30 transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
          <span>Confirmed by PhishTank</span>
          <ExternalLink className="w-3 h-3 opacity-60" />
        </motion.a>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-medium"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 12l2 2 4-4" />
          <circle cx="12" cy="12" r="10" />
        </svg>
        <span>Verified by PhishTank</span>
      </motion.div>
    );
  };

  const getActionableAdvice = () => {
    if (result.label === 'safe') return null;

    const advice = [];
    if (result.input_type === 'email') advice.push("Do not reply or click links in this email.");
    if (result.details.indicators.some(i => i.name.includes('Credential'))) advice.push("Change your passwords immediately if you entered them.");
    if (result.details.indicators.some(i => i.name.includes('IP-Based'))) advice.push("This site is hosting content directly on an IP, which is highly suspicious. Close the tab.");

    // Default advice
    if (advice.length === 0) advice.push("Close the page immediately and do not enter any information.");

    return (
      <Card className="p-6 backdrop-blur-xl bg-blue-500/10 border-blue-500/20 shadow-[0_0_30px_-15px_rgba(59,130,246,0.2)]">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-blue-600 dark:text-blue-400">
          <Shield className="w-5 h-5" />
          Recommended Actions
        </h3>
        <ul className="space-y-3">
          {advice.map((item, index) => (
            <li key={index} className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
              <span className="text-foreground/90">{item}</span>
            </li>
          ))}
        </ul>
      </Card>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-3xl mx-auto space-y-6"
    >
      {/* Main Result Card */}
      <Card className={cn("relative overflow-hidden p-8 border-2 transition-all duration-500", getStatusColor())}>
        <div className={cn("absolute inset-0 opacity-20 bg-gradient-to-br transition-all duration-500",
          result.label === 'safe' ? "from-safe/20 to-transparent" :
          result.label === 'suspicious' ? "from-warning/20 to-transparent" :
          "from-danger/20 to-transparent"
        )} />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          {/* Risk Meter */}
          <div className="flex-shrink-0">
            <RiskMeter
              percentage={result.risk_percentage}
              label={result.label}
              size="lg"
            />
          </div>

          {/* Result Details */}
          <div className="flex-1 text-center md:text-left space-y-4">
            <div className="flex items-center justify-center md:justify-start gap-3">
              {getStatusIcon()}
              <h2 className="text-2xl font-bold capitalize">{result.label}</h2>
            </div>

            <p className="text-muted-foreground leading-relaxed">
              {result.details.analysis_summary}
            </p>

            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              <Badge variant="outline" className="font-mono">
                Type: {result.input_type.toUpperCase()}
              </Badge>
              <Badge variant="outline" className="font-mono">
                Confidence: {(result.confidence * 100).toFixed(0)}%
              </Badge>

              {/* PhishTank Verification Badge */}
              <PhishTankBadge result={result} />
            </div>
          </div>
        </div>
      </Card>

      {/* Actionable Advice */}
      {getActionableAdvice()}

      {/* Top Reasons */}
      <Card className="p-6 backdrop-blur-xl bg-card/60 border-border/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          {result.label === 'safe' ? (
            <CheckCircle className="w-5 h-5 text-safe" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-warning" />
          )}
          {result.label === 'safe' ? 'Why this looks safe' : 'Why this is flagged'}
        </h3>

        <ul className="space-y-3">
          {result.top_reasons.map((reason, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-3"
            >
              <span className={cn(
                "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                result.label === 'safe' ? 'bg-safe/20 text-safe' : 'bg-warning/20 text-warning'
              )}>
                {index + 1}
              </span>
              <span className="text-foreground/90">{reason}</span>
            </motion.li>
          ))}
        </ul>
      </Card>

      {/* Expert Forensics (Site Intelligence) - Always Show if Data Exists */}
      <Card className="backdrop-blur-xl bg-card/60 border-border/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden">
        <div
          onClick={() => setShowDetails(!showDetails)}
          className="w-full p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors cursor-pointer"
        >
          <span className="font-semibold flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Threat Intelligence & Forensics
          </span>
          {showDetails ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </div>

        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-border"
            >
              <div className="p-6 space-y-6">

                {/* Threat Intelligence Audit */}
                {result.threat_audit && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* VirusTotal */}
                    <div className={cn("p-4 rounded-lg border",
                      !result.threat_audit.sources.virustotal?.scanned ? "bg-muted/30 border-muted" :
                        result.threat_audit.sources.virustotal?.verdict === 'clean' ? "bg-green-500/10 border-green-500/30" :
                          "bg-red-500/10 border-red-500/30"
                    )}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="font-semibold text-sm">VirusTotal</div>
                        {result.threat_audit.sources.virustotal?.scanned && result.threat_audit.sources.virustotal.verdict === 'clean' && <CheckCircle className="w-4 h-4 text-green-500" />}
                        {result.threat_audit.sources.virustotal?.scanned && result.threat_audit.sources.virustotal.verdict !== 'clean' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {!result.threat_audit.sources.virustotal?.scanned ? "Not Scanned" :
                          result.threat_audit.sources.virustotal.verdict === 'clean' ? "Clean (0 detections)" :
                            `${result.threat_audit.sources.virustotal.malicious} detections`}
                      </div>
                    </div>

                    {/* AbuseIPDB */}
                    <div className={cn("p-4 rounded-lg border",
                      !result.threat_audit.sources.abuseipdb?.scanned ? "bg-muted/30 border-muted" :
                        result.threat_audit.sources.abuseipdb?.verdict === 'clean' ? "bg-green-500/10 border-green-500/30" :
                          "bg-red-500/10 border-red-500/30"
                    )}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="font-semibold text-sm">AbuseIPDB</div>
                        {result.threat_audit.sources.abuseipdb?.scanned && result.threat_audit.sources.abuseipdb.verdict === 'clean' && <CheckCircle className="w-4 h-4 text-green-500" />}
                        {result.threat_audit.sources.abuseipdb?.scanned && result.threat_audit.sources.abuseipdb.verdict !== 'clean' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {!result.threat_audit.sources.abuseipdb?.scanned ? "Not Scanned" :
                          result.threat_audit.sources.abuseipdb.verdict === 'clean' ? "Low Risk" :
                            `Confidence: ${result.threat_audit.sources.abuseipdb.score}%`}
                      </div>
                    </div>

                    {/* Google Safe Browsing */}
                    <div className={cn("p-4 rounded-lg border",
                      !result.threat_audit.sources.google_safe_browsing?.scanned ? "bg-muted/30 border-muted" :
                        (result.threat_audit.sources.google_safe_browsing?.matches.length ?? 0) === 0 ? "bg-green-500/10 border-green-500/30" :
                          "bg-red-500/10 border-red-500/30"
                    )}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="font-semibold text-sm">Safe Browsing</div>
                        {result.threat_audit.sources.google_safe_browsing?.scanned && (result.threat_audit.sources.google_safe_browsing.matches.length ?? 0) === 0 && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                        {result.threat_audit.sources.google_safe_browsing?.scanned && (result.threat_audit.sources.google_safe_browsing.matches.length ?? 0) > 0 && (
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mb-2">
                        {!result.threat_audit.sources.google_safe_browsing?.scanned
                          ? "Not Scanned"
                          : (result.threat_audit.sources.google_safe_browsing.matches.length ?? 0) === 0
                          ? "Clean"
                          : "Threats Reported by Google Safe Browsing"}
                      </div>
                      {result.threat_audit.sources.google_safe_browsing?.scanned &&
                        (result.threat_audit.sources.google_safe_browsing.matches.length ?? 0) > 0 && (
                          <div className="space-y-1">
                            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                              Threat types:
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {result.threat_audit.sources.google_safe_browsing.matches.slice(0, 6).map((match, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/40 text-[11px] text-red-400 font-medium"
                                >
                                  {match}
                                </span>
                              ))}
                            </div>
                            {result.threat_audit.sources.google_safe_browsing.matches.length > 6 && (
                              <div className="text-[11px] text-muted-foreground">
                                +{result.threat_audit.sources.google_safe_browsing.matches.length - 6} more
                              </div>
                            )}
                          </div>
                        )}
                    </div>

                    {/* PhishTank */}
                    <div className={cn("p-4 rounded-lg border",
                      !result.threat_audit.sources.phishtank?.scanned ? "bg-muted/30 border-muted" :
                        !result.threat_audit.sources.phishtank?.found ? "bg-green-500/10 border-green-500/30" :
                          "bg-red-500/10 border-red-500/30"
                    )}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="font-semibold text-sm">PhishTank</div>
                        {result.threat_audit.sources.phishtank?.scanned && !result.threat_audit.sources.phishtank.found && <CheckCircle className="w-4 h-4 text-green-500" />}
                        {result.threat_audit.sources.phishtank?.scanned && result.threat_audit.sources.phishtank.found && <AlertTriangle className="w-4 h-4 text-red-500" />}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {!result.threat_audit.sources.phishtank?.scanned ? "Not Scanned" :
                          !result.threat_audit.sources.phishtank.found ? "Clean" :
                            result.threat_audit.sources.phishtank.verified ? "Verified Phishing" : "Listed"}
                      </div>
                    </div>
                  </div>
                )}

                {/* Original Forensics Content */}
                {result.forensics && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border/50">
                    {/* Domain Age */}
                    <div className="p-4 bg-secondary/10 border border-border rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-mono bg-primary/10 px-2 py-0.5 rounded text-primary">WHOIS</span>
                        <span className="font-medium text-sm">Domain Identity</span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center pb-2 border-b border-border/50">
                          <span className="text-muted-foreground">Est. Age:</span>
                          <span className={cn("font-mono font-bold text-base", (result.forensics.age.days || 0) < 30 ? "text-red-500" : "text-green-500")}>
                            {result.forensics.age.days ? `${result.forensics.age.days} days` : 'Unknown'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span className="text-muted-foreground">Created:</span>
                          <span className="font-mono">{result.forensics.age.created_date || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span className="text-muted-foreground">Registrar:</span>
                          <span className="font-mono text-xs max-w-[150px] truncate" title={result.forensics.age.registrar}>{result.forensics.age.registrar}</span>
                        </div>
                      </div>
                    </div>

                    {/* DNS Records */}
                    <div className="p-4 bg-secondary/10 border border-border rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-mono bg-primary/10 px-2 py-0.5 rounded text-primary">DNS</span>
                        <span className="font-medium text-sm">Infrastructure</span>
                      </div>
                      <div className="space-y-3 text-xs font-mono">
                        <div>
                          <span className="text-muted-foreground block mb-1">Hosting (A Records):</span>
                          {result.forensics.dns.a.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {result.forensics.dns.a.slice(0, 3).map((ip, i) => (
                                <span key={i} className="bg-background border border-border px-2 py-0.5 rounded-md text-foreground">{ip}</span>
                              ))}
                              {result.forensics.dns.a.length > 3 && <span className="text-muted-foreground">+{result.forensics.dns.a.length - 3}</span>}
                            </div>
                          ) : <span className="text-red-500 italic">No IP resolved</span>}
                        </div>
                        <div>
                          <span className="text-muted-foreground block mb-1">Mail (MX Records):</span>
                          {result.forensics.dns.mx.length > 0 ? (
                            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Active ({result.forensics.dns.mx.length} servers)</span>
                            </div>
                          ) : <span className="text-red-500 flex items-center gap-2"><XCircle className="w-3.5 h-3.5" /> No Mail Server</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Manual Verification Checklist */}
      <ManualChecklist />

      {/* Technical Indicators (Expandable - Only if threats found) */}
      {result.details.indicators.length > 0 && (
        <Card className="backdrop-blur-xl bg-card/60 border-border/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-muted-foreground uppercase text-xs tracking-wider">Detection Indicators</h3>
          </div>
          <div className="p-4 space-y-3">
            {result.details.indicators.map((indicator, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg bg-secondary/20"
              >
                {getSeverityIcon(indicator.severity)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{indicator.name}</span>
                    <Badge className={cn("text-xs", getSeverityBadge(indicator.severity))}>
                      {indicator.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {indicator.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Action Buttons & Feedback */}
      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-4">
          <Button onClick={onNewScan} variant="outline" size="lg">
            Scan Another
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          Mistake? <button className="underline hover:text-foreground">Report False {result.label === 'safe' ? 'Negative' : 'Positive'}</button>
        </p>
      </div>
    </motion.div>
  );
}
