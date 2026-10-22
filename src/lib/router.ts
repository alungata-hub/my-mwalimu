import { useEffect, useState } from 'react';

export interface Route {
  path: string;
  segments: string[];
}

function parseHash(hash: string): Route {
  const raw = hash.replace(/^#/, '') || '/dashboard';
  const path = raw.startsWith('/') ? raw : `/${raw}`;
  const segments = path.split('/').filter(Boolean);
  return { path, segments };
}

export function useRouter(): Route {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));

  useEffect(() => {
    const onChange = () => {
      setRoute(parseHash(window.location.hash));
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', onChange);
    if (!window.location.hash) {
      window.location.hash = '#/dashboard';
    }
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  return route;
}

export function navigate(to: string): void {
  const target = to.startsWith('#') ? to : `#${to}`;
  if (window.location.hash === target) {
    window.scrollTo({ top: 0 });
    return;
  }
  window.location.hash = target;
}
