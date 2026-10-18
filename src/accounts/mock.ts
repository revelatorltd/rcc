import { formatMeta } from "@revelator/pro-ui";
import { useSyncExternalStore } from "react";
import type { OrganizationSlug } from "@revelator/pro-ui/assets";

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
  /** The discount Stripe applies to it, where one was given. */
  coupon?: string;
  /** What it is for, where the product does not say it — demo tenants, a Warner imprint. */
  note?: string;
  /** The day it was linked in RCC, where it was linked here. */
  linked?: Date;
}

export interface Customer {
  id: string;
  name: string;
  /** The organization whose mark the customer wears, where it has one — the demo account has none. */
  organization?: OrganizationSlug;
  email?: string;
  status: CustomerStatus;
  type: CustomerType;
  subscriptions: readonly Subscription[];
  /** The share of DSP revenue Revelator keeps, in percent. */
  dspRate: number;
  created: Date;
  /** The day the contract ended — the customer left, or Revelator ended it — after which it earns nothing. */
  ended?: Date;
}

const enterprise = (id: string): Subscription => ({ id, sandbox: false, product: "Enterprise" });

export let CUSTOMERS: readonly Customer[] = [
  { id: "512", name: "Lowtide Assembly", organization: "lowtide-assembly", email: "office@lowtide-assembly.co", status: "Onboarding", type: "Client", subscriptions: [], dspRate: 12, created: day(2026, 10, 15) },
  { id: "509", name: "Verdant Static", organization: "verdant-static", email: "accounts@verdantstatic.io", status: "Active", type: "Client", subscriptions: [enterprise("sub_1Rverdant509")], dspRate: 5, created: day(2026, 10, 13) },
  { id: "506", name: "Atlas Harbor Music", organization: "atlas-harbor-music", email: "label@atlasharbor.nl", status: "Onboarding", type: "Warner entity", subscriptions: [], dspRate: 0, created: day(2026, 10, 11) },
  { id: "501", name: "Paperkite Sound", organization: "paperkite-sound", email: "hi@paperkite.fm", status: "Active", type: "Client", subscriptions: [enterprise("sub_1Rpaperkite501")], dspRate: 3, created: day(2026, 10, 2) },
  { id: "497", name: "Ninefold Records", organization: "ninefold-records", status: "Onboarding", type: "Warner entity", subscriptions: [enterprise("sub_1Rninefold497")], dspRate: 0, created: day(2026, 9, 24) },
  { id: "490", name: "Corvid Lane", organization: "corvid-lane", email: "team@corvidlane.com", status: "Active", type: "Client", subscriptions: [enterprise("sub_1Rcorvid490")], dspRate: 15, created: day(2026, 9, 3) },
  { id: "483", name: "Silverbirch Publishing House", organization: "silverbirch-publishing-house", email: "rights@silverbirchph.co.uk", status: "Active", type: "Client", subscriptions: [enterprise("sub_1Rsilver483")], dspRate: 20, created: day(2026, 8, 19) },
  { id: "476", name: "Marlow Tide Entertainment", organization: "marlow-tide-entertainment", status: "Churned", type: "Client", subscriptions: [enterprise("sub_1Rmarlow476")], dspRate: 20, created: day(2026, 7, 7), ended: day(2026, 9, 1) },
  { id: "469", name: "Opaline", organization: "opaline", email: "ops@opaline.audio", status: "Active", type: "Client", subscriptions: [enterprise("sub_1Ropaline469"), { id: "sub_1Ropaline469api", sandbox: false, product: "API" }], dspRate: 10, created: day(2026, 6, 28) },
  { id: "462", name: "Brackenridge Audio", organization: "brackenridge-audio", status: "Terminated", type: "Client", subscriptions: [enterprise("sub_1Rbracken462")], dspRate: 20, created: day(2026, 5, 16), ended: day(2026, 8, 1) },
  { id: "455", name: "Eastgate Music Partners", organization: "eastgate-music-partners", email: "finance@eastgatemusic.de", status: "Active", type: "Warner entity", subscriptions: [enterprise("sub_1Reastgate455")], dspRate: 0, created: day(2026, 4, 30) },
  { id: "448", name: "Thistle & Thorn", organization: "thistle-and-thorn", email: "label@thistleandthorn.ie", status: "Active", type: "Client", subscriptions: [enterprise("sub_1Rthistle448")], dspRate: 18, created: day(2026, 3, 12) },
  { id: "441", name: "Grainfield Collective", organization: "grainfield-collective", status: "Onboarding", type: "Client", subscriptions: [enterprise("sub_1Rgrain441")], dspRate: 20, created: day(2026, 2, 21) },
  { id: "434", name: "Kestrel Point Recordings", organization: "kestrel-point-recordings", email: "admin@kestrelpoint.com", status: "Churned", type: "Client", subscriptions: [enterprise("sub_1Rkestrel434")], dspRate: 15, created: day(2025, 12, 4), ended: day(2026, 6, 1) },
  { id: "427", name: "Bluefen Distribution", organization: "bluefen-distribution", email: "support@bluefen.dist", status: "Active", type: "Client", subscriptions: [enterprise("sub_1Rbluefen427"), { id: "sub_1Rbluefen427api", sandbox: false, product: "API" }], dspRate: 8, created: day(2025, 10, 9) },
  { id: "420", name: "Harrow Street Sound", organization: "harrow-street-sound", status: "Active", type: "Warner entity", subscriptions: [enterprise("sub_1Rharrow420")], dspRate: 0, created: day(2025, 7, 1) },
  { id: "413", name: "Mistral Arcade", organization: "mistral-arcade", email: "hello@mistralarcade.fr", status: "Terminated", type: "Client", subscriptions: [enterprise("sub_1Rmistral413")], dspRate: 20, created: day(2025, 3, 18), ended: day(2026, 7, 1) },
  { id: "406", name: "Cinderwell Music", organization: "cinderwell-music", email: "ops@cinderwell.com", status: "Active", type: "Client", subscriptions: [enterprise("sub_1Rcinder406")], dspRate: 12, created: day(2024, 11, 26) },
  { id: "232", name: "RCC Demo Account", email: "demo@revelator.example", status: "Active", type: "Demo", subscriptions: [{ id: "sub_1PdemoPro", sandbox: true, product: "Revelator Pro" }, { id: "sub_1PdemoAPI", sandbox: true, product: "API" }], dspRate: 15, created: day(2024, 3, 12) },
  { id: "219", name: "Foxglove Ridge Records", organization: "foxglove-ridge-records", status: "Active", type: "Client", subscriptions: [enterprise("sub_1Pfoxglove219")], dspRate: 20, created: day(2023, 9, 5) },
];

/** Someone at the customer Revelator writes to, and what they are written to about. */
export interface Contact {
  name: string;
  email: string;
  phone?: string;
  roles: readonly ("Primary" | "Billing" | "Royalties" | "Technical" | "Legal")[];
}

/** What a customer's record holds beyond its row: the company, the contract and its people. Its tenants are their own set (TENANTS). */
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
}


export let RECORDS: Readonly<Record<string, CustomerRecord>> = {
  "512": { stripe: "cus_R8lowtide512", revelatorRevenue: 320, clientRevenue: 2670, phone: "+61 2 5550 1188", address: "44 Kent St, 2000", country: "Australia", taxType: "AU ABN", taxId: "51 824 753 556", ugcRate: 15, youtubeRate: 10, misc: 0, newCustomer: true, comment: "Signed at the Sydney showcase", contacts: [{ name: "Harriet Vale", email: "harriet@lowtide-assembly.co", roles: ["Primary", "Billing"] }] },
  "509": { stripe: "cus_R8verdant509", revelatorRevenue: 410, clientRevenue: 8200, phone: "+1 415 555 0172", address: "210 Valencia St, 94103", country: "United States of America", taxType: "US EIN", taxId: "84-2219073", ugcRate: 8, youtubeRate: 6.5, misc: 0, newCustomer: true, contacts: [{ name: "Omar Reyes", email: "omar@verdantstatic.io", phone: "+1 415 555 0173", roles: ["Primary"] }, { name: "Lena Brandt", email: "billing@verdantstatic.io", roles: ["Billing"] }] },
  "506": { stripe: "cus_R8atlas506", revelatorRevenue: 260, clientRevenue: 9480, phone: "+31 20 555 0161", address: "Prinsengracht 412, 1016 JA", country: "Netherlands", taxType: "EU VAT", taxId: "NL862204517B01", ugcRate: 0, youtubeRate: 0, misc: 0, newCustomer: true, comment: "Warner Benelux imprint", contacts: [{ name: "Sanne Kuipers", email: "sanne@atlasharbor.nl", roles: ["Primary", "Royalties"] }] },
  "501": { stripe: "cus_R8paperkite501", revelatorRevenue: 184, clientRevenue: 6130, phone: "+44 20 7946 0518", address: "9 Hoxton Sq, N1 6NU", country: "United Kingdom", taxType: "GB VAT", taxId: "GB318274650", ugcRate: 5, youtubeRate: 4, misc: 0, newCustomer: true, comment: "Referred by a distribution partner", contacts: [{ name: "Felix Ashby", email: "felix@paperkite.fm", roles: ["Primary", "Billing"] }] },
  "497": { stripe: "cus_R8ninefold497", revelatorRevenue: 350, clientRevenue: 12740, phone: "+49 30 5557 2210", country: "Germany", taxType: "EU VAT", taxId: "DE318842271", ugcRate: 0, youtubeRate: 0, misc: 0, newCustomer: true, contacts: [{ name: "Jana Wolff", email: "jana.wolff@ninefold.example", roles: ["Primary"] }] },
  "490": { stripe: "cus_R8corvid490", revelatorRevenue: 2290, clientRevenue: 15270, phone: "+1 212 555 0148", address: "88 Bowery, 10013", country: "United States of America", taxType: "US EIN", taxId: "87-1140526", ugcRate: 18, youtubeRate: 12.5, misc: 250, newCustomer: false, contacts: [{ name: "Dana Whitlock", email: "dana@corvidlane.com", phone: "+1 212 555 0149", roles: ["Primary"] }, { name: "Rui Tanaka", email: "rui@corvidlane.com", roles: ["Technical"] }] },
  "483": { stripe: "cus_R8silver483", revelatorRevenue: 1410, clientRevenue: 7050, phone: "+44 161 555 0193", address: "3 Tib St, M4 1LA", country: "United Kingdom", taxType: "GB VAT", taxId: "GB284716093", ugcRate: 25, youtubeRate: 15, misc: 0, newCustomer: false, contacts: [{ name: "Ivo Marsh", email: "rights@silverbirchph.co.uk", roles: ["Primary", "Royalties"] }] },
  "476": { stripe: "cus_R8marlow476", revelatorRevenue: 530, clientRevenue: 3530, phone: "+1 615 555 0127", country: "United States of America", taxType: "US EIN", taxId: "82-6630194", ugcRate: 22.5, youtubeRate: 18, misc: 0, newCustomer: false, comment: "Left after the September renewal", contacts: [{ name: "Grady Holt", email: "grady@marlowtide.example", roles: ["Primary"] }] },
  "469": { stripe: "cus_R8opaline469", revelatorRevenue: 4870, clientRevenue: 48700, phone: "+33 1 55 50 21 40", address: "17 rue Oberkampf, 75011", country: "France", taxType: "EU VAT", taxId: "FR41829304776", ugcRate: 12, youtubeRate: 7.5, misc: 500, newCustomer: false, contacts: [{ name: "Clémence Roy", email: "clemence@opaline.audio", roles: ["Primary", "Billing"] }, { name: "Théo Martin", email: "dev@opaline.audio", roles: ["Technical"] }] },
  "462": { stripe: "cus_R8bracken462", revelatorRevenue: 690, clientRevenue: 3450, phone: "+1 503 555 0164", country: "United States of America", taxType: "US EIN", taxId: "83-4471209", ugcRate: 25, youtubeRate: 17, misc: 0, newCustomer: false, comment: "Contract ended for breach of terms", contacts: [{ name: "Walt Ferris", email: "walt@brackenridge.example", roles: ["Primary"] }] },
  "455": { stripe: "cus_R8eastgate455", revelatorRevenue: 1150, clientRevenue: 61480, phone: "+49 40 5550 7712", address: "Große Elbstraße 61, 22767", country: "Germany", taxType: "EU VAT", taxId: "DE297731846", ugcRate: 0, youtubeRate: 0, misc: 0, newCustomer: false, contacts: [{ name: "Katrin Lüders", email: "finance@eastgatemusic.de", roles: ["Primary", "Billing", "Royalties"] }] },
  "448": { stripe: "cus_R8thistle448", revelatorRevenue: 960, clientRevenue: 5330, phone: "+353 1 555 0136", country: "Ireland", taxType: "EU VAT", taxId: "IE3829104KH", ugcRate: 20, youtubeRate: 15.5, misc: 0, newCustomer: false, contacts: [{ name: "Aoife Brennan", email: "label@thistleandthorn.ie", roles: ["Primary"] }] },
  "441": { stripe: "cus_R8grain441", revelatorRevenue: 85, clientRevenue: 425, phone: "+1 312 555 0181", country: "United States of America", taxType: "US EIN", ugcRate: 25, youtubeRate: 22, misc: 0, newCustomer: true, contacts: [{ name: "Mo Abernathy", email: "mo@grainfield.example", roles: ["Primary"] }] },
  "434": { stripe: "cus_R8kestrel434", revelatorRevenue: 745, clientRevenue: 4970, phone: "+1 718 555 0119", country: "United States of America", taxType: "US EIN", taxId: "81-9930412", ugcRate: 17.5, youtubeRate: 12, misc: 0, newCustomer: false, comment: "Moved to another distributor", contacts: [{ name: "Priya Lal", email: "admin@kestrelpoint.com", roles: ["Primary", "Billing"] }] },
  "427": { stripe: "cus_R8bluefen427", revelatorRevenue: 9340, clientRevenue: 116750, phone: "+46 8 555 102 40", address: "Hornsgatan 54, 118 21", country: "Sweden", taxType: "EU VAT", taxId: "SE559183420101", ugcRate: 10, youtubeRate: 6, misc: 1200, newCustomer: false, contacts: [{ name: "Elin Sjöberg", email: "support@bluefen.dist", roles: ["Primary"] }, { name: "Nils Ek", email: "nils@bluefen.dist", roles: ["Billing"] }, { name: "Saga Lind", email: "api@bluefen.dist", roles: ["Technical"] }] },
  "420": { stripe: "cus_R8harrow420", revelatorRevenue: 880, clientRevenue: 38920, phone: "+44 20 7946 0402", country: "United Kingdom", taxType: "GB VAT", taxId: "GB271938460", ugcRate: 0, youtubeRate: 0, misc: 0, newCustomer: false, contacts: [{ name: "Tess Morley", email: "tess.morley@harrowstreet.example", roles: ["Primary", "Royalties"] }] },
  "413": { stripe: "cus_R8mistral413", revelatorRevenue: 560, clientRevenue: 2800, phone: "+33 4 55 50 77 12", country: "France", taxType: "EU VAT", taxId: "FR22811930475", ugcRate: 22, youtubeRate: 25, misc: 0, newCustomer: false, comment: "Unpaid invoices since June", contacts: [{ name: "Luc Garnier", email: "hello@mistralarcade.fr", roles: ["Primary"] }] },
  "406": { stripe: "cus_R8cinder406", revelatorRevenue: 1780, clientRevenue: 14830, phone: "+1 604 555 0158", address: "1200 Granville St, V6Z 1M6", country: "Canada", taxType: "CA BN", taxId: "781946320RT0001", ugcRate: 15, youtubeRate: 10, misc: 0, newCustomer: false, contacts: [{ name: "Maeve Duncan", email: "ops@cinderwell.com", roles: ["Primary", "Billing"] }] },
  "232": { stripe: "cus_P2demo232", revelatorRevenue: 120, clientRevenue: 1600, phone: "+1 212 555 0100", country: "United States of America", taxType: "US EIN", ugcRate: 7.5, youtubeRate: 12, misc: 0, newCustomer: false, comment: "Holds every demo and sandbox tenant", contacts: [{ name: "Ezra Quinn", email: "demo@revelator.example", roles: ["Primary"] }] },
  "219": { stripe: "cus_P2foxglove219", revelatorRevenue: 1215, clientRevenue: 6075, phone: "+1 512 555 0133", country: "United States of America", taxType: "US EIN", taxId: "80-5521847", ugcRate: 25, youtubeRate: 17.5, misc: 0, newCustomer: false, contacts: [{ name: "June Calloway", email: "june@foxgloveridge.example", roles: ["Primary"] }] },
};

/** The last twelve complete months, oldest first — October 2025 to September 2026. */
export const MONTHS = Array.from({ length: 12 }, (_, at) => new Date(2025, 9 + at, 1));

/**
 * How a customer's month moves around its last one — a hand-drawn shape, the same for every
 * customer, scaled to what each earned. Invented, so every customer reads a full year — except
 * one whose contract has ended, churned or terminated, which earns nothing from the month it ended.
 */
const SHAPE = [0.62, 0.66, 0.71, 0.69, 0.74, 0.8, 0.78, 0.85, 0.9, 0.88, 0.95, 1];

export const monthlyOf = (lastMonth: number, ended?: Date) =>
  MONTHS.map((month, at) => (ended && month >= ended ? 0 : Math.round(lastMonth * SHAPE[at]!)));

export const customerById = (id: string) => CUSTOMERS.find((one) => one.id === id) ?? CUSTOMERS[0]!;

/** Where a tenant's releases go: to the stores, or nowhere — a demo, or an API partner's test bench. */
export type Environment = "Production" | "Demo" | "API sandbox";
/** A parent holds client accounts of its own, its children; a standalone holds none. */
export type TenantType = "Parent" | "Standalone";

/** A child enterprise — a client account a parent tenant holds. */
export interface ChildEnterprise {
  enterpriseId: string;
  name: string;
  payeeId: string;
  created: Date;
}

/** Someone who can sign in to the tenant. */
export interface TenantUser {
  userId: string;
  name: string;
  email: string;
  /** The account the tenant was signed up with — the one its handover email goes to. */
  owner: boolean;
  /** How they reach the tenant — its team, or one of its portals. */
  access: UserAccess;
  /** The auth tenant they sign in through — none for an account made before the tenant had one. */
  tenantId?: string;
}

/** How a user reaches a tenant: as one of its team, or through a portal it gives a payee, a label or an artist. */
export type UserAccess = "Team Members" | "Payee Portal" | "Label Portal" | "Artist Portal";
export const USER_ACCESS: readonly UserAccess[] = ["Team Members", "Payee Portal", "Label Portal", "Artist Portal"];

/** Someone besides the owner, as the tenant keeps them. */
export interface TeamMember {
  name: string;
  email: string;
  access?: UserAccess;
  /** An account made before the tenant had an auth tenant, and never moved onto it. */
  legacy?: boolean;
}

/** A store a tenant can deliver to: switched on for it, and shown to its users. */
export interface TenantStore {
  name: string;
  active: boolean;
  displayed: boolean;
}

/** The record a tenant loads under: its domain, how it signs people in, and what it shows. */
export interface WhiteLabel {
  id: string;
  domain: string;
  /** The same domain again, in the field the product's second version reads. */
  domainV2?: string;
  /** Where sign-in is redirected — Revelator's own auth unless the client runs its own. */
  authBaseUrl?: string;
  title: string;
  allowSignup: boolean;
  /** Whether the client bought white label — its own domain and sign-in page, unlocked. */
  enabled?: boolean;
  allowForgotPassword?: boolean;
  /** The white label a domain no other names falls back to. */
  isDefault?: boolean;
  showRevelatorBranding?: boolean;
  showAds?: boolean;
  /** The API partner it is tied to, where it is one's. */
  partnerId?: string;
  /** The plan a user signing up through it starts on. */
  defaultPlanId?: string;
  termsUrl?: string;
  distributionAgreementUrl?: string;
  faqUrl?: string;
  helpUrl?: string;
  customLogoutUrl?: string;
  customDashboardLinkUrl?: string;
  customDashboardLinkText?: string;
  /** What the sign-in and sign-up pages say, over their forms. */
  loginHeader?: string;
  loginSubheader?: string;
  signupHeader?: string;
  signupSubheader?: string;
  enableIntercom?: boolean;
  intercomAppId?: string;
  googleAnalyticsSiteId?: string;
  /** Who is copied on every email it sends, comma-separated. */
  bccEmails?: string;
}

/** Revelator's own auth, which every white label signs in through unless the client runs its own. */
export const REVELATOR_AUTH = "https://auth.revelator.pro/";

/** A tenant — an enterprise signed up under a customer, the workspace its catalogue lives in. */
export interface Tenant {
  enterpriseId: string;
  name: string;
  /** The customer whose contract the tenant reports and pays against — none where it was never linked. */
  customerId?: string;
  type: TenantType;
  plan: string;
  environment: Environment;
  payeeId: string;
  /** The API partner an API sandbox is connected to. */
  partnerId?: string;
  onTrial: boolean;
  lockedOut: boolean;
  paymentBlocked: boolean;
  fusionAuth: boolean;
  created: Date;
  currency: string;
  /** The smallest payout a payee of the tenant is paid, in its currency. */
  minimumPayment: number;
  /** The domain its configuration names — where the tenant loads, once it has a white label. */
  domain?: string;
  /** The white label record the tenant loads under — none, and the tenant does not load. */
  whiteLabel?: WhiteLabel;
  /** Who it was signed up for, where it was signed up here; otherwise the customer's primary contact. */
  owner?: { name: string; email: string };
  /** What Revelator keeps of the tenant's revenue, in percent — the customer's, where it was not set apart. */
  rates?: { dsp: number; ugc: number; youtube: number };
  /** How many of the stores are switched on and shown. */
  storesLive: number;
  /** Each store as it was switched by hand, once one has been — replacing the count above. */
  stores?: readonly TenantStore[];
  /** Whether the login was tried as the owner, and the owner told the tenant is ready. */
  tested: boolean;
  emailed: boolean;
  /** Who besides the owner signs in. */
  team: readonly TeamMember[];
  children: readonly ChildEnterprise[];
  /** The payment providers its payees are paid through, where any is connected. */
  integrations?: readonly Integration[];
  /** How long its analytics are kept, where it was set apart from the default. */
  analytics?: Partial<TenantAnalytics>;
  /** Its entry in the supply chain's tenant configuration, where it differs from the default. */
  config?: Partial<TenantConfig>;
  /** What the team has written down about it, newest first. */
  notes?: readonly TenantNote[];
}

/** A payment provider the tenant's payees are paid through. */
export interface Integration {
  providerId: string;
  provider: string;
  connected: boolean;
}

/** How long the tenant's analytics are kept, in days, and whether it has them at all. */
export interface TenantAnalytics {
  enabled: boolean;
  trendsDays: number;
  revenueDays: number;
  v3TrendsDays: number;
}

/** The tenant's entry in the supply chain's tenant configuration — what it may do, switched. */
export interface TenantConfig {
  authTenantId: string;
  authClientId: string;
  domain?: string;
  /** Three switches the table also holds unset — null, neither on nor off. */
  marketplacePage: boolean | null;
  masterChannel: boolean | null;
  featureFm: boolean | null;
  tokenMintingWithoutValidation: boolean;
  minAudioLength: boolean;
  physicalReleases: boolean;
  withholdingTax: boolean;
  noTransactionalEmails: boolean;
  tokenNetwork?: string;
  paymentBatcher: string;
}

/** Something the team wrote down about a tenant. */
export interface TenantNote {
  id: string;
  created: Date;
  author: string;
  content: string;
}

/** A payout the tenant made, as the payor, to one of its payees. */
export interface PayorTransaction {
  id: string;
  date: Date;
  payee: string;
  payeeId: string;
  amount: number;
  currency: string;
  status: "Paid" | "Pending" | "Processing" | "Failed";
}

/** The stores a production tenant delivers to, and the two a sandbox tries a delivery on. */
const PRODUCTION_STORES = ["Spotify", "Apple Music", "Amazon Music", "YouTube Music", "TikTok", "Deezer", "TIDAL"];
const SANDBOX_STORES = ["FTP Sandbox", "AWS Sandbox"];

type Drafted = Pick<Tenant, "enterpriseId" | "name" | "plan" | "created"> & Partial<Tenant>;

/** A tenant's white label as it is first written: its domain twice, Revelator's auth, plan 3. */
const whiteLabelFor = (enterpriseId: string, name: string, patch: Partial<WhiteLabel> = {}): WhiteLabel => {
  const domain = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "")}.revelator.example`;
  return {
    id: String(Number(enterpriseId) % 900 + 100),
    domain,
    domainV2: domain,
    authBaseUrl: REVELATOR_AUTH,
    title: name,
    allowSignup: false,
    allowForgotPassword: true,
    defaultPlanId: "3",
    loginHeader: "Welcome back",
    signupHeader: "Create your account",
    ...patch,
  };
};

/** A tenant as written below: what sets it apart, the rest a live, finished standalone. */
const t = (drafted: Drafted): Tenant => ({
  type: "Standalone",
  environment: "Production",
  payeeId: String(Number(drafted.enterpriseId) + 311_000),
  onTrial: false,
  lockedOut: false,
  paymentBlocked: false,
  fusionAuth: false,
  currency: "USD",
  minimumPayment: 50,
  whiteLabel: whiteLabelFor(drafted.enterpriseId, drafted.name),
  storesLive: drafted.environment && drafted.environment !== "Production" ? 2 : 7,
  tested: true,
  emailed: true,
  team: [],
  children: [],
  ...drafted,
});

const child = (enterpriseId: string, name: string, created: Date): ChildEnterprise => ({
  enterpriseId,
  name,
  payeeId: String(Number(enterpriseId) + 311_000),
  created,
});

/** The tenants, newest first — each under its customer, a few still being set up, one never linked. */
export let TENANTS: readonly Tenant[] = [
  t({ enterpriseId: "612240", name: "Saltmarsh Tapes", plan: "2 - Starter", created: day(2026, 10, 14), onTrial: true, whiteLabel: undefined, storesLive: 0, tested: false, emailed: false }),
  t({ enterpriseId: "612034", customerId: "501", name: "Paperkite Sound", plan: "4 - Enterprise", created: day(2026, 10, 6), storesLive: 0, tested: false, emailed: false }),
  t({ enterpriseId: "611980", customerId: "232", name: "Halcyon Pilot", plan: "4 - Enterprise", environment: "Demo", created: day(2026, 10, 1), tested: false, emailed: false }),
  t({ enterpriseId: "611207", customerId: "497", name: "Ninefold Records", plan: "4 - Enterprise", created: day(2026, 9, 29), currency: "EUR", whiteLabel: undefined, storesLive: 0, tested: false, emailed: false }),
  t({ enterpriseId: "611150", customerId: "232", name: "Riverstone API Trial", plan: "4 - Enterprise", environment: "API sandbox", created: day(2026, 9, 26), storesLive: 0, tested: false, emailed: false }),
  t({ enterpriseId: "609882", customerId: "490", name: "Corvid Lane Publishing", plan: "3 - Growth", created: day(2026, 9, 15), emailed: false }),
  t({ enterpriseId: "609881", customerId: "490", name: "Corvid Lane", plan: "3 - Growth", created: day(2026, 9, 8), whiteLabel: whiteLabelFor("609881", "Corvid Lane", { enableIntercom: true, intercomAppId: "cv7k2lq9", showRevelatorBranding: true, customDashboardLinkUrl: "https://corvidlane.example/artists", customDashboardLinkText: "Artist portal", customLogoutUrl: "https://corvidlane.example" }), fusionAuth: true, team: [{ name: "Rui Tanaka", email: "rui@corvidlane.com" }], integrations: [{ providerId: "PP-77310428", provider: "PayPal", connected: true }], notes: [{ id: "n-3", created: day(2026, 9, 22), author: "Ines Calder", content: "Asked for a second admin for their publishing arm. Pointed them to Corvid Lane Publishing instead." }] }),
  t({ enterpriseId: "608540", customerId: "483", name: "Silverbirch Publishing House", plan: "3 - Growth", created: day(2026, 8, 25), currency: "GBP" }),
  t({ enterpriseId: "606404", customerId: "469", name: "Opaline Sandbox", plan: "4 - Enterprise", environment: "API sandbox", partnerId: "231", created: day(2026, 8, 3), currency: "EUR" }),
  t({ enterpriseId: "606403", customerId: "469", name: "Opaline Classics", plan: "3 - Growth", created: day(2026, 7, 20), currency: "EUR" }),
  t({ enterpriseId: "607113", customerId: "476", name: "Marlow Tide Entertainment", plan: "2 - Starter", created: day(2026, 7, 12), paymentBlocked: true }),
  t({ enterpriseId: "606402", customerId: "469", name: "Opaline", plan: "4 - Enterprise", type: "Parent", created: day(2026, 7, 2), currency: "EUR", whiteLabel: whiteLabelFor("606402", "Opaline", { domain: "app.opaline.example", domainV2: "app.opaline.example", authBaseUrl: "https://auth.opaline.example/", title: "Opaline | Distribution musicale", enabled: true, defaultPlanId: "7", loginHeader: "Bienvenue", loginSubheader: "Connectez-vous pour gérer vos sorties, votre catalogue et vos résultats.", signupHeader: "Inscrivez-vous pour distribuer votre musique et suivre son évolution.", signupSubheader: "Créez votre compte Opaline", faqUrl: "https://opaline.example/faq", helpUrl: "https://opaline.example/aide", distributionAgreementUrl: "https://opaline.example/contrat", googleAnalyticsSiteId: "G-OP4L1N3X", bccEmails: "ops@opaline.example" }), fusionAuth: true, team: [{ name: "Théo Martin", email: "dev@opaline.audio" }, { name: "Lucie Garnier", email: "lucie@maisonbrune.example", access: "Label Portal" }, { name: "Malo Fournier", email: "malo.fournier@opalinejeunesse.example", access: "Payee Portal", legacy: true }], integrations: [{ providerId: "TIP-0042719", provider: "Tipalti", connected: true }], analytics: { revenueDays: 1095 }, config: { marketplacePage: true, withholdingTax: true, paymentBatcher: "Tipalti" }, notes: [{ id: "n-1", created: day(2026, 8, 18), author: "Ines Calder", content: "Client accounts import in batches of 50: the template times out above that." }, { id: "n-2", created: day(2026, 7, 9), author: "Dario Mendel", content: "Revenue history kept for three years, per their contract. Do not shorten it." }], children: [child("606510", "Opaline Jeunesse", day(2026, 7, 30)), child("606511", "Maison Brune", day(2026, 8, 14))] }),
  t({ enterpriseId: "604380", customerId: "455", name: "Eastgate Test", plan: "4 - Enterprise", environment: "Demo", created: day(2026, 6, 10), currency: "EUR" }),
  t({ enterpriseId: "604379", customerId: "455", name: "Eastgate Kids", plan: "3 - Growth", created: day(2026, 6, 9), currency: "EUR" }),
  t({ enterpriseId: "605118", customerId: "462", name: "Brackenridge Audio", plan: "2 - Starter", created: day(2026, 5, 22), lockedOut: true, paymentBlocked: true, analytics: { enabled: false }, config: { noTransactionalEmails: true }, notes: [{ id: "n-5", created: day(2026, 9, 30), author: "Ines Calder", content: "Locked out and payment blocked over the unpaid June invoice. Unlock only once Finance confirms." }] }),
  t({ enterpriseId: "604378", customerId: "455", name: "Eastgate Classics", plan: "3 - Growth", created: day(2026, 5, 18), currency: "EUR" }),
  t({ enterpriseId: "604377", customerId: "455", name: "Eastgate Music", plan: "4 - Enterprise", type: "Parent", created: day(2026, 5, 4), currency: "EUR", fusionAuth: true, integrations: [{ providerId: "PP-61200937", provider: "PayPal", connected: true }, { providerId: "acct_1Q8eastgate", provider: "Stripe", connected: false }], config: { masterChannel: true, featureFm: true, physicalReleases: true }, children: [child("604601", "Nordhafen Beats", day(2026, 5, 28)), child("604602", "Elbe Strings", day(2026, 6, 20)), child("604603", "Kiezklang", day(2026, 8, 2))] }),
  t({ enterpriseId: "603011", customerId: "448", name: "Thistle & Thorn", plan: "3 - Growth", created: day(2026, 3, 19), currency: "EUR" }),
  t({ enterpriseId: "602290", customerId: "441", name: "Grainfield Collective", plan: "2 - Starter", created: day(2026, 2, 27), onTrial: true, storesLive: 3, emailed: false }),
  t({ enterpriseId: "598220", customerId: "427", name: "Bluefen API Sandbox", plan: "4 - Enterprise", environment: "API sandbox", partnerId: "198", created: day(2026, 2, 4), currency: "SEK" }),
  t({ enterpriseId: "598219", customerId: "427", name: "Bluefen Archive", plan: "3 - Growth", created: day(2026, 2, 3), currency: "SEK" }),
  t({ enterpriseId: "598218", customerId: "427", name: "Bluefen Jazz", plan: "3 - Growth", created: day(2026, 1, 12), currency: "SEK" }),
  t({ enterpriseId: "598217", customerId: "427", name: "Bluefen Baltic", plan: "3 - Growth", created: day(2025, 11, 30), currency: "EUR" }),
  t({ enterpriseId: "598216", customerId: "427", name: "Bluefen Nordic", plan: "4 - Enterprise", created: day(2025, 11, 2), currency: "SEK" }),
  t({ enterpriseId: "598215", customerId: "427", name: "Bluefen Distribution", plan: "4 - Enterprise", type: "Parent", created: day(2025, 10, 14), currency: "SEK", fusionAuth: true, integrations: [{ providerId: "TIP-0038816", provider: "Tipalti", connected: true }], config: { tokenNetwork: "Base", tokenMintingWithoutValidation: true }, notes: [{ id: "n-4", created: day(2026, 4, 2), author: "Dario Mendel", content: "Payouts to Gotland Folk held in March while the payee re-verified its bank. Released 1 April." }], team: [{ name: "Nils Ek", email: "nils@bluefen.dist" }, { name: "Saga Lind", email: "api@bluefen.dist" }, { name: "Astrid Holm", email: "astrid.holm@gotlandfolk.example", access: "Artist Portal" }, { name: "Oskar Vik", email: "oskar@fjallsound.example", access: "Payee Portal" }], children: [child("598301", "Fjällsound", day(2025, 12, 1)), child("598302", "Gotland Folk", day(2026, 3, 9))] }),
  t({ enterpriseId: "600874", customerId: "434", name: "Kestrel Point Recordings", plan: "3 - Growth", created: day(2025, 12, 10), lockedOut: true }),
  t({ enterpriseId: "595661", customerId: "420", name: "Harrow Street Live", plan: "3 - Growth", created: day(2025, 9, 1), currency: "GBP" }),
  t({ enterpriseId: "595660", customerId: "420", name: "Harrow Street Sound", plan: "4 - Enterprise", created: day(2025, 7, 9), currency: "GBP" }),
  t({ enterpriseId: "593007", customerId: "413", name: "Mistral Arcade", plan: "2 - Starter", created: day(2025, 3, 25), currency: "EUR", lockedOut: true, paymentBlocked: true }),
  t({ enterpriseId: "590114", customerId: "406", name: "Cinderwell Films", plan: "3 - Growth", created: day(2025, 2, 17), currency: "CAD" }),
  t({ enterpriseId: "590113", customerId: "406", name: "Cinderwell Music", plan: "3 - Growth", created: day(2024, 12, 2), currency: "CAD" }),
  t({ enterpriseId: "571902", customerId: "219", name: "Foxglove Ridge Records", plan: "3 - Growth", created: day(2023, 9, 11) }),
];

export const tenantById = (id: string) => TENANTS.find((one) => one.enterpriseId === id) ?? TENANTS[0]!;

/** The tenants signed up under one customer. */
export const tenantsOf = (customerId: string) => TENANTS.filter((one) => one.customerId === customerId);

/** Demo and API sandboxes deliver nowhere: everything they release stays out of the stores. */
export const isSandbox = (one: Tenant) => one.environment !== "Production";

/** The customer a tenant reports against, where it was linked to one. */
export const customerOf = (one: Tenant) => (one.customerId ? customerById(one.customerId) : undefined);

/**
 * Who signs in to the tenant: its owner first — the customer's primary contact, the one the
 * handover goes to — then its team. A tenant no customer was linked to has an owner of its own.
 */
export function usersOf(one: Tenant): readonly TenantUser[] {
  const contact = one.customerId ? RECORDS[one.customerId]!.contacts.find((c) => c.roles.includes("Primary")) : undefined;
  const owner = one.owner ?? contact ?? { name: "Wren Okafor", email: "wren@saltmarshtapes.example" };
  const tenantId = configDefaultsOf(one).authTenantId;
  return [{ name: owner.name, email: owner.email } as TeamMember, ...one.team].map(({ legacy, access, ...user }, at) => ({
    ...user,
    access: access ?? "Team Members",
    tenantId: legacy ? undefined : tenantId,
    // A name changed on the user is theirs wherever they sign in.
    name: USER_EDITS[user.email]?.name ?? user.name,
    // ONE id for one address, the same on every tenant they sign in to.
    userId: userIdOf(user.email),
    owner: at === 0,
  }));
}

/** The stores the tenant can deliver to — the real ones, or a sandbox's two — the first few switched on. */
export const storesOf = (one: Tenant): readonly TenantStore[] =>
  one.stores ??
  (isSandbox(one) ? SANDBOX_STORES : PRODUCTION_STORES).map((name, at) => ({
    name,
    active: at < one.storesLive,
    displayed: at < one.storesLive,
  }));

/** How many of a tenant's stores are on and shown — the ones it can deliver to. */
export const liveStoresOf = (one: Tenant) => storesOf(one).filter((store) => store.active && store.displayed).length;

/** A payee of the tenant: its own, and one for each client account a parent holds. */
export interface TenantPayee {
  payeeId: string;
  name: string;
  enterpriseId: string;
}

export const payeesOf = (one: Tenant): readonly TenantPayee[] => [
  { payeeId: one.payeeId, name: one.name, enterpriseId: one.enterpriseId },
  ...one.children.map((each) => ({ payeeId: each.payeeId, name: each.name, enterpriseId: each.enterpriseId })),
];

/** A seed's hex, the same every time — what an invented auth ID is made of. */
const hexOf = (seed: string, length: number) => {
  let hash = 2166136261;
  let out = "";
  while (out.length < length) {
    for (const char of seed + out.length) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619) >>> 0;
    out += hash.toString(16).padStart(8, "0");
  }
  return out.slice(0, length);
};
const uuidOf = (seed: string) => {
  const hex = hexOf(seed, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20)}`;
};

/** The payment providers a tenant is connected to. */
export const integrationsOf = (one: Tenant): readonly Integration[] => one.integrations ?? [];

/** How long a tenant's analytics are kept — the defaults, where it was not set apart. */
export const analyticsOf = (one: Tenant): TenantAnalytics => ({
  enabled: true,
  trendsDays: 90,
  revenueDays: 730,
  v3TrendsDays: 365,
  ...one.analytics,
});

/**
 * A tenant's entry in the supply chain's tenant configuration — none until a customer is linked,
 * which is what writes it.
 */
export const configOf = (one: Tenant): TenantConfig | undefined => (one.customerId ? configDefaultsOf(one) : undefined);

/** What a tenant's entry holds, or would hold once written — the defaults, then what was set. */
export const configDefaultsOf = (one: Tenant): TenantConfig => ({
  authTenantId: uuidOf(`auth-${one.enterpriseId}`),
  authClientId: uuidOf(`client-${one.enterpriseId}`),
  domain: one.domain ?? one.whiteLabel?.domain,
  marketplacePage: null,
  masterChannel: null,
  featureFm: null,
  tokenMintingWithoutValidation: false,
  minAudioLength: true,
  physicalReleases: false,
  withholdingTax: false,
  noTransactionalEmails: false,
  paymentBatcher: "Standard",
  ...one.config,
});

/** What the team wrote about a tenant, newest first. */
export const notesOf = (one: Tenant): readonly TenantNote[] =>
  [...(one.notes ?? [])].sort((a, b) => b.created.getTime() - a.created.getTime());

/**
 * What a tenant paid out as the payor — a monthly payout to each of its payees, over the months it
 * has delivered. A tenant not yet delivering, or a sandbox, has paid nothing.
 */
export const transactionsOf = (one: Tenant): readonly PayorTransaction[] => {
  if (isSandbox(one) || liveStoresOf(one) === 0) return [];
  const months = Math.min(4, Math.max(0, (TODAY.getFullYear() - one.created.getFullYear()) * 12 + TODAY.getMonth() - one.created.getMonth()));
  const since = (enterpriseId: string) => one.children.find((each) => each.enterpriseId === enterpriseId)?.created ?? one.created;
  return payeesOf(one).flatMap((payee, at) =>
    Array.from({ length: months }, (_, back) => {
      const seed = parseInt(hexOf(`${payee.payeeId}-${back}`, 6), 16);
      const date = new Date(TODAY.getFullYear(), TODAY.getMonth() - back, 5);
      const status: PayorTransaction["status"] =
        back === 0 ? (one.paymentBlocked ? "Pending" : "Processing") : seed % 23 === 0 ? "Failed" : "Paid";
      return {
        id: String(8_400_000 + Number(payee.payeeId.slice(-4)) * 10 + back + at),
        date,
        payee: payee.name,
        payeeId: payee.payeeId,
        amount: Math.round((seed % 480_000) + 1_500) / 100,
        currency: one.currency,
        status,
        since: since(payee.enterpriseId),
      };
    }).filter((paid) => paid.date >= paid.since).map(({ since: _, ...paid }) => paid),
  );
};

/** One step of getting a tenant live — done or still owed, and the command that does it. */
export interface SetupStep {
  key: "customer" | "white-label" | "stores" | "partner" | "login" | "handover";
  title: string;
  /** What the step comes to on this tenant — what is linked, or why it is owed. */
  detail: string;
  done: boolean;
  /** Owed only on some tenants, and never what keeps one from loading. */
  optional?: boolean;
}

/**
 * What stands between a signed-up tenant and its handover, in the order it is done. Signing up is
 * only the first step: the tenant loads once it has a white label, delivers once its stores are on,
 * and is the customer's once its owner has been told. An API sandbox owes its partner too.
 */
export function setupOf(one: Tenant): readonly SetupStep[] {
  const customer = customerOf(one);
  const linked = customer?.subscriptions[0];
  const sandbox = isSandbox(one);
  const steps: (SetupStep | null)[] = [
    {
      key: "customer",
      title: "Customer and subscription",
      detail: customer
        ? formatMeta([customer.name, linked ? linked.id : "no subscription yet"])!
        : "No customer linked: royalty runs and reports need the tenant tied to its contract.",
      done: Boolean(linked),
    },
    {
      key: "white-label",
      title: "White label",
      detail: one.whiteLabel
        ? formatMeta([`White label ${one.whiteLabel.id}`, one.whiteLabel.domain])!
        : "Every tenant needs one, white label client or not: without it the tenant does not load.",
      done: Boolean(one.whiteLabel),
    },
    {
      key: "stores",
      title: "DSPs",
      detail: sandbox
        ? liveStoresOf(one)
          ? "The two sandbox DSPs are on, so a test delivery can be tried. Nothing reaches a real DSP."
          : "Turn on the two sandbox DSPs to let the owner try a test delivery."
        : liveStoresOf(one)
          ? `${liveStoresOf(one)} of ${PRODUCTION_STORES.length} DSPs on and shown`
          : "Every DSP starts off, so the tenant cannot deliver yet.",
      done: liveStoresOf(one) > 0,
      optional: sandbox,
    },
    one.environment === "API sandbox"
      ? {
          key: "partner",
          title: "API partner",
          detail: one.partnerId
            ? `Partner ${one.partnerId}, its API key issued`
            : "Connect an API partner to turn the tenant into an API sandbox; its key is issued with it.",
          done: Boolean(one.partnerId),
        }
      : null,
    {
      key: "login",
      title: "Test the login",
      detail: one.whiteLabel
        ? `Open ${one.whiteLabel.domain} as the owner and check the tenant loads.`
        : "Can be tried once the tenant has a white label.",
      done: one.tested,
    },
    {
      key: "handover",
      title: "Email the owner",
      detail: "Nothing is sent on sign-up: tell the owner to reset their password from the tenant's domain.",
      done: one.emailed,
    },
  ];
  return steps.filter((step): step is SetupStep => step !== null);
}

/** How far the tenant's setup has come — the steps done, out of its steps. */
export function progressOf(one: Tenant) {
  const steps = setupOf(one);
  return { done: steps.filter((step) => step.done).length, of: steps.length };
}

/*
 * WHAT THE FORMS WRITE. RCC has no back end: a form adds to the fixtures above, which keep what it
 * added until the page reloads. Every write swaps the set it changed for a new one and tells the app,
 * which draws again from the sets as they now are.
 */

let version = 0;
const listeners = new Set<() => void>();

const changed = () => {
  version += 1;
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

/** Draws the caller again whenever a form has written to the fixtures. */
export const useFixtures = () => useSyncExternalStore(subscribe, () => version);

/** The next number after the highest one a set holds — ids are issued in order. */
const after = (ids: readonly string[], step: number) => String(Math.max(...ids.map(Number)) + step);

/** A customer, with its record, added in front of the set — the newest first. */
export function addCustomer(customer: Omit<Customer, "id" | "created">, record: CustomerRecord): string {
  const id = after(CUSTOMERS.map((one) => one.id), 3);
  CUSTOMERS = [{ ...customer, id, created: TODAY }, ...CUSTOMERS];
  RECORDS = { ...RECORDS, [id]: record };
  changed();
  return id;
}

/** A customer and its record, changed where the patches say. */
export function updateCustomer(id: string, customer: Partial<Customer>, record: Partial<CustomerRecord> = {}) {
  CUSTOMERS = CUSTOMERS.map((one) => (one.id === id ? { ...one, ...customer } : one));
  RECORDS = { ...RECORDS, [id]: { ...RECORDS[id]!, ...record } };
  changed();
}

/** A subscription linked to a customer — and a customer still onboarding stays so until a tenant is live. */
export function addSubscription(customerId: string, subscription: Subscription) {
  CUSTOMERS = CUSTOMERS.map((one) =>
    one.id === customerId ? { ...one, subscriptions: [...one.subscriptions, subscription] } : one,
  );
  changed();
}

/** Someone at the customer added to whom Revelator writes. */
export function addContact(customerId: string, contact: Contact) {
  const record = RECORDS[customerId]!;
  RECORDS = { ...RECORDS, [customerId]: { ...record, contacts: [...record.contacts, contact] } };
  changed();
}

/** The enterprise id the next tenant signed up is issued. */
export const nextEnterpriseId = () =>
  after([...TENANTS.map((one) => one.enterpriseId), ...TENANTS.flatMap((one) => one.children.map((each) => each.enterpriseId))], 7);

/** A tenant signed up — its enterprise, its payee and its owner — in front of the set. */
export function addTenant(tenant: Tenant): string {
  TENANTS = [tenant, ...TENANTS];
  changed();
  return tenant.enterpriseId;
}

/** A tenant changed where the patch says. */
export function updateTenant(id: string, patch: Partial<Tenant>) {
  TENANTS = TENANTS.map((one) => (one.enterpriseId === id ? { ...one, ...patch } : one));
  changed();
}

/** A tenant's stores switched, the ones named taking the patch. */
export function switchStores(id: string, names: readonly string[], patch: Partial<TenantStore>) {
  const tenant = tenantById(id);
  updateTenant(id, { stores: storesOf(tenant).map((store) => (names.includes(store.name) ? { ...store, ...patch } : store)) });
}

/** A payment provider connected to a tenant, or a connection switched. */
export function saveIntegration(id: string, integration: Integration) {
  const tenant = tenantById(id);
  const kept = integrationsOf(tenant).filter((one) => one.providerId !== integration.providerId);
  updateTenant(id, { integrations: [...kept, integration] });
}

/** Who is signed in to RCC — the author of what is written here. */
export const OPERATOR = "Ines Calder";

/** A note written about a tenant, as today's, by whoever is signed in. */
export function addNote(id: string, content: string, author = OPERATOR) {
  const tenant = tenantById(id);
  const note = { id: `n-${Date.now()}`, created: TODAY, author, content };
  updateTenant(id, { notes: [note, ...(tenant.notes ?? [])] });
}

/** A note taken away. */
export function deleteNote(id: string, noteId: string) {
  const tenant = tenantById(id);
  updateTenant(id, { notes: (tenant.notes ?? []).filter((one) => one.id !== noteId) });
}

/** The template a tenant is signed up from — every answer the form does not ask for, settled. */
export const signedUp = (drafted: Drafted) => t({ whiteLabel: undefined, storesLive: 0, tested: false, emailed: false, ...drafted });

/*
 * THE REST OF ACCOUNTS — the enterprises, partners, payees, users and white labels. Most are READ
 * OFF the tenants above, as the product reads them off its enterprises: a tenant is an enterprise,
 * each child it holds is one more, each has its payee, and the people who sign in to them are its
 * users. What is kept apart is what no tenant holds — the API partners, and the white labels that
 * belong to Revelator itself — and what a form changed on a payee or a user.
 */

/** Any enterprise: a tenant — a parent or a standalone — or a client account a parent holds. */
export interface Enterprise {
  enterpriseId: string;
  name: string;
  type: TenantType | "Child";
  payeeId: string;
  plan: string;
  /** The tenant itself, where the enterprise is one. */
  tenant?: Tenant;
  /** The parent a child enterprise belongs to. */
  parent?: Tenant;
  partnerId?: string;
  onTrial: boolean;
  lockedOut: boolean;
  paymentBlocked: boolean;
  created: Date;
}

/** Every enterprise — each tenant, then the client accounts of each parent — newest first. */
export function enterprises(): readonly Enterprise[] {
  const all: Enterprise[] = [];
  for (const tenant of TENANTS) {
    all.push({
      enterpriseId: tenant.enterpriseId,
      name: tenant.name,
      type: tenant.type,
      payeeId: tenant.payeeId,
      plan: tenant.plan,
      tenant,
      partnerId: tenant.partnerId,
      onTrial: tenant.onTrial,
      lockedOut: tenant.lockedOut,
      paymentBlocked: tenant.paymentBlocked,
      created: tenant.created,
    });
    for (const each of tenant.children)
      all.push({
        enterpriseId: each.enterpriseId,
        name: each.name,
        type: "Child",
        payeeId: each.payeeId,
        // A client account is on its parent's plan, and held back where its parent is.
        plan: tenant.plan,
        parent: tenant,
        onTrial: tenant.onTrial,
        lockedOut: tenant.lockedOut,
        paymentBlocked: tenant.paymentBlocked,
        created: each.created,
      });
  }
  return all.sort((a, b) => b.created.getTime() - a.created.getTime());
}

export const enterpriseById = (id: string) => enterprises().find((one) => one.enterpriseId === id);

/** A child enterprise renamed — the one change RCC makes to a client account. */
export function renameChild(id: string, name: string) {
  const parent = TENANTS.find((one) => one.children.some((each) => each.enterpriseId === id));
  if (!parent) return;
  updateTenant(parent.enterpriseId, {
    children: parent.children.map((each) => (each.enterpriseId === id ? { ...each, name } : each)),
  });
}

/* ---------- Partners ---------- */

/** An API partner — a company building on Revelator's API, its sandboxes and its users connected to it. */
export interface Partner {
  id: string;
  name: string;
  /** The smallest payout the partner's payees are paid, in dollars. */
  minimumPayment: number;
  /** Every account created through the partner starts on trial. */
  allOnTrial: boolean;
  created: Date;
}

export let PARTNERS: readonly Partner[] = [
  { id: "246", name: "Larchmont Apps", minimumPayment: 0, allOnTrial: true, created: day(2026, 9, 27) },
  { id: "231", name: "Opaline Developer Sandbox", minimumPayment: 0, allOnTrial: false, created: day(2026, 8, 3) },
  { id: "214", name: "Glasswing Sync", minimumPayment: 15, allOnTrial: false, created: day(2026, 4, 22) },
  { id: "198", name: "Bluefen Labs", minimumPayment: 0, allOnTrial: false, created: day(2026, 2, 4) },
  { id: "174", name: "Northbeam Analytics", minimumPayment: 100, allOnTrial: false, created: day(2025, 9, 12) },
  { id: "156", name: "Cartwheel Media", minimumPayment: 50, allOnTrial: true, created: day(2025, 5, 30) },
  { id: "112", name: "Hollowpine Distribution API", minimumPayment: 25, allOnTrial: false, created: day(2024, 11, 8) },
];

export const partnerById = (id: string) => PARTNERS.find((one) => one.id === id);

/** The tenants connected to a partner — its sandboxes. */
export const tenantsOfPartner = (id: string) => TENANTS.filter((one) => one.partnerId === id);

/** A partner created, in front of the set; its id issued after the highest. */
export function addPartner(partner: Omit<Partner, "id" | "created">): string {
  const id = after(PARTNERS.map((one) => one.id), 1);
  PARTNERS = [{ ...partner, id, created: TODAY }, ...PARTNERS];
  changed();
  return id;
}

export function updatePartner(id: string, patch: Partial<Partner>) {
  PARTNERS = PARTNERS.map((one) => (one.id === id ? { ...one, ...patch } : one));
  changed();
}

/* ---------- Payees ---------- */

/** Where a payee stands, as the system's own family says it. */
export type PayeeStatus = "Not Invited" | "Invited" | "Active" | "Payout Blocked" | "Account Locked";

/** Someone an enterprise pays — the enterprise's own payee, which its statements and payouts go to. */
export interface Payee {
  payeeId: string;
  name: string;
  enterprise: Enterprise;
  /** The payee that pays it — a client account's is its parent's; a tenant's, its own. */
  payorId: string;
  status: PayeeStatus;
  contact?: string;
  email?: string;
  currency: string;
  minimumPayment: number;
  taxCountry?: string;
  /** Whether the payee may change its own payment settings. */
  settingsAllowed: boolean;
  autoSendStatements: boolean;
  /** The contact record its statements are addressed to. */
  contactId: string;
  /** The company it is paid as, and whether it is paid as one. */
  companyName?: string;
  isCompany: boolean;
  role?: string;
  /** The provider it is paid through, as the provider is numbered here, and its account there. */
  paymentProvider?: { id: string; name: string };
  paymentUserId?: string;
  onTrial: boolean;
  lockedOut: boolean;
  paymentBlocked: boolean;
  /** Every payee that pays it — a client account's parent, or itself. */
  payorIds: readonly string[];
  lastUpdated: Date;
  lastStatementSent?: Date;
}

/** The payment providers, as the product numbers them. */
const PROVIDER_IDS: Readonly<Record<string, string>> = { PayPal: "1", Tipalti: "3", Stripe: "4" };

/** What a form changed on a payee, by its id. */
let PAYEE_EDITS: Readonly<Record<string, Partial<Pick<Payee, "taxCountry" | "settingsAllowed">>>> = {};

/** A client account's payee is asked to set up payment once its parent has gone live. */
const childStatus = (at: number): PayeeStatus => (at % 3 === 2 ? "Not Invited" : at % 3 === 1 ? "Invited" : "Active");

/** Every payee, read off the enterprises — a tenant's own, then each client account's. */
export function payees(): readonly Payee[] {
  return enterprises().map((enterprise, at) => {
    const tenant = enterprise.tenant ?? enterprise.parent!;
    const owner = usersOf(tenant)[0]!;
    const own = enterprise.tenant !== undefined;
    const record = tenant.customerId ? RECORDS[tenant.customerId] : undefined;
    const provider = integrationsOf(tenant).find((one) => one.connected);
    const status: PayeeStatus = enterprise.lockedOut
      ? "Account Locked"
      : enterprise.paymentBlocked
        ? "Payout Blocked"
        : own
          ? "Active"
          : childStatus(at);
    return {
      payeeId: enterprise.payeeId,
      name: enterprise.name,
      enterprise,
      payorId: tenant.payeeId,
      status,
      // A client account's contact is the label itself, at the address its parent gave it.
      contact: own ? owner.name : enterprise.name,
      email: own ? owner.email : `royalties@${enterprise.name.toLowerCase().replace(/[^a-z0-9]+/g, "")}.example`,
      currency: tenant.currency,
      minimumPayment: tenant.minimumPayment,
      taxCountry: own ? record?.country : undefined,
      settingsAllowed: own,
      autoSendStatements: own,
      contactId: String(3_600_000 + Number(enterprise.payeeId) % 400_000),
      companyName: enterprise.name,
      isCompany: own && tenant.type !== "Standalone",
      role: own ? "Label" : undefined,
      paymentProvider: provider ? { id: PROVIDER_IDS[provider.provider] ?? "0", name: provider.provider } : undefined,
      paymentUserId: provider ? `${provider.providerId}-${enterprise.payeeId}` : undefined,
      onTrial: enterprise.onTrial,
      lockedOut: enterprise.lockedOut,
      paymentBlocked: enterprise.paymentBlocked,
      payorIds: [tenant.payeeId],
      // Touched when it was made, and again each month it was paid.
      lastUpdated: new Date(Math.max(enterprise.created.getTime(), TODAY.getTime() - ((Number(enterprise.payeeId) % 40) + 1) * 86_400_000)),
      lastStatementSent: own && liveStoresOf(tenant) > 0 ? new Date(TODAY.getFullYear(), TODAY.getMonth(), 5) : undefined,
      ...PAYEE_EDITS[enterprise.payeeId],
    };
  });
}

export const payeeById = (id: string) => payees().find((one) => one.payeeId === id);

export function updatePayee(id: string, patch: Partial<Pick<Payee, "taxCountry" | "settingsAllowed">>) {
  PAYEE_EDITS = { ...PAYEE_EDITS, [id]: { ...PAYEE_EDITS[id], ...patch } };
  changed();
}

/* ---------- Users ---------- */

/** Where someone has access, and as whom. */
export interface Membership {
  tenant: Tenant;
  owner: boolean;
}

/** Someone who signs in — to every tenant that gave them access, under one account. */
export interface Account {
  userId: string;
  email: string;
  name: string;
  memberships: readonly Membership[];
  partnerId?: string;
  /** The id an API partner knows the user by — what makes the partner's API key work for them. */
  partnerUserId?: string;
  lastLogin?: Date;
  created: Date;
}

type AccountEdit = Partial<Pick<Account, "name" | "partnerId" | "partnerUserId">>;

/** What a form changed on a user, by email — and the partner users the fixtures begin with. */
let USER_EDITS: Readonly<Record<string, AccountEdit>> = {
  "api@bluefen.dist": { partnerId: "198", partnerUserId: "5e1c0a7d-2b9f-41c3" },
  "dev@opaline.audio": { partnerId: "231" },
};

/** A user id, as the product issues one, kept the same for the same address. */
const userIdOf = (email: string) => {
  const hashOf = (seed: number) => {
    let hash = seed;
    for (const char of email) hash = (Math.imul(hash, 31) + char.charCodeAt(0)) >>> 0;
    return hash.toString(16).padStart(8, "0");
  };
  const [a, b, c] = [hashOf(7), hashOf(131), hashOf(977)];
  return `${a}-${b.slice(0, 4)}-4${b.slice(5, 8)}-a${c.slice(0, 3)}-${c.slice(3, 8)}${a.slice(0, 7)}`;
};

/** Every user, read off the tenants that gave them access — one account for one address. */
export function accounts(): readonly Account[] {
  const byEmail = new Map<string, Account>();
  for (const tenant of TENANTS)
    for (const user of usersOf(tenant)) {
      const known = byEmail.get(user.email);
      const membership = { tenant, owner: user.owner };
      if (known) {
        byEmail.set(user.email, {
          ...known,
          memberships: [...known.memberships, membership],
          created: tenant.created < known.created ? tenant.created : known.created,
        });
        continue;
      }
      const seed = userIdOf(user.email);
      byEmail.set(user.email, {
        userId: seed,
        email: user.email,
        name: user.name,
        memberships: [membership],
        created: tenant.created,
        // A user who has signed in, a few days back by what their address keys; one whose tenant
        // was never handed over has not yet.
        lastLogin: tenant.emailed ? new Date(TODAY.getTime() - (parseInt(seed.slice(0, 2), 16) % 20) * 86_400_000) : undefined,
      });
    }
  return [...byEmail.values()].map((one) => ({ ...one, ...USER_EDITS[one.email] }));
}

export const accountById = (id: string) => accounts().find((one) => one.userId === id);

export function updateAccount(email: string, patch: AccountEdit) {
  USER_EDITS = { ...USER_EDITS, [email]: { ...USER_EDITS[email], ...patch } };
  changed();
}

/* ---------- White labels ---------- */

/** A white label, wherever it is kept — on its tenant, or Revelator's own. */
export interface WhiteLabelRecord extends WhiteLabel {
  /** The tenant it loads, where it loads one. */
  tenant?: Tenant;
  partnerId?: string;
}

/** The white labels no tenant holds: Revelator's own product, and the hosts it is tried on. */
let LOOSE_WHITE_LABELS: readonly WhiteLabelRecord[] = [
  { id: "1", domain: "app.revelator.example", domainV2: "app.revelator.example", authBaseUrl: REVELATOR_AUTH, title: "Revelator", allowSignup: true, enabled: false, allowForgotPassword: true, isDefault: true, showRevelatorBranding: true, showAds: true, defaultPlanId: "3", enableIntercom: true, intercomAppId: "rv0pro1x", loginHeader: "Welcome back", signupHeader: "Create your account" },
  { id: "5", domain: "staging.revelator.example", title: "Revelator Staging", allowSignup: true, enabled: false, allowForgotPassword: true, showRevelatorBranding: true },
  { id: "30", domain: "localhost", title: "Local", allowSignup: true, enabled: false, allowForgotPassword: true },
  { id: "88", domain: "glasswing.revelator.example", domainV2: "glasswing.revelator.example", authBaseUrl: REVELATOR_AUTH, title: "Glasswing", allowSignup: false, enabled: true, allowForgotPassword: true, partnerId: "214", defaultPlanId: "3" },
];

/** Every white label, by id. */
export function whiteLabels(): readonly WhiteLabelRecord[] {
  const held = TENANTS.filter((one) => one.whiteLabel).map((tenant) => ({
    ...tenant.whiteLabel!,
    tenant,
    partnerId: tenant.whiteLabel!.partnerId ?? tenant.partnerId,
  }));
  return [...held, ...LOOSE_WHITE_LABELS].sort((a, b) => Number(a.id) - Number(b.id));
}

export const whiteLabelById = (id: string) => whiteLabels().find((one) => one.id === id);

/** The next white label id — issued in order across every one there is. */
export const nextWhiteLabelId = () => String(Math.max(...whiteLabels().map((one) => Number(one.id))) + 1);

/** A white label saved where it is kept: on the tenant it now loads, or among Revelator's own. */
export function saveWhiteLabel(label: WhiteLabel, tenantId?: string) {
  LOOSE_WHITE_LABELS = LOOSE_WHITE_LABELS.filter((one) => one.id !== label.id);
  TENANTS = TENANTS.map((one) =>
    one.whiteLabel?.id === label.id && one.enterpriseId !== tenantId ? { ...one, whiteLabel: undefined } : one,
  );
  if (tenantId) updateTenant(tenantId, { whiteLabel: label });
  else {
    LOOSE_WHITE_LABELS = [...LOOSE_WHITE_LABELS, label];
    changed();
  }
}

/** A white label deleted — its tenant, if it had one, no longer loads. */
export function deleteWhiteLabel(id: string) {
  LOOSE_WHITE_LABELS = LOOSE_WHITE_LABELS.filter((one) => one.id !== id);
  TENANTS = TENANTS.map((one) => (one.whiteLabel?.id === id ? { ...one, whiteLabel: undefined } : one));
  changed();
}
