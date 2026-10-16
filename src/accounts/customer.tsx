import type { ReactNode } from "react";
import {
  Alert,
  Avatar,
  DetailPage,
  FactCard,
  Metadata,
  RecordIndex,
  type DetailFacet,
  type RecordNavProps,
  type ShellPlace,
} from "@revelator/pro-ui";

import {
  CUSTOMER_FACETS,
  accountsHref,
  customerHref,
  type CustomerFacet,
} from "../route";
import { RECORDS, customerById, type Customer, type CustomerRecord } from "./mock";

/**
 * One customer, as a record with facets.
 *
 * What the customer IS lives in the band and the Overview — who it is, the company, the contract.
 * What it HOLDS — subscriptions, contacts, tenants — is a facet each, because each is a set a
 * reader pages through and adds to.
 */
export function CustomerDetail({ id, facet }: { id: string; facet: CustomerFacet }) {
  const customer = customerById(id);
  const record = RECORDS[customer.id]!;

  // EVERY facet but the landing one names itself. Adding a subscription or a tenant is the
  // band's, which stands over every facet; a facet repeating it would draw the same command twice.
  const FACETS: Record<CustomerFacet, { header?: DetailFacet; body: ReactNode }> = {
    Overview: { body: <CustomerOverview customer={customer} record={record} /> },
    Subscriptions: {
      header: { name: "Subscriptions" },
      body: <CustomerSubscriptions customer={customer} />,
    },
    Contacts: {
      header: { name: "Contacts", actions: [{ label: "Add contact", creates: true }] },
      body: <CustomerContacts record={record} />,
    },
    Tenants: {
      header: { name: "Tenants" },
      body: <CustomerTenants record={record} />,
    },
  };
  const shown = FACETS[facet];

  return (
    <DetailPage
      record={{
        // SQUARE, the same mark the index's row wears, so the row pressed and the band landed on
        // are plainly one thing.
        mark: <Avatar kind="organization" name={customer.name} />,
        name: customer.name,
        facts: [
          { identifier: customer.id, standard: "id" },
          { identifier: record.stripe, standard: "id" },
          { as: "date", value: customer.created },
        ],
        actions: [
          { label: "Add subscription" },
          { label: "Sign up new tenant", primary: true },
        ],
        more: [{ label: "Edit customer" }, { label: "Open in Stripe" }],
      }}
      facet={shown.header}
    >
      {shown.body}
    </DetailPage>
  );
}

/**
 * What the customer is: the next step where one is owed, then the company and the contract.
 *
 * The next step is an ALERT and not a fact, because it is the one thing on the page to act on:
 * no tenant can be signed up until a subscription is linked.
 */
function CustomerOverview({ customer, record }: { customer: Customer; record: CustomerRecord }) {
  const linked = customer.subscriptions.length > 0;
  return (
    <Metadata>
      {!linked ? (
        <Alert intent="warn" title="Add the subscription">
          No tenant can be signed up until this customer has a subscription linked.
        </Alert>
      ) : record.tenants.length === 0 ? (
        <Alert intent="info" title="Ready for a tenant">
          The subscription is linked. Sign up the tenant next.
        </Alert>
      ) : null}
      <FactCard
        title="Company"
        facts={[
          { label: "Company name", value: customer.name },
          { label: "Email", value: customer.email },
          { label: "Phone", value: record.phone },
          { label: "Address", value: record.address },
          { label: "Country", value: record.country },
          { label: "Tax ID type", value: record.taxType },
          { label: "Tax ID", value: record.taxId },
          { label: "Customer type", value: customer.type },
          { label: "New or existing", value: record.newCustomer ? "New" : "Existing" },
          { label: "Comment", value: record.comment },
        ]}
      />
      <FactCard
        title="Distribution contract"
        facts={[
          { label: "DSP rate", as: "percent", value: customer.dspRate },
          { label: "UGC rate", as: "percent", value: record.ugcRate },
          { label: "YouTube channel rate", as: "percent", value: record.youtubeRate },
          { label: "Miscellaneous charges", as: "money", value: record.misc },
        ]}
      />
    </Metadata>
  );
}

/** The subscriptions linked to the customer, each a Stripe subscription. */
function CustomerSubscriptions({ customer }: { customer: Customer }) {
  return (
    <RecordIndex
      rows={customer.subscriptions}
      rowKey={(one) => one.id}
      noun={{ one: "subscription", many: "subscriptions" }}
      identity={{ title: "Product", name: (one) => one.product }}
      columns={[
        { name: "Subscription ID", as: "identifier", standard: "id", value: (one) => one.id },
        {
          name: "Kind",
          value: (one) => (one.sandbox ? "Sandbox" : "Live"),
          cell: (one) => (one.sandbox ? "Sandbox" : "Live"),
        },
      ]}
      chooser={false}
      empty={{ holder: "this customer", line: true }}
    />
  );
}

/** Who at the customer Revelator writes to. */
function CustomerContacts({ record }: { record: CustomerRecord }) {
  return (
    <RecordIndex
      rows={record.contacts}
      rowKey={(one) => one.email}
      noun={{ one: "contact", many: "contacts" }}
      identity={{
        title: "Name",
        name: (one) => one.name,
        mark: (one) => <Avatar kind="person" name={one.name} />,
      }}
      columns={[
        { name: "Email", value: (one) => one.email, cell: (one) => one.email },
        { name: "Phone", value: (one) => one.phone ?? "", cell: (one) => one.phone },
        { name: "Roles", value: (one) => one.roles.join(", "), cell: (one) => one.roles.join(", ") },
      ]}
      chooser={false}
      empty={{ holder: "this customer", line: true }}
    />
  );
}

/** The tenants signed up under the customer, newest first. */
function CustomerTenants({ record }: { record: CustomerRecord }) {
  return (
    <RecordIndex
      rows={record.tenants}
      rowKey={(one) => one.enterpriseId}
      noun={{ one: "tenant", many: "tenants" }}
      identity={{
        title: "Name",
        name: (one) => one.name,
        mark: (one) => <Avatar kind="organization" name={one.name} />,
      }}
      sort={{ column: "Created", direction: "descending" }}
      columns={[
        { name: "Enterprise ID", as: "identifier", standard: "id", value: (one) => one.enterpriseId },
        { name: "Plan", value: (one) => one.plan, cell: (one) => one.plan },
        {
          name: "Environment",
          value: (one) => (one.sandbox ? "Demo or sandbox" : "Production"),
          cell: (one) => (one.sandbox ? "Demo or sandbox" : "Production"),
        },
        { name: "Created", as: "date", value: (one) => one.created },
      ]}
      chooser={false}
      empty={{ holder: "this customer", line: true }}
    />
  );
}

/** The customer's facets, and the way back to the customers. */
function customerNav({ id, facet }: { id: string; facet: CustomerFacet }): RecordNavProps<CustomerFacet> {
  return {
    back: { index: "Customers", opens: accountsHref("customers") },
    facets: CUSTOMER_FACETS,
    at: facet,
    addressOf: (one) => customerHref(id, one),
  };
}

/** Where one customer's page is: its facets, and a trail that reaches past the index to it. */
export const customerPlace = ({ id, facet }: { id: string; facet: CustomerFacet }): ShellPlace => {
  const customer = customerById(id);
  return {
    at: "Accounts",
    page: customer.name,
    record: customerNav({ id, facet }),
    trail: [
      { label: "Accounts", opens: accountsHref("customers") },
      { label: "Customers", opens: accountsHref("customers") },
      { label: customer.name },
    ],
  };
};
