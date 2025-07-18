import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Browse from "./pages/Browse";
import MotifBrowse from "./pages/MotifBrowse";
import UnifiedBrowse from "./pages/UnifiedBrowse";
import ProteinDetails from "./pages/ProteinDetails";
import BlastSearch from "./pages/BlastSearch";
import Documentation from "./pages/Documentation";
import NotFound from "./pages/NotFound";
import DatabaseAnalysis from "./pages/DatabaseAnalysis";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        {" "}
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/browse" element={<UnifiedBrowse />} />
          {/* Legacy routes for backward compatibility */}
          <Route path="/browse/experimental" element={<Browse />} />
          <Route path="/browse/motif" element={<MotifBrowse />} />
          <Route path="/motif-browse" element={<MotifBrowse />} />
          <Route path="/blast" element={<BlastSearch />} />
          <Route path="/docs" element={<Documentation />} />
          <Route path="/database-analysis" element={<DatabaseAnalysis />} />
          <Route path="/protein/:id" element={<ProteinDetails />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
