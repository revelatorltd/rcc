import type { ReactNode } from "react";
import {
  Alert,
  DetailOverview,
  DetailOverviewGrid,
  DetailPage,
  FacetCard,
  FactCard,
  Metadata,
  RecordIndex,
  Slot,
  SlotItem,
  Text,
  TitledCard,
  WayOut,
  type DetailFacet,
  type RecordNavProps,
  type ShellPlace,
} from "@revelator/pro-ui";

import { AddOrgAdmin, AddPeople, EditDefaults, MoveTenant, RemoveOrgAdmin, groupMark, personMark } from "./dialogs";
import { accessGroupIndex, peopleIndex, tenantGroupIndex } from "./indexes";
import {
  ENTERPRISE,
  ORGANIZATIONS,
  PEOPLE,
  accessGroups,
  accessGroupsOf,
  accessGroupsUsing,
  orgById,
  personById,
  tenantGroups,
  tenantGroupsOf,
  tenantsOfOrg,
} from "./mock";
import {
  ORGANIZATION_FACETS,
  newAccessGroupHref,
  newTenantGroupHref,
  organizationHref,
  platformHref,
  type OrganizationFacet,
} from "./route";

/** The organization the address names, or the first. */
const orgOf = (id: string) => orgById(id) ?? ORGANIZATIONS[0]!;

/**
 * One organization, as a record. Its Overview reads what it holds and how healthy it is; its
 * tenant groups, access groups and people are its own indexes; its tenants, admins and defaults
 * are where it is run from. Being in it gives nobody data: only an access group does.
 */
export function OrganizationDetail({ id, facet }: { id: string; facet: OrganizationFacet }) {
  const org = orgOf(id);
  const tenants = tenantsOfOrg(org.id);
  const members = PEOPLE.filter((one) => one.orgs.includes(org.id));
  const groups = accessGroups(org.id);
  const unused = tenantGroups(org.id).filter((one) => accessGroupsUsing(one.id).length === 0);
  const ungranted = members.filter((one) => !accessGroupsOf(one.id).some((ag) => ag.scope === org.id));
  const ending = groups.reduce((sum, one) => sum + one.members.filter((member) => member.ends).length, 0);

  const FACETS: Record<OrganizationFacet, { header?: DetailFacet; body: ReactNode }> = {
    Overview: {
      body: (
        <DetailOverview>
          <DetailOverviewGrid>
            <FacetCard
              title="Tenant groups"
              count={tenantGroups(org.id).length}
              opens={organizationHref(org.id, "Tenant groups")}
              figures={[
                { label: "In use", as: "count", value: tenantGroups(org.id).length - unused.length },
                { label: "Not used yet", as: "count", value: unused.length },
              ]}
            />
            <FacetCard
              title="People"
              count={members.length}
              opens={organizationHref(org.id, "People")}
              figures={[
                { label: "In an access group", as: "count", value: members.length - ungranted.length },
                { label: "In none", as: "count", value: ungranted.length },
              ]}
            />
            <FacetCard
              title="Tenants"
              count={tenants.length}
              opens={organizationHref(org.id, "Tenants")}
              figures={[{ label: "In no tenant group", as: "count", value: tenants.filter((one) => tenantGroupsOf(one.id).length === 0).length }]}
            />
            <TitledCard title="Access groups" count={groups.length} trail={<WayOut opens={organizationHref(org.id, "Access groups")} />}>
              <Slot layout="list">
                {groups.slice(0, 5).map((one) => (
                  <SlotItem key={one.id}>
                    {groupMark(one)}
                    <Text kind="title">{one.name}</Text>
                  </SlotItem>
                ))}
              </Slot>
            </TitledCard>
            {/* HEALTH, read as figures: what an admin of the enterprise looks at first. */}
            <FacetCard
              title="Health checks"
              figures={[
                {
                  label: "Organization admins",
                  as: "count",
                  value: org.admins.length,
                  marks: org.admins.length ? [] : [{ intent: "warn", label: "No organization admin yet" }],
                },
                { label: "Tenant groups nobody uses", as: "count", value: unused.length },
                {
                  label: "People in no access group",
                  as: "count",
                  value: ungranted.length,
                  marks: ungranted.length ? [{ intent: "warn", label: "They see none of its data" }] : [],
                },
                { label: "Memberships with an end date", as: "count", value: ending },
              ]}
            />
          </DetailOverviewGrid>
        </DetailOverview>
      ),
    },
    "Tenant groups": {
      header: { name: "Tenant groups", actions: [{ label: "New tenant group", creates: true, opens: newTenantGroupHref(org.id) }] },
      body: <RecordIndex {...tenantGroupIndex(org.id)} chooser={false} empty={{ holder: org.name, line: true }} />,
    },
    "Access groups": {
      header: { name: "Access groups", actions: [{ label: "New access group", creates: true, opens: newAccessGroupHref(org.id) }] },
      body: <RecordIndex {...accessGroupIndex({ scope: org.id })} chooser={false} empty={{ holder: org.name, line: true }} />,
    },
    People: {
      header: { name: "People", actions: [{ label: "Add people", creates: true, dialog: <AddPeople orgId={org.id} /> }] },
      body: <RecordIndex {...peopleIndex(org.id)} chooser={false} empty={{ holder: org.name, line: true }} />,
    },
    Tenants: {
      header: { name: "Tenants" },
      body: (
        <RecordIndex
          rows={tenants}
          rowKey={(one) => one.id}
          noun={{ one: "tenant", many: "tenants" }}
          identity={{ title: "Tenant", name: (one) => one.name, mark: (one) => groupMark(one), sortable: true }}
          note={<Alert intent="info">Every tenant belongs to exactly one organization. Moving one changes who sees it, never what it holds.</Alert>}
          searchBy={["Tenant", "Tenant ID"]}
          columns={[
            { name: "Tenant ID", as: "identifier", standard: "id", value: (one) => one.id },
            { name: "Territory", value: (one) => one.country, cell: (one) => one.country },
            {
              name: "Tenant groups",
              as: "entities",
              value: (one) => tenantGroupsOf(one.id).filter((tg) => tg.scope === org.id).map((tg) => tg.name),
              noun: { one: "tenant group", many: "tenant groups" },
              entity: "organization",
            },
          ]}
          commands={(one) => [{ label: "Move", dialog: <MoveTenant tenant={one} /> }]}
          chooser={false}
          empty={{ holder: org.name, line: true }}
        />
      ),
    },
    Admins: {
      header: { name: "Admins", actions: [{ label: "Add organization admin", creates: true, dialog: <AddOrgAdmin org={org} /> }] },
      body: (
        <RecordIndex
          rows={org.admins.map((pid) => personById(pid)).filter((one) => one !== undefined)}
          rowKey={(one) => one.id}
          noun={{ one: "admin", many: "admins" }}
          identity={{ title: "Admin", name: (one) => one.name, mark: (one) => personMark(one) }}
          note={
            org.admins.length ? undefined : (
              <Alert intent="warn" title="No organization admin yet">
                Only enterprise admins can manage {org.name} until one is added.
              </Alert>
            )
          }
          columns={[
            { name: "Email", value: (one) => one.email, cell: (one) => (one.invited ? `Invited · ${one.email}` : one.email) },
            { name: "Also", value: (one) => (one.enterpriseAdmin ? "Enterprise admin" : ""), cell: (one) => (one.enterpriseAdmin ? "Enterprise admin" : undefined) },
          ]}
          commands={(one) => [{ label: "Remove", destructive: true, dialog: <RemoveOrgAdmin org={org} person={one} /> }]}
          chooser={false}
          empty={{ none: "No organization admin yet: only enterprise admins can manage it.", line: true }}
        />
      ),
    },
    Settings: {
      header: { name: "Settings", more: [{ label: "Edit defaults", dialog: <EditDefaults org={org} /> }] },
      body: (
        <Metadata>
          <FactCard
            title="Defaults for members"
            facts={[
              { label: "Home dashboard", value: org.defaults.home },
              { label: "Landing section", value: org.defaults.landing },
              { label: "Access group naming", value: org.defaults.naming },
            ]}
          />
          <FactCard
            title={`Shared with ${org.name}`}
            facts={[
              { label: "Saved reports", as: "count", value: org.shared.savedReports },
              { label: "Scheduled reports", as: "count", value: org.shared.scheduledReports },
              { label: "Access group templates", as: "count", value: org.shared.templates },
            ]}
          />
        </Metadata>
      ),
    },
  };
  const shown = FACETS[facet];

  return (
    <DetailPage
      record={{
        mark: groupMark(org),
        name: org.name,
        kind: "Organization",
        facts: [
          { text: org.code },
          { text: ENTERPRISE.name },
          { as: "count", value: tenantsOfOrg(org.id).length, noun: { one: "tenant", many: "tenants" } },
        ],
        actions: [{ label: "New access group", opens: newAccessGroupHref(org.id) }],
        more: [
          { label: "New tenant group", opens: newTenantGroupHref(org.id) },
          { label: "Add people", dialog: <AddPeople orgId={org.id} /> },
          { label: "Settings", opens: organizationHref(org.id, "Settings") },
        ],
      }}
      facet={shown.header}
    >
      {shown.body}
    </DetailPage>
  );
}

/** Where one organization's page is: its facets, and a trail back to the organizations. */
export const organizationPlace = ({ id, facet }: { id: string; facet: OrganizationFacet }): ShellPlace => {
  const org = orgOf(id);
  const nav: RecordNavProps<OrganizationFacet> = {
    back: { index: "Organizations", opens: platformHref("organizations") },
    facets: ORGANIZATION_FACETS,
    at: facet,
    addressOf: (one) => organizationHref(org.id, one),
  };
  return {
    at: "Platform admin",
    page: org.name,
    record: nav,
    trail: [
      { label: "Platform admin", opens: platformHref("organizations") },
      { label: "Organizations", opens: platformHref("organizations") },
      { label: org.name },
    ],
  };
};
