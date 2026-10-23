import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { MobileHeader } from './MobileHeader';
import { MobileDrawer } from './MobileDrawer';

export const AppShell = ({
  currentTab,
  onSelectTab,
  onResetData,
  onSignOut,
  propertyInfo,
  children,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen w-full flex bg-slate-50 text-slate-800 antialiased font-sans">
      {/* 1. Desktop Persistent Fixed-Width Sidebar (256px) */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={onSelectTab}
        onResetData={onResetData}
        onSignOut={onSignOut}
        propertyInfo={propertyInfo}
      />

      {/* 2. Mobile Hamburger Drawer */}
      <MobileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        currentTab={currentTab}
        onSelectTab={onSelectTab}
        onResetData={onResetData}
        onSignOut={onSignOut}
        propertyInfo={propertyInfo}
      />

      {/* 3. Main Content Container */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {/* Mobile Header with Hamburger Icon */}
        <MobileHeader
          onOpenDrawer={() => setIsDrawerOpen(true)}
          propertyInfo={propertyInfo}
        />

        {/* Page Content View Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppShell;
