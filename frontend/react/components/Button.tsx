import React from 'react';
import { Button as ShadcnButton } from './ui/button';
import { cn } from '../lib/utils';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'default';
  size?: 'small' | 'medium' | 'large' | 'default';
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  title?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  type = 'button',
  className = '',
  title,
  ...props
}) => {
  // Map our variants to shadcn variants
  const shadcnVariant = variant === 'primary' ? 'default' : 
                       variant === 'secondary' ? 'secondary' : 
                       variant === 'danger' ? 'destructive' : 
                       variant === 'default' ? 'default' : 'default';
  
  // Map our sizes to shadcn sizes
  const shadcnSize = size === 'small' ? 'sm' : 
                    size === 'medium' ? 'default' : 
                    size === 'large' ? 'lg' : 
                    size === 'default' ? 'default' : 'default';

  return (
    <ShadcnButton
      type={type}
      disabled={disabled}
      onClick={onClick}
      variant={shadcnVariant}
      size={shadcnSize}
      className={cn(className)}
      title={title}
      {...props}
    >
      {children}
    </ShadcnButton>
  );
};
