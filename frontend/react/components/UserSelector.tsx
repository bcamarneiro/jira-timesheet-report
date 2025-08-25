import React from 'react';

type Props = {
  users: string[];
  value: string;
  onChange: (value: string) => void;
};

export const UserSelector: React.FC<Props> = ({ users, value, onChange }) => {
  return (
    <>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter user name"
        list="users"
      />
      <datalist id="users">
        {users.map(u => (<option key={u} value={u} />))}
      </datalist>
    </>
  );
};


