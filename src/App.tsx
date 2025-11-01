import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { ConverterProvider } from "@/contexts/ConverterContext";
import InputPage from "./pages/InputPage";
import SelectPage from "./pages/SelectPage";
import OutputPage from "./pages/OutputPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-right" />
        <BrowserRouter>
          <ConverterProvider>
            <Routes>
              <Route path="/" element={<InputPage />} />
              <Route path="/select" element={<SelectPage />} />
              <Route path="/output" element={<OutputPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ConverterProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
