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
import { ORGANIZATIONS } from "@revelator/pro-ui/assets";

import { accountsHref, customerHref, go, tenantHref } from "../route";
import { addTenant, CUSTOMERS, customerById, nextEnterpriseId, RECORDS, signedUp, TODAY, type Environment } from "./mock";

const ENVIRONMENTS: readonly Environment[] = ["Production", "Demo", "API sandbox"];
const PLANS = ["2 - Starter", "3 - Growth", "4 - Enterprise"];
/** The customer every demo and API sandbox is signed up under. */
const DEMO_CUSTOMER = "232";

const choices = (values: readonly string[]) => values.map((value) => ({ value, title: value }));

/** A rate answered, or the contract's where it was left blank. */
const rateOr = (answer: unknown, contract: number) => (typeof answer === "number" ? answer : contract);

/** A subdomain, as the organization's name gives one — lower case, letters and figures, at most 30. */
const slug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 30);

/**
 * A tenant signed up — its enterprise, its payee and its owner, in one commit.
 *
 * A WIZARD on one flow. Only a customer with a subscription can take a tenant, so only those are
 * offered; the commit links the customer's subscription that fits where the tenant delivers. The
 * tenant still needs a white label before it loads: it opens on its Setup, which walks the rest.
 *
 * Opened from the tenants, or from a customer, which it then begins with.
 */
export function SignUpTenant({ customerId }: { customerId?: string }) {
  const given = customerId ? customerById(customerId) : undefined;
  const record = given ? RECORDS[given.id] : undefined;
  const leave = () => go(given ? customerHref(given.id, "Tenants") : accountsHref("tenants"));
  const offered = CUSTOMERS.filter((one) => one.subscriptions.length > 0);
  return (
    <Wizard
      verb="Sign up"
      noun={{ one: "tenant", many: "tenants" }}
      note="Creates the enterprise, its payee and the account owner. The tenant still needs a white label before it loads; its setup walks you through the rest."
      onExit={leave}
      subject={(answers) => ({ kind: "organization", name: answers.org ?? "", meta: [answers.environment ?? "", answers.plan ?? ""] })}
      draft={{
        environment: owed(given?.id === DEMO_CUSTOMER ? "Demo" : "Production"),
        customer: owed(given && given.subscriptions.length > 0 ? given.id : ""),
        ownerName: owed.text,
        ownerEmail: owed.email,
        org: owed(given && given.id !== DEMO_CUSTOMER ? given.name : ""),
        plan: owed("4 - Enterprise"),
        country: unanswered.country,
        subdomain: unanswered.text,
        dsp: given ? owed(given.dspRate) : unanswered.percent,
        ugc: record ? owed(record.ugcRate) : unanswered.percent,
        youtube: record ? owed(record.youtubeRate) : unanswered.percent,
      }}
      onCommit={(answers) => {
        const customer = customerById(answers.customer);
        const contract = RECORDS[customer.id]!;
        const enterpriseId = nextEnterpriseId();
        addTenant(
          signedUp({
            enterpriseId,
            name: answers.org.trim(),
            customerId: customer.id,
            plan: answers.plan,
            environment: answers.environment as Environment,
            type: "Parent",
            created: TODAY,
            owner: { name: answers.ownerName.trim(), email: answers.ownerEmail.trim() },
            domain: `${answers.subdomain || slug(answers.org)}.revelator.pro`,
            minimumPayment: 0,
            // Unanswered, a rate is the customer's contract.
            rates: {
              dsp: rateOr(answers.dsp, customer.dspRate),
              ugc: rateOr(answers.ugc, contract.ugcRate),
              youtube: rateOr(answers.youtube, contract.youtubeRate),
            },
          }),
        );
        go(tenantHref(enterpriseId, "Setup"));
      }}
    >
      <WizardSection>
        <WizardSectionHeader title="Customer and subscription" />
        <WizardSectionBody>
          <WizardRow title="Where it delivers">
            <WizardRowBody>
              <Field as="choice" name="environment" label="Environment" options={choices(ENVIRONMENTS)} />
            </WizardRowBody>
            <WizardRowTips>
              <WizardRowTip term="Production">A live client: its releases reach the stores.</WizardRowTip>
              <WizardRowTip term="Demo">A prospect trying the product. Sign it up under the demo account; nothing it releases goes live.</WizardRowTip>
              <WizardRowTip term="API sandbox">An API partner's test bench, under the demo account too.</WizardRowTip>
            </WizardRowTips>
          </WizardRow>
          <WizardRow title="Customer">
            <WizardRowBody>
              <Field
                as="record"
                name="customer"
                label="Customer"
                entity="organization"
                noun={{ one: "customer", many: "customers" }}
                standard="id"
                options={offered.map((one) => ({
                  value: one.id,
                  title: one.name,
                  code: one.id,
                  art: one.organization ? ORGANIZATIONS[one.organization].art : undefined,
                }))}
                help="Its subscription is linked with the tenant, and its contract fills the rates below."
              />
            </WizardRowBody>
            <WizardRowTips>
              <WizardRowTip>
                Only a customer with a subscription is offered. A new one is created from Customers, and its subscription added
                there, before its first tenant.
              </WizardRowTip>
            </WizardRowTips>
          </WizardRow>
        </WizardSectionBody>
      </WizardSection>

      <WizardSection>
        <WizardSectionHeader title="Account owner" />
        <WizardSectionBody>
          <WizardRow title="Who it is for">
            <WizardRowBody>
              <Field as="text" name="ownerName" label="Name" />
              <Field as="email" name="ownerEmail" label="Email" help="They set their own password, from the tenant's domain." />
            </WizardRowBody>
            <WizardRowTips>
              <WizardRowTip>For a demo, copy the owner from the request's Monday item.</WizardRowTip>
            </WizardRowTips>
          </WizardRow>
        </WizardSectionBody>
      </WizardSection>

      <WizardSection>
        <WizardSectionHeader title="Account" />
        <WizardSectionBody>
          <WizardRow title="Organization">
            <WizardRowBody>
              <Field as="text" name="org" label="Organization name" />
              <Field as="choice" name="plan" label="Subscription plan" options={choices(PLANS)} />
              <Field as="country" name="country" label="Tax domicile country" />
            </WizardRowBody>
            <WizardRowTips>
              <WizardRowTip>Enterprise, the highest plan, for every new tenant. A tenant is signed up as a parent: standalone is retired.</WizardRowTip>
            </WizardRowTips>
          </WizardRow>
          <WizardRow title="Domain">
            <WizardRowBody>
              <Field as="text" name="subdomain" label="Subdomain" help="Followed by .revelator.pro. Left blank, it is the organization's name." />
            </WizardRowBody>
            <WizardRowTips>
              <WizardRowTip>
                The customer's domain until they connect their own. For a demo, decide now whether it will convert as it is — the
                real name — or stay a demo, and say so in it.
              </WizardRowTip>
            </WizardRowTips>
          </WizardRow>
        </WizardSectionBody>
      </WizardSection>

      <WizardSection>
        <WizardSectionHeader title="Distribution contract" />
        <WizardSectionBody>
          <WizardRow title="Rates">
            <WizardRowBody>
              <Field as="percent" name="dsp" label="DSP rate" />
              <Field as="percent" name="ugc" label="UGC rate" />
              <Field as="percent" name="youtube" label="YouTube channel rate" help="Left blank, each rate is the customer's." />
            </WizardRowBody>
            <WizardRowTips>
              <WizardRowTip>
                Filled from the customer's contract; a Warner entity keeps 0. A demo's rates mean nothing — its releases never go
                live — so keeping the demo account's saves editing them if it converts.
              </WizardRowTip>
            </WizardRowTips>
          </WizardRow>
        </WizardSectionBody>
      </WizardSection>
    </Wizard>
  );
}
