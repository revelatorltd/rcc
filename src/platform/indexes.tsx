import { Avatar, type RecordIndexProps } from "@revelator/pro-ui";

import {
  AddMembers,
  AddPeople,
  AddToGroup,
  ApplyToTenantGroup,
  ArchiveAccessGroups,
  ArchiveTenantGroups,
  RemoveFromAll,
  groupMark,
  orgMark,
  personMark,
  regionFlag,
  regionMark,
} from "./dialogs";
import { logoByName, logoOf } from "./logos";
import {
  ENTERPRISE_SCOPE,
  GUARDS,
  ORGANIZATIONS,
  PEOPLE,
  accessGroups,
  accessGroupsOf,
  accessGroupsUsing,
  effectiveAccess,
  lastActiveRank,
  orgById,
  peopleWithAccess,
  permissionsSaid,
  scopeName,
  tenantGroupById,
  tenantGroups,
  tenantsOfOrg,
  tenantsOfTargets,
  type AccessGroup,
  type Organization,
  type Person,
  type TenantGroup,
} from "./mock";
import {
  accessGroupHref,
  duplicateAccessGroupHref,
  editAccessGroupHref,
  editTenantGroupHref,
  newAccessGroupHref,
  newTenantGroupHref,
  organizationHref,
  personHref,
  tenantGroupHref,
} from "./route";

/**
 * The four sets an enterprise's access is run from, each declared ONCE — the whole set on its page, or one
 * organization's in its record, where the organization column and filter fall away.
 */

/** An organization's mark found by its name — for a row gathered by it; the enterprise level's too. */
const orgMarkByName = (name: string) => {
  const logo = logoByName(name);
  return (
    <Avatar kind="organization" name={name}>
      {logo ? <img src={logo} alt="" /> : null}
    </Avatar>
  );
};

/** The scopes a group can belong to, in order: each organization, then the enterprise. */
export const SCOPES = () => [...ORGANIZATIONS.map((one) => one.id), ENTERPRISE_SCOPE];

const scopeNames = () => SCOPES().map(scopeName);

/** The organizations. */
export function organizationIndex(): RecordIndexProps<Organization> {
  return {
    rows: ORGANIZATIONS,
    rowKey: (one) => one.id,
    noun: { one: "organization", many: "organizations" },
    identity: {
      title: "Organization",
      name: (one) => one.name,
      mark: (one) => orgMark(one),
      sortable: true,
      opens: (one) => organizationHref(one.id),
    },
    // AS CARDS too, as the prototype lays them out: an organization is recognised by its logo first.
    grid: {
      aspect: "square",
      picture: (one) => logoOf(one.id) ?? null,
      meta: (one) => [one.code, `${tenantsOfOrg(one.id).length} tenants`, one.admins.length ? `${one.admins.length} admin${one.admins.length === 1 ? "" : "s"}` : "No admin yet"],
    },
    searchBy: ["Organization", "Code"],
    columns: [
      { name: "Code", value: (one) => one.code, cell: (one) => one.code },
      { name: "Tenants", as: "count", value: (one) => tenantsOfOrg(one.id).length },
      { name: "Tenant groups", as: "count", value: (one) => tenantGroups(one.id).length },
      { name: "Access groups", as: "count", value: (one) => accessGroups(one.id).length },
      { name: "People", as: "count", value: (one) => PEOPLE.filter((person) => person.orgs.includes(one.id)).length },
      {
        name: "Organization admins",
        as: "entities",
        value: (one) => one.admins.map((id) => PEOPLE.find((person) => person.id === id)?.name ?? id),
        noun: { one: "admin", many: "admins" },
        entity: "person",
      },
    ],
    filters: [
      {
        kind: "switches",
        key: "health",
        label: "Health",
        switches: [
          { key: "admin", label: "No organization admin yet", holds: (one) => one.admins.length === 0 },
          { key: "unused", label: "Has a tenant group nobody uses", holds: (one) => tenantGroups(one.id).some((tg) => accessGroupsUsing(tg.id).length === 0) },
        ],
      },
    ],
    totals: [{ count: true }],
    commands: (one) => [
      { label: "Open", opens: organizationHref(one.id) },
      { label: "Tenant groups", opens: organizationHref(one.id, "Tenant groups") },
      { label: "Access groups", opens: organizationHref(one.id, "Access groups") },
      { label: "People", opens: organizationHref(one.id, "People") },
      { label: "New tenant group", opens: newTenantGroupHref(one.id) },
      { label: "New access group", opens: newAccessGroupHref(one.id) },
      { label: "Add people", dialog: <AddPeople orgId={one.id} /> },
      { label: "Organization settings", opens: organizationHref(one.id, "Settings") },
    ],
    // Exporting leaves RCC, which this rebuild does not model.
    selection: [{ label: "Export" }],
  };
}

/**
 * A row of the tenant groups gathered — an organization's, or a region's — standing for its
 * members: what they list, who uses them, who reaches them, each counted once.
 */
type Gathered = TenantGroup & { members?: readonly TenantGroup[] };

const membersOf = (one: TenantGroup) => (one as Gathered).members;
const usedBy = (one: TenantGroup) => {
  const members = membersOf(one);
  return members ? [...new Set(members.flatMap((each) => accessGroupsUsing(each.id)))] : accessGroupsUsing(one.id);
};
const reachedBy = (one: TenantGroup) => {
  const members = membersOf(one);
  return members ? new Set(members.flatMap((each) => peopleWithAccess(each.id))).size : peopleWithAccess(one.id).length;
};
const scopesOf = (one: TenantGroup) => [...new Set((membersOf(one) ?? [one]).map((each) => scopeName(each.scope)))];
const regionsOf = (one: TenantGroup) => [...new Set((membersOf(one) ?? [one]).map((each) => each.region))].filter((each) => each !== "—");

/** The tenant groups — of one scope, or of every one. */
export function tenantGroupIndex(scope?: string): RecordIndexProps<TenantGroup> {
  const rows = tenantGroups(scope);
  return {
    rows,
    rowKey: (one) => one.id,
    noun: { one: "tenant group", many: "tenant groups" },
    identity: {
      title: "Tenant group",
      name: (one) => one.name,
      mark: (one) => groupMark(one),
      sortable: true,
      opens: (one) => tenantGroupHref(one.id),
    },
    searchBy: ["Tenant group"],
    columns: [
      ...(scope
        ? []
        : [
            {
              name: "Organization",
              as: "entities" as const,
              value: (one: TenantGroup) => scopesOf(one),
              noun: { one: "organization", many: "organizations" },
              entity: "organization" as const,
              picture: logoByName,
            },
          ]),
      { name: "Tenants", as: "count", value: (one) => one.tenants.length },
      {
        name: "Used by",
        as: "entities",
        value: (one) => usedBy(one).map((ag) => ag.name),
        noun: { one: "access group", many: "access groups" },
        entity: "organization",
      },
      { name: "People with access", as: "count", value: (one) => reachedBy(one) },
      {
        // Each region a place, led by its flag where it is one country.
        name: "Region",
        as: "entities",
        value: (one) => regionsOf(one),
        noun: { one: "region", many: "regions" },
        entity: "place",
        picture: regionFlag,
      },
      { name: "Last changed", value: (one) => one.changed, cell: (one) => one.changed || undefined },
    ],
    // GATHERED on the whole set — by the organization that owns each group, or by its region — so a
    // reader sees an organization's groups together before any one of them. Inside an organization
    // every group is its own, and the set is read plain.
    ...(scope
      ? {}
      : {
          gather: {
            by: [
              {
                name: "By organization",
                identity: "Organization",
                key: (one: TenantGroup) => scopeName(one.scope),
                mark: (key: string) => orgMarkByName(key),
              },
              { name: "By region", identity: "Region", key: (one: TenantGroup) => one.region, mark: (key: string) => regionMark(key) },
            ],
            row: (members: readonly TenantGroup[], key: string): Gathered => ({
              id: `gathered:${key}`,
              scope: members[0]!.scope,
              name: key,
              description: "",
              region: [...new Set(members.map((each) => each.region))].join(", "),
              tenants: [...new Set(members.flatMap((each) => each.tenants))],
              changed: "",
              members,
            }),
          },
        }),
    // WHETHER IT IS USED as readings: a group nobody's access group uses gives nobody anything.
    readings: [
      { name: "All", holds: () => true },
      { name: "In use", holds: (one) => accessGroupsUsing(one.id).length > 0 },
      { name: "Not used yet", holds: (one) => accessGroupsUsing(one.id).length === 0 },
    ],
    filters: [
      ...(scope ? [] : [{ kind: "anyOf" as const, key: "org", label: "Organization", options: scopeNames(), of: (one: TenantGroup) => scopeName(one.scope) }]),
      { kind: "anyOf", key: "region", label: "Region", options: [...new Set(rows.map((one) => one.region))], of: (one) => one.region },
    ],
    totals: [{ count: true }],
    // A gathered row is no tenant group of its own: what is done to one is done to its members.
    commands: (one) =>
      membersOf(one)
        ? []
        : [
            { label: "Open", opens: tenantGroupHref(one.id) },
            { label: "Edit tenant group", opens: editTenantGroupHref(one.id) },
            { label: "View access groups", opens: tenantGroupHref(one.id, "Access groups") },
            { label: "New access group on this group", opens: newAccessGroupHref(one.scope, one.id) },
            { label: "Archive", destructive: true, dialog: <ArchiveTenantGroups groups={[one]} /> },
          ],
    selection: (held) => [
      { label: "Archive", destructive: true, dialog: <ArchiveTenantGroups groups={held} /> },
      { label: "Export" },
    ],
  };
}

/** The access groups — of one scope, or of every one; or those that use one tenant group. */
export function accessGroupIndex({ scope, tgId }: { scope?: string; tgId?: string } = {}): RecordIndexProps<AccessGroup> {
  const rows = tgId ? accessGroupsUsing(tgId) : accessGroups(scope);
  const showScope = !scope && !tgId;
  return {
    rows,
    rowKey: (one) => one.id,
    noun: { one: "access group", many: "access groups" },
    identity: {
      title: "Access group",
      name: (one) => one.name,
      mark: (one) => groupMark(one),
      sortable: true,
      opens: (one) => accessGroupHref(one.id),
    },
    searchBy: ["Access group"],
    columns: [
      ...(showScope
        ? [
            {
              name: "Organization",
              as: "entities" as const,
              value: (one: AccessGroup) => [scopeName(one.scope)],
              noun: { one: "organization", many: "organizations" },
              entity: "organization" as const,
              picture: logoByName,
            },
          ]
        : []),
      { name: "Permissions", value: (one) => Object.values(one.perms).filter(Boolean).length, cell: (one) => permissionsSaid(one.perms) },
      {
        name: "Applies to",
        as: "entities",
        value: (one) => one.targets.map((id) => tenantGroupById(id)?.name ?? id),
        noun: { one: "tenant group", many: "tenant groups" },
        entity: "organization",
      },
      { name: "Tenants", as: "count", value: (one) => tenantsOfTargets(one.targets).length },
      { name: "Members", as: "count", value: (one) => one.members.length },
    ],
    ...(showScope
      ? {
          // The enterprise's own groups — the few that cross organizations — read apart.
          readings: [
            { name: "All", holds: () => true },
            { name: "Organizations", holds: (one: AccessGroup) => one.scope !== ENTERPRISE_SCOPE },
            { name: "Enterprise-level", holds: (one: AccessGroup) => one.scope === ENTERPRISE_SCOPE },
          ],
        }
      : {}),
    filters: [
      ...(showScope ? [{ kind: "anyOf" as const, key: "org", label: "Organization", options: scopeNames(), of: (one: AccessGroup) => scopeName(one.scope) }] : []),
      {
        kind: "anyOf",
        key: "tg",
        label: "Tenant group",
        options: (scope ? tenantGroups(scope) : tenantGroups()).map((one) => one.name),
        of: (one) => one.targets.map((id) => tenantGroupById(id)?.name ?? id),
      },
      {
        kind: "anyOf",
        key: "permission",
        label: "Permission",
        options: GUARDS.map((one) => one.label),
        of: (one) => GUARDS.filter((guard) => (one.perms[guard.key] ?? 0) > 0).map((guard) => guard.label),
      },
    ],
    totals: [{ count: true }],
    commands: (one) => [
      { label: "Open", opens: accessGroupHref(one.id) },
      { label: "Edit access group", opens: editAccessGroupHref(one.id) },
      { label: "Add members", dialog: <AddMembers group={one} /> },
      { label: "Duplicate and retarget", opens: duplicateAccessGroupHref(one.id) },
      { label: "Archive", destructive: true, dialog: <ArchiveAccessGroups groups={[one]} /> },
    ],
    selection: (held) => [
      { label: "Add to tenant group", dialog: <ApplyToTenantGroup groups={held} /> },
      { label: "Archive", destructive: true, dialog: <ArchiveAccessGroups groups={held} /> },
      { label: "Export" },
    ],
  };
}

/** The people — of one organization, or of the enterprise. */
export function peopleIndex(orgId?: string): RecordIndexProps<Person> {
  const rows = orgId ? PEOPLE.filter((one) => one.orgs.includes(orgId)) : PEOPLE;
  return {
    rows,
    rowKey: (one) => one.id,
    noun: { one: "person", many: "people" },
    identity: {
      title: "Person",
      name: (one) => one.name,
      mark: (one) => personMark(one),
      sortable: true,
      opens: (one) => personHref(one.id),
    },
    sort: { column: "Person", direction: "ascending" },
    searchBy: ["Person", "Email"],
    columns: [
      { name: "Email", value: (one) => one.email, cell: (one) => (one.invited ? `Invited · ${one.email}` : one.email) },
      ...(orgId
        ? []
        : [
            {
              name: "Organizations",
              as: "entities" as const,
              value: (one: Person) => one.orgs.map((id) => orgById(id)?.name ?? id),
              noun: { one: "organization", many: "organizations" },
              entity: "organization" as const,
              picture: logoByName,
            },
          ]),
      {
        name: "Access groups",
        as: "entities",
        value: (one) => accessGroupsOf(one.id).map((ag) => ag.name),
        noun: { one: "access group", many: "access groups" },
        entity: "organization",
      },
      { name: "Tenants", as: "count", value: (one) => effectiveAccess(one.id).length },
      { name: "Last active", value: (one) => lastActiveRank(one.lastActive), cell: (one) => one.lastActive },
    ],
    // WHETHER THEY CAN SEE ANYTHING as readings: being in an organization gives nobody data.
    readings: [
      { name: "All", holds: () => true },
      { name: "In an access group", holds: (one) => accessGroupsOf(one.id).length > 0 },
      { name: "In no access group", holds: (one) => accessGroupsOf(one.id).length === 0 },
    ],
    filters: [
      ...(orgId
        ? []
        : [
            {
              kind: "anyOf" as const,
              key: "org",
              label: "Organization",
              options: ORGANIZATIONS.map((one) => one.name),
              of: (one: Person) => one.orgs.map((id) => orgById(id)?.name ?? id),
            },
          ]),
      {
        kind: "switches",
        key: "person",
        label: "Person",
        switches: [
          { key: "invited", label: "Invited, not signed up", holds: (one) => Boolean(one.invited) },
          { key: "many", label: "In more than one organization", holds: (one) => one.orgs.length > 1 },
        ],
      },
    ],
    totals: [{ count: true }],
    commands: (one) => [
      { label: "View effective access", opens: personHref(one.id, "Effective access") },
      { label: "Add to access group", dialog: <AddToGroup people={[one]} /> },
      { label: "Add to organization", dialog: <AddPeople personId={one.id} /> },
      accessGroupsOf(one.id).length
        ? { label: "Remove from all access groups", destructive: true, dialog: <RemoveFromAll people={[one]} /> }
        : { label: "Remove from all access groups", destructive: true, unavailable: "They are in no access group." },
    ],
    selection: (held) => [
      { label: "Add to access group", dialog: <AddToGroup people={held} /> },
      { label: "Remove from all access groups", destructive: true, dialog: <RemoveFromAll people={held} /> },
      { label: "Export" },
    ],
  };
}

/** The ways to start a group — one per scope, the enterprise last. */
export const newGroupChoices = (href: (scope: string) => string) =>
  SCOPES().map((scope) => ({ label: scopeName(scope), opens: href(scope) }));
