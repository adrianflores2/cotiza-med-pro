
import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  message: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState = React.memo(({ 
  message, 
  description,
  onRetry,
  className = ""
}: ErrorStateProps) => {
  return (
    <Card className={className}>
      <CardContent className="text-center py-12">
        <div className="flex flex-col items-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-red-500" />
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-red-900">{message}</h3>
            {description && (
              <p className="text-red-600 max-w-md">{description}</p>
            )}
          </div>
          {onRetry && (
            <Button onClick={onRetry} variant="outline" className="mt-4">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reintentar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

ErrorState.displayName = 'ErrorState';
