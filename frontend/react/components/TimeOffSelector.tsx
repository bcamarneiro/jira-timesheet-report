import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

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
    <Select 
      value={value.toString()} 
      onValueChange={(value) => onChange(Number(value) || 0)}
      disabled={disabled}
    >
      <SelectTrigger 
        className="h-6 text-xs"
        title="Time off (counts only for karma)"
      >
        <SelectValue placeholder="Time off" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="0">No time off</SelectItem>
        {[1, 2, 3, 4, 5, 6, 7, 8].map(hours => (
          <SelectItem key={hours} value={hours.toString()}>
            {hours}h
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
