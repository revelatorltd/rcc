import { useMemo } from "react";
import { Avatar, Badge, RecordIndex } from "@revelator/pro-ui";

import { editUserHref, payeeHref, userHref } from "../route";
import { Impersonate, impersonatePayee } from "./activity";
import { enterprisePicture } from "./enterprises";
import { USER_ACCESS, accounts, type Payee, type Tenant, type TenantUser } from "./mock";
import { PAYEE_STATUSES, payeeMark } from "./payees";
import { ManageAccess, RemoveAccess, SetOwner } from "./tenant-dialogs";

const yesNo = (value: boolean) => (value ? "Yes" : "No");

/** A name as RCC holds it: the first word the first name, the rest the last. */
const firstOf = (name: string) => name.split(" ")[0] ?? "";
const lastOf = (name: string) => name.split(" ").slice(1).join(" ");

/**
 * Who signs in to an enterprise, as RCC lists them — username, user ID, the auth tenant they sign in
 * through, their name, the partner they are tied to and when they last signed in — with how each
 * reaches it. Everything done to one is its row's menu.
 *
 * `tenant` is where the users are kept: the enterprise itself, or a client account's parent.
 * `ownable` is false on a client account, whose owner is its parent's.
 */
export function EnterpriseUsers({ tenant, users, ownable = true }: { tenant: Tenant; users: readonly TenantUser[]; ownable?: boolean }) {
  const rows = useMemo(() => {
    const known = new Map(accounts().map((one) => [one.userId, one]));
    return users.map((one) => ({ ...one, partnerId: known.get(one.userId)?.partnerId, lastLogin: known.get(one.userId)?.lastLogin }));
  }, [users]);
  return (
    <RecordIndex
      rows={rows}
      rowKey={(one) => one.userId}
      noun={{ one: "user", many: "users" }}
      identity={{
        title: "Username",
        name: (one) => one.email,
        mark: (one) => <Avatar kind="person" name={one.name} />,
        opens: (one) => userHref(one.userId),
      }}
      searchBy={["Username", "User ID", "Auth tenant ID", "First name", "Last name", "Partner ID"]}
      columns={[
        { name: "User ID", as: "identifier", standard: "id", value: (one) => one.userId },
        { name: "Auth tenant ID", as: "identifier", standard: "id", value: (one) => one.tenantId },
        { name: "First name", value: (one) => firstOf(one.name), cell: (one) => firstOf(one.name) },
        { name: "Last name", value: (one) => lastOf(one.name), cell: (one) => lastOf(one.name) },
        { name: "Partner ID", as: "identifier", standard: "id", value: (one) => one.partnerId },
        { name: "Last login", as: "date", value: (one) => one.lastLogin },
        { name: "Access", value: (one) => USER_ACCESS.indexOf(one.access), cell: (one) => one.access, readings: ["All"] },
        { name: "Role", value: (one) => (one.owner ? "Owner" : "Member"), cell: (one) => (one.owner ? "Owner" : "Member") },
      ]}
      readings={[
        { name: "All", holds: () => true },
        ...USER_ACCESS.map((access) => ({ name: access, holds: (one: TenantUser) => one.access === access })),
      ]}
      filters={[
        {
          kind: "switches",
          key: "user",
          label: "User",
          switches: [{ key: "tenant-id", label: "Only users with an auth tenant ID", holds: (one) => one.tenantId !== undefined }],
        },
      ]}
      commands={(one) => [
        { label: "Edit", opens: editUserHref(one.userId) },
        // A sign-in as them — asked why, and logged.
        { label: "Impersonate", dialog: <Impersonate tenant={tenant} as={one.name} resource={{ type: "User", id: one.userId, name: one.name }} /> },
        one.owner
          ? { label: "Manage access", unavailable: "The owner is always one of the team." }
          : { label: "Manage access", dialog: <ManageAccess tenant={tenant} user={one} /> },
        !ownable
          ? { label: "Change ownership", unavailable: "A client account's owner is its parent's." }
          : one.owner
            ? { label: "Change ownership", unavailable: "They are the owner." }
            : { label: "Change ownership", dialog: <SetOwner tenant={tenant} user={one} /> },
        one.owner
          ? { label: "Remove access", destructive: true, unavailable: "Make someone else the owner first." }
          : { label: "Remove access", destructive: true, dialog: <RemoveAccess tenant={tenant} user={one} /> },
      ]}
      chooser={false}
      empty={{ holder: "this enterprise", line: true }}
    />
  );
}

/**
 * Who an enterprise pays, as RCC lists them: the payee and its enterprise, where its account stands,
 * its contact, and every payee that pays it.
 */
export function EnterprisePayees({ rows }: { rows: readonly Payee[] }) {
  const pictures = useMemo(() => new Map(rows.map((one) => [one.enterprise.name, enterprisePicture(one.enterprise)])), [rows]);
  return (
    <RecordIndex
      rows={rows}
      rowKey={(one) => one.payeeId}
      noun={{ one: "payee", many: "payees" }}
      identity={{
        title: "Payee",
        name: (one) => one.name,
        mark: (one) => payeeMark(one),
        opens: (one) => payeeHref(one.payeeId),
      }}
      searchBy={["Payee", "Payee ID", "Enterprise ID", "Enterprise", "Contact ID", "Contact", "Email", "Payor IDs"]}
      columns={[
        { name: "Payee ID", as: "identifier", standard: "id", value: (one) => one.payeeId },
        {
          name: "Status",
          value: (one) => PAYEE_STATUSES.indexOf(one.status),
          cell: (one) => <Badge status={`payee:${one.status}`} />,
          readings: ["All"],
        },
        { name: "Enterprise ID", as: "identifier", standard: "id", value: (one) => one.enterprise.enterpriseId },
        {
          name: "Enterprise",
          as: "entities",
          value: (one) => [one.enterprise.name],
          noun: { one: "enterprise", many: "enterprises" },
          entity: "organization",
          picture: (named) => pictures.get(named),
        },
        { name: "On trial", value: (one) => (one.onTrial ? 1 : 0), cell: (one) => yesNo(one.onTrial) },
        { name: "Locked out", value: (one) => (one.lockedOut ? 1 : 0), cell: (one) => yesNo(one.lockedOut) },
        { name: "Contact ID", as: "identifier", standard: "id", value: (one) => one.contactId },
        { name: "Contact", value: (one) => one.contact ?? "", cell: (one) => one.contact },
        { name: "Email", value: (one) => one.email ?? "", cell: (one) => one.email },
        { name: "Payment blocked", value: (one) => (one.paymentBlocked ? 1 : 0), cell: (one) => yesNo(one.paymentBlocked) },
        { name: "Payor IDs", value: (one) => one.payorIds.join(", "), cell: (one) => one.payorIds.join(", ") },
        {
          name: "Parent enterprise",
          as: "entities",
          hidden: true,
          value: (one) => (one.enterprise.parent ? [one.enterprise.parent.name] : []),
          noun: { one: "parent enterprise", many: "parent enterprises" },
          entity: "organization",
        },
      ]}
      readings={[
        { name: "All", holds: () => true },
        ...PAYEE_STATUSES.map((status) => ({ name: status, holds: (one: Payee) => one.status === status })),
      ]}
      commands={(one) => [{ label: "Open", opens: payeeHref(one.payeeId) }, impersonatePayee(one)]}
      empty={{ holder: "this enterprise", line: true }}
    />
  );
}
