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

## Forms (customers and tenants)

Reference: `vCustNew`, `vSubNew`, `vSignup`, `vCfgEdit`, `vEntEdit`, `vAddUser`, `vImport`,
`vPartnerForm` and the white label form in the prototype.

| # | Asked for | Prototype | Here, until decided |
| - | --------- | --------- | ------------------- |
| 16 | A **field whose options follow another answer**: the tax ID types of the country picked, the subscriptions of the customer picked, a Warner entity's rates held at 0 | the select refills, or disables, as the answer above it changes | every tax ID type is offered, and one left blank follows the country; only customers with a subscription are offered, and the commit links the one that fits; a Warner entity's rates are saved as 0 whatever was typed |
| 17 | A **yes-or-no answer** in a declared form | a checkbox (Is sandbox, Trial?, Locked out?) | a choice of Yes and No; where the answer names something, a choice of what (Production, Demo, API sandbox) |
| 18 | **Word of what a commit did** — a toast | a toast after every save | none: each form returns to the page that shows what it added |
| 19 | A wizard that **opens another and comes back** to its draft (sign-up → new customer or subscription → sign-up) | the sign-up's draft is set aside and restored | a tip sends the reader to the customer first; the sign-up offers only customers that can take a tenant |

Decided by RCC rather than asked:

- **Add user** adds a team member by name and email. The prototype searches the product's users, a
  set RCC does not hold until Users is built.
- **Edit enterprise** asks only what RCC holds: name, plan, partner, currency, minimum payment,
  and the account's standing. The product's other enterprise settings stay the product's.
- What leaves RCC stays without an address: Impersonate, Open in Stripe, Billing, Export, and
  Download template. Impersonating the owner from the setup marks the step tried, as the prototype does.

## Accounts → Enterprises

Reference: `ixEnterprises()`. Every tenant and every client account a parent holds; a tenant opens on
its own record, a client account on one of its own (its parent, its plan, its payee).

Decided by the system rather than asked: what an enterprise IS — a parent, a standalone, a client
account — is the index's readings. Its parent is a value cell naming the record with its mark. Whether
it is locked out waits on the tenant's standing (gap 12): a switch in the filters, an alert on the record.

## Accounts → Partners

Reference: `ixPartners()`, `vPartner()`, `vPartnerForm()`. The API partners, each with the sandboxes
connected to it and the users it knows by a partner user id. New API partner is a wizard; Edit a dialog.

Decided by RCC rather than asked: a partner's API key is never shown — its Details say one was issued.
The prototype's edit form asked for a key and saved nothing.

## Accounts → Payees

Reference: `ixPayees()`, `vPayee()`. Every tenant's payee and every client account's, divided by where
it stands in the system's own `payee` family: Not Invited, Invited, Active, Payout Blocked, Account
Locked. A tenant locked out or blocked from payment carries its payees there with it.

Decided by the system rather than asked: the prototype's Trial, Locked out and Payment blocked columns
are the payee's status, a reading and a badge. Its tax domicile and whether it may change its own
settings are dialogs, as in the prototype.

## Accounts → Users

Reference: `ixUsers()`, `vUser()`, `vUserEdit()`. Everyone who signs in, one account for one address,
across every tenant that gave them access. Edit user is a wizard (name, partner, partner user id); a
missing partner user id is warned on the record and issued from its overflow. Access is managed from
the user's Enterprises as it is on the tenant: set as owner, remove access.

Decided by RCC rather than asked: the prototype's Membership tab (the product's sign-in table — failed
attempts, password format) and its edit form's profile, notification and locale settings are the
product's, and are not shown. The auth tenant hover is not drawn: RCC holds no auth tenants.

## Not built yet

- **White labels** — in the nav, inert.
