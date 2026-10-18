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
import { payeeById, payees, usersOf } from "./mock";
import { RemoveAccess, SetOwner } from "./tenant-dialogs";
import { EditSettingsChanges, EditTaxCountry, countryChip, payeeMark } from "./payees";

const yesNo = (value: boolean) => (value ? "Yes" : "No");

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
  // The people with access are the tenant's own, its owner first; a client account's payee has none.
  const tenant = enterprise.tenant;
  const users = tenant ? usersOf(tenant) : [];

  const FACETS: Record<PayeeFacet, { header?: DetailFacet; body: ReactNode }> = {
    Details: {
      body: (
        <Metadata>
          <FactCard
            title="Payee"
            facts={[
              { label: "Payee ID", value: payee.payeeId, standard: "id" },
              { label: "Company name", value: payee.companyName },
              { label: "Is company", value: yesNo(payee.isCompany) },
              { label: "Role", value: payee.role },
              { label: "Last update", as: "date", value: payee.lastUpdated },
            ]}
          />
          <FactCard
            title="Contact"
            facts={[
              { label: "Contact ID", value: payee.contactId, standard: "id" },
              { label: "Name", value: payee.contact },
              { label: "Email address", value: payee.email },
            ]}
          />
          <FactCard
            title="Payments"
            facts={[
              {
                label: "Payment provider",
                value: payee.paymentProvider ? `${payee.paymentProvider.id} - ${payee.paymentProvider.name}` : undefined,
              },
              { label: "Payment user ID", value: payee.paymentUserId, standard: "id" },
              { label: "Currency", value: payee.currency },
              { label: "Minimum payment", as: "money", value: payee.minimumPayment, currency: payee.currency },
              { label: "Payment blocked", value: yesNo(payee.paymentBlocked) },
              { label: "Auto-sends statements", value: yesNo(payee.autoSendStatements) },
              { label: "Last statement sent", as: "date", value: payee.lastStatementSent },
            ]}
          />
          <FactCard
            title="Tax and settings"
            facts={[
              { label: "Tax domicile country", value: payee.taxCountry ? countryChip(payee.taxCountry) : undefined },
              { label: "Payee settings changes allowed", value: yesNo(payee.settingsAllowed) },
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
      header: { name: "Users", more: [{ label: "Download as CSV" }] },
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
            { name: "Username", value: (one) => one.email, cell: (one) => one.email },
            { name: "User ID", as: "identifier", standard: "id", value: (one) => one.userId },
            { name: "Role", value: (one) => (one.owner ? "Owner" : "Team member"), cell: (one) => (one.owner ? "Owner" : "Team member") },
          ]}
          commands={(one) => [
            // Signing in as them leaves RCC, which this rebuild does not model.
            { label: "Impersonate in V2" },
            { label: "Impersonate in API" },
            !tenant || one.owner
              ? { label: "Change ownership", unavailable: "They are the owner." }
              : { label: "Change ownership", dialog: <SetOwner tenant={tenant} user={one} /> },
            !tenant || one.owner
              ? { label: "Remove access", destructive: true, unavailable: "Make someone else the owner first." }
              : { label: "Remove access", destructive: true, dialog: <RemoveAccess tenant={tenant} user={one} /> },
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
