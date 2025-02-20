import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";
import "./index.css";
import { Toaster } from "sonner";
import { BrowserRouter, Routes, Route } from "react-router";
import EnquiryList from "./pages/enquiries/EnquiryList.tsx";
import EnquiryDetail from "./pages/enquiries/EnquiryDetail.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Theme>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="enquiries" element={<EnquiryList />} />
          <Route
            path="enquiries/detail/:salesEnquiryId"
            element={<EnquiryDetail />}
          />
        </Routes>
      </BrowserRouter>

      <Toaster position="top-right" />
    </Theme>
  </StrictMode>
);
