import type { ReactNode } from "react";
import {
  Alert,
  Avatar,
  Badge,
  Button,
  DetailOverview,
  DetailOverviewGrid,
  DetailPage,
  EmptyState,
  FacetCard,
  FactCard,
  Link,
  Metadata,
  Progress,
  RecordIndex,
  Slot,
  SlotItem,
  Text,
  TitledCard,
  WayOut,
  type Command,
  type DetailFacet,
  type RecordNavProps,
  type ShellPlace,
} from "@revelator/pro-ui";

import { TENANT_FACETS, accountsHref, customerHref, tenantHref, type TenantFacet } from "../route";
import {
  customerOf,
  isSandbox,
  payeesOf,
  progressOf,
  setupOf,
  storesOf,
  tenantById,
  usersOf,
  type SetupStep,
  type Tenant,
} from "./mock";
import { tenantMark } from "./tenants";

const yesNo = (value: boolean) => (value ? "Yes" : "No");

/**
 * What does a step, where it is owed — the one command each step of the setup has. Every one but
 * the stores waits on a form RCC has not built yet, and is offered without an address.
 */
function commandOf(one: Tenant, step: SetupStep): Command {
  const customer = customerOf(one);
  switch (step.key) {
    case "customer":
      return customer ? { label: "Open customer", opens: customerHref(customer.id) } : { label: "Link customer" };
    case "white-label":
      return one.whiteLabel ? { label: "Open white label", opens: tenantHref(one.enterpriseId, "White label") } : { label: "Create white label" };
    case "stores":
      return { label: step.done ? "Open stores" : "Turn on stores", opens: tenantHref(one.enterpriseId, "Stores") };
    case "partner":
      return { label: one.partnerId ? "Open partner" : "Create API partner" };
    case "login":
      return { label: "Impersonate owner" };
    case "handover":
      return { label: "Copy handover email" };
  }
}

/** The step owed next — the first not done that keeps the tenant from its handover. */
const owedOf = (one: Tenant) => setupOf(one).find((step) => !step.done && !step.optional);

/**
 * One tenant, as a record with facets.
 *
 * The band says WHO, and the one step owed next; every facet below it is a page of its own. The
 * Overview reads none of them in full: it is the recap, one tile per facet with the way in.
 */
export function TenantDetail({ id, facet }: { id: string; facet: TenantFacet }) {
  const tenant = tenantById(id);
  const owed = owedOf(tenant);
  const next = owed ? commandOf(tenant, owed) : undefined;

  const FACETS: Record<TenantFacet, { header?: DetailFacet; body: ReactNode }> = {
    Overview: { body: <TenantOverview tenant={tenant} /> },
    Setup: { header: { name: "Setup" }, body: <TenantSetup tenant={tenant} /> },
    Details: {
      header: { name: "Details", more: [{ label: "Edit enterprise" }, { label: "Edit tenant configuration" }] },
      body: <TenantDetails tenant={tenant} />,
    },
    Users: {
      header: { name: "Users", actions: [{ label: "Add user", creates: true }] },
      body: <TenantUsers tenant={tenant} />,
    },
    Payees: { header: { name: "Payees" }, body: <TenantPayees tenant={tenant} /> },
    Stores: { header: { name: "Stores", more: [{ label: "Export" }] }, body: <TenantStores tenant={tenant} /> },
    "White label": {
      header: { name: "White label", more: tenant.whiteLabel ? [{ label: "Edit white label" }] : [] },
      body: <TenantWhiteLabel tenant={tenant} />,
    },
    Children: {
      header: { name: "Children", actions: [{ label: "Import client accounts" }] },
      body: <TenantChildren tenant={tenant} />,
    },
  };
  const shown = FACETS[facet];

  // ONE command stands out, and it is the step owed next; a tenant handed over owes none. A
  // sandbox can be moved to production — the rest wait in the overflow.
  const actions = next
    ? [next.opens ? { label: next.label, opens: next.opens, primary: true } : { label: next.label, primary: true }]
    : [];
  const more: Command[] = [
    { label: "Edit enterprise" },
    { label: "Edit tenant configuration" },
    ...(isSandbox(tenant) ? [{ label: "Convert to production" }] : []),
    { label: "Billing" },
    { label: "Reset balances", destructive: true },
  ];

  return (
    <DetailPage
      record={{
        // SQUARE, the same mark the index's row wears, so the row pressed and the band landed on
        // are plainly one thing.
        mark: tenantMark(tenant),
        name: tenant.name,
        kind: tenant.type === "Parent" ? "Parent tenant" : "Tenant",
        facts: [
          // The ENTERPRISE ID alone: a second id chip beside it could not say whose it is
          // (gaps.md) — the payee's is read in the Details.
          { identifier: tenant.enterpriseId, standard: "id" },
          { text: tenant.plan },
          // WHERE ITS RELEASES GO: it changes what every store and step below it means.
          { text: tenant.environment },
        ],
        actions,
        more,
      }}
      facet={shown.header}
    >
      {shown.body}
    </DetailPage>
  );
}

/**
 * The recap: one tile per facet, each with what it comes to and the way into it. A facet with
 * nothing in it yet is an empty card holding what starts it, so the step owed stands where its
 * absence is read.
 */
function TenantOverview({ tenant }: { tenant: Tenant }) {
  const { done, of } = progressOf(tenant);
  const stores = storesOf(tenant);
  const on = stores.filter((one) => one.active).length;
  const users = usersOf(tenant);
  const customer = customerOf(tenant);
  return (
    <DetailOverview>
      <DetailOverviewGrid>
        <FacetCard
          title="Setup"
          opens={tenantHref(tenant.enterpriseId, "Setup")}
          figures={[
            { label: "Done", as: "count", value: done },
            { label: "To do", as: "count", value: of - done },
          ]}
        />
        <FacetCard
          title="Details"
          opens={tenantHref(tenant.enterpriseId, "Details")}
          facts={[
            { label: "Customer", value: customer?.name },
            { label: "Type", value: tenant.type },
            { label: "Environment", value: tenant.environment },
          ]}
        />
        {tenant.whiteLabel ? (
          <FacetCard
            title="White label"
            opens={tenantHref(tenant.enterpriseId, "White label")}
            facts={[
              // Its TITLE, not its domain: a domain runs past the tile's row (gaps.md).
              { label: "Title", value: tenant.whiteLabel.title },
              { label: "White label ID", value: tenant.whiteLabel.id, standard: "id" },
            ]}
          />
        ) : (
          <TitledCard title="White label">
            <Slot layout="empty">
              <EmptyState title="No white label yet" detail="The tenant does not load until it has one.">
                <Button>Create white label</Button>
              </EmptyState>
            </Slot>
          </TitledCard>
        )}
        <FacetCard
          title="Stores"
          opens={tenantHref(tenant.enterpriseId, "Stores")}
          figures={[
            { label: "On", as: "count", value: on },
            { label: "Off", as: "count", value: stores.length - on },
          ]}
        />
        <TitledCard
          title="Users"
          count={users.length}
          trail={<WayOut opens={tenantHref(tenant.enterpriseId, "Users")} />}
        >
          <Slot layout="list">
            {users.map((one) => (
              <SlotItem key={one.userId}>
                <Avatar kind="person" name={one.name} />
                <Text kind="title">{one.name}</Text>
              </SlotItem>
            ))}
          </Slot>
        </TitledCard>
        {tenant.type === "Parent" ? (
          <FacetCard
            title="Children"
            count={tenant.children.length}
            opens={tenantHref(tenant.enterpriseId, "Children")}
            figures={[{ label: "Payees", as: "count", value: payeesOf(tenant).length }]}
          />
        ) : null}
      </DetailOverviewGrid>
    </DetailOverview>
  );
}

/**
 * The steps between signing the tenant up and handing it over, in the order they are done — each
 * done or still owed, with the command that does it. How far it has come stands over the set.
 */
function TenantSetup({ tenant }: { tenant: Tenant }) {
  const steps = setupOf(tenant);
  const { done, of } = progressOf(tenant);
  return (
    <RecordIndex
      rows={steps}
      rowKey={(one) => one.key}
      noun={{ one: "step", many: "steps" }}
      identity={{ title: "Step", name: (one) => one.title }}
      note={<Progress label="Setup" value={done} max={of} reading={`${done} of ${of} done`} />}
      columns={[
        {
          name: "State",
          value: (one) => (one.done ? "Done" : one.optional ? "Optional" : "To do"),
          cell: (one) => (one.done ? "Done" : one.optional ? "Optional" : "To do"),
        },
        { name: "Detail", value: (one) => one.detail, cell: (one) => one.detail },
      ]}
      commands={(one) => [commandOf(tenant, one)]}
      chooser={false}
      empty={{ holder: "this tenant", line: true }}
    />
  );
}

/**
 * What the tenant is, in full: where its account stands where it is held back, then the enterprise
 * and how its payees are paid.
 */
function TenantDetails({ tenant }: { tenant: Tenant }) {
  const customer = customerOf(tenant);
  return (
    <Metadata>
      {tenant.lockedOut ? (
        <Alert intent="danger" title="Locked out">
          Nobody at this tenant can sign in until it is unlocked.
        </Alert>
      ) : null}
      {tenant.paymentBlocked ? (
        <Alert intent="danger" title="Payment blocked">
          No payee of this tenant is paid until the block is lifted.
        </Alert>
      ) : null}
      {isSandbox(tenant) ? (
        <Alert intent="info" title={tenant.environment === "Demo" ? "Demo tenant" : "API sandbox"}>
          Nothing it releases reaches a store. Convert it to production once the customer is ready.
        </Alert>
      ) : null}
      <FactCard
        title="Enterprise"
        facts={[
          {
            label: "Customer",
            value: customer ? <Link opens={customerHref(customer.id)}>{customer.name}</Link> : undefined,
          },
          { label: "Type", value: tenant.type },
          { label: "Plan", value: tenant.plan },
          { label: "Environment", value: tenant.environment },
          { label: "Enterprise ID", value: tenant.enterpriseId, standard: "id" },
          { label: "Payee ID", value: tenant.payeeId, standard: "id" },
          { label: "Partner ID", value: tenant.partnerId, standard: "id" },
          { label: "Created", as: "date", value: tenant.created },
        ]}
      />
      <FactCard
        title="Account"
        facts={[
          { label: "On trial", value: yesNo(tenant.onTrial) },
          { label: "Locked out", value: yesNo(tenant.lockedOut) },
          { label: "Payment blocked", value: yesNo(tenant.paymentBlocked) },
          { label: "Uses FusionAuth", value: yesNo(tenant.fusionAuth) },
        ]}
      />
      <FactCard
        title="Payments"
        facts={[
          { label: "Currency", value: tenant.currency },
          { label: "Minimum payment", as: "money", value: tenant.minimumPayment, currency: tenant.currency },
        ]}
      />
    </Metadata>
  );
}

/** Who signs in to the tenant, its owner first. */
function TenantUsers({ tenant }: { tenant: Tenant }) {
  return (
    <RecordIndex
      rows={usersOf(tenant)}
      rowKey={(one) => one.userId}
      noun={{ one: "user", many: "users" }}
      identity={{
        title: "Name",
        name: (one) => one.name,
        mark: (one) => <Avatar kind="person" name={one.name} />,
      }}
      columns={[
        { name: "Email", value: (one) => one.email, cell: (one) => one.email },
        { name: "Role", value: (one) => (one.owner ? "Owner" : "Team member"), cell: (one) => (one.owner ? "Owner" : "Team member") },
        { name: "User ID", as: "identifier", standard: "id", value: (one) => one.userId },
      ]}
      commands={(one) => [
        { label: "Impersonate" },
        { label: one.owner ? "Unset as owner" : "Set as owner" },
        { label: "Remove access", destructive: true },
      ]}
      chooser={false}
      empty={{ holder: "this tenant", line: true }}
    />
  );
}

/** Who the tenant pays: its own payee, and one for each client account a parent holds. */
function TenantPayees({ tenant }: { tenant: Tenant }) {
  return (
    <RecordIndex
      rows={payeesOf(tenant)}
      rowKey={(one) => one.payeeId}
      noun={{ one: "payee", many: "payees" }}
      identity={{
        title: "Name",
        name: (one) => one.name,
        mark: (one) => <Avatar kind="organization" name={one.name} />,
      }}
      columns={[
        { name: "Payee ID", as: "identifier", standard: "id", value: (one) => one.payeeId },
        { name: "Enterprise ID", as: "identifier", standard: "id", value: (one) => one.enterpriseId },
      ]}
      chooser={false}
      empty={{ holder: "this tenant", line: true }}
    />
  );
}

/**
 * The stores the tenant can deliver to — each switched on or off for it, and shown to its users or
 * hidden. Held together, several are switched at once.
 */
function TenantStores({ tenant }: { tenant: Tenant }) {
  return (
    <RecordIndex
      rows={storesOf(tenant)}
      rowKey={(one) => one.name}
      noun={{ one: "store", many: "stores" }}
      identity={{ title: "Store", name: (one) => one.name }}
      columns={[
        {
          name: "Active",
          value: (one) => (one.active ? 1 : 0),
          cell: (one) => <Badge status={one.active ? "feature:Enabled" : "feature:Disabled"} />,
        },
        {
          name: "Shown",
          value: (one) => (one.displayed ? 1 : 0),
          cell: (one) => <Badge status={one.displayed ? "feature:Enabled" : "feature:Disabled"} />,
        },
      ]}
      selection={[{ label: "Turn on" }, { label: "Turn off" }, { label: "Show" }, { label: "Hide" }]}
      chooser={false}
      empty={{ holder: "this tenant", line: true }}
    />
  );
}

/** The white label the tenant loads under — or, where it has none, what creates it. */
function TenantWhiteLabel({ tenant }: { tenant: Tenant }) {
  const label = tenant.whiteLabel;
  if (!label)
    return (
      <TitledCard title="White label">
        <Slot layout="empty">
          <EmptyState
            title="No white label yet"
            detail="Every tenant needs one, white label client or not: without it the tenant does not load."
          >
            <Button>Create white label</Button>
          </EmptyState>
        </Slot>
      </TitledCard>
    );
  return (
    <Metadata>
      <FactCard
        title="White label"
        facts={[
          { label: "White label ID", value: label.id, standard: "id" },
          { label: "Domain", value: label.domain },
          { label: "Title", value: label.title },
          { label: "Allows sign-up", value: yesNo(label.allowSignup) },
        ]}
      />
    </Metadata>
  );
}

/** The client accounts a parent tenant holds, newest first. */
function TenantChildren({ tenant }: { tenant: Tenant }) {
  return (
    <RecordIndex
      rows={tenant.children}
      rowKey={(one) => one.enterpriseId}
      noun={{ one: "child enterprise", many: "child enterprises" }}
      identity={{
        title: "Name",
        name: (one) => one.name,
        mark: (one) => <Avatar kind="organization" name={one.name} />,
      }}
      sort={{ column: "Created", direction: "descending" }}
      columns={[
        { name: "Enterprise ID", as: "identifier", standard: "id", value: (one) => one.enterpriseId },
        { name: "Payee ID", as: "identifier", standard: "id", value: (one) => one.payeeId },
        { name: "Created", as: "date", value: (one) => one.created },
      ]}
      chooser={false}
      empty={{ holder: "this tenant", line: true }}
    />
  );
}

/** The tenant's facets — Children a parent's alone — and the way back to the tenants. */
function tenantNav({ id, facet }: { id: string; facet: TenantFacet }): RecordNavProps<TenantFacet> {
  const tenant = tenantById(id);
  return {
    back: { index: "Tenants", opens: accountsHref("tenants") },
    facets: TENANT_FACETS.filter((one) => one !== "Children" || tenant.type === "Parent"),
    at: facet,
    addressOf: (one) => tenantHref(id, one),
  };
}

/** Where one tenant's page is: its facets, and a trail that reaches past the index to it. */
export const tenantPlace = ({ id, facet }: { id: string; facet: TenantFacet }): ShellPlace => {
  const tenant = tenantById(id);
  return {
    at: "Accounts",
    page: tenant.name,
    record: tenantNav({ id, facet }),
    trail: [
      { label: "Accounts", opens: accountsHref("customers") },
      { label: "Tenants", opens: accountsHref("tenants") },
      { label: tenant.name },
    ],
  };
};
