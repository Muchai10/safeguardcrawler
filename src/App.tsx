import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

import Reviews from "./pages/Reviews";
import News from "./pages/News";
import CategoryPage from "./pages/CategoryPage";
import Socials from "./pages/Socials";

const queryClient = new QueryClient();


const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Index />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/news" element={<News />} />
          <Route path="/socials" element={<Socials />} />
        <Route path="/category/:category" element={<CategoryPage />} />
        <Route path="/source/:source" element={<CategoryPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
