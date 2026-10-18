import { Avatar, CollectionPage, Progress } from "@revelator/pro-ui";
import { ORGANIZATIONS } from "@revelator/pro-ui/assets";

import { signUpTenantHref, tenantHref } from "../route";
import { CUSTOMERS, TENANTS, customerOf, progressOf, type Environment, type Tenant } from "./mock";
import { ResetBalances } from "./tenant-dialogs";

const ENVIRONMENTS: readonly Environment[] = ["Production", "Demo", "API sandbox"];
const PLANS = ["2 - Starter", "3 - Growth", "4 - Enterprise"] as const;

/** A customer's own mark, found by the name the cell is given. */
const markOf = (name: string) => {
  const organization = CUSTOMERS.find((one) => one.name === name)?.organization;
  return organization ? ORGANIZATIONS[organization].art : undefined;
};

/**
 * A tenant, as the mark it is known by — square, because a tenant is a workspace and not a
 * person; its initials, since a tenant has no logo of its own. ONE function, so the row a reader
 * pressed and the band they landed on wear the same mark.
 */
export const tenantMark = (one: Tenant) => <Avatar kind="organization" name={one.name} />;

/**
 * The tenants — every enterprise signed up under a customer that holds a catalogue of its own: the
 * parents and the standalones. A parent's client accounts are its children, read on the parent.
 *
 * A COLLECTION PAGE: the set's name, what grows it, and the one index. Where a tenant delivers is
 * the readings it divides by; how far its setup has come is a column read down the set. Whether it
 * is on trial, locked out or blocked from payment waits on the system (gaps.md) and is only filtered.
 */
export function Tenants() {
  return (
    <CollectionPage
      title="Tenants"
      actions={[{ label: "Sign up new tenant", primary: true, creates: true, opens: signUpTenantHref() }]}
      more={[{ label: "Export" }]}
      index={{
        rows: TENANTS,
        rowKey: (one) => one.enterpriseId,
        noun: { one: "tenant", many: "tenants" },
        identity: {
          title: "Name",
          name: (one) => one.name,
          mark: (one) => tenantMark(one),
          sortable: true,
          opens: (one) => tenantHref(one.enterpriseId),
        },
        // Opens on the newest: a tenant is looked for most while it is being set up.
        sort: { column: "Created", direction: "descending" },
        searchBy: ["Name", "Enterprise ID", "Payee ID"],
        columns: [
          { name: "Enterprise ID", as: "identifier", standard: "id", value: (one) => one.enterpriseId },
          {
            name: "Environment",
            value: (one) => ENVIRONMENTS.indexOf(one.environment),
            cell: (one) => one.environment,
            // Every row of a single environment's reading would say the same word.
            readings: ["All"],
          },
          {
            // ANOTHER RECORD as a value: the customer named with its mark. Not a link — a row
            // leads to one place, the tenant — so the customer is reached from the tenant's band.
            name: "Customer",
            as: "entities",
            value: (one) => {
              const customer = customerOf(one);
              return customer ? [customer.name] : [];
            },
            noun: { one: "customer", many: "customers" },
            entity: "organization",
            picture: markOf,
          },
          {
            // A SHARE of a whole read down the column — how far each tenant's setup has come —
            // in the form that carries the figure.
            name: "Setup",
            value: (one) => {
              const { done, of } = progressOf(one);
              return done / of;
            },
            cell: (one) => {
              const { done, of } = progressOf(one);
              return <Progress value={done} max={of} reading={`${done} of ${of}`} aria-label="Setup" />;
            },
          },
          { name: "Type", value: (one) => one.type, cell: (one) => one.type },
          { name: "Plan", value: (one) => one.plan, cell: (one) => one.plan },
          { name: "Payee ID", as: "identifier", standard: "id", hidden: true, value: (one) => one.payeeId },
          { name: "Partner ID", as: "identifier", standard: "id", hidden: true, value: (one) => one.partnerId },
          { name: "Created", as: "date", value: (one) => one.created },
        ],
        // WHERE A TENANT DELIVERS as readings and not a filter: the tenants divide into parts a
        // reader moves between — the live ones, the demos, the API partners' benches — each counted.
        readings: [
          { name: "All", holds: () => true },
          ...ENVIRONMENTS.map((environment) => ({
            name: environment,
            holds: (one: Tenant) => one.environment === environment,
          })),
        ],
        filters: [
          { kind: "anyOf", key: "type", label: "Type", options: ["Parent", "Standalone"], of: (one) => one.type },
          { kind: "anyOf", key: "plan", label: "Plan", options: PLANS, of: (one) => one.plan },
          {
            kind: "switches",
            key: "setup",
            label: "Setup",
            switches: [
              { key: "unfinished", label: "Setup unfinished", holds: (one) => progressOf(one).done < progressOf(one).of },
              { key: "customer", label: "No customer", holds: (one) => !one.customerId },
            ],
          },
          {
            kind: "switches",
            key: "account",
            label: "Account",
            switches: [
              { key: "trial", label: "On trial", holds: (one) => one.onTrial },
              { key: "locked", label: "Locked out", holds: (one) => one.lockedOut },
              { key: "blocked", label: "Payment blocked", holds: (one) => one.paymentBlocked },
              { key: "fusion", label: "Uses FusionAuth", holds: (one) => one.fusionAuth },
            ],
          },
          { kind: "span", key: "created", label: "Created", chip: "Created", at: (one) => one.created },
        ],
        totals: [{ count: true }],
        commands: (one) => [
          { label: "Open", opens: tenantHref(one.enterpriseId) },
          { label: "Billing" },
          { label: "Reset balances", destructive: true, dialog: <ResetBalances tenant={one} /> },
        ],
      }}
    />
  );
}
