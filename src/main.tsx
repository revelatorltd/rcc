import { StrictMode, type ReactNode } from "react";
import { createRoot } from "react-dom/client";

import "@revelator/pro-ui/styles.css";
import { TodayProvider, type ShellPlace } from "@revelator/pro-ui";

import { CustomerDetail, customerPlace } from "./accounts/customer";
import { AddSubscription } from "./accounts/add-subscription";
import { CustomerWizard } from "./accounts/customer-form";
import { Customers } from "./accounts/customers";
import { EnterpriseDetail, enterprisePlace } from "./accounts/enterprise";
import { Enterprises } from "./accounts/enterprises";
import { PartnerDetail, partnerPlace } from "./accounts/partner";
import { NewPartner, Partners } from "./accounts/partners";
import { SignUpTenant } from "./accounts/sign-up-tenant";
import { TenantDetail, tenantPlace } from "./accounts/tenant";
import { ApiPartner, EditEnterprise, ImportChildren, TenantConfiguration, WhiteLabelForm } from "./accounts/tenant-forms";
import { Tenants } from "./accounts/tenants";
import { TODAY, useFixtures } from "./accounts/mock";
import { useRoute, type AccountsPage, type Route } from "./route";
import { Frame } from "./shell";

/** Each Accounts page, by the name its nav entry gives it. */
const PAGE_NAMES: Record<AccountsPage, string> = {
  customers: "Customers",
  tenants: "Tenants",
  enterprises: "Enterprises",
  partners: "Partners",
  payees: "Payees",
  users: "Users",
  "white-labels": "White labels",
};

/** Where the address puts the reader, for the frame the app draws around every page. */
function placeOf(route: Route): ShellPlace {
  if (route.name === "customer") return customerPlace(route);
  if (route.name === "tenant") return tenantPlace(route);
  if (route.name === "enterprise") return enterprisePlace(route);
  if (route.name === "partner") return partnerPlace(route);
  if (route.name === "accounts") return { at: "Accounts", page: PAGE_NAMES[route.page] };
  return { at: "Accounts", page: "Customers" };
}

/**
 * A form that COVERS the shell — a wizard is finished or left, so the frame and its dozen ways
 * elsewhere are not drawn under it. Keyed by its address, so a second opening begins afresh.
 */
function coverOf(route: Route): ReactNode {
  if (route.name === "new-customer") return <CustomerWizard key="new" />;
  if (route.name === "new-partner") return <NewPartner key="new" />;
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
  // KEYED by the record, so a second customer opens fresh rather than inheriting the first's state.
  if (route.name === "customer")
    return <CustomerDetail key={route.id} id={route.id} facet={route.facet} />;
  if (route.name === "tenant") return <TenantDetail key={route.id} id={route.id} facet={route.facet} />;
  if (route.name === "enterprise") return <EnterpriseDetail key={route.id} id={route.id} facet={route.facet} />;
  if (route.name === "partner") return <PartnerDetail key={route.id} id={route.id} facet={route.facet} />;
  if (route.name === "accounts" && route.page === "tenants") return <Tenants />;
  if (route.name === "accounts" && route.page === "enterprises") return <Enterprises />;
  if (route.name === "accounts" && route.page === "partners") return <Partners />;
  return <Customers />;
}

function App() {
  const route = useRoute();
  // Whatever a form wrote, every page draws again from the fixtures as they now are.
  useFixtures();
  return coverOf(route) ?? <Frame place={placeOf(route)}>{pageOf(route)}</Frame>;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TodayProvider date={TODAY}>
      <App />
    </TodayProvider>
  </StrictMode>,
);
