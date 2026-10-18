# Gaps

What RCC's pages asked of the design system and did not find. A page never draws a gap: it is
logged here, decided in `../ui-components`, and the page adopts the decision.

Reference: the RCC prototype (`Platform Ops Accounts.dc.html`, Accounts → Customers).

## Accounts → Customers

| # | Asked for | Prototype | Here, until decided |
| - | --------- | --------- | ------------------- |
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
| 8 | The customer's subscription state on the band | Subscription linked badge | not drawn (gap 2) |
| 9 | A **long name** in the record header — cut at 335 of 960 px at 1440 wide, beside the mark and three controls | full name | truncated (Bluefen Distri…) |
| 11 | Subscription coupon, note and creation date | columns | not held by the fixtures yet |

## Accounts → Tenants

Reference: `ixTenants()` in the prototype.

| # | Asked for | Prototype | Here, until decided |
| - | --------- | --------- | ------------------- |
| 12 | A **tenant's standing** as a status family: Setting up (underway), Live (settled), On trial (noted), Payment blocked (attention), Locked out (failed) | three badge columns (Trial, Locked out, Payment blocked) and badges on the band | not drawn on the row or band; switches under Account in the filters, and an alert in the record's Details |

Decided by the system rather than asked: **where a tenant delivers** (Production, Demo, API sandbox) is the
index's readings. Its **customer** is a value cell naming the record with its mark, not a link: a row
leads to one place, so the customer is reached from the tenant. **Setup** is a progress cell, a
share read down the column with its figure.

## Accounts → Tenants → a tenant

| # | Asked for | Prototype | Here, until decided |
| - | --------- | --------- | ------------------- |
| 13 | A **setup checklist** on a record: ordered steps, each done or owed, each with the command that does it, and how far the whole has come | the Setup tab: numbered steps with a button each, under a progress bar | a `RecordIndex` of the steps with a `Progress` as its note: it offers sorting and a search a list of six never needs, and cuts each step's detail |
| 14 | A **second identifier on the band** that says whose it is (Enterprise ID beside Payee ID) | two labelled chips | the enterprise ID alone on the band; the payee ID in Details |
| 15 | A **long value in a facet tile** (a white label's domain) | — | runs over its label; the tile shows the white label's title instead |

## Not built yet

- **Forms the tenant pages start** — Sign up new tenant, Link customer, Create white label, Create
  API partner, Add user, Import client accounts, Edit enterprise, Edit tenant configuration, Convert
  to production. Offered without an address until each is walked and built.
- **New customer** — a full-page form in the prototype; to be walked before it is written.
- **Enterprises, Partners, Payees, Users, White labels** — in the nav, inert.
