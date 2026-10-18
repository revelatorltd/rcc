import { Fragment, type ReactNode } from "react";
import {
  DetailPage,
  FactCard,
  Link,
  Metadata,
  type Command,
  type DetailFacet,
  type RecordNavProps,
  type ShellPlace,
} from "@revelator/pro-ui";

import {
  WHITE_LABEL_FACETS,
  accountsHref,
  editWhiteLabelHref,
  go,
  partnerHref,
  tenantHref,
  whiteLabelHref,
  type WhiteLabelFacet,
} from "../route";
import { partnerById, whiteLabelById, whiteLabels } from "./mock";
import { DeleteWhiteLabel, enabledBadge, whiteLabelMark } from "./white-labels";

/** The white label the address names, or the first. */
const labelOf = (id: string) => whiteLabelById(id) ?? whiteLabels()[0]!;

const yesNo = (value: boolean | undefined) => (value ? "Yes" : "No");

/**
 * One white label, as a record: where it loads, how it signs people in, what it shows and where it
 * sends them. Edited on its form; deleted from the overflow, asked first.
 */
export function WhiteLabelDetail({ id, facet }: { id: string; facet: WhiteLabelFacet }) {
  const label = labelOf(id);
  const partner = label.partnerId ? partnerById(label.partnerId) : undefined;

  const FACETS: Record<WhiteLabelFacet, { header?: DetailFacet; body: ReactNode }> = {
    Details: {
      body: (
        <Metadata>
          <FactCard
            title="White label"
            facts={[
              { label: "White label ID", value: label.id, standard: "id" },
              { label: "Domain", value: label.domain },
              { label: "Title", value: label.title },
              {
                label: "Tenant",
                value: label.tenant ? <Link opens={tenantHref(label.tenant.enterpriseId)}>{label.tenant.name}</Link> : "Revelator's own",
              },
              { label: "Partner", value: partner ? <Link opens={partnerHref(partner.id)}>{partner.name}</Link> : undefined },
            ]}
          />
          <FactCard
            title="Sign-in"
            facts={[
              { label: "White label enabled", value: enabledBadge(label.enabled) },
              { label: "Allows sign-up", value: yesNo(label.allowSignup) },
              { label: "Allows password reset", value: yesNo(label.allowForgotPassword ?? true) },
              { label: "Shows Revelator's branding", value: yesNo(label.showRevelatorBranding) },
            ]}
          />
          <FactCard
            title="Links"
            facts={[
              { label: "Terms and conditions", value: label.termsUrl },
              { label: "FAQ", value: label.faqUrl },
              { label: "Help", value: label.helpUrl },
            ]}
          />
        </Metadata>
      ),
    },
  };
  const shown = FACETS[facet];

  const more: Command[] = [
    ...(label.tenant ? [{ label: "Open tenant", opens: tenantHref(label.tenant.enterpriseId) }] : []),
    {
      label: "Delete white label",
      destructive: true,
      dialog: <DeleteWhiteLabel label={label} after={() => go(accountsHref("white-labels"))} />,
    },
  ];

  return (
    <DetailPage
      record={{
        mark: whiteLabelMark(label),
        name: label.domain,
        kind: "White label",
        facts: [{ identifier: label.id, standard: "id" }, { text: label.tenant ? label.tenant.name : "Revelator's own" }],
        actions: [{ label: "Edit", opens: editWhiteLabelHref(label.id) }],
        more,
      }}
      facet={shown.header}
    >
      <Fragment key={facet}>{shown.body}</Fragment>
    </DetailPage>
  );
}

/** Where one white label's page is: its facets, and a trail that reaches past the index to it. */
export const whiteLabelPlace = ({ id, facet }: { id: string; facet: WhiteLabelFacet }): ShellPlace => {
  const label = labelOf(id);
  const nav: RecordNavProps<WhiteLabelFacet> = {
    back: { index: "White labels", opens: accountsHref("white-labels") },
    facets: WHITE_LABEL_FACETS,
    at: facet,
    addressOf: (one) => whiteLabelHref(label.id, one),
  };
  return {
    at: "Accounts",
    page: label.domain,
    record: nav,
    trail: [
      { label: "Accounts", opens: accountsHref("customers") },
      { label: "White labels", opens: accountsHref("white-labels") },
      { label: label.domain },
    ],
  };
};
