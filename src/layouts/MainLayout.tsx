import React from 'react';
import { Sidebar } from '../components/Sidebar';
import { AppHeader } from '../components/AppHeader';
import { Footer } from '../components/Footer';

export interface MainLayoutProps {
  children: React.ReactNode;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
  searchTerm?: string;
  setSearchTerm?: (term: string) => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  mobileSidebarOpen,
  setMobileSidebarOpen,
  searchTerm = '',
  setSearchTerm = () => {}
}) => {
  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex font-sans selection:bg-blue-600 selection:text-white">
      {/* Enterprise Left Sidebar */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader
          onOpenMobileMenu={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          onOpenNotificationCenter={() => {}}
        />

        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>

        <Footer />
      </div>
    </div>
  );
};
