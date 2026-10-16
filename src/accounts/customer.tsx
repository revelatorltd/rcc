import type { ReactNode } from "react";
import {
  Alert,
  Avatar,
  Button,
  Chip,
  DetailOverview,
  DetailOverviewGrid,
  DetailOverviewTrends,
  DetailPage,
  EmptyState,
  FacetCard,
  FactCard,
  Metadata,
  RecordIndex,
  Slot,
  SlotItem,
  Text,
  TitledCard,
  TrendCard,
  WayOut,
  formatDate,
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
import { MONTHS, RECORDS, customerById, monthlyOf, type Customer, type CustomerRecord } from "./mock";

/**
 * One customer, as a record with facets.
 *
 * The band says WHO; every facet below it is a page of its own — the Details (the account, the
 * billing details, the contract), and the three sets the customer holds. The Overview reads none
 * of them in full: it is the recap, one tile per facet, each saying what it comes to and the way in.
 */
export function CustomerDetail({ id, facet }: { id: string; facet: CustomerFacet }) {
  const customer = customerById(id);
  const record = RECORDS[customer.id]!;
  const owed = customer.subscriptions.length === 0;

  // EVERY facet but the landing one names itself. Adding a subscription or a tenant is the
  // band's, which stands over every facet; a facet repeating it would draw the same command twice.
  const FACETS: Record<CustomerFacet, { header?: DetailFacet; body: ReactNode }> = {
    Overview: { body: <CustomerOverview customer={customer} record={record} /> },
    Details: {
      header: { name: "Details", more: [{ label: "Edit customer" }] },
      body: <CustomerDetails customer={customer} record={record} />,
    },
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
        status: `customer:${customer.status}`,
        facts: [
          { identifier: customer.id, standard: "id" },
          // ISSUED by Stripe and not by Revelator: the chip leads with the mark of the service it
          // belongs to, so the two codes side by side are not two of the same.
          { identifier: record.stripe, standard: "id", issuer: "stripe" },
          // WHO holds the contract — a client, an entity of Warner's, Revelator's own demo — in
          // place of the day it joined: it changes what every rate below it means.
          { text: customer.type },
        ],
        // ONE command stands out, and it is the step owed next: a customer with no subscription
        // can take no tenant, so it is offered the subscription; past that, the tenant. The other
        // waits in the overflow — and on the Overview, in the card of what is still missing.
        actions: [{ label: owed ? "Add subscription" : "Sign up new tenant", primary: true }],
        more: [
          { label: owed ? "Sign up new tenant" : "Add subscription" },
          { label: "Edit customer" },
          { label: "Open in Stripe" },
        ],
      }}
      facet={shown.header}
    >
      {shown.body}
    </DetailPage>
  );
}

/** The months the trends are read over, labelled as a monthly axis reads them. */
const LABELS = MONTHS.map((month) => formatDate(month, "month", { onAxis: true }));

/**
 * A country, as the flag it flies and its name — the way a country is drawn wherever it is a value.
 */
const country = (named: string) => (
  <Chip>
    <Avatar kind="place" name={named} />
    {named}
  </Chip>
);

/**
 * The recap: one tile per facet, each with what it comes to and the way into it.
 *
 * Over the tiles, how what the customer is worth has moved. A facet with nothing in it yet is not a tile of
 * zeros but an empty card holding what starts it — the subscription, then the first tenant — so
 * the next step owed stands where its absence is read.
 */
function CustomerOverview({ customer, record }: { customer: Customer; record: CustomerRecord }) {
  const live = customer.subscriptions.filter((one) => !one.sandbox).length;
  const sandboxes = customer.subscriptions.length - live;
  const production = record.tenants.filter((one) => !one.sandbox).length;
  const owed = customer.subscriptions.length === 0;
  return (
    <DetailOverview>
      {/* How what the customer is worth has MOVED: what Revelator earned from it and what its
          catalogue earned, two cards read one against the other over the same months. */}
      <DetailOverviewTrends>
        <TrendCard
          metric="Revelator Revenue"
          period="Last 12 Months"
          labels={LABELS}
          values={monthlyOf(record.revelatorRevenue)}
        />
        <TrendCard
          metric="Client Revenue"
          period="Last 12 Months"
          labels={LABELS}
          values={monthlyOf(record.clientRevenue)}
        />
      </DetailOverviewTrends>
      <DetailOverviewGrid>
        <FacetCard
          title="Details"
          opens={customerHref(customer.id, "Details")}
          facts={[
            { label: "Customer type", value: customer.type },
            { label: "Country", value: country(record.country) },
            { label: "New or existing", value: record.newCustomer ? "New" : "Existing" },
          ]}
        />
        <FacetCard
          title="Distribution contract"
          opens={customerHref(customer.id, "Details")}
          figures={[
            { label: "DSP", as: "percent", value: customer.dspRate },
            { label: "UGC", as: "percent", value: record.ugcRate },
            { label: "YouTube channel", as: "percent", value: record.youtubeRate },
          ]}
        />
        {/* EMPTY, the card offers what starts it — the one way out of its emptiness — rather
            than a row of zeros nobody acts on. */}
        {owed ? (
          <TitledCard title="Subscriptions">
            <Slot layout="empty">
              <EmptyState title="No subscription yet" detail="No tenant can be signed up until one is linked.">
                <Button>Add subscription</Button>
              </EmptyState>
            </Slot>
          </TitledCard>
        ) : (
          <FacetCard
            title="Subscriptions"
            count={customer.subscriptions.length}
            opens={customerHref(customer.id, "Subscriptions")}
            figures={[
              { label: "Live", as: "count", value: live },
              { label: "Sandbox", as: "count", value: sandboxes },
            ]}
          />
        )}
        <TitledCard
          title="Contacts"
          count={record.contacts.length}
          trail={<WayOut opens={customerHref(customer.id, "Contacts")} />}
        >
          <Slot layout="list">
            {record.contacts.map((one) => (
              <SlotItem key={one.email}>
                <Avatar kind="person" name={one.name} />
                <Text kind="title">{one.name}</Text>
              </SlotItem>
            ))}
          </Slot>
        </TitledCard>
        {record.tenants.length === 0 ? (
          <TitledCard title="Tenants">
            <Slot layout="empty">
              <EmptyState
                title="No tenant yet"
                detail={owed ? "A tenant follows the subscription." : "The subscription is linked: sign up the first tenant."}
              >
                {owed ? null : <Button>Sign up new tenant</Button>}
              </EmptyState>
            </Slot>
          </TitledCard>
        ) : (
          <FacetCard
            title="Tenants"
            count={record.tenants.length}
            opens={customerHref(customer.id, "Tenants")}
            figures={[
              { label: "Production", as: "count", value: production },
              { label: "Demo or sandbox", as: "count", value: record.tenants.length - production },
            ]}
          />
        )}
      </DetailOverviewGrid>
    </DetailOverview>
  );
}

/**
 * What the customer is, in full: the next step where one is owed, then the account, the billing
 * details and the contract.
 *
 * TWO CARDS for the company and not one, split by the question each answers: who the customer is
 * to Revelator, and what an invoice to it says.
 */
function CustomerDetails({ customer, record }: { customer: Customer; record: CustomerRecord }) {
  return (
    <Metadata>
      {customer.subscriptions.length === 0 ? (
        <Alert intent="warn" title="Add the subscription">
          No tenant can be signed up until this customer has a subscription linked.
        </Alert>
      ) : null}
      <FactCard
        title="Account"
        facts={[
          { label: "Customer type", value: customer.type },
          { label: "New or existing", value: record.newCustomer ? "New" : "Existing" },
          { label: "Comment", value: record.comment },
        ]}
      />
      <FactCard
        title="Billing details"
        facts={[
          { label: "Company name", value: customer.name },
          { label: "Email", value: customer.email },
          { label: "Phone", value: record.phone },
          { label: "Address", value: record.address },
          { label: "Country", value: country(record.country) },
          { label: "Tax ID type", value: record.taxType },
          { label: "Tax ID", value: record.taxId },
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
