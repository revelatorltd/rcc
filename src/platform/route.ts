/**
 * Where the reader is in the four destinations that run an enterprise's access — Organizations,
 * Tenant groups, Access groups, People — read off the address bar: each at the top, `#/organizations`,
 * beside Accounts' `#/accounts/…`.
 */
export const PLATFORM_PAGES = ["organizations", "tenant-groups", "access-groups", "people"] as const;
export type PlatformPage = (typeof PLATFORM_PAGES)[number];

export const ORGANIZATION_FACETS = ["Overview", "Tenant groups", "Access groups", "People", "Tenants", "Admins", "Settings"] as const;
export const TENANT_GROUP_FACETS = ["Tenants", "Access groups", "People with access"] as const;
export const ACCESS_GROUP_FACETS = ["Permissions", "Tenant groups", "Members"] as const;
export const PERSON_FACETS = ["Access groups", "Effective access"] as const;
export type OrganizationFacet = (typeof ORGANIZATION_FACETS)[number];
export type TenantGroupFacet = (typeof TENANT_GROUP_FACETS)[number];
export type AccessGroupFacet = (typeof ACCESS_GROUP_FACETS)[number];
export type PersonFacet = (typeof PERSON_FACETS)[number];

export type PlatformRoute =
  | { name: "index"; page: PlatformPage }
  | { name: "organization"; id: string; facet: OrganizationFacet }
  | { name: "tenant-group"; id: string; facet: TenantGroupFacet }
  | { name: "access-group"; id: string; facet: AccessGroupFacet }
  | { name: "person"; id: string; facet: PersonFacet }
  | { name: "new-organization" }
  | { name: "new-tenant-group"; scope: string }
  | { name: "edit-tenant-group"; id: string }
  | { name: "new-access-group"; scope: string; target?: string }
  | { name: "edit-access-group"; id: string }
  | { name: "duplicate-access-group"; id: string };

const slug = (facet: string) => facet.toLowerCase().replace(/ /g, "-");

export const platformHref = (page: PlatformPage) => `#/${page}`;

const recordHref = (page: PlatformPage, first: string) => (id: string, facet: string = first) =>
  facet === first ? `#/${page}/${id}` : `#/${page}/${id}/${slug(facet)}`;

export const organizationHref: (id: string, facet?: OrganizationFacet) => string = recordHref("organizations", "Overview");
export const tenantGroupHref: (id: string, facet?: TenantGroupFacet) => string = recordHref("tenant-groups", "Tenants");
export const accessGroupHref: (id: string, facet?: AccessGroupFacet) => string = recordHref("access-groups", "Permissions");
export const personHref: (id: string, facet?: PersonFacet) => string = recordHref("people", "Access groups");

export const newOrganizationHref = () => "#/organizations/new";
export const newTenantGroupHref = (scope: string) => `#/tenant-groups/new/${scope}`;
export const editTenantGroupHref = (id: string) => `#/tenant-groups/${id}/edit`;
export const newAccessGroupHref = (scope: string, target?: string) =>
  target ? `#/access-groups/new/${scope}/${target}` : `#/access-groups/new/${scope}`;
export const editAccessGroupHref = (id: string) => `#/access-groups/${id}/edit`;
export const duplicateAccessGroupHref = (id: string) => `#/access-groups/${id}/duplicate`;

const facetOf = <F extends string>(facets: readonly F[], written?: string): F =>
  facets.find((one) => slug(one) === written) ?? facets[0]!;

/** The part of the address after `#/`, read as a route. */
export function readPlatform(parts: readonly (string | undefined)[]): PlatformRoute {
  const [written, id, facet, extra] = parts;
  const page = PLATFORM_PAGES.find((one) => one === written) ?? "organizations";
  if (!id) return { name: "index", page };
  if (page === "organizations" && id === "new") return { name: "new-organization" };
  if (page === "tenant-groups" && id === "new") return { name: "new-tenant-group", scope: facet ?? "ada" };
  if (page === "access-groups" && id === "new") return { name: "new-access-group", scope: facet ?? "ada", target: extra };
  if (page === "tenant-groups" && facet === "edit") return { name: "edit-tenant-group", id };
  if (page === "access-groups" && facet === "edit") return { name: "edit-access-group", id };
  if (page === "access-groups" && facet === "duplicate") return { name: "duplicate-access-group", id };
  switch (page) {
    case "organizations":
      return { name: "organization", id, facet: facetOf(ORGANIZATION_FACETS, facet) };
    case "tenant-groups":
      return { name: "tenant-group", id, facet: facetOf(TENANT_GROUP_FACETS, facet) };
    case "access-groups":
      return { name: "access-group", id, facet: facetOf(ACCESS_GROUP_FACETS, facet) };
    case "people":
      return { name: "person", id, facet: facetOf(PERSON_FACETS, facet) };
  }
}

/** Leaves for an address — where a form goes once it is committed or left. */
export const go = (href: string) => {
  window.location.hash = href;
};
