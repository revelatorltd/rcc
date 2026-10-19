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

import { go, tenantHref, type TenantFacet } from "../route";
import {
  TODAY,
  addPartner,
  configDefaultsOf,
  nextEnterpriseId,
  tenantById,
  updateTenant,
  type ChildEnterprise,
  type Environment,
  type Tenant,
} from "./mock";
import { WhiteLabelWizard } from "./white-labels";

const choices = (values: readonly string[]) => values.map((value) => ({ value, title: value }));
const YES_NO = choices(["Yes", "No"]);
const yes = (value: boolean | undefined) => (value ? "Yes" : "No");
/** A switch the table also holds unset. */
const MAYBE = choices(["Yes", "No", "Not set"]);
const maybe = (value: boolean | null) => (value === null ? "Not set" : yes(value));
const unmaybe = (value: string) => (value === "Not set" ? null : value === "Yes");

/** Back to the tenant, on the facet the form grows. */
const back = (tenant: Tenant, facet: TenantFacet) => () => go(tenantHref(tenant.enterpriseId, facet));

/**
 * The tenant's configuration — where it delivers, how it signs in, and what it may do. A tenant is no
 * longer linked to a customer: what it pays against is its own distribution contract.
 */
export function TenantConfiguration({ id }: { id: string }) {
  const tenant = tenantById(id);
  const config = configDefaultsOf(tenant);
  const leave = back(tenant, "Tenant configuration");
  return (
    <Wizard
      editing
      noun={{ one: "tenant configuration", many: "tenant configurations" }}
      note={`${tenant.name} · enterprise ID ${tenant.enterpriseId}`}
      onExit={leave}
      subject={{ kind: "organization", name: tenant.name, meta: [tenant.environment] }}
      draft={{
        environment: owed(tenant.environment),
        authTenantId: owed(config.authTenantId),
        authClientId: owed(config.authClientId),
        domain: config.domain ?? unanswered.text,
        marketplacePage: owed(maybe(config.marketplacePage)),
        masterChannel: owed(maybe(config.masterChannel)),
        featureFm: owed(maybe(config.featureFm)),
        minAudioLength: owed(yes(config.minAudioLength)),
        physicalReleases: owed(yes(config.physicalReleases)),
        withholdingTax: owed(yes(config.withholdingTax)),
        noTransactionalEmails: owed(yes(config.noTransactionalEmails)),
      }}
      onCommit={(answers) => {
        const text = (value: unknown) => (typeof value === "string" && value.trim()) || undefined;
        const domain = text(answers.domain);
        updateTenant(tenant.enterpriseId, {
          environment: answers.environment as Environment,
          domain,
          config: {
            ...tenant.config,
            authTenantId: answers.authTenantId.trim(),
            authClientId: answers.authClientId.trim(),
            domain,
            marketplacePage: unmaybe(answers.marketplacePage),
            masterChannel: unmaybe(answers.masterChannel),
            featureFm: unmaybe(answers.featureFm),
            minAudioLength: answers.minAudioLength === "Yes",
            physicalReleases: answers.physicalReleases === "Yes",
            withholdingTax: answers.withholdingTax === "Yes",
            noTransactionalEmails: answers.noTransactionalEmails === "Yes",
          },
        });
        leave();
      }}
    >
      <WizardSection>
        <WizardSectionHeader title="Tenant configuration" />
        <WizardSectionBody>
          <WizardRow title="Where it delivers">
            <WizardRowBody>
              <Field as="choice" name="environment" label="Environment" options={choices(["Production", "Demo", "API sandbox"])} />
            </WizardRowBody>
            <WizardRowTips>
              <WizardRowTip>Is sandbox tenant: a demo or an API sandbox delivers nowhere. Convert it to production once the client is ready to go live.</WizardRowTip>
            </WizardRowTips>
          </WizardRow>
        </WizardSectionBody>
      </WizardSection>
          <WizardSection>
            <WizardSectionHeader title="Sign-in" />
            <WizardSectionBody>
              <WizardRow title="Auth">
                <WizardRowBody>
                  <Field as="identifier" standard="id" name="authTenantId" label="Auth tenant ID" />
                  <Field as="identifier" standard="id" name="authClientId" label="Auth client ID" />
                  <Field as="text" name="domain" label="Domain" />
                </WizardRowBody>
                <WizardRowTips>
                  <WizardRowTip>The tenant and client the auth service knows it by, and the domain it signs in on.</WizardRowTip>
                </WizardRowTips>
              </WizardRow>
            </WizardSectionBody>
          </WizardSection>
          <WizardSection>
            <WizardSectionHeader title="Features" />
            <WizardSectionBody>
              <WizardRow title="Pages and channels">
                <WizardRowBody>
                  <Field as="choice" name="marketplacePage" label="Marketplace page enabled" options={MAYBE} />
                  <Field as="choice" name="masterChannel" label="Master channel enabled" options={MAYBE} />
                  <Field as="choice" name="featureFm" label="Feature.fm enabled" options={MAYBE} />
                </WizardRowBody>
                <WizardRowTips>
                  <WizardRowTip>Not set leaves the switch empty in the table: the product's default applies.</WizardRowTip>
                </WizardRowTips>
              </WizardRow>
              <WizardRow title="Releases">
                <WizardRowBody>
                  <Field as="choice" name="minAudioLength" label="Minimum audio length validated" options={YES_NO} />
                  <Field as="choice" name="physicalReleases" label="Physical releases enabled" options={YES_NO} />
                </WizardRowBody>
              </WizardRow>
              <WizardRow title="Emails">
                <WizardRowBody>
                  <Field as="choice" name="noTransactionalEmails" label="All transactional emails turned off" options={YES_NO} />
                </WizardRowBody>
                <WizardRowTips>
                  <WizardRowTip>Nobody at the tenant is emailed — not even a password reset.</WizardRowTip>
                </WizardRowTips>
              </WizardRow>
            </WizardSectionBody>
          </WizardSection>
          <WizardSection>
            <WizardSectionHeader title="Payments" />
            <WizardSectionBody>
              <WizardRow title="Tax">
                <WizardRowBody>
                  <Field as="choice" name="withholdingTax" label="Withholding tax active" options={YES_NO} />
                </WizardRowBody>
              </WizardRow>
            </WizardSectionBody>
          </WizardSection>
    </Wizard>
  );
}

/**
 * The white label a tenant loads under — created, or changed — on the White labels' own form, given
 * the tenant, and returning to it.
 */
export function WhiteLabelForm({ id }: { id: string }) {
  const tenant = tenantById(id);
  const label = tenant.whiteLabel;
  return (
    <WhiteLabelWizard
      id={label?.id}
      tenantId={tenant.enterpriseId}
      back={tenantHref(tenant.enterpriseId, label ? "White label" : "Setup")}
    />
  );
}

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
      onCommit={(answers) => {
        const partnerId = addPartner({ name: answers.name.trim(), minimumPayment: answers.minimum, allOnTrial: true });
        updateTenant(tenant.enterpriseId, { partnerId });
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
