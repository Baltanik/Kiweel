import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Specialisti from "./pages/Home";
import Index from "./pages/Index";
import ClientDashboard from "./pages/ClientDashboardNew";
import MyKiweel from "./pages/MyKiweel";
import Progress from "./pages/Progress";
import Diet from "./pages/Diet";
import Workout from "./pages/Workout";
import SharedData from "./pages/SharedData";
import Missions from "./pages/Missions";
import Kiboard from "./pages/KiweelFeed";
import ProfessionalDetail from "./pages/ProfessionalDetail";
import Messages from "./pages/Messages";
import Chat from "./pages/Chat";
import Calendar from "./pages/Calendar";
import Profile from "./pages/Profile";
import Menu from "./pages/Menu";
import Auth from "./pages/Auth";
import Signup from "./pages/Signup";
import OnboardingClient from "./pages/OnboardingClient";
import OnboardingPro from "./pages/OnboardingPro";
import ProDashboard from "./pages/ProDashboard";
import ProSettings from "./pages/ProSettings";
import ClientSettings from "./pages/ClientSettings";
import NotFound from "./pages/NotFound";

// Professional pages (KIWEERIST)
import { ProfessionalProtectedRoute } from "./components/professional/ProfessionalProtectedRoute";
import ProfessionalDashboard from "./pages/professional/ProfessionalDashboard";
import ClientManagement from "./pages/professional/ClientManagement";
import CreateDietPlan from "./pages/professional/CreateDietPlan";
import CreateWorkoutPlan from "./pages/professional/CreateWorkoutPlan";
import BookingManagement from "./pages/professional/BookingManagement";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/discover" element={<Specialisti />} />
            <Route path="/home" element={<Specialisti />} />
            <Route path="/dashboard" element={<ClientDashboard />} />
            <Route path="/mykiweel" element={<MyKiweel />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/diet" element={<Diet />} />
            <Route path="/workout" element={<Workout />} />
            <Route path="/shared-data" element={<SharedData />} />
            <Route path="/missions" element={<Missions />} />
            <Route path="/feed" element={<Kiboard />} />
            <Route path="/rewall" element={<Kiboard />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/onboarding/client" element={<OnboardingClient />} />
            <Route path="/onboarding/pro" element={<OnboardingPro />} />
            <Route path="/pro/dashboard" element={<ProDashboard />} />
            <Route path="/pro/settings" element={<ProSettings />} />
            <Route path="/settings" element={<ClientSettings />} />
            
            {/* Professional KIWEERIST Routes */}
            <Route path="/pro/dashboard-new" element={
              <ProfessionalProtectedRoute>
                <ProfessionalDashboard />
              </ProfessionalProtectedRoute>
            } />
            <Route path="/pro/clients" element={
              <ProfessionalProtectedRoute>
                <ClientManagement />
              </ProfessionalProtectedRoute>
            } />
            <Route path="/pro/plans/create/diet" element={
              <ProfessionalProtectedRoute>
                <CreateDietPlan />
              </ProfessionalProtectedRoute>
            } />
            <Route path="/pro/plans/create/workout" element={
              <ProfessionalProtectedRoute>
                <CreateWorkoutPlan />
              </ProfessionalProtectedRoute>
            } />
            <Route path="/pro/bookings" element={
              <ProfessionalProtectedRoute>
                <BookingManagement />
              </ProfessionalProtectedRoute>
            } />
            <Route path="/professional/:id" element={<ProfessionalDetail />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/chat/:userId" element={<Chat />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/menu" element={<Menu />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
