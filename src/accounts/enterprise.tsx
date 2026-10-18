import type { ReactNode } from "react";
import {
  Alert,
  DetailPage,
  FactCard,
  Link,
  Metadata,
  RecordIndex,
  type DetailFacet,
  type RecordNavProps,
  type ShellPlace,
} from "@revelator/pro-ui";

import {
  ENTERPRISE_FACETS,
  accountsHref,
  customerHref,
  enterpriseHref,
  payeeHref,
  tenantHref,
  type EnterpriseFacet,
} from "../route";
import { editCommand, enterpriseMark } from "./enterprises";
import { customerOf, enterpriseById, payees, type Enterprise } from "./mock";

/** The enterprise the address names — a client account; anything else lands on the first one. */
const childOf = (id: string): Enterprise => {
  const found = enterpriseById(id);
  return found && !found.tenant ? found : enterprisesFirstChild();
};

const enterprisesFirstChild = () => payees().find((one) => !one.enterprise.tenant)!.enterprise;

/**
 * A client account — a child enterprise a parent tenant holds, as a record.
 *
 * Most of what it is, it takes from its parent: the plan, the customer, whether it is held back.
 * Its own are its name and its payee. A tenant opens on its own record, which holds far more.
 */
export function EnterpriseDetail({ id, facet }: { id: string; facet: EnterpriseFacet }) {
  const enterprise = childOf(id);
  const parent = enterprise.parent!;
  const customer = customerOf(parent);

  const FACETS: Record<EnterpriseFacet, { header?: DetailFacet; body: ReactNode }> = {
    Details: {
      body: (
        <Metadata>
          {enterprise.lockedOut ? (
            <Alert intent="danger" title="Locked out">
              Its parent is locked out, and nobody at this account can sign in until it is unlocked.
            </Alert>
          ) : null}
          {enterprise.paymentBlocked ? (
            <Alert intent="danger" title="Payment blocked">
              Its parent's payments are blocked, and this account's payee is not paid until they are unblocked.
            </Alert>
          ) : null}
          <FactCard
            title="Enterprise"
            facts={[
              { label: "Parent enterprise", value: <Link opens={tenantHref(parent.enterpriseId)}>{parent.name}</Link> },
              { label: "Customer", value: customer ? <Link opens={customerHref(customer.id)}>{customer.name}</Link> : undefined },
              { label: "Plan", value: enterprise.plan },
              { label: "Enterprise ID", value: enterprise.enterpriseId, standard: "id" },
              { label: "Payee ID", value: enterprise.payeeId, standard: "id" },
              { label: "Created", as: "date", value: enterprise.created },
            ]}
          />
        </Metadata>
      ),
    },
    Payees: {
      header: { name: "Payees" },
      body: (
        <RecordIndex
          rows={payees().filter((one) => one.enterprise.enterpriseId === enterprise.enterpriseId)}
          rowKey={(one) => one.payeeId}
          noun={{ one: "payee", many: "payees" }}
          identity={{ title: "Name", name: (one) => one.name, mark: (one) => enterpriseMark(one), opens: (one) => payeeHref(one.payeeId) }}
          columns={[
            { name: "Payee ID", as: "identifier", standard: "id", value: (one) => one.payeeId },
            { name: "Paid by", as: "identifier", standard: "id", value: (one) => one.payorId },
          ]}
          chooser={false}
          empty={{ holder: "this enterprise", line: true }}
        />
      ),
    },
  };
  const shown = FACETS[facet];

  return (
    <DetailPage
      record={{
        mark: enterpriseMark(enterprise),
        name: enterprise.name,
        kind: "Client account",
        facts: [{ identifier: enterprise.enterpriseId, standard: "id" }, { text: enterprise.plan }],
        actions: [editCommand(enterprise)],
        more: [{ label: "Open parent", opens: tenantHref(parent.enterpriseId) }],
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
    back: { index: "Enterprises", opens: accountsHref("enterprises") },
    facets: ENTERPRISE_FACETS,
    at: facet,
    addressOf: (one) => enterpriseHref(enterprise.enterpriseId, one),
  };
  return {
    at: "Accounts",
    page: enterprise.name,
    record: nav,
    trail: [
      { label: "Accounts", opens: accountsHref("customers") },
      { label: "Enterprises", opens: accountsHref("enterprises") },
      { label: enterprise.name },
    ],
  };
};
