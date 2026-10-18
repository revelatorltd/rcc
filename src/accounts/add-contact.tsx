import { Field, FormDialog, owed, unanswered, type HeldBy } from "@revelator/pro-ui";

import { addContact, type Contact } from "./mock";

const ROLES: readonly Contact["roles"][number][] = ["Primary", "Billing", "Technical", "Royalties", "Legal"];

/**
 * Someone at a customer Revelator writes to — added from the customer's Contacts, without leaving
 * it. A dialog and not a wizard: four answers, and the set it grows stays in view behind it.
 *
 * HELD by the facet's action, which titles it with its own words and holds it open.
 */
export function AddContact({ customerId, ...held }: HeldBy & { customerId: string }) {
  return (
    <FormDialog
      {...held}
      confirm="Add"
      draft={{ name: owed.text, email: owed.email, phone: unanswered.phone, roles: owed.choices }}
      onCommit={(draft) =>
        addContact(customerId, {
          name: draft.name,
          email: draft.email,
          phone: draft.phone || undefined,
          roles: draft.roles as Contact["roles"],
        })
      }
    >
      <Field as="text" name="name" label="Name" />
      <Field as="email" name="email" label="Email" />
      <Field as="phone" name="phone" label="Phone" />
      <Field
        as="choices"
        name="roles"
        label="Roles"
        help="What Revelator writes to them about. Roles grant no permission."
        options={ROLES.map((role) => ({ value: role, title: role }))}
      />
    </FormDialog>
  );
}
