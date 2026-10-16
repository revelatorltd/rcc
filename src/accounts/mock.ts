/**
 * The accounts RCC holds — invented, hand-written, never copied from the prototype or the product.
 * Stored newest first, so an index that opens on its entry date reads them as they were written.
 */
export const TODAY = new Date(2026, 9, 16);

const day = (year: number, month: number, date: number) => new Date(year, month - 1, date);

/** Where the customer stands with Revelator. */
export type CustomerStatus = "Active" | "Onboarding" | "Churned" | "Terminated";
/** Who holds the contract: a client of Revelator's, an entity of Warner's, or Revelator's own demo. */
export type CustomerType = "Client" | "Warner entity" | "Demo";

export interface Subscription {
  id: string;
  /** A sandbox subscription carries demo and test tenants, never a live catalogue. */
  sandbox: boolean;
  product: "Enterprise" | "Revelator Pro" | "API";
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  status: CustomerStatus;
  type: CustomerType;
  subscriptions: readonly Subscription[];
  tenants: number;
  /** The share of DSP revenue Revelator keeps, in percent. */
  dspRate: number;
  created: Date;
}

const enterprise = (id: string): Subscription => ({ id, sandbox: false, product: "Enterprise" });

export const CUSTOMERS: readonly Customer[] = [
  { id: "512", name: "Lowtide Assembly", email: "office@lowtide-assembly.co", status: "Onboarding", type: "Client", subscriptions: [], tenants: 0, dspRate: 12, created: day(2026, 10, 15) },
  { id: "509", name: "Verdant Static", email: "accounts@verdantstatic.io", status: "Active", type: "Client", subscriptions: [enterprise("sub_1Rverdant509")], tenants: 0, dspRate: 5, created: day(2026, 10, 13) },
  { id: "506", name: "Atlas Harbor Music", email: "label@atlasharbor.nl", status: "Onboarding", type: "Warner entity", subscriptions: [], tenants: 0, dspRate: 0, created: day(2026, 10, 11) },
  { id: "501", name: "Paperkite Sound", email: "hi@paperkite.fm", status: "Active", type: "Client", subscriptions: [enterprise("sub_1Rpaperkite501")], tenants: 1, dspRate: 3, created: day(2026, 10, 2) },
  { id: "497", name: "Ninefold Records", status: "Onboarding", type: "Warner entity", subscriptions: [enterprise("sub_1Rninefold497")], tenants: 1, dspRate: 0, created: day(2026, 9, 24) },
  { id: "490", name: "Corvid Lane", email: "team@corvidlane.com", status: "Active", type: "Client", subscriptions: [enterprise("sub_1Rcorvid490")], tenants: 2, dspRate: 15, created: day(2026, 9, 3) },
  { id: "483", name: "Silverbirch Publishing House", email: "rights@silverbirchph.co.uk", status: "Active", type: "Client", subscriptions: [enterprise("sub_1Rsilver483")], tenants: 1, dspRate: 20, created: day(2026, 8, 19) },
  { id: "476", name: "Marlow Tide Entertainment", status: "Churned", type: "Client", subscriptions: [enterprise("sub_1Rmarlow476")], tenants: 1, dspRate: 20, created: day(2026, 7, 7) },
  { id: "469", name: "Opaline", email: "ops@opaline.audio", status: "Active", type: "Client", subscriptions: [enterprise("sub_1Ropaline469"), { id: "sub_1Ropaline469api", sandbox: false, product: "API" }], tenants: 3, dspRate: 10, created: day(2026, 6, 28) },
  { id: "462", name: "Brackenridge Audio", status: "Terminated", type: "Client", subscriptions: [enterprise("sub_1Rbracken462")], tenants: 1, dspRate: 20, created: day(2026, 5, 16) },
  { id: "455", name: "Eastgate Music Partners", email: "finance@eastgatemusic.de", status: "Active", type: "Warner entity", subscriptions: [enterprise("sub_1Reastgate455")], tenants: 4, dspRate: 0, created: day(2026, 4, 30) },
  { id: "448", name: "Thistle & Thorn", email: "label@thistleandthorn.ie", status: "Active", type: "Client", subscriptions: [enterprise("sub_1Rthistle448")], tenants: 1, dspRate: 18, created: day(2026, 3, 12) },
  { id: "441", name: "Grainfield Collective", status: "Onboarding", type: "Client", subscriptions: [enterprise("sub_1Rgrain441")], tenants: 1, dspRate: 20, created: day(2026, 2, 21) },
  { id: "434", name: "Kestrel Point Recordings", email: "admin@kestrelpoint.com", status: "Churned", type: "Client", subscriptions: [enterprise("sub_1Rkestrel434")], tenants: 1, dspRate: 15, created: day(2025, 12, 4) },
  { id: "427", name: "Bluefen Distribution", email: "support@bluefen.dist", status: "Active", type: "Client", subscriptions: [enterprise("sub_1Rbluefen427"), { id: "sub_1Rbluefen427api", sandbox: false, product: "API" }], tenants: 6, dspRate: 8, created: day(2025, 10, 9) },
  { id: "420", name: "Harrow Street Sound", status: "Active", type: "Warner entity", subscriptions: [enterprise("sub_1Rharrow420")], tenants: 2, dspRate: 0, created: day(2025, 7, 1) },
  { id: "413", name: "Mistral Arcade", email: "hello@mistralarcade.fr", status: "Terminated", type: "Client", subscriptions: [enterprise("sub_1Rmistral413")], tenants: 1, dspRate: 20, created: day(2025, 3, 18) },
  { id: "406", name: "Cinderwell Music", email: "ops@cinderwell.com", status: "Active", type: "Client", subscriptions: [enterprise("sub_1Rcinder406")], tenants: 2, dspRate: 12, created: day(2024, 11, 26) },
  { id: "232", name: "RCC Demo Account", email: "demo@revelator.example", status: "Active", type: "Demo", subscriptions: [{ id: "sub_1PdemoPro", sandbox: true, product: "Revelator Pro" }, { id: "sub_1PdemoAPI", sandbox: true, product: "API" }], tenants: 0, dspRate: 15, created: day(2024, 3, 12) },
  { id: "219", name: "Foxglove Ridge Records", status: "Active", type: "Client", subscriptions: [enterprise("sub_1Pfoxglove219")], tenants: 1, dspRate: 20, created: day(2023, 9, 5) },
];
