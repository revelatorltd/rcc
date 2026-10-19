import type { ReactNode } from "react";
import {
  Alert,
  DetailPage,
  FactCard,
  Link,
  Metadata,
  RecordIndex,
  type Command,
  type DetailFacet,
  type RecordNavProps,
  type ShellPlace,
} from "@revelator/pro-ui";

import { USER_FACETS, accountsHref, editUserHref, partnerHref, tenantHref, userHref, type UserFacet } from "../route";
import { accountById, accounts, partnerById, type Account, type Membership } from "./mock";
import { RemoveAccess, SetOwner } from "./tenant-dialogs";
import { tenantMark } from "./tenants";
import { generatePartnerUserId, userMark } from "./users";

/** The user the address names, or the first. */
const userOf = (id: string) => accountById(id) ?? accounts()[0]!;

/** The user as a tenant's dialogs take them — one person on one tenant. */
const onTenant = (user: Account, membership: Membership) => ({
  userId: user.userId,
  name: user.name,
  email: user.email,
  owner: membership.owner,
});

/**
 * One user, as a record: who they are, the API partner they belong to, and every enterprise they
 * sign in to — where their access is managed, as it is on the tenant.
 */
export function UserDetail({ id, facet }: { id: string; facet: UserFacet }) {
  const user = userOf(id);
  const partner = user.partnerId ? partnerById(user.partnerId) : undefined;
  const owesId = Boolean(user.partnerId) && !user.partnerUserId;

  const FACETS: Record<UserFacet, { header?: DetailFacet; body: ReactNode }> = {
    Details: {
      body: (
        <Metadata>
          {owesId ? (
            <Alert intent="warn" title="No partner user ID">
              The partner's API key does not work for this user until they have one.
            </Alert>
          ) : null}
          <FactCard
            title="User"
            facts={[
              { label: "User ID", value: user.userId, standard: "id" },
              { label: "Username", value: user.email },
              { label: "Name", value: user.name },
              { label: "Last login", as: "date", value: user.lastLogin ?? null },
              { label: "Created", as: "date", value: user.created },
            ]}
          />
          <FactCard
            title="API partner"
            facts={[
              { label: "Partner", value: partner ? <Link opens={partnerHref(partner.id)}>{partner.name}</Link> : undefined },
              { label: "Partner user ID", value: user.partnerUserId, standard: "id" },
            ]}
          />
        </Metadata>
      ),
    },
    Enterprises: {
      header: { name: "Enterprises", more: [{ label: "Export" }] },
      body: (
        <RecordIndex
          rows={user.memberships}
          rowKey={(one) => one.tenant.enterpriseId}
          noun={{ one: "enterprise", many: "enterprises" }}
          identity={{
            title: "Enterprise",
            name: (one) => one.tenant.name,
            mark: (one) => tenantMark(one.tenant),
            opens: (one) => tenantHref(one.tenant.enterpriseId, "Users"),
          }}
          columns={[
            { name: "Enterprise ID", as: "identifier", standard: "id", value: (one) => one.tenant.enterpriseId },
            { name: "Payee ID", as: "identifier", standard: "id", value: (one) => one.tenant.payeeId },
            { name: "Role", value: (one) => (one.owner ? "Owner" : "Team member"), cell: (one) => (one.owner ? "Owner" : "Team member") },
            { name: "Environment", value: (one) => one.tenant.environment, cell: (one) => one.tenant.environment },
          ]}
          commands={(one) => [
            one.owner
              ? { label: "Set as owner", unavailable: "They are the owner." }
              : { label: "Set as owner", dialog: <SetOwner tenant={one.tenant} user={onTenant(user, one)} /> },
            one.owner
              ? { label: "Remove access", destructive: true, unavailable: "Make someone else the owner first." }
              : { label: "Remove access", destructive: true, dialog: <RemoveAccess tenant={one.tenant} user={onTenant(user, one)} /> },
          ]}
          chooser={false}
          empty={{ holder: "this user", line: true }}
        />
      ),
    },
  };
  const shown = FACETS[facet];

  const more: Command[] = [
    ...(owesId ? [{ label: "Generate partner user ID", opens: generatePartnerUserId(user) }] : []),
    // Signing in as them leaves RCC, which this rebuild does not model.
    { label: "Impersonate" },
  ];

  return (
    <DetailPage
      record={{
        mark: userMark(user),
        name: user.name,
        facts: [{ identifier: user.userId, standard: "id" }, { text: user.email }],
        actions: [{ label: "Edit user", opens: editUserHref(user.userId) }],
        more,
      }}
      facet={shown.header}
    >
      {shown.body}
    </DetailPage>
  );
}

/** Where one user's page is: its facets, and a trail that reaches past the index to it. */
export const userPlace = ({ id, facet }: { id: string; facet: UserFacet }): ShellPlace => {
  const user = userOf(id);
  const nav: RecordNavProps<UserFacet> = {
    back: { index: "Users", opens: accountsHref("users") },
    facets: USER_FACETS,
    at: facet,
    addressOf: (one) => userHref(user.userId, one),
  };
  return {
    at: "Accounts",
    page: user.name,
    record: nav,
    trail: [
      { label: "Accounts", opens: accountsHref("tenants") },
      { label: "Users", opens: accountsHref("users") },
      { label: user.name },
    ],
  };
};
