import { useState } from "react";
import {
  Button,
  Field,
  UploaderDocument,
  UploaderFileRow,
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

import { go, tenantHref, type TenantFacet } from "../route";
import {
  CUSTOMERS,
  TENANTS,
  TODAY,
  nextEnterpriseId,
  tenantById,
  updateTenant,
  type ChildEnterprise,
  type Environment,
  type Tenant,
} from "./mock";

const choices = (values: readonly string[]) => values.map((value) => ({ value, title: value }));
const YES_NO = choices(["Yes", "No"]);
const yes = (value: boolean | undefined) => (value ? "Yes" : "No");

/** The customer every demo and API sandbox is signed up under. */
const DEMO_CUSTOMER = "232";
const PLANS = ["2 - Starter", "3 - Growth", "4 - Enterprise"];
const CURRENCIES = ["USD", "EUR", "GBP", "SEK", "CAD", "AUD", "ILS", "JPY", "BRL", "MXN"];

/** Every customer, as a record a field offers — its mark and its id. */
const customerOptions = () =>
  CUSTOMERS.map((one) => ({
    value: one.id,
    title: one.name,
    code: one.id,
    art: one.organization ? ORGANIZATIONS[one.organization].art : undefined,
  }));

/** Back to the tenant, on the facet the form grows. */
const back = (tenant: Tenant, facet: TenantFacet) => () => go(tenantHref(tenant.enterpriseId, facet));

/**
 * The tenant's configuration — the customer it reports and pays against, and where it delivers.
 *
 * The same form CONVERTS a demo or a sandbox to production: it swaps the demo account for the real
 * customer, whose subscription and contract then apply, and the tenant delivers to the stores.
 * Linking a tenant no customer was tied to is this form too.
 */
export function TenantConfiguration({ id, convert }: { id: string; convert: boolean }) {
  const tenant = tenantById(id);
  const leave = back(tenant, "Setup");
  return (
    <Wizard
      {...(convert ? { verb: "Convert" } : { editing: true as const })}
      noun={{ one: convert ? "tenant to production" : "tenant configuration", many: "tenant configurations" }}
      note={`${tenant.name} · enterprise ID ${tenant.enterpriseId}`}
      onExit={leave}
      subject={{ kind: "organization", name: tenant.name, meta: [tenant.environment] }}
      draft={{
        customer: owed(convert && tenant.customerId === DEMO_CUSTOMER ? "" : (tenant.customerId ?? "")),
        environment: owed(convert ? "Production" : tenant.environment),
      }}
      // CONVERTING keeps no tenant under the demo account: the real customer is the point of it.
      ready={(answers) => !convert || answers.customer !== DEMO_CUSTOMER}
      onCommit={(answers) => {
        updateTenant(tenant.enterpriseId, {
          customerId: answers.customer,
          environment: answers.environment as Environment,
          // A tenant moved to production loses its sandbox stores and its API partner's bench.
          ...(convert ? { stores: undefined, storesLive: 0, partnerId: undefined } : {}),
        });
        leave();
      }}
    >
      <WizardSection>
        <WizardSectionHeader title="Tenant configuration" />
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
                options={customerOptions()}
              />
            </WizardRowBody>
            <WizardRowTips>
              <WizardRowTip>
                {convert
                  ? "Swap the demo account for the real customer: its subscription and contract then apply."
                  : "The contract holder this tenant reports and pays against."}
              </WizardRowTip>
            </WizardRowTips>
          </WizardRow>
          {convert ? null : (
            <WizardRow title="Where it delivers">
              <WizardRowBody>
                <Field as="choice" name="environment" label="Environment" options={choices(["Production", "Demo", "API sandbox"])} />
              </WizardRowBody>
              <WizardRowTips>
                <WizardRowTip>A demo or a sandbox delivers nowhere. Convert it to production once the customer is ready.</WizardRowTip>
              </WizardRowTips>
            </WizardRow>
          )}
        </WizardSectionBody>
      </WizardSection>
    </Wizard>
  );
}

/**
 * The enterprise itself — its name, its plan, how its payees are paid and what holds its account
 * back. RCC asks only what it holds; the product's every other setting is the product's own.
 */
export function EditEnterprise({ id }: { id: string }) {
  const tenant = tenantById(id);
  const leave = back(tenant, "Details");
  return (
    <Wizard
      editing
      noun={{ one: "enterprise", many: "enterprises" }}
      note={`${tenant.name} · enterprise ID ${tenant.enterpriseId}`}
      onExit={leave}
      subject={(answers) => ({ kind: "organization", name: answers.name ?? tenant.name, meta: [answers.plan ?? tenant.plan] })}
      draft={{
        name: owed(tenant.name),
        plan: owed(tenant.plan),
        partnerId: tenant.partnerId ?? unanswered.identifier,
        currency: owed(tenant.currency),
        minimumPayment: owed(tenant.minimumPayment),
        onTrial: owed(yes(tenant.onTrial)),
        lockedOut: owed(yes(tenant.lockedOut)),
        paymentBlocked: owed(yes(tenant.paymentBlocked)),
        fusionAuth: owed(yes(tenant.fusionAuth)),
      }}
      onCommit={(answers) => {
        updateTenant(tenant.enterpriseId, {
          name: answers.name.trim(),
          plan: answers.plan,
          partnerId: (typeof answers.partnerId === "string" && answers.partnerId) || undefined,
          currency: answers.currency,
          minimumPayment: answers.minimumPayment,
          onTrial: answers.onTrial === "Yes",
          lockedOut: answers.lockedOut === "Yes",
          paymentBlocked: answers.paymentBlocked === "Yes",
          fusionAuth: answers.fusionAuth === "Yes",
        });
        leave();
      }}
    >
      <WizardSection>
        <WizardSectionHeader title="Basics" />
        <WizardSectionBody>
          <WizardRow title="Enterprise">
            <WizardRowBody>
              <Field as="text" name="name" label="Name" />
              <Field as="choice" name="plan" label="Subscription plan" options={choices(PLANS)} />
              <Field as="identifier" standard="id" name="partnerId" label="Partner ID" help="The API partner it is connected to, where it is one." />
            </WizardRowBody>
          </WizardRow>
        </WizardSectionBody>
      </WizardSection>
      <WizardSection>
        <WizardSectionHeader title="Payments" />
        <WizardSectionBody>
          <WizardRow title="Payouts">
            <WizardRowBody>
              <Field as="choice" name="currency" label="Currency" noun={{ one: "currency", many: "currencies" }} options={choices(CURRENCIES)} />
              <Field as="money" name="minimumPayment" label="Minimum payment" help="The smallest payout a payee of the tenant is paid." />
            </WizardRowBody>
          </WizardRow>
        </WizardSectionBody>
      </WizardSection>
      <WizardSection>
        <WizardSectionHeader title="Access" />
        <WizardSectionBody>
          <WizardRow title="On trial">
            <WizardRowBody>
              <Field as="choice" name="onTrial" label="On trial" options={YES_NO} />
            </WizardRowBody>
          </WizardRow>
          <WizardRow title="Locked out">
            <WizardRowBody>
              <Field as="choice" name="lockedOut" label="Locked out" options={YES_NO} />
            </WizardRowBody>
            <WizardRowTips>
              <WizardRowTip>Nobody at a tenant locked out can sign in.</WizardRowTip>
            </WizardRowTips>
          </WizardRow>
          <WizardRow title="Payment blocked">
            <WizardRowBody>
              <Field as="choice" name="paymentBlocked" label="Payment blocked" options={YES_NO} />
            </WizardRowBody>
            <WizardRowTips>
              <WizardRowTip>No payee of a blocked tenant is paid.</WizardRowTip>
            </WizardRowTips>
          </WizardRow>
          <WizardRow title="Uses FusionAuth">
            <WizardRowBody>
              <Field as="choice" name="fusionAuth" label="Uses FusionAuth" options={YES_NO} />
            </WizardRowBody>
          </WizardRow>
        </WizardSectionBody>
      </WizardSection>
    </Wizard>
  );
}

/** The next white label id — issued in order across every tenant. */
const nextWhiteLabelId = () =>
  String(Math.max(...TENANTS.map((one) => Number(one.whiteLabel?.id ?? 0))) + 1);

/**
 * The white label a tenant loads under — created, or changed. Every tenant needs one, white label
 * client or not: without it the tenant does not load. Its domain begins as the tenant's own.
 */
export function WhiteLabelForm({ id }: { id: string }) {
  const tenant = tenantById(id);
  const label = tenant.whiteLabel;
  const editing = label !== undefined;
  const leave = back(tenant, editing ? "White label" : "Setup");
  return (
    <Wizard
      {...(editing ? { editing: true as const } : {})}
      noun={{ one: "white label", many: "white labels" }}
      note={editing ? `White label ${label.id} · ${tenant.name}` : `For ${tenant.name}. Its domain begins as the tenant's own.`}
      onExit={leave}
      subject={(answers) => ({ kind: "organization", name: answers.domain ?? "", meta: [tenant.name] })}
      draft={{
        domain: owed(label?.domain ?? tenant.domain ?? ""),
        enabled: owed(yes(label?.enabled)),
        allowSignup: owed(yes(label?.allowSignup)),
        allowForgotPassword: owed(yes(label?.allowForgotPassword ?? true)),
        title: owed(label?.title ?? tenant.name),
        showRevelatorBranding: owed(yes(label?.showRevelatorBranding)),
        termsUrl: label?.termsUrl ?? unanswered.url,
        faqUrl: label?.faqUrl ?? unanswered.url,
        helpUrl: label?.helpUrl ?? unanswered.url,
      }}
      onCommit={(answers) => {
        const url = (value: unknown) => (typeof value === "string" && value) || undefined;
        updateTenant(tenant.enterpriseId, {
          whiteLabel: {
            id: label?.id ?? nextWhiteLabelId(),
            domain: answers.domain.trim(),
            title: answers.title.trim(),
            enabled: answers.enabled === "Yes",
            allowSignup: answers.allowSignup === "Yes",
            allowForgotPassword: answers.allowForgotPassword === "Yes",
            showRevelatorBranding: answers.showRevelatorBranding === "Yes",
            termsUrl: url(answers.termsUrl),
            faqUrl: url(answers.faqUrl),
            helpUrl: url(answers.helpUrl),
          },
        });
        leave();
      }}
    >
      <WizardSection>
        <WizardSectionHeader title="Domain and sign-in" />
        <WizardSectionBody>
          <WizardRow title="Domain">
            <WizardRowBody>
              <Field as="text" name="domain" label="Domain" />
            </WizardRowBody>
            <WizardRowTips>
              <WizardRowTip>The tenant's full domain, as its configuration names it. Sign-in goes through auth.revelator.pro.</WizardRowTip>
            </WizardRowTips>
          </WizardRow>
          <WizardRow title="White label enabled">
            <WizardRowBody>
              <Field as="choice" name="enabled" label="White label enabled" options={YES_NO} />
            </WizardRowBody>
            <WizardRowTips>
              <WizardRowTip>Only if the client bought white label: it unlocks their own domain and the sign-in designer.</WizardRowTip>
            </WizardRowTips>
          </WizardRow>
          <WizardRow title="Allows sign-up">
            <WizardRowBody>
              <Field as="choice" name="allowSignup" label="Allows sign-up" options={YES_NO} />
            </WizardRowBody>
          </WizardRow>
          <WizardRow title="Allows password reset">
            <WizardRowBody>
              <Field as="choice" name="allowForgotPassword" label="Allows password reset" options={YES_NO} />
            </WizardRowBody>
            <WizardRowTips>
              <WizardRowTip>The owner sets their first password this way: leave it on.</WizardRowTip>
            </WizardRowTips>
          </WizardRow>
        </WizardSectionBody>
      </WizardSection>
      <WizardSection>
        <WizardSectionHeader title="Branding" />
        <WizardSectionBody>
          <WizardRow title="What it shows">
            <WizardRowBody>
              <Field as="text" name="title" label="Title" />
              <Field as="choice" name="showRevelatorBranding" label="Shows Revelator's branding" options={YES_NO} />
            </WizardRowBody>
          </WizardRow>
        </WizardSectionBody>
      </WizardSection>
      <WizardSection>
        <WizardSectionHeader title="Links" />
        <WizardSectionBody>
          <WizardRow title="Where it sends people">
            <WizardRowBody>
              <Field as="url" name="termsUrl" label="Terms and conditions" />
              <Field as="url" name="faqUrl" label="FAQ" />
              <Field as="url" name="helpUrl" label="Help" />
            </WizardRowBody>
          </WizardRow>
        </WizardSectionBody>
      </WizardSection>
    </Wizard>
  );
}

/** The next partner id — issued in order across every tenant connected to one. */
const nextPartnerId = () => String(Math.max(240, ...TENANTS.map((one) => Number(one.partnerId ?? 0))) + 1);

/**
 * An API partner created for a sandbox, and connected to it — its API key issued with it. The
 * owner still needs a partner user id before the key works, which the product gives by hand.
 */
export function ApiPartner({ id }: { id: string }) {
  const tenant = tenantById(id);
  const leave = back(tenant, "Setup");
  return (
    <Wizard
      noun={{ one: "API partner", many: "API partners" }}
      note={`Connects ${tenant.name} to the API, as an API sandbox.`}
      onExit={leave}
      subject={(answers) => ({ kind: "organization", name: answers.name ?? "", meta: ["API partner"] })}
      draft={{
        name: owed(`${tenant.name.replace(/\s*(demo|sandbox|api trial)$/i, "")} Sandbox`),
        minimum: owed(0),
      }}
      onCommit={() => {
        updateTenant(tenant.enterpriseId, { partnerId: nextPartnerId() });
        leave();
      }}
    >
      <WizardSection>
        <WizardSectionHeader title="Details" />
        <WizardSectionBody>
          <WizardRow title="Partner">
            <WizardRowBody>
              <Field as="text" name="name" label="Partner name" />
              <Field as="money" name="minimum" label="Minimum payment" />
            </WizardRowBody>
            <WizardRowTips>
              <WizardRowTip>Name it after the account. A sandbox's minimum payment is 0.</WizardRowTip>
            </WizardRowTips>
          </WizardRow>
        </WizardSectionBody>
      </WizardSection>
    </Wizard>
  );
}

/** What an imported template lists — invented client accounts, the same for every import. */
const TEMPLATE = ["Larkspur Sound", "Quarry Lane", "Ember & Oak", "Tidewater Folk", "Northgate Choir", "Pale Comet"];

/**
 * Client accounts imported under a parent tenant from the completed template — each a child
 * enterprise with its payee. Bulk import is the only way RCC creates them; otherwise the tenant
 * creates its own in the product.
 */
export function ImportChildren({ id }: { id: string }) {
  const tenant = tenantById(id);
  const leave = back(tenant, "Children");
  const [file, setFile] = useState<File | null>(null);
  return (
    <Wizard
      verb="Import"
      noun={{ one: "client account", many: "client accounts" }}
      note={`Creates client accounts and their payees under ${tenant.name}, in one go.`}
      onExit={leave}
      subject={{ kind: "organization", name: tenant.name, meta: file ? [file.name] : [] }}
      ready={file !== null}
      onCommit={() => {
        const first = Number(nextEnterpriseId());
        const imported: ChildEnterprise[] = TEMPLATE.map((name, at) => ({
          enterpriseId: String(first + at),
          name,
          payeeId: String(first + at + 311_000),
          created: TODAY,
        }));
        updateTenant(tenant.enterpriseId, { children: [...tenant.children, ...imported] });
        leave();
      }}
    >
      <WizardSection>
        <WizardSectionHeader title="Template" />
        <WizardSectionBody>
          <WizardRow title="Catalog-ingest template">
            <WizardRowBody>
              <Button variant="secondary">Download template</Button>
            </WizardRowBody>
          </WizardRow>
          <WizardRow title="Completed template">
            <WizardRowBody>
              <UploaderDocument
                accept=".csv,.xlsx"
                multiple={false}
                formats="CSV or XLSX"
                noun={{ one: "template", many: "templates" }}
                onSelect={(files) => setFile(files[0] ?? null)}
              >
                {file ? <UploaderFileRow name={file.name} phase="landed" fileSize={file.size} onRemove={() => setFile(null)} /> : null}
              </UploaderDocument>
            </WizardRowBody>
            <WizardRowTips>
              <WizardRowTip>It lists the clients and their payees. Check the count matches the template once they are created.</WizardRowTip>
            </WizardRowTips>
          </WizardRow>
        </WizardSectionBody>
      </WizardSection>
    </Wizard>
  );
}
