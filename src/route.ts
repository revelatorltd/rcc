import { useEffect, useState } from "react";

import { PLATFORM_PAGES, readPlatform, type PlatformRoute } from "./platform/route";

/**
 * Where the reader is, read off the address bar — a hash, as the replica reads it, so nothing
 * beside the system has to be explained when the result is read.
 */
export const ACCOUNTS_PAGES = ["customers", "tenants", "enterprises", "partners", "payees", "users", "white-labels"] as const;
export type AccountsPage = (typeof ACCOUNTS_PAGES)[number];

/** A customer's facets, in the order its nav lists them — the one it opens on first. */
export const CUSTOMER_FACETS = ["Overview", "Details", "Subscriptions", "Contacts", "Tenants"] as const;
export type CustomerFacet = (typeof CUSTOMER_FACETS)[number];

/**
 * A tenant's facets, in the order its nav lists them. Children is a parent's alone: a standalone
 * tenant's nav leaves it out.
 */
export const TENANT_FACETS = [
  "Overview",
  "Setup",
  "Details",
  "Users",
  "Payees",
  "Integrations",
  "White label",
  "Transactions by payor",
  "DSPs",
  "Analytics",
  "Tenant configuration",
  "Notes",
  "Children",
] as const;
export type TenantFacet = (typeof TENANT_FACETS)[number];

/** The facets of the records the other Accounts pages open, each in the order its nav lists them. */
export const ENTERPRISE_FACETS = ["Details", "Payees"] as const;
export const PARTNER_FACETS = ["Details", "Tenants", "Users"] as const;
export const PAYEE_FACETS = ["Details", "Users"] as const;
export const USER_FACETS = ["Details", "Enterprises"] as const;
export const WHITE_LABEL_FACETS = ["Details"] as const;
export type EnterpriseFacet = (typeof ENTERPRISE_FACETS)[number];
export type PartnerFacet = (typeof PARTNER_FACETS)[number];
export type PayeeFacet = (typeof PAYEE_FACETS)[number];
export type UserFacet = (typeof USER_FACETS)[number];
export type WhiteLabelFacet = (typeof WHITE_LABEL_FACETS)[number];

/**
 * The forms that cover the shell — a wizard each — by what they do. A customer's and a tenant's are
 * read off the record's address; signing up a tenant off the tenants', with the customer it is for.
 */
export const CUSTOMER_FORMS = ["edit", "add-subscription"] as const;
export const TENANT_FORMS = ["edit", "configure", "convert", "new-white-label", "edit-white-label", "new-partner", "import"] as const;
export type CustomerForm = (typeof CUSTOMER_FORMS)[number];
export type TenantForm = (typeof TENANT_FORMS)[number];

export type Route =
  | { name: "accounts"; page: AccountsPage }
  | { name: "customer"; id: string; facet: CustomerFacet }
  | { name: "tenant"; id: string; facet: TenantFacet }
  | { name: "enterprise"; id: string; facet: EnterpriseFacet }
  | { name: "partner"; id: string; facet: PartnerFacet }
  | { name: "payee"; id: string; facet: PayeeFacet }
  | { name: "user"; id: string; facet: UserFacet }
  | { name: "white-label"; id: string; facet: WhiteLabelFacet }
  | { name: "new-customer" }
  | { name: "sign-up-tenant"; customerId?: string }
  | { name: "customer-form"; id: string; form: CustomerForm }
  | { name: "tenant-form"; id: string; form: TenantForm }
  | { name: "new-partner" }
  | { name: "edit-user"; id: string }
  | { name: "new-white-label" }
  | { name: "edit-white-label"; id: string }
  | { name: "platform"; route: PlatformRoute };

export const accountsHref = (page: AccountsPage) => `#/accounts/${page}`;

const slug = (facet: string) => facet.toLowerCase().replace(/ /g, "-");

/** A record's address, on one of its facets — its first, unless one is said. */
const recordHref = (page: AccountsPage, first: string) => (id: string, facet: string = first) =>
  facet === first ? `#/accounts/${page}/${id}` : `#/accounts/${page}/${id}/${slug(facet)}`;

export const customerHref: (id: string, facet?: CustomerFacet) => string = recordHref("customers", "Overview");
export const tenantHref: (id: string, facet?: TenantFacet) => string = recordHref("tenants", "Overview");
export const enterpriseHref: (id: string, facet?: EnterpriseFacet) => string = recordHref("enterprises", "Details");
export const partnerHref: (id: string, facet?: PartnerFacet) => string = recordHref("partners", "Details");
export const payeeHref: (id: string, facet?: PayeeFacet) => string = recordHref("payees", "Details");
export const userHref: (id: string, facet?: UserFacet) => string = recordHref("users", "Details");
export const whiteLabelHref: (id: string, facet?: WhiteLabelFacet) => string = recordHref("white-labels", "Details");

export const newCustomerHref = () => "#/accounts/customers/new";
export const signUpTenantHref = (customerId?: string) =>
  customerId ? `#/accounts/tenants/new/${customerId}` : "#/accounts/tenants/new";
export const customerFormHref = (id: string, form: CustomerForm) => `#/accounts/customers/${id}/${form}`;
export const tenantFormHref = (id: string, form: TenantForm) => `#/accounts/tenants/${id}/${form}`;
export const newPartnerHref = () => "#/accounts/partners/new";
export const editUserHref = (id: string) => `#/accounts/users/${id}/edit`;
export const newWhiteLabelHref = () => "#/accounts/white-labels/new";
export const editWhiteLabelHref = (id: string) => `#/accounts/white-labels/${id}/edit`;

/** Leaves for an address — where a form goes once it is committed or left. */
export const go = (href: string) => {
  window.location.hash = href;
};

/** A facet named by its slug, or the record's first. */
const facetOf = <F extends string>(facets: readonly F[], written?: string): F =>
  facets.find((one) => slug(one) === written) ?? facets[0]!;

/** The address read as a route. Anything it does not name lands on the section's first page. */
function read(hash: string): Route {
  const [, section, written, id, facet] = hash.replace(/^#/, "").split("/");
  // THE ENTERPRISE'S ACCESS: each destination at the top of the address, and the one the app opens on.
  if (!section || PLATFORM_PAGES.some((one) => one === section))
    return { name: "platform", route: readPlatform([section || "organizations", written, id, facet]) };
  const page = ACCOUNTS_PAGES.find((one) => one === written);
  if (section !== "accounts" || !page) return { name: "accounts", page: "customers" };
  if (!id) return { name: "accounts", page };

  // The forms first: their addresses would otherwise read as a record's facet.
  if (page === "customers" && id === "new") return { name: "new-customer" };
  if (page === "tenants" && id === "new") return { name: "sign-up-tenant", customerId: facet };
  if (page === "partners" && id === "new") return { name: "new-partner" };
  if (page === "white-labels" && id === "new") return { name: "new-white-label" };
  if (page === "users" && facet === "edit") return { name: "edit-user", id };
  if (page === "white-labels" && facet === "edit") return { name: "edit-white-label", id };
  const customerForm = CUSTOMER_FORMS.find((one) => one === facet);
  if (page === "customers" && customerForm) return { name: "customer-form", id, form: customerForm };
  const tenantForm = TENANT_FORMS.find((one) => one === facet);
  if (page === "tenants" && tenantForm) return { name: "tenant-form", id, form: tenantForm };

  switch (page) {
    case "customers":
      return { name: "customer", id, facet: facetOf(CUSTOMER_FACETS, facet) };
    case "tenants":
      return { name: "tenant", id, facet: facetOf(TENANT_FACETS, facet) };
    case "enterprises":
      return { name: "enterprise", id, facet: facetOf(ENTERPRISE_FACETS, facet) };
    case "partners":
      return { name: "partner", id, facet: facetOf(PARTNER_FACETS, facet) };
    case "payees":
      return { name: "payee", id, facet: facetOf(PAYEE_FACETS, facet) };
    case "users":
      return { name: "user", id, facet: facetOf(USER_FACETS, facet) };
    case "white-labels":
      return { name: "white-label", id, facet: facetOf(WHITE_LABEL_FACETS, facet) };
  }
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
