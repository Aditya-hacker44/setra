'use client';
import React from 'react';
import { AppProvider, useAppState } from '@/lib/store';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { PageRouter } from '@/components/PageRouter';
import LoginPage from '@/components/pages/LoginPage';

function MainApp() {
  const { currentUser } = useAppState();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  if (!currentUser) {
    return <LoginPage />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#F0F4F8]">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden w-full relative">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <PageRouter />
        </main>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
