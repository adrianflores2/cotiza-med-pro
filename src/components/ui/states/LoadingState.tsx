
import React from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface LoadingStateProps {
  message?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingState = React.memo(({ 
  message = "Cargando...", 
  className = "",
  size = 'md'
}: LoadingStateProps) => {
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const containerPadding = {
    sm: 'py-4',
    md: 'py-8',
    lg: 'py-12'
  };

  return (
    <Card className={className}>
      <CardContent className={`text-center ${containerPadding[size]}`}>
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className={`${iconSizes[size]} text-blue-600 animate-spin`} />
          <p className="text-gray-600">{message}</p>
        </div>
      </CardContent>
    </Card>
  );
});

LoadingState.displayName = 'LoadingState';
