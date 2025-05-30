
import React from "react";
import { AlertCircle, FileX, Search, Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: 'default' | 'search' | 'file' | 'package';
  message: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const icons = {
  default: AlertCircle,
  search: Search,
  file: FileX,
  package: Package,
};

export const EmptyState = React.memo(({ 
  icon = 'default',
  message, 
  description,
  action,
  className = ""
}: EmptyStateProps) => {
  const IconComponent = icons[icon];

  return (
    <Card className={className}>
      <CardContent className="text-center py-12">
        <div className="flex flex-col items-center space-y-4">
          <IconComponent className="w-12 h-12 text-gray-400" />
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-gray-900">{message}</h3>
            {description && (
              <p className="text-gray-600 max-w-md">{description}</p>
            )}
          </div>
          {action && (
            <Button onClick={action.onClick} className="mt-4">
              {action.label}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

EmptyState.displayName = 'EmptyState';
