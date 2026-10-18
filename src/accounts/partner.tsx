import { Fragment, type ReactNode } from "react";
import {
  Avatar,
  DetailPage,
  FactCard,
  Metadata,
  RecordIndex,
  type DetailFacet,
  type RecordNavProps,
  type ShellPlace,
} from "@revelator/pro-ui";

import { PARTNER_FACETS, accountsHref, partnerHref, tenantHref, userHref, type PartnerFacet } from "../route";
import { PARTNERS, partnerById, tenantsOfPartner } from "./mock";
import { EditPartner, partnerMark, usersOfPartner } from "./partners";
import { tenantMark } from "./tenants";

/** The partner the address names, or the first. */
const partnerOf = (id: string) => partnerById(id) ?? PARTNERS[0]!;

/**
 * One API partner, as a record: what it is, the sandboxes connected to it, and the users it knows
 * by a partner user id — what makes its API key work for them.
 */
export function PartnerDetail({ id, facet }: { id: string; facet: PartnerFacet }) {
  const partner = partnerOf(id);
  const sandboxes = tenantsOfPartner(partner.id);
  const users = usersOfPartner(partner.id);

  const FACETS: Record<PartnerFacet, { header?: DetailFacet; body: ReactNode }> = {
    Details: {
      body: (
        <Metadata>
          <FactCard
            title="Partner"
            facts={[
              { label: "Partner ID", value: partner.id, standard: "id" },
              { label: "Name", value: partner.name },
              // The key is the product's to show: here it only says one was issued.
              { label: "API key", value: "Issued — shown in the product only" },
              { label: "Minimum payment", as: "money", value: partner.minimumPayment },
              { label: "Every account on trial", value: partner.allOnTrial ? "Yes" : "No" },
              { label: "Created", as: "date", value: partner.created },
            ]}
          />
        </Metadata>
      ),
    },
    Tenants: {
      header: { name: "Tenants" },
      body: (
        <RecordIndex
          rows={sandboxes}
          rowKey={(one) => one.enterpriseId}
          noun={{ one: "tenant", many: "tenants" }}
          identity={{ title: "Name", name: (one) => one.name, mark: (one) => tenantMark(one), opens: (one) => tenantHref(one.enterpriseId) }}
          columns={[
            { name: "Enterprise ID", as: "identifier", standard: "id", value: (one) => one.enterpriseId },
            { name: "Environment", value: (one) => one.environment, cell: (one) => one.environment },
            { name: "Created", as: "date", value: (one) => one.created },
          ]}
          chooser={false}
          empty={{ holder: "this partner", line: true }}
        />
      ),
    },
    Users: {
      header: { name: "Users" },
      body: (
        <RecordIndex
          rows={users}
          rowKey={(one) => one.userId}
          noun={{ one: "user", many: "users" }}
          identity={{
            title: "Name",
            name: (one) => one.name,
            mark: (one) => <Avatar kind="person" name={one.name} />,
            opens: (one) => userHref(one.userId),
          }}
          columns={[
            { name: "Email", value: (one) => one.email, cell: (one) => one.email },
            { name: "Partner user ID", as: "identifier", standard: "id", value: (one) => one.partnerUserId },
          ]}
          chooser={false}
          empty={{ holder: "this partner", line: true }}
        />
      ),
    },
  };
  const shown = FACETS[facet];

  return (
    <DetailPage
      record={{
        mark: partnerMark(partner),
        name: partner.name,
        kind: "API partner",
        facts: [{ identifier: partner.id, standard: "id" }, { as: "count", value: sandboxes.length, noun: { one: "sandbox", many: "sandboxes" } }],
        actions: [{ label: "Edit", dialog: <EditPartner partner={partner} /> }],
      }}
      facet={shown.header}
    >
      {/* KEYED by the facet, so two facets that are both an index never share one's columns. */}
      <Fragment key={facet}>{shown.body}</Fragment>
    </DetailPage>
  );
}

/** Where one partner's page is: its facets, and a trail that reaches past the index to it. */
export const partnerPlace = ({ id, facet }: { id: string; facet: PartnerFacet }): ShellPlace => {
  const partner = partnerOf(id);
  const nav: RecordNavProps<PartnerFacet> = {
    back: { index: "Partners", opens: accountsHref("partners") },
    facets: PARTNER_FACETS,
    at: facet,
    addressOf: (one) => partnerHref(partner.id, one),
  };
  return {
    at: "Accounts",
    page: partner.name,
    record: nav,
    trail: [
      { label: "Accounts", opens: accountsHref("customers") },
      { label: "Partners", opens: accountsHref("partners") },
      { label: partner.name },
    ],
  };
};
