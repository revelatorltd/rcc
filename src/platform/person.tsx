import { useMemo, type ReactNode } from "react";
import {
  Alert,
  DetailPage,
  RecordIndex,
  type DetailFacet,
  type IndexColumn,
  type RecordNavProps,
  type ShellPlace,
} from "@revelator/pro-ui";

import { AddPeople, AddToGroup, RemoveFromAll, RemoveMember, groupMark, personMark, scopedMark, tenantGroupLogo } from "./dialogs";
import {
  GUARDS,
  LEVELS,
  PEOPLE,
  accessGroupsOf,
  effectiveAccess,
  endLabel,
  orgById,
  permissionsSaid,
  personById,
  tenantGroupById,
  tenantsOfTargets,
  type Reach,
} from "./mock";
import { PERSON_FACETS, accessGroupHref, personHref, platformHref, type PersonFacet } from "./route";

/** The person the address names, or the first. */
const personOf = (id: string) => personById(id) ?? PEOPLE[0]!;

/**
 * One person, as a record: the access groups they belong to, and what those come to tenant by
 * tenant — each guard at the highest level any group gave, with the group that gave it.
 * Permissions never mix across tenants: what one group gives stays on its own tenants.
 */
export function PersonDetail({ id, facet }: { id: string; facet: PersonFacet }) {
  const person = personOf(id);
  const groups = accessGroupsOf(person.id);
  const reach = useMemo(() => effectiveAccess(person.id), [person, groups]);
  // Only the guards they hold somewhere: a column of No access everywhere says nothing.
  const held = GUARDS.filter((guard) => reach.some((one) => one.levels[guard.key]));
  const first = person.name.split(" ")[0];

  const guardColumns: IndexColumn<Reach>[] = held.map((guard) => ({
    name: guard.label,
    value: (one) => one.levels[guard.key]?.level ?? 0,
    cell: (one) => {
      const level = one.levels[guard.key];
      return level ? `${LEVELS[level.level]} · ${level.from.join(", ")}` : undefined;
    },
  }));

  const FACETS: Record<PersonFacet, { header?: DetailFacet; body: ReactNode }> = {
    "Access groups": {
      header: { name: "Access groups", actions: [{ label: "Add to access group", creates: true, dialog: <AddToGroup people={[person]} /> }] },
      body: (
        <RecordIndex
          rows={groups}
          rowKey={(one) => one.id}
          noun={{ one: "access group", many: "access groups" }}
          identity={{ title: "Access group", name: (one) => one.name, mark: (one) => scopedMark(one), opens: (one) => accessGroupHref(one.id) }}
          columns={[
            {
              name: "Applies to",
              as: "entities",
              value: (one) => one.targets.map((tid) => tenantGroupById(tid)?.name ?? tid),
              noun: { one: "tenant group", many: "tenant groups" },
              entity: "organization",
              picture: tenantGroupLogo,
            },
            { name: "Permissions", value: (one) => permissionsSaid(one.perms), cell: (one) => permissionsSaid(one.perms) },
            {
              name: "Access ends",
              value: (one) => one.members.find((member) => member.personId === person.id)?.ends || "9999",
              cell: (one) => endLabel(one.members.find((member) => member.personId === person.id)?.ends ?? ""),
            },
          ]}
          commands={(one) => [{ label: "Remove from group", destructive: true, dialog: <RemoveMember group={one} person={person} /> }]}
          chooser={false}
          empty={{ none: "No access yet: in no access group, they see no tenants.", line: true }}
        />
      ),
    },
    "Effective access": {
      header: { name: "Effective access", more: [{ label: "Export" }] },
      body: (
        <RecordIndex
          rows={reach}
          rowKey={(one) => one.tenant.id}
          noun={{ one: "tenant", many: "tenants" }}
          identity={{ title: "Tenant", name: (one) => one.tenant.name, mark: (one) => groupMark(one.tenant), sortable: true }}
          note={
            groups.length > 1 ? (
              <Alert intent="info" title="No mixing across tenants">
                What one access group gives {first} stays on its own tenants. A Finance viewer on one tenant group is not one on
                another, whatever else {first} holds there.
              </Alert>
            ) : undefined
          }
          searchBy={["Tenant"]}
          columns={[
            { name: "Through", value: (one) => one.through.name, cell: (one) => one.through.name },
            ...guardColumns,
          ]}
          filters={[
            {
              kind: "anyOf",
              key: "through",
              label: "Tenant group",
              options: [...new Set(reach.map((one) => one.through.name))],
              of: (one) => one.through.name,
            },
          ]}
          chooser={false}
          empty={{ none: "No access yet: in no access group, they see no tenants.", line: true }}
        />
      ),
    },
  };
  const shown = FACETS[facet];

  return (
    <DetailPage
      record={{
        mark: personMark(person),
        name: person.name,
        facts: [
          { text: person.email },
          { text: person.invited ? "Invited" : `Last active ${person.lastActive}` },
          { text: person.orgs.map((one) => orgById(one)?.name ?? one).join(", ") },
          { as: "count", value: tenantsOfTargets(groups.flatMap((one) => one.targets)).length, noun: { one: "tenant", many: "tenants" } },
        ],
        actions: [{ label: "Add to access group", dialog: <AddToGroup people={[person]} /> }],
        more: [
          { label: "Add to organization", dialog: <AddPeople personId={person.id} /> },
          groups.length
            ? { label: "Remove from all access groups", destructive: true, dialog: <RemoveFromAll people={[person]} /> }
            : { label: "Remove from all access groups", destructive: true, unavailable: "They are in no access group." },
        ],
      }}
      facet={shown.header}
    >
      {shown.body}
    </DetailPage>
  );
}

export const personPlace = ({ id, facet }: { id: string; facet: PersonFacet }): ShellPlace => {
  const person = personOf(id);
  const nav: RecordNavProps<PersonFacet> = {
    back: { index: "People", opens: platformHref("people") },
    facets: PERSON_FACETS,
    at: facet,
    addressOf: (one) => personHref(person.id, one),
  };
  return {
    at: "People",
    page: person.name,
    record: nav,
    trail: [
      { label: "People", opens: platformHref("people") },
      { label: person.name },
    ],
  };
};
