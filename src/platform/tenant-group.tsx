import type { ReactNode } from "react";
import {
  Alert,
  DetailPage,
  RecordIndex,
  type DetailFacet,
  type RecordNavProps,
  type ShellPlace,
} from "@revelator/pro-ui";

import {
  AddPeopleToTenantGroup,
  AddTenants,
  AddToAccessGroup,
  AddToTenantGroup,
  ArchiveTenantGroups,
  RemoveTenants,
  groupMark,
  personMark,
  regionMark,
  tenantGroupMark,
  tenantPool,
} from "./dialogs";
import { accessGroupIndex } from "./indexes";
import {
  TENANTS,
  accessGroupsOf,
  accessGroupsUsing,
  lastActiveRank,
  peopleWithAccess,
  personById,
  scopeName,
  tenantById,
  tenantGroupById,
  tenantGroups,
  tenantGroupsOf,
} from "./mock";
import {
  TENANT_GROUP_FACETS,
  editTenantGroupHref,
  go,
  newAccessGroupHref,
  personHref,
  platformHref,
  tenantGroupHref,
  type TenantGroupFacet,
} from "./route";

/** The tenant group the address names, or the first. */
const groupOf = (id: string) => tenantGroupById(id) ?? tenantGroups()[0]!;

/**
 * One tenant group, as a record: the tenants it lists, the access groups that give permissions on
 * them, and everyone who reaches them that way. On its own it gives nobody anything.
 */
export function TenantGroupDetail({ id, facet }: { id: string; facet: TenantGroupFacet }) {
  const group = groupOf(id);
  const tenants = group.tenants.map((tid) => tenantById(tid)).filter((one) => one !== undefined);
  const usedBy = accessGroupsUsing(group.id);
  const people = peopleWithAccess(group.id).map((pid) => personById(pid)).filter((one) => one !== undefined);
  const pool = tenantPool(group.scope, TENANTS);

  const FACETS: Record<TenantGroupFacet, { header?: DetailFacet; body: ReactNode }> = {
    Tenants: {
      header: { name: "Tenants", actions: [{ label: "Add tenants", creates: true, dialog: <AddTenants group={group} pool={pool} /> }] },
      body: (
        <RecordIndex
          rows={tenants}
          rowKey={(one) => one.id}
          noun={{ one: "tenant", many: "tenants" }}
          identity={{ title: "Tenant", name: (one) => one.name, mark: (one) => groupMark(one), sortable: true }}
          sort={{ column: "Tenant", direction: "ascending" }}
          searchBy={["Tenant", "Tenant ID"]}
          note={
            usedBy.length ? undefined : (
              <Alert intent="warn" title="Not used by an access group">
                Nobody reaches these tenants through it until an access group uses it.
              </Alert>
            )
          }
          columns={[
            { name: "Tenant ID", as: "identifier", standard: "id", value: (one) => one.id },
            { name: "Territory", value: (one) => one.country, cell: (one) => one.country },
            {
              name: "Also in",
              as: "entities",
              value: (one) => tenantGroupsOf(one.id).filter((tg) => tg.id !== group.id && tg.scope === group.scope).map((tg) => tg.name),
              noun: { one: "tenant group", many: "tenant groups" },
              entity: "organization",
            },
          ]}
          selection={(held) => [
            { label: "Add to access group", dialog: <AddToAccessGroup group={group} tenants={held} /> },
            { label: "Add to tenant group", dialog: <AddToTenantGroup group={group} tenants={held} /> },
            { label: "Remove from this group", destructive: true, dialog: <RemoveTenants group={group} tenants={held} /> },
          ]}
          chooser={false}
          empty={{ holder: "this tenant group", line: true }}
        />
      ),
    },
    "Access groups": {
      header: {
        name: "Access groups",
        actions: [{ label: "New access group", creates: true, opens: newAccessGroupHref(group.scope, group.id) }],
      },
      body: (
        <RecordIndex
          {...accessGroupIndex({ tgId: group.id })}
          chooser={false}
          empty={{ none: "No access group uses this tenant group: nobody reaches its tenants through it.", line: true }}
        />
      ),
    },
    "People with access": {
      header: { name: "People with access", actions: [{ label: "Add people", creates: true, dialog: <AddPeopleToTenantGroup group={group} /> }] },
      body: (
        <RecordIndex
          rows={people}
          rowKey={(one) => one.id}
          noun={{ one: "person", many: "people" }}
          identity={{ title: "Person", name: (one) => one.name, mark: (one) => personMark(one), sortable: true, opens: (one) => personHref(one.id) }}
          sort={{ column: "Person", direction: "ascending" }}
          columns={[
            { name: "Email", value: (one) => one.email, cell: (one) => one.email },
            {
              name: "Through",
              as: "entities",
              value: (one) => accessGroupsOf(one.id).filter((ag) => ag.targets.includes(group.id)).map((ag) => ag.name),
              noun: { one: "access group", many: "access groups" },
              entity: "organization",
            },
            { name: "Last active", value: (one) => lastActiveRank(one.lastActive), cell: (one) => one.lastActive },
          ]}
          chooser={false}
          empty={{ none: "Nobody has access through this group: they get it by joining an access group that uses it.", line: true }}
        />
      ),
    },
  };
  const shown = FACETS[facet];

  return (
    <DetailPage
      record={{
        mark: tenantGroupMark(group),
        name: group.name,
        kind: "Tenant group",
        facts: [
          { text: scopeName(group.scope) },
          { as: "count", value: group.tenants.length, noun: { one: "tenant", many: "tenants" } },
          { text: group.region, mark: regionMark(group.region) },
          { text: `Changed ${group.changed}` },
        ],
        actions: [{ label: "Edit tenant group", opens: editTenantGroupHref(group.id) }],
        more: [
          { label: "New access group on this group", opens: newAccessGroupHref(group.scope, group.id) },
          {
            label: "Archive",
            destructive: true,
            dialog: <ArchiveTenantGroups groups={[group]} after={() => go(platformHref("tenant-groups"))} />,
          },
        ],
      }}
      facet={shown.header}
    >
      {shown.body}
    </DetailPage>
  );
}

export const tenantGroupPlace = ({ id, facet }: { id: string; facet: TenantGroupFacet }): ShellPlace => {
  const group = groupOf(id);
  const nav: RecordNavProps<TenantGroupFacet> = {
    back: { index: "Tenant groups", opens: platformHref("tenant-groups") },
    facets: TENANT_GROUP_FACETS,
    at: facet,
    addressOf: (one) => tenantGroupHref(group.id, one),
  };
  return {
    at: "Tenant groups",
    page: group.name,
    record: nav,
    trail: [
      { label: "Tenant groups", opens: platformHref("tenant-groups") },
      { label: group.name },
    ],
  };
};
