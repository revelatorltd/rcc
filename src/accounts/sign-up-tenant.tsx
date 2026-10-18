import { useState } from "react";
import {
  Field,
  Input,
  Link,
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

import { accountsHref, customerHref, go, newCustomerHref, tenantHref } from "../route";
import { PLANS, addTenant, CUSTOMERS, customerById, nextEnterpriseId, RECORDS, signedUp, TODAY } from "./mock";

/** The customer every demo and API sandbox is signed up under. */
const DEMO_CUSTOMER = "232";

const choices = (values: readonly string[]) => values.map((value) => ({ value, title: value }));

/** A subdomain, as the organization's name gives one — lower case, letters and figures, at most 30. */
const slug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 30);

/**
 * A tenant signed up — its enterprise, its payee and its owner, in one commit — asking what RCC's
 * Sign up new tenant asks, in its order: the customer and the subscription it is signed up on,
 * the account owner, the account, and its distribution contract.
 *
 * A WIZARD on one flow. Only a customer with a subscription can take a tenant, so only those are
 * offered, and only the picked customer's subscription is taken. The tenant still needs a white label
 * before it loads: it opens on its Setup, which walks the rest.
 *
 * Opened from the tenants, or from a customer, which it then begins with.
 */
export function SignUpTenant({ customerId }: { customerId?: string }) {
  const given = customerId ? customerById(customerId) : undefined;
  const record = given ? RECORDS[given.id] : undefined;
  const leave = () => go(given ? customerHref(given.id, "Tenants") : accountsHref("tenants"));
  const offered = given && given.subscriptions.length > 0 ? [given] : CUSTOMERS.filter((one) => one.subscriptions.length > 0);
  // The PASSWORD is never kept: it is handed to the product as it is typed, and is not an answer.
  const [password, setPassword] = useState("");
  return (
    <Wizard
      verb="Sign up"
      noun={{ one: "tenant", many: "tenants" }}
      note="Creates the enterprise, its payee and the account owner. The tenant still needs a white label before it loads; its setup walks you through the rest."
      onExit={leave}
      subject={(answers) => ({ kind: "organization", name: answers.org ?? "", meta: [answers.plan ?? "", answers.setup ?? ""] })}
      draft={{
        customer: owed(given && given.subscriptions.length > 0 ? given.id : ""),
        sandbox: owed<string>(given?.id === DEMO_CUSTOMER ? "Yes" : "No"),
        subscription: owed(given?.subscriptions.length === 1 ? `${given.id}:${given.subscriptions[0]!.id}` : ""),
        firstName: owed.text,
        lastName: owed.text,
        ownerEmail: owed.email,
        org: owed(given && given.id !== DEMO_CUSTOMER ? given.name : ""),
        plan: owed<string>("1 - Free"),
        setup: owed<string>("Standalone"),
        country: unanswered.country,
        subdomain: unanswered.text,
        ugc: record ? owed(record.ugcRate) : owed.percent,
        dsp: given ? owed(given.dspRate) : owed.percent,
        youtube: record ? owed(record.youtubeRate) : owed.percent,
      }}
      // The SUBSCRIPTION is the picked customer's own.
      ready={(answers) => !answers.subscription || answers.subscription.startsWith(`${answers.customer}:`)}
      onCommit={(answers) => {
        const customer = customerById(answers.customer);
        const enterpriseId = nextEnterpriseId();
        addTenant(
          signedUp({
            enterpriseId,
            name: answers.org.trim(),
            customerId: customer.id,
            subscriptionId: answers.subscription.slice(customer.id.length + 1),
            plan: answers.plan,
            environment: answers.sandbox === "Yes" ? "Demo" : "Production",
            type: answers.setup === "Parent" ? "Parent" : "Standalone",
            created: TODAY,
            owner: { name: `${answers.firstName.trim()} ${answers.lastName.trim()}`, email: answers.ownerEmail.trim() },
            domain: `${answers.subdomain || slug(answers.org)}.revelator.pro`,
            minimumPayment: 0,
            rates: { dsp: answers.dsp, ugc: answers.ugc, youtube: answers.youtube },
          }),
        );
        go(tenantHref(enterpriseId, "Setup"));
      }}
    >
      <WizardSection>
        <WizardSectionHeader title="Customer and subscription" />
        <WizardSectionBody>
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
                help="Its contract fills the rates below."
              />
            </WizardRowBody>
            <WizardRowTips>
              <WizardRowTip>
                Only a customer with a subscription is offered. Not there yet? <Link opens={newCustomerHref()}>Create new customer</Link>, and
                add its subscription, before its first tenant.
              </WizardRowTip>
            </WizardRowTips>
          </WizardRow>
          <WizardRow title="Sandbox">
            <WizardRowBody>
              <Field
                as="choice"
                name="sandbox"
                label="Is sandbox"
                options={[
                  { value: "No", title: "No", description: "A live client: its releases reach the stores." },
                  { value: "Yes", title: "Yes", description: "A demo or an API partner's test bench, under the demo account. Nothing it releases goes live." },
                ]}
              />
            </WizardRowBody>
          </WizardRow>
          <WizardRow title="Subscription">
            <WizardRowBody>
              <Field
                as="record"
                name="subscription"
                label="Subscription"
                entity="document"
                noun={{ one: "subscription", many: "subscriptions" }}
                options={offered.flatMap((one) =>
                  one.subscriptions.map((each) => ({
                    value: `${one.id}:${each.id}`,
                    title: each.id,
                    code: [one.name, each.product, each.sandbox ? "Sandbox" : undefined].filter(Boolean).join(" · "),
                  })),
                )}
              />
            </WizardRowBody>
            <WizardRowTips>
              <WizardRowTip>The picked customer's own. A sandbox tenant goes on its sandbox subscription.</WizardRowTip>
            </WizardRowTips>
          </WizardRow>
        </WizardSectionBody>
      </WizardSection>

      <WizardSection>
        <WizardSectionHeader title="Account owner" />
        <WizardSectionBody>
          <WizardRow title="Who it is for">
            <WizardRowBody>
              <Field as="text" name="firstName" label="First name" />
              <Field as="text" name="lastName" label="Last name" />
              <Field as="email" name="ownerEmail" label="Email" />
              <Field label="Password">
                <Input type="password" value={password} onValueChange={setPassword} />
              </Field>
            </WizardRowBody>
            <WizardRowTips>
              <WizardRowTip>Leave the password blank: the owner sets their own, from the tenant's domain.</WizardRowTip>
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
              <Field as="choice" name="plan" label="Subscription plan" noun={{ one: "plan", many: "plans" }} options={choices(PLANS)} />
            </WizardRowBody>
          </WizardRow>
          <WizardRow title="Account setup">
            <WizardRowBody>
              <Field
                as="choice"
                name="setup"
                label="Account setup"
                options={[
                  { value: "Standalone", title: "Standalone", description: "One catalogue, its own." },
                  { value: "Parent", title: "Parent", description: "Holds client accounts, each with a catalogue and payee of its own." },
                ]}
              />
              <Field as="country" name="country" label="Tax domicile country" />
            </WizardRowBody>
          </WizardRow>
          <WizardRow title="Domain">
            <WizardRowBody>
              <Field as="text" name="subdomain" label="Subdomain" help="Used for login via a Revelator subdomain. Left blank, it is the organization's name." />
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
              <Field as="percent" name="ugc" label="UGC rate" help="Portion of UGC distribution revenue we keep; the remainder goes to the customer." />
              <Field as="percent" name="dsp" label="DSP rate" help="Portion of DSP distribution revenue we keep; the remainder goes to the customer." />
              <Field as="percent" name="youtube" label="YouTube channel rate" />
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
