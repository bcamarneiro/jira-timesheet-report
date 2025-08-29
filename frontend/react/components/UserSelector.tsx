import React from 'react';
import { Combobox } from './ui/combobox';

type Props = {
  users: string[];
  value: string;
  onChange: (value: string) => void;
};

export const UserSelector: React.FC<Props> = ({ users, value, onChange }) => {
  const options = users.map(user => ({
    value: user,
    label: user
  }));

  return (
    <div className="mb-4">
      <label htmlFor="user-select" className="block mb-2 font-medium text-gray-700">
        Select User
      </label>
      <Combobox
        options={options}
        value={value}
        onValueChange={onChange}
        placeholder="Select a user..."
        searchPlaceholder="Search users..."
        emptyText="No users found."
        className="w-[280px]"
      />
    </div>
  );
};


