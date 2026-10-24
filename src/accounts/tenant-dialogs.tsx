import { ConfirmationDialog, Field, FormDialog, owed, type HeldBy } from "@revelator/pro-ui";

import {
  USER_ACCESS,
  accounts,
  addClient,
  payees,
  updateTenant,
  usersOf,
  type TeamMember,
  type Tenant,
  type TenantUser,
  type UserAccess,
} from "./mock";

/**
 * Resetting a tenant's balances — asked first, because what its payees are owed is wiped with it.
 * Held by the row's command and the band's overflow alike. RCC keeps no balances, so the commit
 * changes nothing it draws.
 */
export function ResetBalances({ tenant, ...held }: HeldBy & { tenant: Tenant }) {
  return (
    <ConfirmationDialog
      {...held}
      asks={`Every balance of ${tenant.name} and its payees goes back to nothing. What they were owed is not kept.`}
      confirm="Reset"
      destructive
    />
  );
}

/**
 * A demo or an API sandbox moved to production — asked first: it loses its sandbox DSPs and its API
 * partner's bench, and delivers to the real DSPs once they are turned on.
 */
export function ConvertToProduction({ tenant, ...held }: HeldBy & { tenant: Tenant }) {
  return (
    <ConfirmationDialog
      {...held}
      asks={`${tenant.name} becomes a production tenant: its sandbox DSPs and its API partner are removed, and it delivers once its DSPs are turned on.`}
      confirm="Convert"
      onCommit={() => updateTenant(tenant.enterpriseId, { environment: "Production", stores: undefined, storesLive: 0, partnerId: undefined })}
    />
  );
}

/** The currencies a client account is paid in. */
const CURRENCIES = ["USD", "EUR", "GBP", "SEK", "CAD", "AUD", "ILS", "JPY", "BRL", "MXN"];

/**
 * One client account made on a parent tenant — a catalogue and a payee of its own, paid by the
 * parent. Many at once are imported from a template instead.
 */
export function CreateClient({ tenant, ...held }: HeldBy & { tenant: Tenant }) {
  return (
    <FormDialog
      {...held}
      confirm="Create"
      draft={{ name: owed.text, currency: owed<string>(tenant.currency) }}
      onCommit={(draft) => addClient(tenant.enterpriseId, draft.name.trim(), draft.currency)}
    >
      <Field as="text" name="name" label="Name" help="The label or artist the client account is for." />
      <Field
        as="choice"
        name="currency"
        label="Currency"
        noun={{ one: "currency", many: "currencies" }}
        options={CURRENCIES.map((one) => ({ value: one, title: one }))}
        help={`Its payee is paid by ${tenant.name}, in ${tenant.currency} unless another is picked.`}
      />
    </FormDialog>
  );
}

/** Every way a user reaches a tenant, as a field offers them. */
const ACCESS_OPTIONS = USER_ACCESS.map((one) => ({ value: one, title: one }));

/**
 * Someone given access to the tenant — found as RCC finds them, by their name or email, or by the
 * payee ID they are paid under — and the way they reach it.
 */
export function AddUser({ tenant, ...held }: HeldBy & { tenant: Tenant }) {
  const holding = new Set(usersOf(tenant).map((one) => one.email));
  const people = new Map<string, { name: string; email: string }>();
  for (const one of accounts()) if (!holding.has(one.email)) people.set(`user:${one.email}`, { name: one.name, email: one.email });
  for (const one of payees()) if (one.email && !holding.has(one.email)) people.set(`payee:${one.payeeId}`, { name: one.contact ?? one.name, email: one.email });
  const options = [...people].map(([value, one]) => ({
    value,
    title: one.name,
    code: value.startsWith("payee:") ? `Payee ${value.slice(6)} · ${one.email}` : one.email,
  }));
  return (
    <FormDialog
      {...held}
      confirm="Add"
      draft={{ person: owed.text, access: owed<string>("Team Members") }}
      onCommit={(draft) => {
        const one = people.get(draft.person)!;
        updateTenant(tenant.enterpriseId, { team: [...tenant.team, { ...one, access: draft.access as UserAccess }] });
      }}
    >
      <Field
        as="record"
        name="person"
        label="Find by email or payee ID"
        entity="person"
        noun={{ one: "user", many: "users" }}
        options={options}
        help="Anyone with an account, or a payee's contact. Someone new is invited instead."
      />
      <Field as="choice" name="access" label="Access as" options={ACCESS_OPTIONS} />
    </FormDialog>
  );
}

/** Someone without an account invited to the tenant — they set their own password from its domain. */
export function InviteUser({ tenant, ...held }: HeldBy & { tenant: Tenant }) {
  return (
    <FormDialog
      {...held}
      confirm="Invite"
      draft={{ name: owed.text, email: owed.email, access: owed<string>("Team Members") }}
      onCommit={(draft) =>
        updateTenant(tenant.enterpriseId, {
          team: [...tenant.team, { name: draft.name.trim(), email: draft.email.trim(), access: draft.access as UserAccess }],
        })
      }
    >
      <Field as="text" name="name" label="Name" />
      <Field as="email" name="email" label="Email" help="They sign in from the tenant's domain, setting their own password." />
      <Field as="choice" name="access" label="Access as" options={ACCESS_OPTIONS} />
    </FormDialog>
  );
}

/** How a user reaches the tenant changed — moved between its team and its portals. */
export function ManageAccess({ tenant, user, ...held }: HeldBy & { tenant: Tenant; user: TenantUser }) {
  return (
    <FormDialog
      {...held}
      confirm="Save"
      draft={{ access: owed<string>(user.access) }}
      onCommit={(draft) =>
        updateTenant(tenant.enterpriseId, {
          team: tenant.team.map((one) => (one.email === user.email ? { ...one, access: draft.access as UserAccess } : one)),
        })
      }
    >
      <Field
        as="choice"
        name="access"
        label="Access as"
        options={[
          { value: "Team Members", title: "Team member", description: "Works in the tenant's catalogue, by the permissions it is given." },
          { value: "Payee Portal", title: "Payee portal", description: "Sees only its own statements and payments." },
          { value: "Label Portal", title: "Label portal", description: "Sees its label's releases and earnings." },
          { value: "Artist Portal", title: "Artist portal", description: "Sees its artist's releases and earnings." },
        ]}
      />
    </FormDialog>
  );
}

/** The owner and the team, as the tenant keeps them — every user but the owner is the team. */
const peopleOf = (tenant: Tenant): TeamMember[] =>
  usersOf(tenant).map(({ name, email, access, tenantId }) => ({ name, email, access, legacy: tenantId === undefined || undefined }));

/** A team member made the owner — the account the handover goes to; the owner before joins the team. */
export function SetOwner({ tenant, user, ...held }: HeldBy & { tenant: Tenant; user: Pick<TenantUser, "name" | "email"> }) {
  return (
    <ConfirmationDialog
      {...held}
      asks={`${user.name} becomes the owner of ${tenant.name}, and the handover goes to them.`}
      confirm="Set as owner"
      onCommit={() => {
        const people = peopleOf(tenant);
        updateTenant(tenant.enterpriseId, {
          owner: { name: user.name, email: user.email },
          team: people.filter((one) => one.email !== user.email),
        });
      }}
    />
  );
}

/** A team member's access taken away — they can no longer sign in to the tenant. */
export function RemoveAccess({ tenant, user, ...held }: HeldBy & { tenant: Tenant; user: Pick<TenantUser, "name" | "email"> }) {
  return (
    <ConfirmationDialog
      {...held}
      asks={`${user.name} can no longer sign in to ${tenant.name}.`}
      confirm="Remove"
      destructive
      onCommit={() => updateTenant(tenant.enterpriseId, { team: tenant.team.filter((one) => one.email !== user.email) })}
    />
  );
}
