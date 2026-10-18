import { useMemo } from "react";
import {
  Avatar,
  Badge,
  Button,
  ConfirmationDialog,
  EmptyState,
  FactCard,
  Field,
  FormDialog,
  Link,
  Metadata,
  RecordIndex,
  Slot,
  TitledCard,
  owed,
  type HeldBy,
} from "@revelator/pro-ui";
import { dspFor } from "@revelator/pro-ui/assets";

import { customerHref, payeeHref, tenantFormHref } from "../route";
import {
  addNote,
  analyticsOf,
  configOf,
  deleteNote,
  integrationsOf,
  nextWhiteLabelId,
  notesOf,
  saveIntegration,
  saveWhiteLabel,
  transactionsOf,
  updateTenant,
  type Integration,
  type PayorTransaction,
  type Tenant,
  type TenantNote,
} from "./mock";

const yesNo = (value: boolean) => (value ? "Yes" : "No");
/** A switch the table also holds unset. */
const maybe = (value: boolean | null) => (value === null ? "Not set" : yesNo(value));
const YES_NO = [
  { value: "Yes", title: "Yes" },
  { value: "No", title: "No" },
];

/** The payment providers RCC connects a tenant to. */
const PROVIDERS = ["PayPal", "Tipalti", "Stripe"] as const;

/** A service, as the mark the system publishes for it — its initial where it has none. */
const serviceMark = (name: string) => {
  const mark = dspFor(name);
  return <Avatar kind="brand" name={name}>{mark ? <img src={mark.art} alt="" /> : null}</Avatar>;
};

/* ---------- Integrations ---------- */

/** A payment provider connected to the tenant — the provider, and the ID it knows the tenant by. */
export function ConnectProvider({ tenant, ...held }: HeldBy & { tenant: Tenant }) {
  return (
    <FormDialog
      {...held}
      confirm="Connect"
      draft={{ provider: owed.text, providerId: owed.text }}
      onCommit={(draft) => saveIntegration(tenant.enterpriseId, { provider: draft.provider, providerId: draft.providerId.trim(), connected: true })}
    >
      <Field
        as="record"
        name="provider"
        label="Provider"
        entity="brand"
        noun={{ one: "provider", many: "providers" }}
        options={PROVIDERS.map((one) => ({ value: one, title: one, art: dspFor(one)?.art }))}
      />
      <Field as="text" name="providerId" label="Provider ID" help="The account ID the provider gave the tenant." />
    </FormDialog>
  );
}

/** A provider disconnected — the tenant's payees are no longer paid through it. */
function DisconnectProvider({ tenant, integration, ...held }: HeldBy & { tenant: Tenant; integration: Integration }) {
  return (
    <ConfirmationDialog
      {...held}
      asks={`${tenant.name}'s payees are no longer paid through ${integration.provider} until it is connected again.`}
      confirm="Disconnect"
      destructive
      onCommit={() => saveIntegration(tenant.enterpriseId, { ...integration, connected: false })}
    />
  );
}

/**
 * The payment providers the tenant's payees are paid through. Whether one is connected is written
 * in words: the system has no family for a connection yet (gaps.md).
 */
export function TenantIntegrations({ tenant }: { tenant: Tenant }) {
  const rows = useMemo(() => integrationsOf(tenant), [tenant]);
  return (
    <RecordIndex
      rows={rows}
      rowKey={(one) => one.providerId}
      noun={{ one: "payment provider integration", many: "payment provider integrations" }}
      identity={{ title: "Provider", name: (one) => one.provider, mark: (one) => serviceMark(one.provider) }}
      columns={[
        { name: "Provider ID", as: "identifier", standard: "id", value: (one) => one.providerId },
        { name: "Connected", value: (one) => (one.connected ? 1 : 0), cell: (one) => yesNo(one.connected) },
      ]}
      commands={(one) => [
        one.connected
          ? { label: "Disconnect", destructive: true, dialog: <DisconnectProvider tenant={tenant} integration={one} /> }
          : { label: "Reconnect", opens: () => saveIntegration(tenant.enterpriseId, { ...one, connected: true }) },
      ]}
      chooser={false}
      empty={{ holder: "this tenant", line: true }}
    />
  );
}

/* ---------- Transactions by payor ---------- */

const PAYMENT_STATUSES: readonly PayorTransaction["status"][] = ["Paid", "Processing", "Pending", "Failed"];

/** What the tenant paid out as the payor — each payout to one of its payees, newest first. */
export function TenantTransactions({ tenant }: { tenant: Tenant }) {
  const rows = useMemo(() => transactionsOf(tenant), [tenant]);
  return (
    <RecordIndex
      rows={rows}
      rowKey={(one) => one.id}
      noun={{ one: "transaction", many: "transactions" }}
      identity={{
        title: "Payee",
        name: (one) => one.payee,
        mark: (one) => <Avatar kind="organization" name={one.payee} />,
        opens: (one) => payeeHref(one.payeeId),
      }}
      sort={{ column: "Date", direction: "descending" }}
      searchBy={["Payee", "Transaction ID"]}
      columns={[
        { name: "Transaction ID", as: "identifier", standard: "id", value: (one) => one.id },
        { name: "Date", as: "date", value: (one) => one.date },
        { name: "Amount", as: "money", currency: tenant.currency, value: (one) => one.amount },
        {
          name: "Status",
          value: (one) => PAYMENT_STATUSES.indexOf(one.status),
          cell: (one) => <Badge status={`payment:${one.status}`} />,
        },
      ]}
      filters={[{ kind: "anyOf", key: "status", label: "Status", options: PAYMENT_STATUSES, of: (one) => one.status }]}
      totals={[{ count: true }, { name: "Total paid", as: "money", currency: tenant.currency, sum: (one) => (one.status === "Paid" ? one.amount : 0) }]}
      chooser={false}
      empty={{ holder: "this tenant", line: true }}
    />
  );
}

/* ---------- Analytics ---------- */

// THE SPANS a retention is set to, in days: the system has no field for a count of days (gaps.md).
const TRENDS_DAYS = [30, 90, 180, 365];
const REVENUE_DAYS = [365, 730, 1095, 1825];
const V3_TRENDS_DAYS = [90, 180, 365, 730];
const days = (values: readonly number[]) => values.map((one) => ({ value: String(one), title: `${one} days` }));

/** How long the tenant's analytics are kept, and whether it has them at all. */
export function EditAnalytics({ tenant, ...held }: HeldBy & { tenant: Tenant }) {
  const analytics = analyticsOf(tenant);
  return (
    <FormDialog
      {...held}
      confirm="Save"
      draft={{
        enabled: owed<string>(yesNo(analytics.enabled)),
        trendsDays: owed<string>(String(analytics.trendsDays)),
        revenueDays: owed<string>(String(analytics.revenueDays)),
        v3TrendsDays: owed<string>(String(analytics.v3TrendsDays)),
      }}
      onCommit={(draft) =>
        updateTenant(tenant.enterpriseId, {
          analytics: {
            enabled: draft.enabled === "Yes",
            trendsDays: Number(draft.trendsDays),
            revenueDays: Number(draft.revenueDays),
            v3TrendsDays: Number(draft.v3TrendsDays),
          },
        })
      }
    >
      <Field as="choice" name="enabled" label="Analytics enabled (V2 and V3)" options={YES_NO} />
      <Field as="choice" name="trendsDays" label="Trends retention" options={days(TRENDS_DAYS)} />
      <Field as="choice" name="revenueDays" label="Revenue retention" options={days(REVENUE_DAYS)} />
      <Field as="choice" name="v3TrendsDays" label="V3 trends retention" options={days(V3_TRENDS_DAYS)} />
    </FormDialog>
  );
}

/** How long the tenant's analytics are kept. */
export function TenantAnalytics({ tenant }: { tenant: Tenant }) {
  const analytics = analyticsOf(tenant);
  return (
    <Metadata>
      <FactCard
        title="Analytics"
        facts={[
          { label: "Analytics enabled", value: yesNo(analytics.enabled) },
          { label: "Trends retention", value: `${analytics.trendsDays} days` },
          { label: "Revenue retention", value: `${analytics.revenueDays} days` },
          { label: "V3 trends retention", value: `${analytics.v3TrendsDays} days` },
        ]}
      />
    </Metadata>
  );
}

/* ---------- Tenant configuration ---------- */

const AUTH_BASE_URL = "https://auth.revelator.pro/";

/**
 * The enterprise moved onto a white label — the domain it loads on and whether the client bought
 * white label. The tenant's own white label is changed where it has one; otherwise one is made.
 */
export function MigrateToWhiteLabel({ tenant, ...held }: HeldBy & { tenant: Tenant }) {
  const domain = tenant.domain ?? tenant.whiteLabel?.domain;
  return (
    <FormDialog
      {...held}
      confirm="Migrate"
      draft={{
        authBaseUrl: owed(tenant.whiteLabel?.authBaseUrl ?? AUTH_BASE_URL),
        domain: domain ? owed(domain) : owed.text,
        defaultPlanId: owed(tenant.whiteLabel?.defaultPlanId ?? "3"),
        enabled: owed<string>(yesNo(Boolean(tenant.whiteLabel?.enabled))),
      }}
      onCommit={(draft) => {
        const written = draft.domain.trim();
        const label = tenant.whiteLabel ?? { id: nextWhiteLabelId(), title: tenant.name, allowSignup: false, domain: written };
        saveWhiteLabel(
          { ...label, domain: written, authBaseUrl: draft.authBaseUrl.trim(), defaultPlanId: draft.defaultPlanId.trim(), enabled: draft.enabled === "Yes" },
          tenant.enterpriseId,
        );
        updateTenant(tenant.enterpriseId, { domain: written });
      }}
    >
      <Field as="url" name="authBaseUrl" label="Auth base URL" help="Always the same: it only handles the login redirect." />
      <Field as="text" name="domain" label="Domain" help="The tenant's full domain." />
      <Field as="identifier" standard="id" name="defaultPlanId" label="Default plan ID" help="Always 3, unless the client's contract names another plan." />
      <Field
        as="choice"
        name="enabled"
        label="White label enabled"
        options={[
          { value: "Yes", title: "Yes", description: "The client bought white label: its own domain and sign-in page." },
          { value: "No", title: "No", description: "It loads under the white label, without its own domain." },
        ]}
      />
    </FormDialog>
  );
}

/**
 * The tenant's entry in the supply chain's tenant configuration — what it may do, switched. None
 * until a customer is linked, which is what writes it.
 */
export function TenantConfigurationFacet({ tenant }: { tenant: Tenant }) {
  const config = configOf(tenant);
  if (!config)
    return (
      <TitledCard title="Tenant configuration">
        <Slot layout="empty">
          <EmptyState title="No tenant configuration yet" detail="Linking the tenant to its customer writes its entry.">
            <Button asChild>
              <a href={tenantFormHref(tenant.enterpriseId, "configure")}>Link customer</a>
            </Button>
          </EmptyState>
        </Slot>
      </TitledCard>
    );
  return (
    <Metadata>
      <FactCard
        title="Identity"
        facts={[
          { label: "Enterprise ID", value: tenant.enterpriseId, standard: "id" },
          {
            label: "Customer ID",
            value: tenant.customerId ? <Link opens={customerHref(tenant.customerId)}>{tenant.customerId}</Link> : undefined,
          },
          { label: "Domain", value: config.domain },
          { label: "Auth tenant ID", value: config.authTenantId, standard: "id" },
          { label: "Auth client ID", value: config.authClientId, standard: "id" },
          { label: "FusionAuth enabled", value: yesNo(tenant.fusionAuth) },
          { label: "Sandbox", value: yesNo(tenant.environment !== "Production") },
        ]}
      />
      <FactCard
        title="Features"
        facts={[
          { label: "Marketplace page enabled", value: maybe(config.marketplacePage) },
          { label: "Master channel enabled", value: maybe(config.masterChannel) },
          { label: "Feature.fm enabled", value: maybe(config.featureFm) },
          { label: "Physical releases enabled", value: yesNo(config.physicalReleases) },
          { label: "Minimum audio length validated", value: yesNo(config.minAudioLength) },
          { label: "Transactional emails turned off", value: yesNo(config.noTransactionalEmails) },
        ]}
      />
      <FactCard
        title="Payments and royalty tokens"
        facts={[
          { label: "Payment batcher", value: config.paymentBatcher },
          { label: "Withholding tax active", value: yesNo(config.withholdingTax) },
          { label: "Royalty token network", value: config.tokenNetwork },
          { label: "Token minting without distribution validation", value: yesNo(config.tokenMintingWithoutValidation) },
        ]}
      />
    </Metadata>
  );
}

/* ---------- Notes ---------- */

/** A note written about the tenant, by whoever is signed in. */
export function AddNote({ tenant, ...held }: HeldBy & { tenant: Tenant }) {
  return (
    <FormDialog {...held} confirm="Add" draft={{ content: owed.text }} onCommit={(draft) => addNote(tenant.enterpriseId, draft.content.trim())}>
      <Field as="longtext" name="content" label="Note" help="Everyone at Revelator who opens this tenant reads it." />
    </FormDialog>
  );
}

function DeleteNote({ tenant, note, ...held }: HeldBy & { tenant: Tenant; note: TenantNote }) {
  return (
    <ConfirmationDialog
      {...held}
      asks={`${note.author}'s note is deleted from ${tenant.name}. It is not kept.`}
      confirm="Delete"
      destructive
      onCommit={() => deleteNote(tenant.enterpriseId, note.id)}
    />
  );
}

/** What the team has written down about the tenant, newest first. */
export function TenantNotes({ tenant }: { tenant: Tenant }) {
  const rows = useMemo(() => notesOf(tenant), [tenant]);
  return (
    <RecordIndex
      rows={rows}
      rowKey={(one) => one.id}
      noun={{ one: "note", many: "notes" }}
      identity={{ title: "Note", name: (one) => one.content }}
      sort={{ column: "Created", direction: "descending" }}
      columns={[
        { name: "Author", as: "entities", noun: { one: "author", many: "authors" }, entity: "person", value: (one) => [one.author] },
        { name: "Created", as: "date", value: (one) => one.created },
      ]}
      commands={(one) => [{ label: "Delete", destructive: true, dialog: <DeleteNote tenant={tenant} note={one} /> }]}
      chooser={false}
      empty={{ holder: "this tenant", line: true }}
    />
  );
}
