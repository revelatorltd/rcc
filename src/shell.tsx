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
  destinations: [
    {
      name: "Accounts",
      mark: "members",
      opens: accountsHref("customers"),
      pages: [
        {
          pages: [
            { name: "Customers", opens: accountsHref("customers") },
            { name: "Tenants", opens: accountsHref("tenants") },
            { name: "Enterprises", opens: accountsHref("enterprises") },
            { name: "Partners", opens: accountsHref("partners") },
            { name: "Payees", opens: accountsHref("payees") },
            { name: "Users", opens: accountsHref("users") },
            { name: "White labels", opens: accountsHref("white-labels") },
          ],
        },
      ],
    },
    {
      // WHO CAN SEE AND DO WHAT, on which tenants, and why — an enterprise's own access, run here.
      name: "Platform admin",
      mark: "locker",
      opens: platformHref("organizations"),
      pages: [
        {
          pages: [
            { name: "Organizations", opens: platformHref("organizations") },
            { name: "Tenant groups", opens: platformHref("tenant-groups") },
            { name: "Access groups", opens: platformHref("access-groups") },
            { name: "People", opens: platformHref("people") },
          ],
        },
      ],
    },
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
