import { Avatar, CollectionPage, Field, FormDialog, owed, type HeldBy } from "@revelator/pro-ui";

import { tenantArt } from "../platform/tenant-art";
import { enterpriseHref, tenantFormHref, tenantHref } from "../route";
import { enterprises, renameChild, type Enterprise } from "./mock";
import { tenantMark } from "./tenants";

const TYPES: readonly Enterprise["type"][] = ["Parent", "Standalone", "Child"];
const PLANS = ["2 - Starter", "3 - Growth", "4 - Enterprise"] as const;

/**
 * An enterprise, as the mark it is known by: a tenant wears its customer's logo (`tenantMark`); a
 * client account, a label of its own, the logo invented from its name.
 */
export const enterpriseMark = (one: Enterprise) =>
  one.tenant ? (
    tenantMark(one.tenant)
  ) : (
    <Avatar kind="organization" name={one.name}>
      <img src={tenantArt(one.name)} alt="" />
    </Avatar>
  );

/** Where an enterprise opens: a tenant on its own record, a client account on the enterprise's. */
export const enterpriseOpens = (one: Enterprise) => (one.tenant ? tenantHref(one.enterpriseId) : enterpriseHref(one.enterpriseId));

/**
 * A client account renamed — the one thing RCC changes on a child enterprise. A tenant is edited
 * on its own form, which holds far more.
 */
export function RenameEnterprise({ enterprise, ...held }: HeldBy & { enterprise: Enterprise }) {
  return (
    <FormDialog
      {...held}
      confirm="Save"
      draft={{ name: owed(enterprise.name) }}
      onCommit={(draft) => renameChild(enterprise.enterpriseId, draft.name.trim())}
    >
      <Field as="text" name="name" label="Name" />
    </FormDialog>
  );
}

/** How an enterprise is edited — on the tenant's form, or by renaming a client account. */
export const editCommand = (one: Enterprise) =>
  one.tenant
    ? { label: "Edit enterprise", opens: tenantFormHref(one.enterpriseId, "edit") }
    : { label: "Edit enterprise", dialog: <RenameEnterprise enterprise={one} /> };

/**
 * The enterprises — every account the product holds a catalogue in: each tenant, and each client
 * account a parent tenant holds. Read, never grown here: a tenant is signed up from Tenants, a client
 * account imported on its parent.
 *
 * A COLLECTION PAGE whose readings are what an enterprise IS — a parent, a standalone, a client
 * account — each counted.
 */
export function Enterprises() {
  const rows = enterprises();
  return (
    <CollectionPage
      title="Enterprises"
      more={[{ label: "Export" }]}
      index={{
        rows,
        rowKey: (one) => one.enterpriseId,
        noun: { one: "enterprise", many: "enterprises" },
        identity: {
          title: "Name",
          name: (one) => one.name,
          mark: (one) => enterpriseMark(one),
          sortable: true,
          opens: (one) => enterpriseOpens(one),
        },
        sort: { column: "Created", direction: "descending" },
        searchBy: ["Name", "Enterprise ID", "Parent enterprise", "Payee ID"],
        columns: [
          { name: "Enterprise ID", as: "identifier", standard: "id", value: (one) => one.enterpriseId },
          {
            name: "Type",
            value: (one) => TYPES.indexOf(one.type),
            cell: (one) => (one.type === "Child" ? "Client account" : one.type),
            readings: ["All"],
          },
          {
            // ANOTHER RECORD as a value: the parent a client account belongs to.
            name: "Parent enterprise",
            as: "entities",
            value: (one) => (one.parent ? [one.parent.name] : []),
            noun: { one: "parent enterprise", many: "parent enterprises" },
            entity: "organization",
          },
          { name: "Plan", value: (one) => one.plan, cell: (one) => one.plan },
          { name: "Payee ID", as: "identifier", standard: "id", hidden: true, value: (one) => one.payeeId },
          { name: "Partner ID", as: "identifier", standard: "id", hidden: true, value: (one) => one.partnerId },
          { name: "Created", as: "date", value: (one) => one.created },
        ],
        readings: [
          { name: "All", holds: () => true },
          { name: "Parents", holds: (one) => one.type === "Parent" },
          { name: "Standalones", holds: (one) => one.type === "Standalone" },
          { name: "Client accounts", holds: (one) => one.type === "Child" },
        ],
        filters: [
          { kind: "anyOf", key: "plan", label: "Plan", options: PLANS, of: (one) => one.plan },
          {
            kind: "switches",
            key: "account",
            label: "Account",
            switches: [
              { key: "trial", label: "On trial", holds: (one) => one.onTrial },
              { key: "locked", label: "Locked out", holds: (one) => one.lockedOut },
              { key: "blocked", label: "Payment blocked", holds: (one) => one.paymentBlocked },
            ],
          },
          { kind: "span", key: "created", label: "Created", chip: "Created", at: (one) => one.created },
        ],
        totals: [{ count: true }],
        commands: (one) => [{ label: "Open", opens: enterpriseOpens(one) }, editCommand(one)],
      }}
    />
  );
}
