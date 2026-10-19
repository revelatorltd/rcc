import { StrictMode, type ReactNode } from "react";
import { createRoot } from "react-dom/client";

import "@revelator/pro-ui/styles.css";
import { TodayProvider, type ShellPlace } from "@revelator/pro-ui";

import { CustomerDetail, customerPlace } from "./accounts/customer";
import { AddSubscription } from "./accounts/add-subscription";
import { CustomerWizard } from "./accounts/customer-form";
import { Customers } from "./accounts/customers";
import { EnterpriseDetail, enterprisePlace } from "./accounts/enterprise";
import { Clients } from "./accounts/clients";
import { Enterprises } from "./accounts/enterprises";
import { PartnerDetail, partnerPlace } from "./accounts/partner";
import { NewPartner, Partners } from "./accounts/partners";
import { PayeeDetail, payeePlace } from "./accounts/payee";
import { Payees } from "./accounts/payees";
import { UserDetail, userPlace } from "./accounts/user";
import { EditUser, Users } from "./accounts/users";
import { WhiteLabelDetail, whiteLabelPlace } from "./accounts/white-label";
import { WhiteLabelWizard, WhiteLabels } from "./accounts/white-labels";
import { SignUpTenant } from "./accounts/sign-up-tenant";
import { TenantDetail, tenantPlace } from "./accounts/tenant";
import { ApiPartner, ImportChildren, TenantConfiguration, WhiteLabelForm } from "./accounts/tenant-forms";
import { EditEnterprise } from "./accounts/enterprise-form";
import { Tenants } from "./accounts/tenants";
import { TODAY, useFixtures } from "./accounts/mock";
import { AccessGroupDetail, accessGroupPlace } from "./platform/access-group";
import { AccessGroupWizard, NewOrganization, TenantGroupWizard } from "./platform/forms";
import { usePlatform } from "./platform/mock";
import { OrganizationDetail, organizationPlace } from "./platform/organization";
import { AccessGroups, Organizations, People, TenantGroups } from "./platform/pages";
import { PersonDetail, personPlace } from "./platform/person";
import type { PlatformPage, PlatformRoute } from "./platform/route";
import { TenantGroupDetail, tenantGroupPlace } from "./platform/tenant-group";
import { accountsHref, useRoute, whiteLabelHref, type AccountsPage, type Route } from "./route";
import { Frame } from "./shell";

/** Each Accounts page, by the name its nav entry gives it. */
const PAGE_NAMES: Record<AccountsPage, string> = {
  customers: "Customers",
  tenants: "Tenants",
  clients: "Clients",
  enterprises: "Enterprises",
  partners: "Partners",
  payees: "Payees",
  users: "Users",
  "white-labels": "White labels",
};

/** Each of the enterprise's access destinations, by the name its rail entry gives it. */
const PLATFORM_NAMES: Record<PlatformPage, string> = {
  organizations: "Organizations",
  "tenant-groups": "Tenant groups",
  "access-groups": "Access groups",
  people: "People",
};

/** Where the access destinations put the reader — each its own place on the rail. */
function platformPlaceOf(route: PlatformRoute): ShellPlace {
  switch (route.name) {
    case "organization":
      return organizationPlace(route);
    case "tenant-group":
      return tenantGroupPlace(route);
    case "access-group":
      return accessGroupPlace(route);
    case "person":
      return personPlace(route);
    case "index":
      return { at: PLATFORM_NAMES[route.page] };
    default:
      return { at: "Organizations" };
  }
}

/** An access destination's page, or the form covering the shell. */
function platformPageOf(route: PlatformRoute): { cover?: ReactNode; page?: ReactNode } {
  switch (route.name) {
    case "index":
      return {
        page: { organizations: <Organizations />, "tenant-groups": <TenantGroups />, "access-groups": <AccessGroups />, people: <People /> }[route.page],
      };
    case "organization":
      return { page: <OrganizationDetail key={`${route.id}/${route.facet}`} id={route.id} facet={route.facet} /> };
    case "tenant-group":
      return { page: <TenantGroupDetail key={`${route.id}/${route.facet}`} id={route.id} facet={route.facet} /> };
    case "access-group":
      return { page: <AccessGroupDetail key={`${route.id}/${route.facet}`} id={route.id} facet={route.facet} /> };
    case "person":
      return { page: <PersonDetail key={`${route.id}/${route.facet}`} id={route.id} facet={route.facet} /> };
    case "new-organization":
      return { cover: <NewOrganization key="new" /> };
    case "new-tenant-group":
      return { cover: <TenantGroupWizard key={`new-${route.scope}`} scope={route.scope} /> };
    case "edit-tenant-group":
      return { cover: <TenantGroupWizard key={route.id} id={route.id} /> };
    case "new-access-group":
      return { cover: <AccessGroupWizard key={`new-${route.scope}-${route.target ?? ""}`} scope={route.scope} target={route.target} /> };
    case "edit-access-group":
      return { cover: <AccessGroupWizard key={route.id} id={route.id} /> };
    case "duplicate-access-group":
      return { cover: <AccessGroupWizard key={`copy-${route.id}`} id={route.id} duplicate /> };
  }
}

/** Where the address puts the reader, for the frame the app draws around every page. */
function placeOf(route: Route): ShellPlace {
  if (route.name === "platform") return platformPlaceOf(route.route);
  if (route.name === "customer") return customerPlace(route);
  if (route.name === "tenant") return tenantPlace(route);
  if (route.name === "enterprise") return enterprisePlace(route);
  if (route.name === "partner") return partnerPlace(route);
  if (route.name === "payee") return payeePlace(route);
  if (route.name === "user") return userPlace(route);
  if (route.name === "white-label") return whiteLabelPlace(route);
  if (route.name === "accounts") return { at: "Accounts", page: PAGE_NAMES[route.page] };
  return { at: "Accounts", page: "Customers" };
}

/**
 * A form that COVERS the shell — a wizard is finished or left, so the frame and its dozen ways
 * elsewhere are not drawn under it. Keyed by its address, so a second opening begins afresh.
 */
function coverOf(route: Route): ReactNode {
  if (route.name === "platform") return platformPageOf(route.route).cover ?? null;
  if (route.name === "new-customer") return <CustomerWizard key="new" />;
  if (route.name === "new-partner") return <NewPartner key="new" />;
  if (route.name === "edit-user") return <EditUser key={route.id} id={route.id} />;
  if (route.name === "edit-enterprise") return <EditEnterprise key={route.id} id={route.id} />;
  if (route.name === "new-white-label") return <WhiteLabelWizard key="new" back={accountsHref("white-labels")} />;
  if (route.name === "edit-white-label")
    return <WhiteLabelWizard key={route.id} id={route.id} back={whiteLabelHref(route.id)} />;
  if (route.name === "customer-form" && route.form === "edit") return <CustomerWizard key={route.id} customerId={route.id} />;
  if (route.name === "customer-form") return <AddSubscription key={route.id} customerId={route.id} />;
  if (route.name === "sign-up-tenant") return <SignUpTenant key={route.customerId ?? "any"} customerId={route.customerId} />;
  if (route.name === "tenant-form") {
    const key = `${route.id}/${route.form}`;
    switch (route.form) {
      case "edit":
        return <EditEnterprise key={key} id={route.id} />;
      case "configure":
      case "convert":
        return <TenantConfiguration key={key} id={route.id} convert={route.form === "convert"} />;
      case "new-white-label":
      case "edit-white-label":
        return <WhiteLabelForm key={key} id={route.id} />;
      case "new-partner":
        return <ApiPartner key={key} id={route.id} />;
      case "import":
        return <ImportChildren key={key} id={route.id} />;
    }
  }
  return null;
}

function pageOf(route: Route) {
  if (route.name === "platform") return platformPageOf(route.route).page;
  // KEYED by the record AND its facet: a second record opens fresh, and so does each facet — an index
  // keeps the narrowing it began with, and one facet's filters are not the next one's.
  if (route.name === "customer")
    return <CustomerDetail key={`${route.id}/${route.facet}`} id={route.id} facet={route.facet} />;
  if (route.name === "tenant") return <TenantDetail key={`${route.id}/${route.facet}`} id={route.id} facet={route.facet} />;
  if (route.name === "enterprise") return <EnterpriseDetail key={`${route.id}/${route.facet}`} id={route.id} facet={route.facet} />;
  if (route.name === "partner") return <PartnerDetail key={`${route.id}/${route.facet}`} id={route.id} facet={route.facet} />;
  if (route.name === "payee") return <PayeeDetail key={`${route.id}/${route.facet}`} id={route.id} facet={route.facet} />;
  if (route.name === "user") return <UserDetail key={`${route.id}/${route.facet}`} id={route.id} facet={route.facet} />;
  if (route.name === "white-label") return <WhiteLabelDetail key={`${route.id}/${route.facet}`} id={route.id} facet={route.facet} />;
  if (route.name === "accounts" && route.page === "tenants") return <Tenants />;
  if (route.name === "accounts" && route.page === "clients") return <Clients />;
  if (route.name === "accounts" && route.page === "enterprises") return <Enterprises />;
  if (route.name === "accounts" && route.page === "partners") return <Partners />;
  if (route.name === "accounts" && route.page === "payees") return <Payees />;
  if (route.name === "accounts" && route.page === "users") return <Users />;
  if (route.name === "accounts" && route.page === "white-labels") return <WhiteLabels />;
  return <Customers />;
}

function App() {
  const route = useRoute();
  // Whatever a form wrote, every page draws again from the fixtures as they now are.
  useFixtures();
  usePlatform();
  return coverOf(route) ?? <Frame place={placeOf(route)}>{pageOf(route)}</Frame>;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TodayProvider date={TODAY}>
      <App />
    </TodayProvider>
  </StrictMode>,
);
