import { useState, useEffect } from "react";
import { testApiConnections, ApiStatus } from "@/lib/apiTester";
import { Loader2, CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ApiStatusPanel() {
  const [statuses, setStatuses] = useState<ApiStatus[]>([]);
  const [isTesting, setIsTesting] = useState(false);

  const runTests = async () => {
    setIsTesting(true);
    setStatuses([]);
    const results = await testApiConnections();
    setStatuses(results);
    setIsTesting(false);
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <Card className="max-w-3xl mx-auto mt-4">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>API Integrations Status</span>
          <Button onClick={runTests} disabled={isTesting} variant="outline" size="sm">
            {isTesting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Test Connections
          </Button>
        </CardTitle>
        <CardDescription>
          Verify that your API keys are configured correctly and the services are reachable. Note: Browser CORS policies may block some successful requests from localhost.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isTesting && statuses.length === 0 ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {statuses.map((api, i) => (
              <div key={i} className="flex items-start p-4 border rounded-lg bg-card text-card-foreground">
                <div className="mr-4 mt-1">
                  {api.status === 'online' && <CheckCircle className="w-5 h-5 text-green-500" />}
                  {api.status === 'missing' && <AlertCircle className="w-5 h-5 text-yellow-500" />}
                  {api.status === 'error' && <XCircle className="w-5 h-5 text-destructive" />}
                </div>
                <div>
                  <h4 className="font-semibold text-sm">{api.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {api.status === 'online' ? 'Connected successfully' : api.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
