import {
  Avatar,
  Badge,
  CollectionPage,
  ConfirmationDialog,
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
  type HeldBy,
} from "@revelator/pro-ui";

import { editWhiteLabelHref, go, newWhiteLabelHref, whiteLabelHref } from "../route";
import {
  TENANTS,
  deleteWhiteLabel,
  nextWhiteLabelId,
  saveWhiteLabel,
  tenantById,
  whiteLabelById,
  whiteLabels,
  type WhiteLabelRecord,
} from "./mock";

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
        tenant: fixedTenant ? fixedTenant.enterpriseId : (label?.tenant?.enterpriseId ?? unanswered.record),
        enabled: owed(yes(label?.enabled)),
        allowSignup: owed(yes(label?.allowSignup)),
        allowForgotPassword: owed(yes(label?.allowForgotPassword ?? true)),
        title: owed(label?.title ?? fixedTenant?.name ?? ""),
        showRevelatorBranding: owed(yes(label?.showRevelatorBranding)),
        termsUrl: label?.termsUrl ?? unanswered.url,
        faqUrl: label?.faqUrl ?? unanswered.url,
        helpUrl: label?.helpUrl ?? unanswered.url,
      }}
      onCommit={(answers) => {
        const text = (value: unknown) => (typeof value === "string" && value.trim()) || undefined;
        const saved = {
          id: label?.id ?? nextWhiteLabelId(),
          domain: answers.domain.trim(),
          title: answers.title.trim(),
          enabled: answers.enabled === "Yes",
          allowSignup: answers.allowSignup === "Yes",
          allowForgotPassword: answers.allowForgotPassword === "Yes",
          showRevelatorBranding: answers.showRevelatorBranding === "Yes",
          termsUrl: text(answers.termsUrl),
          faqUrl: text(answers.faqUrl),
          helpUrl: text(answers.helpUrl),
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
            </WizardRowBody>
            <WizardRowTips>
              <WizardRowTip>The tenant's full domain, as its configuration names it. Sign-in goes through auth.revelator.pro.</WizardRowTip>
            </WizardRowTips>
          </WizardRow>
          {fixedTenant ? null : (
            <WizardRow title="Tenant">
              <WizardRowBody>
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
              </WizardRowBody>
            </WizardRow>
          )}
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

/**
 * The white labels — the record every tenant loads under, and the few that are Revelator's own.
 *
 * A COLLECTION PAGE grown by a new white label; one is deleted from its row, asked first.
 */
export function WhiteLabels() {
  return (
    <CollectionPage
      title="White labels"
      actions={[{ label: "New white label", primary: true, creates: true, opens: newWhiteLabelHref() }]}
      more={[{ label: "Export" }]}
      index={{
        rows: whiteLabels(),
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
        searchBy: ["Domain", "White label ID", "Tenant", "Title"],
        columns: [
          { name: "White label ID", as: "identifier", standard: "id", value: (one) => one.id },
          {
            name: "Tenant",
            as: "entities",
            value: (one) => (one.tenant ? [one.tenant.name] : []),
            noun: { one: "tenant", many: "tenants" },
            entity: "organization",
          },
          { name: "Title", value: (one) => one.title, cell: (one) => one.title },
          { name: "Enabled", value: (one) => (one.enabled ? 1 : 0), cell: (one) => enabledBadge(one.enabled) },
          { name: "Partner ID", as: "identifier", standard: "id", hidden: true, value: (one) => one.partnerId },
        ],
        filters: [
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
            label: "Tenant",
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
