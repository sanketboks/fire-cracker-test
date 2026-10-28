import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import {
  createInitialMarketplace,
  DEMO_STORAGE_KEY,
  initialRegistration,
  type MarketplaceState,
} from "@/lib/marketplace";

type MarketplaceContextValue = {
  state: MarketplaceState;
  setState: Dispatch<SetStateAction<MarketplaceState>>;
};

const MarketplaceContext = createContext<MarketplaceContextValue | null>(null);

export function MarketplaceProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<MarketplaceState>(createInitialMarketplace);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(DEMO_STORAGE_KEY);
      if (saved) {
        const restored = JSON.parse(saved) as Partial<MarketplaceState>;
        const defaults = createInitialMarketplace();
        setState({
          ...defaults,
          ...restored,
          registration: { ...initialRegistration, ...restored.registration },
        });
      }
    } catch {
      window.localStorage.removeItem(DEMO_STORAGE_KEY);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(state));
    } catch {
      // The demo remains usable for the current browser session when storage is full.
    }
  }, [hydrated, state]);

  const value = useMemo(() => ({ state, setState }), [state]);
  return <MarketplaceContext.Provider value={value}>{children}</MarketplaceContext.Provider>;
}

export function useMarketplace() {
  const value = useContext(MarketplaceContext);
  if (!value) throw new Error("Marketplace screens must be rendered inside MarketplaceProvider.");
  return value;
}