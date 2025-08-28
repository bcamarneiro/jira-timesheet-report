import React from 'react';
import * as Select from '@radix-ui/react-select';

type Props = {
  users: string[];
  value: string;
  onChange: (value: string) => void;
};

export const UserSelector: React.FC<Props> = ({ users, value, onChange }) => {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label htmlFor="user-select" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
        Select User
      </label>
      <Select.Root value={value} onValueChange={onChange}>
        <Select.Trigger
          id="user-select"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderRadius: '4px',
            padding: '0.5rem 0.75rem',
            fontSize: '1rem',
            lineHeight: 1,
            height: '35px',
            gap: '5px',
            backgroundColor: 'white',
            color: '#11181C',
            boxShadow: '0 0 0 1px #E6E8EB',
            border: 'none',
            cursor: 'pointer',
            minWidth: '200px',
          }}
        >
          <Select.Value placeholder="Select a user..." />
          <Select.Icon>
            ▼
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content
            style={{
              overflow: 'hidden',
              backgroundColor: 'white',
              borderRadius: '6px',
              boxShadow: '0px 10px 38px -10px rgba(22, 23, 24, 0.35), 0px 10px 20px -15px rgba(22, 23, 24, 0.2)',
              border: '1px solid #E6E8EB',
            }}
          >
            <Select.ScrollUpButton
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '25px',
                backgroundColor: 'white',
                color: '#6F767E',
                cursor: 'default',
              }}
            >
              ▲
            </Select.ScrollUpButton>
            <Select.Viewport style={{ padding: '5px' }}>
              <Select.Group>
                {users.map((user) => (
                  <Select.Item
                    key={user}
                    value={user}
                    style={{
                      fontSize: '1rem',
                      lineHeight: 1,
                      color: '#11181C',
                      borderRadius: '3px',
                      display: 'flex',
                      alignItems: 'center',
                      height: '35px',
                      padding: '0 35px 0 25px',
                      position: 'relative',
                      userSelect: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <Select.ItemText>{user}</Select.ItemText>
                    <Select.ItemIndicator
                      style={{
                        position: 'absolute',
                        left: 0,
                        width: '25px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      ✓
                    </Select.ItemIndicator>
                  </Select.Item>
                ))}
              </Select.Group>
            </Select.Viewport>
            <Select.ScrollDownButton
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '25px',
                backgroundColor: 'white',
                color: '#6F767E',
                cursor: 'default',
              }}
            >
              ▼
            </Select.ScrollDownButton>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  );
};


