import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './Button';

export const NoDataDialog: React.FC = () => {
  return (
    <Dialog open={true}>
      <DialogContent className="text-center max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            No Data Available
          </DialogTitle>
          <DialogDescription className="text-lg">
            não tens dados, maninho!
          </DialogDescription>
        </DialogHeader>
        <div className="mt-6">
          <Button onClick={() => window.location.reload()} variant="primary">
            Refresh Page
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
