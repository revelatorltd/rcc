import tenK from "./logos/10k.png";
import threeHundred from "./logos/300.png";
import ada from "./logos/ada.png";
import atlantic from "./logos/atlantic.png";
import rhino from "./logos/rhino.png";
import warnerRecords from "./logos/warner-records.png";
import wmg from "./logos/wmg.jpeg";

import { ENTERPRISE_SCOPE, ORGANIZATIONS } from "./mock";

/**
 * The organizations' own logos, by scope — the enterprise's among them. Taken from the Revelator Ops
 * prototype until the design system ships them with its other organizations' marks (gaps.md): a new
 * organization made here has none, and keeps its initials.
 */
const LOGOS: Readonly<Record<string, string>> = {
  ada,
  atl: atlantic,
  wr: warnerRecords,
  rhn: rhino,
  "300": threeHundred,
  "10k": tenK,
  [ENTERPRISE_SCOPE]: wmg,
};

export const logoOf = (scope: string): string | undefined => LOGOS[scope];

/** A logo found by the name a cell is given — an organization's, or the enterprise level's. */
export const logoByName = (name: string): string | undefined =>
  name === "Enterprise-level" ? LOGOS[ENTERPRISE_SCOPE] : logoOf(ORGANIZATIONS.find((one) => one.name === name)?.id ?? "");
