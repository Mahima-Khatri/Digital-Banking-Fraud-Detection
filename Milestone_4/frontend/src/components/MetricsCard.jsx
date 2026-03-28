import React from 'react';

const MetricsCard = ({ title, value, icon: Icon, color, testId }) => {
  const colorMap = {
    primary: 'from-primary/20 to-primary/5 border-primary/30',
    destructive: 'from-destructive/20 to-destructive/5 border-destructive/30',
    accent: 'from-accent/20 to-accent/5 border-accent/30',
    warning: 'from-warning/20 to-warning/5 border-warning/30',
    success: 'from-success/20 to-success/5 border-success/20',
  };

  const iconColorMap = {
    primary: 'text-primary',
    destructive: 'text-destructive',
    accent: 'text-accent',
    warning: 'text-warning',
    success: 'text-success',
  };

  return (
    <div 
      className={`metric-card glass-card p-6 bg-gradient-to-br ${colorMap[color] || colorMap.primary}`}
      data-testid={testId}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-2">{title}</p>
          <p className="text-3xl font-bold text-foreground" data-testid={`${testId}-value`}>
            {value}
          </p>
        </div>

        <div className={`p-3 rounded-lg bg-background/50 ${iconColorMap[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

export default MetricsCard;