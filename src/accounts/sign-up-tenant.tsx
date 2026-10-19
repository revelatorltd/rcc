import { useState } from "react";
import {
  Field,
  Input,
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

import { accountsHref, go, tenantHref } from "../route";
import { PLANS, addTenant, nextEnterpriseId, signedUp, TODAY } from "./mock";


const choices = (values: readonly string[]) => values.map((value) => ({ value, title: value }));

/** A subdomain, as the organization's name gives one — lower case, letters and figures, at most 30. */
const slug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 30);

/**
 * A tenant signed up — its enterprise, its payee and its owner, in one commit — asking what RCC's
 * Sign up new tenant asks, in its order, now that customers and subscriptions are gone from the
 * platform: whether it is a sandbox, the account owner, the account, and its distribution contract.
 *
 * A WIZARD on one flow. The tenant still needs a white label before it loads: it opens on its
 * Setup, which walks the rest.
 */
export function SignUpTenant() {
  const leave = () => go(accountsHref("tenants"));
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
        sandbox: owed<string>("No"),
        firstName: owed.text,
        lastName: owed.text,
        ownerEmail: owed.email,
        org: owed.text,
        plan: owed<string>("1 - Free"),
        setup: owed<string>("Standalone"),
        country: unanswered.country,
        subdomain: unanswered.text,
        ugc: owed.percent,
        dsp: owed.percent,
        youtube: owed.percent,
      }}
      onCommit={(answers) => {
        const enterpriseId = nextEnterpriseId();
        addTenant(
          signedUp({
            enterpriseId,
            name: answers.org.trim(),
            taxCountry: typeof answers.country === "string" && answers.country ? answers.country : undefined,
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
        <WizardSectionHeader title="Environment" />
        <WizardSectionBody>
          <WizardRow title="Sandbox">
            <WizardRowBody>
              <Field
                as="choice"
                name="sandbox"
                label="Is sandbox"
                options={[
                  { value: "No", title: "No", description: "A live client: its releases reach the stores." },
                  { value: "Yes", title: "Yes", description: "A demo or an API partner's test bench. Nothing it releases goes live." },
                ]}
              />
            </WizardRowBody>
            <WizardRowTips>
              <WizardRowTip>A tenant is no longer linked to a customer or a subscription: its contract is the rates below.</WizardRowTip>
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
                The client's domain until they connect their own. For a demo, decide now whether it will convert as it is — the
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
              <Field as="percent" name="ugc" label="UGC rate" help="Portion of UGC distribution revenue we keep; the remainder goes to the client." />
              <Field as="percent" name="dsp" label="DSP rate" help="Portion of DSP distribution revenue we keep; the remainder goes to the client." />
              <Field as="percent" name="youtube" label="YouTube channel rate" />
            </WizardRowBody>
            <WizardRowTips>
              <WizardRowTip>
                What Revelator keeps, from the client's contract; a Warner entity keeps 0. A demo's rates mean nothing — its
                releases never go live — but set them as the client's if it may convert.
              </WizardRowTip>
            </WizardRowTips>
          </WizardRow>
        </WizardSectionBody>
      </WizardSection>
    </Wizard>
  );
}
