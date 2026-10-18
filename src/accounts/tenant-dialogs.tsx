import { ConfirmationDialog, Field, FormDialog, owed, type HeldBy } from "@revelator/pro-ui";

import { updateTenant, usersOf, type Tenant, type TenantUser } from "./mock";

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

/** Someone given access to the tenant as a team member — held by the Users facet's action. */
export function AddUser({ tenant, ...held }: HeldBy & { tenant: Tenant }) {
  return (
    <FormDialog
      {...held}
      confirm="Add"
      draft={{ name: owed.text, email: owed.email }}
      onCommit={(draft) =>
        updateTenant(tenant.enterpriseId, { team: [...tenant.team, { name: draft.name.trim(), email: draft.email.trim() }] })
      }
    >
      <Field as="text" name="name" label="Name" />
      <Field as="email" name="email" label="Email" help="They sign in from the tenant's domain, setting their own password." />
    </FormDialog>
  );
}

/** The owner and the team, as the tenant keeps them — every user but the owner is the team. */
const peopleOf = (tenant: Tenant) => usersOf(tenant).map(({ name, email }) => ({ name, email }));

/** A team member made the owner — the account the handover goes to; the owner before joins the team. */
export function SetOwner({ tenant, user, ...held }: HeldBy & { tenant: Tenant; user: TenantUser }) {
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
export function RemoveAccess({ tenant, user, ...held }: HeldBy & { tenant: Tenant; user: TenantUser }) {
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
