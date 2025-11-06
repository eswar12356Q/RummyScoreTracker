import React from 'react';
import { CardProps } from '../../types';
import { clsx } from 'clsx';

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
}) => {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const classes = clsx(
    'rounded-lg border bg-white text-gray-950 shadow-sm',
    paddingClasses[padding],
    className
  );

  return (
    <div className={classes}>
      {children}
    </div>
  );
};

export default Card;