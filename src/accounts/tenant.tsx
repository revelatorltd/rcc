import { useMemo, type ReactNode } from "react";
import {
  Alert,
  Avatar,
  Badge,
  Button,
  DetailOverview,
  DetailOverviewGrid,
  DetailPage,
  EmptyState,
  FacetCard,
  FactCard,
  Metadata,
  Progress,
  RecordIndex,
  Slot,
  SlotItem,
  StatusMark,
  Text,
  TitledCard,
  WayOut,
  type Command,
  type DetailFacet,
  type RecordNavProps,
  type ShellPlace,
} from "@revelator/pro-ui";
import { dspFor } from "@revelator/pro-ui/assets";

import {
  TENANT_FACETS,
  TENANT_GROUPS,
  accountsHref,
  editEnterpriseHref,
  enterpriseHref,
  partnerHref,
  tenantFormHref,
  tenantHref,
  type TenantFacet,
} from "../route";
import {
  isSandbox,
  payees,
  payeesOf,
  progressOf,
  setupOf,
  storesOf,
  switchStores,
  tenantById,
  updateTenant,
  usersOf,
  type SetupStep,
  type Tenant,
  type TenantStore,
} from "./mock";
import { AddUser, ConvertToProduction, InviteUser, ResetBalances } from "./tenant-dialogs";
import {
  AddNote,
  ConnectProvider,
  EditAnalytics,
  MigrateToWhiteLabel,
  TenantAnalytics,
  TenantConfigurationFacet,
  TenantIntegrations,
  TenantNotes,
  TenantTransactions,
} from "./tenant-facets";
import { EnterprisePayees, EnterpriseUsers } from "./account-tables";
import { tenantMark } from "./tenants";
import { WhiteLabelFacts } from "./white-labels";

const yesNo = (value: boolean) => (value ? "Yes" : "No");

/**
 * What does a step, where it is owed — the one command each step of the setup has. Every one but
 * the stores waits on a form RCC has not built yet, and is offered without an address.
 */
function commandOf(one: Tenant, step: SetupStep): Command {
  switch (step.key) {
    case "white-label":
      return one.whiteLabel
        ? { label: "Open white label", opens: tenantHref(one.enterpriseId, "White label") }
        : { label: "Create white label", opens: tenantFormHref(one.enterpriseId, "new-white-label") };
    case "stores":
      return { label: step.done ? "Open DSPs" : "Turn on DSPs", opens: tenantHref(one.enterpriseId, "DSPs") };
    case "partner":
      return one.partnerId
        ? { label: "Open partner", opens: partnerHref(one.partnerId) }
        : { label: "Create API partner", opens: tenantFormHref(one.enterpriseId, "new-partner") };
    case "login":
      // Signing in as the owner leaves RCC, which this rebuild does not model: the step is marked
      // tried, as the prototype marks it.
      return { label: "Impersonate owner", opens: () => updateTenant(one.enterpriseId, { tested: true }) };
    case "handover":
      return {
        label: "Copy handover email",
        opens: () => {
          void navigator.clipboard?.writeText(handoverOf(one)).catch(() => {});
          updateTenant(one.enterpriseId, { emailed: true });
        },
      };
  }
}

/** What the owner is told once the tenant is ready: where to go, and how to set a password. */
function handoverOf(one: Tenant) {
  const owner = usersOf(one)[0]!;
  const domain = one.whiteLabel?.domain ?? "your domain";
  return [
    `Hi ${owner.name.split(" ")[0]},`,
    `Your Revelator account ${one.name} is ready. Go to ${domain}, choose Forgot password to set yours, and sign in.`,
    "Always start from your domain: a saved sign-in link can set off repeated password resets.",
  ].join("\n\n");
}

/** The step owed next — the first not done that keeps the tenant from its handover. */
const owedOf = (one: Tenant) => setupOf(one).find((step) => !step.done && !step.optional);

/**
 * One tenant, as a record with facets.
 *
 * The band says WHO, and the one step owed next; every facet below it is a page of its own. The
 * Overview reads none of them in full: it is the recap, one tile per facet with the way in.
 */
export function TenantDetail({ id, facet }: { id: string; facet: TenantFacet }) {
  const tenant = tenantById(id);
  const owed = owedOf(tenant);
  const next = owed ? commandOf(tenant, owed) : undefined;

  // DSPs still off, which the DSPs facet's one command turns on and shows together.
  const stores = storesOf(tenant);
  const off = stores.filter((one) => !one.active || !one.displayed).map((one) => one.name);
  const migrate = { label: "Migrate to white label", dialog: <MigrateToWhiteLabel tenant={tenant} /> };

  // EACH FACET leads with the one command its page is for — the band holds none of its own, so a
  // facet never wears another's.
  const FACETS: Record<TenantFacet, { header?: DetailFacet; body: ReactNode }> = {
    Overview: { body: <TenantOverview tenant={tenant} /> },
    Setup: {
      // The step owed next; a tenant handed over owes none.
      header: {
        name: "Setup",
        actions: next ? [next.opens ? { label: next.label, opens: next.opens, primary: true } : { label: next.label, primary: true }] : [],
      },
      body: <TenantSetup tenant={tenant} />,
    },
    Details: {
      header: { name: "Details", actions: [{ label: "Edit enterprise", opens: editEnterpriseHref(tenant.enterpriseId), primary: true }] },
      body: <TenantDetails tenant={tenant} />,
    },
    Users: {
      header: {
        name: "Users",
        actions: [{ label: "Add user", creates: true, primary: true, dialog: <AddUser tenant={tenant} /> }],
        more: [{ label: "Invite new user", dialog: <InviteUser tenant={tenant} /> }, { label: "Download as CSV" }],
      },
      body: <TenantUsers tenant={tenant} />,
    },
    Payees: { header: { name: "Payees", more: [{ label: "Download" }] }, body: <TenantPayees tenant={tenant} /> },
    Clients: {
      header: {
        name: "Clients",
        actions: [{ label: "Import client accounts", primary: true, opens: tenantFormHref(tenant.enterpriseId, "import") }],
      },
      body: <TenantClients tenant={tenant} />,
    },
    "Tenant configuration": {
      header: {
        name: "Tenant configuration",
        actions: [{ label: "Edit tenant configuration", primary: true, opens: tenantFormHref(tenant.enterpriseId, "configure") }],
        more: [migrate],
      },
      body: <TenantConfigurationFacet tenant={tenant} />,
    },
    "White label": {
      header: {
        name: "White label",
        actions: tenant.whiteLabel
          ? [{ label: "Edit white label", primary: true, opens: tenantFormHref(tenant.enterpriseId, "edit-white-label") }]
          : [{ label: "Create white label", primary: true, opens: tenantFormHref(tenant.enterpriseId, "new-white-label") }],
        more: [migrate],
      },
      body: <TenantWhiteLabel tenant={tenant} />,
    },
    DSPs: {
      header: {
        name: "DSPs",
        // Every DSP on and shown at once; held DSPs are switched one by one from the table.
        actions: off.length
          ? [{ label: off.length === stores.length ? "Turn on DSPs" : "Turn on the rest", primary: true, opens: () => switchStores(tenant.enterpriseId, off, { active: true, displayed: true }) }]
          : [],
        more: [
          ...(off.length < stores.length
            ? [{ label: "Turn off every DSP", opens: () => switchStores(tenant.enterpriseId, stores.map((one) => one.name), { active: false, displayed: false }) }]
            : []),
          { label: "Export" },
        ],
      },
      body: <TenantStores tenant={tenant} />,
    },
    Integrations: {
      header: {
        name: "Integrations",
        actions: [{ label: "Connect provider", creates: true, primary: true, dialog: <ConnectProvider tenant={tenant} /> }],
      },
      body: <TenantIntegrations tenant={tenant} />,
    },
    Analytics: {
      header: { name: "Analytics", actions: [{ label: "Edit analytics", primary: true, dialog: <EditAnalytics tenant={tenant} /> }] },
      body: <TenantAnalytics tenant={tenant} />,
    },
    "Transactions by payor": {
      header: { name: "Transactions by payor", more: [{ label: "Export" }] },
      body: <TenantTransactions tenant={tenant} />,
    },
    Notes: {
      header: { name: "Notes", actions: [{ label: "Add note", creates: true, primary: true, dialog: <AddNote tenant={tenant} /> }] },
      body: <TenantNotes tenant={tenant} />,
    },
  };
  const shown = FACETS[facet];

  // The band's overflow holds what acts on the TENANT as a whole, wherever the reader is in it.
  const more: Command[] = [
    ...(isSandbox(tenant) ? [{ label: "Convert to production", dialog: <ConvertToProduction tenant={tenant} /> }] : []),
    { label: "Billing" },
    { label: "Reset balances", destructive: true, dialog: <ResetBalances tenant={tenant} /> },
  ];

  return (
    <DetailPage
      record={{
        // SQUARE, the same mark the index's row wears, so the row pressed and the band landed on
        // are plainly one thing.
        mark: tenantMark(tenant),
        name: tenant.name,
        kind: tenant.type === "Parent" ? "Parent tenant" : "Tenant",
        facts: [
          // The ENTERPRISE ID alone: a second id chip beside it could not say whose it is
          // (gaps.md) — the payee's is read in the Details.
          { identifier: tenant.enterpriseId, standard: "id" },
          // WHERE ITS RELEASES GO: it changes what every store and step below it means.
          { text: tenant.environment },
        ],
        more,
      }}
      facet={shown.header}
    >
      {shown.body}
    </DetailPage>
  );
}

/**
 * The recap: one tile per facet, each with what it comes to and the way into it. A facet with
 * nothing in it yet is an empty card holding what starts it, so the step owed stands where its
 * absence is read.
 */
function TenantOverview({ tenant }: { tenant: Tenant }) {
  const { done, of } = progressOf(tenant);
  const stores = storesOf(tenant);
  const on = stores.filter((one) => one.active).length;
  const users = usersOf(tenant);
  return (
    <DetailOverview>
      <DetailOverviewGrid>
        <FacetCard
          title="Setup"
          opens={tenantHref(tenant.enterpriseId, "Setup")}
          figures={[
            { label: "Done", as: "count", value: done },
            { label: "To do", as: "count", value: of - done },
          ]}
        />
        <FacetCard
          title="Details"
          opens={tenantHref(tenant.enterpriseId, "Details")}
          facts={[
            { label: "Type", value: tenant.type },
            { label: "Environment", value: tenant.environment },
          ]}
        />
        {tenant.whiteLabel ? (
          <FacetCard
            title="White label"
            opens={tenantHref(tenant.enterpriseId, "White label")}
            facts={[
              // Its TITLE, not its domain: a domain runs past the tile's row (gaps.md).
              { label: "Title", value: tenant.whiteLabel.title },
              { label: "White label ID", value: tenant.whiteLabel.id, standard: "id" },
            ]}
          />
        ) : (
          <TitledCard title="White label">
            <Slot layout="empty">
              <EmptyState title="No white label yet" detail="The tenant does not load until it has one.">
                <Button asChild>
                  <a href={tenantFormHref(tenant.enterpriseId, "new-white-label")}>Create white label</a>
                </Button>
              </EmptyState>
            </Slot>
          </TitledCard>
        )}
        <FacetCard
          title="DSPs"
          opens={tenantHref(tenant.enterpriseId, "DSPs")}
          figures={[
            { label: "On", as: "count", value: on },
            { label: "Off", as: "count", value: stores.length - on },
          ]}
        />
        <TitledCard
          title="Users"
          count={users.length}
          trail={<WayOut opens={tenantHref(tenant.enterpriseId, "Users")} />}
        >
          <Slot layout="list">
            {users.map((one) => (
              <SlotItem key={one.userId}>
                <Avatar kind="person" name={one.name} />
                <Text kind="title">{one.name}</Text>
              </SlotItem>
            ))}
          </Slot>
        </TitledCard>
        {tenant.type === "Parent" ? (
          <FacetCard
            title="Clients"
            count={tenant.children.length}
            opens={tenantHref(tenant.enterpriseId, "Clients")}
            figures={[{ label: "Payees", as: "count", value: payeesOf(tenant).length }]}
          />
        ) : null}
      </DetailOverviewGrid>
    </DetailOverview>
  );
}

/**
 * The steps between signing the tenant up and handing it over, in the order they are done — a card
 * the reader works down: how far it has come, then each step done or owed, with the command that
 * does it. Composed of the system's own parts (a titled card, a progress, a list of slot items with
 * a status mark and a trailing button) until it declares a checklist of its own (gaps.md).
 */
function TenantSetup({ tenant }: { tenant: Tenant }) {
  const steps = setupOf(tenant);
  const { done, of } = progressOf(tenant);
  const owed = owedOf(tenant);
  return (
    <Metadata>
      {/* ONE CARD, the list a reader works down: how far it has come over the steps, each done or
          owed, its command at its end — the owed one standing out, the rest quiet. */}
      <TitledCard title={done === of ? "Ready to hand over" : "Get this tenant live"} count={of - done}>
        <Slot layout="one">
          <Progress label="Signing up is only the first step" value={done} max={of} reading={`${done} of ${of} done`} />
        </Slot>
        <Slot layout="list">
          {steps.map((step) => {
            const command = commandOf(tenant, step);
            const primary = step.key === owed?.key;
            return (
              <SlotItem
                key={step.key}
                trail={
                  typeof command.opens === "string" ? (
                    <Button size="sm" variant={primary ? "primary" : "secondary"} asChild>
                      <a href={command.opens}>{command.label}</a>
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant={primary ? "primary" : "secondary"}
                      onClick={typeof command.opens === "function" ? command.opens : undefined}
                      disabled={!command.opens}
                    >
                      {command.label}
                    </Button>
                  )
                }
              >
                <StatusMark
                  intent={step.done ? "success" : step.optional ? "info" : "warn"}
                  emphasis={step.done ? "solid" : "soft"}
                  label={step.done ? "Done" : step.optional ? "Optional" : "To do"}
                />
                <SlotItem direction="col" gap="together">
                  <Text kind="title">{step.title}</Text>
                  <Text kind="body" ink="secondary">
                    {step.detail}
                  </Text>
                </SlotItem>
              </SlotItem>
            );
          })}
        </Slot>
      </TitledCard>
      {isSandbox(tenant) ? (
        <Alert intent="info" title={tenant.environment === "Demo" ? "Demo tenant" : "API sandbox"}>
          Nothing it releases reaches a store. Convert it to production once the client is ready to go live.
        </Alert>
      ) : null}
    </Metadata>
  );
}

/**
 * What the tenant is, in full: where its account stands where it is held back, then the enterprise
 * and how its payees are paid.
 */
function TenantDetails({ tenant }: { tenant: Tenant }) {
  return (
    <Metadata>
      {tenant.lockedOut ? (
        <Alert intent="danger" title="Locked out">
          Nobody at this tenant can sign in until it is unlocked.
        </Alert>
      ) : null}
      {tenant.paymentBlocked ? (
        <Alert intent="danger" title="Payment blocked">
          No payee of this tenant is paid until the block is lifted.
        </Alert>
      ) : null}
      {isSandbox(tenant) ? (
        <Alert intent="info" title={tenant.environment === "Demo" ? "Demo tenant" : "API sandbox"}>
          Nothing it releases reaches a store. Convert it to production once the client is ready to go live.
        </Alert>
      ) : null}
      <FactCard
        title="Enterprise"
        facts={[
          { label: "Type", value: tenant.type },
          { label: "Environment", value: tenant.environment },
          { label: "Enterprise ID", value: tenant.enterpriseId, standard: "id" },
          { label: "Payee ID", value: tenant.payeeId, standard: "id" },
          { label: "Partner ID", value: tenant.partnerId, standard: "id" },
          { label: "Domain", value: tenant.domain ?? tenant.whiteLabel?.domain },
          { label: "Created", as: "date", value: tenant.created },
        ]}
      />
      <FactCard
        title="Distribution contract"
        facts={[
          { label: "DSP rate", as: "percent", value: tenant.rates.dsp },
          { label: "UGC rate", as: "percent", value: tenant.rates.ugc },
          { label: "YouTube channel rate", as: "percent", value: tenant.rates.youtube },
          { label: "Tax domicile country", value: tenant.taxCountry },
        ]}
      />
      <FactCard
        title="Account"
        facts={[
          { label: "On trial", value: yesNo(tenant.onTrial) },
          { label: "Locked out", value: yesNo(tenant.lockedOut) },
          { label: "Payment blocked", value: yesNo(tenant.paymentBlocked) },
          { label: "Uses FusionAuth", value: yesNo(tenant.fusionAuth) },
        ]}
      />
      <FactCard
        title="Payments"
        facts={[
          { label: "Currency", value: tenant.currency },
          { label: "Minimum payment", as: "money", value: tenant.minimumPayment, currency: tenant.currency },
        ]}
      />
    </Metadata>
  );
}

/** Who signs in to the tenant, its owner first — its team, and the people its portals let in. */
function TenantUsers({ tenant }: { tenant: Tenant }) {
  const users = useMemo(() => usersOf(tenant), [tenant]);
  return <EnterpriseUsers tenant={tenant} users={users} />;
}

/** Who the tenant pays — its own payee, and one for each client account a parent holds. */
function TenantPayees({ tenant }: { tenant: Tenant }) {
  const rows = useMemo(() => {
    const held = new Set(payeesOf(tenant).map((one) => one.payeeId));
    return payees().filter((one) => held.has(one.payeeId));
  }, [tenant]);
  return <EnterprisePayees rows={rows} />;
}

/**
 * A DSP, as the mark the system publishes for it. A sandbox store wears the service it delivers
 * over (FTP Sandbox → FTP); a name the system has no mark for keeps the avatar's initial.
 */
const dspMark = (name: string) => {
  const mark = dspFor(name) ?? dspFor(name.replace(/ Sandbox$/, ""));
  return <Avatar kind="brand" name={name}>{mark ? <img src={mark.art} alt="" /> : null}</Avatar>;
};

/**
 * The stores the tenant can deliver to — each switched on or off for it, and shown to its users or
 * hidden. Held together, several are switched at once.
 */
function TenantStores({ tenant }: { tenant: Tenant }) {
  // The SAME rows until the tenant changes: the index lets go of what is held when its rows do.
  const stores = useMemo(() => storesOf(tenant), [tenant]);
  return (
    <RecordIndex
      rows={stores}
      rowKey={(one) => one.name}
      noun={{ one: "DSP", many: "DSPs" }}
      identity={{ title: "DSP", name: (one) => one.name, mark: (one) => dspMark(one.name) }}
      columns={[
        {
          name: "Active",
          value: (one) => (one.active ? 1 : 0),
          cell: (one) => <Badge status={one.active ? "feature:Enabled" : "feature:Disabled"} />,
        },
        {
          name: "Shown",
          value: (one) => (one.displayed ? 1 : 0),
          cell: (one) => <Badge status={one.displayed ? "feature:Enabled" : "feature:Disabled"} />,
        },
      ]}
      // What switching does, to the stores held — written to the tenant at once, as the prototype's
      // batch is; nothing here is lost that a second press does not bring back.
      selection={(held) => {
        const names = held.map((one) => one.name);
        const to = (patch: Partial<TenantStore>) => () => switchStores(tenant.enterpriseId, names, patch);
        return [
          { label: "Turn on", opens: to({ active: true, displayed: true }) },
          { label: "Turn off", opens: to({ active: false, displayed: false }) },
          { label: "Show", opens: to({ displayed: true }) },
          { label: "Hide", opens: to({ displayed: false }) },
        ];
      }}
      chooser={false}
      empty={{ holder: "this tenant", line: true }}
    />
  );
}

/** The white label the tenant loads under — or, where it has none, what creates it. */
function TenantWhiteLabel({ tenant }: { tenant: Tenant }) {
  const label = tenant.whiteLabel;
  if (!label)
    return (
      <TitledCard title="White label">
        <Slot layout="empty">
          <EmptyState
            title="No white label yet"
            detail="Every tenant needs one, white label client or not: without it the tenant does not load."
          >
            <Button asChild>
                  <a href={tenantFormHref(tenant.enterpriseId, "new-white-label")}>Create white label</a>
                </Button>
          </EmptyState>
        </Slot>
      </TitledCard>
    );
  return <WhiteLabelFacts label={label} tenant={tenant} />;
}

/** The client accounts a parent tenant holds, newest first. */
function TenantClients({ tenant }: { tenant: Tenant }) {
  return (
    <RecordIndex
      rows={tenant.children}
      rowKey={(one) => one.enterpriseId}
      noun={{ one: "child enterprise", many: "child enterprises" }}
      identity={{
        title: "Name",
        name: (one) => one.name,
        mark: (one) => <Avatar kind="organization" name={one.name} />,
        opens: (one) => enterpriseHref(one.enterpriseId),
      }}
      sort={{ column: "Created", direction: "descending" }}
      columns={[
        { name: "Enterprise ID", as: "identifier", standard: "id", value: (one) => one.enterpriseId },
        { name: "Payee ID", as: "identifier", standard: "id", value: (one) => one.payeeId },
        { name: "Created", as: "date", value: (one) => one.created },
      ]}
      chooser={false}
      empty={{ holder: "this tenant", line: true }}
    />
  );
}

/** The tenant's facets, under their headings — Clients a parent's alone — and the way back to the tenants. */
function tenantNav({ id, facet }: { id: string; facet: TenantFacet }): RecordNavProps<TenantFacet> {
  const tenant = tenantById(id);
  return {
    back: { index: "Tenants", opens: accountsHref("tenants") },
    facets: TENANT_FACETS.filter((one) => one !== "Clients" || tenant.type === "Parent"),
    groups: TENANT_GROUPS,
    at: facet,
    addressOf: (one) => tenantHref(id, one),
  };
}

/** Where one tenant's page is: its facets, and a trail that reaches past the index to it. */
export const tenantPlace = ({ id, facet }: { id: string; facet: TenantFacet }): ShellPlace => {
  const tenant = tenantById(id);
  return {
    at: "Accounts",
    page: tenant.name,
    record: tenantNav({ id, facet }),
    trail: [
      { label: "Accounts", opens: accountsHref("tenants") },
      { label: "Tenants", opens: accountsHref("tenants") },
      { label: tenant.name },
    ],
  };
};
