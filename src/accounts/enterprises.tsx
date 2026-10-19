import { Avatar, CollectionPage } from "@revelator/pro-ui";

import { tenantArt } from "../platform/tenant-art";
import { editEnterpriseHref, enterpriseHref, tenantHref } from "../route";
import { enterprises, type Enterprise } from "./mock";
import { tenantMark, tenantPicture } from "./tenants";

const TYPES: readonly Enterprise["type"][] = ["Parent", "Standalone", "Child"];

/**
 * An enterprise, as the mark it is known by: a tenant wears its own logo (`tenantMark`); a
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

/** An enterprise's logo, as an image address — the one its mark wears. */
export const enterprisePicture = (one: Enterprise) => (one.tenant ? tenantPicture(one.tenant) : tenantArt(one.name));

/** Where an enterprise opens: a tenant on its own record, a client account on the enterprise's. */
export const enterpriseOpens = (one: Enterprise) => (one.tenant ? tenantHref(one.enterpriseId) : enterpriseHref(one.enterpriseId));

/** How an enterprise is edited — every one on the same form, tenant or client account, as RCC edits it. */
export const editCommand = (one: Enterprise) => ({ label: "Edit enterprise", opens: editEnterpriseHref(one.enterpriseId) });

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
          { name: "Is parent", value: (one) => (one.type === "Parent" ? 1 : 0), cell: (one) => (one.type === "Parent" ? "Yes" : "No") },
          { name: "Payee ID", as: "identifier", standard: "id", value: (one) => one.payeeId },
          { name: "Partner ID", as: "identifier", standard: "id", hidden: true, value: (one) => one.partnerId },
          { name: "Locked out", value: (one) => (one.lockedOut ? 1 : 0), cell: (one) => (one.lockedOut ? "Yes" : "No") },
          { name: "Created", as: "date", value: (one) => one.created },
        ],
        readings: [
          { name: "All", holds: () => true },
          { name: "Parents", holds: (one) => one.type === "Parent" },
          { name: "Standalones", holds: (one) => one.type === "Standalone" },
          { name: "Client accounts", holds: (one) => one.type === "Child" },
        ],
        filters: [
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
