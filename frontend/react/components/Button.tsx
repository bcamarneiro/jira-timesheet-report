import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  style?: React.CSSProperties;
  title?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  type = 'button',
  style,
  title,
  ...props
}) => {
  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
    fontWeight: '500',
    cursor: 'pointer',
    border: 'none',
    fontFamily: 'inherit',
    transition: 'all 0.2s ease',
    ...style,
  };

  const sizeStyles = {
    small: {
      padding: '0.375rem 0.75rem',
      fontSize: '0.875rem',
      height: '32px',
    },
    medium: {
      padding: '0.5rem 1rem',
      fontSize: '1rem',
      height: '40px',
    },
    large: {
      padding: '0.75rem 1.5rem',
      fontSize: '1.125rem',
      height: '48px',
    },
  };

  const variantStyles = {
    primary: {
      backgroundColor: '#007bff',
      color: 'white',
    },
    secondary: {
      backgroundColor: 'white',
      color: '#333',
      border: '1px solid #ccc',
    },
    danger: {
      backgroundColor: '#dc3545',
      color: 'white',
    },
  };

  const buttonStyles = {
    ...baseStyles,
    ...sizeStyles[size],
    ...variantStyles[variant],
    opacity: disabled ? 0.6 : 1,
    cursor: disabled ? 'not-allowed' : 'pointer',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={buttonStyles}
      title={title}
      {...props}
    >
      {children}
    </button>
  );
};
