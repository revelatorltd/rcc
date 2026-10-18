import { useSyncExternalStore } from "react";

/**
 * PLATFORM ADMIN — who can see and do what, on which tenants, and why — for one enterprise.
 *
 * Invented, hand-written: an enterprise of its own, never the prototype's. Its organizations each
 * hold tenants; a tenant group lists tenants and gives nobody anything; an access group is ONE set of
 * permissions, on the tenants of its tenant groups, for a list of people. Being in an organization
 * gives no data on its own.
 */
export const TODAY = new Date(2026, 9, 16);

/** The enterprise every organization belongs to. */
export const ENTERPRISE = { name: "Halden Music Group", code: "HMG" };

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
    id: "nwd",
    name: "Northwind Distribution",
    code: "NWD",
    description: "Independent distribution, worldwide",
    admins: ["p-noa", "p-ilse"],
    defaults: { home: "Distribution overview", landing: "Distribution", naming: "<Region> <Function>" },
    shared: { savedReports: 18, scheduledReports: 5, templates: 5 },
  },
  {
    id: "emb",
    name: "Ember Records",
    code: "EMB",
    description: "Frontline label group",
    admins: ["p-rafe"],
    defaults: { home: "Label overview", landing: "Catalog", naming: "<Label> <Function>" },
    shared: { savedReports: 7, scheduledReports: 2, templates: 3 },
  },
  {
    id: "cpl",
    name: "Copperline",
    code: "CPL",
    description: "Frontline label, Austin",
    admins: ["p-june"],
    defaults: { home: "Label overview", landing: "Catalog", naming: "<Label> <Function>" },
    shared: { savedReports: 4, scheduledReports: 1, templates: 2 },
  },
  {
    id: "swc",
    name: "Saltwater Catalog",
    code: "SWC",
    description: "Catalog, reissues and remasters",
    admins: ["p-otto"],
    defaults: { home: "Label overview", landing: "Catalog", naming: "<Function>" },
    shared: { savedReports: 3, scheduledReports: 1, templates: 1 },
  },
  {
    id: "knk",
    name: "Kite & Key",
    code: "K&K",
    description: "New label, signed this quarter",
    admins: [],
    defaults: { home: "Label overview", landing: "Catalog", naming: "<Function>" },
    shared: { savedReports: 0, scheduledReports: 0, templates: 0 },
  },
];

/** Where each segment's tenants are, cycled through as they are named. */
const SEGMENTS: readonly [org: string, segment: string, count: number, countries: readonly string[]][] = [
  ["nwd", "Spain", 18, ["Spain"]],
  ["nwd", "Portugal", 6, ["Portugal"]],
  ["nwd", "United Kingdom", 20, ["United Kingdom"]],
  ["nwd", "Germany", 12, ["Germany", "Austria", "Switzerland"]],
  ["nwd", "France", 9, ["France"]],
  ["nwd", "Italy", 7, ["Italy"]],
  ["nwd", "North America", 14, ["United States of America", "Canada"]],
  ["nwd", "Latin America", 10, ["Mexico", "Brazil", "Argentina", "Colombia"]],
  ["emb", "Frontline", 10, ["United States of America", "Canada"]],
  ["emb", "Catalog", 8, ["United States of America"]],
  ["emb", "Nashville", 5, ["United States of America"]],
  ["cpl", "Copperline", 9, ["United States of America"]],
  ["swc", "Saltwater", 6, ["United States of America", "United Kingdom"]],
  ["knk", "Kite & Key", 4, ["United States of America"]],
];

const FIRST_WORDS = ["Lantern", "Hollow", "Tidal", "Marble", "Juniper", "Cobalt", "Wren", "Bramble", "Ash", "Velvet", "Quarry", "Linden", "Harbor", "Sable", "Ivory", "Foxtail", "Meridian", "Orchard", "Rook", "Saffron", "Thistle", "Umber", "Willow", "Alder", "Basalt", "Cinder", "Drift", "Fennel"];
const LAST_WORDS = ["Records", "Sound", "Music", "Tapes", "Audio", "Recordings", "Editions", "House"];

let tenantSerial = 0;
const tenantName = () => {
  const at = tenantSerial++;
  return `${FIRST_WORDS[(at * 7) % FIRST_WORDS.length]} ${LAST_WORDS[(at * 3 + Math.floor(at / FIRST_WORDS.length)) % LAST_WORDS.length]}`;
};

export let TENANTS: readonly Tenant[] = [
  ...SEGMENTS.flatMap(([orgId, segment, count, countries], segmentAt) =>
    Array.from({ length: count }, (_, at) => ({
      id: `T-${(30412 + segmentAt * 211 + at * 13).toString()}`,
      name: tenantName(),
      orgId,
      segment,
      country: countries[at % countries.length]!,
    })),
  ),
  { id: "T-41120", name: "Paper Moon Reissues", segment: "Unassigned", country: "United States of America" },
  { id: "T-41137", name: "Golden Hour Catalog", segment: "Unassigned", country: "United Kingdom" },
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
  tg("tg-es", "nwd", "Northwind Spain Labels", "Labels Northwind operates from Madrid", "Spain", ofSegment("Spain"), "2 days ago · Ilse Varga"),
  tg("tg-pt", "nwd", "Northwind Portugal Labels", "Labels operated from Lisbon", "Portugal", ofSegment("Portugal")),
  tg("tg-uk", "nwd", "Northwind UK Labels", "Labels operated from London", "United Kingdom", ofSegment("United Kingdom")),
  tg("tg-de", "nwd", "Northwind DACH Labels", "Germany, Austria and Switzerland", "DACH", ofSegment("Germany")),
  tg("tg-fr", "nwd", "Northwind France Labels", "Labels operated from Paris", "France", ofSegment("France")),
  tg("tg-it", "nwd", "Northwind Italy Labels", "Labels operated from Milan", "Italy", ofSegment("Italy")),
  tg("tg-iberia", "nwd", "Iberia", "Spain and Portugal, for the Iberian finance team", "Iberia", ofSegment("Spain", "Portugal")),
  tg("tg-europe", "nwd", "Europe", "Every European label Northwind operates", "Europe", ofSegment("Spain", "Portugal", "United Kingdom", "Germany", "France", "Italy")),
  tg("tg-latam", "nwd", "Northwind Latin America", "Labels across Mexico, Brazil, Argentina and Colombia", "Latin America", ofSegment("Latin America")),
  tg("tg-nwd-all", "nwd", "All Northwind", "Every Northwind tenant", "Worldwide", ofOrg("nwd")),
  tg("tg-emb-front", "emb", "Ember Frontline", "Frontline artists and new releases", "North America", ofSegment("Frontline")),
  tg("tg-emb-cat", "emb", "Ember Catalog", "Catalog labels", "North America", ofSegment("Catalog")),
  tg("tg-emb-nash", "emb", "Ember Nashville", "Country and Americana labels", "North America", ofSegment("Nashville")),
  tg("tg-emb-all", "emb", "All Ember", "Every Ember tenant", "Worldwide", ofOrg("emb")),
  tg("tg-cpl-all", "cpl", "All Copperline", "Every Copperline tenant", "North America", ofOrg("cpl")),
  tg("tg-swc-all", "swc", "All Saltwater", "Every Saltwater tenant", "Worldwide", ofOrg("swc")),
  tg("tg-knk-all", "knk", "All Kite & Key", "Every Kite & Key tenant", "North America", ofOrg("knk")),
  tg("tg-hmg", ENTERPRISE_SCOPE, "All Halden labels", "Every tenant of every organization", "Worldwide", TENANTS.filter((one) => one.orgId).map((one) => one.id)),
];

/* People: the named few, then the teams around them. */

const NAMED: readonly Person[] = [
  { id: "p-noa", name: "Noa Lindqvist", email: "noa.lindqvist@halden.example", orgs: ["nwd"], lastActive: "Today", enterpriseAdmin: true },
  { id: "p-ilse", name: "Ilse Varga", email: "ilse.varga@halden.example", orgs: ["nwd"], lastActive: "Yesterday" },
  { id: "p-rafe", name: "Rafe Okonkwo", email: "rafe.okonkwo@halden.example", orgs: ["emb"], lastActive: "Today" },
  { id: "p-june", name: "June Marchetti", email: "june.marchetti@halden.example", orgs: ["cpl"], lastActive: "This week" },
  { id: "p-otto", name: "Otto Lindgren", email: "otto.lindgren@halden.example", orgs: ["swc"], lastActive: "Last week" },
  { id: "p-sol", name: "Sol Herrera", email: "sol.herrera@halden.example", orgs: ["nwd"], lastActive: "Today" },
  { id: "p-ines", name: "Inés Calvo", email: "ines.calvo@halden.example", orgs: ["nwd"], lastActive: "2 days ago" },
  { id: "p-tomas", name: "Tomás Ferreira", email: "tomas.ferreira@halden.example", orgs: ["nwd"], lastActive: "This week" },
  { id: "p-alba", name: "Alba Montes", email: "alba.montes@halden.example", orgs: ["nwd"], lastActive: "Yesterday" },
  { id: "p-pia", name: "Pia Strand", email: "pia.strand@ledgerline-audit.example", orgs: ["nwd"], lastActive: "3 weeks ago" },
  { id: "p-hugh", name: "Hugh Penrose", email: "hugh.penrose@halden.example", orgs: ["nwd"], lastActive: "Today" },
];

const GIVEN = ["Aria", "Bastian", "Cleo", "Dario", "Esme", "Felix", "Greta", "Hamid", "Iris", "Jonah", "Kaia", "Lior", "Mira", "Nils", "Orla", "Pavel", "Quinn", "Rosa", "Silas", "Tova", "Uma", "Viggo", "Wynn", "Ximena", "Yusuf", "Zora"];
const FAMILY = ["Abara", "Bergman", "Castell", "Duarte", "Ekdahl", "Fontaine", "Galloway", "Hartigan", "Ivers", "Jaramillo", "Kovac", "Lowell", "Moreau", "Nakamura", "Osei", "Pellegrini", "Quist", "Rourke", "Sandoval", "Thorne"];

/** The teams around the named few: so many in each organization, a dozen in two. */
const TEAMS: readonly [orgs: readonly string[], count: number][] = [
  [["nwd"], 46],
  [["nwd", "emb"], 8],
  [["emb"], 14],
  [["cpl"], 7],
  [["swc"], 5],
  [["knk"], 3],
];

const LAST_ACTIVE = ["Today", "Yesterday", "2 days ago", "This week", "Last week", "3 weeks ago", "Last month"];

export let PEOPLE: readonly Person[] = [
  ...NAMED,
  ...TEAMS.flatMap(([orgs, count], teamAt) =>
    Array.from({ length: count }, (_, at) => {
      const serial = teamAt * 50 + at;
      const name = `${GIVEN[(serial * 5) % GIVEN.length]} ${FAMILY[(serial * 3 + teamAt) % FAMILY.length]}`;
      return {
        id: `p-${serial}`,
        name,
        email: `${name.toLowerCase().replace(/[^a-z]+/g, ".")}@halden.example`,
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
  const pool = [...named, ...peopleIn(scope).map((one) => one.id).filter((id) => !named.includes(id) && !id.startsWith("p-noa"))];
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
  ag("ag-es-roy", "nwd", "Northwind Spain Royalties Operator", "Closes the royalty period for the Spanish labels", { royalties: 2, finance: 1, catalog: 1, analytics: 1 }, ["tg-es"], seat("nwd", 6, ["p-sol", "p-alba", "p-pia"], { "p-pia": "2026-12-31" })),
  ag("ag-es-dist", "nwd", "Northwind Spain Distribution Operator", "Delivers and takes down Spanish releases", { catalog: 2, distribution: 2, analytics: 1 }, ["tg-es"], seat("nwd", 9, ["p-ines", "p-tomas"])),
  ag("ag-uk-roy", "nwd", "Northwind UK Royalties Operator", "Closes the royalty period for the UK labels", { royalties: 2, finance: 1, catalog: 1 }, ["tg-uk"], seat("nwd", 8)),
  ag("ag-uk-dist", "nwd", "Northwind UK Distribution Operator", "Delivers and takes down UK releases", { catalog: 2, distribution: 2, analytics: 1 }, ["tg-uk"], seat("nwd", 12, ["p-sol", "p-hugh"])),
  ag("ag-uk-cat", "nwd", "Northwind UK Catalog Operator", "Keeps the UK catalog's metadata right", { catalog: 2, rights: 1 }, ["tg-uk"], seat("nwd", 4)),
  ag("ag-de-ops", "nwd", "Northwind DACH Operations", "Runs the DACH labels end to end", { catalog: 2, distribution: 2, royalties: 2, finance: 1 }, ["tg-de"], seat("nwd", 9)),
  ag("ag-iberia-fin", "nwd", "Iberia Finance Viewer", "Reads revenue for Spain and Portugal", { finance: 1, royalties: 1 }, ["tg-iberia"], seat("nwd", 3, ["p-alba"])),
  ag("ag-europe-ana", "nwd", "Europe Analytics Viewer", "Reads streams across Europe", { analytics: 1, insights: 1 }, ["tg-europe"], seat("nwd", 6)),
  ag("ag-pt-dist", "nwd", "Northwind Portugal Distribution Operator", "Delivers Portuguese releases", { catalog: 2, distribution: 2 }, ["tg-pt"], seat("nwd", 4)),
  ag("ag-nwd-lead", "nwd", "Northwind Leadership", "Reads everything that matters across Northwind", { catalog: 1, finance: 1, analytics: 1, insights: 1 }, ["tg-nwd-all"], seat("nwd", 4)),
  ag("ag-emb-dist", "emb", "Ember Frontline Distribution Operator", "Delivers frontline releases", { catalog: 2, distribution: 2, analytics: 1 }, ["tg-emb-front"], seat("emb", 6, ["p-rafe"])),
  ag("ag-emb-roy", "emb", "Ember Frontline Royalties Operator", "Closes the frontline royalty period", { royalties: 2, finance: 1 }, ["tg-emb-front"], seat("emb", 5)),
  ag("ag-emb-cat", "emb", "Ember Catalog Operator", "Keeps Ember's catalog and its rights right", { catalog: 2, rights: 2 }, ["tg-emb-cat"], seat("emb", 5)),
  ag("ag-emb-nash", "emb", "Ember Nashville Operations", "Runs the Nashville labels", { catalog: 2, distribution: 2, royalties: 1 }, ["tg-emb-nash"], seat("emb", 4)),
  ag("ag-emb-fin", "emb", "Ember Finance Viewer", "Reads Ember's revenue", { finance: 1 }, ["tg-emb-all"], seat("emb", 3)),
  ag("ag-cpl-dist", "cpl", "Copperline Distribution Operator", "Delivers Copperline releases", { catalog: 2, distribution: 2, analytics: 1 }, ["tg-cpl-all"], seat("cpl", 6, ["p-june"])),
  ag("ag-swc-cat", "swc", "Saltwater Catalog Operator", "Keeps the reissue catalog right", { catalog: 2, rights: 2, royalties: 1 }, ["tg-swc-all"], seat("swc", 4, ["p-otto"])),
  ag("ag-hmg-roy", ENTERPRISE_SCOPE, "Group Royalties", "Closes the royalty period across the group", { royalties: 2, finance: 1, analytics: 1 }, ["tg-hmg"], seat(ENTERPRISE_SCOPE, 5, ["p-hugh"])),
  ag("ag-hmg-fin", ENTERPRISE_SCOPE, "Group Finance Viewer", "Reads revenue across the group", { finance: 1 }, ["tg-hmg"], seat(ENTERPRISE_SCOPE, 7, ["p-ilse"])),
  ag("ag-hmg-audit", ENTERPRISE_SCOPE, "Group Auditor", "Reads everything but administration, for the year-end audit", { catalog: 1, rights: 1, distribution: 1, royalties: 1, finance: 1, ts: 1, analytics: 1, insights: 1 }, ["tg-hmg"], seat(ENTERPRISE_SCOPE, 2, ["p-pia"], { "p-pia": "2026-12-31" })),
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
