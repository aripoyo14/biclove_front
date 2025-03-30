"use client"

import { useRouter } from "next/navigation"
import { FileText, Mic, Tag } from "lucide-react"

interface SearchResult {
  id: number
  title: string
  summary: string
  isDocument?: boolean
  author: string
  relevance: number
  tags: string[]
}

interface SearchResultsProps {
  results: SearchResult[]
  query: string
}

export default function SearchResults({ results, query }: SearchResultsProps) {
  const router = useRouter()

  const handleResultClick = (id: number) => {
    router.push(`/meeting/${id}`)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-navy">「{query}」の検索結果</h2>
      <div className="space-y-3">
        {results.map((result) => (
          <div
            key={result.id}
            onClick={() => handleResultClick(result.id)}
            className="bg-white border border-blue/20 rounded-lg p-4 shadow-sm hover:border-blue/50 transition-colors cursor-pointer"
          >
            <div className="flex items-start gap-3">
              <div className="mt-1">
                {result.isDocument ? <FileText className="h-5 w-5 text-blue" /> : <Mic className="h-5 w-5 text-blue" />}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-navy mb-1">{result.title}</h3>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-navy/60">by {result.author}</span>
                </div>
                <p className="text-sm text-navy/70 mb-2">{result.summary}</p>

                {/* Tags */}
                {result.tags.length > 0 && (
                  <div className="flex items-center flex-wrap gap-1 mt-2">
                    <Tag size={12} className="text-blue" />
                    {result.tags.map((tag, index) => (
                      <span key={index} className="text-xs px-2 py-0.5 bg-blue/10 text-navy rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

