"use client";

import { Mic, Upload, Droplets, Heart, LogOut } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { getLatestMeetings, type Meeting } from "@/lib/meeting-data"
import { useEffect, useState } from "react"

export default function SidebarNav({ activeId }: { activeId?: number }) {
  const router = useRouter()
  const [userMeetings, setUserMeetings] = useState<Meeting[]>([])

  useEffect(() => {
    const fetchMeetings = async () => {
      const meetings = await getLatestMeetings()
      setUserMeetings(meetings)
    }
    fetchMeetings()
  }, [])

  // Mock total thanks count - in a real app, this would come from your backend
  const totalThanks = 42;

  const handleLogout = () => {
    // Clear authentication
    localStorage.removeItem("isAuthenticated");
    // Redirect to login
    router.push("/login");
  };

  return (
    <div className="w-64 border-r bg-navy text-cream flex flex-col h-full">
      {/* App Name */}
      <div className="p-4 border-b border-blue/20">
        <Link href="/home">
          <div className="flex items-center gap-2">
            <Droplets size={22} className="text-blue" />
            <h2 className="font-bold text-lg text-cream">Flowledge</h2>
          </div>
        </Link>
      </div>

      {/* Thanks Count - Now as a button */}
      <div className="p-3 border-b border-blue/20">
        <Link href="/dashboard">
          <button className="flex items-center gap-2 text-cream/80 hover:text-cream w-full py-2 px-3 rounded-md hover:bg-blue/20 transition-colors">
            <Heart size={16} />
            <span className="text-sm">{totalThanks} thanks received</span>
          </button>
        </Link>
      </div>

      {/* Action Buttons - with more space between them */}
      <div className="p-3 pt-6 pb-6 space-y-6">
        <Link href="/record">
          <button className="w-full bg-blue text-cream rounded-md py-2 px-4 flex items-center justify-center gap-2 hover:bg-blue/90 transition-colors">
            <Mic size={18} />
            <span>Record</span>
          </button>
        </Link>
        <Link href="/upload">
          <button className="w-full bg-yellow text-navy rounded-md py-2 px-4 flex items-center justify-center gap-2 hover:bg-yellow/90 transition-colors">
            <Upload size={18} />
            <span>Upload</span>
          </button>
        </Link>
      </div>

      {/* User's Own Meetings/Documents */}
      <div className="flex-1 overflow-auto">
        <div className="p-2">
          <h3 className="text-xs font-medium text-cream/70 px-3 py-2">
            マイナレッジ
          </h3>
          {Object.entries(
            userMeetings.reduce(
              (acc: Record<string, Meeting[]>, meeting: Meeting) => {
                if (!acc[meeting.date]) {
                  acc[meeting.date] = []
                }
                acc[meeting.date].push(meeting)
                return acc
              },
              {} as Record<string, typeof userMeetings>,
            ),
          ).map(([date, meetings]) => (
            <div key={date} className="mb-4">
              <h3 className="text-xs font-medium text-cream/70 px-3 py-2">
                {date}
              </h3>
              <ul className="space-y-1">
                {meetings.map((meeting) => (
                  <li key={meeting.id}>
                    <Link
                      href={`/meeting/${meeting.id}`}
                      className={cn(
                        "block px-3 py-2 rounded-md hover:bg-blue/20 text-sm transition-colors",
                        activeId === meeting.id && "bg-blue/30 font-medium"
                      )}
                    >
                      {meeting.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-blue/20">
        <div className="flex flex-col space-y-2">
          <button className="w-full text-sm text-cream/70 hover:text-cream py-2 px-3 rounded-md text-left flex items-center gap-2 hover:bg-blue/20 transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <span>ヘルプと設定</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full text-sm text-cream/70 hover:text-cream py-2 px-3 rounded-md text-left flex items-center gap-2 hover:bg-red-500/20 transition-colors"
          >
            <LogOut size={16} />
            <span>ログアウト</span>
          </button>
        </div>
      </div>
    </div>
  );
}
