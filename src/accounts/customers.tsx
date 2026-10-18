import { Badge, CollectionPage } from "@revelator/pro-ui";

import { customerHref } from "../route";
import { customerMark } from "./mark";
import { CUSTOMERS, tenantsOf, type Customer } from "./mock";

const STATUSES: readonly Customer["status"][] = ["Active", "Onboarding", "Churned", "Terminated"];
const TYPES: readonly Customer["type"][] = ["Client", "Warner entity", "Demo"];
const PRODUCTS = ["Enterprise", "Revelator Pro", "API"] as const;

/**
 * The customers — who holds a contract with Revelator, each the account a tenant is signed up
 * under.
 *
 * A COLLECTION PAGE: the set's name, what grows it, and the one index. The customer's status is
 * both the readings it divides by and a badge on each row; its subscription's state waits on the
 * system (gaps.md) and is only a filter.
 */
export function Customers() {
  return (
    <CollectionPage
      title="Customers"
      actions={[{ label: "New customer", primary: true, creates: true }]}
      more={[{ label: "Export" }]}
      index={{
        rows: CUSTOMERS,
        rowKey: (one) => one.id,
        noun: { one: "customer", many: "customers" },
        identity: {
          title: "Name",
          name: (one) => one.name,
          // The customer's own mark — square, because a customer is a company and not a person.
          mark: (one) => customerMark(one),
          sortable: true,
          opens: (one) => customerHref(one.id),
        },
        // Opens on the newest: a customer is looked for most while it is being set up.
        sort: { column: "Created", direction: "descending" },
        searchBy: ["Name", "Customer ID", "Email"],
        columns: [
          {
            name: "Customer ID",
            as: "identifier",
            standard: "id",
            value: (one) => one.id,
          },
          {
            name: "Status",
            // Ordered by where the customer stands, the order the readings take — not by the word.
            value: (one) => STATUSES.indexOf(one.status),
            cell: (one) => <Badge status={`customer:${one.status}`} />,
            // Every row of a single status's reading would say the same word: the column is read
            // on All only.
            readings: ["All"],
          },
          { name: "Email", value: (one) => one.email ?? "", cell: (one) => one.email },
          { name: "Type", value: (one) => one.type, cell: (one) => one.type },
          { name: "Tenants", as: "count", value: (one) => tenantsOf(one.id).length },
          { name: "DSP rate", as: "percent", value: (one) => one.dspRate },
          { name: "Created", as: "date", value: (one) => one.created },
        ],
        // STATUS as readings and not a filter: the customers divide into parts a reader moves
        // between — the live ones, the ones being set up, the ones gone — each counted.
        readings: [
          { name: "All", holds: () => true },
          ...STATUSES.map((status) => ({ name: status, holds: (one: Customer) => one.status === status })),
        ],
        filters: [
          {
            kind: "anyOf",
            key: "type",
            label: "Customer type",
            options: TYPES,
            of: (one) => one.type,
          },
          {
            kind: "anyOf",
            key: "product",
            label: "Subscription product",
            options: PRODUCTS,
            of: (one) => one.subscriptions.map((each) => each.product),
          },
          {
            kind: "switches",
            key: "subscription",
            label: "Subscription",
            switches: [
              {
                key: "none",
                label: "No subscription",
                holds: (one) => one.subscriptions.length === 0,
              },
              {
                key: "sandbox",
                label: "Sandbox",
                holds: (one) => one.subscriptions.some((each) => each.sandbox),
              },
            ],
          },
        ],
        totals: [{ count: true }],
        commands: (one) => [
          { label: "Open", opens: customerHref(one.id) },
          { label: "Add subscription" },
          { label: "Sign up new tenant" },
        ],
      }}
    />
  );
}
