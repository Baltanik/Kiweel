import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { AuthProvider } from "./contexts/AuthContext";

// Core pages - loaded immediately
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Lazy loaded pages
const Specialisti = lazy(() => import("./pages/Home"));
const ClientDashboard = lazy(() => import("./pages/ClientDashboardNew"));
const MyKiweel = lazy(() => import("./pages/MyKiweel"));
const Progress = lazy(() => import("./pages/Progress"));
const Diet = lazy(() => import("./pages/Diet"));
const Workout = lazy(() => import("./pages/Workout"));
const SharedData = lazy(() => import("./pages/SharedData"));
const Missions = lazy(() => import("./pages/Missions"));
const Kiboard = lazy(() => import("./pages/KiweelFeed"));
const ProfessionalDetail = lazy(() => import("./pages/ProfessionalDetail"));
const Messages = lazy(() => import("./pages/Messages"));
const Chat = lazy(() => import("./pages/Chat"));
const Calendar = lazy(() => import("./pages/Calendar"));
const Profile = lazy(() => import("./pages/Profile"));
const Menu = lazy(() => import("./pages/Menu"));
const Signup = lazy(() => import("./pages/Signup"));
const OnboardingClient = lazy(() => import("./pages/OnboardingClient"));
const OnboardingPro = lazy(() => import("./pages/OnboardingPro"));
const ProDashboard = lazy(() => import("./pages/ProDashboard"));
const ProSettings = lazy(() => import("./pages/ProSettings"));
const ClientSettings = lazy(() => import("./pages/ClientSettings"));

// Professional pages (KIWEERIST) - lazy loaded
const ProfessionalProtectedRoute = lazy(() => import("./components/professional/ProfessionalProtectedRoute").then(module => ({ default: module.ProfessionalProtectedRoute })));
const ProfessionalDashboard = lazy(() => import("./pages/professional/ProfessionalDashboard"));
const ClientManagement = lazy(() => import("./pages/professional/ClientManagement"));
const CreateDietPlan = lazy(() => import("./pages/professional/CreateDietPlan"));
const CreateWorkoutPlan = lazy(() => import("./pages/professional/CreateWorkoutPlan"));
const BookingManagement = lazy(() => import("./pages/professional/BookingManagement"));

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
          <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
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
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
