import { useEffect, useState } from "react";

/**
 * Where the reader is, read off the address bar — a hash, as the replica reads it, so nothing
 * beside the system has to be explained when the result is read.
 */
export type AccountsPage = "customers" | "tenants";

/** A customer's facets, in the order its nav lists them — the one it opens on first. */
export const CUSTOMER_FACETS = ["Overview", "Details", "Subscriptions", "Contacts", "Tenants"] as const;
export type CustomerFacet = (typeof CUSTOMER_FACETS)[number];

/**
 * A tenant's facets, in the order its nav lists them. Children is a parent's alone: a standalone
 * tenant's nav leaves it out.
 */
export const TENANT_FACETS = ["Overview", "Setup", "Details", "Users", "Payees", "Stores", "White label", "Children"] as const;
export type TenantFacet = (typeof TENANT_FACETS)[number];

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
  | { name: "new-customer" }
  | { name: "sign-up-tenant"; customerId?: string }
  | { name: "customer-form"; id: string; form: CustomerForm }
  | { name: "tenant-form"; id: string; form: TenantForm };

export const accountsHref = (page: AccountsPage) => `#/accounts/${page}`;

const slug = (facet: string) => facet.toLowerCase().replace(/ /g, "-");

export const customerHref = (id: string, facet: CustomerFacet = "Overview") =>
  facet === "Overview" ? `#/accounts/customers/${id}` : `#/accounts/customers/${id}/${slug(facet)}`;

export const tenantHref = (id: string, facet: TenantFacet = "Overview") =>
  facet === "Overview" ? `#/accounts/tenants/${id}` : `#/accounts/tenants/${id}/${slug(facet)}`;

export const newCustomerHref = () => "#/accounts/customers/new";
export const signUpTenantHref = (customerId?: string) =>
  customerId ? `#/accounts/tenants/new/${customerId}` : "#/accounts/tenants/new";
export const customerFormHref = (id: string, form: CustomerForm) => `#/accounts/customers/${id}/${form}`;
export const tenantFormHref = (id: string, form: TenantForm) => `#/accounts/tenants/${id}/${form}`;

/** Leaves for an address — where a form goes once it is committed or left. */
export const go = (href: string) => {
  window.location.hash = href;
};

/** The address read as a route. Anything it does not name lands on the section's first page. */
function read(hash: string): Route {
  const [, section, page, id, facet] = hash.replace(/^#/, "").split("/");
  if (section === "accounts" && page === "customers" && id === "new") return { name: "new-customer" };
  if (section === "accounts" && page === "tenants" && id === "new") return { name: "sign-up-tenant", customerId: facet };
  const customerForm = CUSTOMER_FORMS.find((one) => one === facet);
  if (section === "accounts" && page === "customers" && id && customerForm)
    return { name: "customer-form", id, form: customerForm };
  const tenantForm = TENANT_FORMS.find((one) => one === facet);
  if (section === "accounts" && page === "tenants" && id && tenantForm) return { name: "tenant-form", id, form: tenantForm };
  if (section === "accounts" && page === "customers" && id)
    return {
      name: "customer",
      id,
      facet: CUSTOMER_FACETS.find((one) => slug(one) === facet) ?? "Overview",
    };
  if (section === "accounts" && page === "tenants" && id)
    return {
      name: "tenant",
      id,
      facet: TENANT_FACETS.find((one) => slug(one) === facet) ?? "Overview",
    };
  if (section === "accounts" && page === "tenants") return { name: "accounts", page: "tenants" };
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
