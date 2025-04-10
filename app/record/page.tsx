import RecordMeeting from "@/components/record-meeting";
import SidebarNav from "@/components/sidebar-nav";

export default function RecordPage() {
  return (
    <div className="flex h-screen bg-cream">
      {/* Sidebar */}
      <SidebarNav />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="border-b p-4 flex justify-between items-center border-blue/10">
          <div className="flex-1">
            <h1 className="text-lg font-medium text-navy mb-2">Record</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-navy text-cream flex items-center justify-center cursor-pointer">
              <span className="text-sm font-medium">U</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6">
          <RecordMeeting />
        </div>
      </main>
    </div>
  );
}
