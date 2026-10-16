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
  /** The share of DSP revenue Revelator keeps, in percent. */
  dspRate: number;
  created: Date;
}

const enterprise = (id: string): Subscription => ({ id, sandbox: false, product: "Enterprise" });

export const CUSTOMERS: readonly Customer[] = [
  { id: "512", name: "Lowtide Assembly", email: "office@lowtide-assembly.co", status: "Onboarding", type: "Client", subscriptions: [], dspRate: 12, created: day(2026, 10, 15) },
  { id: "509", name: "Verdant Static", email: "accounts@verdantstatic.io", status: "Active", type: "Client", subscriptions: [enterprise("sub_1Rverdant509")], dspRate: 5, created: day(2026, 10, 13) },
  { id: "506", name: "Atlas Harbor Music", email: "label@atlasharbor.nl", status: "Onboarding", type: "Warner entity", subscriptions: [], dspRate: 0, created: day(2026, 10, 11) },
  { id: "501", name: "Paperkite Sound", email: "hi@paperkite.fm", status: "Active", type: "Client", subscriptions: [enterprise("sub_1Rpaperkite501")], dspRate: 3, created: day(2026, 10, 2) },
  { id: "497", name: "Ninefold Records", status: "Onboarding", type: "Warner entity", subscriptions: [enterprise("sub_1Rninefold497")], dspRate: 0, created: day(2026, 9, 24) },
  { id: "490", name: "Corvid Lane", email: "team@corvidlane.com", status: "Active", type: "Client", subscriptions: [enterprise("sub_1Rcorvid490")], dspRate: 15, created: day(2026, 9, 3) },
  { id: "483", name: "Silverbirch Publishing House", email: "rights@silverbirchph.co.uk", status: "Active", type: "Client", subscriptions: [enterprise("sub_1Rsilver483")], dspRate: 20, created: day(2026, 8, 19) },
  { id: "476", name: "Marlow Tide Entertainment", status: "Churned", type: "Client", subscriptions: [enterprise("sub_1Rmarlow476")], dspRate: 20, created: day(2026, 7, 7) },
  { id: "469", name: "Opaline", email: "ops@opaline.audio", status: "Active", type: "Client", subscriptions: [enterprise("sub_1Ropaline469"), { id: "sub_1Ropaline469api", sandbox: false, product: "API" }], dspRate: 10, created: day(2026, 6, 28) },
  { id: "462", name: "Brackenridge Audio", status: "Terminated", type: "Client", subscriptions: [enterprise("sub_1Rbracken462")], dspRate: 20, created: day(2026, 5, 16) },
  { id: "455", name: "Eastgate Music Partners", email: "finance@eastgatemusic.de", status: "Active", type: "Warner entity", subscriptions: [enterprise("sub_1Reastgate455")], dspRate: 0, created: day(2026, 4, 30) },
  { id: "448", name: "Thistle & Thorn", email: "label@thistleandthorn.ie", status: "Active", type: "Client", subscriptions: [enterprise("sub_1Rthistle448")], dspRate: 18, created: day(2026, 3, 12) },
  { id: "441", name: "Grainfield Collective", status: "Onboarding", type: "Client", subscriptions: [enterprise("sub_1Rgrain441")], dspRate: 20, created: day(2026, 2, 21) },
  { id: "434", name: "Kestrel Point Recordings", email: "admin@kestrelpoint.com", status: "Churned", type: "Client", subscriptions: [enterprise("sub_1Rkestrel434")], dspRate: 15, created: day(2025, 12, 4) },
  { id: "427", name: "Bluefen Distribution", email: "support@bluefen.dist", status: "Active", type: "Client", subscriptions: [enterprise("sub_1Rbluefen427"), { id: "sub_1Rbluefen427api", sandbox: false, product: "API" }], dspRate: 8, created: day(2025, 10, 9) },
  { id: "420", name: "Harrow Street Sound", status: "Active", type: "Warner entity", subscriptions: [enterprise("sub_1Rharrow420")], dspRate: 0, created: day(2025, 7, 1) },
  { id: "413", name: "Mistral Arcade", email: "hello@mistralarcade.fr", status: "Terminated", type: "Client", subscriptions: [enterprise("sub_1Rmistral413")], dspRate: 20, created: day(2025, 3, 18) },
  { id: "406", name: "Cinderwell Music", email: "ops@cinderwell.com", status: "Active", type: "Client", subscriptions: [enterprise("sub_1Rcinder406")], dspRate: 12, created: day(2024, 11, 26) },
  { id: "232", name: "RCC Demo Account", email: "demo@revelator.example", status: "Active", type: "Demo", subscriptions: [{ id: "sub_1PdemoPro", sandbox: true, product: "Revelator Pro" }, { id: "sub_1PdemoAPI", sandbox: true, product: "API" }], dspRate: 15, created: day(2024, 3, 12) },
  { id: "219", name: "Foxglove Ridge Records", status: "Active", type: "Client", subscriptions: [enterprise("sub_1Pfoxglove219")], dspRate: 20, created: day(2023, 9, 5) },
];

/** Someone at the customer Revelator writes to, and what they are written to about. */
export interface Contact {
  name: string;
  email: string;
  phone?: string;
  roles: readonly ("Primary" | "Billing" | "Royalties" | "Technical")[];
}

/** A tenant signed up under the customer — the workspace its catalogue lives in. */
export interface Tenant {
  enterpriseId: string;
  name: string;
  plan: string;
  /** Demo or sandbox, never a live catalogue. */
  sandbox: boolean;
  created: Date;
}

/** What a customer's record holds beyond its row: the company, the contract, its people and tenants. */
export interface CustomerRecord {
  stripe: string;
  phone: string;
  address?: string;
  country: string;
  taxType: string;
  taxId?: string;
  /** The share of UGC and YouTube channel revenue Revelator keeps, in percent. */
  ugcRate: number;
  youtubeRate: number;
  /** A monthly charge outside the rates, in dollars. */
  misc: number;
  newCustomer: boolean;
  comment?: string;
  /** What the last complete month came to, in dollars: Revelator's share, and the client's own. */
  revelatorRevenue: number;
  clientRevenue: number;
  contacts: readonly Contact[];
  tenants: readonly Tenant[];
}

const tenant = (enterpriseId: string, name: string, plan: string, created: Date, sandbox = false): Tenant => ({ enterpriseId, name, plan, sandbox, created });

export const RECORDS: Record<string, CustomerRecord> = {
  "512": { stripe: "cus_R8lowtide512", revelatorRevenue: 0, clientRevenue: 0, phone: "+61 2 5550 1188", address: "44 Kent St, 2000", country: "Australia", taxType: "AU ABN", taxId: "51 824 753 556", ugcRate: 12, youtubeRate: 12, misc: 0, newCustomer: true, comment: "Signed at the Sydney showcase", contacts: [{ name: "Harriet Vale", email: "harriet@lowtide-assembly.co", roles: ["Primary", "Billing"] }], tenants: [] },
  "509": { stripe: "cus_R8verdant509", revelatorRevenue: 0, clientRevenue: 0, phone: "+1 415 555 0172", address: "210 Valencia St, 94103", country: "United States", taxType: "US EIN", taxId: "84-2219073", ugcRate: 5, youtubeRate: 5, misc: 0, newCustomer: true, contacts: [{ name: "Omar Reyes", email: "omar@verdantstatic.io", phone: "+1 415 555 0173", roles: ["Primary"] }, { name: "Lena Brandt", email: "billing@verdantstatic.io", roles: ["Billing"] }], tenants: [] },
  "506": { stripe: "cus_R8atlas506", revelatorRevenue: 0, clientRevenue: 0, phone: "+31 20 555 0161", address: "Prinsengracht 412, 1016 JA", country: "Netherlands", taxType: "EU VAT", taxId: "NL862204517B01", ugcRate: 0, youtubeRate: 0, misc: 0, newCustomer: true, comment: "Warner Benelux imprint", contacts: [{ name: "Sanne Kuipers", email: "sanne@atlasharbor.nl", roles: ["Primary", "Royalties"] }], tenants: [] },
  "501": { stripe: "cus_R8paperkite501", revelatorRevenue: 184, clientRevenue: 6130, phone: "+44 20 7946 0518", address: "9 Hoxton Sq, N1 6NU", country: "United Kingdom", taxType: "GB VAT", taxId: "GB318274650", ugcRate: 3, youtubeRate: 3, misc: 0, newCustomer: true, comment: "Referred by a distribution partner", contacts: [{ name: "Felix Ashby", email: "felix@paperkite.fm", roles: ["Primary", "Billing"] }], tenants: [tenant("612034", "Paperkite Sound", "4 - Enterprise", day(2026, 10, 6))] },
  "497": { stripe: "cus_R8ninefold497", revelatorRevenue: 0, clientRevenue: 0, phone: "+49 30 5557 2210", country: "Germany", taxType: "EU VAT", taxId: "DE318842271", ugcRate: 0, youtubeRate: 0, misc: 0, newCustomer: true, contacts: [{ name: "Jana Wolff", email: "jana.wolff@ninefold.example", roles: ["Primary"] }], tenants: [tenant("611207", "Ninefold Records", "4 - Enterprise", day(2026, 9, 29))] },
  "490": { stripe: "cus_R8corvid490", revelatorRevenue: 2290, clientRevenue: 15270, phone: "+1 212 555 0148", address: "88 Bowery, 10013", country: "United States", taxType: "US EIN", taxId: "87-1140526", ugcRate: 15, youtubeRate: 15, misc: 250, newCustomer: false, contacts: [{ name: "Dana Whitlock", email: "dana@corvidlane.com", phone: "+1 212 555 0149", roles: ["Primary"] }, { name: "Rui Tanaka", email: "rui@corvidlane.com", roles: ["Technical"] }], tenants: [tenant("609881", "Corvid Lane", "3 - Growth", day(2026, 9, 8)), tenant("609882", "Corvid Lane Publishing", "3 - Growth", day(2026, 9, 15))] },
  "483": { stripe: "cus_R8silver483", revelatorRevenue: 1410, clientRevenue: 7050, phone: "+44 161 555 0193", address: "3 Tib St, M4 1LA", country: "United Kingdom", taxType: "GB VAT", taxId: "GB284716093", ugcRate: 20, youtubeRate: 20, misc: 0, newCustomer: false, contacts: [{ name: "Ivo Marsh", email: "rights@silverbirchph.co.uk", roles: ["Primary", "Royalties"] }], tenants: [tenant("608540", "Silverbirch Publishing House", "3 - Growth", day(2026, 8, 25))] },
  "476": { stripe: "cus_R8marlow476", revelatorRevenue: 0, clientRevenue: 0, phone: "+1 615 555 0127", country: "United States", taxType: "US EIN", taxId: "82-6630194", ugcRate: 20, youtubeRate: 20, misc: 0, newCustomer: false, comment: "Left after the September renewal", contacts: [{ name: "Grady Holt", email: "grady@marlowtide.example", roles: ["Primary"] }], tenants: [tenant("607113", "Marlow Tide Entertainment", "2 - Starter", day(2026, 7, 12))] },
  "469": { stripe: "cus_R8opaline469", revelatorRevenue: 4870, clientRevenue: 48700, phone: "+33 1 55 50 21 40", address: "17 rue Oberkampf, 75011", country: "France", taxType: "EU VAT", taxId: "FR41829304776", ugcRate: 10, youtubeRate: 10, misc: 500, newCustomer: false, contacts: [{ name: "Clémence Roy", email: "clemence@opaline.audio", roles: ["Primary", "Billing"] }, { name: "Théo Martin", email: "dev@opaline.audio", roles: ["Technical"] }], tenants: [tenant("606402", "Opaline", "4 - Enterprise", day(2026, 7, 2)), tenant("606403", "Opaline Classics", "3 - Growth", day(2026, 7, 20)), tenant("606404", "Opaline Sandbox", "4 - Enterprise", day(2026, 8, 3), true)] },
  "462": { stripe: "cus_R8bracken462", revelatorRevenue: 0, clientRevenue: 0, phone: "+1 503 555 0164", country: "United States", taxType: "US EIN", taxId: "83-4471209", ugcRate: 20, youtubeRate: 20, misc: 0, newCustomer: false, comment: "Contract ended for breach of terms", contacts: [{ name: "Walt Ferris", email: "walt@brackenridge.example", roles: ["Primary"] }], tenants: [tenant("605118", "Brackenridge Audio", "2 - Starter", day(2026, 5, 22))] },
  "455": { stripe: "cus_R8eastgate455", revelatorRevenue: 0, clientRevenue: 61480, phone: "+49 40 5550 7712", address: "Große Elbstraße 61, 22767", country: "Germany", taxType: "EU VAT", taxId: "DE297731846", ugcRate: 0, youtubeRate: 0, misc: 0, newCustomer: false, contacts: [{ name: "Katrin Lüders", email: "finance@eastgatemusic.de", roles: ["Primary", "Billing", "Royalties"] }], tenants: [tenant("604377", "Eastgate Music", "4 - Enterprise", day(2026, 5, 4)), tenant("604378", "Eastgate Classics", "3 - Growth", day(2026, 5, 18)), tenant("604379", "Eastgate Kids", "3 - Growth", day(2026, 6, 9)), tenant("604380", "Eastgate Test", "4 - Enterprise", day(2026, 6, 10), true)] },
  "448": { stripe: "cus_R8thistle448", revelatorRevenue: 960, clientRevenue: 5330, phone: "+353 1 555 0136", country: "Ireland", taxType: "EU VAT", taxId: "IE3829104KH", ugcRate: 18, youtubeRate: 18, misc: 0, newCustomer: false, contacts: [{ name: "Aoife Brennan", email: "label@thistleandthorn.ie", roles: ["Primary"] }], tenants: [tenant("603011", "Thistle & Thorn", "3 - Growth", day(2026, 3, 19))] },
  "441": { stripe: "cus_R8grain441", revelatorRevenue: 85, clientRevenue: 425, phone: "+1 312 555 0181", country: "United States", taxType: "US EIN", ugcRate: 20, youtubeRate: 20, misc: 0, newCustomer: true, contacts: [{ name: "Mo Abernathy", email: "mo@grainfield.example", roles: ["Primary"] }], tenants: [tenant("602290", "Grainfield Collective", "2 - Starter", day(2026, 2, 27))] },
  "434": { stripe: "cus_R8kestrel434", revelatorRevenue: 0, clientRevenue: 0, phone: "+1 718 555 0119", country: "United States", taxType: "US EIN", taxId: "81-9930412", ugcRate: 15, youtubeRate: 15, misc: 0, newCustomer: false, comment: "Moved to another distributor", contacts: [{ name: "Priya Lal", email: "admin@kestrelpoint.com", roles: ["Primary", "Billing"] }], tenants: [tenant("600874", "Kestrel Point Recordings", "3 - Growth", day(2025, 12, 10))] },
  "427": { stripe: "cus_R8bluefen427", revelatorRevenue: 9340, clientRevenue: 116750, phone: "+46 8 555 102 40", address: "Hornsgatan 54, 118 21", country: "Sweden", taxType: "EU VAT", taxId: "SE559183420101", ugcRate: 8, youtubeRate: 8, misc: 1200, newCustomer: false, contacts: [{ name: "Elin Sjöberg", email: "support@bluefen.dist", roles: ["Primary"] }, { name: "Nils Ek", email: "nils@bluefen.dist", roles: ["Billing"] }, { name: "Saga Lind", email: "api@bluefen.dist", roles: ["Technical"] }], tenants: [tenant("598215", "Bluefen Distribution", "4 - Enterprise", day(2025, 10, 14)), tenant("598216", "Bluefen Nordic", "4 - Enterprise", day(2025, 11, 2)), tenant("598217", "Bluefen Baltic", "3 - Growth", day(2025, 11, 30)), tenant("598218", "Bluefen Jazz", "3 - Growth", day(2026, 1, 12)), tenant("598219", "Bluefen Archive", "3 - Growth", day(2026, 2, 3)), tenant("598220", "Bluefen API Sandbox", "4 - Enterprise", day(2026, 2, 4), true)] },
  "420": { stripe: "cus_R8harrow420", revelatorRevenue: 0, clientRevenue: 38920, phone: "+44 20 7946 0402", country: "United Kingdom", taxType: "GB VAT", taxId: "GB271938460", ugcRate: 0, youtubeRate: 0, misc: 0, newCustomer: false, contacts: [{ name: "Tess Morley", email: "tess.morley@harrowstreet.example", roles: ["Primary", "Royalties"] }], tenants: [tenant("595660", "Harrow Street Sound", "4 - Enterprise", day(2025, 7, 9)), tenant("595661", "Harrow Street Live", "3 - Growth", day(2025, 9, 1))] },
  "413": { stripe: "cus_R8mistral413", revelatorRevenue: 0, clientRevenue: 0, phone: "+33 4 55 50 77 12", country: "France", taxType: "EU VAT", taxId: "FR22811930475", ugcRate: 20, youtubeRate: 20, misc: 0, newCustomer: false, comment: "Unpaid invoices since June", contacts: [{ name: "Luc Garnier", email: "hello@mistralarcade.fr", roles: ["Primary"] }], tenants: [tenant("593007", "Mistral Arcade", "2 - Starter", day(2025, 3, 25))] },
  "406": { stripe: "cus_R8cinder406", revelatorRevenue: 1780, clientRevenue: 14830, phone: "+1 604 555 0158", address: "1200 Granville St, V6Z 1M6", country: "Canada", taxType: "CA BN", taxId: "781946320RT0001", ugcRate: 12, youtubeRate: 12, misc: 0, newCustomer: false, contacts: [{ name: "Maeve Duncan", email: "ops@cinderwell.com", roles: ["Primary", "Billing"] }], tenants: [tenant("590113", "Cinderwell Music", "3 - Growth", day(2024, 12, 2)), tenant("590114", "Cinderwell Films", "3 - Growth", day(2025, 2, 17))] },
  "232": { stripe: "cus_P2demo232", revelatorRevenue: 0, clientRevenue: 0, phone: "+1 212 555 0100", country: "United States", taxType: "US EIN", ugcRate: 7.5, youtubeRate: 15, misc: 0, newCustomer: false, comment: "Holds every demo and sandbox tenant", contacts: [{ name: "Ezra Quinn", email: "demo@revelator.example", roles: ["Primary"] }], tenants: [] },
  "219": { stripe: "cus_P2foxglove219", revelatorRevenue: 1215, clientRevenue: 6075, phone: "+1 512 555 0133", country: "United States", taxType: "US EIN", taxId: "80-5521847", ugcRate: 20, youtubeRate: 20, misc: 0, newCustomer: false, contacts: [{ name: "June Calloway", email: "june@foxgloveridge.example", roles: ["Primary"] }], tenants: [tenant("571902", "Foxglove Ridge Records", "3 - Growth", day(2023, 9, 11))] },
};

/** The last twelve complete months, oldest first — October 2025 to September 2026. */
export const MONTHS = Array.from({ length: 12 }, (_, at) => new Date(2025, 9 + at, 1));

/**
 * How a customer's month moves around its last one — a hand-drawn shape, the same for every
 * customer, scaled to what each earned; nothing is drawn before the customer joined.
 */
const SHAPE = [0.62, 0.66, 0.71, 0.69, 0.74, 0.8, 0.78, 0.85, 0.9, 0.88, 0.95, 1];

export const monthlyOf = (lastMonth: number, joined: Date) =>
  MONTHS.map((month, at) => (month < new Date(joined.getFullYear(), joined.getMonth(), 1) ? 0 : Math.round(lastMonth * SHAPE[at]!)));

export const customerById = (id: string) => CUSTOMERS.find((one) => one.id === id) ?? CUSTOMERS[0]!;
