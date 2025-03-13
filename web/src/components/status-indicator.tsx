// StatusIndicator.tsx
import React from "react";

interface StatusIndicatorProps {
  positive?: boolean;
  pulse?: boolean;
  intermediary?: boolean;
  className?: string;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  positive,
  pulse,
  intermediary,
  className,
}) => {
  return (
    <div
      className={`w-3 h-3 rounded-full ${
        positive ? "bg-green-500" : intermediary ? "bg-yellow-500" : "bg-gray-500"
      } ${pulse ? "animate-pulse" : ""} ${className}`}
    />
  );
};

export default StatusIndicator;
