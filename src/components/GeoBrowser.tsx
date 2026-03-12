import { useState } from 'react';
import { ChevronRight, Globe, MapPin, ArrowLeft, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { useGeoWorld, useGeoContinent, useGeoCountry, type GeoNode } from '@/hooks/useGeoMediaBrowser';
import { getContinentLabel, getCountryLabel } from '@/lib/geoData';

/* ─── Thumbnail card ──────────────────────────────────────────── */
function GeoCard({ node, onClick }: { node: GeoNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="relative aspect-square overflow-hidden rounded-lg group cursor-pointer bg-gray-200 dark:bg-gray-700 w-full"
    >
      {node.thumb ? (
        <img
          src={node.thumb}
          alt={node.label}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-pink-100 to-red-100 dark:from-pink-900/30 dark:to-red-900/30">
          <Globe className="w-8 h-8 text-pink-400" />
        </div>
      )}
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      {/* Labels */}
      <div className="absolute bottom-0 left-0 right-0 p-2 text-left">
        <p className="text-white text-xs font-semibold leading-tight line-clamp-2">{node.label}</p>
        <p className="text-white/70 text-[10px] mt-0.5">{node.count} items</p>
      </div>
      {/* Arrow */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
          <ChevronRight className="w-3.5 h-3.5 text-white" />
        </div>
      </div>
    </button>
  );
}

function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-1 md:gap-1.5">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="aspect-square w-full rounded-lg" />
      ))}
    </div>
  );
}

/* ─── World view ─────────────────────────────────────────────── */
function WorldView({ onSelectContinent }: { onSelectContinent: (c: string) => void }) {
  const { data, isLoading } = useGeoWorld();

  if (isLoading) return <SkeletonGrid count={7} />;
  if (!data || data.nodes.length === 0) return (
    <p className="text-sm text-muted-foreground py-6 text-center">No geo-tagged media yet.</p>
  );

  return (
    <div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-1 md:gap-1.5">
        {data.nodes.map(node => (
          <GeoCard key={node.key} node={node} onClick={() => onSelectContinent(node.key)} />
        ))}
        {/* "Untagged" tile */}
        {data.untaggedCount > 0 && (
          <Link to="/marketplace?geo=untagged">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center gap-1 border-2 border-dashed border-gray-300 dark:border-gray-600">
              <Camera className="w-6 h-6 text-gray-400" />
              <span className="text-[10px] text-gray-500 text-center px-1">All regions</span>
              <Badge variant="secondary" className="text-[9px] h-4">{data.total}</Badge>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}

/* ─── Continent view ─────────────────────────────────────────── */
function ContinentView({
  continent,
  onSelectCountry,
  onBack,
}: {
  continent: string;
  onSelectCountry: (c: string) => void;
  onBack: () => void;
}) {
  const { data: nodes, isLoading } = useGeoContinent(continent);

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3">
        <ArrowLeft className="w-3.5 h-3.5" /> World
      </button>
      {isLoading ? <SkeletonGrid count={8} /> : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-1 md:gap-1.5">
          {(nodes || []).map(node => (
            <GeoCard key={node.key} node={node} onClick={() => onSelectCountry(node.key)} />
          ))}
          {(!nodes || nodes.length === 0) && (
            <p className="col-span-full text-sm text-muted-foreground py-4 text-center">No countries with tagged media in {getContinentLabel(continent)}.</p>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Country view ───────────────────────────────────────────── */
function CountryView({
  continent,
  country,
  onSelectCity,
  onBack,
}: {
  continent: string;
  country: string;
  onSelectCity: (city: string) => void;
  onBack: () => void;
}) {
  const { data, isLoading } = useGeoCountry(continent, country);

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3">
        <ArrowLeft className="w-3.5 h-3.5" /> {getContinentLabel(continent)}
      </button>
      {isLoading ? <SkeletonGrid count={6} /> : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-1 md:gap-1.5">
          {/* "All in country" tile */}
          <Link to={`/marketplace?country=${country}`}>
            <div className="relative aspect-square overflow-hidden rounded-lg bg-pink-50 dark:bg-pink-900/20 flex flex-col items-center justify-center gap-1 border border-pink-200 dark:border-pink-800">
              <MapPin className="w-5 h-5 text-pink-500" />
              <span className="text-[10px] text-pink-600 font-medium text-center px-1">All {getCountryLabel(country)}</span>
            </div>
          </Link>
          {(data?.nodes || []).map(node => (
            <GeoCard key={node.key} node={node} onClick={() => onSelectCity(node.key)} />
          ))}
          {(!data?.nodes || data.nodes.length === 0) && (
            <p className="col-span-full text-sm text-muted-foreground py-4 text-center">No cities tagged in {getCountryLabel(country)} yet.</p>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Main GeoBrowser ────────────────────────────────────────── */
export function GeoBrowser({
  onFilter,
}: {
  onFilter: (filters: { continent?: string; country?: string; city?: string }) => void;
}) {
  const [continent, setContinent] = useState<string | null>(null);
  const [country, setCountry] = useState<string | null>(null);

  // Breadcrumb label
  const breadcrumb = [
    <button key="world" onClick={() => { setContinent(null); setCountry(null); onFilter({}); }} className="hover:text-pink-600 font-medium">
      🌍 World
    </button>,
    ...(continent ? [
      <ChevronRight key="a" className="w-3 h-3 inline" />,
      <button key="cont" onClick={() => { setCountry(null); onFilter({ continent }); }} className="hover:text-pink-600">
        {getContinentLabel(continent)}
      </button>,
    ] : []),
    ...(country ? [
      <ChevronRight key="b" className="w-3 h-3 inline" />,
      <span key="ctry" className="text-pink-600 font-medium">{getCountryLabel(country)}</span>,
    ] : []),
  ];

  return (
    <div className="mb-8">
      {/* Section header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {breadcrumb}
        </div>
        {(continent || country) && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-7"
            onClick={() => { setContinent(null); setCountry(null); onFilter({}); }}
          >
            Show all
          </Button>
        )}
      </div>

      {/* Grid */}
      {!continent && (
        <WorldView
          onSelectContinent={(c) => { setContinent(c); setCountry(null); onFilter({ continent: c }); }}
        />
      )}
      {continent && !country && (
        <ContinentView
          continent={continent}
          onSelectCountry={(c) => { setCountry(c); onFilter({ continent, country: c }); }}
          onBack={() => { setContinent(null); onFilter({}); }}
        />
      )}
      {continent && country && (
        <CountryView
          continent={continent}
          country={country}
          onSelectCity={(city) => onFilter({ continent, country, city })}
          onBack={() => { setCountry(null); onFilter({ continent }); }}
        />
      )}
    </div>
  );
}
