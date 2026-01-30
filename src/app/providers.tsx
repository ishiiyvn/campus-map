'use client'

import { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { StackProvider, StackTheme } from '@stackframe/stack';
import { stackClientApp } from '../stack/client';
import { getQueryClient } from './get-query-client';
import { Toaster } from 'sonner';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';

interface ProvidersProps {
  children: ReactNode;
  defaultOpen?: boolean;
}

export default function Providers({ children, defaultOpen }: ProvidersProps) {
  const queryClient = getQueryClient();

  return (
    <StackProvider app={stackClientApp}><StackTheme>
      <QueryClientProvider client={queryClient}>
        <SidebarProvider defaultOpen={defaultOpen}>
          <AppSidebar />
          <Toaster />
          <main className="w-full">
            <SidebarTrigger />
            {children}
          </main>
        </SidebarProvider>
      </QueryClientProvider>
    </StackTheme></StackProvider>
  )
}
