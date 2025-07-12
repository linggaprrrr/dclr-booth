'use client'

import React, { createContext, useState, useEffect, useContext } from 'react';

type FullscreenContextType = {
  transactionId: string,
  setTransactionId: (id: string) => void
}

export const DataContext = createContext<FullscreenContextType>({
  transactionId: "",
  setTransactionId: (id: string) => {},
});

interface Props {
  children: React.ReactNode
}

export const DataProvider: React.FC<Props> = (props) => {
  // For testing: Replace empty string with your test transaction ID
  const [transactionId, setTransactionId] = useState("3fb286c9-6ff6-478e-8556-af91e95be418"); // Test transaction ID

  return (
    <DataContext.Provider 
      value={{ 
        transactionId, 
        setTransactionId
      }}
    >
      {props.children}
    </DataContext.Provider>
  );
}

// Custom hook for using the fullscreen context
export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useDataContext must be used within a FullscreenProvider');
  }
  return context;
}
