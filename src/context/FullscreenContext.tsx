'use client'

import React, { createContext, useState, useEffect, useContext } from 'react';

type FullscreenContextType = {
  isFullscreen: boolean, 
  fullscreenSupported: boolean
  toggleFullscreen: () => void
}

export const FullscreenContext = createContext<FullscreenContextType>({
  isFullscreen: false,
  fullscreenSupported: false,
  toggleFullscreen: () => {}
});

interface Props {
  children: React.ReactNode
}

export const FullscreenProvider: React.FC<Props> = (props) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenSupported, setFullscreenSupported] = useState(false);
  
  // Check if fullscreen is supported
  useEffect(() => {
    setFullscreenSupported(document.fullscreenEnabled);
  }, []);

  // Monitor fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: any) => {
      if (e.key === 'F11') {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Toggle fullscreen method
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      // Enter fullscreen
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      }
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <FullscreenContext.Provider 
      value={{ 
        isFullscreen, 
        fullscreenSupported, 
        toggleFullscreen 
      }}
    >
      {props.children}
    </FullscreenContext.Provider>
  );
}

// Custom hook for using the fullscreen context
export function useFullscreen() {
  const context = useContext(FullscreenContext);
  if (context === undefined) {
    throw new Error('useFullscreen must be used within a FullscreenProvider');
  }
  return context;
}
