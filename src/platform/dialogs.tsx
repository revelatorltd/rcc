import { Avatar, ConfirmationDialog, Field, FormDialog, owed, unanswered, type HeldBy } from "@revelator/pro-ui";
import { flagFor } from "@revelator/pro-ui/assets";

import {
  ENDS,
  ORGANIZATIONS,
  PEOPLE,
  REGIONS,
  TEMPLATES,
  accessGroups,
  addMembers,
  addPeopleToOrg,
  addTargets,
  addTenantsToGroup,
  archiveAccessGroups,
  archiveTenantGroups,
  countryOfRegion,
  emailsIn,
  moveTenants,
  orgById,
  peopleIn,
  removeFromAllGroups,
  removeMember,
  removeTenantsFromGroup,
  scopeName,
  tenantGroups,
  updateOrganization,
  ENTERPRISE_SCOPE,
  type AccessGroup,
  type Organization,
  type Person,
  type Scope,
  type Tenant,
  type TenantGroup,
} from "./mock";
import { logoOf } from "./logos";

/* ---------- The marks ---------- */

/** A group, a tenant — a square, its initials. */
export const groupMark = (one: { name: string }) => <Avatar kind="organization" name={one.name} />;

/**
 * An organization — its own logo filling the square, or its initials where it has none. ONE
 * function, so its row, its card and its band wear the same mark.
 */
export const orgMark = (one: { id: string; name: string }) => {
  const logo = logoOf(one.id);
  return (
    <Avatar kind="organization" name={one.name}>
      {logo ? <img src={logo} alt="" /> : null}
    </Avatar>
  );
};
/**
 * A tenant group — its organization's logo, so a group reads as its organization's wherever it
 * stands, whatever its region; the enterprise level's for an enterprise group, its initials where
 * its organization has no logo.
 */
export const tenantGroupMark = (one: { scope: string; name: string }) => {
  const logo = logoOf(one.scope);
  return (
    <Avatar kind="organization" name={one.name}>
      {logo ? <img src={logo} alt="" /> : null}
    </Avatar>
  );
};

/**
 * A region — its country's flag, where it is one country; the place's own mark where it is a run of
 * them, since the system draws no flag for one and invents none.
 */
export const regionMark = (name: string) => <Avatar kind="place" name={countryOfRegion(name) ?? name} />;

/** A region's flag, as a cell naming it asks — none for a run of countries. */
export const regionFlag = (name: string) => {
  const country = countryOfRegion(name);
  return (country && flagFor(country)) || undefined;
};

/** The regions, as a field offers them — each a place, led by its flag where it has one. */
export const regionOptions = REGIONS.map((one) => ({ value: one.name, title: one.name, art: regionFlag(one.name) }));

/** A person — round, their initials. */
export const personMark = (one: { name: string }) => <Avatar kind="person" name={one.name} />;

/* ---------- Options a field offers ---------- */

export const personOptions = (people: readonly Person[]) =>
  people.filter((one) => !one.invited).map((one) => ({ value: one.id, title: one.name, code: one.email }));
export const groupOptions = (groups: readonly { id: string; name: string }[]) => groups.map((one) => ({ value: one.id, title: one.name }));
export const orgOptions = (orgs: readonly Organization[] = ORGANIZATIONS) =>
  orgs.map((one) => ({ value: one.id, title: one.name, code: one.code, art: logoOf(one.id) }));
export const endOptions = ENDS.map((one) => ({ value: one.value || "none", title: one.label }));
/** An end date as the draft holds it — "none" for none, since a choice cannot be blank. */
export const endValue = (answer: string) => (answer === "none" ? "" : answer);

/** The templates an access group starts from, and Custom. */
export const templateOptions = [
  ...TEMPLATES.map((one) => ({ value: one.key, title: one.label })),
  { value: "custom", title: "Custom", description: "Set each permission below." },
];

/* ---------- Organizations ---------- */

/**
 * People added to an organization — those found, and the rest invited by their address. Joining an
 * organization gives nobody data until an access group does. Opened on one organization, or asks
 * which.
 */
export function AddPeople({ orgId, personId, ...held }: HeldBy & { orgId?: string; personId?: string }) {
  const org = orgId ? orgById(orgId) : undefined;
  return (
    <FormDialog
      {...held}
      confirm="Add"
      draft={{
        org: owed(org?.id ?? ""),
        people: personId ? [personId] : ([] as readonly string[]),
        invites: unanswered.longtext,
      }}
      ready={(draft) => (draft.people?.length ?? 0) > 0 || emailsIn(String(draft.invites ?? "")).length > 0}
      onCommit={(draft) => addPeopleToOrg(draft.org, draft.people, emailsIn(String(draft.invites ?? "")))}
    >
      {org ? null : <Field as="record" name="org" label="Organization" entity="organization" noun={{ one: "organization", many: "organizations" }} options={orgOptions()} />}
      <Field
        as="record"
        name="people"
        label="People"
        entity="person"
        several
        noun={{ one: "person", many: "people" }}
        options={personOptions(org ? PEOPLE.filter((one) => !one.orgs.includes(org.id)) : PEOPLE)}
      />
      <Field
        as="longtext"
        name="invites"
        label="Invite by email"
        help="Paste addresses, or a CSV column of them. Anyone without an account gets an invite."
        notice="They see no data until an access group gives it."
      />
    </FormDialog>
  );
}

/** What an organization's members see first, and how its admins name groups. */
export function EditDefaults({ org, ...held }: HeldBy & { org: Organization }) {
  const choices = (values: readonly string[]) => values.map((value) => ({ value, title: value }));
  return (
    <FormDialog
      {...held}
      confirm="Save"
      draft={{ home: owed(org.defaults.home), landing: owed(org.defaults.landing), naming: owed(org.defaults.naming) }}
      onCommit={(draft) => updateOrganization(org.id, { defaults: { home: draft.home, landing: draft.landing, naming: draft.naming } })}
    >
      <Field
        as="choice"
        name="home"
        label="Home dashboard"
        help="What members see first."
        noun={{ one: "dashboard", many: "dashboards" }}
        options={choices(["Distribution overview", "Label overview", "Royalties overview", "Catalog overview"])}
      />
      <Field
        as="choice"
        name="landing"
        label="Landing section"
        help="Where members land after signing in."
        noun={{ one: "section", many: "sections" }}
        options={choices(["Catalog", "Distribution", "Analytics", "Royalties"])}
      />
      <Field as="text" name="naming" label="Access group naming" help="Suggested when admins name a group — <Region> <Function>." />
    </FormDialog>
  );
}

/**
 * Someone made an organization admin — found, or invited by their address. An admin manages the
 * organization's groups, people and settings, and sees no data unless an access group gives it.
 */
export function AddOrgAdmin({ org, ...held }: HeldBy & { org: Organization }) {
  return (
    <FormDialog
      {...held}
      confirm="Add"
      draft={{ person: unanswered.record, email: unanswered.email }}
      ready={(draft) => Boolean(draft.person) || Boolean(draft.email)}
      onCommit={(draft) => {
        const picked = typeof draft.person === "string" && draft.person ? [draft.person] : [];
        const invited = addPeopleToOrg(org.id, picked, draft.email ? [String(draft.email)] : []);
        const found = draft.email ? PEOPLE.find((one) => one.email.toLowerCase() === String(draft.email).toLowerCase()) : undefined;
        const added = [...picked, ...invited, ...(found ? [found.id] : [])];
        updateOrganization(org.id, { admins: [...new Set([...org.admins, ...added])] });
      }}
    >
      <Field
        as="record"
        name="person"
        label="Person"
        entity="person"
        noun={{ one: "person", many: "people" }}
        options={personOptions(PEOPLE.filter((one) => !org.admins.includes(one.id)))}
      />
      <Field as="email" name="email" label="Or invite by email" help="Someone without an account gets an invite." />
    </FormDialog>
  );
}

export function RemoveOrgAdmin({ org, person, ...held }: HeldBy & { org: Organization; person: Person }) {
  return (
    <ConfirmationDialog
      {...held}
      asks={`${person.name} no longer manages ${org.name}'s groups, people and settings.`}
      confirm="Remove"
      destructive
      onCommit={() => updateOrganization(org.id, { admins: org.admins.filter((id) => id !== person.id) })}
    />
  );
}

/**
 * A tenant moved to another organization. It leaves every tenant group of the one it leaves — whoever
 * reached it through them loses that access — and joins with none: the new organization's admins
 * decide who sees it. Its catalog, royalties and history stay with it.
 */
export function MoveTenant({ tenant, ...held }: HeldBy & { tenant: Tenant }) {
  return (
    <FormDialog
      {...held}
      confirm="Move"
      draft={{ to: owed("") }}
      onCommit={(draft) => moveTenants([tenant.id], draft.to)}
    >
      <Field
        as="record"
        name="to"
        label="Move to"
        entity="organization"
        noun={{ one: "organization", many: "organizations" }}
        options={orgOptions(ORGANIZATIONS.filter((one) => one.id !== tenant.orgId))}
        notice="It leaves its tenant groups here, and whoever reached it through them loses that access. Both organizations' admins are told."
      />
    </FormDialog>
  );
}

/* ---------- Tenant groups ---------- */

/** Tenant groups archived — whoever reached tenants only through them loses that access. */
export function ArchiveTenantGroups({ groups, after, ...held }: HeldBy & { groups: readonly TenantGroup[]; after?: () => void }) {
  return (
    <ConfirmationDialog
      {...held}
      of={groups.length > 1 ? { count: groups.length, noun: { one: "tenant group", many: "tenant groups" } } : undefined}
      asks={
        groups.length === 1
          ? `${groups[0]!.name} is archived, and whoever reached its tenants through it loses that access.`
          : "They are archived, and whoever reached tenants through them loses that access."
      }
      confirm="Archive"
      destructive
      onCommit={() => {
        archiveTenantGroups(groups.map((one) => one.id));
        after?.();
      }}
    />
  );
}

/** The tenants a group may hold: its organization's, or every organization's for the enterprise. */
export const tenantPool = (scope: Scope, tenants: readonly Tenant[]) =>
  tenants.filter((one) => (scope === ENTERPRISE_SCOPE ? Boolean(one.orgId) : one.orgId === scope));

/** Tenants added to a group — a tenant sits in any number of them. */
export function AddTenants({ group, pool, ...held }: HeldBy & { group: TenantGroup; pool: readonly Tenant[] }) {
  return (
    <FormDialog
      {...held}
      confirm="Add"
      draft={{ tenants: owed.several }}
      onCommit={(draft) => addTenantsToGroup(group.id, draft.tenants)}
    >
      <Field
        as="record"
        name="tenants"
        label="Tenants"
        entity="organization"
        several
        standard="id"
        noun={{ one: "tenant", many: "tenants" }}
        options={pool.filter((one) => !group.tenants.includes(one.id)).map((one) => ({ value: one.id, title: one.name, code: one.id }))}
        notice="Whoever reaches this group through an access group can reach them too."
      />
    </FormDialog>
  );
}

/** Tenants held on one group, added to another of its organization's. */
export function AddToTenantGroup({ group, tenants, ...held }: HeldBy & { group: TenantGroup; tenants: readonly Tenant[] }) {
  return (
    <FormDialog
      {...held}
      confirm="Add"
      of={{ count: tenants.length, noun: { one: "tenant", many: "tenants" } }}
      draft={{ to: owed("") }}
      onCommit={(draft) => addTenantsToGroup(draft.to, tenants.map((one) => one.id))}
    >
      <Field
        as="record"
        name="to"
        label="Tenant group"
        entity="organization"
        noun={{ one: "tenant group", many: "tenant groups" }}
        options={groupOptions(tenantGroups(group.scope).filter((one) => one.id !== group.id))}
        help="A tenant can sit in any number of tenant groups."
      />
    </FormDialog>
  );
}

/**
 * Tenants given to an access group. An access group applies to tenant groups, not to single tenants:
 * the tenants join one of the tenant groups it applies to.
 */
export function AddToAccessGroup({ group, tenants, ...held }: HeldBy & { group: TenantGroup; tenants: readonly Tenant[] }) {
  // Each access group of the scope, through each tenant group it applies to — the pair is the answer.
  const routes = accessGroups()
    .filter((one) => one.scope === group.scope || one.scope === ENTERPRISE_SCOPE)
    .flatMap((one) =>
      one.targets
        .filter((target) => target !== group.id)
        .map((target) => ({ value: `${one.id}|${target}`, title: one.name, code: tenantGroups().find((each) => each.id === target)?.name })),
    );
  return (
    <FormDialog
      {...held}
      confirm="Add"
      of={{ count: tenants.length, noun: { one: "tenant", many: "tenants" } }}
      draft={{ route: owed("") }}
      onCommit={(draft) => addTenantsToGroup(draft.route.split("|")[1]!, tenants.map((one) => one.id))}
    >
      <Field
        as="record"
        name="route"
        label="Access group, through a tenant group"
        entity="organization"
        noun={{ one: "access group", many: "access groups" }}
        options={routes}
        help="The tenants join the tenant group named beside the access group, which then covers them."
      />
    </FormDialog>
  );
}

export function RemoveTenants({ group, tenants, ...held }: HeldBy & { group: TenantGroup; tenants: readonly Tenant[] }) {
  return (
    <ConfirmationDialog
      {...held}
      of={{ count: tenants.length, noun: { one: "tenant", many: "tenants" } }}
      asks={`They leave ${group.name}, and access through it ends within a minute.`}
      confirm="Remove"
      destructive
      onCommit={() => removeTenantsFromGroup(group.id, tenants.map((one) => one.id))}
    />
  );
}

/**
 * People given access to a tenant group — by joining an access group of its organization. One that
 * does not yet apply to the group starts applying to it.
 */
export function AddPeopleToTenantGroup({ group, ...held }: HeldBy & { group: TenantGroup }) {
  const groups = accessGroups().filter((one) => one.scope === group.scope || one.scope === ENTERPRISE_SCOPE);
  return (
    <FormDialog
      {...held}
      confirm="Add"
      draft={{ through: owed(groups.length === 1 ? groups[0]!.id : ""), people: owed.several, ends: owed("none") }}
      onCommit={(draft) => {
        if (!groups.find((one) => one.id === draft.through)?.targets.includes(group.id)) addTargets([draft.through], group.id);
        addMembers(draft.through, draft.people, endValue(draft.ends));
      }}
    >
      <Field
        as="record"
        name="through"
        label="Access group"
        entity="organization"
        noun={{ one: "access group", many: "access groups" }}
        options={groups.map((one) => ({
          value: one.id,
          title: one.name,
          code: one.targets.includes(group.id) ? "Applies to it" : `Will start applying to ${group.name}`,
        }))}
      />
      <Field as="record" name="people" label="People" entity="person" several noun={{ one: "person", many: "people" }} options={personOptions(peopleIn(group.scope))} />
      <Field as="choice" name="ends" label="Access ends" options={endOptions} />
    </FormDialog>
  );
}

/* ---------- Access groups ---------- */

export function ArchiveAccessGroups({ groups, after, ...held }: HeldBy & { groups: readonly AccessGroup[]; after?: () => void }) {
  const memberships = groups.reduce((sum, one) => sum + one.members.length, 0);
  return (
    <ConfirmationDialog
      {...held}
      of={groups.length > 1 ? { count: groups.length, noun: { one: "access group", many: "access groups" } } : undefined}
      asks={`${groups.length === 1 ? groups[0]!.name : "They"} ${groups.length === 1 ? "is" : "are"} archived, and ${memberships} ${memberships === 1 ? "membership ends" : "memberships end"} with ${groups.length === 1 ? "it" : "them"}.`}
      confirm="Archive"
      destructive
      onCommit={() => {
        archiveAccessGroups(groups.map((one) => one.id));
        after?.();
      }}
    />
  );
}

/** People added to an access group, their access ending when it says. */
export function AddMembers({ group, ...held }: HeldBy & { group: AccessGroup }) {
  const members = new Set(group.members.map((one) => one.personId));
  return (
    <FormDialog
      {...held}
      confirm="Add"
      draft={{ people: owed.several, ends: owed("none") }}
      onCommit={(draft) => addMembers(group.id, draft.people, endValue(draft.ends))}
    >
      <Field
        as="record"
        name="people"
        label="People"
        entity="person"
        several
        noun={{ one: "person", many: "people" }}
        options={personOptions(peopleIn(group.scope).filter((one) => !members.has(one.id)))}
        notice="Access starts within a minute."
      />
      <Field as="choice" name="ends" label="Access ends" options={endOptions} />
    </FormDialog>
  );
}

export function RemoveMember({ group, person, ...held }: HeldBy & { group: AccessGroup; person: Person }) {
  return (
    <ConfirmationDialog
      {...held}
      asks={`${person.name} leaves ${group.name}, and its access ends within a minute.`}
      confirm="Remove"
      destructive
      onCommit={() => removeMember(group.id, person.id)}
    />
  );
}

/** Access groups held, all applied to one more tenant group — each in its own organization's. */
export function ApplyToTenantGroup({ groups, ...held }: HeldBy & { groups: readonly AccessGroup[] }) {
  const scopes = new Set(groups.filter((one) => one.scope !== ENTERPRISE_SCOPE).map((one) => one.scope));
  const offered = tenantGroups().filter((one) => scopes.size === 0 || scopes.has(one.scope));
  return (
    <FormDialog
      {...held}
      confirm="Add"
      of={{ count: groups.length, noun: { one: "access group", many: "access groups" } }}
      draft={{ to: owed("") }}
      onCommit={(draft) => {
        const target = tenantGroups().find((one) => one.id === draft.to)!;
        // A group applies only to its own organization's tenant groups; an enterprise group, anywhere.
        addTargets(
          groups.filter((one) => one.scope === ENTERPRISE_SCOPE || one.scope === target.scope).map((one) => one.id),
          target.id,
        );
      }}
    >
      <Field
        as="record"
        name="to"
        label="Tenant group"
        entity="organization"
        noun={{ one: "tenant group", many: "tenant groups" }}
        options={offered.map((one) => ({ value: one.id, title: one.name, code: scopeName(one.scope) }))}
        help={scopes.size > 1 ? "A group applies only to its own organization's tenant groups; one of another organization is skipped." : "Each access group applies its permissions to the tenant group's tenants."}
      />
    </FormDialog>
  );
}

/* ---------- People ---------- */

/** People added to one access group of their organizations, or of the enterprise. */
export function AddToGroup({ people, ...held }: HeldBy & { people: readonly Person[] }) {
  const orgs = new Set(people.flatMap((one) => one.orgs));
  const offered = accessGroups().filter((one) => one.scope === ENTERPRISE_SCOPE || orgs.has(one.scope));
  return (
    <FormDialog
      {...held}
      confirm="Add"
      of={people.length > 1 ? { count: people.length, noun: { one: "person", many: "people" } } : undefined}
      draft={{ group: owed(""), ends: owed("none") }}
      onCommit={(draft) => addMembers(draft.group, people.map((one) => one.id), endValue(draft.ends))}
    >
      <Field
        as="record"
        name="group"
        label="Access group"
        entity="organization"
        noun={{ one: "access group", many: "access groups" }}
        options={offered.map((one) => ({ value: one.id, title: one.name, code: scopeName(one.scope) }))}
        notice="Access starts within a minute, and the change is written to the audit log."
      />
      <Field as="choice" name="ends" label="Access ends" options={endOptions} />
    </FormDialog>
  );
}

export function RemoveFromAll({ people, ...held }: HeldBy & { people: readonly Person[] }) {
  return (
    <ConfirmationDialog
      {...held}
      of={people.length > 1 ? { count: people.length, noun: { one: "person", many: "people" } } : undefined}
      asks={`${people.length === 1 ? people[0]!.name : "They"} ${people.length === 1 ? "leaves" : "leave"} every access group, and access ends within a minute.`}
      confirm="Remove"
      destructive
      onCommit={() => removeFromAllGroups(people.map((one) => one.id))}
    />
  );
}
