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

import { customerHref, go } from "../route";
import { addSubscription, customerById, TODAY, type Subscription } from "./mock";

const PRODUCTS: readonly Subscription["product"][] = ["Enterprise", "Revelator Pro", "API"];
/** The one coupon Revelator applies: a Warner entity's live subscription is never billed. */
const FREE_COUPON = "Free accounts – 100% off forever";

const choices = (values: readonly string[]) => values.map((value) => ({ value, title: value }));

/** A Stripe subscription id, where none was pasted — RCC creates a demo's itself. */
const subscriptionId = () => `sub_1R${Math.random().toString(36).slice(2, 12)}`;

/**
 * A subscription linked to a customer — the step no tenant can be signed up before.
 *
 * A live one is created in Stripe first, on the Enterprise plan, monthly; this links it. A demo's
 * sandbox is created here. Opens from the customer and returns to its Subscriptions.
 */
export function AddSubscription({ customerId }: { customerId: string }) {
  const customer = customerById(customerId);
  const demo = customer.type === "Demo";
  const warner = customer.type === "Warner entity";
  const leave = () => go(customerHref(customer.id, "Subscriptions"));
  return (
    <Wizard
      verb="Add"
      noun={{ one: "subscription", many: "subscriptions" }}
      note={`For ${customer.name}. ${demo ? "Demo and sandbox subscriptions are created here." : "Create it in Stripe first, then link it here."}`}
      onExit={leave}
      subject={(answers) => ({ kind: "organization", name: customer.name, meta: [answers.product ?? "", answers.kind ?? ""] })}
      draft={{
        stripeId: demo ? unanswered.text : owed.text,
        kind: owed(demo ? "Sandbox" : "Live"),
        product: owed(demo ? "Revelator Pro" : "Enterprise"),
        note: owed.text,
      }}
      onCommit={(answers) => {
        const sandbox = answers.kind === "Sandbox";
        addSubscription(customer.id, {
          id: (typeof answers.stripeId === "string" && answers.stripeId.trim()) || subscriptionId(),
          sandbox,
          product: answers.product as Subscription["product"],
          // A WARNER ENTITY's live subscription carries the free coupon, so it is never billed.
          coupon: warner && !sandbox ? FREE_COUPON : undefined,
          note: answers.note,
          linked: TODAY,
        });
        go(customerHref(customer.id, "Subscriptions"));
      }}
    >
      <WizardSection>
        <WizardSectionHeader title="Link in RCC" />
        <WizardSectionBody>
          <WizardRow title="Stripe subscription">
            <WizardRowBody>
              <Field
                as="text"
                name="stripeId"
                label="Subscription ID"
                help={demo ? "Left blank, RCC creates the sandbox subscription." : "Starts sub_ — copy it from the customer in Stripe."}
              />
            </WizardRowBody>
            <WizardRowTips>
              <WizardRowTip>
                {demo
                  ? "A demo's subscriptions live in RCC, never in Stripe."
                  : `Open ${customer.name} in Stripe and create a subscription on the Enterprise plan, monthly.`}
                {warner ? ` Apply the coupon ${FREE_COUPON}, or the customer may be asked to pay.` : ""}
              </WizardRowTip>
            </WizardRowTips>
          </WizardRow>
          <WizardRow title="Type">
            <WizardRowBody>
              <Field as="choice" name="kind" label="Type" options={choices(["Live", "Sandbox"])} />
            </WizardRowBody>
            <WizardRowTips>
              <WizardRowTip term="Sandbox">Only for demos and API sandboxes, under the demo account.</WizardRowTip>
            </WizardRowTips>
          </WizardRow>
          <WizardRow title="Product">
            <WizardRowBody>
              <Field as="choice" name="product" label="Product plan" options={choices(PRODUCTS)} />
            </WizardRowBody>
            <WizardRowTips>
              <WizardRowTip term="Enterprise">For live tenants.</WizardRowTip>
              <WizardRowTip term="Revelator Pro">For demos.</WizardRowTip>
              <WizardRowTip term="API">For API sandboxes.</WizardRowTip>
            </WizardRowTips>
          </WizardRow>
          <WizardRow title="Note">
            <WizardRowBody>
              <Field as="text" name="note" label="Note" help="What it is for — a Warner imprint, demo tenants." />
            </WizardRowBody>
          </WizardRow>
        </WizardSectionBody>
      </WizardSection>
    </Wizard>
  );
}
