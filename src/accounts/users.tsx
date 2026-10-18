import {
  Avatar,
  CollectionPage,
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
} from "@revelator/pro-ui";

import { editUserHref, go, userHref } from "../route";
import { PARTNERS, accountById, accounts, partnerById, updateAccount, usersOf, type Account } from "./mock";

/** A user, as the mark a person is known by — round, their initials. */
export const userMark = (one: { name: string }) => <Avatar kind="person" name={one.name} />;

/** A partner user id, as the product issues one — eight, four and four. */
export const partnerUserId = () => {
  const hex = (n: number) => Array.from({ length: n }, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");
  return `${hex(8)}-${hex(4)}-${hex(4)}`;
};

/**
 * A user changed — their name, the API partner they belong to, and the partner user id that makes
 * the partner's key work for them. Everything else about them is the product's.
 */
export function EditUser({ id }: { id: string }) {
  const user = accountById(id) ?? accounts()[0]!;
  const leave = () => go(userHref(user.userId));
  return (
    <Wizard
      editing
      noun={{ one: "user", many: "users" }}
      note={user.email}
      onExit={leave}
      subject={(answers) => ({ kind: "person", name: answers.name ?? user.name, meta: [user.email] })}
      draft={{
        name: owed(user.name),
        partner: user.partnerId ?? unanswered.record,
        partnerUserId: user.partnerUserId ?? unanswered.text,
      }}
      onCommit={(answers) => {
        const text = (value: unknown) => (typeof value === "string" && value.trim()) || undefined;
        updateAccount(user.email, {
          name: answers.name.trim(),
          partnerId: text(answers.partner),
          partnerUserId: text(answers.partnerUserId),
        });
        leave();
      }}
    >
      <WizardSection>
        <WizardSectionHeader title="Account" />
        <WizardSectionBody>
          <WizardRow title="Who they are">
            <WizardRowBody>
              <Field as="text" name="name" label="Name" />
            </WizardRowBody>
            <WizardRowTips>
              <WizardRowTip>Their address is their username, and only the product changes it.</WizardRowTip>
            </WizardRowTips>
          </WizardRow>
        </WizardSectionBody>
      </WizardSection>
      <WizardSection>
        <WizardSectionHeader title="API partner" />
        <WizardSectionBody>
          <WizardRow title="Partner">
            <WizardRowBody>
              <Field
                as="record"
                name="partner"
                label="Partner"
                entity="organization"
                noun={{ one: "partner", many: "partners" }}
                standard="id"
                options={PARTNERS.map((one) => ({ value: one.id, title: one.name, code: one.id }))}
              />
              <Field
                as="text"
                name="partnerUserId"
                label="Partner user ID"
                help="Left blank, the band's Generate partner user ID issues one."
              />
            </WizardRowBody>
            <WizardRowTips>
              <WizardRowTip>
                The user an API account was created with needs a partner user id added by hand; without it the partner's key does
                not work. Users invited later get one by themselves.
              </WizardRowTip>
            </WizardRowTips>
          </WizardRow>
        </WizardSectionBody>
      </WizardSection>
    </Wizard>
  );
}

/**
 * The users — everyone who signs in, one account for one address, across every tenant that gave
 * them access. Read, never grown here: a user is given access on a tenant.
 */
/** A name as RCC holds it: the first word the first name, the rest the last. */
const firstOf = (name: string) => name.split(" ")[0] ?? "";
const lastOf = (name: string) => name.split(" ").slice(1).join(" ");

/** The auth tenant a user signs in through — the first enterprise that gave them access. */
const authTenantOf = (one: Account) => {
  const first = one.memberships[0];
  return first ? usersOf(first.tenant).find((each) => each.email === one.email)?.tenantId : undefined;
};

export function Users() {
  const rows = accounts();
  const partnerName = (one: Account) => (one.partnerId ? (partnerById(one.partnerId)?.name ?? one.partnerId) : "No partner");
  return (
    <CollectionPage
      title="Users"
      more={[{ label: "Download as CSV" }]}
      index={{
        rows,
        rowKey: (one) => one.userId,
        noun: { one: "user", many: "users" },
        identity: {
          title: "Username",
          name: (one) => one.email,
          mark: (one) => userMark(one),
          sortable: true,
          opens: (one) => userHref(one.userId),
        },
        sort: { column: "Username", direction: "ascending" },
        searchBy: ["Username", "User ID", "Auth tenant ID", "First name", "Last name", "Partner ID"],
        columns: [
          { name: "User ID", as: "identifier", standard: "id", value: (one) => one.userId },
          { name: "Auth tenant ID", as: "identifier", standard: "id", value: (one) => authTenantOf(one) },
          { name: "First name", value: (one) => firstOf(one.name), cell: (one) => firstOf(one.name) },
          { name: "Last name", value: (one) => lastOf(one.name), cell: (one) => lastOf(one.name) },
          { name: "Partner ID", as: "identifier", standard: "id", value: (one) => one.partnerId },
          { name: "Last login", as: "date", value: (one) => one.lastLogin },
          { name: "Enterprises", as: "count", hidden: true, value: (one) => one.memberships.length },
        ],
        filters: [
          {
            kind: "anyOf",
            key: "partner",
            label: "Partner",
            options: ["No partner", ...PARTNERS.map((one) => one.name)],
            of: (one) => partnerName(one),
          },
          {
            kind: "switches",
            key: "user",
            label: "User",
            switches: [
              { key: "owner", label: "Owns a tenant", holds: (one) => one.memberships.some((each) => each.owner) },
              { key: "never", label: "Never signed in", holds: (one) => !one.lastLogin },
              { key: "partnerless", label: "Partner user ID missing", holds: (one) => Boolean(one.partnerId) && !one.partnerUserId },
            ],
          },
        ],
        totals: [{ count: true }],
        commands: (one) => [
          { label: "Open", opens: userHref(one.userId) },
          { label: "Edit", opens: editUserHref(one.userId) },
          // Signing in as them leaves RCC, which this rebuild does not model.
          { label: "Impersonate" },
        ],
      }}
    />
  );
}

/** A user's partner user id issued where it is missing — the step the API owner needs by hand. */
export const generatePartnerUserId = (user: Account) => () => updateAccount(user.email, { partnerUserId: partnerUserId() });
