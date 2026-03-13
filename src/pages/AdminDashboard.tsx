import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { Shield, ShieldAlert, Users, Activity, BarChart3, Database, AlertOctagon } from "lucide-react";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { ApiStatusPanel } from "@/components/ApiStatusPanel";
import { Navigate } from "react-router-dom";

interface UserProfile {
  id: string;
  email: string | null;
  displayName: string | null;
  phoneNumber: string | null;
  isAnonymous: boolean;
  role: string;
  createdAt: any;
}

interface HighRiskScan {
  id: string;
  user_id: string;
  content: string;
  label: string;
  risk_percentage: number;
  created_at: any;
}

export default function AdminDashboard() {
  const { user, isAdmin, isLoading } = useAuth();
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [highRiskScans, setHighRiskScans] = useState<HighRiskScan[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      if (!isAdmin) return;
      try {
        const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as UserProfile[];
        setUsersList(data);

        // Fetch Recent Scans (Filtering >70 risk client-side to avoid complex Firestore indexes)
        const scanQuery = query(collection(db, "scan_history"), orderBy("created_at", "desc"), limit(100));
        const scanSnapshot = await getDocs(scanQuery);
        
        const scans = scanSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as HighRiskScan[];
        
        const dangerousScans = scans.filter(s => s.risk_percentage >= 70);
        setHighRiskScans(dangerousScans);

      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        setFetching(false);
      }
    }

    if (!isLoading) {
      fetchUsers();
    }
  }, [isAdmin, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Activity className="w-8 h-8 text-primary animate-pulse" />
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <ShieldAlert className="w-16 h-16 text-destructive mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground max-w-md text-center">
            You do not have the necessary security clearance to view the PhishGuard Administration Panel.
          </p>
        </div>
      </div>
    );
  }

  const anonymousCount = usersList.filter(u => u.isAnonymous).length;
  const verifiedCount = usersList.length - anonymousCount;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <Database className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Admin Command Center</h1>
          </div>
          <p className="text-muted-foreground">Monitor platform intelligence and user activity.</p>
        </motion.div>

        {/* Global Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-card/40 backdrop-blur border-primary/20 flex flex-col justify-center items-center text-center">
            <Users className="w-8 h-8 text-primary mb-3" />
            <h3 className="text-3xl font-bold">{usersList.length}</h3>
            <p className="text-sm text-muted-foreground tracking-wide uppercase mt-1">Total Identities</p>
          </Card>
          <Card className="p-6 bg-card/40 backdrop-blur border-primary/20 flex flex-col justify-center items-center text-center">
            <Shield className="w-8 h-8 text-safe mb-3" />
            <h3 className="text-3xl font-bold">{verifiedCount}</h3>
            <p className="text-sm text-muted-foreground tracking-wide uppercase mt-1">Verified Accounts</p>
          </Card>
          <Card className="p-6 bg-card/40 backdrop-blur border-primary/20 flex flex-col justify-center items-center text-center">
            <BarChart3 className="w-8 h-8 text-warning mb-3" />
            <h3 className="text-3xl font-bold">{anonymousCount}</h3>
            <p className="text-sm text-muted-foreground tracking-wide uppercase mt-1">Anonymous Guests</p>
          </Card>
        </div>

        {/* API Infrastructure Status */}
        <div className="mb-8">
          <ApiStatusPanel />
        </div>

        {/* User Data Table */}
        <Card className="bg-card/40 backdrop-blur border-border/50 overflow-hidden">
          <div className="p-6 border-b border-border/50 bg-secondary/20">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Registered Operator Roster
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary/40 text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-medium">Identifier</th>
                  <th className="px-6 py-4 font-medium">Auth Method</th>
                  <th className="px-6 py-4 font-medium">Security Role</th>
                  <th className="px-6 py-4 font-medium text-right">Join Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {fetching ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                      <Activity className="w-5 h-5 animate-spin mx-auto mb-2" />
                      Decrypting Roster...
                    </td>
                  </tr>
                ) : usersList.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                      No operators found in database.
                    </td>
                  </tr>
                ) : (
                  usersList.map((usr) => (
                    <tr key={usr.id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium">{usr.displayName || 'Unknown User'}</span>
                          <span className="text-xs text-muted-foreground font-mono">
                            {usr.email || usr.phoneNumber || `anon_${usr.id.substring(0, 8)}`}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                          {usr.isAnonymous ? 'Guest' : usr.email ? 'Email' : 'Phone'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${usr.role === 'admin' ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-muted text-muted-foreground'}`}>
                          {usr.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-muted-foreground font-mono text-xs">
                        {usr.createdAt ? new Date(usr.createdAt.toDate()).toLocaleDateString() : 'Unknown'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* High Risk Scans Data Table */}
        <Card className="bg-card/40 backdrop-blur border-border/50 overflow-hidden mt-8">
          <div className="p-6 border-b border-border/50 bg-destructive/10">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-destructive">
              <AlertOctagon className="w-5 h-5" />
              High Risk Scans Detected (&gt;70% Risk)
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary/40 text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-medium">Operator Identity</th>
                  <th className="px-6 py-4 font-medium">Detected Content</th>
                  <th className="px-6 py-4 font-medium">Risk Score</th>
                  <th className="px-6 py-4 font-medium text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {fetching ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                      <Activity className="w-5 h-5 animate-spin mx-auto mb-2" />
                      Analyzing Global Telemetry...
                    </td>
                  </tr>
                ) : highRiskScans.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                      No high-risk activity detected recently.
                    </td>
                  </tr>
                ) : (
                  highRiskScans.map((scan) => {
                    // Match the scan's user_id to the usersList to get their display name
                    const matchedUser = usersList.find(u => u.id === scan.user_id);
                    const userName = matchedUser?.displayName || 'Unknown User';
                    const userContact = matchedUser 
                      ? (matchedUser.email || matchedUser.phoneNumber || `anon_${matchedUser.id.substring(0, 8)}`) 
                      : `ID: ${scan.user_id.substring(0,8)}...`;

                    return (
                      <tr key={scan.id} className="hover:bg-muted/10 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-xs">{userName}</span>
                            <span className="text-[10px] text-muted-foreground font-mono">
                              {userContact}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 max-w-[300px] truncate text-xs font-mono" title={scan.content}>
                          {scan.content}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-destructive/20 text-destructive border border-destructive/30">
                            {scan.risk_percentage.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-muted-foreground font-mono text-xs">
                          {scan.created_at ? new Date(scan.created_at).toLocaleString() : 'Unknown'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </div>
  );
}
