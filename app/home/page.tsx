"use client"

import type React from "react"

import { useState } from "react"
import { Search } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import KnowledgeCarousel from "@/components/knowledge-carousel"
import SidebarNav from "@/components/sidebar-nav"
import SearchResults from "@/components/search-results"
//削除　import { getOtherUsersMeetings } from "@/lib/meeting-data"

export default function HomePage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!searchQuery.trim()) return

    setIsSearching(true)
    setSearchResults([]) //検索結果をリセット（空にする）古い検索結果を消して、新しい結果を準備するため

    try {
      const res = await fetch("https://your-backend-api-url/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: searchQuery }),
      })
  
      if (!res.ok) {
        throw new Error("検索APIエラー")
      }
  
      const data = await res.json()
      setSearchResults(data.results)
    } catch (error) {
      console.error("RAG検索エラー:", error)
    }
  }

    // For this demo, we'll simulate search by filtering meetings from other users
    //削除 const otherUsersMeetings = getOtherUsersMeetings()

    // Simple search implementation that checks if the query appears in title, summary, knowledge, or tags
    const results = otherUsersMeetings
      .filter(
        (meeting) =>
          meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          meeting.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
          meeting.knowledge.toLowerCase().includes(searchQuery.toLowerCase()) ||
          meeting.knowledgeTags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
          meeting.challengeTags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
      )
      .map((meeting) => ({
        id: meeting.id,
        title: meeting.title,
        summary: meeting.summary.substring(0, 120) + (meeting.summary.length > 120 ? "..." : ""),
        isDocument: meeting.isDocument,
        author: meeting.owner.split("@")[0], // Simple way to get username from email
        tags: [...meeting.knowledgeTags], // Include tags in search results
        // Calculate a simple relevance score based on how many times the query appears
        relevance:
          (meeting.title.toLowerCase().split(searchQuery.toLowerCase()).length - 1) * 3 +
          (meeting.summary.toLowerCase().split(searchQuery.toLowerCase()).length - 1) * 2 +
          (meeting.knowledge.toLowerCase().split(searchQuery.toLowerCase()).length - 1) +
          meeting.knowledgeTags.filter((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())).length * 4 +
          meeting.challengeTags.filter((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())).length * 3,
      }))

    // Sort by relevance
    results.sort((a, b) => b.relevance - a.relevance)

    setSearchResults(results)
  }

  const handleVoiceSearch = () => {
    // In a real app, this would trigger voice recognition
    alert("音声検索機能は現在開発中です。")
  }

  return (
    <div className="flex h-screen bg-cream">
      {/* Sidebar */}
      <SidebarNav />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="border-b p-4 flex justify-between items-center bg-cream border-blue/10">
          <div className="flex-1"></div>
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
            <Link href="/account">
              <div className="w-8 h-8 rounded-full bg-navy text-cream flex items-center justify-center cursor-pointer">
                <span className="text-sm font-medium">U</span>
              </div>
            </Link>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6 flex flex-col items-center">
          <div className="max-w-3xl w-full space-y-12">
            <div className="text-center space-y-4">
              <h1 className="text-3xl font-bold tracking-tight text-navy">Flowledge</h1>
              <p className="text-navy/70">ナレッジを検索するか、新しい会議を記録しましょう</p>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative">
              <div className="flex items-center border border-blue/20 rounded-lg overflow-hidden bg-white shadow-sm">
                <div className="pl-3 text-blue">
                  <Search size={20} />
                </div>
                <input
                  type="text"
                  placeholder="ナレッジを検索..."
                  className="flex-1 py-3 px-4 bg-transparent outline-none w-full text-navy"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="button" onClick={handleVoiceSearch} className="p-3 bg-blue/10 border-l border-blue/20">
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
                    className="text-blue"
                  >
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                    <line x1="12" x2="12" y1="19" y2="22"></line>
                  </svg>
                </button>
              </div>
            </form>

            {/* Search Results */}
            {isSearching && searchResults.length > 0 && <SearchResults results={searchResults} query={searchQuery} />}

            {isSearching && searchResults.length === 0 && (
              <div className="text-center py-8">
                <p className="text-navy/70">「{searchQuery}」に一致するナレッジが見つかりませんでした。</p>
              </div>
            )}

            {/* Knowledge Carousel - Only show when not searching */}
            {!isSearching && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-navy">最近共有されたナレッジ</h2>
                <KnowledgeCarousel />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

