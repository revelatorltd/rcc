import type { ReactNode } from "react";
import {
  Alert,
  DetailPage,
  RecordIndex,
  type DetailFacet,
  type RecordNavProps,
  type ShellPlace,
} from "@revelator/pro-ui";

import { AddMembers, ArchiveAccessGroups, RemoveMember, groupMark, personMark, regionFlag } from "./dialogs";
import {
  GUARDS,
  LEVELS,
  accessGroupById,
  accessGroups,
  endLabel,
  lastActiveRank,
  personById,
  scopeName,
  templateOf,
  tenantGroupById,
  tenantsOfTargets,
} from "./mock";
import {
  ACCESS_GROUP_FACETS,
  accessGroupHref,
  duplicateAccessGroupHref,
  editAccessGroupHref,
  go,
  personHref,
  platformHref,
  tenantGroupHref,
  type AccessGroupFacet,
} from "./route";

/** The access group the address names, or the first. */
const groupOf = (id: string) => accessGroupById(id) ?? accessGroups()[0]!;

/**
 * One access group, as a record: the one set of permissions it gives, the tenant groups it gives
 * them on, and the people who hold them. There are no per-person roles: different permissions on
 * the same tenants are another access group.
 */
export function AccessGroupDetail({ id, facet }: { id: string; facet: AccessGroupFacet }) {
  const group = groupOf(id);
  const targets = group.targets.map((tid) => tenantGroupById(tid)).filter((one) => one !== undefined);
  const members = group.members
    .map((member) => ({ member, person: personById(member.personId) }))
    .filter((one): one is { member: typeof one.member; person: NonNullable<typeof one.person> } => one.person !== undefined);

  const FACETS: Record<AccessGroupFacet, { header?: DetailFacet; body: ReactNode }> = {
    Permissions: {
      header: { name: "Permissions", actions: [{ label: "Edit access group", opens: editAccessGroupHref(group.id) }] },
      body: (
        <RecordIndex
          rows={GUARDS}
          rowKey={(one) => one.key}
          noun={{ one: "permission", many: "permissions" }}
          identity={{ title: "Permission", name: (one) => one.label }}
          note={
            members.length ? undefined : (
              <Alert intent="warn" title="No members">
                Nobody holds these permissions until people are added.
              </Alert>
            )
          }
          columns={[
            { name: "What it covers", value: (one) => one.covers, cell: (one) => one.covers },
            {
              name: "Level",
              value: (one) => group.perms[one.key] ?? 0,
              cell: (one) => LEVELS[group.perms[one.key] ?? 0],
            },
          ]}
          chooser={false}
        />
      ),
    },
    "Tenant groups": {
      header: { name: "Tenant groups", actions: [{ label: "Edit tenant groups", opens: editAccessGroupHref(group.id) }] },
      body: (
        <RecordIndex
          rows={targets}
          rowKey={(one) => one.id}
          noun={{ one: "tenant group", many: "tenant groups" }}
          identity={{ title: "Tenant group", name: (one) => one.name, mark: (one) => groupMark(one), opens: (one) => tenantGroupHref(one.id) }}
          columns={[
            {
              name: "Region",
              as: "entities",
              value: (one) => (one.region === "—" ? [] : [one.region]),
              noun: { one: "region", many: "regions" },
              entity: "place",
              picture: regionFlag,
            },
            { name: "Tenants", as: "count", value: (one) => one.tenants.length },
          ]}
          chooser={false}
          empty={{ none: "No tenant groups: its members see nothing until it applies to one.", line: true }}
        />
      ),
    },
    Members: {
      header: { name: "Members", actions: [{ label: "Add members", creates: true, dialog: <AddMembers group={group} /> }] },
      body: (
        <RecordIndex
          rows={members}
          rowKey={(one) => one.person.id}
          noun={{ one: "member", many: "members" }}
          identity={{
            title: "Person",
            name: (one) => one.person.name,
            mark: (one) => personMark(one.person),
            sortable: true,
            opens: (one) => personHref(one.person.id),
          }}
          sort={{ column: "Person", direction: "ascending" }}
          searchBy={["Person", "Email"]}
          columns={[
            { name: "Email", value: (one) => one.person.email, cell: (one) => one.person.email },
            { name: "Access ends", value: (one) => one.member.ends || "9999", cell: (one) => endLabel(one.member.ends) },
            { name: "Last active", value: (one) => lastActiveRank(one.person.lastActive), cell: (one) => one.person.lastActive },
          ]}
          commands={(one) => [{ label: "Remove from group", destructive: true, dialog: <RemoveMember group={group} person={one.person} /> }]}
          chooser={false}
          empty={{ none: "No members yet: add people to give them these permissions.", line: true }}
        />
      ),
    },
  };
  const shown = FACETS[facet];

  return (
    <DetailPage
      record={{
        mark: groupMark(group),
        name: group.name,
        kind: "Access group",
        facts: [
          { text: scopeName(group.scope) },
          // The template its permissions ARE, where they match one exactly.
          { text: templateOf(group.perms)?.label ?? "Custom" },
          { as: "count", value: tenantsOfTargets(group.targets).length, noun: { one: "tenant", many: "tenants" } },
          { as: "count", value: group.members.length, noun: { one: "member", many: "members" } },
        ],
        actions: [{ label: "Add members", dialog: <AddMembers group={group} /> }],
        more: [
          { label: "Edit access group", opens: editAccessGroupHref(group.id) },
          { label: "Duplicate and retarget", opens: duplicateAccessGroupHref(group.id) },
          {
            label: "Archive",
            destructive: true,
            dialog: <ArchiveAccessGroups groups={[group]} after={() => go(platformHref("access-groups"))} />,
          },
        ],
      }}
      facet={shown.header}
    >
      {shown.body}
    </DetailPage>
  );
}

export const accessGroupPlace = ({ id, facet }: { id: string; facet: AccessGroupFacet }): ShellPlace => {
  const group = groupOf(id);
  const nav: RecordNavProps<AccessGroupFacet> = {
    back: { index: "Access groups", opens: platformHref("access-groups") },
    facets: ACCESS_GROUP_FACETS,
    at: facet,
    addressOf: (one) => accessGroupHref(group.id, one),
  };
  return {
    at: "Access groups",
    page: group.name,
    record: nav,
    trail: [
      { label: "Access groups", opens: platformHref("access-groups") },
      { label: group.name },
    ],
  };
};
