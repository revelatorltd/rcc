import type { ReactNode } from "react";
import {
  Avatar,
  DetailPage,
  FactCard,
  Link,
  Metadata,
  RecordIndex,
  type DetailFacet,
  type RecordNavProps,
  type ShellPlace,
} from "@revelator/pro-ui";

import { PAYEE_FACETS, accountsHref, enterpriseHref, payeeHref, tenantHref, userHref, type PayeeFacet } from "../route";
import { accounts, payeeById, payees } from "./mock";
import { EditSettingsChanges, EditTaxCountry, countryChip, payeeMark } from "./payees";

/** The payee the address names, or the first. */
const payeeOf = (id: string) => payeeById(id) ?? payees()[0]!;

/**
 * One payee, as a record: who it is, how it is paid and taxed, and the people who sign in to the
 * enterprise it pays. Where it stands is its enterprise's: a locked-out tenant's payee is locked too.
 */
export function PayeeDetail({ id, facet }: { id: string; facet: PayeeFacet }) {
  const payee = payeeOf(id);
  const enterprise = payee.enterprise;
  const enterpriseOpens = enterprise.tenant ? tenantHref(enterprise.enterpriseId) : enterpriseHref(enterprise.enterpriseId);
  // The people with access are the tenant's own; a client account's payee has none of its own.
  const users = enterprise.tenant
    ? accounts().filter((one) => one.memberships.some((each) => each.tenant.enterpriseId === enterprise.enterpriseId))
    : [];

  const FACETS: Record<PayeeFacet, { header?: DetailFacet; body: ReactNode }> = {
    Details: {
      body: (
        <Metadata>
          <FactCard
            title="Payee"
            facts={[
              { label: "Payee ID", value: payee.payeeId, standard: "id" },
              { label: "Name", value: payee.name },
              { label: "Contact", value: payee.contact },
              { label: "Email", value: payee.email },
              { label: "Currency", value: payee.currency },
              { label: "Minimum payment", as: "money", value: payee.minimumPayment, currency: payee.currency },
              { label: "Sends statements itself", value: payee.autoSendStatements ? "Yes" : "No" },
            ]}
          />
          <FactCard
            title="Tax and settings"
            facts={[
              { label: "Tax domicile country", value: payee.taxCountry ? countryChip(payee.taxCountry) : undefined },
              { label: "Payee settings changes allowed", value: payee.settingsAllowed ? "Yes" : "No" },
            ]}
          />
          <FactCard
            title="Enterprise"
            facts={[
              { label: "Enterprise", value: <Link opens={enterpriseOpens}>{enterprise.name}</Link> },
              { label: "Enterprise ID", value: enterprise.enterpriseId, standard: "id" },
              {
                label: "Paid by",
                value:
                  payee.payorId === payee.payeeId ? "Itself" : <Link opens={payeeHref(payee.payorId)}>{enterprise.parent?.name}</Link>,
              },
            ]}
          />
        </Metadata>
      ),
    },
    Users: {
      header: { name: "Users", more: [{ label: "Export" }] },
      body: (
        <RecordIndex
          rows={users}
          rowKey={(one) => one.userId}
          noun={{ one: "user", many: "users" }}
          identity={{
            title: "Name",
            name: (one) => one.name,
            mark: (one) => <Avatar kind="person" name={one.name} />,
            opens: (one) => userHref(one.userId),
          }}
          columns={[
            { name: "Email", value: (one) => one.email, cell: (one) => one.email },
            {
              name: "Role",
              value: (one) => (one.memberships.find((each) => each.tenant.enterpriseId === enterprise.enterpriseId)?.owner ? "Owner" : "Team member"),
              cell: (one) => (one.memberships.find((each) => each.tenant.enterpriseId === enterprise.enterpriseId)?.owner ? "Owner" : "Team member"),
            },
          ]}
          chooser={false}
          empty={{ holder: "this payee", line: true }}
        />
      ),
    },
  };
  const shown = FACETS[facet];

  return (
    <DetailPage
      record={{
        mark: payeeMark(payee),
        name: payee.name,
        status: `payee:${payee.status}`,
        facts: [{ identifier: payee.payeeId, standard: "id" }, { text: payee.currency }],
        actions: [{ label: "Edit tax domicile country", dialog: <EditTaxCountry payee={payee} /> }],
        more: [
          { label: "Edit settings changes", dialog: <EditSettingsChanges payee={payee} /> },
          { label: "Open enterprise", opens: enterpriseOpens },
          { label: "Transactions" },
        ],
      }}
      facet={shown.header}
    >
      {shown.body}
    </DetailPage>
  );
}

/** Where one payee's page is: its facets, and a trail that reaches past the index to it. */
export const payeePlace = ({ id, facet }: { id: string; facet: PayeeFacet }): ShellPlace => {
  const payee = payeeOf(id);
  const nav: RecordNavProps<PayeeFacet> = {
    back: { index: "Payees", opens: accountsHref("payees") },
    facets: PAYEE_FACETS,
    at: facet,
    addressOf: (one) => payeeHref(payee.payeeId, one),
  };
  return {
    at: "Accounts",
    page: payee.name,
    record: nav,
    trail: [
      { label: "Accounts", opens: accountsHref("customers") },
      { label: "Payees", opens: accountsHref("payees") },
      { label: payee.name },
    ],
  };
};
