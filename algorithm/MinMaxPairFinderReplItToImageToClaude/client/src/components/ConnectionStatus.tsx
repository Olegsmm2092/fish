import React from 'react';

interface ConnectionStatusProps {
  isConnected: boolean;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ isConnected }) => {
  const statusColor = isConnected ? 'bg-success text-success' : 'bg-error text-error';
  const statusText = isConnected ? 'Connected' : 'Disconnected';

  return (
    <div className="flex items-center">
      <div className={`h-3 w-3 rounded-full ${isConnected ? 'bg-[#10b981]' : 'bg-[#ef4444]'} mr-2`}></div>
      <span className={`text-sm font-medium ${isConnected ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>{statusText}</span>
    </div>
  );
};

export default ConnectionStatus;
