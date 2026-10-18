import {
  Field,
  Wizard,
  WizardRow,
  WizardRowBody,
  WizardRowTip,
  WizardRowTips,
  WizardSection,
  WizardSectionBody,
  WizardSectionHeader,
  owed,
  unanswered,
} from "@revelator/pro-ui";

import { endOptions, endValue, personOptions, templateOptions, tenantPool } from "./dialogs";
import {
  ENTERPRISE_SCOPE,
  GUARDS,
  LEVELS,
  ORGANIZATIONS,
  PEOPLE,
  TEMPLATES,
  TENANTS,
  accessGroupById,
  addOrganization,
  addPeopleToOrg,
  emailsIn,
  orgById,
  peopleIn,
  saveAccessGroup,
  saveTenantGroup,
  scopeName,
  templateOf,
  tenantGroupById,
  tenantGroups,
  updateOrganization,
  type Guard,
  type Level,
  type Permissions,
} from "./mock";
import { accessGroupHref, go, organizationHref, platformHref, tenantGroupHref } from "./route";

const YES_NO = [
  { value: "Yes", title: "Yes" },
  { value: "No", title: "No" },
];
const LEVEL_OPTIONS = LEVELS.map((label, level) => ({ value: String(level), title: label }));

/** A tenant, as a field offers it — its name and its id. */
const tenantOption = (one: { id: string; name: string; orgId?: string }) => ({
  value: one.id,
  title: one.name,
  code: one.orgId ? `${one.id} · ${orgById(one.orgId)?.code ?? ""}` : `${one.id} · Unassigned`,
});

/**
 * A new organization — its admins, its tenants, and what it starts with. Creating it gives nobody
 * data: its admins set up access groups afterwards.
 */
export function NewOrganization() {
  const leave = () => go(platformHref("organizations"));
  const unassigned = TENANTS.filter((one) => !one.orgId).map((one) => one.id);
  const model = ORGANIZATIONS[0]!;
  return (
    <Wizard
      noun={{ one: "organization", many: "organizations" }}
      note="It gets its own admins, tenants, groups and defaults. Creating it gives nobody data access."
      onExit={leave}
      subject={(answers) => ({ kind: "organization", name: answers.name ?? "", meta: answers.code ? [String(answers.code).toUpperCase()] : [] })}
      draft={{
        name: owed.text,
        code: unanswered.text,
        description: unanswered.text,
        admins: [] as readonly string[],
        invites: unanswered.longtext,
        tenants: unassigned as readonly string[],
        allGroup: owed<string>("Yes"),
        templates: owed<string>("Yes"),
        dashboard: owed<string>("Yes"),
      }}
      // AT LEAST ONE ADMIN, found or invited: an organization nobody runs is only the enterprise's.
      ready={(answers) => (answers.admins?.length ?? 0) > 0 || emailsIn(String(answers.invites ?? "")).length > 0}
      onCommit={(answers) => {
        const name = answers.name.trim();
        const copied = answers.templates === "Yes" || answers.dashboard === "Yes";
        const id = addOrganization(
          {
            name,
            code: (String(answers.code || "") || name.slice(0, 3)).toUpperCase().slice(0, 4),
            description: String(answers.description || ""),
            admins: answers.admins,
            defaults: copied
              ? { ...model.defaults, home: answers.dashboard === "Yes" ? model.defaults.home : "Label overview" }
              : { home: "Label overview", landing: "Catalog", naming: "<Function>" },
            shared: { savedReports: 0, scheduledReports: 0, templates: answers.templates === "Yes" ? TEMPLATES.length : 0 },
          },
          answers.tenants,
          answers.allGroup === "Yes",
        );
        const invited = addPeopleToOrg(id, answers.admins, emailsIn(String(answers.invites ?? "")));
        updateOrganization(id, { admins: [...answers.admins, ...invited] });
        go(organizationHref(id));
      }}
    >
      <WizardSection>
        <WizardSectionHeader title="Details" />
        <WizardSectionBody>
          <WizardRow title="Organization">
            <WizardRowBody>
              <Field as="text" name="name" label="Name" />
              <Field as="text" name="code" label="Short code" help="Up to four letters — how it shows where organizations are listed." />
              <Field as="text" name="description" label="Description" />
            </WizardRowBody>
          </WizardRow>
        </WizardSectionBody>
      </WizardSection>
      <WizardSection>
        <WizardSectionHeader title="Organization admins" />
        <WizardSectionBody>
          <WizardRow title="Who runs it">
            <WizardRowBody>
              <Field as="record" name="admins" label="Admins" entity="person" several noun={{ one: "person", many: "people" }} options={personOptions(PEOPLE)} />
              <Field as="longtext" name="invites" label="Invite by email" help="Anyone without an account gets an invite." />
            </WizardRowBody>
            <WizardRowTips>
              <WizardRowTip>At least one. Admins manage its groups, people and settings, and see no data unless an access group gives it.</WizardRowTip>
            </WizardRowTips>
          </WizardRow>
        </WizardSectionBody>
      </WizardSection>
      <WizardSection>
        <WizardSectionHeader title="Tenants" />
        <WizardSectionBody>
          <WizardRow title="What it holds">
            <WizardRowBody>
              <Field
                as="record"
                name="tenants"
                label="Tenants"
                entity="organization"
                several
                standard="id"
                noun={{ one: "tenant", many: "tenants" }}
                options={TENANTS.map(tenantOption)}
                notice="A tenant picked from another organization moves: it leaves that organization's tenant groups, and whoever reached it through them loses that access."
              />
            </WizardRowBody>
            <WizardRowTips>
              <WizardRowTip>The tenants no organization holds yet are picked to begin with.</WizardRowTip>
            </WizardRowTips>
          </WizardRow>
        </WizardSectionBody>
      </WizardSection>
      <WizardSection>
        <WizardSectionHeader title="Starting setup" />
        <WizardSectionBody>
          <WizardRow title="Everything tenant group">
            <WizardRowBody>
              <Field as="choice" name="allGroup" label="Create a tenant group of all its tenants" options={YES_NO} />
            </WizardRowBody>
            <WizardRowTips>
              <WizardRowTip>It gives nobody access until an access group uses it.</WizardRowTip>
            </WizardRowTips>
          </WizardRow>
          <WizardRow title="From Northwind">
            <WizardRowBody>
              <Field as="choice" name="templates" label={`Copy access group templates and naming from ${model.name}`} options={YES_NO} />
              <Field as="choice" name="dashboard" label={`Copy the default dashboard from ${model.name}`} options={YES_NO} />
            </WizardRowBody>
            <WizardRowTips>
              <WizardRowTip>Copies only: no members come with them, and its admins can change both later.</WizardRowTip>
            </WizardRowTips>
          </WizardRow>
        </WizardSectionBody>
      </WizardSection>
    </Wizard>
  );
}

/**
 * A tenant group — made in a scope, or changed. It only says which tenants: it gives nobody access
 * until an access group uses it, and it cannot hold other groups.
 */
export function TenantGroupWizard({ id, scope: given }: { id?: string; scope?: string }) {
  const group = id ? tenantGroupById(id) : undefined;
  const scope = group?.scope ?? given ?? ORGANIZATIONS[0]!.id;
  const pool = tenantPool(scope, TENANTS);
  const leave = () => go(group ? tenantGroupHref(group.id) : platformHref("tenant-groups"));
  const taken = tenantGroups(scope)
    .filter((one) => one.id !== group?.id)
    .map((one) => one.name.toLowerCase());
  return (
    <Wizard
      {...(group ? { editing: true as const } : {})}
      noun={{ one: "tenant group", many: "tenant groups" }}
      note={group ? `${scopeName(scope)} · ${group.tenants.length} tenants` : `In ${scopeName(scope)}. It gives nobody access until an access group uses it.`}
      onExit={leave}
      subject={(answers) => ({ kind: "organization", name: answers.name ?? "", meta: [scopeName(scope)] })}
      draft={{
        name: owed(group?.name ?? ""),
        description: group?.description ?? unanswered.text,
        region: group?.region ?? unanswered.text,
        tenants: (group?.tenants ?? []) as readonly string[],
        pasted: unanswered.longtext,
      }}
      // UNIQUE in its scope — two groups of one name are one too many to pick between.
      ready={(answers) => !taken.includes(String(answers.name ?? "").trim().toLowerCase())}
      onCommit={(answers) => {
        // Pasted ids join the picked ones, where they are tenants this group may hold.
        const pasted = String(answers.pasted ?? "")
          .split(/[\s,;]+/)
          .map((one) => one.trim().toUpperCase())
          .filter((one) => pool.some((tenant) => tenant.id === one));
        const saved = saveTenantGroup({
          id: group?.id,
          scope,
          name: answers.name.trim(),
          description: String(answers.description || ""),
          region: String(answers.region || "") || "—",
          tenants: [...new Set([...answers.tenants, ...pasted])],
        });
        go(tenantGroupHref(saved));
      }}
    >
      <WizardSection>
        <WizardSectionHeader title="Details" />
        <WizardSectionBody>
          <WizardRow title="Tenant group">
            <WizardRowBody>
              <Field as="text" name="name" label="Name" help="Unique in the organization — by region or function." />
              <Field as="text" name="description" label="Description" help="Shown in lists and when an access group picks it." />
              <Field as="text" name="region" label="Region" help="Used to filter lists. It does not affect access." />
            </WizardRowBody>
            <WizardRowTips>
              <WizardRowTip>
                {scope === ENTERPRISE_SCOPE
                  ? "An enterprise-level group can hold any organization's tenants."
                  : `Its tenants come only from ${scopeName(scope)}.`}
              </WizardRowTip>
            </WizardRowTips>
          </WizardRow>
        </WizardSectionBody>
      </WizardSection>
      <WizardSection>
        <WizardSectionHeader title="Tenants" />
        <WizardSectionBody>
          <WizardRow title="Which tenants">
            <WizardRowBody>
              <Field
                as="record"
                name="tenants"
                label="Tenants"
                entity="organization"
                several
                standard="id"
                noun={{ one: "tenant", many: "tenants" }}
                options={pool.map(tenantOption)}
                help="A tenant can sit in any number of groups."
              />
              <Field as="longtext" name="pasted" label="Import tenant IDs" help="Paste IDs one per line or separated by commas — they join the picked ones." />
            </WizardRowBody>
            <WizardRowTips>
              <WizardRowTip>
                Groups cannot hold other groups. To cover two regions, make a group that lists both sets of tenants.
                {group ? " Tenants added give access to everyone in its access groups; tenants removed take it away within a minute." : ""}
              </WizardRowTip>
            </WizardRowTips>
          </WizardRow>
        </WizardSectionBody>
      </WizardSection>
    </Wizard>
  );
}

/**
 * An access group — made in a scope, changed, or duplicated to be retargeted. One set of
 * permissions, on the tenants of its tenant groups, for its members: a template sets every
 * permission at once, and Custom sets each.
 */
export function AccessGroupWizard({ id, scope: given, target, duplicate }: { id?: string; scope?: string; target?: string; duplicate?: boolean }) {
  const source = id ? accessGroupById(id) : undefined;
  const editing = Boolean(source) && !duplicate;
  const scope = source?.scope ?? given ?? ORGANIZATIONS[0]!.id;
  const offered = scope === ENTERPRISE_SCOPE ? tenantGroups() : tenantGroups(scope);
  const org = orgById(scope);
  const leave = () => go(source ? accessGroupHref(source.id) : platformHref("access-groups"));
  const template = source ? (templateOf(source.perms)?.key ?? "custom") : "custom";

  const levels = Object.fromEntries(GUARDS.map((guard) => [guard.key, owed(String(source?.perms[guard.key] ?? 0))]));

  return (
    <Wizard
      {...(editing ? { editing: true as const } : {})}
      noun={{ one: "access group", many: "access groups" }}
      note={
        editing
          ? `${scopeName(scope)} · ${source!.members.length} members`
          : duplicate
            ? `A copy of ${source!.name}: the same permissions, to be given new tenant groups and members.`
            : `In ${scopeName(scope)}. Every member gets exactly these permissions on every tenant it applies to.`
      }
      onExit={leave}
      subject={(answers) => ({ kind: "organization", name: answers.name ?? "", meta: [scopeName(scope)] })}
      draft={{
        name: owed(source ? (duplicate ? `${source.name} (copy)` : source.name) : ""),
        description: source?.description ?? unanswered.text,
        template: owed(template),
        ...levels,
        targets: (editing ? source!.targets : target ? [target] : []) as readonly string[],
        members: [] as readonly string[],
        ends: owed("none"),
      }}
      // A NAME, a permission and a tenant group: a group giving nothing, or nowhere, is no group.
      ready={(answers) => {
        const fromTemplate = answers.template && answers.template !== "custom";
        const anyLevel = GUARDS.some((guard) => String((answers as Record<string, unknown>)[guard.key]) !== "0");
        return (fromTemplate || anyLevel) && (answers.targets?.length ?? 0) > 0;
      }}
      onCommit={(answers) => {
        const all = answers as unknown as Record<string, string>;
        const chosen = TEMPLATES.find((one) => one.key === answers.template);
        const perms: Permissions = chosen
          ? { ...chosen.perms }
          : Object.fromEntries(
              GUARDS.map((guard): [Guard, Level] => [guard.key, Number(all[guard.key]) as Level]).filter(([, level]) => level > 0),
            );
        const kept = editing ? source!.members : [];
        const known = new Set(kept.map((one) => one.personId));
        const added = answers.members.filter((pid) => !known.has(pid)).map((personId) => ({ personId, ends: endValue(answers.ends) }));
        const saved = saveAccessGroup({
          id: editing ? source!.id : undefined,
          scope,
          name: answers.name.trim(),
          description: String(answers.description || ""),
          perms,
          targets: answers.targets,
          members: [...kept, ...added],
        });
        go(accessGroupHref(saved));
      }}
    >
      <WizardSection>
        <WizardSectionHeader title="Details" />
        <WizardSectionBody>
          <WizardRow title="Access group">
            <WizardRowBody>
              <Field as="text" name="name" label="Name" help={org ? `Region, then function — ${org.defaults.naming}.` : "Region, then function."} />
              <Field as="text" name="description" label="Description" help="What this group is for." />
            </WizardRowBody>
            <WizardRowTips>
              <WizardRowTip>
                {scope === ENTERPRISE_SCOPE
                  ? "An enterprise-level group can apply to any organization's tenant groups."
                  : `Its tenant groups and members come from ${scopeName(scope)}.`}
              </WizardRowTip>
            </WizardRowTips>
          </WizardRow>
        </WizardSectionBody>
      </WizardSection>
      <WizardSection>
        <WizardSectionHeader title="Permissions" />
        <WizardSectionBody>
          <WizardRow title="Template">
            <WizardRowBody>
              <Field
                as="choice"
                name="template"
                label="Template"
                noun={{ one: "template", many: "templates" }}
                options={templateOptions}
                help="A template sets every permission. Pick Custom to set each one below."
              />
            </WizardRowBody>
            <WizardRowTips>
              {TEMPLATES.map((one) => (
                <WizardRowTip key={one.key} term={one.label}>
                  {GUARDS.filter((guard) => one.perms[guard.key])
                    .map((guard) => `${guard.label} ${LEVELS[one.perms[guard.key]!].toLowerCase()}`)
                    .join(", ")}
                  .
                </WizardRowTip>
              ))}
            </WizardRowTips>
          </WizardRow>
          {GUARDS.map((guard) => (
            <WizardRow key={guard.key} title={guard.label}>
              <WizardRowBody>
                <Field as="choice" name={guard.key} label={guard.label} options={LEVEL_OPTIONS} help={guard.covers} />
              </WizardRowBody>
            </WizardRow>
          ))}
        </WizardSectionBody>
      </WizardSection>
      <WizardSection>
        <WizardSectionHeader title="Applies to" />
        <WizardSectionBody>
          <WizardRow title="Tenant groups">
            <WizardRowBody>
              <Field
                as="record"
                name="targets"
                label="Tenant groups"
                entity="organization"
                several
                noun={{ one: "tenant group", many: "tenant groups" }}
                options={offered.map((one) => ({ value: one.id, title: one.name, code: `${one.tenants.length} tenants` }))}
              />
            </WizardRowBody>
            <WizardRowTips>
              <WizardRowTip>
                Members get the permissions on every tenant in them. They never mix with another access group's across tenants.
              </WizardRowTip>
            </WizardRowTips>
          </WizardRow>
        </WizardSectionBody>
      </WizardSection>
      <WizardSection>
        <WizardSectionHeader title="Members" />
        <WizardSectionBody>
          <WizardRow title={editing ? "Add members" : "Members"}>
            <WizardRowBody>
              <Field
                as="record"
                name="members"
                label="People"
                entity="person"
                several
                noun={{ one: "person", many: "people" }}
                options={personOptions(peopleIn(scope).filter((one) => !source?.members.some((member) => member.personId === one.id) || !editing))}
                help={editing ? "Its members stay; those picked here join them. Remove one from its Members." : "It can be created empty."}
              />
              <Field as="choice" name="ends" label="Access ends" options={endOptions} help="For the members added here. An end date removes access by itself." />
            </WizardRowBody>
          </WizardRow>
        </WizardSectionBody>
      </WizardSection>
    </Wizard>
  );
}
