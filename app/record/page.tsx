import RecordMeeting from "@/components/record-meeting"
import SidebarNav from "@/components/sidebar-nav"

export default function RecordPage() {
  return (
    <div className="flex h-screen bg-cream">
      {/* Sidebar */}
      <SidebarNav />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="border-b p-4 flex justify-between items-center border-blue/10">
          <div className="flex-1">
            <h1 className="text-lg font-medium text-navy">Record</h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full hover:bg-blue/10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-navy"
              >
                <path d="M12 2v1"></path>
                <path d="M12 21v1"></path>
                <path d="M4.22 4.22l.77.77"></path>
                <path d="M18.5 18.5l.77.77"></path>
                <path d="M2 12h1"></path>
                <path d="M21 12h1"></path>
                <path d="M4.22 19.78l.77-.77"></path>
                <path d="M18.5 5.5l.77-.77"></path>
              </svg>
            </button>
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
  )
}

