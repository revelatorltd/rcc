import { useEffect, useState } from "react";

/**
 * Where the reader is, read off the address bar — a hash, as the replica reads it, so nothing
 * beside the system has to be explained when the result is read.
 */
export type AccountsPage = "customers";

/** A customer's facets, in the order its nav lists them — the one it opens on first. */
export const CUSTOMER_FACETS = ["Overview", "Details", "Subscriptions", "Contacts", "Tenants"] as const;
export type CustomerFacet = (typeof CUSTOMER_FACETS)[number];

export type Route =
  | { name: "accounts"; page: AccountsPage }
  | { name: "customer"; id: string; facet: CustomerFacet };

export const accountsHref = (page: AccountsPage) => `#/accounts/${page}`;

const slug = (facet: CustomerFacet) => facet.toLowerCase();

export const customerHref = (id: string, facet: CustomerFacet = "Overview") =>
  facet === "Overview" ? `#/accounts/customers/${id}` : `#/accounts/customers/${id}/${slug(facet)}`;

/** The address read as a route. Anything it does not name lands on the section's first page. */
function read(hash: string): Route {
  const [, section, page, id, facet] = hash.replace(/^#/, "").split("/");
  if (section === "accounts" && page === "customers" && id)
    return {
      name: "customer",
      id,
      facet: CUSTOMER_FACETS.find((one) => slug(one) === facet) ?? "Overview",
    };
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
