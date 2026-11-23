import React from 'react';

interface ConnectionLostBannerProps {
  onReconnect: () => void;
}

export const ConnectionLostBanner: React.FC<ConnectionLostBannerProps> = ({ onReconnect }) => {
  return (
    <div className="bg-amber-500 text-white px-6 py-2.5 shadow-md flex items-center justify-between z-50 text-xs sm:text-sm font-medium">
      <div className="flex items-center gap-2.5">
        <span className="material-symbols-outlined text-[20px] animate-pulse">
          wifi_off
        </span>
        <span>
          <strong className="font-semibold">Connection Lost:</strong> Live telemetry paused. Automatic STOMP re-sync in progress...
        </span>
      </div>
      <button
        onClick={onReconnect}
        className="px-3 py-1 bg-white text-amber-900 rounded-md font-semibold text-xs hover:bg-amber-100 transition-colors shadow-2xs flex items-center gap-1"
      >
        <span className="material-symbols-outlined text-[15px]">refresh</span>
        <span>Reconnect Now</span>
      </button>
    </div>
  );
};
