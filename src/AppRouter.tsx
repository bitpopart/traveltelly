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
import AdminPanel from "./pages/AdminPanel";
import AdminTest from "./pages/AdminTest";
import AdminDebug from "./pages/AdminDebug";
import AdminSimple from "./pages/AdminSimple";
import RouteTest from "./pages/RouteTest";
import AdminBasic from "./pages/AdminBasic";
import RemoveReviews from "./pages/RemoveReviews";
import HideReviews from "./pages/HideReviews";
import { PhotoUploadDemo } from "./pages/PhotoUploadDemo";
import { GpsCorrectionDemo } from "./pages/GpsCorrectionDemo";
import Marketplace from "./pages/Marketplace";
import MarketplaceOrders from "./pages/MarketplaceOrders";
import MarketplacePortfolio from "./pages/MarketplacePortfolio";
import MediaPreview from "./pages/MediaPreview";
import DownloadPage from "./pages/DownloadPage";

import Stories from "./pages/Stories";
import Reviews from "./pages/Reviews";
import CategoryTest from "./pages/CategoryTest";
import StockMediaPermissions from "./pages/StockMediaPermissions";
import MediaManagementPage from "./pages/MediaManagementPage";
import { Events } from "./pages/Events";
import { AdminEvents } from "./pages/AdminEvents";
import SearchTest from "./pages/SearchTest";
import { SimpleMapDemoPage } from "./pages/SimpleMapDemo";
import NotFound from "./pages/NotFound";

export function AppRouter() {
  return (
    <BrowserRouter basename="/traveltelly/">
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/debug" element={<IndexDebug />} />
        <Route path="/safe" element={<IndexSafe />} />
        <Route path="/minimal" element={<IndexMinimal />} />
        <Route path="/nomap" element={<IndexNoMap />} />
        <Route path="/simple" element={<IndexSimple />} />
        <Route path="/full" element={<Index />} />
        <Route path="/stories" element={<Stories />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/create-review" element={<CreateReview />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/review/:naddr" element={<ReviewDetail />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/admin-test" element={<AdminTest />} />
        <Route path="/admin-debug" element={<AdminDebug />} />
        <Route path="/admin-simple" element={<AdminSimple />} />
        <Route path="/admin-basic" element={<AdminBasic />} />
        <Route path="/remove-reviews" element={<RemoveReviews />} />
        <Route path="/hide-reviews" element={<HideReviews />} />
        <Route path="/route-test" element={<RouteTest />} />
        <Route path="/photo-upload-demo" element={<PhotoUploadDemo />} />
        <Route path="/gps-correction-demo" element={<GpsCorrectionDemo />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/marketplace/orders" element={<MarketplaceOrders />} />
        <Route path="/marketplace/portfolio" element={<MarketplacePortfolio />} />
        <Route path="/media/preview/:naddr" element={<MediaPreview />} />
        <Route path="/download/:orderId" element={<DownloadPage />} />
        <Route path="/category-test" element={<CategoryTest />} />
        <Route path="/stock-media-permissions" element={<StockMediaPermissions />} />
        <Route path="/media-management" element={<MediaManagementPage />} />
        <Route path="/events" element={<Events />} />
        <Route path="/admin/events" element={<AdminEvents />} />
        <Route path="/search-test" element={<SearchTest />} />
        <Route path="/simple-map-demo" element={<SimpleMapDemoPage />} />
        {/* <Route path="/world-map" element={<WorldMap />} /> */}
        {/* Explicit admin routes for better debugging */}
        <Route path="/admin/*" element={<AdminPanel />} />
        <Route path="/admin-test/*" element={<AdminTest />} />
        <Route path="/admin-debug/*" element={<AdminDebug />} />
        <Route path="/admin-simple/*" element={<AdminSimple />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
export default AppRouter;