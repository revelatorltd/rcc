import { useSyncExternalStore } from "react";

/**
 * AN ENTERPRISE'S ACCESS — who can see and do what, on which tenants, and why.
 *
 * Shaped as Warner Music Group's: its organizations, tenant groups and access groups take the names
 * the Revelator Ops prototype gives them, by the product owner's choice. Its people and tenants are
 * invented. Each organization holds tenants; a tenant group lists tenants and gives nobody anything;
 * an access group is ONE set of permissions, on the tenants of its tenant groups, for a list of
 * people. Being in an organization gives no data on its own.
 */
export const TODAY = new Date(2026, 9, 16);

/** The enterprise every organization belongs to. */
export const ENTERPRISE = { name: "Warner Music Group", code: "WMG" };

/* ---------- The permission catalogue ---------- */

/** A guard — one area of the product a permission is set on, at one level. */
export const GUARDS = [
  { key: "catalog", label: "Catalog", covers: "Releases, tracks, metadata and assets" },
  { key: "rights", label: "Rights", covers: "Rights, clearances and conflicts" },
  { key: "distribution", label: "Distribution", covers: "Deliveries, takedowns and store status" },
  { key: "royalties", label: "Royalties", covers: "Contracts, splits, royalty runs, statements and payees" },
  { key: "finance", label: "Finance", covers: "Revenue, reports, balances, advances and expenses" },
  { key: "ts", label: "Trust & Safety", covers: "Holds, incidents and claims" },
  { key: "analytics", label: "Analytics", covers: "Streams and consumption; revenue needs Finance" },
  { key: "insights", label: "Insights", covers: "Trends and audience" },
  { key: "admin", label: "Admin", covers: "Users and settings on these tenants" },
] as const;
export type Guard = (typeof GUARDS)[number]["key"];

/** How far a permission reaches. */
export const LEVELS = ["No access", "Viewer", "Editor"] as const;
export type Level = 0 | 1 | 2;
export type Permissions = Partial<Record<Guard, Level>>;

export const guardLabel = (guard: Guard) => GUARDS.find((one) => one.key === guard)!.label;

/** The permission sets an access group starts from. */
export const TEMPLATES: readonly { key: string; label: string; perms: Permissions }[] = [
  { key: "royalties", label: "Royalties operator", perms: { royalties: 2, finance: 1, catalog: 1, rights: 1, analytics: 1, insights: 1 } },
  { key: "distribution", label: "Distribution operator", perms: { catalog: 2, distribution: 2, analytics: 1 } },
  { key: "catalog", label: "Catalog operator", perms: { catalog: 2, rights: 1, analytics: 1 } },
  { key: "finance", label: "Finance viewer", perms: { finance: 1, royalties: 1 } },
  { key: "analytics", label: "Analytics viewer", perms: { analytics: 1, insights: 1 } },
];

/** The template a set of permissions IS, where it matches one exactly. */
export const templateOf = (perms: Permissions) =>
  TEMPLATES.find((one) => GUARDS.every((guard) => (one.perms[guard.key] ?? 0) === (perms[guard.key] ?? 0)));

/** When a membership ends — never, or on one of the dates reviews close on. */
export const ENDS = [
  { value: "", label: "No end date" },
  { value: "2026-12-31", label: "Ends Dec 31, 2026" },
  { value: "2027-03-31", label: "Ends Mar 31, 2027" },
  { value: "2027-06-30", label: "Ends Jun 30, 2027" },
] as const;
export const endLabel = (value: string) => ENDS.find((one) => one.value === value)?.label ?? "No end date";

/* ---------- The records ---------- */

/** What members of an organization see first, unless they choose otherwise. */
export interface Defaults {
  home: string;
  landing: string;
  naming: string;
}

export interface Organization {
  id: string;
  name: string;
  code: string;
  description: string;
  admins: readonly string[];
  defaults: Defaults;
  /** What its members share inside it: saved reports, scheduled reports, access group templates. */
  shared: { savedReports: number; scheduledReports: number; templates: number };
}

export interface Tenant {
  id: string;
  name: string;
  /** The organization it belongs to — exactly one, or none yet. */
  orgId?: string;
  segment: string;
  country: string;
}

/** The scope a group belongs to: an organization, or the enterprise itself. */
export type Scope = string;
export const ENTERPRISE_SCOPE = "ent";

export interface TenantGroup {
  id: string;
  scope: Scope;
  name: string;
  description: string;
  region: string;
  tenants: readonly string[];
  changed: string;
  archived?: boolean;
}

export interface Member {
  personId: string;
  /** The day access ends by itself, or none. */
  ends: string;
}

export interface AccessGroup {
  id: string;
  scope: Scope;
  name: string;
  description: string;
  perms: Permissions;
  targets: readonly string[];
  members: readonly Member[];
  changed: string;
  archived?: boolean;
}

export interface Person {
  id: string;
  name: string;
  email: string;
  orgs: readonly string[];
  lastActive: string;
  enterpriseAdmin?: boolean;
  invited?: boolean;
}

/* ---------- The fixtures ---------- */

export let ORGANIZATIONS: readonly Organization[] = [
  {
    id: "ada",
    name: "ADA",
    code: "ADA",
    description: "Independent distribution, worldwide",
    admins: ["p-noa", "p-ilse"],
    defaults: { home: "ADA operations", landing: "Distribution", naming: "<Region> <Function>" },
    shared: { savedReports: 23, scheduledReports: 6, templates: 5 },
  },
  {
    id: "atl",
    name: "Atlantic",
    code: "AMG",
    description: "Frontline label group",
    admins: ["p-rafe"],
    defaults: { home: "Label overview", landing: "Catalog", naming: "<Label> <Function>" },
    shared: { savedReports: 9, scheduledReports: 2, templates: 3 },
  },
  {
    id: "wr",
    name: "Warner Records",
    code: "WR",
    description: "Frontline label group, Burbank",
    admins: ["p-june"],
    defaults: { home: "Label overview", landing: "Catalog", naming: "<Label> <Function>" },
    shared: { savedReports: 6, scheduledReports: 2, templates: 3 },
  },
  {
    id: "rhn",
    name: "Rhino",
    code: "RHN",
    description: "Catalog, reissues and remasters",
    admins: ["p-otto"],
    defaults: { home: "Label overview", landing: "Catalog", naming: "<Function>" },
    shared: { savedReports: 4, scheduledReports: 1, templates: 2 },
  },
  {
    id: "300",
    name: "300 Entertainment",
    code: "300",
    description: "Frontline label, New York",
    admins: ["p-bea"],
    defaults: { home: "Label overview", landing: "Catalog", naming: "<Function>" },
    shared: { savedReports: 2, scheduledReports: 0, templates: 1 },
  },
  {
    id: "10k",
    name: "10K Projects",
    code: "10K",
    description: "Frontline label",
    admins: [],
    defaults: { home: "Label overview", landing: "Catalog", naming: "<Function>" },
    shared: { savedReports: 0, scheduledReports: 0, templates: 0 },
  },
];

/** Where each segment's tenants are, cycled through as they are named. */
const SEGMENTS: readonly [org: string, segment: string, count: number, countries: readonly string[]][] = [
  ["ada", "Spain", 38, ["Spain"]],
  ["ada", "Portugal", 11, ["Portugal"]],
  ["ada", "United Kingdom", 52, ["United Kingdom"]],
  ["ada", "Germany", 29, ["Germany", "Austria", "Switzerland"]],
  ["ada", "France", 20, ["France"]],
  ["ada", "Italy", 14, ["Italy"]],
  ["ada", "United States", 30, ["United States of America", "Canada"]],
  ["ada", "Latin America", 18, ["Mexico", "Brazil", "Argentina", "Colombia"]],
  ["atl", "Frontline", 20, ["United States of America", "Canada"]],
  ["atl", "Catalog", 18, ["United States of America"]],
  ["atl", "Nashville", 10, ["United States of America"]],
  ["wr", "Warner Records", 16, ["United States of America"]],
  ["rhn", "Rhino", 10, ["United States of America", "United Kingdom"]],
  ["300", "300", 8, ["United States of America"]],
  ["10k", "10K", 3, ["United States of America"]],
];

const FIRST_WORDS = ["Lantern", "Hollow", "Tidal", "Marble", "Juniper", "Cobalt", "Wren", "Bramble", "Ash", "Velvet", "Quarry", "Linden", "Harbor", "Sable", "Ivory", "Foxtail", "Meridian", "Orchard", "Rook", "Saffron", "Thistle", "Umber", "Willow", "Alder", "Basalt", "Cinder", "Drift", "Fennel", "Garnet", "Heron", "Indigo", "Jasper", "Kestrel", "Larch", "Mosaic", "Nettle", "Opal", "Pewter", "Quill", "Russet"];
const LAST_WORDS = ["Records", "Sound", "Music", "Tapes", "Audio", "Recordings", "Editions", "House"];

/** A tenant's name — each pairing of the two lists once, so no two tenants share one. */
let tenantSerial = 0;
const tenantName = () => {
  const at = tenantSerial++;
  return `${FIRST_WORDS[(at * 7) % FIRST_WORDS.length]} ${LAST_WORDS[(Math.floor(at / FIRST_WORDS.length) + at) % LAST_WORDS.length]}`;
};

export let TENANTS: readonly Tenant[] = [
  ...SEGMENTS.flatMap(([orgId, segment, count, countries], segmentAt) =>
    Array.from({ length: count }, (_, at) => ({
      id: `T-${(10482 + segmentAt * 677 + at * 13).toString()}`,
      name: tenantName(),
      orgId,
      segment,
      country: countries[at % countries.length]!,
    })),
  ),
  { id: "T-20114", name: "Paper Moon Reissues", segment: "Unassigned", country: "United States of America" },
  { id: "T-20131", name: "Golden Hour Catalog", segment: "Unassigned", country: "United Kingdom" },
];

const ofSegment = (...segments: string[]) => TENANTS.filter((one) => segments.includes(one.segment)).map((one) => one.id);
const ofOrg = (orgId: string) => TENANTS.filter((one) => one.orgId === orgId).map((one) => one.id);

const tg = (id: string, scope: Scope, name: string, description: string, region: string, tenants: readonly string[], changed = "Sep 12 · Noa Lindqvist"): TenantGroup => ({
  id,
  scope,
  name,
  description,
  region,
  tenants,
  changed,
});

export let TENANT_GROUPS: readonly TenantGroup[] = [
  tg("tg-es", "ada", "ADA-Spain Labels", "ADA affiliate labels operated from Madrid", "Spain", ofSegment("Spain"), "2 days ago · Ilse Varga"),
  tg("tg-pt", "ada", "ADA-Portugal Labels", "ADA affiliate labels operated from Lisbon", "Portugal", ofSegment("Portugal")),
  tg("tg-uk", "ada", "ADA-UK Labels", "ADA affiliate labels operated from London", "UK", ofSegment("United Kingdom")),
  tg("tg-de", "ada", "ADA-Germany Labels", "Germany, Austria and Switzerland", "Germany", ofSegment("Germany")),
  tg("tg-fr", "ada", "ADA-France Labels", "ADA affiliate labels operated from Paris", "France", ofSegment("France")),
  tg("tg-it", "ada", "ADA-Italy Labels", "ADA affiliate labels operated from Milan", "Italy", ofSegment("Italy")),
  tg("tg-iberia", "ada", "Iberia", "Spain and Portugal together, for the Iberian finance team", "Iberia", ofSegment("Spain", "Portugal")),
  tg("tg-emea", "ada", "EMEA", "Every European label ADA operates", "EMEA", ofSegment("Spain", "Portugal", "United Kingdom", "Germany", "France", "Italy")),
  tg("tg-all", "ada", "All ADA", "Every ADA tenant", "Worldwide", ofOrg("ada")),
  tg("tg-atl-front", "atl", "Atlantic Frontline", "Frontline artists and new releases", "US", ofSegment("Frontline")),
  tg("tg-atl-cat", "atl", "Atlantic Catalog", "Atlantic's catalog labels", "US", ofSegment("Catalog")),
  tg("tg-atl-nash", "atl", "Atlantic Nashville", "Country and Americana labels", "US", ofSegment("Nashville")),
  tg("tg-atl-all", "atl", "All Atlantic", "Every Atlantic tenant", "Worldwide", ofOrg("atl")),
  tg("tg-wr-all", "wr", "All Warner Records", "Every Warner Records tenant", "US", ofOrg("wr")),
  tg("tg-rh-all", "rhn", "All Rhino", "Every Rhino tenant", "Worldwide", ofOrg("rhn")),
  tg("tg-300-all", "300", "All 300", "Every 300 Entertainment tenant", "US", ofOrg("300")),
  tg("tg-10k", "10k", "10K Projects", "Every 10K Projects tenant", "US", ofOrg("10k")),
  tg("tg-warner", ENTERPRISE_SCOPE, "All Warner labels", "Every tenant of every organization", "Worldwide", TENANTS.filter((one) => one.orgId).map((one) => one.id)),
];

/* People: the named few, then the teams around them. Invented, every one. */

const NAMED: readonly Person[] = [
  { id: "p-noa", name: "Noa Lindqvist", email: "noa.lindqvist@wmg.example", orgs: ["ada"], lastActive: "Today", enterpriseAdmin: true },
  { id: "p-ilse", name: "Ilse Varga", email: "ilse.varga@wmg.example", orgs: ["ada"], lastActive: "Yesterday" },
  { id: "p-rafe", name: "Rafe Okonkwo", email: "rafe.okonkwo@wmg.example", orgs: ["atl"], lastActive: "Today" },
  { id: "p-june", name: "June Marchetti", email: "june.marchetti@wmg.example", orgs: ["wr"], lastActive: "This week" },
  { id: "p-otto", name: "Otto Lindgren", email: "otto.lindgren@wmg.example", orgs: ["rhn"], lastActive: "Last week" },
  { id: "p-bea", name: "Bea Holloway", email: "bea.holloway@wmg.example", orgs: ["300"], lastActive: "2 days ago" },
  { id: "p-sol", name: "Sol Herrera", email: "sol.herrera@wmg.example", orgs: ["ada"], lastActive: "Today" },
  { id: "p-ines", name: "Inés Calvo", email: "ines.calvo@wmg.example", orgs: ["ada"], lastActive: "2 days ago" },
  { id: "p-tomas", name: "Tomás Ferreira", email: "tomas.ferreira@wmg.example", orgs: ["ada"], lastActive: "This week" },
  { id: "p-alba", name: "Alba Montes", email: "alba.montes@wmg.example", orgs: ["ada"], lastActive: "Yesterday" },
  { id: "p-pia", name: "Pia Strand", email: "pia.strand@ledgerline-audit.example", orgs: ["ada"], lastActive: "3 weeks ago" },
  { id: "p-hugh", name: "Hugh Penrose", email: "hugh.penrose@wmg.example", orgs: ["ada"], lastActive: "Today" },
];

const GIVEN = ["Aria", "Bastian", "Cleo", "Dario", "Esme", "Felix", "Greta", "Hamid", "Iris", "Jonah", "Kaia", "Lior", "Mira", "Nils", "Orla", "Pavel", "Quinn", "Rosa", "Silas", "Tova", "Uma", "Viggo", "Wynn", "Ximena", "Yusuf", "Zora"];
const FAMILY = ["Abara", "Bergman", "Castell", "Duarte", "Ekdahl", "Fontaine", "Galloway", "Hartigan", "Ivers", "Jaramillo", "Kovac", "Lowell", "Moreau", "Nakamura", "Osei", "Pellegrini", "Quist", "Rourke", "Sandoval", "Thorne"];

/** The teams around the named few: so many in each organization, a dozen in two. */
const TEAMS: readonly [orgs: readonly string[], count: number][] = [
  [["ada"], 60],
  [["ada", "atl"], 12],
  [["atl"], 18],
  [["wr"], 10],
  [["rhn"], 6],
  [["300"], 4],
  [["10k"], 4],
];

const LAST_ACTIVE = ["Today", "Yesterday", "2 days ago", "This week", "Last week", "3 weeks ago", "Last month"];

export let PEOPLE: readonly Person[] = [
  ...NAMED,
  ...TEAMS.flatMap(([orgs, count], teamAt) =>
    Array.from({ length: count }, (_, at) => {
      const serial = teamAt * 70 + at;
      const name = `${GIVEN[(serial * 5) % GIVEN.length]} ${FAMILY[(serial * 3 + teamAt) % FAMILY.length]}`;
      return {
        id: `p-${serial}`,
        name,
        email: `${name.toLowerCase().normalize("NFD").replace(/[^a-z ]+/g, "").replace(/ /g, ".")}.${serial}@wmg.example`,
        orgs,
        lastActive: LAST_ACTIVE[serial % LAST_ACTIVE.length]!,
      };
    }),
  ),
];

/** The people of a scope: those in an organization, or anyone for the enterprise. */
export const peopleIn = (scope: Scope) =>
  PEOPLE.filter((one) => scope === ENTERPRISE_SCOPE || one.orgs.includes(scope));

/** Members for a seeded group: the named first, then the scope's people in order, `count` in all. */
const seat = (scope: Scope, count: number, named: readonly string[] = [], ends: Record<string, string> = {}): Member[] => {
  const pool = [...named, ...peopleIn(scope).map((one) => one.id).filter((id) => !named.includes(id) && id !== "p-noa")];
  return pool.slice(0, count).map((personId) => ({ personId, ends: ends[personId] ?? "" }));
};

const ag = (id: string, scope: Scope, name: string, description: string, perms: Permissions, targets: readonly string[], members: Member[]): AccessGroup => ({
  id,
  scope,
  name,
  description,
  perms,
  targets,
  members,
  changed: "Sep 12 · Noa Lindqvist",
});

export let ACCESS_GROUPS: readonly AccessGroup[] = [
  ag("ag-es-roy", "ada", "ADA-Spain Royalties Operator", "Closes the royalty period for ADA Spain labels", { royalties: 2, finance: 1, catalog: 1, analytics: 1 }, ["tg-es"], seat("ada", 6, ["p-sol", "p-alba", "p-pia"], { "p-pia": "2026-12-31" })),
  ag("ag-es-dist", "ada", "ADA-Spain Distro Operator", "Delivers and takes down ADA Spain releases", { catalog: 2, distribution: 2, analytics: 1 }, ["tg-es"], seat("ada", 9, ["p-ines", "p-tomas"])),
  ag("ag-uk-roy", "ada", "ADA-UK Royalties Operator", "Closes the royalty period for ADA UK labels", { royalties: 2, finance: 1, catalog: 1 }, ["tg-uk"], seat("ada", 8)),
  ag("ag-uk-dist", "ada", "ADA-UK Distro Operator", "Delivers and takes down ADA UK releases", { catalog: 2, distribution: 2, analytics: 1 }, ["tg-uk"], seat("ada", 12, ["p-sol", "p-hugh"])),
  ag("ag-uk-cat", "ada", "ADA-UK Catalog Operator", "Keeps the ADA UK catalog's metadata right", { catalog: 2, rights: 1 }, ["tg-uk"], seat("ada", 4)),
  ag("ag-de-ops", "ada", "ADA-Germany Operations", "Runs the ADA Germany labels end to end", { catalog: 2, distribution: 2, royalties: 2, finance: 1 }, ["tg-de"], seat("ada", 9)),
  ag("ag-iberia-fin", "ada", "Iberia Finance Viewer", "Reads revenue for Spain and Portugal", { finance: 1, royalties: 1 }, ["tg-iberia"], seat("ada", 3, ["p-alba"])),
  ag("ag-emea-ana", "ada", "EMEA Analytics Viewer", "Reads streams across EMEA", { analytics: 1, insights: 1 }, ["tg-emea"], seat("ada", 6)),
  ag("ag-pt-dist", "ada", "ADA-Portugal Distro Operator", "Delivers ADA Portugal releases", { catalog: 2, distribution: 2 }, ["tg-pt"], seat("ada", 4)),
  ag("ag-ada-lead", "ada", "ADA Leadership", "Reads what matters across ADA", { catalog: 1, finance: 1, analytics: 1, insights: 1 }, ["tg-all"], seat("ada", 4)),
  ag("ag-atl-dist", "atl", "Frontline Distro Operator", "Delivers Atlantic frontline releases", { catalog: 2, distribution: 2, analytics: 1 }, ["tg-atl-front"], seat("atl", 6, ["p-rafe"])),
  ag("ag-atl-roy", "atl", "Frontline Royalties Operator", "Closes the Atlantic frontline royalty period", { royalties: 2, finance: 1 }, ["tg-atl-front"], seat("atl", 5)),
  ag("ag-atl-cat", "atl", "Catalog Operator", "Keeps Atlantic's catalog and its rights right", { catalog: 2, rights: 2 }, ["tg-atl-cat"], seat("atl", 5)),
  ag("ag-atl-nash", "atl", "Nashville Operations", "Runs the Atlantic Nashville labels", { catalog: 2, distribution: 2, royalties: 1 }, ["tg-atl-nash"], seat("atl", 4)),
  ag("ag-atl-fin", "atl", "Atlantic Finance Viewer", "Reads Atlantic's revenue", { finance: 1 }, ["tg-atl-all"], seat("atl", 3)),
  ag("ag-atl-ana", "atl", "Atlantic Analytics Viewer", "Reads streams across Atlantic", { analytics: 1, insights: 1 }, ["tg-atl-all"], seat("atl", 6)),
  ag("ag-wr-dist", "wr", "Warner Records Distro Operator", "Delivers Warner Records releases", { catalog: 2, distribution: 2, analytics: 1 }, ["tg-wr-all"], seat("wr", 6, ["p-june"])),
  ag("ag-rh-cat", "rhn", "Rhino Catalog Operator", "Keeps the Rhino reissue catalog right", { catalog: 2, rights: 2, royalties: 1 }, ["tg-rh-all"], seat("rhn", 4, ["p-otto"])),
  ag("ag-global-roy", ENTERPRISE_SCOPE, "Global Royalties", "Closes the royalty period across every Warner label", { royalties: 2, finance: 1, analytics: 1 }, ["tg-warner"], seat(ENTERPRISE_SCOPE, 5, ["p-hugh"])),
  ag("ag-group-fin", ENTERPRISE_SCOPE, "Group Finance Viewer", "Reads revenue across every Warner label", { finance: 1 }, ["tg-warner"], seat(ENTERPRISE_SCOPE, 7, ["p-ilse"])),
  ag("ag-auditor", ENTERPRISE_SCOPE, "Group Auditor", "Reads everything but administration, for the year-end audit", { catalog: 1, rights: 1, distribution: 1, royalties: 1, finance: 1, ts: 1, analytics: 1, insights: 1 }, ["tg-warner"], seat(ENTERPRISE_SCOPE, 2, ["p-pia"], { "p-pia": "2026-12-31" })),
];

/* ---------- What is read off them ---------- */

export const orgById = (id: string) => ORGANIZATIONS.find((one) => one.id === id);
export const tenantById = (id: string) => TENANTS.find((one) => one.id === id);
export const personById = (id: string) => PEOPLE.find((one) => one.id === id);
export const tenantGroupById = (id: string) => TENANT_GROUPS.find((one) => one.id === id && !one.archived);
export const accessGroupById = (id: string) => ACCESS_GROUPS.find((one) => one.id === id && !one.archived);

/** A scope's name: its organization's, or the enterprise level. */
export const scopeName = (scope: Scope) => (scope === ENTERPRISE_SCOPE ? "Enterprise-level" : (orgById(scope)?.name ?? scope));

/** The live tenant groups and access groups, of a scope where one is given. */
export const tenantGroups = (scope?: Scope) => TENANT_GROUPS.filter((one) => !one.archived && (!scope || one.scope === scope));
export const accessGroups = (scope?: Scope) => ACCESS_GROUPS.filter((one) => !one.archived && (!scope || one.scope === scope));

export const tenantsOfOrg = (orgId: string) => TENANTS.filter((one) => one.orgId === orgId);

/** The tenants a set of tenant groups lists, once each. */
export const tenantsOfTargets = (targets: readonly string[]) => [
  ...new Set(targets.flatMap((id) => tenantGroupById(id)?.tenants ?? [])),
];

/** The access groups that give permissions on a tenant group. */
export const accessGroupsUsing = (tgId: string) => accessGroups().filter((one) => one.targets.includes(tgId));

/** Everyone who reaches a tenant group's tenants through an access group. */
export const peopleWithAccess = (tgId: string) => [
  ...new Set(accessGroupsUsing(tgId).flatMap((one) => one.members.map((member) => member.personId))),
];

/** The access groups a person belongs to. */
export const accessGroupsOf = (personId: string) =>
  accessGroups().filter((one) => one.members.some((member) => member.personId === personId));

/** The tenant groups a tenant sits in. */
export const tenantGroupsOf = (tenantId: string) => tenantGroups().filter((one) => one.tenants.includes(tenantId));

/** The permissions a group gives, highest first. */
export const grantedOf = (perms: Permissions) =>
  GUARDS.filter((guard) => (perms[guard.key] ?? 0) > 0)
    .map((guard) => ({ guard: guard.key, label: guard.label, level: perms[guard.key]! }))
    .sort((a, b) => b.level - a.level);

/** A group's permissions said short — Catalog editor, Analytics viewer. */
export const permissionsSaid = (perms: Permissions) =>
  grantedOf(perms)
    .map((one) => `${one.label} ${LEVELS[one.level].toLowerCase()}`)
    .join(", ");

/** One tenant as a person reaches it: per guard, the highest level, and the groups that gave it. */
export interface Reach {
  tenant: Tenant;
  /** The tenant group it was reached through first — what the rows are gathered by. */
  through: TenantGroup;
  levels: Partial<Record<Guard, { level: Level; from: string[] }>>;
}

/**
 * What a person can do, tenant by tenant. Permissions stay on the tenants of the group that gave
 * them: a Finance viewer on Iberia is no Finance viewer on the UK, whatever else they hold there.
 */
export function effectiveAccess(personId: string): readonly Reach[] {
  const reach = new Map<string, Reach>();
  for (const group of accessGroupsOf(personId))
    for (const tgId of group.targets) {
      const target = tenantGroupById(tgId);
      if (!target) continue;
      for (const tenantId of target.tenants) {
        const tenant = tenantById(tenantId);
        if (!tenant) continue;
        const known = reach.get(tenantId) ?? { tenant, through: target, levels: {} };
        for (const granted of grantedOf(group.perms)) {
          const held = known.levels[granted.guard];
          if (!held || granted.level > held.level) known.levels[granted.guard] = { level: granted.level, from: [group.name] };
          else if (granted.level === held.level && !held.from.includes(group.name)) held.from.push(group.name);
        }
        reach.set(tenantId, known);
      }
    }
  return [...reach.values()];
}

/** A person's last activity, ordered — Today first. */
export const lastActiveRank = (value: string) => (value === "Invited" ? 99 : LAST_ACTIVE.indexOf(value));

/* ---------- What the forms write ---------- */

let version = 0;
const listeners = new Set<() => void>();
const changed = () => {
  version += 1;
  listeners.forEach((listener) => listener());
};

/** Draws the caller again whenever a form has written to the platform's fixtures. */
export const usePlatform = () =>
  useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    () => version,
  );

/** The acting admin, as a change is stamped. */
const stamp = () => "Just now · Noa Lindqvist";

const serial = () => Date.now().toString(36);

export function addOrganization(org: Omit<Organization, "id">, tenantIds: readonly string[], allGroup: boolean): string {
  const id = `org-${serial()}`;
  ORGANIZATIONS = [...ORGANIZATIONS, { ...org, id }];
  moveTenants(tenantIds, id, false);
  if (allGroup)
    TENANT_GROUPS = [...TENANT_GROUPS, tg(`tg-${serial()}`, id, `All ${org.name}`, `Every ${org.name} tenant`, "Worldwide", tenantIds, stamp())];
  changed();
  return id;
}

export function updateOrganization(id: string, patch: Partial<Organization>) {
  ORGANIZATIONS = ORGANIZATIONS.map((one) => (one.id === id ? { ...one, ...patch } : one));
  changed();
}

/**
 * Tenants moved to an organization: they leave every tenant group of the organization they leave,
 * so nobody there keeps access through them. What they hold — catalog, royalties, history — stays.
 */
export function moveTenants(tenantIds: readonly string[], orgId: string, tell = true) {
  TENANTS = TENANTS.map((one) => (tenantIds.includes(one.id) ? { ...one, orgId } : one));
  TENANT_GROUPS = TENANT_GROUPS.map((one) =>
    one.scope === ENTERPRISE_SCOPE ? one : { ...one, tenants: one.tenants.filter((id) => !tenantIds.includes(id)) },
  );
  if (tell) changed();
}

export function saveTenantGroup(group: Omit<TenantGroup, "id" | "changed"> & { id?: string }): string {
  const id = group.id ?? `tg-${serial()}`;
  const saved = { ...group, id, changed: stamp() };
  TENANT_GROUPS = TENANT_GROUPS.some((one) => one.id === id)
    ? TENANT_GROUPS.map((one) => (one.id === id ? { ...one, ...saved } : one))
    : [...TENANT_GROUPS, saved];
  changed();
  return id;
}

export function addTenantsToGroup(tgId: string, tenantIds: readonly string[]) {
  TENANT_GROUPS = TENANT_GROUPS.map((one) =>
    one.id === tgId ? { ...one, tenants: [...new Set([...one.tenants, ...tenantIds])], changed: stamp() } : one,
  );
  changed();
}

export function removeTenantsFromGroup(tgId: string, tenantIds: readonly string[]) {
  TENANT_GROUPS = TENANT_GROUPS.map((one) =>
    one.id === tgId ? { ...one, tenants: one.tenants.filter((id) => !tenantIds.includes(id)), changed: stamp() } : one,
  );
  changed();
}

export function archiveTenantGroups(ids: readonly string[]) {
  TENANT_GROUPS = TENANT_GROUPS.map((one) => (ids.includes(one.id) ? { ...one, archived: true } : one));
  changed();
}

export function saveAccessGroup(group: Omit<AccessGroup, "id" | "changed"> & { id?: string }): string {
  const id = group.id ?? `ag-${serial()}`;
  const saved = { ...group, id, changed: stamp() };
  ACCESS_GROUPS = ACCESS_GROUPS.some((one) => one.id === id)
    ? ACCESS_GROUPS.map((one) => (one.id === id ? { ...one, ...saved } : one))
    : [...ACCESS_GROUPS, saved];
  changed();
  return id;
}

export function archiveAccessGroups(ids: readonly string[]) {
  ACCESS_GROUPS = ACCESS_GROUPS.map((one) => (ids.includes(one.id) ? { ...one, archived: true } : one));
  changed();
}

/** People added to an access group, their access ending when it says — those already in skipped. */
export function addMembers(agId: string, personIds: readonly string[], ends: string) {
  ACCESS_GROUPS = ACCESS_GROUPS.map((one) => {
    if (one.id !== agId) return one;
    const known = new Set(one.members.map((member) => member.personId));
    const added = personIds.filter((id) => !known.has(id)).map((personId) => ({ personId, ends }));
    return { ...one, members: [...one.members, ...added], changed: stamp() };
  });
  changed();
}

export function removeMember(agId: string, personId: string) {
  ACCESS_GROUPS = ACCESS_GROUPS.map((one) =>
    one.id === agId ? { ...one, members: one.members.filter((member) => member.personId !== personId), changed: stamp() } : one,
  );
  changed();
}

/** People taken out of every access group they are in — their access ends. */
export function removeFromAllGroups(personIds: readonly string[]) {
  ACCESS_GROUPS = ACCESS_GROUPS.map((one) =>
    one.members.some((member) => personIds.includes(member.personId))
      ? { ...one, members: one.members.filter((member) => !personIds.includes(member.personId)), changed: stamp() }
      : one,
  );
  changed();
}

/** Access groups that now apply to a tenant group too. */
export function addTargets(agIds: readonly string[], tgId: string) {
  ACCESS_GROUPS = ACCESS_GROUPS.map((one) =>
    agIds.includes(one.id) && !one.targets.includes(tgId) ? { ...one, targets: [...one.targets, tgId], changed: stamp() } : one,
  );
  changed();
}

/**
 * People added to an organization — those found by their address, and the rest invited. Joining an
 * organization gives nobody data until an access group does.
 */
export function addPeopleToOrg(orgId: string, personIds: readonly string[], inviteEmails: readonly string[]): readonly string[] {
  PEOPLE = PEOPLE.map((one) => (personIds.includes(one.id) && !one.orgs.includes(orgId) ? { ...one, orgs: [...one.orgs, orgId] } : one));
  const invited: Person[] = [];
  for (const email of inviteEmails) {
    const known = PEOPLE.find((one) => one.email.toLowerCase() === email.toLowerCase());
    if (known) {
      if (!known.orgs.includes(orgId)) PEOPLE = PEOPLE.map((one) => (one.id === known.id ? { ...one, orgs: [...one.orgs, orgId] } : one));
      continue;
    }
    invited.push({ id: `p-inv-${serial()}-${invited.length}`, name: email, email, orgs: [orgId], lastActive: "Invited", invited: true });
  }
  PEOPLE = [...PEOPLE, ...invited];
  changed();
  return invited.map((one) => one.id);
}

/** Parses addresses out of anything pasted — a list, a CSV column — once each. */
export const emailsIn = (text: string) => [...new Set(text.match(/[^\s,;<>"']+@[^\s,;<>"']+\.[a-z]{2,}/gi) ?? [])];
