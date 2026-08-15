import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ScrollToTop } from "./components/ScrollToTop";
import { BottomNav } from "./components/BottomNav";

import { lazy } from "react";

const Index = lazy(() => import("./pages/Index"));
const IndexSimple = lazy(() => import("./pages/IndexSimple"));
const IndexNoMap = lazy(() => import("./pages/IndexNoMap"));
const IndexMinimal = lazy(() => import("./pages/IndexMinimal"));
const IndexSafe = lazy(() => import("./pages/IndexSafe"));
const IndexDebug = lazy(() => import("./pages/IndexDebug"));
const _IndexBasic = lazy(() => import("./pages/IndexBasic"));
const CreateReview = lazy(() => import("./pages/CreateReview"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ReviewDetail = lazy(() => import("./pages/ReviewDetail"));
const Settings = lazy(() => import("./pages/Settings"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const AdminTest = lazy(() => import("./pages/AdminTest"));
const AdminDebug = lazy(() => import("./pages/AdminDebug"));
const AdminSimple = lazy(() => import("./pages/AdminSimple"));
const RouteTest = lazy(() => import("./pages/RouteTest"));
const AdminBasic = lazy(() => import("./pages/AdminBasic"));
const RemoveReviews = lazy(() => import("./pages/RemoveReviews"));
const HideReviews = lazy(() => import("./pages/HideReviews"));
const PhotoUploadDemo = lazy(() => import("./pages/PhotoUploadDemo").then(m => ({ default: m.PhotoUploadDemo })));
const GpsCorrectionDemo = lazy(() => import("./pages/GpsCorrectionDemo").then(m => ({ default: m.GpsCorrectionDemo })));
const Marketplace = lazy(() => import("./pages/Marketplace"));
const MarketplaceOrders = lazy(() => import("./pages/MarketplaceOrders"));
const MarketplacePortfolio = lazy(() => import("./pages/MarketplacePortfolio"));
const MediaPreview = lazy(() => import("./pages/MediaPreview"));
const DownloadPage = lazy(() => import("./pages/DownloadPage"));
const Stories = lazy(() => import("./pages/Stories"));
const StoryDetail = lazy(() => import("./pages/StoryDetail"));
const WrittenStoryPage = lazy(() => import("./pages/WrittenStoryPage"));
const VideoDetail = lazy(() => import("./pages/VideoDetail"));
const Reviews = lazy(() => import("./pages/Reviews"));
const Trips = lazy(() => import("./pages/Trips"));
const TripDetail = lazy(() => import("./pages/TripDetail"));
const CategoryTest = lazy(() => import("./pages/CategoryTest"));
const StockMediaPermissions = lazy(() => import("./pages/StockMediaPermissions"));
const MediaManagementPage = lazy(() => import("./pages/MediaManagementPage"));
const MediaManagementHub = lazy(() => import("./pages/MediaManagementHub"));
const MapMarkerEditor = lazy(() => import("./pages/MapMarkerEditor"));
const Events = lazy(() => import("./pages/Events").then(m => ({ default: m.Events })));
const AdminEvents = lazy(() => import("./pages/AdminEvents").then(m => ({ default: m.AdminEvents })));
const SearchTest = lazy(() => import("./pages/SearchTest"));
const SimpleMapDemoPage = lazy(() => import("./pages/SimpleMapDemo").then(m => ({ default: m.SimpleMapDemoPage })));
const WhatIsNostr = lazy(() => import("./pages/WhatIsNostr"));
const CategoryMigrationPage = lazy(() => import("./pages/CategoryMigrationPage"));
const AdminMassUpload = lazy(() => import("./pages/AdminMassUpload").then(m => ({ default: m.AdminMassUpload })));
const AdminImageRecognition = lazy(() => import("./pages/AdminImageRecognition"));
const LocationPage = lazy(() => import("./pages/LocationPage").then(m => ({ default: m.LocationPage })));
const AppBuilder = lazy(() => import("./pages/AppBuilder"));
const ShareScheduler = lazy(() => import("./pages/ShareScheduler"));
const AnalyticsDashboard = lazy(() => import("./pages/AnalyticsDashboard"));
const GuestPortal = lazy(() => import("./pages/GuestPortal"));
const TellyBot = lazy(() => import("./pages/TellyBot").then(m => ({ default: m.TellyBot })));
const AdminPayments = lazy(() => import("./pages/AdminPayments"));
const AdminMarketplace = lazy(() => import("./pages/AdminMarketplace"));
const BinMediaWorkspace = lazy(() => import("./pages/BinMediaWorkspace"));
const MyTravels = lazy(() => import("./pages/MyTravels"));
const Zaplytics = lazy(() => import("./pages/Zaplytics"));
const TravelerProfile = lazy(() => import("./pages/TravelerProfile"));
const TravelTellyTour = lazy(() => import("./pages/TravelTellyTour"));
const TourFeed = lazy(() => import("./pages/TourFeed"));
const Community = lazy(() => import("./pages/Community"));
const GammaMarketplace = lazy(() => import("./pages/GammaMarketplace"));
const TellyMap = lazy(() => import("./pages/TellyMap"));
const NotFound = lazy(() => import("./pages/NotFound"));

export function AppRouter() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Homepage = the ONE world map. Images grid lives at /home (toggle). */}
        <Route path="/" element={<TellyMap />} />
        <Route path="/home" element={<Index />} />
        <Route path="/debug" element={<IndexDebug />} />
        <Route path="/safe" element={<IndexSafe />} />
        <Route path="/minimal" element={<IndexMinimal />} />
        <Route path="/nomap" element={<IndexNoMap />} />
        <Route path="/simple" element={<IndexSimple />} />
        <Route path="/full" element={<Index />} />
        <Route path="/stories" element={<Stories />} />
        <Route path="/story/:naddr" element={<StoryDetail />} />
        <Route path="/story-page/:naddr" element={<WrittenStoryPage />} />
        <Route path="/video/:naddr" element={<VideoDetail />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/trips" element={<Trips />} />
        <Route path="/trip/:naddr" element={<TripDetail />} />
        <Route path="/my-travels" element={<MyTravels />} />
        <Route path="/zaplytics" element={<Zaplytics />} />
        <Route path="/create-review" element={<CreateReview />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/review/:slug" element={<ReviewDetail />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/admin/mass-upload" element={<AdminMassUpload />} />
        <Route path="/admin/app-builder" element={<AppBuilder />} />
        <Route path="/admin/share-scheduler" element={<ShareScheduler />} />
        <Route path="/admin/analytics" element={<AnalyticsDashboard />} />
        <Route path="/admin/telly-bot" element={<TellyBot />} />
        <Route path="/admin/image-recognition" element={<AdminImageRecognition />} />
        <Route path="/admin/payments" element={<AdminPayments />} />
        <Route path="/admin/marketplace" element={<AdminMarketplace />} />
        <Route path="/admin/bin-workspace" element={<BinMediaWorkspace />} />
        <Route path="/admin/events" element={<AdminEvents />} />
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
        <Route path="/marketplace/gamma" element={<GammaMarketplace />} />
        <Route path="/guest-portal" element={<GuestPortal />} />
        <Route path="/media/preview/:naddr" element={<MediaPreview />} />
        <Route path="/download/:orderId" element={<DownloadPage />} />
        <Route path="/category-test" element={<CategoryTest />} />
        <Route path="/stock-media-permissions" element={<StockMediaPermissions />} />
        <Route path="/media-management" element={<MediaManagementHub />} />
        <Route path="/media-management-legacy" element={<MediaManagementPage />} />
        <Route path="/map-marker-editor" element={<MapMarkerEditor />} />
        <Route path="/events" element={<Events />} />
        <Route path="/search-test" element={<SearchTest />} />
        <Route path="/simple-map-demo" element={<SimpleMapDemoPage />} />
        <Route path="/what-is-nostr" element={<WhatIsNostr />} />
        <Route path="/category-migration" element={<CategoryMigrationPage />} />
        <Route path="/world-map" element={<TellyMap />} />
        <Route path="/traveltelly-tour" element={<TravelTellyTour />} />
        <Route path="/tour-feed/:eventId" element={<TourFeed />} />
        <Route path="/community" element={<Community />} />
        <Route path="/telly-map" element={<TellyMap />} />
        {/* Traveler Profile Routes */}
        <Route path="/traveler/:username" element={<TravelerProfile />} />
        {/* Explicit admin routes for better debugging */}
        <Route path="/admin/*" element={<AdminPanel />} />
        <Route path="/admin-test/*" element={<AdminTest />} />
        <Route path="/admin-debug/*" element={<AdminDebug />} />
        <Route path="/admin-simple/*" element={<AdminSimple />} />
        {/* Dynamic location routes - must be last before catch-all */}
        <Route path="/:location" element={<LocationPage />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <BottomNav />
    </BrowserRouter>
  );
}
export default AppRouter;