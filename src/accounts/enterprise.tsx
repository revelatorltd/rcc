import type { ReactNode } from "react";
import {
  Alert,
  DetailPage,
  FactCard,
  Link,
  Metadata,
  type DetailFacet,
  type RecordNavProps,
  type ShellPlace,
} from "@revelator/pro-ui";

import {
  ENTERPRISE_FACETS,
  accountsHref,
  enterpriseHref,
  tenantHref,
  type EnterpriseFacet,
} from "../route";
import { EnterprisePayees, EnterpriseUsers } from "./account-tables";
import { activityOf, activityPanel, impersonateClient } from "./activity";
import { editCommand, enterpriseMark } from "./enterprises";
import { enterpriseById, payees, usersOf, type Enterprise } from "./mock";

/** The enterprise the address names — a client account; anything else lands on the first one. */
const childOf = (id: string): Enterprise => {
  const found = enterpriseById(id);
  return found && !found.tenant ? found : enterprisesFirstChild();
};

const enterprisesFirstChild = () => payees().find((one) => !one.enterprise.tenant)!.enterprise;

/**
 * A client account — a child enterprise a parent tenant holds, as a record.
 *
 * Most of what it is, it takes from its parent: whether it is held back.
 * Its own are its name and its payee. A tenant opens on its own record, which holds far more.
 */
export function EnterpriseDetail({ id, facet }: { id: string; facet: EnterpriseFacet }) {
  const enterprise = childOf(id);
  const parent = enterprise.parent!;

  const FACETS: Record<EnterpriseFacet, { header?: DetailFacet; body: ReactNode }> = {
    Details: {
      body: (
        <Metadata>
          {enterprise.lockedOut ? (
            <Alert intent="danger" title="Locked out">
              {parent.lockedOut ? "Its parent is locked out, and n" : "N"}obody at this account can sign in until it is unlocked.
            </Alert>
          ) : null}
          {enterprise.paymentBlocked ? (
            <Alert intent="danger" title="Payment blocked">
              {parent.paymentBlocked ? "Its parent's payments are blocked, and t" : "T"}his account's payee is not paid until they are unblocked.
            </Alert>
          ) : null}
          <FactCard
            title="Enterprise"
            facts={[
              { label: "Parent enterprise", value: <Link opens={tenantHref(parent.enterpriseId)}>{parent.name}</Link> },
              { label: "Enterprise ID", value: enterprise.enterpriseId, standard: "id" },
              { label: "Payee ID", value: enterprise.payeeId, standard: "id" },
              { label: "Created", as: "date", value: enterprise.created },
            ]}
          />
        </Metadata>
      ),
    },
    Users: {
      header: { name: "Users", more: [{ label: "Download as CSV" }] },
      // Kept on its parent, which its portals let them into.
      body: <EnterpriseUsers tenant={parent} users={usersOf(parent).filter((one) => one.enterpriseId === enterprise.enterpriseId)} ownable={false} />,
    },
    Payees: {
      header: { name: "Payees", more: [{ label: "Download" }] },
      body: <EnterprisePayees rows={payees().filter((one) => one.enterprise.enterpriseId === enterprise.enterpriseId)} />,
    },
  };
  const shown = FACETS[facet];

  return (
    <DetailPage
      record={{
        mark: enterpriseMark(enterprise),
        name: enterprise.name,
        kind: "Client account",
        facts: [{ identifier: enterprise.enterpriseId, standard: "id" }],
        actions: [editCommand(enterprise)],
        more: [{ label: "Open parent", opens: tenantHref(parent.enterpriseId) }, impersonateClient(enterprise)],
        activity: activityPanel(activityOf("Client", enterprise.enterpriseId)),
      }}
      facet={shown.header}
    >
      {shown.body}
    </DetailPage>
  );
}

/** Where one client account's page is: its facets, and a trail that reaches past the index to it. */
export const enterprisePlace = ({ id, facet }: { id: string; facet: EnterpriseFacet }): ShellPlace => {
  const enterprise = childOf(id);
  const nav: RecordNavProps<EnterpriseFacet> = {
    back: { index: "Clients", opens: accountsHref("clients") },
    facets: ENTERPRISE_FACETS,
    at: facet,
    addressOf: (one) => enterpriseHref(enterprise.enterpriseId, one),
  };
  return {
    at: "Accounts",
    page: enterprise.name,
    record: nav,
    trail: [
      { label: "Accounts", opens: accountsHref("tenants") },
      { label: "Clients", opens: accountsHref("clients") },
      { label: enterprise.name },
    ],
  };
};
