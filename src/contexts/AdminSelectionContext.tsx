/**
 * AdminSelectionContext
 *
 * Provides a shared Set of selected product IDs for the admin bulk-download
 * feature. Only rendered/used when the admin is logged in; all other users
 * receive an empty no-op context so nothing leaks to the UI.
 */
import { createContext, useCallback, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { MarketplaceProduct } from '@/hooks/useMarketplaceProducts';

interface AdminSelectionContextValue {
  /** Currently selected product IDs */
  selectedIds: Set<string>;
  /** Map from product ID → full product (needed for bulk download) */
  selectedProducts: Map<string, MarketplaceProduct>;
  /** Toggle selection of a single product */
  toggle: (product: MarketplaceProduct) => void;
  /** Select all products in the supplied list */
  selectAll: (products: MarketplaceProduct[]) => void;
  /** Clear all selections */
  clearAll: () => void;
}

const AdminSelectionContext = createContext<AdminSelectionContextValue>({
  selectedIds: new Set(),
  selectedProducts: new Map(),
  toggle: () => {},
  selectAll: () => {},
  clearAll: () => {},
});

export function AdminSelectionProvider({ children }: { children: ReactNode }) {
  const [selectedProducts, setSelectedProducts] = useState<Map<string, MarketplaceProduct>>(new Map());

  const toggle = useCallback((product: MarketplaceProduct) => {
    setSelectedProducts(prev => {
      const next = new Map(prev);
      if (next.has(product.id)) {
        next.delete(product.id);
      } else {
        next.set(product.id, product);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback((products: MarketplaceProduct[]) => {
    setSelectedProducts(prev => {
      const next = new Map(prev);
      for (const p of products) next.set(p.id, p);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setSelectedProducts(new Map());
  }, []);

  return (
    <AdminSelectionContext.Provider
      value={{
        selectedIds: new Set(selectedProducts.keys()),
        selectedProducts,
        toggle,
        selectAll,
        clearAll,
      }}
    >
      {children}
    </AdminSelectionContext.Provider>
  );
}

export function useAdminSelection() {
  return useContext(AdminSelectionContext);
}
