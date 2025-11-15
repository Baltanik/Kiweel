import { KiweelLayout } from "@/components/layout/KiweelLayout";
import { WorkoutPlanViewer } from "@/components/kiweel/WorkoutPlanViewer";

export default function Workout() {
  return (
    <KiweelLayout>
      <div className="p-4 pb-6">
        <WorkoutPlanViewer />
      </div>
    </KiweelLayout>
  );
}

