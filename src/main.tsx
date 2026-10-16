import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "@revelator/pro-ui/styles.css";
import { TodayProvider } from "@revelator/pro-ui";

import { Customers } from "./accounts/customers";
import { TODAY } from "./accounts/mock";
import { useRoute } from "./route";
import { Frame } from "./shell";

function App() {
  useRoute();
  return (
    <Frame place={{ at: "Accounts", page: "Customers" }}>
      <Customers />
    </Frame>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TodayProvider date={TODAY}>
      <App />
    </TodayProvider>
  </StrictMode>,
);
