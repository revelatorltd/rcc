import { CollectionPage } from "@revelator/pro-ui";

import { AddPeople } from "./dialogs";
import { accessGroupIndex, newGroupChoices, organizationIndex, peopleIndex, tenantGroupIndex } from "./indexes";
import { newAccessGroupHref, newOrganizationHref, newTenantGroupHref } from "./route";

/**
 * The organizations — each runs its own tenant groups, access groups and people, and every tenant
 * belongs to exactly one. A COLLECTION PAGE grown by a new organization.
 */
export function Organizations() {
  return (
    <CollectionPage
      title="Organizations"
      actions={[{ label: "New organization", primary: true, creates: true, opens: newOrganizationHref() }]}
      more={[{ label: "Export" }]}
      index={organizationIndex()}
    />
  );
}

/**
 * The tenant groups — tenants listed by region or function, giving nobody access until an access
 * group uses them. A new one is started IN a scope, so the action offers each.
 */
export function TenantGroups() {
  return (
    <CollectionPage
      title="Tenant groups"
      actions={[{ label: "New tenant group", primary: true, creates: true, choices: newGroupChoices(newTenantGroupHref) }]}
      more={[{ label: "Export" }]}
      index={tenantGroupIndex()}
    />
  );
}

/**
 * The access groups — each one set of permissions, on one or more tenant groups, for a list of
 * people. Started in a scope, as tenant groups are.
 */
export function AccessGroups() {
  return (
    <CollectionPage
      title="Access groups"
      actions={[{ label: "New access group", primary: true, creates: true, choices: newGroupChoices((scope) => newAccessGroupHref(scope)) }]}
      more={[{ label: "Export" }]}
      index={accessGroupIndex()}
    />
  );
}

/**
 * Everyone in the enterprise, with the access groups they belong to. Being in an organization
 * gives nobody data on its own; adding people asks which organization.
 */
export function People() {
  return (
    <CollectionPage
      title="People"
      actions={[{ label: "Add people", primary: true, creates: true, dialog: <AddPeople /> }]}
      more={[{ label: "Export" }]}
      index={peopleIndex()}
    />
  );
}
