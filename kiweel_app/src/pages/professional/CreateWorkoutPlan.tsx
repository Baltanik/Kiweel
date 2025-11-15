import { ProfessionalLayout } from "@/components/layout/ProfessionalLayout";
import { WorkoutPlanManager } from "@/components/professional/WorkoutPlanManager";

export default function CreateWorkoutPlan() {
  return (
    <ProfessionalLayout>
      <div className="p-6">
        <WorkoutPlanManager />
      </div>
    </ProfessionalLayout>
  );
}
