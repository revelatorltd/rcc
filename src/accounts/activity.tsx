import {
  Avatar,
  CollectionPage,
  Field,
  FormDialog,
  RecordIndex,
  owed,
  type ActivitySave,
  type Command,
  type HeldBy,
  type RecordIndexProps,
} from "@revelator/pro-ui";
import { ORGANIZATIONS } from "@revelator/pro-ui/assets";

import { accountsHref, enterpriseHref, partnerHref, payeeHref, tenantHref, userHref, whiteLabelHref } from "../route";
import {
  ACTIVITY_CATEGORIES,
  TENANTS,
  accounts,
  activity,
  recordImpersonation,
  usersOf,
  type ActivityEvent,
  type Enterprise,
  type Payee,
  type ActivityResource,
  type ResourceType,
  type Tenant,
} from "./mock";

const RESOURCE_TYPES: readonly ResourceType[] = ["Tenant", "Client", "Payee", "User", "White label", "Partner"];

/** Where a record named in the log opens — none where it no longer exists. */
export function resourceHref(resource: ActivityResource): string | undefined {
  switch (resource.type) {
    case "Tenant":
      return tenantHref(resource.id);
    case "Client":
      return enterpriseHref(resource.id);
    case "Payee":
      return payeeHref(resource.id);
    case "User": {
      const user = accounts().find((one) => one.userId === resource.id || one.email === resource.id);
      return user ? userHref(user.userId) : undefined;
    }
    case "White label":
      return whiteLabelHref(resource.id);
    case "Partner":
      return partnerHref(resource.id);
  }
}

/** Who acted, as the log draws them: a face for a person, Revelator's mark for the system. */
const portraitOf = (one: ActivityEvent) =>
  one.machine ? (
    <Avatar kind="organization" name={one.actor}>
      <img src={ORGANIZATIONS.revelator.art} alt="" />
    </Avatar>
  ) : (
    <Avatar kind="person" name={one.actor} />
  );

/** A save as the system's activity panel reads it — naming its record where the panel spans several. */
const saveOf = (one: ActivityEvent, named: boolean): ActivitySave => ({
  at: one.at,
  actor: one.actor,
  kind: one.machine ? "machine" : "person",
  portrait: portraitOf(one),
  entries: one.entries.map((line) => ({ action: line.action, property: line.property, changes: line.changes })),
  ...(named ? { record: `${one.resource.type}: ${one.resource.name}`, recordHref: resourceHref(one.resource) } : {}),
});

/**
 * A record's history, for the timeline control on its band — or a set's, naming each record.
 * The fields it is filtered by are the properties its saves touched.
 */
export function activityPanel(events: readonly ActivityEvent[], named = false) {
  return {
    saves: events.map((one) => saveOf(one, named)),
    fields: [...new Set(events.flatMap((one) => one.entries.flatMap((line) => (line.property ? [line.property] : []))))],
    ...(named ? { records: { name: "Record", all: "All records" } } : {}),
  };
}

/** The saves made on one record, newest first. */
export const activityOf = (type: ResourceType, id: string) =>
  activity().filter((one) => one.resource.type === type && (one.resource.id === id || accounts().some((user) => user.userId === id && user.email === one.resource.id)));

/** What a save did, in one line: its first act, and how many more it holds. */
const summaryOf = (one: ActivityEvent) => {
  const [first, ...rest] = one.entries;
  // A bare verb — changed, switched — says what it acted on.
  const said = first ? (!first.action.includes(" ") && first.property ? `${first.action} ${first.property}` : first.action) : "";
  return rest.length ? `${said} and ${rest.length} more` : said;
};

const tenantNameOf = (id?: string) => (id ? (TENANTS.find((one) => one.enterpriseId === id)?.name ?? id) : "");

/**
 * The log as an index: every save, newest first, read by what it touched and narrowed by who, on
 * what and in which tenant. `scoped` leaves out the tenant it is read inside.
 */
export function ActivityIndex({ rows, scoped = false }: { rows: readonly ActivityEvent[]; scoped?: boolean }) {
  return <RecordIndex {...activityIndex(rows, scoped)} />;
}

function activityIndex(rows: readonly ActivityEvent[], scoped: boolean): RecordIndexProps<ActivityEvent> {
  const actors = [...new Set(rows.map((one) => one.actor))].sort();
  const tenants = [...new Set(rows.map((one) => tenantNameOf(one.tenantId)).filter(Boolean))].sort();
  return {
    rows,
    rowKey: (one) => one.id,
    noun: { one: "activity", many: "activities" },
    identity: {
      title: "Activity",
      name: (one) => summaryOf(one),
      mark: (one) => portraitOf(one),
      // A record since deleted leaves its line in the log, and opens nowhere new.
      opens: (one) => resourceHref(one.resource) ?? accountsHref("activity"),
    },
    sort: { column: "When", direction: "descending" },
    searchBy: scoped ? ["Activity", "Actor", "Record", "Reason"] : ["Activity", "Actor", "Record", "Tenant", "Reason"],
    columns: [
      { name: "When", as: "date", grain: "minute", value: (one) => one.at },
      { name: "Actor", value: (one) => one.actor, cell: (one) => one.actor },
      { name: "Category", value: (one) => ACTIVITY_CATEGORIES.indexOf(one.category), cell: (one) => one.category, readings: ["All"] },
      { name: "Record type", value: (one) => RESOURCE_TYPES.indexOf(one.resource.type), cell: (one) => one.resource.type },
      { name: "Record", value: (one) => one.resource.name, cell: (one) => one.resource.name },
      ...(scoped ? [] : [{ name: "Tenant", value: (one: ActivityEvent) => tenantNameOf(one.tenantId), cell: (one: ActivityEvent) => tenantNameOf(one.tenantId) }]),
      { name: "Reason", value: (one) => one.reason ?? "", cell: (one) => one.reason },
    ],
    readings: [
      { name: "All", holds: () => true },
      ...ACTIVITY_CATEGORIES.map((category) => ({ name: category, holds: (one: ActivityEvent) => one.category === category })),
    ],
    filters: [
      { kind: "anyOf", key: "actor", label: "Actor", options: actors, of: (one) => one.actor },
      { kind: "anyOf", key: "type", label: "Record type", options: RESOURCE_TYPES, of: (one) => one.resource.type },
      ...(scoped ? [] : [{ kind: "anyOf" as const, key: "tenant", label: "Tenant", options: tenants, of: (one: ActivityEvent) => tenantNameOf(one.tenantId) }]),
      {
        kind: "switches",
        key: "who",
        label: "Who",
        switches: [
          { key: "people", label: "People only", holds: (one) => !one.machine },
          { key: "system", label: "System only", holds: (one) => Boolean(one.machine) },
        ],
      },
      { kind: "span", key: "when", label: "When", chip: "When", at: (one) => one.at },
    ],
    totals: [{ count: true }],
    commands: (one) => [{ label: "Open record", opens: resourceHref(one.resource) }],
    chooser: false,
    empty: { holder: "this log", line: scoped },
  };
}

/**
 * THE ACTIVITY LOG — who did what, to which record, when, and why where they signed in as
 * someone else. Every save RCC makes is written here as it is made; the timeline control reads the
 * same saves with what each changed, from what to what.
 */
export function ActivityLog() {
  const rows = activity();
  return (
    <CollectionPage title="Activity log" more={[{ label: "Download" }]} activity={activityPanel(rows, true)} index={activityIndex(rows, false)} />
  );
}

/**
 * A sign-in as someone else, for support — asked first: where, and why. Written to the activity log
 * before it happens, with who signed in, as whom and on what record. Signing in itself leaves RCC,
 * which this rebuild does not model.
 */
export function Impersonate({
  tenant,
  as,
  resource,
  onSigned,
  ...held
}: HeldBy & { tenant: Tenant; as: string; resource: ActivityResource; onSigned?: () => void }) {
  return (
    <FormDialog
      {...held}
      confirm="Sign in"
      draft={{ surface: owed<string>("V2"), reason: owed.longtext }}
      onCommit={(draft) => {
        recordImpersonation({ tenantId: tenant.enterpriseId, resource, as, surface: draft.surface, reason: draft.reason.trim() });
        onSigned?.();
      }}
    >
      <Field
        as="choice"
        name="surface"
        label={`Sign in as ${as} in`}
        options={[
          { value: "V2", title: "V2", description: "The product, as they see it." },
          { value: "API", title: "API", description: "The API, with their key." },
        ]}
      />
      <Field as="longtext" name="reason" label="Reason" help="Logged with the sign-in in the activity log — who, as whom, when and why." />
    </FormDialog>
  );
}

/** Who a sign-in as a client account is: its portal user, or else its parent's owner, in its catalogue. */
const clientUserOf = (client: Enterprise) => {
  const parent = client.parent!;
  return usersOf(parent).find((one) => one.enterpriseId === client.enterpriseId)?.name ?? parent.owner.name;
};

/** Impersonating a client account — from its row, or its band. */
export const impersonateClient = (client: Enterprise): Command => ({
  label: "Impersonate",
  dialog: (
    <Impersonate
      tenant={client.parent!}
      as={clientUserOf(client)}
      resource={{ type: "Client", id: client.enterpriseId, name: client.name }}
    />
  ),
});

/**
 * Impersonating a payee — as the one who signs in for it: a tenant's own payee its owner, a client
 * account's its portal user. A payee nobody signs in for cannot be impersonated, and says so.
 */
export const impersonatePayee = (payee: Payee): Command => {
  const tenant = payee.enterprise.tenant ?? payee.enterprise.parent!;
  const as = payee.enterprise.tenant
    ? tenant.owner.name
    : usersOf(tenant).find((one) => one.enterpriseId === payee.enterprise.enterpriseId)?.name;
  return as
    ? { label: "Impersonate", dialog: <Impersonate tenant={tenant} as={as} resource={{ type: "Payee", id: payee.payeeId, name: payee.name }} /> }
    : { label: "Impersonate", unavailable: "No portal user signs in for this payee." };
};
