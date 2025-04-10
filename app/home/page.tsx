"use client"

import type React from "react"

import { useState } from "react"
import { Search, LinkIcon, Heart, Plus, Minus, Mic } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import KnowledgeCarousel from "@/components/knowledge-carousel"
import SidebarNav from "@/components/sidebar-nav"
import { getOtherUsersMeetings } from "@/lib/meeting-data"
import { sendChallengeToSolution } from "@/lib/generate-solution"

interface SearchResult {
  id: number;
  title: string;
  content: string;
  user_id: number;
  user_name: string;
}

export default function HomePage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<{
    summary: string;
    knowledges: SearchResult[];
  } | null>(null)
  const [expandedRefs, setExpandedRefs] = useState<number[]>([])
  const [likedRefs, setLikedRefs] = useState<number[]>([])
  const [showVoiceMessage, setShowVoiceMessage] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!searchQuery.trim()) return

    setIsSearching(true)

    try {
      const response = await sendChallengeToSolution(searchQuery)
      setSearchResults(response)
    } catch (error) {
      console.error('Error performing search:', error)
      setSearchResults(null)
    }
  }

  const toggleReference = (index: number) => {
    setExpandedRefs((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    )
  }

  const handleVoiceSearch = () => {
    setShowVoiceMessage(true)
    setTimeout(() => setShowVoiceMessage(false), 3000) // 3秒後にメッセージを非表示
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
                <button
                  type="button"
                  onClick={handleVoiceSearch}
                  className="p-3 text-blue hover:bg-blue/10 transition-colors"
                >
                  <Mic size={20} />
                </button>
                <button type="submit" className="p-3 bg-blue text-white hover:bg-blue/90 transition-colors">
                  検索
                </button>
              </div>
              {showVoiceMessage && (
                <div className="absolute top-full left-0 mt-2 bg-navy text-cream px-4 py-2 rounded-lg text-sm shadow-sm">
                  申し訳ありません。音声入力機能は開発中です
                </div>
              )}
            </form>

            {/* Search Results */}
            {isSearching && searchResults && (
              <div className="bg-blue/5 border border-blue/20 rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-navy mb-6">Results</h2>
                <p className="text-navy/90 leading-relaxed text-lg font-medium mb-6">
                  {searchResults.summary}
                </p>

                <div className="border-t border-blue/10 pt-4 mt-6">
                  <h3 className="text-navy font-medium flex items-center gap-2 mb-4">
                    <LinkIcon className="h-4 w-4" />
                    参考情報
                  </h3>

                  <div className="space-y-3">
                    {searchResults.knowledges.map((knowledge, index) => (
                      <div
                        key={index}
                        className="bg-white rounded-lg border border-blue/10 overflow-hidden"
                      >
                        <div className="p-3 flex justify-between items-center">
                          <h4 className="text-blue font-medium">
                            {knowledge.title}
                          </h4>
                          <button
                            onClick={() => toggleReference(index)}
                            className="flex items-center justify-center w-6 h-6 rounded-full bg-blue/10 hover:bg-blue/20 text-blue transition-colors"
                          >
                            {expandedRefs.includes(index) ? (
                              <Minus size={14} />
                            ) : (
                              <Plus size={14} />
                            )}
                          </button>
                        </div>

                        {expandedRefs.includes(index) && (
                          <div className="p-3 pt-0 border-t border-blue/10 animate-in fade-in slide-in-from-top-2 duration-200">
                            <p className="text-navy/70 text-sm whitespace-pre-wrap">
                              {knowledge.content}
                            </p>
                            <div className="mt-3 pt-3 border-t border-blue/5 flex justify-between items-center">
                              <p className="text-xs text-navy/60">
                                Knowledge by: {knowledge.user_name}
                              </p>
                              <button 
                                className="flex items-center gap-1 text-red-500 hover:text-red-600 transition-colors"
                                onClick={() => {
                                  setLikedRefs(prev => 
                                    prev.includes(index) 
                                      ? prev.filter(i => i !== index)
                                      : [...prev, index]
                                  );
                                }}
                              >
                                <Heart 
                                  size={14} 
                                  fill={likedRefs.includes(index) ? "currentColor" : "none"}
                                />
                                <span className="text-xs">Thanks</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {isSearching && !searchResults && (
              <div className="text-center py-8">
                <p className="text-navy/70">検索中...</p>
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

