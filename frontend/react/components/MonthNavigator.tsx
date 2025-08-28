import React from 'react';
import { Button } from './Button';
import styles from './MonthNavigator.module.css';

type Props = {
  label: string;
  onPrev: () => void;
  onNext: () => void;
};

export const MonthNavigator: React.FC<Props> = ({ label, onPrev, onNext }) => {
  return (
    <div className={styles.navigator}>
      <Button onClick={onPrev} variant="secondary" size="small" aria-label="Previous month">
        ←
      </Button>
      <div className={styles.label}>{label}</div>
      <Button onClick={onNext} variant="secondary" size="small" aria-label="Next month">
        →
      </Button>
    </div>
  );
};


