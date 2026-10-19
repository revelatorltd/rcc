import type { ReactNode } from "react";
import { AppShell, type ShellPlace, type ShellProduct } from "@revelator/pro-ui";
import { ORGANIZATIONS } from "@revelator/pro-ui/assets";

import { platformHref } from "./platform/route";
import { accountsHref } from "./route";

/**
 * RCC, said once — its destinations and the pages each holds. A page this rebuild has not built is
 * written without an address: the nav still says the section HAS it, and it leads nowhere rather
 * than somewhere else.
 */
const PRODUCT: ShellProduct = {
  // The workspace is Revelator's own, so it wears the organization's mark the system ships.
  workspace: { name: "RCC", mark: ORGANIZATIONS.revelator.art },
  // THE RAIL, in the order an enterprise's access is read: its organizations, the accounts they hold,
  // the tenant groups that list them, the access groups that give permissions on those, and the
  // people who hold them. Only Accounts has pages of its own; the rest are one page each.
  destinations: [
    { name: "Organizations", mark: "label", opens: platformHref("organizations") },
    {
      name: "Accounts",
      mark: "storefront",
      opens: accountsHref("tenants"),
      pages: [
        {
          pages: [
            { name: "Tenants", opens: accountsHref("tenants") },
            { name: "Partners", opens: accountsHref("partners") },
            { name: "Payees", opens: accountsHref("payees") },
            { name: "Users", opens: accountsHref("users") },
          ],
        },
        // ON THEIR WAY OUT: still opened, listed apart so nobody starts new work there.
        {
          label: "Deprecated",
          pages: [
            { name: "Customers", opens: accountsHref("customers") },
            { name: "Enterprises", opens: accountsHref("enterprises") },
            { name: "White labels", opens: accountsHref("white-labels") },
          ],
        },
      ],
    },
    { name: "Tenant groups", mark: "grid", opens: platformHref("tenant-groups") },
    { name: "Access groups", mark: "locker", opens: platformHref("access-groups") },
    { name: "People", mark: "members", opens: platformHref("people") },
  ],
  user: {
    name: "Noa Lindqvist",
    email: "noa.lindqvist@revelator.example",
    // Signing out leaves the product, which this rebuild does not model.
    commands: [[{ label: "Sign out", opens: () => {} }]],
  },
};

/** The frame, placed once around whatever page is open. */
export function Frame({ place, children }: { place: ShellPlace; children: ReactNode }) {
  return (
    <AppShell product={PRODUCT} place={place}>
      {children}
    </AppShell>
  );
}
