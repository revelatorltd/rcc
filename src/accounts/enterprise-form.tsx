import {
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

import { enterpriseHref, go, tenantHref } from "../route";
import {
  FILESTACK,
  PARTNERS,
  PLANS,
  TENANTS,
  enterpriseById,
  enterprises,
  saveEnterprise,
  settingsOf,
  type Maybe,
} from "./mock";
import { REVENUE_DAYS, TRENDS_DAYS, V3_TRENDS_DAYS, days } from "./tenant-facets";

const choices = (values: readonly string[]) => values.map((value) => ({ value, title: value }));
const YES_NO = choices(["Yes", "No"]);
const yes = (value: boolean | undefined) => (value ? "Yes" : "No");
/** A switch the product also holds unset. */
const MAYBE = choices(["Yes", "No", "Not set"]);
const maybe = (value: Maybe) => (value === null ? "Not set" : yes(value));
const unmaybe = (value: string): Maybe => (value === "Not set" ? null : value === "Yes");

/** The currencies an enterprise pays in, with the names RCC gives them. */
const CURRENCIES = [
  ["USD", "United States dollar"],
  ["EUR", "Euro"],
  ["GBP", "Pound sterling"],
  ["SEK", "Swedish krona"],
  ["CAD", "Canadian dollar"],
  ["AUD", "Australian dollar"],
  ["ILS", "Israeli new shekel"],
  ["JPY", "Japanese yen"],
  ["BRL", "Brazilian real"],
  ["MXN", "Mexican peso"],
] as const;

/** The payment providers, as the product numbers them. */
const PROVIDERS = choices(["1 - PayPal", "3 - Tipalti", "4 - Stripe"]);

/** The artists an enterprise's releases default to — invented, as every fixture here is. */
const ARTISTS = ["Juno Vale", "The Marram", "Ottoline Reyes", "Sable Harbour", "Kit Ambrose", "Lowfield"];

/**
 * An enterprise, edited the way RCC edits it — every enterprise on the one form, a tenant or a client
 * account: what it is and who may sign in, its partner and plan, what its users may release, how it is
 * paid and delivers, its ISRCs, the rest of its switches, who its emails come from, what a client
 * account it makes may do, and how long its analytics are kept.
 *
 * Its creation date and payee ID are read in the note, never edited.
 */
export function EditEnterprise({ id }: { id: string }) {
  const enterprise = enterpriseById(id) ?? enterprises()[0]!;
  const tenant = enterprise.tenant;
  const settings = settingsOf(enterprise.enterpriseId);
  const leave = () => go(tenant ? tenantHref(enterprise.enterpriseId, "Details") : enterpriseHref(enterprise.enterpriseId));
  // Where its releases are labelled: the enterprise itself, and each client account it holds.
  const labels = [enterprise.name, ...(tenant?.children.map((one) => one.name) ?? [])];
  const parents = TENANTS.filter((one) => one.type === "Parent");
  return (
    <Wizard
      editing
      noun={{ one: "enterprise", many: "enterprises" }}
      note={`Enterprise ID ${enterprise.enterpriseId} · payee ID ${enterprise.payeeId} · created ${enterprise.created.toLocaleDateString("en-US")}`}
      onExit={leave}
      subject={(answers) => ({ kind: "organization", name: answers.name ?? enterprise.name, meta: [answers.plan ?? enterprise.plan] })}
      draft={{
        name: owed(enterprise.name),
        onTrial: owed(yes(enterprise.onTrial)),
        lockedOut: owed(yes(enterprise.lockedOut)),
        paymentBlocked: owed(yes(enterprise.paymentBlocked)),
        partner: enterprise.partnerId ?? unanswered.record,
        plan: owed<string>(enterprise.plan),
        currency: owed<string>(enterprise.currency),
        allowRingtones: owed(maybe(settings.allowRingtones)),
        allowVideos: owed(maybe(settings.allowVideos)),
        allowCoverSongs: owed(maybe(settings.allowCoverSongs)),
        defaultLabel: settings.defaultLabel ?? unanswered.record,
        defaultArtist: settings.defaultArtist ?? unanswered.record,
        requireApproval: owed(yes(settings.requireApproval)),
        activateSubEnterprises: owed(maybe(settings.activateSubEnterprises)),
        hasChildren: owed(maybe(settings.hasChildren)),
        contractRate: settings.contractRate ?? unanswered.percent,
        contractRateTypeId: owed(settings.contractRateTypeId),
        minimumPayment: owed(enterprise.minimumPayment),
        paymentProviderId: settings.paymentProviderId ?? unanswered.choice,
        payMechanicals: owed(maybe(settings.payMechanicals)),
        payMechanicalsCoverOnly: owed(maybe(settings.payMechanicalsCoverOnly)),
        suppressDeliveryEmails: owed(maybe(settings.suppressDeliveryEmails)),
        audioValidation: owed(maybe(settings.audioValidation)),
        audioValidationOffset: settings.audioValidationOffset ?? unanswered.duration,
        autoDistroOptIn: owed(maybe(settings.autoDistroOptIn)),
        isrcPrefix: settings.isrcPrefix ?? unanswered.text,
        filestack: owed<string>(settings.filestack),
        useNse: owed(maybe(settings.useNse)),
        trendsPremium: owed(yes(settings.trendsPremium)),
        dspRestrictions: owed(maybe(settings.dspRestrictions)),
        revenuePremium: owed(yes(settings.revenuePremium)),
        v1Trends: owed(yes(settings.v1Trends)),
        syncAppleIds: owed(maybe(settings.syncAppleIds)),
        outgoingEmail: settings.outgoingEmail ?? unanswered.email,
        senderName: settings.senderName ?? unanswered.text,
        parent: enterprise.parent?.enterpriseId ?? unanswered.record,
        readOnlyContent: owed(maybe(settings.readOnlyContent)),
        readOnlyContracts: owed(maybe(settings.readOnlyContracts)),
        readOnlyFinance: owed(maybe(settings.readOnlyFinance)),
        readOnlyDistribution: owed(maybe(settings.readOnlyDistribution)),
        readOnlyPromote: owed(maybe(settings.readOnlyPromote)),
        readOnlyDaily: owed(maybe(settings.readOnlyDaily)),
        readOnlyServices: owed(maybe(settings.readOnlyServices)),
        viewEarnings: owed(yes(settings.viewEarnings)),
        viewAnalytics: owed(yes(settings.viewAnalytics)),
        viewBilling: owed(yes(settings.viewBilling)),
        canInvite: owed(yes(settings.canInvite)),
        maxArtists: settings.maxArtists ?? unanswered.text,
        hideUserInfo: owed(yes(settings.hideUserInfo)),
        canTakedown: owed(maybe(settings.canTakedown)),
        vip: owed(maybe(settings.vip)),
        analyticsEnabled: owed(yes(settings.analyticsEnabled)),
        trendsDays: owed<string>(String(settings.trendsDays)),
        revenueDays: owed<string>(String(settings.revenueDays)),
        v3TrendsDays: owed<string>(String(settings.v3TrendsDays)),
      }}
      onCommit={(answers) => {
        const text = (value: unknown) => (typeof value === "string" && value.trim()) || undefined;
        const on = (value: string) => value === "Yes";
        saveEnterprise(
          enterprise.enterpriseId,
          {
            name: answers.name.trim(),
            plan: answers.plan,
            onTrial: on(answers.onTrial),
            lockedOut: on(answers.lockedOut),
            paymentBlocked: on(answers.paymentBlocked),
            partnerId: text(answers.partner),
            currency: answers.currency,
            minimumPayment: answers.minimumPayment,
          },
          {
            allowRingtones: unmaybe(answers.allowRingtones),
            allowVideos: unmaybe(answers.allowVideos),
            allowCoverSongs: unmaybe(answers.allowCoverSongs),
            defaultLabel: text(answers.defaultLabel),
            defaultArtist: text(answers.defaultArtist),
            requireApproval: on(answers.requireApproval),
            activateSubEnterprises: unmaybe(answers.activateSubEnterprises),
            hasChildren: unmaybe(answers.hasChildren),
            contractRate: typeof answers.contractRate === "number" ? answers.contractRate : undefined,
            contractRateTypeId: answers.contractRateTypeId.trim(),
            paymentProviderId: text(answers.paymentProviderId),
            payMechanicals: unmaybe(answers.payMechanicals),
            payMechanicalsCoverOnly: unmaybe(answers.payMechanicalsCoverOnly),
            suppressDeliveryEmails: unmaybe(answers.suppressDeliveryEmails),
            audioValidation: unmaybe(answers.audioValidation),
            audioValidationOffset: text(answers.audioValidationOffset),
            autoDistroOptIn: unmaybe(answers.autoDistroOptIn),
            isrcPrefix: text(answers.isrcPrefix),
            filestack: answers.filestack,
            useNse: unmaybe(answers.useNse),
            trendsPremium: on(answers.trendsPremium),
            dspRestrictions: unmaybe(answers.dspRestrictions),
            revenuePremium: on(answers.revenuePremium),
            v1Trends: on(answers.v1Trends),
            syncAppleIds: unmaybe(answers.syncAppleIds),
            outgoingEmail: text(answers.outgoingEmail),
            senderName: text(answers.senderName),
            readOnlyContent: unmaybe(answers.readOnlyContent),
            readOnlyContracts: unmaybe(answers.readOnlyContracts),
            readOnlyFinance: unmaybe(answers.readOnlyFinance),
            readOnlyDistribution: unmaybe(answers.readOnlyDistribution),
            readOnlyPromote: unmaybe(answers.readOnlyPromote),
            readOnlyDaily: unmaybe(answers.readOnlyDaily),
            readOnlyServices: unmaybe(answers.readOnlyServices),
            viewEarnings: on(answers.viewEarnings),
            viewAnalytics: on(answers.viewAnalytics),
            viewBilling: on(answers.viewBilling),
            canInvite: on(answers.canInvite),
            maxArtists: text(answers.maxArtists),
            hideUserInfo: on(answers.hideUserInfo),
            canTakedown: unmaybe(answers.canTakedown),
            vip: unmaybe(answers.vip),
            analyticsEnabled: on(answers.analyticsEnabled),
            trendsDays: Number(answers.trendsDays),
            revenueDays: Number(answers.revenueDays),
            v3TrendsDays: Number(answers.v3TrendsDays),
          },
          text(answers.parent),
        );
        leave();
      }}
    >
      <WizardSection>
        <WizardSectionHeader title="Basics" />
        <WizardSectionBody>
          <WizardRow title="Name">
            <WizardRowBody>
              <Field as="text" name="name" label="Name" />
            </WizardRowBody>
          </WizardRow>
          <WizardRow title="Access">
            <WizardRowBody>
              <Field as="choice" name="onTrial" label="On trial" options={YES_NO} />
              <Field as="choice" name="lockedOut" label="Locked out" options={YES_NO} />
              <Field as="choice" name="paymentBlocked" label="Payment blocked" options={YES_NO} />
            </WizardRowBody>
            <WizardRowTips>
              <WizardRowTip>Nobody at an enterprise locked out can sign in. No payee of a blocked one is paid.</WizardRowTip>
            </WizardRowTips>
          </WizardRow>
          <WizardRow title="Partner API">
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
            </WizardRowBody>
            <WizardRowTips>
              <WizardRowTip>Left blank, no partner is associated with it. Pick one to associate it, and save.</WizardRowTip>
            </WizardRowTips>
          </WizardRow>
          <WizardRow title="Plan">
            <WizardRowBody>
              <Field as="choice" name="plan" label="Subscription plan" noun={{ one: "plan", many: "plans" }} options={choices(PLANS)} />
              <Field
                as="choice"
                name="currency"
                label="Currency"
                noun={{ one: "currency", many: "currencies" }}
                options={CURRENCIES.map(([code, named]) => ({ value: code, title: `${code} - ${named}` }))}
              />
            </WizardRowBody>
          </WizardRow>
        </WizardSectionBody>
      </WizardSection>

      <WizardSection>
        <WizardSectionHeader title="Content" />
        <WizardSectionBody>
          <WizardRow title="What it may release">
            <WizardRowBody>
              <Field as="choice" name="allowRingtones" label="Allow ringtones" options={MAYBE} />
              <Field as="choice" name="allowVideos" label="Allow videos" options={MAYBE} />
              <Field as="choice" name="allowCoverSongs" label="Allow cover songs" options={MAYBE} />
            </WizardRowBody>
            <WizardRowTips>
              <WizardRowTip>Not set leaves the switch empty: the product's default applies.</WizardRowTip>
            </WizardRowTips>
          </WizardRow>
          <WizardRow title="Defaults">
            <WizardRowBody>
              <Field
                as="record"
                name="defaultLabel"
                label="Default label"
                entity="organization"
                noun={{ one: "label", many: "labels" }}
                options={labels.map((one) => ({ value: one, title: one }))}
              />
              <Field
                as="record"
                name="defaultArtist"
                label="Default artist"
                entity="person"
                noun={{ one: "artist", many: "artists" }}
                options={ARTISTS.map((one) => ({ value: one, title: one }))}
              />
            </WizardRowBody>
          </WizardRow>
        </WizardSectionBody>
      </WizardSection>

      <WizardSection>
        <WizardSectionHeader title="Distribution" />
        <WizardSectionBody>
          <WizardRow title="Approval">
            <WizardRowBody>
              <Field as="choice" name="requireApproval" label="Require approval before distribution" options={YES_NO} />
            </WizardRowBody>
          </WizardRow>
          <WizardRow title="Sub-enterprises">
            <WizardRowBody>
              <Field as="choice" name="activateSubEnterprises" label="Activate sub-enterprises on register" options={MAYBE} />
              <Field as="choice" name="hasChildren" label="Has children" options={MAYBE} />
            </WizardRowBody>
          </WizardRow>
        </WizardSectionBody>
      </WizardSection>

      <WizardSection>
        <WizardSectionHeader title="Finance" />
        <WizardSectionBody>
          <WizardRow title="Contract terms">
            <WizardRowBody>
              <Field as="percent" name="contractRate" label="Default contract terms rate" />
              <Field as="identifier" standard="id" name="contractRateTypeId" label="Contract terms rate type ID" />
            </WizardRowBody>
          </WizardRow>
          <WizardRow title="Payments">
            <WizardRowBody>
              <Field as="money" name="minimumPayment" label="Minimum payment" help="The smallest payout a payee of the enterprise is paid." />
              <Field as="choice" name="paymentProviderId" label="Default payment provider" options={PROVIDERS} />
            </WizardRowBody>
          </WizardRow>
          <WizardRow title="Mechanicals">
            <WizardRowBody>
              <Field as="choice" name="payMechanicals" label="Pay mechanicals" options={MAYBE} />
              <Field as="choice" name="payMechanicalsCoverOnly" label="Pay mechanicals only for cover songs" options={MAYBE} />
            </WizardRowBody>
          </WizardRow>
        </WizardSectionBody>
      </WizardSection>

      <WizardSection>
        <WizardSectionHeader title="Delivery" />
        <WizardSectionBody>
          <WizardRow title="Emails">
            <WizardRowBody>
              <Field as="choice" name="suppressDeliveryEmails" label="Suppress delivery emails" options={MAYBE} />
            </WizardRowBody>
          </WizardRow>
          <WizardRow title="Audio validation">
            <WizardRowBody>
              <Field as="choice" name="audioValidation" label="Enable audio validation" options={MAYBE} />
              <Field as="duration" name="audioValidationOffset" label="Audio validation offset" help="How far into a track validation starts." />
            </WizardRowBody>
          </WizardRow>
          <WizardRow title="Auto distribution">
            <WizardRowBody>
              <Field as="choice" name="autoDistroOptIn" label="Auto distribution opt-in" options={MAYBE} />
            </WizardRowBody>
          </WizardRow>
          <WizardRow title="ISRC">
            <WizardRowBody>
              <Field as="text" name="isrcPrefix" label="ISRC prefix" help="The country and registrant code its new ISRCs begin with." />
            </WizardRowBody>
          </WizardRow>
        </WizardSectionBody>
      </WizardSection>

      <WizardSection>
        <WizardSectionHeader title="Features" />
        <WizardSectionBody>
          <WizardRow title="Uploads">
            <WizardRowBody>
              <Field as="choice" name="filestack" label="Filestack access" options={choices(FILESTACK)} />
              <Field as="choice" name="useNse" label="Use NSE" options={MAYBE} />
            </WizardRowBody>
          </WizardRow>
          <WizardRow title="Analytics products">
            <WizardRowBody>
              <Field as="choice" name="trendsPremium" label="Trends premium" options={YES_NO} />
              <Field as="choice" name="revenuePremium" label="Revenue premium" options={YES_NO} />
              <Field as="choice" name="v1Trends" label="Has V1 trends" options={YES_NO} />
            </WizardRowBody>
          </WizardRow>
          <WizardRow title="Stores">
            <WizardRowBody>
              <Field as="choice" name="dspRestrictions" label="Has DSP restrictions" options={MAYBE} />
              <Field as="choice" name="syncAppleIds" label="Sync Apple IDs" options={MAYBE} />
            </WizardRowBody>
          </WizardRow>
        </WizardSectionBody>
      </WizardSection>

      <WizardSection>
        <WizardSectionHeader title="White label" />
        <WizardSectionBody>
          <WizardRow title="Emails it sends">
            <WizardRowBody>
              <Field as="email" name="outgoingEmail" label="Outgoing email address" />
              <Field as="text" name="senderName" label="Email sender's name" />
            </WizardRowBody>
          </WizardRow>
        </WizardSectionBody>
      </WizardSection>

      <WizardSection>
        <WizardSectionHeader title="Child enterprise" />
        <WizardSectionBody>
          {tenant ? null : (
            <WizardRow title="Parent">
              <WizardRowBody>
                <Field
                  as="record"
                  name="parent"
                  label="Parent enterprise"
                  entity="organization"
                  noun={{ one: "parent enterprise", many: "parent enterprises" }}
                  standard="id"
                  options={parents.map((one) => ({ value: one.enterpriseId, title: one.name, code: one.enterpriseId }))}
                />
              </WizardRowBody>
              <WizardRowTips>
                <WizardRowTip>Picking another moves the client account, and its payee, under that parent.</WizardRowTip>
              </WizardRowTips>
            </WizardRow>
          )}
          <WizardRow title="Read only by default">
            <WizardRowBody>
              <Field as="choice" name="readOnlyContent" label="Content" options={MAYBE} />
              <Field as="choice" name="readOnlyContracts" label="Contracts" options={MAYBE} />
              <Field as="choice" name="readOnlyFinance" label="Finance" options={MAYBE} />
              <Field as="choice" name="readOnlyDistribution" label="Distribution" options={MAYBE} />
              <Field as="choice" name="readOnlyPromote" label="Promote" options={MAYBE} />
              <Field as="choice" name="readOnlyDaily" label="Daily" options={MAYBE} />
              <Field as="choice" name="readOnlyServices" label="Services" options={MAYBE} />
            </WizardRowBody>
            <WizardRowTips>
              <WizardRowTip>What a client account's users may only read, until it is changed on the account.</WizardRowTip>
            </WizardRowTips>
          </WizardRow>
          <WizardRow title="Seen by default">
            <WizardRowBody>
              <Field as="choice" name="viewEarnings" label="Default view earnings" options={YES_NO} />
              <Field as="choice" name="viewAnalytics" label="Default view analytics" options={YES_NO} />
              <Field as="choice" name="viewBilling" label="Default view billing" options={YES_NO} />
              <Field as="choice" name="canInvite" label="Can invite team members" options={YES_NO} />
            </WizardRowBody>
          </WizardRow>
          <WizardRow title="Limits">
            <WizardRowBody>
              <Field as="text" name="maxArtists" label="Max artists" help="Left blank, there is no limit." />
              <Field as="choice" name="hideUserInfo" label="Hide user info tab" options={YES_NO} />
              <Field as="choice" name="canTakedown" label="Can take down" options={MAYBE} />
              <Field as="choice" name="vip" label="VIP" options={MAYBE} />
            </WizardRowBody>
          </WizardRow>
        </WizardSectionBody>
      </WizardSection>

      <WizardSection>
        <WizardSectionHeader title="Analytics" />
        <WizardSectionBody>
          <WizardRow title="V2 analytics">
            <WizardRowBody>
              <Field as="choice" name="analyticsEnabled" label="Analytics enabled (V2 and V3)" options={YES_NO} />
              <Field as="choice" name="trendsDays" label="Trends retention" options={days(TRENDS_DAYS)} />
              <Field as="choice" name="revenueDays" label="Revenue retention" options={days(REVENUE_DAYS)} />
            </WizardRowBody>
          </WizardRow>
          <WizardRow title="V3 analytics">
            <WizardRowBody>
              <Field as="choice" name="v3TrendsDays" label="V3 trends retention" options={days(V3_TRENDS_DAYS)} />
            </WizardRowBody>
          </WizardRow>
        </WizardSectionBody>
      </WizardSection>
    </Wizard>
  );
}
