import React, { createContext, useContext, ReactNode } from 'react';

interface AdminStatsContextType {
  refreshStats: () => void;
}

const AdminStatsContext = createContext<AdminStatsContextType | undefined>(undefined);

interface AdminStatsProviderProps {
  children: ReactNode;
  refreshStats: () => void;
}

export const AdminStatsProvider: React.FC<AdminStatsProviderProps> = ({ 
  children, 
  refreshStats 
}) => {
  return (
    <AdminStatsContext.Provider value={{ refreshStats }}>
      {children}
    </AdminStatsContext.Provider>
  );
};

export const useAdminStatsContext = () => {
  const context = useContext(AdminStatsContext);
  if (context === undefined) {
    throw new Error('useAdminStatsContext must be used within an AdminStatsProvider');
  }
  return context;
};

// Optional hook that returns null if not within provider (for optional usage)
export const useAdminStatsRefresh = () => {
  const context = useContext(AdminStatsContext);
  return context?.refreshStats || null;
};