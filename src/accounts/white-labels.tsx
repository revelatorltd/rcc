import {
  Avatar,
  Badge,
  CollectionPage,
  ConfirmationDialog,
  FactCard,
  Field,
  Link,
  Metadata,
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
  type HeldBy,
} from "@revelator/pro-ui";

import { editWhiteLabelHref, go, newWhiteLabelHref, partnerHref, tenantHref, whiteLabelHref } from "../route";
import {
  PARTNERS,
  REVELATOR_AUTH,
  TENANTS,
  deleteWhiteLabel,
  nextWhiteLabelId,
  partnerById,
  saveWhiteLabel,
  tenantById,
  whiteLabelById,
  whiteLabels,
  type WhiteLabel,
  type WhiteLabelRecord,
} from "./mock";
import { tenantPicture } from "./tenants";

const YES_NO = [
  { value: "Yes", title: "Yes" },
  { value: "No", title: "No" },
];
const yes = (value: boolean | undefined) => (value ? "Yes" : "No");

/** A white label, as the mark it is known by — the title its sign-in page wears. */
export const whiteLabelMark = (one: { title: string }) => <Avatar kind="organization" name={one.title || "White label"} />;

/** Whether a white label is switched on, in the system's family for a setting. */
export const enabledBadge = (on: boolean | undefined) => <Badge status={on ? "feature:Enabled" : "feature:Disabled"} />;

/**
 * Everything a white label holds, in the order its form asks it: where it loads and who it is for,
 * what its sign-in pages say, what it shows, where it sends people, and the services it runs.
 * Read the same on the white label's page and on the tenant it loads.
 */
export function WhiteLabelFacts({ label, tenant }: { label: WhiteLabel; tenant?: { enterpriseId: string; name: string } }) {
  const partner = label.partnerId ? partnerById(label.partnerId) : undefined;
  return (
    <Metadata>
      <FactCard
        title="Domain and sign-in"
        facts={[
          { label: "White label ID", value: label.id, standard: "id" },
          { label: "Domain", value: label.domain },
          { label: "Domain V2", value: label.domainV2 },
          { label: "Auth base URL", value: label.authBaseUrl },
          {
            label: "Tenant",
            value: tenant ? <Link opens={tenantHref(tenant.enterpriseId)}>{tenant.name}</Link> : "Revelator's own",
          },
          { label: "Partner", value: partner ? <Link opens={partnerHref(partner.id)}>{partner.name}</Link> : undefined },
          { label: "White label enabled", value: enabledBadge(label.enabled) },
          { label: "Is default", value: yes(label.isDefault) },
          { label: "Allows sign-up", value: yes(label.allowSignup) },
          { label: "Allows password reset", value: yes(label.allowForgotPassword ?? true) },
        ]}
      />
      <FactCard
        title="Sign-in pages"
        facts={[
          { label: "Login page header", value: label.loginHeader },
          { label: "Login page subheader", value: label.loginSubheader },
          { label: "Sign-up page header", value: label.signupHeader },
          { label: "Sign-up page subheader", value: label.signupSubheader },
        ]}
      />
      <FactCard
        title="Branding"
        facts={[
          { label: "Title", value: label.title },
          { label: "Shows Revelator's branding", value: yes(label.showRevelatorBranding) },
          { label: "Shows ads", value: yes(label.showAds) },
          { label: "Default plan ID", value: label.defaultPlanId, standard: "id" },
          { label: "CSS file", value: label.cssFile },
        ]}
      />
      <FactCard
        title="Links"
        facts={[
          { label: "Terms and conditions file", value: label.termsUrl },
          { label: "Distribution agreement", value: label.distributionAgreementUrl },
          { label: "FAQ", value: label.faqUrl },
          { label: "Help", value: label.helpUrl },
          { label: "Custom logout URL", value: label.customLogoutUrl },
          { label: "Custom dashboard link URL", value: label.customDashboardLinkUrl },
          { label: "Custom dashboard link text", value: label.customDashboardLinkText },
        ]}
      />
      <FactCard
        title="Services"
        facts={[
          { label: "Intercom enabled", value: yes(label.enableIntercom) },
          { label: "Intercom app ID", value: label.intercomAppId },
          { label: "Google Analytics site ID", value: label.googleAnalyticsSiteId },
          { label: "BCC emails", value: label.bccEmails },
        ]}
      />
    </Metadata>
  );
}

/**
 * A white label deleted — asked first: the tenant it loads, if it loads one, no longer does.
 */
export function DeleteWhiteLabel({ label, after, ...held }: HeldBy & { label: WhiteLabelRecord; after?: () => void }) {
  return (
    <ConfirmationDialog
      {...held}
      asks={
        label.tenant
          ? `White label ${label.id} (${label.domain}) is deleted, and ${label.tenant.name} no longer loads until it has another.`
          : `White label ${label.id} (${label.domain}) is deleted.`
      }
      confirm="Delete"
      destructive
      onCommit={() => {
        deleteWhiteLabel(label.id);
        after?.();
      }}
    />
  );
}

/**
 * A white label — created, or changed. Every tenant needs one, white label client or not: without
 * it the tenant does not load. Created from a tenant, it is that tenant's and its domain begins as
 * the tenant's own; created here, the tenant it loads is asked, or none for one of Revelator's own.
 *
 * `back` is where the reader returns, committed or not.
 */
export function WhiteLabelWizard({ id, tenantId, back }: { id?: string; tenantId?: string; back: string }) {
  const label = id ? whiteLabelById(id) : undefined;
  const editing = label !== undefined;
  const fixedTenant = tenantId ? tenantById(tenantId) : undefined;
  const leave = () => go(back);
  // The tenants a white label can be given to: those without one, and the one it already loads.
  const offered = TENANTS.filter((one) => !one.whiteLabel || one.whiteLabel.id === id);
  return (
    <Wizard
      {...(editing ? { editing: true as const } : {})}
      noun={{ one: "white label", many: "white labels" }}
      note={
        editing
          ? `White label ${label.id}${label.tenant ? ` · ${label.tenant.name}` : ""}`
          : fixedTenant
            ? `For ${fixedTenant.name}. Its domain begins as the tenant's own.`
            : "Every tenant needs one, white label client or not. One loading no tenant is Revelator's own."
      }
      onExit={leave}
      subject={(answers) => ({ kind: "organization", name: answers.domain ?? "", meta: [answers.title ?? ""] })}
      draft={{
        domain: owed(label?.domain ?? fixedTenant?.domain ?? ""),
        domainV2: label?.domainV2 ?? fixedTenant?.domain ?? unanswered.text,
        authBaseUrl: owed(label?.authBaseUrl ?? REVELATOR_AUTH),
        tenant: fixedTenant ? fixedTenant.enterpriseId : (label?.tenant?.enterpriseId ?? unanswered.record),
        partner: label?.partnerId ?? fixedTenant?.partnerId ?? unanswered.record,
        enabled: owed(yes(label?.enabled)),
        isDefault: owed(yes(label?.isDefault)),
        allowSignup: owed(yes(label?.allowSignup)),
        allowForgotPassword: owed(yes(label?.allowForgotPassword ?? true)),
        loginHeader: label?.loginHeader ?? unanswered.text,
        loginSubheader: label?.loginSubheader ?? unanswered.text,
        signupHeader: label?.signupHeader ?? unanswered.text,
        signupSubheader: label?.signupSubheader ?? unanswered.text,
        title: owed(label?.title ?? fixedTenant?.name ?? ""),
        showRevelatorBranding: owed(yes(label?.showRevelatorBranding)),
        showAds: owed(yes(label?.showAds)),
        defaultPlanId: owed(label?.defaultPlanId ?? "3"),
        cssFile: label?.cssFile ?? unanswered.url,
        termsUrl: label?.termsUrl ?? unanswered.url,
        distributionAgreementUrl: label?.distributionAgreementUrl ?? unanswered.url,
        faqUrl: label?.faqUrl ?? unanswered.url,
        helpUrl: label?.helpUrl ?? unanswered.url,
        customLogoutUrl: label?.customLogoutUrl ?? unanswered.url,
        customDashboardLinkUrl: label?.customDashboardLinkUrl ?? unanswered.url,
        customDashboardLinkText: label?.customDashboardLinkText ?? unanswered.text,
        enableIntercom: owed(yes(label?.enableIntercom)),
        intercomAppId: label?.intercomAppId ?? unanswered.text,
        googleAnalyticsSiteId: label?.googleAnalyticsSiteId ?? unanswered.text,
        bccEmails: label?.bccEmails ?? unanswered.text,
      }}
      onCommit={(answers) => {
        const text = (value: unknown) => (typeof value === "string" && value.trim()) || undefined;
        const saved: WhiteLabel = {
          id: label?.id ?? nextWhiteLabelId(),
          domain: answers.domain.trim(),
          domainV2: text(answers.domainV2),
          authBaseUrl: answers.authBaseUrl.trim(),
          title: answers.title.trim(),
          partnerId: text(answers.partner),
          enabled: answers.enabled === "Yes",
          isDefault: answers.isDefault === "Yes",
          allowSignup: answers.allowSignup === "Yes",
          allowForgotPassword: answers.allowForgotPassword === "Yes",
          loginHeader: text(answers.loginHeader),
          loginSubheader: text(answers.loginSubheader),
          signupHeader: text(answers.signupHeader),
          signupSubheader: text(answers.signupSubheader),
          showRevelatorBranding: answers.showRevelatorBranding === "Yes",
          showAds: answers.showAds === "Yes",
          defaultPlanId: answers.defaultPlanId.trim(),
          // The STYLESHEET is set when it is made, and kept from then on.
          cssFile: editing ? label.cssFile : text(answers.cssFile),
          termsUrl: text(answers.termsUrl),
          distributionAgreementUrl: text(answers.distributionAgreementUrl),
          faqUrl: text(answers.faqUrl),
          helpUrl: text(answers.helpUrl),
          customLogoutUrl: text(answers.customLogoutUrl),
          customDashboardLinkUrl: text(answers.customDashboardLinkUrl),
          customDashboardLinkText: text(answers.customDashboardLinkText),
          enableIntercom: answers.enableIntercom === "Yes",
          intercomAppId: text(answers.intercomAppId),
          googleAnalyticsSiteId: text(answers.googleAnalyticsSiteId),
          bccEmails: text(answers.bccEmails),
        };
        saveWhiteLabel(saved, text(answers.tenant));
        go(fixedTenant ? back : whiteLabelHref(saved.id));
      }}
    >
      <WizardSection>
        <WizardSectionHeader title="Domain and sign-in" />
        <WizardSectionBody>
          <WizardRow title="Domain">
            <WizardRowBody>
              <Field as="text" name="domain" label="Domain" />
              <Field as="text" name="domainV2" label="Domain V2" />
              <Field as="url" name="authBaseUrl" label="Auth base URL" />
            </WizardRowBody>
            <WizardRowTips>
              <WizardRowTip>The tenant's full domain, copied from its configuration. It is the old field, but the form does not save without it.</WizardRowTip>
              <WizardRowTip>Domain V2: paste the same domain.</WizardRowTip>
              <WizardRowTip>Auth base URL: Revelator's own unless the client runs its own sign-in. It only handles the login redirect.</WizardRowTip>
            </WizardRowTips>
          </WizardRow>
          <WizardRow title="Whose it is">
            <WizardRowBody>
              {fixedTenant ? null : (
                <Field
                  as="record"
                  name="tenant"
                  label="Tenant"
                  entity="organization"
                  noun={{ one: "tenant", many: "tenants" }}
                  standard="id"
                  options={offered.map((one) => ({ value: one.enterpriseId, title: one.name, code: one.enterpriseId }))}
                  help="Only a tenant without a white label is offered. Left blank, it is one of Revelator's own."
                />
              )}
              <Field
                as="record"
                name="partner"
                label="Partner"
                entity="organization"
                noun={{ one: "partner", many: "partners" }}
                standard="id"
                options={PARTNERS.map((one) => ({ value: one.id, title: one.name, code: one.id }))}
                help="The API partner it is tied to, where it is one's."
              />
            </WizardRowBody>
          </WizardRow>
          <WizardRow title="White label enabled">
            <WizardRowBody>
              <Field as="choice" name="enabled" label="White label enabled" options={YES_NO} />
            </WizardRowBody>
            <WizardRowTips>
              <WizardRowTip>Only if the client bought white label: it unlocks their own domain and the sign-in designer.</WizardRowTip>
            </WizardRowTips>
          </WizardRow>
          <WizardRow title="Default white label">
            <WizardRowBody>
              <Field as="choice" name="isDefault" label="Is default" options={YES_NO} />
            </WizardRowBody>
            <WizardRowTips>
              <WizardRowTip>A domain no white label names falls back to the default. Only Revelator's own is.</WizardRowTip>
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
        <WizardSectionHeader title="Sign-in pages" />
        <WizardSectionBody>
          <WizardRow title="Login page">
            <WizardRowBody>
              <Field as="text" name="loginHeader" label="Login page header text" />
              <Field as="text" name="loginSubheader" label="Login page subheader text" />
            </WizardRowBody>
          </WizardRow>
          <WizardRow title="Sign-up page">
            <WizardRowBody>
              <Field as="text" name="signupHeader" label="Sign-up page header text" />
              <Field as="text" name="signupSubheader" label="Sign-up page subheader text" />
            </WizardRowBody>
            <WizardRowTips>
              <WizardRowTip>Written in the language the client's users read.</WizardRowTip>
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
              <Field as="choice" name="showAds" label="Shows ads" options={YES_NO} />
            </WizardRowBody>
          </WizardRow>
          {editing ? null : (
            <WizardRow title="Stylesheet">
              <WizardRowBody>
                <Field as="url" name="cssFile" label="CSS file" />
              </WizardRowBody>
              <WizardRowTips>
                <WizardRowTip>Set once, when the white label is made: it cannot be changed afterwards.</WizardRowTip>
              </WizardRowTips>
            </WizardRow>
          )}
          <WizardRow title="Default plan">
            <WizardRowBody>
              <Field as="identifier" standard="id" name="defaultPlanId" label="Default plan ID" />
            </WizardRowBody>
            <WizardRowTips>
              <WizardRowTip>Always 3, unless the client's contract names another plan.</WizardRowTip>
            </WizardRowTips>
          </WizardRow>
        </WizardSectionBody>
      </WizardSection>
      <WizardSection>
        <WizardSectionHeader title="Links" />
        <WizardSectionBody>
          <WizardRow title="Agreements">
            <WizardRowBody>
              <Field as="url" name="termsUrl" label="Terms and conditions file" />
              <Field as="url" name="distributionAgreementUrl" label="Distribution agreement URL" />
            </WizardRowBody>
          </WizardRow>
          <WizardRow title="Support">
            <WizardRowBody>
              <Field as="url" name="faqUrl" label="FAQ URL" />
              <Field as="url" name="helpUrl" label="Help URL" />
            </WizardRowBody>
          </WizardRow>
          <WizardRow title="Custom links">
            <WizardRowBody>
              <Field as="url" name="customLogoutUrl" label="Custom logout URL" />
              <Field as="url" name="customDashboardLinkUrl" label="Custom dashboard link URL" />
              <Field as="text" name="customDashboardLinkText" label="Custom dashboard link text" />
            </WizardRowBody>
            <WizardRowTips>
              <WizardRowTip>Where a user lands on signing out, and a link of the client's own on the dashboard.</WizardRowTip>
            </WizardRowTips>
          </WizardRow>
        </WizardSectionBody>
      </WizardSection>
      <WizardSection>
        <WizardSectionHeader title="Services" />
        <WizardSectionBody>
          <WizardRow title="Intercom">
            <WizardRowBody>
              <Field as="choice" name="enableIntercom" label="Intercom enabled" options={YES_NO} />
              <Field as="text" name="intercomAppId" label="Intercom app ID" />
            </WizardRowBody>
          </WizardRow>
          <WizardRow title="Google Analytics">
            <WizardRowBody>
              <Field as="text" name="googleAnalyticsSiteId" label="Google Analytics site ID" />
            </WizardRowBody>
          </WizardRow>
          <WizardRow title="Emails">
            <WizardRowBody>
              <Field as="text" name="bccEmails" label="BCC emails" help="Copied on every email it sends. Separate several with commas." />
            </WizardRowBody>
          </WizardRow>
        </WizardSectionBody>
      </WizardSection>
    </Wizard>
  );
}

/**
 * The white labels — the record every tenant loads under, and the few that are Revelator's own.
 *
 * A COLLECTION PAGE grown by a new white label; one is deleted from its row, asked first.
 */
export function WhiteLabels() {
  const rows = whiteLabels();
  return (
    <CollectionPage
      title="White labels"
      actions={[{ label: "New white label", primary: true, creates: true, opens: newWhiteLabelHref() }]}
      more={[{ label: "Export" }]}
      index={{
        rows,
        rowKey: (one) => one.id,
        noun: { one: "white label", many: "white labels" },
        identity: {
          title: "Domain",
          name: (one) => one.domain,
          mark: (one) => whiteLabelMark(one),
          sortable: true,
          opens: (one) => whiteLabelHref(one.id),
        },
        sort: { column: "White label ID", direction: "ascending" },
        searchBy: ["Domain", "White label ID", "Enterprise", "Enterprise ID", "Domain V2", "Partner ID", "Page title"],
        columns: [
          { name: "White label ID", as: "identifier", standard: "id", value: (one) => one.id },
          {
            // ANOTHER RECORD as a value: the enterprise it loads, wearing its logo.
            name: "Enterprise",
            as: "entities",
            value: (one) => (one.tenant ? [one.tenant.name] : []),
            noun: { one: "enterprise", many: "enterprises" },
            entity: "organization",
            picture: (named) => {
              const tenant = TENANTS.find((each) => each.name === named);
              return tenant ? tenantPicture(tenant) : undefined;
            },
          },
          { name: "Enterprise ID", as: "identifier", standard: "id", value: (one) => one.tenant?.enterpriseId },
          { name: "On trial", value: (one) => (one.tenant?.onTrial ? 1 : 0), cell: (one) => (one.tenant ? yes(one.tenant.onTrial) : undefined) },
          { name: "Locked out", value: (one) => (one.tenant?.lockedOut ? 1 : 0), cell: (one) => (one.tenant ? yes(one.tenant.lockedOut) : undefined) },
          { name: "Domain V2", value: (one) => one.domainV2 ?? "", cell: (one) => one.domainV2 },
          { name: "Partner ID", as: "identifier", standard: "id", value: (one) => one.partnerId },
          { name: "Page title", value: (one) => one.title, cell: (one) => one.title },
          { name: "Enabled", value: (one) => (one.enabled ? 1 : 0), cell: (one) => enabledBadge(one.enabled) },
        ],
        filters: [
          {
            kind: "anyOf",
            key: "enterprise",
            label: "Enterprise",
            options: [...new Set(rows.flatMap((one) => (one.tenant ? [one.tenant.name] : [])))].sort(),
            of: (one) => one.tenant?.name ?? "",
          },
          {
            kind: "pasted",
            key: "ids",
            label: "White label IDs",
            placeholder: "Paste white label IDs, one per line or separated by commas",
            holds: (one, values) => values.includes(one.id),
          },
          {
            kind: "switches",
            key: "white-label",
            label: "White label",
            switches: [
              { key: "enabled", label: "White label enabled", holds: (one) => Boolean(one.enabled) },
              { key: "signup", label: "Allows sign-up", holds: (one) => one.allowSignup },
              { key: "own", label: "Revelator's own", holds: (one) => !one.tenant },
            ],
          },
          {
            kind: "switches",
            key: "tenant",
            label: "Enterprise",
            switches: [
              { key: "trial", label: "On trial", holds: (one) => Boolean(one.tenant?.onTrial) },
              { key: "locked", label: "Locked out", holds: (one) => Boolean(one.tenant?.lockedOut) },
            ],
          },
        ],
        totals: [{ count: true }],
        commands: (one) => [
          { label: "Open", opens: whiteLabelHref(one.id) },
          { label: "Edit", opens: editWhiteLabelHref(one.id) },
          { label: "Delete white label", destructive: true, dialog: <DeleteWhiteLabel label={one} /> },
        ],
      }}
    />
  );
}
