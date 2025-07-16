import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from '@/components/AppProvider';
import { AppConfig } from '@/contexts/AppContext';
import { NostrLoginProvider } from '@nostrify/react/login';
import NostrProvider from '@/components/NostrProvider';
import { createHead, UnheadProvider } from '@unhead/react/client';
import { InferSeoMetaPlugin } from '@unhead/addons';
import { Suspense } from 'react';
import { Toaster as Sonner } from "@/components/ui/sonner";
import Index from "./pages/Index";
import CreateReview from "./pages/CreateReview";
import Dashboard from "./pages/Dashboard";
import ReviewDetail from "./pages/ReviewDetail";
import Settings from "./pages/Settings";
import { PhotoUploadDemo } from "./pages/PhotoUploadDemo";
import { GpsCorrectionDemo } from "./pages/GpsCorrectionDemo";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 60000, // 1 minute
      gcTime: Infinity,
    },
  },
});

const defaultConfig: AppConfig = {
  theme: "light",
  relayUrl: "wss://relay.primal.net",
  mapProvider: "openstreetmap",
};

const presetRelays = [
  { url: 'wss://ditto.pub/relay', name: 'Ditto' },
  { url: 'wss://relay.nostr.band', name: 'Nostr.Band' },
  { url: 'wss://relay.damus.io', name: 'Damus' },
  { url: 'wss://relay.primal.net', name: 'Primal' },
];

const head = createHead({
  plugins: [
    InferSeoMetaPlugin(),
  ],
});

export function AppProgressive() {
  return (
    <UnheadProvider head={head}>
      <AppProvider storageKey="nostr:app-config" defaultConfig={defaultConfig} presetRelays={presetRelays}>
        <QueryClientProvider client={queryClient}>
          <NostrLoginProvider storageKey='nostr:login'>
            <NostrProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <Suspense>
                  <BrowserRouter>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/create-review" element={<CreateReview />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/review/:naddr" element={<ReviewDetail />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/photo-upload-demo" element={<PhotoUploadDemo />} />
                      <Route path="/gps-correction-demo" element={<GpsCorrectionDemo />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </BrowserRouter>
                </Suspense>
              </TooltipProvider>
            </NostrProvider>
          </NostrLoginProvider>
        </QueryClientProvider>
      </AppProvider>
    </UnheadProvider>
  );
}

export default AppProgressive;