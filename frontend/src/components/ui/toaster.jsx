import React from 'react';
import { useToast } from './use-toast';

export function Toaster() {
  const { toasts } = useToast();

  return (
    <div className="fixed top-0 right-0 z-[100] p-4 space-y-2 max-h-screen overflow-y-auto">
      {toasts.map(({ id, title, description, variant, action }) => (
        <div
          key={id}
          className={`p-4 rounded-md shadow-lg ${
            variant === 'destructive'
              ? 'bg-red-100 border border-red-200 text-red-800'
              : 'bg-white border border-gray-200 text-gray-800'
          }`}
        >
          <div className="flex items-start">
            <div className="flex-1">
              {title && <h4 className="font-medium">{title}</h4>}
              {description && <p className="text-sm mt-1">{description}</p>}
            </div>
            {action && <div className="ml-4">{action}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
