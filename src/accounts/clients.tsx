import { CollectionPage } from "@revelator/pro-ui";

import { editEnterpriseHref, enterpriseHref, tenantFormHref } from "../route";
import { PLANS, TENANTS, enterprises } from "./mock";
import { enterpriseMark } from "./enterprises";
import { tenantPicture } from "./tenants";

const yesNo = (value: boolean) => (value ? "Yes" : "No");

/**
 * The clients — every client account a parent tenant holds: a catalogue and a payee of its own,
 * made by importing them on the parent. Read here across every parent, where the Enterprises page
 * mixed them with the tenants.
 *
 * A COLLECTION PAGE, grown on a parent: each parent's import is offered from the overflow.
 */
export function Clients() {
  const rows = enterprises().filter((one) => one.type === "Child");
  const parents = TENANTS.filter((one) => one.type === "Parent");
  const pictures = new Map(parents.map((one) => [one.name, tenantPicture(one)]));
  return (
    <CollectionPage
      title="Clients"
      more={[
        ...parents.map((one) => ({ label: `Import client accounts into ${one.name}`, opens: tenantFormHref(one.enterpriseId, "import") })),
        { label: "Download" },
      ]}
      index={{
        rows,
        rowKey: (one) => one.enterpriseId,
        noun: { one: "client account", many: "client accounts" },
        identity: {
          title: "Name",
          name: (one) => one.name,
          mark: (one) => enterpriseMark(one),
          sortable: true,
          opens: (one) => enterpriseHref(one.enterpriseId),
        },
        sort: { column: "Created", direction: "descending" },
        searchBy: ["Name", "Enterprise ID", "Payee ID", "Parent enterprise"],
        columns: [
          { name: "Enterprise ID", as: "identifier", standard: "id", value: (one) => one.enterpriseId },
          { name: "Payee ID", as: "identifier", standard: "id", value: (one) => one.payeeId },
          {
            // ANOTHER RECORD as a value: the parent tenant that holds it, wearing its logo.
            name: "Parent enterprise",
            as: "entities",
            value: (one) => (one.parent ? [one.parent.name] : []),
            noun: { one: "parent enterprise", many: "parent enterprises" },
            entity: "organization",
            picture: (named) => pictures.get(named),
          },
          { name: "Subscription plan", hidden: true, value: (one) => one.plan, cell: (one) => one.plan },
          { name: "On trial", value: (one) => (one.onTrial ? 1 : 0), cell: (one) => yesNo(one.onTrial) },
          { name: "Locked out", value: (one) => (one.lockedOut ? 1 : 0), cell: (one) => yesNo(one.lockedOut) },
          { name: "Payment blocked", value: (one) => (one.paymentBlocked ? 1 : 0), cell: (one) => yesNo(one.paymentBlocked) },
          { name: "Partner ID", as: "identifier", standard: "id", hidden: true, value: (one) => one.partnerId },
          { name: "Created", as: "date", value: (one) => one.created },
        ],
        filters: [
          {
            kind: "anyOf",
            key: "parent",
            label: "Parent enterprise",
            options: parents.map((one) => one.name),
            of: (one) => one.parent?.name ?? "",
          },
          { kind: "anyOf", key: "plan", label: "Subscription plan", options: PLANS, of: (one) => one.plan },
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
        commands: (one) => [
          { label: "Open", opens: enterpriseHref(one.enterpriseId) },
          { label: "Edit enterprise", opens: editEnterpriseHref(one.enterpriseId) },
        ],
      }}
    />
  );
}
