import { KiweelLayout } from "@/components/layout/KiweelLayout";
import { SharedDataViewer } from "@/components/kiweel/SharedDataViewer";

export default function SharedData() {
  return (
    <KiweelLayout>
      <div className="p-4 pb-6">
        <SharedDataViewer />
      </div>
    </KiweelLayout>
  );
}

