"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronUp, Lightbulb, LinkIcon } from 'lucide-react'

interface SearchResult {
  id: string
  title: string
  content: string
  relevance: number
  tags: string[]
  author: string
  createdAt: string
}

interface SearchResultsProps {
  results: SearchResult[]
  query: string
}

const SearchResults: React.FC<SearchResultsProps> = ({ results, query }) => {
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  // 最も関連度の高い結果からサマリーを生成
  const generateSummary = (results: SearchResult[]) => {
    // 関連度でソート
    const sortedResults = [...results].sort((a, b) => b.relevance - a.relevance)
    // 最も関連度の高い結果を使用してサマリーを生成
    const mainResult = sortedResults[0]
    if (!mainResult) return ""

    // 箇条書き形式で内容を整形
    return mainResult.content
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.startsWith('-') ? line : `- ${line}`)
      .join('\n')
  }

  const toggleItem = (id: string) => {
    setExpandedItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-navy/70">「{query}」に一致するナレッジが見つかりませんでした。</p>
      </div>
    )
  }

  return (
    <div className="bg-cream border border-blue/20 rounded-lg p-6 shadow-sm">
      {/* Knowledge セクション */}
      <div className="flex items-start gap-4">
        <div className="bg-yellow/10 p-2 rounded-full">
          <Lightbulb className="text-yellow h-5 w-5" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-navy mb-3">Related Knowledge</h2>
          <p className="text-navy/80 leading-relaxed whitespace-pre-wrap">
            {generateSummary(results)}
          </p>
        </div>
      </div>

      {/* 参考情報セクション */}
      <div className="mt-8 space-y-2">
        <div className="flex items-center gap-2 mb-4">
          <LinkIcon size={16} className="text-blue" />
          <h3 className="text-base font-medium text-navy">参考情報</h3>
        </div>
        <div className="space-y-2">
          {results.map((result) => (
            <div
              key={result.id}
              className="bg-white border border-blue/10 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => toggleItem(result.id)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-blue/5 transition-colors"
              >
                <div className="flex-1">
                  <h4 className="text-left font-medium text-navy text-base">{result.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-navy/60">by {result.author}</span>
                    <span className="text-sm text-navy/60">
                      {new Date(result.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                {expandedItems.includes(result.id) ? (
                  <ChevronUp className="h-5 w-5 text-navy/50" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-navy/50" />
                )}
              </button>
              {expandedItems.includes(result.id) && (
                <div className="px-4 py-3 border-t border-blue/10">
                  <p className="text-base text-navy/80 whitespace-pre-wrap">
                    {result.content}
                  </p>
                  {result.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {result.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-sm rounded-full bg-blue/10 text-blue"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SearchResults

