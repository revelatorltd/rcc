import type { ReactNode } from "react";
import {
  DetailPage,
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
  tenantHref,
  whiteLabelHref,
  type WhiteLabelFacet,
} from "../route";
import { whiteLabelById, whiteLabels } from "./mock";
import { activityOf, activityPanel } from "./activity";
import { DeleteWhiteLabel, WhiteLabelFacts, whiteLabelMark } from "./white-labels";

/** The white label the address names, or the first. */
const labelOf = (id: string) => whiteLabelById(id) ?? whiteLabels()[0]!;

/**
 * One white label, as a record: where it loads, how it signs people in, what it shows and where it
 * sends them. Edited on its form; deleted from the overflow, asked first.
 */
export function WhiteLabelDetail({ id, facet }: { id: string; facet: WhiteLabelFacet }) {
  const label = labelOf(id);

  const FACETS: Record<WhiteLabelFacet, { header?: DetailFacet; body: ReactNode }> = {
    Details: {
      body: <WhiteLabelFacts label={label} tenant={label.tenant} />,
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
        activity: activityPanel(activityOf("White label", label.id)),
      }}
      facet={shown.header}
    >
      {shown.body}
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
      { label: "Accounts", opens: accountsHref("tenants") },
      { label: "White labels", opens: accountsHref("white-labels") },
      { label: label.domain },
    ],
  };
};
