import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "@revelator/pro-ui/styles.css";
import { TodayProvider, type ShellPlace } from "@revelator/pro-ui";

import { CustomerDetail, customerPlace } from "./accounts/customer";
import { Customers } from "./accounts/customers";
import { TODAY } from "./accounts/mock";
import { useRoute, type Route } from "./route";
import { Frame } from "./shell";

/** Where the address puts the reader, for the frame the app draws around every page. */
function placeOf(route: Route): ShellPlace {
  if (route.name === "customer") return customerPlace(route);
  return { at: "Accounts", page: "Customers" };
}

function pageOf(route: Route) {
  // KEYED by the record, so a second customer opens fresh rather than inheriting the first's state.
  if (route.name === "customer")
    return <CustomerDetail key={route.id} id={route.id} facet={route.facet} />;
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
