import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center space-y-6">
                    <div className="p-4 rounded-full bg-red-100 dark:bg-red-900/20">
                        <AlertTriangle className="w-12 h-12 text-red-600 dark:text-red-400" />
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold tracking-tight">Something went wrong</h2>
                        <p className="text-muted-foreground max-w-md mx-auto">
                            The application encountered an unexpected error. Please try refreshing the page.
                        </p>
                    </div>

                    <Button
                        onClick={() => window.location.reload()}
                        className="gap-2"
                    >
                        <RefreshCcw className="w-4 h-4" />
                        Reload Application
                    </Button>

                    {process.env.NODE_ENV === 'development' && this.state.error && (
                        <pre className="p-4 mt-8 text-xs text-left text-red-500 bg-red-50 dark:bg-red-950/30 rounded-lg overflow-auto max-w-lg w-full">
                            {this.state.error.toString()}
                        </pre>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}
