import { ProfessionalLayout } from "@/components/layout/ProfessionalLayout";
import { DietPlanManager } from "@/components/professional/DietPlanManager";

export default function CreateDietPlan() {
  return (
    <ProfessionalLayout>
      <div className="p-6">
        <DietPlanManager />
      </div>
    </ProfessionalLayout>
  );
}
