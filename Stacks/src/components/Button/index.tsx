import { FC, PropsWithChildren } from 'react';

import styles from './styles.module.scss';

type ButtonType = 'filled' | 'outline';

type Properties = {
  onClick?: () => void;
  variant?: ButtonType;
  className?: string;
  submit?: boolean;
  color?: string;
};

const bType: Record<ButtonType, string> = {
  filled: styles.filled,
  outline: styles.outline,
};

export const Button: FC<PropsWithChildren<Properties>> = ({
  onClick,
  variant = 'filled',
  children,
  className,
  submit,
  color,
}) => {
  const buttonStyle = {
    backgroundColor: variant === 'filled' ? color : 'transparent',
    border: variant === 'outline' ? `2px solid ${color}` : 'none',
  };

  return (
    <button
      type={submit ? 'submit' : 'button'}
      onClick={onClick}
      className={`${styles.button} ${bType[variant]} ${className}`}
      style={buttonStyle}
    >
      {children}
    </button>
  );
};
