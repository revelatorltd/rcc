import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "@revelator/pro-ui/styles.css";
import { TodayProvider, type ShellPlace } from "@revelator/pro-ui";

import { CustomerDetail, customerPlace } from "./accounts/customer";
import { Customers } from "./accounts/customers";
import { TenantDetail, tenantPlace } from "./accounts/tenant";
import { Tenants } from "./accounts/tenants";
import { TODAY } from "./accounts/mock";
import { useRoute, type Route } from "./route";
import { Frame } from "./shell";

/** Where the address puts the reader, for the frame the app draws around every page. */
function placeOf(route: Route): ShellPlace {
  if (route.name === "customer") return customerPlace(route);
  if (route.name === "tenant") return tenantPlace(route);
  if (route.page === "tenants") return { at: "Accounts", page: "Tenants" };
  return { at: "Accounts", page: "Customers" };
}

function pageOf(route: Route) {
  // KEYED by the record, so a second customer opens fresh rather than inheriting the first's state.
  if (route.name === "customer")
    return <CustomerDetail key={route.id} id={route.id} facet={route.facet} />;
  if (route.name === "tenant") return <TenantDetail key={route.id} id={route.id} facet={route.facet} />;
  if (route.page === "tenants") return <Tenants />;
  return <Customers />;
}

function App() {
  const route = useRoute();
  return <Frame place={placeOf(route)}>{pageOf(route)}</Frame>;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TodayProvider date={TODAY}>
      <App />
    </TodayProvider>
  </StrictMode>,
);
