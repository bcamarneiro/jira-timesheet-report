import React from 'react';

type Props = {
  label: string;
  onPrev: () => void;
  onNext: () => void;
};

export const MonthNavigator: React.FC<Props> = ({ label, onPrev, onNext }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em', marginBottom: '1em' }}>
      <button onClick={onPrev}>{'←'}</button>
      <div style={{ fontWeight: 'bold' }}>{label}</div>
      <button onClick={onNext}>{'→'}</button>
    </div>
  );
};


