import type { ReactNode } from "react";
import { AppShell, type ShellPlace, type ShellProduct } from "@revelator/pro-ui";
import { ORGANIZATIONS } from "@revelator/pro-ui/assets";

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
            { name: "Tenants" },
            { name: "Enterprises" },
            { name: "Partners" },
            { name: "Payees" },
            { name: "Users" },
            { name: "White labels" },
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
