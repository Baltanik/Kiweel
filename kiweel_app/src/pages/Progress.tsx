import { KiweelLayout } from "@/components/layout/KiweelLayout";
import { ProgressTracker } from "@/components/kiweel/ProgressTracker";

export default function Progress() {
  return (
    <KiweelLayout>
      <div className="p-4 pb-6">
        <ProgressTracker />
      </div>
    </KiweelLayout>
  );
}

