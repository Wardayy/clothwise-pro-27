import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import AddPurchase from "@/pages/purchases/AddPurchase";
import PurchaseHistory from "@/pages/purchases/PurchaseHistory";
import SearchPurchase from "@/pages/purchases/SearchPurchase";
import RecordSale from "@/pages/sales/RecordSale";
import SalesHistory from "@/pages/sales/SalesHistory";
import SearchSale from "@/pages/sales/SearchSale";
import ViewStock from "@/pages/inventory/ViewStock";
import LowStock from "@/pages/inventory/LowStock";
import ProfitReport from "@/pages/revenue/ProfitReport";
import SalesAnalytics from "@/pages/revenue/SalesAnalytics";
import ManageCloth from "@/pages/master/ManageCloth";
import ManageFactory from "@/pages/master/ManageFactory";
import ManageCustomer from "@/pages/master/ManageCustomer";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/purchases/add" element={<AddPurchase />} />
              <Route path="/purchases/history" element={<PurchaseHistory />} />
              <Route path="/purchases/search" element={<SearchPurchase />} />
              <Route path="/sales/add" element={<RecordSale />} />
              <Route path="/sales/history" element={<SalesHistory />} />
              <Route path="/sales/search" element={<SearchSale />} />
              <Route path="/inventory" element={<ViewStock />} />
              <Route path="/inventory/low-stock" element={<LowStock />} />
              <Route path="/revenue" element={<ProfitReport />} />
              <Route path="/revenue/analytics" element={<SalesAnalytics />} />
              <Route path="/master/cloth" element={<ManageCloth />} />
              <Route path="/master/factory" element={<ManageFactory />} />
              <Route path="/master/customer" element={<ManageCustomer />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
