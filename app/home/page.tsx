"use client" // クライアントコンポーネントであることを明示

import React, { useState } from "react"
import { Search } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import KnowledgeCarousel from "@/components/knowledge-carousel"
import SidebarNav from "@/components/sidebar-nav"
import SearchResults from "@/components/search-results"
import { searchKnowledgeWithRAG } from "@/lib/meeting-data"

// 検索結果の型定義（APIレスポンスの構造）
interface SearchResult {
  id: string
  title: string
  content: string
  relevance: number
  tags: string[]
  author: string
  createdAt: string
}

export default function HomePage() {
  const router = useRouter()

  // ユーザーが入力した検索クエリ
  const [searchQuery, setSearchQuery] = useState("")

  // 検索中かどうかの状態
  const [isSearching, setIsSearching] = useState(false)

  // 検索結果（KnowledgeReferenceの一覧）
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])

  // 検索フォーム送信時の処理（RAG検索の実行）
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!searchQuery.trim()) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    setSearchResults([]) // 前回の検索結果をクリア

    try {
      // RAG検索を実行
      const ragResults = searchKnowledgeWithRAG(searchQuery)

      // 検索結果を整形
      const formattedResults: SearchResult[] = ragResults.map((item) => ({
        id: item.id.toString(),
        title: item.title,
        content: item.knowledge,
        relevance: item.relevance,
        tags: [], // タグは現在の実装では使用しない
        author: item.owner.split('@')[0], // メールアドレスからユーザー名を抽出
        createdAt: item.date
      }))

      setSearchResults(formattedResults)
    } catch (error) {
      console.error("RAG検索エラー:", error)
    } finally {
      setIsSearching(false)
    }
  }

  // 音声検索ボタンを押したときの処理（現在は仮）
  const handleVoiceSearch = () => {
    alert("音声検索機能は現在開発中です。")
  }

  // 検索バーがクリアされたときの処理
  const handleSearchClear = () => {
    setSearchQuery("")
    setSearchResults([])
    setIsSearching(false)
  }

  return (
    <div className="flex h-screen bg-cream">
      {/* サイドバー */}
      <SidebarNav />

      {/* メインコンテンツ */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* ヘッダー */}
        <header className="border-b p-4 flex justify-between items-center bg-cream border-blue/10">
          <div className="flex-1"></div>
          <div className="flex items-center gap-4">
            {/* アイコン（未使用） */}
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

            {/* アカウントリンク */}
            <Link href="/account">
              <div className="w-8 h-8 rounded-full bg-navy text-cream flex items-center justify-center cursor-pointer">
                <span className="text-sm font-medium">U</span>
              </div>
            </Link>
          </div>
        </header>

        {/* コンテンツエリア */}
        <div className="flex-1 overflow-auto p-6 flex flex-col items-center">
          <div className="max-w-3xl w-full space-y-12">
            {/* タイトルと説明 */}
            <div className="text-center space-y-4">
              <h1 className="text-3xl font-bold tracking-tight text-navy">Flowledge</h1>
              <p className="text-navy/70">ナレッジを検索するか、新しい会議を記録しましょう</p>
            </div>

            {/* 検索バー */}
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
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleSearchClear}
                    className="px-3 text-navy/50 hover:text-navy"
                  >
                    ×
                  </button>
                )}
                {/* 音声検索ボタン（開発中） */}
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

            {/* 検索結果表示 */}
            {searchResults.length > 0 ? (
              <SearchResults results={searchResults} query={searchQuery} />
            ) : (
              <>
                {/* 検索結果が見つからなかった場合 */}
                {isSearching && (
                  <div className="text-center py-8">
                    <p className="text-navy/70">「{searchQuery}」に一致するナレッジが見つかりませんでした。</p>
                  </div>
                )}

                {/* ナレッジカルーセル（検索していないときに表示） */}
                {!isSearching && !searchQuery && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-navy">最近共有されたナレッジ</h2>
                    <KnowledgeCarousel />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
