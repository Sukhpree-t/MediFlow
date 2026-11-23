import React from 'react';
import { Link } from 'react-router-dom';

interface AccessDeniedProps {
  requiredRole?: string;
  userRole?: string;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({
  requiredRole = 'ROLE_ADMIN',
  userRole = 'ROLE_STAFF',
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mb-4 shadow-sm">
        <span className="material-symbols-outlined text-[36px]">gpp_maybe</span>
      </div>
      <h2 className="font-headline font-bold text-2xl text-on-surface tracking-tight">
        Access Denied: Restricted Administrative Resource
      </h2>
      <p className="max-w-md text-sm text-on-surface-variant mt-2">
        Your active clinical credentials ({userRole}) do not possess clearance for {requiredRole} operations under institutional HIPAA governance policies.
      </p>
      <div className="mt-6 flex items-center gap-3">
        <Link
          to="/"
          className="px-5 py-2.5 rounded-xl bg-primary hover:bg-blue-700 text-white font-semibold text-sm shadow-md transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Return to Live Ward Grid</span>
        </Link>
      </div>
    </div>
  );
};
