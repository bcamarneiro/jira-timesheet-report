import React from 'react';
import styles from './Button.module.css';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
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
  const buttonClasses = [
    styles.button,
    variant === 'primary' && styles.buttonPrimary,
    variant === 'secondary' && styles.buttonSecondary,
    variant === 'danger' && styles.buttonDanger,
    size === 'small' && styles.buttonSmall,
    size === 'medium' && styles.buttonMedium,
    size === 'large' && styles.buttonLarge,
    disabled && styles.buttonDisabled,
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={buttonClasses}
      title={title}
      {...props}
    >
      {children}
    </button>
  );
};
