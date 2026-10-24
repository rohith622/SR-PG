import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { MobileHeader } from "./MobileHeader";
import { MobileDrawer } from "./MobileDrawer";

export const AppShell = ({
  currentTab,
  onSelectTab,
  onResetData,
  onSignOut,
  propertyInfo,
  children,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const navigate = useNavigate();

  const handleSelectTab = (tab) => {
    // Preserve existing tab selection behavior.
    onSelectTab?.(tab);
    setIsDrawerOpen(false);

    // Connect tabs to their corresponding routes.
    const routes = {
      dashboard: "/admin/dashboard",
      beds: "/admin/beds",
      history: "/admin/tenant-history",
      rent: "/admin/rent-payments",
    };

    const route = routes[tab];

    if (route) {
      navigate(route);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-[#f7f5ef] font-sans text-slate-800 antialiased">
      <Sidebar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        onResetData={onResetData}
        onSignOut={onSignOut}
        propertyInfo={propertyInfo}
      />

      <MobileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        onResetData={onResetData}
        onSignOut={onSignOut}
        propertyInfo={propertyInfo}
      />

      <div className="flex min-h-screen min-w-0 flex-1 flex-col overflow-x-hidden bg-[#f7f5ef]">
        <MobileHeader
          onOpenDrawer={() => setIsDrawerOpen(true)}
          propertyInfo={propertyInfo}
        />

        <main className="mx-auto w-full max-w-[1800px] flex-1 p-3 sm:p-5 lg:p-7 xl:p-8">
          {children ?? <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default AppShell;
