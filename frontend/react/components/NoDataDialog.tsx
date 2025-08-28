import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Button } from './Button';

export const NoDataDialog: React.FC = () => {
  return (
    <Dialog.Root open={true}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-8 rounded-xl shadow-large z-50 text-center max-w-md w-full mx-4">
          <Dialog.Title className="text-2xl font-bold mb-4">
            No Data Available
          </Dialog.Title>
          <Dialog.Description className="text-lg text-gray-600">
            não tens dados, maninho!
          </Dialog.Description>
          <div className="mt-6">
            <Button onClick={() => window.location.reload()} variant="primary">
              Refresh Page
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
