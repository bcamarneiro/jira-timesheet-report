import React from 'react';
import * as Select from '@radix-ui/react-select';
import styles from './DayCell.module.css';

type TimeOffSelectorProps = {
  value: number;
  onChange: (hours: number) => void;
  disabled?: boolean;
};

export const TimeOffSelector: React.FC<TimeOffSelectorProps> = ({
  value,
  onChange,
  disabled = false
}) => {
  return (
    <Select.Root 
      value={value.toString()} 
      onValueChange={(value) => onChange(Number(value) || 0)}
      disabled={disabled}
    >
      <Select.Trigger 
        className={styles.timeOffSelect}
        title="Time off (counts only for karma)"
      >
        <Select.Value placeholder="Time off" />
        <Select.Icon>▼</Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className="bg-white rounded-md shadow-soft border border-gray-300 py-1">
          <Select.Viewport>
            <Select.Item value="0" className="px-2 py-1 cursor-pointer text-xs">
              <Select.ItemText>No time off</Select.ItemText>
            </Select.Item>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(hours => (
              <Select.Item key={hours} value={hours.toString()} className="px-2 py-1 cursor-pointer text-xs">
                <Select.ItemText>{hours}h</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
};
