import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ScrollToTop } from "./components/ScrollToTop";

import Index from "./pages/Index";
import IndexSimple from "./pages/IndexSimple";
import IndexNoMap from "./pages/IndexNoMap";
import IndexMinimal from "./pages/IndexMinimal";
import IndexSafe from "./pages/IndexSafe";
import IndexDebug from "./pages/IndexDebug";
import _IndexBasic from "./pages/IndexBasic";
import CreateReview from "./pages/CreateReview";
import Dashboard from "./pages/Dashboard";
import ReviewDetail from "./pages/ReviewDetail";
import Settings from "./pages/Settings";
import { PhotoUploadDemo } from "./pages/PhotoUploadDemo";
import { GpsCorrectionDemo } from "./pages/GpsCorrectionDemo";
import NotFound from "./pages/NotFound";

export function AppRouter() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/debug" element={<IndexDebug />} />
        <Route path="/safe" element={<IndexSafe />} />
        <Route path="/minimal" element={<IndexMinimal />} />
        <Route path="/nomap" element={<IndexNoMap />} />
        <Route path="/simple" element={<IndexSimple />} />
        <Route path="/full" element={<Index />} />
        <Route path="/create-review" element={<CreateReview />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/review/:naddr" element={<ReviewDetail />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/photo-upload-demo" element={<PhotoUploadDemo />} />
        <Route path="/gps-correction-demo" element={<GpsCorrectionDemo />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
export default AppRouter;