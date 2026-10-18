import {
  Field,
  Wizard,
  WizardRow,
  WizardRowBody,
  WizardRowTip,
  WizardRowTips,
  WizardSection,
  WizardSectionBody,
  WizardSectionHeader,
  owed,
  unanswered,
} from "@revelator/pro-ui";

import { accountsHref, customerHref, go } from "../route";
import { addCustomer, customerById, RECORDS, updateCustomer, type Contact, type CustomerType } from "./mock";

const TYPES: readonly CustomerType[] = ["Client", "Warner entity"];
const ROLES: readonly Contact["roles"][number][] = ["Primary", "Billing", "Technical", "Royalties", "Legal"];

/** The tax id each country files under, by the name the system's set of countries gives it. */
const TAX_TYPE_OF: Record<string, string> = {
  "United States of America": "US EIN",
  "United Kingdom": "GB VAT",
  Canada: "CA BN",
  Australia: "AU ABN",
  Israel: "IL VAT",
  Brazil: "BR CNPJ",
  Mexico: "MX RFC",
  India: "IN GST",
  Japan: "JP CN",
  Argentina: "AR CUIT",
  ...Object.fromEntries(
    ["Netherlands", "France", "Germany", "Spain", "Italy", "Sweden", "Ireland", "Belgium", "Austria", "Portugal"].map((one) => [one, "EU VAT"]),
  ),
};
const TAX_TYPES = [...new Set(Object.values(TAX_TYPE_OF)), "Other"];

const choices = (values: readonly string[]) => values.map((value) => ({ value, title: value }));

/** A Stripe customer id, as Stripe issues one — `cus_` and fourteen characters. */
const stripeId = () => `cus_${Math.random().toString(36).slice(2, 9)}${Math.random().toString(36).slice(2, 9)}`;

/**
 * A customer — who holds a contract with Revelator — made, or changed.
 *
 * A WIZARD on one flow: the company, its contract, the first person written to and why it was
 * opened are four parts of one thing, answered in any order. Changing a customer is the same form
 * reopened on it, its contact left to the Contacts facet that holds every one.
 *
 * Its fee is the contract every royalty run reads, so it is asked for and never assumed; a Warner
 * entity keeps none of its revenue, which the commit holds to whatever was typed.
 */
export function CustomerWizard({ customerId }: { customerId?: string }) {
  const editing = customerId !== undefined;
  const customer = editing ? customerById(customerId) : undefined;
  const record = customer ? RECORDS[customer.id]! : undefined;
  const leave = () => go(customer ? customerHref(customer.id, "Details") : accountsHref("customers"));

  const draft = {
    name: owed(customer?.name ?? ""),
    phone: owed(record?.phone ?? ""),
    email: owed(customer?.email ?? ""),
    address: record?.address ?? unanswered.text,
    country: owed(record?.country ?? ""),
    taxType: record?.taxType ?? unanswered.choice,
    taxId: record?.taxId ?? unanswered.text,
    standing: owed(record ? (record.newCustomer ? "New" : "Existing") : "New"),
    type: owed(customer?.type === "Warner entity" ? "Warner entity" : "Client"),
    dsp: customer ? owed(customer.dspRate) : owed.percent,
    ugc: record ? owed(record.ugcRate) : owed.percent,
    youtube: record ? owed(record.youtubeRate) : owed.percent,
    misc: record?.misc ?? 0,
    contactName: editing ? unanswered.text : owed.text,
    contactEmail: editing ? unanswered.email : owed.email,
    roles: ["Primary"] as readonly string[],
    // Asked of every new customer; one opened before the comment was asked keeps going without it.
    comment: editing ? (record?.comment ?? unanswered.longtext) : owed.longtext,
  };

  return (
    <Wizard
      noun={{ one: "customer", many: "customers" }}
      {...(editing ? { editing: true as const } : {})}
      note={
        editing
          ? undefined
          : "The customer holds the contract with Revelator: its fee becomes the account's contract in every royalty run. Its subscription and tenants follow."
      }
      onExit={leave}
      subject={(answers) => ({ kind: "organization", name: answers.name ?? "", meta: [answers.type ?? "Client"] })}
      draft={draft}
      onCommit={(answers) => {
        // A WARNER ENTITY keeps nothing: whatever was typed, its rates are none.
        const warner = answers.type === "Warner entity";
        const rate = (value: number) => (warner ? 0 : value);
        const taxType = answers.taxType || TAX_TYPE_OF[answers.country] || "Other";
        const company = {
          name: answers.name.trim(),
          email: answers.email.trim(),
          type: answers.type as CustomerType,
          dspRate: rate(answers.dsp),
        };
        const contract = {
          phone: answers.phone,
          address: answers.address || undefined,
          country: answers.country,
          taxType,
          taxId: answers.taxId || undefined,
          ugcRate: rate(answers.ugc),
          youtubeRate: rate(answers.youtube),
          misc: answers.misc ?? 0,
          newCustomer: answers.standing === "New",
          comment: (typeof answers.comment === "string" && answers.comment) || undefined,
        };
        if (customer) {
          updateCustomer(customer.id, company, contract);
          go(customerHref(customer.id, "Details"));
          return;
        }
        const id = addCustomer(
          { ...company, status: "Onboarding", subscriptions: [] },
          {
            ...contract,
            stripe: stripeId(),
            revelatorRevenue: 0,
            clientRevenue: 0,
            contacts: [
              { name: String(answers.contactName).trim(), email: String(answers.contactEmail).trim(), roles: answers.roles as Contact["roles"] },
            ],
          },
        );
        // Lands where the next step is owed: a new customer has no subscription yet.
        go(customerHref(id));
      }}
    >
      <WizardSection>
        <WizardSectionHeader title="Company" />
        <WizardSectionBody>
          <WizardRow title="Who it is">
            <WizardRowBody>
              <Field as="text" name="name" label="Company name" />
              <Field as="email" name="email" label="Email" />
              <Field as="phone" name="phone" label="Phone" />
            </WizardRowBody>
            <WizardRowTips>
              <WizardRowTip>
                The intake form does not collect everything yet: ask the requester for anything missing before you start.
                Where it gives no phone, enter your own.
              </WizardRowTip>
            </WizardRowTips>
          </WizardRow>
          <WizardRow title="New or existing">
            <WizardRowBody>
              <Field as="choice" name="standing" label="New or existing" options={choices(["New", "Existing"])} />
            </WizardRowBody>
          </WizardRow>
          <WizardRow title="Where it is taxed">
            <WizardRowBody>
              <Field as="country" name="country" label="Country" />
              <Field as="text" name="address" label="Address" />
              <Field
                as="choice"
                name="taxType"
                label="Tax ID type"
                noun={{ one: "tax ID type", many: "tax ID types" }}
                options={choices(TAX_TYPES)}
                help="Left blank, it follows the country."
              />
              <Field as="text" name="taxId" label="Tax ID" />
            </WizardRowBody>
          </WizardRow>
        </WizardSectionBody>
      </WizardSection>

      <WizardSection>
        <WizardSectionHeader title="Distribution contract" />
        <WizardSectionBody>
          <WizardRow title="Customer type">
            <WizardRowBody>
              <Field as="choice" name="type" label="Customer type" options={choices(TYPES)} />
            </WizardRowBody>
            <WizardRowTips>
              <WizardRowTip term="Client">Its rates are the deal memo's.</WizardRowTip>
              <WizardRowTip term="Warner entity">Revelator takes none of its revenue: every rate is saved as 0.</WizardRowTip>
            </WizardRowTips>
          </WizardRow>
          <WizardRow title="Rates">
            <WizardRowBody>
              <Field as="percent" name="dsp" label="DSP rate" help="What Revelator keeps of DSP revenue." />
              <Field as="percent" name="ugc" label="UGC rate" help="What Revelator keeps of UGC revenue." />
              <Field as="percent" name="youtube" label="YouTube channel rate" />
            </WizardRowBody>
            <WizardRowTips>
              <WizardRowTip>Take a client's fee from the signed deal memo, never from memory: it drives every royalty run.</WizardRowTip>
            </WizardRowTips>
          </WizardRow>
          <WizardRow title="Charges">
            <WizardRowBody>
              <Field as="money" name="misc" label="Miscellaneous charges" help="A monthly charge outside the rates." />
            </WizardRowBody>
            <WizardRowTips>
              <WizardRowTip>Leave it at 0 unless the contract says otherwise.</WizardRowTip>
            </WizardRowTips>
          </WizardRow>
        </WizardSectionBody>
      </WizardSection>

      {editing ? null : (
        <WizardSection>
          <WizardSectionHeader title="Contact" />
          <WizardSectionBody>
            <WizardRow title="Who Revelator writes to">
              <WizardRowBody>
                <Field as="text" name="contactName" label="Name" />
                <Field as="email" name="contactEmail" label="Email" />
                <Field as="choices" name="roles" label="Roles" options={choices(ROLES)} />
              </WizardRowBody>
              <WizardRowTips>
                <WizardRowTip>Roles say what they are written to about. They grant no permission.</WizardRowTip>
              </WizardRowTips>
            </WizardRow>
          </WizardSectionBody>
        </WizardSection>
      )}

      <WizardSection>
        <WizardSectionHeader title="Comment" />
        <WizardSectionBody>
          <WizardRow title="Why it was opened">
            <WizardRowBody>
              <Field as="longtext" name="comment" label="Comment" help="Any note a colleague would need — Warner imprint, referred by a partner." />
            </WizardRowBody>
          </WizardRow>
        </WizardSectionBody>
      </WizardSection>
    </Wizard>
  );
}
