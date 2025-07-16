import { useAppContext } from '@/hooks/useAppContext';

export function useMapProvider() {
  const { config, updateConfig } = useAppContext();

  const setMapProvider = (provider: 'openstreetmap' | 'satellite') => {
    updateConfig((current) => ({
      ...current,
      mapProvider: provider,
    }));
  };

  return {
    mapProvider: config.mapProvider,
    setMapProvider,
  };
}