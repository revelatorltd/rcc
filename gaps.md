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
| 5 | A **quick filter beside the search** (All statuses) | select in the toolbar | the index's readings — see below |
| 6 | The **product chrome** — app switcher, notifications | in the top bar | absent |
| 7 | **Export as an icon-only control** beside the action (Download as CSV) | download icon in the toolbar | Export in the header's overflow, as the page header says |

Decided by the system rather than asked: status is the index's **readings** (All, Active, Onboarding,
Churned, Terminated), the form for a set that divides into parts a reader moves between.

## Accounts → Customers → a customer

| # | Asked for | Prototype | Here, until decided |
| - | --------- | --------- | ------------------- |
| 8 | The customer's status and subscription state on the band | Client · Subscription linked badges | not drawn (gaps 1, 2) |
| 9 | A **long name** in the record header — cut at 335 of 960 px at 1440 wide, beside the mark and three controls | full name | truncated (Bluefen Distri…) |
| 10 | A **Stripe ID** told apart from Revelator's own — the Stripe mark on its chip. No Stripe mark in the set, and an identifier chip draws its standard's mark itself: asked of the system (2026-10-16) | `Stripe cus_…` chip | an identifier among the facts, unlabelled |
| 11 | Subscription coupon, note and creation date | columns | not held by the fixtures yet |

## Not built yet

- **New customer** — a full-page form in the prototype; to be walked before it is written.
- **Tenants, Enterprises, Partners, Payees, Users, White labels** — in the nav, inert.
