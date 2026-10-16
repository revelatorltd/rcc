import { useEffect, useState } from "react";

/**
 * Where the reader is, read off the address bar — a hash, as the replica reads it, so nothing
 * beside the system has to be explained when the result is read.
 */
export type AccountsPage = "customers";

export type Route = { name: "accounts"; page: AccountsPage };

export const accountsHref = (page: AccountsPage) => `#/accounts/${page}`;

/** The address read as a route. Anything it does not name lands on the section's first page. */
function read(_hash: string): Route {
  return { name: "accounts", page: "customers" };
}

export function useRoute(): Route {
  const [route, setRoute] = useState(() => read(window.location.hash));
  useEffect(() => {
    const moved = () => setRoute(read(window.location.hash));
    window.addEventListener("hashchange", moved);
    return () => window.removeEventListener("hashchange", moved);
  }, []);
  return route;
}
