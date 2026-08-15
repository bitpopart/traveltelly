import { useSeoMeta } from '@unhead/react';
import { useState, useEffect, useRef } from 'react';;
import { Navigation as NavigationComponent } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

import { RelaySelector } from "@/components/RelaySelector";
import { FastThumbnail } from "@/components/FastThumbnail";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";



import { LocationContentGrid } from "@/components/LocationContentGrid";
import { CreateTripForm } from "@/components/CreateTripForm";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useReviewCount, useStoryCount, useStockMediaCount, useTripCount, useLatestReviews, useLatestStories, useLatestTrips, useLatestStockMediaItems, useLatestVideos, useCommunityMix } from "@/hooks/useLatestItems";
import { VideoThumbnailGrid, VideoItem } from "@/components/VideoThumbnailGrid";
import { useInfiniteImages } from "@/hooks/useInfiniteImages";

import { useViewMode } from "@/contexts/ViewModeContext";
import { dedupeByImage } from "@/lib/dedupeImages";
import { MapPin, Star, Camera, Zap, BookOpen, ArrowRight, Globe, Video } from "lucide-react";;
import { Link } from "react-router-dom";

;
;
;
;
;
;
;
;
;

interface IndexProps {
  initialLocation?: string;
}

const Index = ({ initialLocation }: IndexProps = {}) => {
  const { user } = useCurrentUser();
  const { viewMode } = useViewMode();
  const [isCreateTripDialogOpen, setIsCreateTripDialogOpen] = useState(false);
  const [selectedLocationTag] = useState<string>(initialLocation || '');

  // ── Lazy section flags: only fetch when scrolled into view ──────────────────
  // Reviews, Stories, Trips, Stock Media sections are below the fold in map mode.
  // We gate their queries behind IntersectionObserver triggers.
  const [reviewsVisible, setReviewsVisible] = useState(false);
  const [storiesVisible, setStoriesVisible] = useState(false);
  const [tripsVisible, setTripsVisible] = useState(false);
  const [stockVisible, setStockVisible] = useState(false);
  const [fetchAllVideos, setFetchAllVideos] = useState(false);

  const reviewsSentinel = useRef<HTMLDivElement>(null);
  const storiesSentinel = useRef<HTMLDivElement>(null);
  const tripsSentinel = useRef<HTMLDivElement>(null);
  const stockSentinel = useRef<HTMLDivElement>(null);
  const videoSentinelRef = useRef<HTMLDivElement>(null);

  // One observer factory for lazy sections
  useEffect(() => {
    const createObs = (el: HTMLDivElement | null, setter: (v: true) => void) => {
      if (!el) return () => {};
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) { setter(true); obs.disconnect(); } },
        { rootMargin: '300px' }
      );
      obs.observe(el);
      return () => obs.disconnect();
    };
    const cleanups = [
      createObs(reviewsSentinel.current, () => setReviewsVisible(true)),
      createObs(storiesSentinel.current, () => setStoriesVisible(true)),
      createObs(tripsSentinel.current, () => setTripsVisible(true)),
      createObs(stockSentinel.current, () => setStockVisible(true)),
    ];
    return () => cleanups.forEach(fn => fn());
  }, [viewMode]); // re-run when view mode switches

  // Get counts
  const reviewCount = useReviewCount();
  const { data: storyCount = 0 } = useStoryCount();
  const { data: stockMediaCount = 0 } = useStockMediaCount();
  const { data: tripCount = 0 } = useTripCount();
  
  // Get last 3 items for each category — gated by visibility flags
  const { data: latestReviews = [] } = useLatestReviews(reviewsVisible);
  const { data: latestStories = [] } = useLatestStories(storiesVisible);
  const { data: latestTrips = [] } = useLatestTrips(tripsVisible);
  const { data: latestStockMediaItems = [] } = useLatestStockMediaItems(stockVisible);

  // Videos: load initial batch fast, fetch all when user scrolls to load-more sentinel
  const VIDEOS_INITIAL_ROWS = 4;
  const VIDEOS_PER_ROW = 6; // lg grid columns
  const videosInitialCount = VIDEOS_INITIAL_ROWS * VIDEOS_PER_ROW; // 24
  const { data: latestVideos = [] } = useLatestVideos(fetchAllVideos);
  const [showAllVideos, setShowAllVideos] = useState(false);
  const displayedVideos = showAllVideos ? latestVideos : latestVideos.slice(0, videosInitialCount);

  // Auto-trigger full video fetch when sentinel scrolls into view
  useEffect(() => {
    if (showAllVideos || fetchAllVideos) return;
    const el = videoSentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setFetchAllVideos(true); setShowAllVideos(true); } },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [showAllVideos, fetchAllVideos]);

  const { data: communityMix = [] } = useCommunityMix();
  
  // Get images with pagination for faster loading
  const {
    data: infiniteImagesData,
    isLoading: imagesLoading,
    isFetching: imagesFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteImages();

  // Flatten all pages of images into a single array
  const allImages = dedupeByImage(infiniteImagesData?.pages.flatMap(page => page.images) || []);

  // A map pin is auto-listed on /marketplace with the same photo — a marketplace
  // thumb whose image is already shown in the grid above is the same photo, so
  // only show it in the Stock section when the grid doesn't already show it.
  const gridShownImages = new Set<string>([
    ...communityMix.map(c => c.image),
    ...allImages.map(i => i.image),
  ]);
  const stockMediaToShow = latestStockMediaItems.filter(m => m.image && !gridShownImages.has(m.image));

  // Show first page immediately; auto-load more as user scrolls
  const THUMBNAIL_BATCH = 24;
  const [displayCount, setDisplayCount] = useState(THUMBNAIL_BATCH);
  const displayedImages = allImages.slice(0, displayCount);
  const imagesSentinelRef = useRef<HTMLDivElement>(null);

  // IntersectionObserver for images grid infinite scroll
  useEffect(() => {
    const el = imagesSentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (displayCount < allImages.length) {
            setDisplayCount(prev => prev + THUMBNAIL_BATCH);
          } else if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
            setDisplayCount(prev => prev + THUMBNAIL_BATCH);
          }
        }
      },
      { rootMargin: '300px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [displayCount, allImages.length, hasNextPage, isFetchingNextPage, fetchNextPage]);





  useSeoMeta({
    title: 'Traveltelly - Nostr Powered Travel Community',
    description: 'Nostr Powered Travel Community. Upload photos, rate locations, and earn Lightning tips.',
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f4f4f5' }}>
      <NavigationComponent />

      <div className="container mx-auto px-2 md:px-4 pt-2 pb-4 md:pt-3 md:pb-8">
        <div className="max-w-6xl mx-auto">
          {/* Images Grid */}
          {!selectedLocationTag && (
            <div className="mb-8 md:mb-12">
              {(communityMix.length > 0 || displayedImages.length > 0) ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-0.5 md:gap-1">
                  {/* Community mix rows — always first, guaranteed variety */}
                  {communityMix.map((item, index) => {
                    const iconMap = { tour: Globe, review: Star, story: BookOpen, video: Video, trip: MapPin, stock: Camera } as const;
                    const Icon = iconMap[item.type];
                    // Videos get hover-preview behaviour via VideoItem
                    if (item.type === 'video') {
                      return (
                        <div key={item.key} className="aspect-square">
                          <VideoItem video={item.event} />
                        </div>
                      );
                    }
                    return (
                      <Link key={item.key} to={item.link}>
                        <div className="relative aspect-square overflow-hidden group cursor-pointer bg-gray-200 dark:bg-gray-700">
                          <FastThumbnail src={item.image} alt={item.alt} priority={index < 6} className="transition-transform duration-300 group-hover:scale-105" />
                          <div className="absolute bottom-1 left-1 z-10 opacity-80 group-hover:opacity-100 transition-opacity">
                            <div className="w-5 h-5 rounded-full flex items-center justify-center shadow" style={{ backgroundColor: item.color }}>
                              <Icon className="w-2.5 h-2.5 text-white" strokeWidth={2.5} />
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                  {/* Remaining images, de-duped against community mix, capped at displayCount */}
                  {displayedImages
                    .filter(item => !communityMix.some(c => c.image === item.image))
                    .map((item, index) => {
                      let destinationPath = '/';
                      switch (item.type) {
                        case 'review': destinationPath = `/review/${item.naddr}`; break;
                        case 'trip':   destinationPath = `/trip/${item.naddr}`; break;
                        case 'story':  destinationPath = `/story/${item.naddr}`; break;
                        case 'stock':  destinationPath = `/media/preview/${item.naddr}`; break;
                        case 'tour':   destinationPath = `/tour-feed/${'eventId' in item ? item.eventId : ''}`; break;
                        case 'video':  destinationPath = `/video/${item.naddr}`; break;
                      }
                      const iconMap2 = { review: Star, story: BookOpen, trip: MapPin, stock: Camera, tour: Globe, video: Video } as const;
                      const colorMap = { review: '#27b0ff', story: '#b2d235', trip: '#ffcc00', stock: '#ec1a58', tour: '#9333ea', video: '#9333ea' } as const;
                      const Icon2 = iconMap2[item.type];
                      const color2 = colorMap[item.type];
                      const itemKey = item.type === 'tour' && 'eventId' in item
                        ? `${item.type}-${item.eventId}-${item.image}`
                        : `${item.type}-${item.naddr}-${index}`;

                      if (item.type === 'video') {
                        return (
                          <div key={itemKey} className="aspect-square">
                            <VideoItem video={item.event} />
                          </div>
                        );
                      }
                      return (
                        <Link key={itemKey} to={destinationPath}>
                          <div className="relative aspect-square overflow-hidden group cursor-pointer bg-gray-200 dark:bg-gray-700">
                            <FastThumbnail src={item.image} alt={item.title} className="transition-transform duration-300 group-hover:scale-105" priority={index < 6} />
                            <div className="absolute bottom-1 left-1 z-10 opacity-80 group-hover:opacity-100 transition-opacity">
                              <div className="w-5 h-5 rounded-full flex items-center justify-center shadow" style={{ backgroundColor: color2 }}>
                                <Icon2 className="w-2.5 h-2.5 text-white" strokeWidth={2.5} />
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                </div>
              ) : (imagesLoading || imagesFetching) ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-0.5 md:gap-1">
                  {Array.from({ length: 18 }).map((_, i) => (
                    <div key={i} className="aspect-square bg-gray-200 dark:bg-gray-700 animate-pulse" />
                  ))}
                </div>
              ) : (
                <Card className="border-dashed">
                  <CardContent className="py-12 px-8 text-center">
                    <div className="max-w-sm mx-auto space-y-4">
                      <Camera className="w-12 h-12 mx-auto text-muted-foreground" />
                      <p className="text-muted-foreground">
                        No images found. {user ? 'Start creating content to see it here!' : 'Try switching relays or check back later.'}
                      </p>
                      <RelaySelector className="w-full" />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Scroll sentinel — triggers load more automatically */}
              <div ref={imagesSentinelRef} className="h-4" />
              {isFetchingNextPage && (
                <div className="flex justify-center py-4">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                </div>
              )}
            </div>
          )}

          {/* Content sections */}
          {(
            selectedLocationTag ? (
              <div className="mb-8 md:mb-12">
                <LocationContentGrid locationTag={selectedLocationTag} />
              </div>
            ) : (
              <>
                {/* Community Mix — round-robin from tour, reviews, stories, trips, stock, videos */}
                {communityMix.length > 0 && (
                  <div className="mb-6 md:mb-8">
                    <div className="flex justify-between items-center mb-3">
                      <h2 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Globe className="w-5 h-5 md:w-6 md:h-6" style={{ color: '#9333ea' }} />
                        Community
                      </h2>
                      <Link to="/traveltelly-tour">
                        <Button variant="outline" className="rounded-full text-xs px-3 py-1 h-auto" style={{ borderColor: '#9333ea', color: '#9333ea' }}>
                          View All <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </Link>
                    </div>
                    <div className="grid grid-cols-3 gap-0.5 md:gap-1">
                      {communityMix.map((item, index) => {
                        const iconMap = {
                          tour: Globe, review: Star, story: BookOpen,
                          video: Video, trip: MapPin, stock: Camera,
                        } as const;
                        const Icon = iconMap[item.type];
                        return (
                          <Link key={item.key} to={item.link}>
                            <div className="relative aspect-square overflow-hidden group cursor-pointer bg-gray-200 dark:bg-gray-700">
                              <FastThumbnail
                                src={item.image}
                                alt={item.alt}
                                priority={index < 3}
                                className="transition-transform duration-300 group-hover:scale-105"
                              />
                              <div className="absolute bottom-1 left-1 z-10 opacity-80 group-hover:opacity-100 transition-opacity">
                                <div className="w-5 h-5 rounded-full flex items-center justify-center shadow" style={{ backgroundColor: item.color }}>
                                  <Icon className="w-2.5 h-2.5 text-white" strokeWidth={2.5} />
                                </div>
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Videos Section */}
                {(latestVideos.length > 0 || fetchAllVideos) && (
                  <div className="mb-6 md:mb-12">
                    <div className="flex justify-between items-center mb-4 md:mb-6">
                      <h2 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Video className="w-6 h-6 md:w-8 md:h-8" style={{ color: '#9333ea' }} />
                        Videos
                      </h2>
                      <Link to="/stories?tab=browse&type=video">
                        <Button variant="outline" className="rounded-full text-xs md:text-sm px-3 md:px-4" style={{ borderColor: '#9333ea', color: '#9333ea' }}>
                          View All
                          <ArrowRight className="w-3 h-3 md:w-4 md:h-4 ml-1 md:ml-2" />
                        </Button>
                      </Link>
                    </div>
                    <VideoThumbnailGrid videos={displayedVideos} />
                    {/* Scroll sentinel — triggers full video fetch */}
                    <div ref={videoSentinelRef} />
                    {/* Show load-more button once full list is loaded and there are more */}
                    {showAllVideos && latestVideos.length > videosInitialCount && (
                      <div className="mt-3 text-center">
                        <Link to="/stories?tab=browse&type=video">
                          <Button variant="outline" className="rounded-full text-xs md:text-sm px-4" style={{ borderColor: '#9333ea', color: '#9333ea' }}>
                            View All {latestVideos.length} Videos
                            <ArrowRight className="w-3 h-3 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                {/* Reviews Section — lazy: only fetch once sentinel scrolls into view */}
                <div ref={reviewsSentinel} />
                {(reviewsVisible && latestReviews.length > 0) && (
                  <div className="mb-6 md:mb-12">
                    <div className="flex justify-between items-center mb-3">
                      <h2 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Star className="w-5 h-5 md:w-6 md:h-6" style={{ color: '#27b0ff' }} />
                        Reviews
                        {reviewCount > 0 && (
                          <span className="text-sm font-normal text-muted-foreground">({reviewCount})</span>
                        )}
                      </h2>
                      <Link to="/reviews">
                        <Button variant="outline" className="rounded-full text-xs px-3 py-1 h-auto" style={{ borderColor: '#27b0ff', color: '#27b0ff' }}>
                          View All <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </Link>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-0.5 md:gap-1">
                      {latestReviews.map((review, index) => (
                        <Link key={review.naddr} to={`/review/${review.naddr}`}>
                          <div className="relative aspect-square overflow-hidden group cursor-pointer bg-gray-200 dark:bg-gray-700">
                            <FastThumbnail src={review.image!} alt={review.title} priority={index === 0} className="transition-transform duration-300 group-hover:scale-105" />
                            <div className="absolute bottom-1 left-1 z-10 opacity-80 group-hover:opacity-100 transition-opacity">
                              <div className="w-5 h-5 rounded-full flex items-center justify-center shadow" style={{ backgroundColor: '#27b0ff' }}>
                                <Star className="w-2.5 h-2.5 text-white" strokeWidth={2.5} />
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stories Section — lazy */}
                <div ref={storiesSentinel} />
                {(storiesVisible && latestStories.length > 0) && (
                  <div className="mb-6 md:mb-12">
                    <div className="flex justify-between items-center mb-3">
                      <h2 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <BookOpen className="w-5 h-5 md:w-6 md:h-6" style={{ color: '#b2d235' }} />
                        Stories
                        {storyCount > 0 && (
                          <span className="text-sm font-normal text-muted-foreground">({storyCount})</span>
                        )}
                      </h2>
                      <Link to="/stories">
                        <Button variant="outline" className="rounded-full text-xs px-3 py-1 h-auto" style={{ borderColor: '#b2d235', color: '#b2d235' }}>
                          View All <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </Link>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-0.5 md:gap-1">
                      {latestStories.map((story, index) => {
                        const isVideoStory = story.event.kind === 34235 || story.event.kind === 34236 || story.event.kind === 21 || story.event.kind === 22;
                        const linkPath = isVideoStory ? `/video/${story.naddr}` : `/story/${story.naddr}`;
                        return (
                          <Link key={story.naddr} to={linkPath}>
                            <div className="relative aspect-square overflow-hidden group cursor-pointer bg-gray-200 dark:bg-gray-700">
                              <FastThumbnail src={story.image!} alt={story.title} priority={index === 0} className="transition-transform duration-300 group-hover:scale-105" />
                              <div className="absolute bottom-1 left-1 z-10 opacity-80 group-hover:opacity-100 transition-opacity">
                                <div className="w-5 h-5 rounded-full flex items-center justify-center shadow" style={{ backgroundColor: '#b2d235' }}>
                                  <BookOpen className="w-2.5 h-2.5 text-white" strokeWidth={2.5} />
                                </div>
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Trips Section — lazy */}
                <div ref={tripsSentinel} />
                {(tripsVisible && latestTrips.length > 0) && (
                  <div className="mb-6 md:mb-12">
                    <div className="flex justify-between items-center mb-3">
                      <h2 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <MapPin className="w-5 h-5 md:w-6 md:h-6" style={{ color: '#ffcc00' }} />
                        Trips
                        {tripCount > 0 && (
                          <span className="text-sm font-normal text-muted-foreground">({tripCount})</span>
                        )}
                      </h2>
                      <Link to="/trips">
                        <Button variant="outline" className="rounded-full text-xs px-3 py-1 h-auto" style={{ borderColor: '#ffcc00', color: '#b8960a' }}>
                          View All <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </Link>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-0.5 md:gap-1">
                      {latestTrips.map((trip, index) => (
                        <Link key={trip.naddr} to={`/trip/${trip.naddr}`}>
                          <div className="relative aspect-square overflow-hidden group cursor-pointer bg-gray-200 dark:bg-gray-700">
                            <FastThumbnail src={trip.image!} alt={trip.title} priority={index === 0} className="transition-transform duration-300 group-hover:scale-105" />
                            <div className="absolute bottom-1 left-1 z-10 opacity-80 group-hover:opacity-100 transition-opacity">
                              <div className="w-5 h-5 rounded-full flex items-center justify-center shadow" style={{ backgroundColor: '#ffcc00' }}>
                                <MapPin className="w-2.5 h-2.5 text-white" strokeWidth={2.5} />
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stock Media Section — lazy */}
                <div ref={stockSentinel} />
                {(stockVisible && stockMediaToShow.length > 0) && (
                  <div className="mb-6 md:mb-12">
                    <div className="flex justify-between items-center mb-3">
                      <h2 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Camera className="w-5 h-5 md:w-6 md:h-6" style={{ color: '#ec1a58' }} />
                        Stock Media
                        {stockMediaCount > 0 && (
                          <span className="text-sm font-normal text-muted-foreground">({stockMediaCount})</span>
                        )}
                      </h2>
                      <Link to="/marketplace">
                        <Button variant="outline" className="rounded-full text-xs px-3 py-1 h-auto" style={{ borderColor: '#ec1a58', color: '#ec1a58' }}>
                          View All <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </Link>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-0.5 md:gap-1">
                      {stockMediaToShow.map((media, index) => (
                        <Link key={media.naddr} to={`/media/preview/${media.naddr}`}>
                          <div className="relative aspect-square overflow-hidden group cursor-pointer bg-gray-200 dark:bg-gray-700">
                            <FastThumbnail src={media.image!} alt={media.title} priority={index === 0} className="transition-transform duration-300 group-hover:scale-105" />
                            <div className="absolute bottom-1 left-1 z-10 opacity-80 group-hover:opacity-100 transition-opacity">
                              <div className="w-5 h-5 rounded-full flex items-center justify-center shadow" style={{ backgroundColor: '#ec1a58' }}>
                                <Camera className="w-2.5 h-2.5 text-white" strokeWidth={2.5} />
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )
          )}

          {/* Lightning Tips Info */}
          {user && (
            <Card className="mb-4 md:mb-8 border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50">
              <CardContent className="p-3 md:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4">
                  <div className="flex items-center gap-2 md:gap-4">
                    <div className="p-2 rounded-full flex-shrink-0" style={{ backgroundColor: '#393636' }}>
                      <Zap className="w-4 h-4 md:w-6 md:h-6 text-white fill-current" />
                    </div>
                    <div>
                      <h3 className="text-sm md:text-lg font-semibold text-gray-900 dark:text-white">
                        ⚡ Lightning Tips Enabled!
                      </h3>
                      <p className="text-[10px] md:text-sm text-gray-600 dark:text-gray-300">
                        Support reviewers with instant Bitcoin tips
                      </p>
                    </div>
                  </div>
                  <Link to="/settings">
                    <Button variant="outline" className="rounded-full text-xs md:text-base w-full sm:w-auto px-3 md:px-4" style={{ borderColor: '#393636', color: '#393636' }}>
                      Setup
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Relay Configuration */}
          <Card className="mb-4 md:mb-8 border-gray-200 dark:border-gray-700">
            <CardHeader className="px-3 md:px-6 pb-3 md:pb-4">
              <CardTitle className="text-sm md:text-lg">Relay Configuration</CardTitle>
              <CardDescription className="text-xs md:text-sm">
                Choose your preferred Nostr relay
              </CardDescription>
            </CardHeader>
            <CardContent className="px-3 md:px-6">
              <RelaySelector className="w-full max-w-md" />
            </CardContent>
          </Card>

        </div>
      </div>

      {/* Create Trip Dialog */}
      <Dialog open={isCreateTripDialogOpen} onOpenChange={setIsCreateTripDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Create New Trip</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <CreateTripForm onSuccess={() => setIsCreateTripDialogOpen(false)} />
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Index;
