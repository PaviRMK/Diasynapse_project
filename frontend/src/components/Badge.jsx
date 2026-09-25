import React from 'react';

export function Badge({ children, variant = 'default', size = 'sm', className = '' }) {
  const baseStyles = 'inline-flex items-center font-medium rounded-md tracking-tight';
  
  const sizeStyles = {
    xs: 'text-[11px] px-1.5 py-0.5',
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
  };

  const variants = {
    default: 'bg-cream-200 text-charcoal-700 border border-cream-300',
    estimate: 'bg-terracotta-50 text-terracotta-800 border border-terracotta-200',
    verified: 'bg-sage-100 text-sage-800 border border-sage-200',
    improving: 'bg-sage-100 text-sage-800 border border-sage-200',
    stable: 'bg-cream-200 text-charcoal-700 border border-cream-300',
    worsening: 'bg-coral-100 text-coral-800 border border-coral-200',
    neutral: 'bg-charcoal-100 text-charcoal-700 border border-charcoal-200',
  };

  return (
    <span className={`${baseStyles} ${sizeStyles[size] || sizeStyles.sm} ${variants[variant] || variants.default} ${className}`}>
      {children}
    </span>
  );
}

export function AiEstimatedBadge({ className = '' }) {
  return (
    <Badge variant="estimate" size="xs" className={className}>
      AI-Estimated
    </Badge>
  );
}

export function SourceBadge({ source, className = '' }) {
  if (source === 'nutrition_database') {
    return (
      <Badge variant="verified" size="xs" className={className}>
        Verified Database
      </Badge>
    );
  }
  return (
    <Badge variant="estimate" size="xs" className={className}>
      AI-Estimated
    </Badge>
  );
}
