import { Avatar, Badge, Chip, CollectionPage, Field, FormDialog, owed, type HeldBy } from "@revelator/pro-ui";

import { payeeHref } from "../route";
import { enterpriseMark, enterprisePicture } from "./enterprises";
import { payees, updatePayee, type Payee, type PayeeStatus } from "./mock";

const yesNo = (value: boolean) => (value ? "Yes" : "No");

/** Where a payee stands, in the order the system's family runs. */
export const PAYEE_STATUSES: readonly PayeeStatus[] = ["Not Invited", "Invited", "Active", "Payout Blocked", "Account Locked"];

/** A payee, as the mark it is known by — the enterprise it pays, wearing that enterprise's mark. */
export const payeeMark = (one: Payee) => enterpriseMark(one.enterprise);

/** A country, as the flag it flies and its name — the way a country is drawn wherever it is a value. */
export const countryChip = (named: string) => (
  <Chip>
    <Avatar kind="place" name={named} />
    {named}
  </Chip>
);

/** The country a payee is taxed in — what its statements withhold by. */
export function EditTaxCountry({ payee, ...held }: HeldBy & { payee: Payee }) {
  return (
    <FormDialog
      {...held}
      confirm="Save"
      draft={{ country: owed(payee.taxCountry ?? "") }}
      onCommit={(draft) => updatePayee(payee.payeeId, { taxCountry: draft.country })}
    >
      <Field as="country" name="country" label="Tax domicile country" help="Its statements withhold tax by it." />
    </FormDialog>
  );
}

/** Whether the payee may change its own payment settings — its account and how it is paid. */
export function EditSettingsChanges({ payee, ...held }: HeldBy & { payee: Payee }) {
  return (
    <FormDialog
      {...held}
      confirm="Save"
      draft={{ allowed: owed<string>(payee.settingsAllowed ? "Yes" : "No") }}
      onCommit={(draft) => updatePayee(payee.payeeId, { settingsAllowed: draft.allowed === "Yes" })}
    >
      <Field
        as="choice"
        name="allowed"
        label="Payee settings changes allowed"
        options={[
          { value: "Yes", title: "Yes", description: "The payee changes its own account and how it is paid." },
          { value: "No", title: "No", description: "Only Revelator changes them." },
        ]}
      />
    </FormDialog>
  );
}

/**
 * The payees — who the enterprises pay: every tenant's own, and every client account's.
 *
 * A COLLECTION PAGE read, never grown here: a payee comes with its enterprise. Where it stands is
 * the readings, in the system's own family, and a badge on All.
 */
export function Payees() {
  const rows = payees();
  const pictures = new Map(rows.map((one) => [one.enterprise.name, enterprisePicture(one.enterprise)]));
  return (
    <CollectionPage
      title="Payees"
      more={[{ label: "Download" }]}
      index={{
        rows,
        rowKey: (one) => one.payeeId,
        noun: { one: "payee", many: "payees" },
        identity: {
          title: "Name",
          name: (one) => one.name,
          mark: (one) => payeeMark(one),
          sortable: true,
          opens: (one) => payeeHref(one.payeeId),
        },
        sort: { column: "Name", direction: "ascending" },
        searchBy: ["Name", "Payee ID", "Enterprise ID", "Enterprise", "Contact ID", "Contact", "Email", "Payor IDs"],
        columns: [
          { name: "Payee ID", as: "identifier", standard: "id", value: (one) => one.payeeId },
          {
            name: "Status",
            value: (one) => PAYEE_STATUSES.indexOf(one.status),
            cell: (one) => <Badge status={`payee:${one.status}`} />,
            readings: ["All"],
          },
          { name: "Enterprise ID", as: "identifier", standard: "id", value: (one) => one.enterprise.enterpriseId },
          {
            // ANOTHER RECORD as a value: the enterprise it pays out for, wearing its logo.
            name: "Enterprise",
            as: "entities",
            value: (one) => [one.enterprise.name],
            noun: { one: "enterprise", many: "enterprises" },
            entity: "organization",
            picture: (named) => pictures.get(named),
          },
          { name: "On trial", value: (one) => (one.onTrial ? 1 : 0), cell: (one) => yesNo(one.onTrial) },
          { name: "Locked out", value: (one) => (one.lockedOut ? 1 : 0), cell: (one) => yesNo(one.lockedOut) },
          { name: "Contact ID", as: "identifier", standard: "id", value: (one) => one.contactId },
          { name: "Contact", value: (one) => one.contact ?? "", cell: (one) => one.contact },
          { name: "Email", value: (one) => one.email ?? "", cell: (one) => one.email },
          { name: "Payment blocked", value: (one) => (one.paymentBlocked ? 1 : 0), cell: (one) => yesNo(one.paymentBlocked) },
          { name: "Payor IDs", value: (one) => one.payorIds.join(", "), cell: (one) => one.payorIds.join(", ") },
          { name: "Currency", hidden: true, value: (one) => one.currency, cell: (one) => one.currency },
        ],
        readings: [
          { name: "All", holds: () => true },
          ...PAYEE_STATUSES.map((status) => ({ name: status, holds: (one: Payee) => one.status === status })),
        ],
        filters: [
          {
            kind: "anyOf",
            key: "currency",
            label: "Currency",
            options: [...new Set(rows.map((one) => one.currency))],
            of: (one) => one.currency,
          },
          {
            kind: "switches",
            key: "payee",
            label: "Payee",
            switches: [
              { key: "child", label: "Client accounts only", holds: (one) => one.enterprise.type === "Child" },
              { key: "settings", label: "Settings changes allowed", holds: (one) => one.settingsAllowed },
              { key: "trial", label: "On trial", holds: (one) => one.onTrial },
              { key: "locked", label: "Locked out", holds: (one) => one.lockedOut },
              { key: "blocked", label: "Payment blocked", holds: (one) => one.paymentBlocked },
            ],
          },
        ],
        totals: [{ count: true }],
        commands: (one) => [
          { label: "Open", opens: payeeHref(one.payeeId) },
          { label: "Edit tax domicile country", dialog: <EditTaxCountry payee={one} /> },
          // Transactions are Finance's, a section this rebuild does not hold.
          { label: "Transactions" },
        ],
      }}
    />
  );
}
