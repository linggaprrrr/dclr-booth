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
  const [transactionId, setTransactionId] = useState("");

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
