import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Learn from "./pages/Learn";
import AITutor from "./pages/AITutor";
import MathGames from "./pages/MathGames";
import Certificates from "./pages/Certificates";
import LanguageLearning from "./pages/LanguageLearning";
import Quizes from "./pages/Quizes";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/learn/:childId" element={<Learn />} />
                <Route path="/ai-tutor/:childId" element={<AITutor />} />
                <Route path="/math-games/:childId" element={<MathGames />} />
                <Route path="/language-learning/:childId" element={<LanguageLearning />} />
                <Route path="/quizes/:childId" element={<Quizes />} />
                <Route path="/certificates/:childId" element={<Certificates />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/settings" element={<Settings />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
