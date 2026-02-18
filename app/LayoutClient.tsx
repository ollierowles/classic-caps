'use client';

import { useState, useEffect } from 'react';
import AppHeader from '@/components/AppHeader';
import SettingsModal from '@/components/SettingsModal';
import HelpModal from '@/components/HelpModal';

/**
 * LayoutClient Component
 * Client-side wrapper for layout with settings and help modals
 */

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Show help modal on first visit
  useEffect(() => {
    const hasVisited = localStorage.getItem('classic-caps-has-visited');
    if (!hasVisited) {
      setIsHelpOpen(true);
      localStorage.setItem('classic-caps-has-visited', 'true');
    }
  }, []);

  return (
    <>
      <AppHeader 
        onSettingsClick={() => setIsSettingsOpen(true)}
        onHelpClick={() => setIsHelpOpen(true)}
      />
      {children}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
      <HelpModal 
        isOpen={isHelpOpen} 
        onClose={() => setIsHelpOpen(false)} 
      />
    </>
  );
}
