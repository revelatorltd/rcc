import { formatMeta } from "@revelator/pro-ui";
import { useSyncExternalStore } from "react";
import type { OrganizationSlug } from "@revelator/pro-ui/assets";

/**
 * The accounts RCC holds — invented, hand-written, never copied from the prototype or the product.
 * Stored newest first, so an index that opens on its entry date reads them as they were written.
 */
export const TODAY = new Date(2026, 9, 16);

const day = (year: number, month: number, date: number) => new Date(year, month - 1, date);


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
  /** What was set on the client account itself — otherwise its parent's. */
  onTrial?: boolean;
  lockedOut?: boolean;
  paymentBlocked?: boolean;
  partnerId?: string;
  currency?: string;
  minimumPayment?: number;
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
  /** The client account they reach it through, where a portal of one lets them in. */
  enterpriseId?: string;
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
  /** The client account they reach it through, where a portal of one lets them in. */
  enterpriseId?: string;
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
  /** The stylesheet it was created with — set once, when it is made. */
  cssFile?: string;
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

/** A tenant — an enterprise signed up in RCC, the workspace its catalogue lives in. */
export interface Tenant {
  enterpriseId: string;
  name: string;
  /** The organization whose logo it wears, where the system ships one; otherwise one invented from its name. */
  organization?: OrganizationSlug;
  /** The country its own payee is taxed in. */
  taxCountry?: string;
  type: TenantType;
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
  /** Who it was signed up for — the account its handover goes to. */
  owner: { name: string; email: string };
  /** What Revelator keeps of the tenant's revenue, in percent: its distribution contract. */
  rates: { dsp: number; ugc: number; youtube: number };
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
  minAudioLength: boolean;
  physicalReleases: boolean;
  withholdingTax: boolean;
  noTransactionalEmails: boolean;
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

type Drafted = Pick<Tenant, "enterpriseId" | "name" | "created" | "owner" | "rates"> & Partial<Tenant>;

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

/** The tenants, newest first — a few still being set up. */
export let TENANTS: readonly Tenant[] = [
  t({ enterpriseId: "612240", name: "Saltmarsh Tapes", owner: { name: "Wren Okafor", email: "wren@saltmarshtapes.example" }, rates: { dsp: 20, ugc: 25, youtube: 20 }, created: day(2026, 10, 14), onTrial: true, whiteLabel: undefined, storesLive: 0, tested: false, emailed: false }),
  t({ enterpriseId: "612034", name: "Paperkite Sound", owner: { name: "Felix Ashby", email: "felix@paperkite.fm" }, organization: "paperkite-sound", taxCountry: "United Kingdom", rates: { dsp: 3, ugc: 5, youtube: 4 }, created: day(2026, 10, 6), storesLive: 0, tested: false, emailed: false }),
  t({ enterpriseId: "611980", name: "Halcyon Pilot", environment: "Demo", owner: { name: "Ezra Quinn", email: "demo@revelator.example" }, taxCountry: "United States of America", rates: { dsp: 15, ugc: 7.5, youtube: 12 }, created: day(2026, 10, 1), tested: false, emailed: false }),
  t({ enterpriseId: "611207", name: "Ninefold Records", owner: { name: "Jana Wolff", email: "jana.wolff@ninefold.example" }, organization: "ninefold-records", taxCountry: "Germany", rates: { dsp: 0, ugc: 0, youtube: 0 }, created: day(2026, 9, 29), currency: "EUR", whiteLabel: undefined, storesLive: 0, tested: false, emailed: false }),
  t({ enterpriseId: "611150", name: "Riverstone API Trial", environment: "API sandbox", owner: { name: "Ezra Quinn", email: "demo@revelator.example" }, taxCountry: "United States of America", rates: { dsp: 15, ugc: 7.5, youtube: 12 }, created: day(2026, 9, 26), storesLive: 0, tested: false, emailed: false }),
  t({ enterpriseId: "609882", name: "Corvid Lane Publishing", owner: { name: "Dana Whitlock", email: "dana@corvidlane.com" }, organization: "corvid-lane", taxCountry: "United States of America", rates: { dsp: 15, ugc: 18, youtube: 12.5 }, created: day(2026, 9, 15), emailed: false }),
  t({ enterpriseId: "609881", name: "Corvid Lane", owner: { name: "Dana Whitlock", email: "dana@corvidlane.com" }, organization: "corvid-lane", taxCountry: "United States of America", rates: { dsp: 15, ugc: 18, youtube: 12.5 }, created: day(2026, 9, 8), whiteLabel: whiteLabelFor("609881", "Corvid Lane", { enableIntercom: true, intercomAppId: "cv7k2lq9", showRevelatorBranding: true, customDashboardLinkUrl: "https://corvidlane.example/artists", customDashboardLinkText: "Artist portal", customLogoutUrl: "https://corvidlane.example" }), fusionAuth: true, team: [{ name: "Rui Tanaka", email: "rui@corvidlane.com" }], integrations: [{ providerId: "PP-77310428", provider: "PayPal", connected: true }], notes: [{ id: "n-3", created: day(2026, 9, 22), author: "Ines Calder", content: "Asked for a second admin for their publishing arm. Pointed them to Corvid Lane Publishing instead." }] }),
  t({ enterpriseId: "608540", name: "Silverbirch Publishing House", owner: { name: "Ivo Marsh", email: "rights@silverbirchph.co.uk" }, organization: "silverbirch-publishing-house", taxCountry: "United Kingdom", rates: { dsp: 20, ugc: 25, youtube: 15 }, created: day(2026, 8, 25), currency: "GBP" }),
  t({ enterpriseId: "606404", name: "Opaline Sandbox", environment: "API sandbox", partnerId: "231", owner: { name: "Clémence Roy", email: "clemence@opaline.audio" }, organization: "opaline", taxCountry: "France", rates: { dsp: 10, ugc: 12, youtube: 7.5 }, created: day(2026, 8, 3), currency: "EUR" }),
  t({ enterpriseId: "606403", name: "Opaline Classics", owner: { name: "Clémence Roy", email: "clemence@opaline.audio" }, organization: "opaline", taxCountry: "France", rates: { dsp: 10, ugc: 12, youtube: 7.5 }, created: day(2026, 7, 20), currency: "EUR" }),
  t({ enterpriseId: "607113", name: "Marlow Tide Entertainment", owner: { name: "Grady Holt", email: "grady@marlowtide.example" }, organization: "marlow-tide-entertainment", taxCountry: "United States of America", rates: { dsp: 20, ugc: 22.5, youtube: 18 }, created: day(2026, 7, 12), paymentBlocked: true }),
  t({ enterpriseId: "606402", name: "Opaline", type: "Parent", owner: { name: "Clémence Roy", email: "clemence@opaline.audio" }, organization: "opaline", taxCountry: "France", rates: { dsp: 10, ugc: 12, youtube: 7.5 }, created: day(2026, 7, 2), currency: "EUR", whiteLabel: whiteLabelFor("606402", "Opaline", { domain: "app.opaline.example", domainV2: "app.opaline.example", authBaseUrl: "https://auth.opaline.example/", title: "Opaline | Distribution musicale", enabled: true, defaultPlanId: "7", loginHeader: "Bienvenue", loginSubheader: "Connectez-vous pour gérer vos sorties, votre catalogue et vos résultats.", signupHeader: "Inscrivez-vous pour distribuer votre musique et suivre son évolution.", signupSubheader: "Créez votre compte Opaline", faqUrl: "https://opaline.example/faq", helpUrl: "https://opaline.example/aide", distributionAgreementUrl: "https://opaline.example/contrat", googleAnalyticsSiteId: "G-OP4L1N3X", bccEmails: "ops@opaline.example" }), fusionAuth: true, team: [{ name: "Théo Martin", email: "dev@opaline.audio" }, { name: "Lucie Garnier", email: "lucie@maisonbrune.example", access: "Label Portal", enterpriseId: "606511" }, { name: "Malo Fournier", email: "malo.fournier@opalinejeunesse.example", access: "Payee Portal", legacy: true, enterpriseId: "606510" }], integrations: [{ providerId: "TIP-0042719", provider: "Tipalti", connected: true }], config: { marketplacePage: true, withholdingTax: true, paymentBatcher: "Tipalti" }, notes: [{ id: "n-1", created: day(2026, 8, 18), author: "Ines Calder", content: "Client accounts import in batches of 50: the template times out above that." }, { id: "n-2", created: day(2026, 7, 9), author: "Dario Mendel", content: "Revenue history kept for three years, per their contract. Do not shorten it." }], children: [child("606510", "Opaline Jeunesse", day(2026, 7, 30)), child("606511", "Maison Brune", day(2026, 8, 14))] }),
  t({ enterpriseId: "604380", name: "Eastgate Test", environment: "Demo", owner: { name: "Katrin Lüders", email: "finance@eastgatemusic.de" }, organization: "eastgate-music-partners", taxCountry: "Germany", rates: { dsp: 0, ugc: 0, youtube: 0 }, created: day(2026, 6, 10), currency: "EUR" }),
  t({ enterpriseId: "604379", name: "Eastgate Kids", owner: { name: "Katrin Lüders", email: "finance@eastgatemusic.de" }, organization: "eastgate-music-partners", taxCountry: "Germany", rates: { dsp: 0, ugc: 0, youtube: 0 }, created: day(2026, 6, 9), currency: "EUR" }),
  t({ enterpriseId: "605118", name: "Brackenridge Audio", owner: { name: "Walt Ferris", email: "walt@brackenridge.example" }, organization: "brackenridge-audio", taxCountry: "United States of America", rates: { dsp: 20, ugc: 25, youtube: 17 }, created: day(2026, 5, 22), lockedOut: true, paymentBlocked: true, config: { noTransactionalEmails: true }, notes: [{ id: "n-5", created: day(2026, 9, 30), author: "Ines Calder", content: "Locked out and payment blocked over the unpaid June invoice. Unlock only once Finance confirms." }] }),
  t({ enterpriseId: "604378", name: "Eastgate Classics", owner: { name: "Katrin Lüders", email: "finance@eastgatemusic.de" }, organization: "eastgate-music-partners", taxCountry: "Germany", rates: { dsp: 0, ugc: 0, youtube: 0 }, created: day(2026, 5, 18), currency: "EUR" }),
  t({ enterpriseId: "604377", name: "Eastgate Music", type: "Parent", owner: { name: "Katrin Lüders", email: "finance@eastgatemusic.de" }, organization: "eastgate-music-partners", taxCountry: "Germany", rates: { dsp: 0, ugc: 0, youtube: 0 }, created: day(2026, 5, 4), currency: "EUR", fusionAuth: true, integrations: [{ providerId: "PP-61200937", provider: "PayPal", connected: true }, { providerId: "acct_1Q8eastgate", provider: "Stripe", connected: false }], config: { masterChannel: true, featureFm: true, physicalReleases: true }, children: [child("604601", "Nordhafen Beats", day(2026, 5, 28)), child("604602", "Elbe Strings", day(2026, 6, 20)), child("604603", "Kiezklang", day(2026, 8, 2))] }),
  t({ enterpriseId: "603011", name: "Thistle & Thorn", owner: { name: "Aoife Brennan", email: "label@thistleandthorn.ie" }, organization: "thistle-and-thorn", taxCountry: "Ireland", rates: { dsp: 18, ugc: 20, youtube: 15.5 }, created: day(2026, 3, 19), currency: "EUR" }),
  t({ enterpriseId: "602290", name: "Grainfield Collective", owner: { name: "Mo Abernathy", email: "mo@grainfield.example" }, organization: "grainfield-collective", taxCountry: "United States of America", rates: { dsp: 20, ugc: 25, youtube: 22 }, created: day(2026, 2, 27), onTrial: true, storesLive: 3, emailed: false }),
  t({ enterpriseId: "598220", name: "Bluefen API Sandbox", environment: "API sandbox", partnerId: "198", owner: { name: "Elin Sjöberg", email: "support@bluefen.dist" }, organization: "bluefen-distribution", taxCountry: "Sweden", rates: { dsp: 8, ugc: 10, youtube: 6 }, created: day(2026, 2, 4), currency: "SEK" }),
  t({ enterpriseId: "598219", name: "Bluefen Archive", owner: { name: "Elin Sjöberg", email: "support@bluefen.dist" }, organization: "bluefen-distribution", taxCountry: "Sweden", rates: { dsp: 8, ugc: 10, youtube: 6 }, created: day(2026, 2, 3), currency: "SEK" }),
  t({ enterpriseId: "598218", name: "Bluefen Jazz", owner: { name: "Elin Sjöberg", email: "support@bluefen.dist" }, organization: "bluefen-distribution", taxCountry: "Sweden", rates: { dsp: 8, ugc: 10, youtube: 6 }, created: day(2026, 1, 12), currency: "SEK" }),
  t({ enterpriseId: "598217", name: "Bluefen Baltic", owner: { name: "Elin Sjöberg", email: "support@bluefen.dist" }, organization: "bluefen-distribution", taxCountry: "Sweden", rates: { dsp: 8, ugc: 10, youtube: 6 }, created: day(2025, 11, 30), currency: "EUR" }),
  t({ enterpriseId: "598216", name: "Bluefen Nordic", owner: { name: "Elin Sjöberg", email: "support@bluefen.dist" }, organization: "bluefen-distribution", taxCountry: "Sweden", rates: { dsp: 8, ugc: 10, youtube: 6 }, created: day(2025, 11, 2), currency: "SEK" }),
  t({ enterpriseId: "598215", name: "Bluefen Distribution", type: "Parent", owner: { name: "Elin Sjöberg", email: "support@bluefen.dist" }, organization: "bluefen-distribution", taxCountry: "Sweden", rates: { dsp: 8, ugc: 10, youtube: 6 }, created: day(2025, 10, 14), currency: "SEK", fusionAuth: true, integrations: [{ providerId: "TIP-0038816", provider: "Tipalti", connected: true }], config: { minAudioLength: false, physicalReleases: true }, notes: [{ id: "n-4", created: day(2026, 4, 2), author: "Dario Mendel", content: "Payouts to Gotland Folk held in March while the payee re-verified its bank. Released 1 April." }], team: [{ name: "Nils Ek", email: "nils@bluefen.dist" }, { name: "Saga Lind", email: "api@bluefen.dist" }, { name: "Astrid Holm", email: "astrid.holm@gotlandfolk.example", access: "Artist Portal", enterpriseId: "598302" }, { name: "Oskar Vik", email: "oskar@fjallsound.example", access: "Payee Portal", enterpriseId: "598301" }], children: [child("598301", "Fjällsound", day(2025, 12, 1)), child("598302", "Gotland Folk", day(2026, 3, 9))] }),
  t({ enterpriseId: "600874", name: "Kestrel Point Recordings", owner: { name: "Priya Lal", email: "admin@kestrelpoint.com" }, organization: "kestrel-point-recordings", taxCountry: "United States of America", rates: { dsp: 15, ugc: 17.5, youtube: 12 }, created: day(2025, 12, 10), lockedOut: true }),
  t({ enterpriseId: "595661", name: "Harrow Street Live", owner: { name: "Tess Morley", email: "tess.morley@harrowstreet.example" }, organization: "harrow-street-sound", taxCountry: "United Kingdom", rates: { dsp: 0, ugc: 0, youtube: 0 }, created: day(2025, 9, 1), currency: "GBP" }),
  t({ enterpriseId: "595660", name: "Harrow Street Sound", owner: { name: "Tess Morley", email: "tess.morley@harrowstreet.example" }, organization: "harrow-street-sound", taxCountry: "United Kingdom", rates: { dsp: 0, ugc: 0, youtube: 0 }, created: day(2025, 7, 9), currency: "GBP" }),
  t({ enterpriseId: "593007", name: "Mistral Arcade", owner: { name: "Luc Garnier", email: "hello@mistralarcade.fr" }, organization: "mistral-arcade", taxCountry: "France", rates: { dsp: 20, ugc: 22, youtube: 25 }, created: day(2025, 3, 25), currency: "EUR", lockedOut: true, paymentBlocked: true }),
  t({ enterpriseId: "590114", name: "Cinderwell Films", owner: { name: "Maeve Duncan", email: "ops@cinderwell.com" }, organization: "cinderwell-music", taxCountry: "Canada", rates: { dsp: 12, ugc: 15, youtube: 10 }, created: day(2025, 2, 17), currency: "CAD" }),
  t({ enterpriseId: "590113", name: "Cinderwell Music", owner: { name: "Maeve Duncan", email: "ops@cinderwell.com" }, organization: "cinderwell-music", taxCountry: "Canada", rates: { dsp: 12, ugc: 15, youtube: 10 }, created: day(2024, 12, 2), currency: "CAD" }),
  t({ enterpriseId: "571902", name: "Foxglove Ridge Records", owner: { name: "June Calloway", email: "june@foxgloveridge.example" }, organization: "foxglove-ridge-records", taxCountry: "United States of America", rates: { dsp: 20, ugc: 25, youtube: 17.5 }, created: day(2023, 9, 11) }),
];

export const tenantById = (id: string) => TENANTS.find((one) => one.enterpriseId === id) ?? TENANTS[0]!;

/** Demo and API sandboxes deliver nowhere: everything they release stays out of the stores. */
export const isSandbox = (one: Tenant) => one.environment !== "Production";

/** Who signs in to the tenant: its owner first — the one the handover goes to — then its team. */
export function usersOf(one: Tenant): readonly TenantUser[] {
  const owner = one.owner;
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

/** How long a tenant's analytics are kept — its enterprise's settings. */
export const analyticsOf = (one: Tenant): TenantAnalytics => {
  const settings = settingsOf(one.enterpriseId);
  return { enabled: settings.analyticsEnabled, trendsDays: settings.trendsDays, revenueDays: settings.revenueDays, v3TrendsDays: settings.v3TrendsDays };
};

/** A tenant's entry in the supply chain's tenant configuration — written when it is signed up. */
export const configOf = (one: Tenant): TenantConfig => configDefaultsOf(one);

/** What a tenant's entry holds, or would hold once written — the defaults, then what was set. */
export const configDefaultsOf = (one: Tenant): TenantConfig => ({
  authTenantId: uuidOf(`auth-${one.enterpriseId}`),
  authClientId: uuidOf(`client-${one.enterpriseId}`),
  domain: one.domain ?? one.whiteLabel?.domain,
  marketplacePage: null,
  masterChannel: null,
  featureFm: null,
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
  key: "white-label" | "stores" | "partner" | "login" | "handover";
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
 * and is its owner's once they have been told. An API sandbox owes its partner too.
 */
export function setupOf(one: Tenant): readonly SetupStep[] {
  const sandbox = isSandbox(one);
  const steps: (SetupStep | null)[] = [
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

/** The enterprise id the next tenant signed up is issued. */
export const nextEnterpriseId = () =>
  after([...TENANTS.map((one) => one.enterpriseId), ...TENANTS.flatMap((one) => one.children.map((each) => each.enterpriseId))], 7);

/** A client account made on its parent — its enterprise and its payee — the newest of its clients. */
export function addClient(parentId: string, name: string, currency?: string): string {
  const parent = tenantById(parentId);
  const made = { ...child(nextEnterpriseId(), name, TODAY), ...(currency && currency !== parent.currency ? { currency } : {}) };
  updateTenant(parentId, { children: [...parent.children, made] });
  return made.enterpriseId;
}

/** A tenant signed up — its enterprise, its payee and its owner — in front of the set. */
export function addTenant(tenant: Tenant): string {
  TENANTS = [tenant, ...TENANTS];
  record({ category: "Details", resource: { type: "Tenant", id: tenant.enterpriseId, name: tenant.name }, tenantId: tenant.enterpriseId, entries: [{ action: "signed up the tenant" }] });
  changed();
  return tenant.enterpriseId;
}

/** A tenant changed where the patch says. */
export function updateTenant(id: string, patch: Partial<Tenant>) {
  const before = TENANTS.find((one) => one.enterpriseId === id);
  TENANTS = TENANTS.map((one) => (one.enterpriseId === id ? { ...one, ...patch } : one));
  if (before) recordTenantChange(before, { ...before, ...patch }, patch);
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
export const OPERATOR = "Noa Lindqvist";

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
  /** The tenant itself, where the enterprise is one. */
  tenant?: Tenant;
  /** The parent a child enterprise belongs to. */
  parent?: Tenant;
  partnerId?: string;
  onTrial: boolean;
  lockedOut: boolean;
  paymentBlocked: boolean;
  currency: string;
  minimumPayment: number;
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
      tenant,
      partnerId: tenant.partnerId,
      onTrial: tenant.onTrial,
      lockedOut: tenant.lockedOut,
      paymentBlocked: tenant.paymentBlocked,
      currency: tenant.currency,
      minimumPayment: tenant.minimumPayment,
      created: tenant.created,
    });
    for (const each of tenant.children)
      all.push({
        enterpriseId: each.enterpriseId,
        name: each.name,
        type: "Child",
        payeeId: each.payeeId,
        // A client account is held back where its parent is — unless it was set apart.
        parent: tenant,
        partnerId: each.partnerId,
        onTrial: each.onTrial ?? tenant.onTrial,
        lockedOut: each.lockedOut ?? tenant.lockedOut,
        paymentBlocked: each.paymentBlocked ?? tenant.paymentBlocked,
        currency: each.currency ?? tenant.currency,
        minimumPayment: each.minimumPayment ?? tenant.minimumPayment,
        created: each.created,
      });
  }
  return all.sort((a, b) => b.created.getTime() - a.created.getTime());
}

export const enterpriseById = (id: string) => enterprises().find((one) => one.enterpriseId === id);

/** A switch the product also holds unset — null, neither on nor off. */
export type Maybe = boolean | null;

/**
 * Everything RCC's enterprise form holds besides what the enterprise IS (its name, access and
 * partner): what its users may release, how it is paid and delivers, what a client account it
 * makes may do, and how long its analytics are kept.
 */
export interface EnterpriseSettings {
  allowRingtones: Maybe;
  allowVideos: Maybe;
  allowCoverSongs: Maybe;
  defaultLabel?: string;
  defaultArtist?: string;
  requireApproval: boolean;
  activateSubEnterprises: Maybe;
  hasChildren: Maybe;
  /** What Revelator keeps by default, in percent, and the kind of rate it is. */
  contractRate?: number;
  contractRateTypeId: string;
  paymentProviderId?: string;
  payMechanicals: Maybe;
  payMechanicalsCoverOnly: Maybe;
  suppressDeliveryEmails: Maybe;
  audioValidation: Maybe;
  /** How far into a track audio validation starts, in minutes and seconds. */
  audioValidationOffset?: string;
  autoDistroOptIn: Maybe;
  isrcPrefix?: string;
  filestack: string;
  useNse: Maybe;
  trendsPremium: boolean;
  dspRestrictions: Maybe;
  revenuePremium: boolean;
  v1Trends: boolean;
  syncAppleIds: Maybe;
  /** Who its emails come from. */
  outgoingEmail?: string;
  senderName?: string;
  /** What a client account it makes may do, by default. */
  readOnlyContent: Maybe;
  readOnlyContracts: Maybe;
  readOnlyFinance: Maybe;
  readOnlyDistribution: Maybe;
  readOnlyPromote: Maybe;
  readOnlyDaily: Maybe;
  readOnlyServices: Maybe;
  viewEarnings: boolean;
  viewAnalytics: boolean;
  viewBilling: boolean;
  canInvite: boolean;
  maxArtists?: string;
  hideUserInfo: boolean;
  canTakedown: Maybe;
  vip: Maybe;
  analyticsEnabled: boolean;
  trendsDays: number;
  revenueDays: number;
  v3TrendsDays: number;
}

export const FILESTACK = ["0 - Not Set", "1 - Never", "2 - Mobile Only", "3 - Not On Desktop", "4 - Always"] as const;

/** What was set on an enterprise, by its id — set apart from the defaults below. */
let ENTERPRISE_SETTINGS: Readonly<Record<string, Partial<EnterpriseSettings>>> = {
  "606402": { revenueDays: 1095, outgoingEmail: "hello@opaline.example", senderName: "Opaline", isrcPrefix: "FR-OP4", allowVideos: true, allowCoverSongs: true, requireApproval: true, payMechanicals: true },
  "605118": { analyticsEnabled: false, suppressDeliveryEmails: true },
  "604377": { allowRingtones: false, allowVideos: true, activateSubEnterprises: true, readOnlyFinance: true, readOnlyContent: false, maxArtists: "25", canTakedown: false },
  "598215": { filestack: "4 - Always", useNse: true, syncAppleIds: true, trendsPremium: true },
};

/** An enterprise's settings — the defaults for what it is, then what was set on it. */
export function settingsOf(enterpriseId: string): EnterpriseSettings {
  const tenant = TENANTS.find((one) => one.enterpriseId === enterpriseId);
  const parent = TENANTS.find((one) => one.type === "Parent" && one.enterpriseId === enterpriseId);
  return {
    allowRingtones: null,
    allowVideos: null,
    allowCoverSongs: null,
    requireApproval: false,
    activateSubEnterprises: null,
    hasChildren: parent ? true : null,
    contractRateTypeId: "2",
    payMechanicals: null,
    payMechanicalsCoverOnly: null,
    suppressDeliveryEmails: null,
    audioValidation: null,
    autoDistroOptIn: null,
    filestack: "0 - Not Set",
    useNse: null,
    trendsPremium: false,
    dspRestrictions: null,
    revenuePremium: false,
    v1Trends: true,
    syncAppleIds: null,
    outgoingEmail: tenant?.whiteLabel?.enabled ? `hello@${tenant.whiteLabel.domain}` : undefined,
    senderName: tenant?.whiteLabel?.enabled ? tenant.name : undefined,
    readOnlyContent: null,
    readOnlyContracts: null,
    readOnlyFinance: null,
    readOnlyDistribution: null,
    readOnlyPromote: null,
    readOnlyDaily: null,
    readOnlyServices: null,
    viewEarnings: false,
    viewAnalytics: true,
    viewBilling: false,
    // A client account invites its own team only where its parent lets it.
    canInvite: tenant !== undefined,
    hideUserInfo: false,
    canTakedown: null,
    vip: null,
    analyticsEnabled: true,
    trendsDays: 90,
    revenueDays: 730,
    v3TrendsDays: 365,
    ...ENTERPRISE_SETTINGS[enterpriseId],
  };
}

/** What the enterprise form changes on what an enterprise IS. */
export interface EnterpriseCore {
  name: string;
  onTrial: boolean;
  lockedOut: boolean;
  paymentBlocked: boolean;
  partnerId?: string;
  currency: string;
  minimumPayment: number;
}

/**
 * An enterprise saved from its form: what it is, on the tenant or on its parent's client account —
 * moved to another parent where one was picked — and its settings.
 */
export function saveEnterprise(id: string, core: EnterpriseCore, settings: Partial<EnterpriseSettings>, parentId?: string) {
  const was = settingsOf(id);
  ENTERPRISE_SETTINGS = { ...ENTERPRISE_SETTINGS, [id]: { ...ENTERPRISE_SETTINGS[id], ...settings } };
  const tenant = TENANTS.find((one) => one.enterpriseId === id);
  const holder = tenant ?? TENANTS.find((one) => one.children.some((each) => each.enterpriseId === id));
  const named = tenant?.name ?? holder?.children.find((each) => each.enterpriseId === id)?.name ?? core.name;
  record({
    category: "Settings",
    resource: { type: tenant ? "Tenant" : "Client", id, name: named },
    tenantId: holder?.enterpriseId,
    entries: changedLines(was, settingsOf(id), undefined, days),
  });
  if (tenant) return updateTenant(id, core);
  const parent = TENANTS.find((one) => one.children.some((each) => each.enterpriseId === id));
  if (!parent) return changed();
  const saved = { ...parent.children.find((each) => each.enterpriseId === id)!, ...core };
  const to = parentId && parentId !== parent.enterpriseId ? TENANTS.find((one) => one.enterpriseId === parentId) : undefined;
  if (!to) return updateTenant(parent.enterpriseId, { children: parent.children.map((each) => (each.enterpriseId === id ? saved : each)) });
  // MOVED: it leaves one parent's client accounts and joins another's.
  record({ category: "People", resource: { type: "Client", id, name: saved.name }, tenantId: to.enterpriseId, entries: [{ action: "moved the client account", property: "Parent enterprise", changes: [{ before: parent.name, after: to.name }] }] });
  TENANTS = TENANTS.map((one) =>
    one.enterpriseId === parent.enterpriseId
      ? { ...one, children: one.children.filter((each) => each.enterpriseId !== id) }
      : one.enterpriseId === to.enterpriseId
        ? { ...one, children: [...one.children, saved] }
        : one,
  );
  changed();
}

/** How long a tenant's analytics are kept, changed on its own. */
export function updateAnalytics(id: string, analytics: TenantAnalytics) {
  const was = settingsOf(id);
  ENTERPRISE_SETTINGS = {
    ...ENTERPRISE_SETTINGS,
    [id]: {
      ...ENTERPRISE_SETTINGS[id],
      analyticsEnabled: analytics.enabled,
      trendsDays: analytics.trendsDays,
      revenueDays: analytics.revenueDays,
      v3TrendsDays: analytics.v3TrendsDays,
    },
  };
  record({
    category: "Settings",
    resource: { type: "Tenant", id, name: tenantById(id).name },
    tenantId: id,
    entries: changedLines(was, settingsOf(id), ["analyticsEnabled", "trendsDays", "revenueDays", "v3TrendsDays"], days),
  });
  changed();
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
  record({ category: "Details", resource: { type: "Partner", id, name: partner.name }, entries: [{ action: "created the partner" }] });
  changed();
  return id;
}

export function updatePartner(id: string, patch: Partial<Partner>) {
  const before = PARTNERS.find((one) => one.id === id);
  PARTNERS = PARTNERS.map((one) => (one.id === id ? { ...one, ...patch } : one));
  const after = PARTNERS.find((one) => one.id === id);
  if (before && after) record({ category: "Details", resource: { type: "Partner", id, name: after.name }, entries: changedLines(before, after, Object.keys(patch)) });
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
      taxCountry: own ? tenant.taxCountry : undefined,
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
  const before = payeeById(id);
  PAYEE_EDITS = { ...PAYEE_EDITS, [id]: { ...PAYEE_EDITS[id], ...patch } };
  const after = payeeById(id);
  if (before && after)
    record({
      category: "Details",
      resource: { type: "Payee", id, name: after.name },
      tenantId: (after.enterprise.tenant ?? after.enterprise.parent)?.enterpriseId,
      entries: changedLines(before, after, Object.keys(patch)),
    });
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
  const before = accounts().find((one) => one.email === email);
  USER_EDITS = { ...USER_EDITS, [email]: { ...USER_EDITS[email], ...patch } };
  const after = accounts().find((one) => one.email === email);
  if (before && after)
    record({
      category: "Details",
      resource: { type: "User", id: after.userId, name: after.name },
      tenantId: after.memberships[0]?.tenant.enterpriseId,
      entries: changedLines(before, after, Object.keys(patch)),
    });
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
  const before = whiteLabelById(label.id);
  LOOSE_WHITE_LABELS = LOOSE_WHITE_LABELS.filter((one) => one.id !== label.id);
  TENANTS = TENANTS.map((one) =>
    one.whiteLabel?.id === label.id && one.enterpriseId !== tenantId ? { ...one, whiteLabel: undefined } : one,
  );
  if (tenantId) updateTenant(tenantId, { whiteLabel: label });
  else {
    record({
      category: "Settings",
      resource: { type: "White label", id: label.id, name: label.domain },
      entries: before ? changedLines(before, label, Object.keys(label)) : [{ action: "created the white label", property: "Domain", changes: [{ after: label.domain }] }],
    });
    LOOSE_WHITE_LABELS = [...LOOSE_WHITE_LABELS, label];
    changed();
  }
}

/** A white label deleted — its tenant, if it had one, no longer loads. */
export function deleteWhiteLabel(id: string) {
  const label = whiteLabelById(id);
  if (label)
    record({ category: "Settings", resource: { type: "White label", id, name: label.domain }, tenantId: label.tenant?.enterpriseId, entries: [{ action: "deleted the white label" }] });
  LOOSE_WHITE_LABELS = LOOSE_WHITE_LABELS.filter((one) => one.id !== id);
  TENANTS = TENANTS.map((one) => (one.whiteLabel?.id === id ? { ...one, whiteLabel: undefined } : one));
  changed();
}

/* ---------- Activity ---------- */

/** What a record is, as the activity log names it. */
export type ResourceType = "Tenant" | "Client" | "Payee" | "User" | "White label" | "Partner";

/** What a save was about — the part of a record it touched, or a sign-in as someone. */
export type ActivityCategory = "Impersonation" | "Details" | "People" | "Settings" | "Setup" | "Notes";
export const ACTIVITY_CATEGORIES: readonly ActivityCategory[] = ["Impersonation", "Details", "People", "Settings", "Setup", "Notes"];

/** The record a save was made on. */
export interface ActivityResource {
  type: ResourceType;
  id: string;
  name: string;
}

/** One value that moved, and the part of the property it belongs to. */
export interface ActivityLineChange {
  subProperty?: string;
  before?: string;
  after?: string;
}

/** One thing a save did: the act, the property it touched, and what moved. */
export interface ActivityLine {
  action: string;
  property?: string;
  changes?: ActivityLineChange[];
}

/**
 * ONE SAVE: everything one person — or the system — did to one record at one moment, and why where
 * it was a sign-in as someone. Kept at the resource level, so every record reads its own history and
 * the log reads all of them.
 */
export interface ActivityEvent {
  id: string;
  at: Date;
  actor: string;
  /** Done by the system, not a person: a lock on an unpaid invoice, an import. */
  machine?: boolean;
  category: ActivityCategory;
  resource: ActivityResource;
  /** The tenant it happened in, where it happened in one. */
  tenantId?: string;
  entries: readonly ActivityLine[];
  reason?: string;
}

/** The person signed in to RCC — the actor of everything done here. */
export const SIGNED_IN = "Noa Lindqvist";

const at = (year: number, month: number, date: number, hour: number, minute: number) => new Date(year, month - 1, date, hour, minute);

/** What happened before this session — invented, as every fixture here is. */
let ACTIVITY: readonly ActivityEvent[] = [
  { id: "a-14", at: at(2026, 10, 15, 16, 42), actor: "Ines Calder", category: "Impersonation", resource: { type: "Tenant", id: "606402", name: "Opaline" }, tenantId: "606402", reason: "Clémence reported the royalty statement for September shows the wrong currency; checking what she sees.", entries: [{ action: "signed in as Clémence Roy in V2", property: "Reason", changes: [{ after: "Clémence reported the royalty statement for September shows the wrong currency; checking what she sees." }] }] },
  { id: "a-13", at: at(2026, 10, 15, 11, 5), actor: "Dario Mendel", category: "Settings", resource: { type: "Tenant", id: "604377", name: "Eastgate Music" }, tenantId: "604377", entries: [{ action: "changed", property: "Master channel enabled", changes: [{ before: "Not set", after: "Yes" }] }, { action: "changed", property: "Feature.fm enabled", changes: [{ before: "Not set", after: "Yes" }] }] },
  { id: "a-12", at: at(2026, 10, 14, 9, 30), actor: "Noa Lindqvist", category: "Details", resource: { type: "Tenant", id: "612240", name: "Saltmarsh Tapes" }, tenantId: "612240", entries: [{ action: "signed up the tenant" }] },
  { id: "a-11", at: at(2026, 10, 13, 17, 12), actor: "Ines Calder", category: "Impersonation", resource: { type: "Payee", id: "915602", name: "Elbe Strings" }, tenantId: "604377", reason: "Payee can't see the August statement in the portal.", entries: [{ action: "signed in as Katrin Lüders in API", property: "Reason", changes: [{ after: "Payee can't see the August statement in the portal." }] }] },
  { id: "a-10", at: at(2026, 10, 10, 14, 0), actor: "Dario Mendel", category: "People", resource: { type: "Tenant", id: "598215", name: "Bluefen Distribution" }, tenantId: "598215", entries: [{ action: "gave Astrid Holm access", property: "Access", changes: [{ after: "Artist Portal" }] }] },
  { id: "a-09", at: at(2026, 10, 8, 10, 24), actor: "Noa Lindqvist", category: "Settings", resource: { type: "Tenant", id: "609881", name: "Corvid Lane" }, tenantId: "609881", entries: [{ action: "connected PayPal" }] },
  { id: "a-08", at: at(2026, 10, 1, 8, 0), actor: "System", machine: true, category: "Details", resource: { type: "Tenant", id: "605118", name: "Brackenridge Audio" }, tenantId: "605118", entries: [{ action: "changed", property: "Locked out", changes: [{ before: "No", after: "Yes" }] }, { action: "changed", property: "Payment blocked", changes: [{ before: "No", after: "Yes" }] }] },
  { id: "a-07", at: at(2026, 9, 30, 15, 10), actor: "Ines Calder", category: "Notes", resource: { type: "Tenant", id: "605118", name: "Brackenridge Audio" }, tenantId: "605118", entries: [{ action: "added a note", property: "Note", changes: [{ after: "Locked out and payment blocked over the unpaid June invoice. Unlock only once Finance confirms." }] }] },
  { id: "a-06", at: at(2026, 9, 22, 12, 40), actor: "Ines Calder", category: "Impersonation", resource: { type: "User", id: "rui@corvidlane.com", name: "Rui Tanaka" }, tenantId: "609881", reason: "Rui can't upload artwork larger than 5 MB.", entries: [{ action: "signed in as Rui Tanaka in V2", property: "Reason", changes: [{ after: "Rui can't upload artwork larger than 5 MB." }] }] },
  { id: "a-05", at: at(2026, 8, 18, 9, 15), actor: "Ines Calder", category: "Notes", resource: { type: "Tenant", id: "606402", name: "Opaline" }, tenantId: "606402", entries: [{ action: "added a note", property: "Note", changes: [{ after: "Client accounts import in batches of 50: the template times out above that." }] }] },
  { id: "a-04", at: at(2026, 8, 14, 11, 2), actor: "Bulk Import", machine: true, category: "People", resource: { type: "Client", id: "606511", name: "Maison Brune" }, tenantId: "606402", entries: [{ action: "created the client account" }] },
  { id: "a-03", at: at(2026, 7, 9, 16, 30), actor: "Dario Mendel", category: "Settings", resource: { type: "Tenant", id: "606402", name: "Opaline" }, tenantId: "606402", entries: [{ action: "changed", property: "Revenue retention", changes: [{ before: "730 days", after: "1095 days" }] }] },
];

/** Every save, newest first. */
export const activity = (): readonly ActivityEvent[] => [...ACTIVITY].sort((a, b) => b.at.getTime() - a.at.getTime());

/** A save written to the log, as the person signed in did it now. */
function record(event: Omit<ActivityEvent, "id" | "at" | "actor"> & Partial<Pick<ActivityEvent, "actor">>) {
  if (!event.entries.length) return;
  ACTIVITY = [{ id: `a-${Date.now()}-${ACTIVITY.length}`, at: new Date(), actor: SIGNED_IN, ...event }, ...ACTIVITY];
}

/** A value as the log writes it — words, never markup; none where it had none. */
const shown = (value: unknown): string | undefined =>
  value === undefined || value === ""
    ? undefined
    : value === null
      ? "Not set"
      : typeof value === "boolean"
        ? value ? "Yes" : "No"
        : typeof value === "number" || typeof value === "string"
          ? String(value)
          : undefined;

/** The words a field is known by — its own where the form gives one, else its name read aloud. */
const LABELS: Readonly<Record<string, string>> = {
  onTrial: "On trial",
  lockedOut: "Locked out",
  paymentBlocked: "Payment blocked",
  fusionAuth: "Uses FusionAuth",
  minimumPayment: "Minimum payment",
  partnerId: "Partner ID",
  taxCountry: "Tax domicile country",
  authTenantId: "Auth tenant ID",
  authClientId: "Auth client ID",
  featureFm: "Feature.fm enabled",
  marketplacePage: "Marketplace page enabled",
  masterChannel: "Master channel enabled",
  minAudioLength: "Minimum audio length validated",
  noTransactionalEmails: "Transactional emails turned off",
  domainV2: "Domain V2",
  authBaseUrl: "Auth base URL",
  enabled: "White label enabled",
  trendsDays: "Trends retention",
  revenueDays: "Revenue retention",
  v3TrendsDays: "V3 trends retention",
  analyticsEnabled: "Analytics enabled",
  settingsAllowed: "Payee settings changes allowed",
  partnerUserId: "Partner user ID",
};
const labelOf = (key: string) => LABELS[key] ?? key.replace(/([A-Z])/g, " $1").replace(/^./, (first) => first.toUpperCase()).replace(/ ([A-Z])/g, (_, c: string) => ` ${c.toLowerCase()}`);

/** What moved between two versions of a record, field by field, in the order the record lists them. */
function changedLines(before: object, after: object, only?: readonly string[], unit = (_key: string, value?: string) => value): ActivityLine[] {
  const b = before as Record<string, unknown>;
  const a = after as Record<string, unknown>;
  const keys = only ?? [...new Set([...Object.keys(b), ...Object.keys(a)])];
  return keys.flatMap((key) => {
    const was = unit(key, shown(b[key]));
    const is = unit(key, shown(a[key]));
    return was === is || (was === undefined && is === undefined) ? [] : [{ action: "changed", property: labelOf(key), changes: [{ before: was, after: is }] }];
  });
}

const days = (key: string, value?: string) => (value && /Days$/.test(key) ? `${value} days` : value);

const DETAIL_FIELDS = ["name", "onTrial", "lockedOut", "paymentBlocked", "currency", "minimumPayment", "partnerId", "taxCountry"] as const;
const SETTING_FIELDS = ["environment", "domain", "fusionAuth"] as const;
const CLIENT_FIELDS = ["name", "onTrial", "lockedOut", "paymentBlocked", "partnerId", "currency", "minimumPayment"] as const;

const storeState = (one: TenantStore) => (one.active && one.displayed ? "On" : one.active ? "On, hidden" : "Off");

/** Everything a change to a tenant did, filed by what it touched — and a client account's own. */
function recordTenantChange(before: Tenant, after: Tenant, patch: Partial<Tenant>) {
  const resource: ActivityResource = { type: "Tenant", id: before.enterpriseId, name: after.name };
  const lines: Record<ActivityCategory, ActivityLine[]> = { Impersonation: [], Details: [], People: [], Settings: [], Setup: [], Notes: [] };
  const keys = Object.keys(patch) as (keyof Tenant)[];
  const has = (key: keyof Tenant) => keys.includes(key);

  lines.Details.push(...changedLines(before, after, DETAIL_FIELDS.filter(has)));
  lines.Settings.push(...changedLines(before, after, SETTING_FIELDS.filter(has)));
  if (has("rates")) {
    const changes = (["dsp", "ugc", "youtube"] as const)
      .filter((key) => before.rates[key] !== after.rates[key])
      .map((key) => ({ subProperty: { dsp: "DSP rate", ugc: "UGC rate", youtube: "YouTube channel rate" }[key], before: `${before.rates[key]}%`, after: `${after.rates[key]}%` }));
    if (changes.length) lines.Details.push({ action: "changed", property: "Distribution contract", changes });
  }
  if (has("owner") || has("team")) {
    const people = (one: Tenant) => new Map([one.owner, ...one.team].map((each) => [each.email, each as TeamMember]));
    const was = people(before);
    const is = people(after);
    for (const [email, one] of is)
      if (!was.has(email)) lines.People.push({ action: `gave ${one.name} access`, property: "Access", changes: [{ after: one.access ?? "Team Members" }] });
      else if ((was.get(email)!.access ?? "Team Members") !== (one.access ?? "Team Members"))
        lines.People.push({ action: "changed", property: `${one.name}'s access`, changes: [{ before: was.get(email)!.access ?? "Team Members", after: one.access ?? "Team Members" }] });
    for (const [email, one] of was) if (!is.has(email)) lines.People.push({ action: `removed ${one.name}'s access` });
    if (before.owner.email !== after.owner.email) lines.People.push({ action: `made ${after.owner.name} the owner`, property: "Owner", changes: [{ before: before.owner.name, after: after.owner.name }] });
  }
  if (has("stores") || has("storesLive")) {
    const was = new Map(storesOf(before).map((one) => [one.name, storeState(one)]));
    const changes = storesOf(after).flatMap((one) =>
      was.get(one.name) !== undefined && was.get(one.name) !== storeState(one) ? [{ subProperty: one.name, before: was.get(one.name), after: storeState(one) }] : [],
    );
    if (changes.length) lines.Settings.push({ action: "switched", property: "DSPs", changes });
  }
  if (has("integrations")) {
    const was = new Map(integrationsOf(before).map((one) => [one.providerId, one]));
    for (const one of integrationsOf(after)) {
      const prior = was.get(one.providerId);
      if (!prior) lines.Settings.push({ action: `connected ${one.provider}`, property: "Provider ID", changes: [{ after: one.providerId }] });
      else if (prior.connected !== one.connected) lines.Settings.push({ action: `${one.connected ? "reconnected" : "disconnected"} ${one.provider}` });
    }
  }
  if (has("config")) lines.Settings.push(...changedLines(configDefaultsOf(before), configDefaultsOf(after)));
  if (has("whiteLabel")) {
    if (!before.whiteLabel && after.whiteLabel) lines.Settings.push({ action: "created the white label", property: "Domain", changes: [{ after: after.whiteLabel.domain }] });
    else if (before.whiteLabel && !after.whiteLabel) lines.Settings.push({ action: "removed the white label" });
    else if (before.whiteLabel && after.whiteLabel) lines.Settings.push(...changedLines(before.whiteLabel, after.whiteLabel));
  }
  if (has("tested") && after.tested && !before.tested) lines.Setup.push({ action: "marked the login tested" });
  if (has("emailed") && after.emailed && !before.emailed) lines.Setup.push({ action: "copied the handover email" });
  if (has("notes")) {
    const was = new Map((before.notes ?? []).map((one) => [one.id, one]));
    const is = new Map((after.notes ?? []).map((one) => [one.id, one]));
    for (const [id, one] of is) if (!was.has(id)) lines.Notes.push({ action: "added a note", property: "Note", changes: [{ after: one.content }] });
    for (const [id, one] of was) if (!is.has(id)) lines.Notes.push({ action: "deleted a note", property: "Note", changes: [{ before: one.content }] });
  }
  for (const category of ACTIVITY_CATEGORIES) record({ category, resource, tenantId: before.enterpriseId, entries: lines[category] });

  // A CLIENT ACCOUNT'S own history: made here, or changed on its own form.
  if (has("children")) {
    const was = new Map(before.children.map((one) => [one.enterpriseId, one]));
    for (const one of after.children) {
      const client: ActivityResource = { type: "Client", id: one.enterpriseId, name: one.name };
      const prior = was.get(one.enterpriseId);
      if (!prior) record({ category: "People", resource: client, tenantId: before.enterpriseId, entries: [{ action: "created the client account" }] });
      else record({ category: "Details", resource: client, tenantId: before.enterpriseId, entries: changedLines(prior, one, CLIENT_FIELDS) });
    }
  }
}

/** A sign-in as someone else — who, where, and why — written to the log before it happens. */
export function recordImpersonation(input: { tenantId: string; resource: ActivityResource; as: string; surface: string; reason: string }) {
  record({
    category: "Impersonation",
    resource: input.resource,
    tenantId: input.tenantId,
    reason: input.reason,
    entries: [{ action: `signed in as ${input.as} in ${input.surface}`, property: "Reason", changes: [{ after: input.reason }] }],
  });
  changed();
}
