import {
  Avatar,
  CollectionPage,
  Field,
  FormDialog,
  Wizard,
  WizardRow,
  WizardRowBody,
  WizardRowTip,
  WizardRowTips,
  WizardSection,
  WizardSectionBody,
  WizardSectionHeader,
  owed,
  type HeldBy,
} from "@revelator/pro-ui";

import { accountsHref, go, newPartnerHref, partnerHref } from "../route";
import { PARTNERS, accounts, addPartner, tenantsOfPartner, updatePartner, type Partner } from "./mock";

const YES_NO = [
  { value: "Yes", title: "Yes" },
  { value: "No", title: "No" },
];

/** A partner, as the mark it is known by — a company's square, its initials. */
export const partnerMark = (one: { name: string }) => <Avatar kind="organization" name={one.name} />;

/** The users an API partner knows — those given its partner id. */
export const usersOfPartner = (id: string) => accounts().filter((one) => one.partnerId === id);

/**
 * A partner's name, payout and trial — changed without leaving it. Its API key is the product's
 * to issue and is never shown here.
 */
export function EditPartner({ partner, ...held }: HeldBy & { partner: Partner }) {
  return (
    <FormDialog
      {...held}
      confirm="Save"
      draft={{ name: owed(partner.name), minimum: owed(partner.minimumPayment), trial: owed(partner.allOnTrial ? "Yes" : "No") }}
      onCommit={(draft) =>
        updatePartner(partner.id, { name: draft.name.trim(), minimumPayment: draft.minimum, allOnTrial: draft.trial === "Yes" })
      }
    >
      <Field as="text" name="name" label="Name" />
      <Field as="money" name="minimum" label="Minimum payment" />
      <Field as="choice" name="trial" label="Every account on trial" options={YES_NO} />
    </FormDialog>
  );
}

/**
 * An API partner created on its own — a company that will build on the API. One for a sandbox is
 * created from the sandbox's setup, which connects the two.
 */
export function NewPartner() {
  const leave = () => go(accountsHref("partners"));
  return (
    <Wizard
      noun={{ one: "API partner", many: "API partners" }}
      note="A company building on Revelator's API. Its API key is issued with it; its sandboxes and users are connected afterwards."
      onExit={leave}
      subject={(answers) => ({ kind: "organization", name: answers.name ?? "", meta: ["API partner"] })}
      draft={{ name: owed.text, minimum: owed(0), trial: owed<string>("No") }}
      onCommit={(answers) => {
        const id = addPartner({ name: answers.name.trim(), minimumPayment: answers.minimum, allOnTrial: answers.trial === "Yes" });
        go(partnerHref(id));
      }}
    >
      <WizardSection>
        <WizardSectionHeader title="Details" />
        <WizardSectionBody>
          <WizardRow title="Partner">
            <WizardRowBody>
              <Field as="text" name="name" label="Partner name" />
              <Field as="money" name="minimum" label="Minimum payment" help="The smallest payout its payees are paid." />
            </WizardRowBody>
            <WizardRowTips>
              <WizardRowTip>Name it after the company. A sandbox's minimum payment is 0.</WizardRowTip>
            </WizardRowTips>
          </WizardRow>
          <WizardRow title="Trial">
            <WizardRowBody>
              <Field as="choice" name="trial" label="Every account on trial" options={YES_NO} />
            </WizardRowBody>
            <WizardRowTips>
              <WizardRowTip>Every account created through the partner starts on trial.</WizardRowTip>
            </WizardRowTips>
          </WizardRow>
        </WizardSectionBody>
      </WizardSection>
    </Wizard>
  );
}

/**
 * The API partners — the companies building on Revelator's API, each with the sandboxes it is
 * connected to and the users it knows.
 *
 * A COLLECTION PAGE grown by a new partner. A partner's API key never stands on the page.
 */
export function Partners() {
  return (
    <CollectionPage
      title="Partners"
      actions={[{ label: "New API partner", primary: true, creates: true, opens: newPartnerHref() }]}
      more={[{ label: "Export" }]}
      index={{
        rows: PARTNERS,
        rowKey: (one) => one.id,
        noun: { one: "partner", many: "partners" },
        identity: {
          title: "Name",
          name: (one) => one.name,
          mark: (one) => partnerMark(one),
          sortable: true,
          opens: (one) => partnerHref(one.id),
        },
        sort: { column: "Created", direction: "descending" },
        searchBy: ["Name", "Partner ID"],
        columns: [
          { name: "Partner ID", as: "identifier", standard: "id", value: (one) => one.id },
          { name: "Sandboxes", as: "count", value: (one) => tenantsOfPartner(one.id).length },
          { name: "Users", as: "count", value: (one) => usersOfPartner(one.id).length },
          { name: "Minimum payment", as: "money", value: (one) => one.minimumPayment },
          {
            name: "Every account on trial",
            value: (one) => (one.allOnTrial ? 1 : 0),
            cell: (one) => (one.allOnTrial ? "Yes" : "No"),
          },
          { name: "Created", as: "date", value: (one) => one.created },
        ],
        filters: [
          {
            kind: "switches",
            key: "standing",
            label: "Partner",
            switches: [
              { key: "trial", label: "Every account on trial", holds: (one) => one.allOnTrial },
              { key: "unconnected", label: "No sandbox", holds: (one) => tenantsOfPartner(one.id).length === 0 },
            ],
          },
        ],
        totals: [{ count: true }],
        commands: (one) => [
          { label: "Open", opens: partnerHref(one.id) },
          { label: "Edit", dialog: <EditPartner partner={one} /> },
        ],
      }}
    />
  );
}
