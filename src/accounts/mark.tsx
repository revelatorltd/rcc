import { Avatar } from "@revelator/pro-ui";
import { ORGANIZATIONS } from "@revelator/pro-ui/assets";

import type { Customer } from "./mock";

/**
 * A customer, as the mark it is known by — its organization's own, which fills the square in place
 * of the initials; a customer with no mark of its own keeps its initials on the tone its name keys.
 * ONE function, so the row a reader pressed and the band they landed on wear the same mark.
 */
export const customerMark = (one: Customer) => (
  <Avatar kind="organization" name={one.name}>
    {one.organization ? <img src={ORGANIZATIONS[one.organization].art} alt="" /> : null}
  </Avatar>
);
