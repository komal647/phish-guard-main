import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { History, Trash2, Shield, ShieldAlert, ShieldX, Search, X, RefreshCw, Cloud, CloudOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getScanHistory, deleteScanHistoryItem, clearScanHistory, type ScanHistoryItem } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface ScanHistoryProps {
  onRescan: (content: string) => void;
  refreshTrigger?: number;
}

export function ScanHistory({ onRescan, refreshTrigger }: ScanHistoryProps) {
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'safe' | 'suspicious' | 'phishing'>('all');
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();

  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    const items = await getScanHistory(user?.uid ?? null);
    setHistory(items);
    setIsLoading(false);
  }, [user?.uid]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory, refreshTrigger]);

  const filteredHistory = history.filter(item => {
    const matchesFilter = filter === 'all' || item.result.label === filter;
    const matchesSearch = searchQuery === '' || 
      item.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleDelete = async (id: string) => {
    await deleteScanHistoryItem(id, user?.uid ?? null);
    await loadHistory();
  };

  const handleClearAll = async () => {
    if (confirm('Are you sure you want to clear all scan history?')) {
      await clearScanHistory(user?.uid ?? null);
      setHistory([]);
    }
  };

  const getStatusIcon = (label: string) => {
    switch (label) {
      case 'safe':
        return <Shield className="w-4 h-4 text-safe" />;
      case 'suspicious':
        return <ShieldAlert className="w-4 h-4 text-warning" />;
      case 'phishing':
        return <ShieldX className="w-4 h-4 text-danger" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (label: string) => {
    switch (label) {
      case 'safe':
        return 'bg-safe/20 text-safe border-safe/30';
      case 'suspicious':
        return 'bg-warning/20 text-warning border-warning/30';
      case 'phishing':
        return 'bg-danger/20 text-danger border-danger/30';
      default:
        return '';
    }
  };

  if (isLoading) {
    return (
      <Card className="p-8 bg-card/50 text-center">
        <Loader2 className="w-8 h-8 mx-auto text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Loading history...</p>
      </Card>
    );
  }

  if (history.length === 0) {
    return (
      <Card className="p-8 bg-card/50 text-center">
        <History className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
        <h3 className="text-lg font-semibold text-muted-foreground">No scan history yet</h3>
        <p className="text-sm text-muted-foreground/70 mt-2">
          Your scan results will appear here after you analyze content
        </p>
        <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
          {user ? (
            <>
              <Cloud className="w-4 h-4 text-safe" />
              <span>Synced across devices</span>
            </>
          ) : (
            <>
              <CloudOff className="w-4 h-4" />
              <span>Sign in to sync history</span>
            </>
          )}
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            Scan History
          </h2>
          {user ? (
            <Badge variant="outline" className="text-safe border-safe/30 gap-1">
              <Cloud className="w-3 h-3" />
              Synced
            </Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground gap-1">
              <CloudOff className="w-3 h-3" />
              Local only
            </Badge>
          )}
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleClearAll}
          className="text-muted-foreground hover:text-danger"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Clear All
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search history..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>
        
        <div className="flex gap-2">
          {(['all', 'safe', 'suspicious', 'phishing'] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f)}
              className={cn(
                filter === f && f === 'safe' && 'bg-safe hover:bg-safe/90',
                filter === f && f === 'suspicious' && 'bg-warning hover:bg-warning/90',
                filter === f && f === 'phishing' && 'bg-danger hover:bg-danger/90'
              )}
            >
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* History List */}
      <ScrollArea className="h-[400px]">
        <AnimatePresence mode="popLayout">
          {filteredHistory.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ delay: index * 0.05 }}
              className="mb-3"
            >
              <Card className="p-4 bg-card/50 hover:bg-card/70 transition-colors">
                <div className="flex items-start gap-4">
                  {/* Status Icon */}
                  <div className={cn(
                    "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                    item.result.label === 'safe' && 'bg-safe/20',
                    item.result.label === 'suspicious' && 'bg-warning/20',
                    item.result.label === 'phishing' && 'bg-danger/20'
                  )}>
                    {getStatusIcon(item.result.label)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className={cn("text-xs", getStatusBadge(item.result.label))}>
                        {item.result.label}
                      </Badge>
                      <Badge variant="outline" className="text-xs font-mono">
                        {item.result.risk_percentage}% risk
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(item.scanned_at), { addSuffix: true })}
                      </span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground truncate font-mono">
                      {item.content_preview}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRescan(item.content)}
                      title="Rescan"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(item.id)}
                      className="text-muted-foreground hover:text-danger"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredHistory.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No results match your filters
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
