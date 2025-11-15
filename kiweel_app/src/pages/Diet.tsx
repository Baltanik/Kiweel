import { KiweelLayout } from "@/components/layout/KiweelLayout";
import { DietPlanViewer } from "@/components/kiweel/DietPlanViewer";
import { MealPlanner } from "@/components/kiweel/MealPlanner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDietPlans } from "@/hooks/useDietPlans";
import { useAuth } from "@/contexts/AuthContext";

export default function Diet() {
  const { user } = useAuth();
  const { dietPlans } = useDietPlans({ clientId: user?.id });
  const activeDietPlan = dietPlans.find(plan => plan.status === 'active');

  return (
    <KiweelLayout>
      <div className="p-4 pb-6">
        <Tabs defaultValue="plan" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="plan">Piano Dieta</TabsTrigger>
            <TabsTrigger value="planner">Pianifica Pasti</TabsTrigger>
          </TabsList>
          <TabsContent value="plan" className="mt-4">
            <DietPlanViewer />
          </TabsContent>
          <TabsContent value="planner" className="mt-4">
            <MealPlanner dietPlan={activeDietPlan} />
          </TabsContent>
        </Tabs>
      </div>
    </KiweelLayout>
  );
}

