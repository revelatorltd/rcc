# Gaps

What RCC's pages asked of the design system and did not find. A page never draws a gap: it is
logged here, decided in `../ui-components`, and the page adopts the decision.

Reference: the RCC prototype (`Platform Ops Accounts.dc.html`, Accounts → Customers).

## Accounts → Customers

| # | Asked for | Prototype | Here, until decided |
| - | --------- | --------- | ------------------- |
| 1 | A customer's **status** — Active, Onboarding, Churned, Terminated | coloured badge | not drawn; filterable |
| 2 | A customer's **subscription state** — linked, or none yet | Linked / Needs subscription badge | not drawn; filterable (No subscription) |
| 3 | A **second line** under a record's name (its email) | email under the name | an Email column |
| 4 | **Type** (Client, Warner entity, Demo) | badge | text: a category, not a state |
| 5 | A **quick filter beside the search** (All statuses) | select in the toolbar | in the filter panel with the rest |
| 6 | The **product chrome** — app switcher, notifications | in the top bar | absent |

## Not built yet

- **New customer** — a full-page form in the prototype; to be walked before it is written.
- **A customer's record** (Open) — company, contract, subscriptions, contacts, tenants.
- **Tenants, Enterprises, Partners, Payees, Users, White labels** — in the nav, inert.
