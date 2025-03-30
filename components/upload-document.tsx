"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Upload, FileText, Check, X, Edit, Save, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { extractTagsFromText, getAllMeetings, currentUser } from "@/lib/meeting-data"

enum UploadState {
  IDLE = 0,
  UPLOADING = 1,
  PROCESSING = 2,
  COMPLETED = 3,
}

interface DocumentSummary {
  title: string
  summary: string
  knowledge: string
  knowledgeTags: string[]
  issues: string
  challengeTags: string[] // Changed from issueTags
}

export default function UploadDocument() {
  const router = useRouter()
  const [uploadState, setUploadState] = useState<UploadState>(UploadState.IDLE)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [documentSummary, setDocumentSummary] = useState<DocumentSummary>({
    title: "",
    summary: "",
    knowledge: "",
    knowledgeTags: [],
    issues: "",
    challengeTags: [], // Changed from issueTags
  })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const knowledgeTagInputRef = useRef<HTMLInputElement>(null)
  const challengeTagInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFile(e.dataTransfer.files[0])
    }
  }

  const uploadDocument = () => {
    if (!selectedFile) return

    setUploadState(UploadState.UPLOADING)

    // Simulate upload progress
    let progress = 0
    const interval = setInterval(() => {
      progress += 5
      setUploadProgress(progress)

      if (progress >= 100) {
        clearInterval(interval)
        setUploadState(UploadState.PROCESSING)

        // Simulate processing
        setTimeout(() => {
          // In a real app, you would send the document to an API for processing
          // and AI would automatically generate tags, summary, and knowledge
          const knowledge =
            "- Target markets include Southeast Asia and Latin America\n- Key competitors in these regions are Company A and Company B\n- Market entry strategy focuses on digital-first approach\n- Projected ROI is 15-20% within the first year"

          const issues =
            "- Limited resources for simultaneous market entry\n- Regulatory challenges in Southeast Asian markets\n- Strong local competition in Latin America\n- Currency fluctuation risks"

          // Auto-generate tags
          const knowledgeTags = extractTagsFromText(knowledge)
          const challengeTags = extractTagsFromText(issues)

          setDocumentSummary({
            title: selectedFile.name.replace(/\.[^/.]+$/, ""),
            summary:
              "This document outlines the company's strategy for expanding into new markets in Q3. It includes market research data, competitive analysis, and a proposed timeline for the expansion.",
            knowledge,
            knowledgeTags,
            issues,
            challengeTags,
          })

          setUploadState(UploadState.COMPLETED)
        }, 2000)
      }
    }, 100)
  }

  const handleSummaryChange = (field: keyof DocumentSummary, value: string | string[]) => {
    setDocumentSummary((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleKnowledgeTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && e.currentTarget.value.trim() !== "") {
      e.preventDefault()
      const newTag = e.currentTarget.value.trim()
      if (!documentSummary.knowledgeTags.includes(newTag)) {
        handleSummaryChange("knowledgeTags", [...documentSummary.knowledgeTags, newTag])
      }
      e.currentTarget.value = ""
    }
  }

  const handleChallengeTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && e.currentTarget.value.trim() !== "") {
      e.preventDefault()
      const newTag = e.currentTarget.value.trim()
      if (!documentSummary.challengeTags.includes(newTag)) {
        handleSummaryChange("challengeTags", [...documentSummary.challengeTags, newTag])
      }
      e.currentTarget.value = ""
    }
  }

  const removeKnowledgeTag = (tagToRemove: string) => {
    handleSummaryChange(
      "knowledgeTags",
      documentSummary.knowledgeTags.filter((tag) => tag !== tagToRemove),
    )
  }

  const removeChallengeTag = (tagToRemove: string) => {
    handleSummaryChange(
      "challengeTags",
      documentSummary.challengeTags.filter((tag) => tag !== tagToRemove),
    )
  }

  const finalizeDocument = () => {
    // In a real app, you would save the document data to your backend
    // and get the ID of the newly created document

    // Get the current meetings to find the highest ID
    const allMeetings = getAllMeetings()
    const newDocumentId = Math.max(...allMeetings.map((m) => m.id)) + 1

    // Create a new document object
    const newDocument = {
      id: newDocumentId,
      title: documentSummary.title,
      date: "Today",
      participants: [],
      owner: currentUser,
      summary: documentSummary.summary,
      knowledge: documentSummary.knowledge,
      knowledgeTags: documentSummary.knowledgeTags,
      issues: documentSummary.issues,
      challengeTags: documentSummary.challengeTags,
      solutionKnowledge: "",
      messages: [],
      isDocument: true,
    }

    // In a real app, you would add this to your database
    // For now, we'll just navigate to an existing meeting

    // Navigate to the document detail page
    router.push(`/meeting/8`)
  }

  const renderContent = () => {
    switch (uploadState) {
      case UploadState.IDLE:
        return (
          <div className="flex flex-col items-center justify-center py-12 space-y-6">
            <div
              className="w-full max-w-md border-2 border-dashed border-blue/30 rounded-lg p-12 text-center cursor-pointer hover:bg-blue/5 transition-colors"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.doc,.docx,.txt,.md"
              />
              <FileText size={48} className="mx-auto mb-4 text-blue" />
              <h3 className="text-lg font-medium mb-2 text-navy">
                {selectedFile ? selectedFile.name : "ドラッグ＆ドロップまたはクリックしてアップロード"}
              </h3>
              <p className="text-sm text-navy/70 mb-4">
                {selectedFile
                  ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`
                  : "PDF、Word、テキスト、Markdownファイルに対応"}
              </p>
              {selectedFile && (
                <Button
                  onClick={(e) => {
                    e.stopPropagation() // Prevent event from bubbling up to the parent div
                    uploadDocument()
                  }}
                  className="gap-2 bg-blue hover:bg-blue/90"
                >
                  <Upload size={16} />
                  資料をアップロード
                </Button>
              )}
            </div>

            {!selectedFile && (
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="gap-2 border-blue text-blue hover:bg-blue/10"
              >
                <Upload size={16} />
                資料を選択
              </Button>
            )}
          </div>
        )

      case UploadState.UPLOADING:
        return (
          <div className="flex flex-col items-center justify-center py-12 space-y-6">
            <FileText size={48} className="text-blue" />
            <h2 className="text-2xl font-semibold text-navy">アップロード中</h2>
            <div className="w-full max-w-md space-y-2">
              <Progress value={uploadProgress} className="h-2 bg-blue/20" indicatorClassName="bg-blue" />
              <p className="text-sm text-navy/70 text-center">{uploadProgress}% 完了</p>
            </div>
          </div>
        )

      case UploadState.PROCESSING:
        return (
          <div className="flex flex-col items-center justify-center py-12 space-y-6">
            <div className="w-24 h-24 rounded-full bg-blue/10 flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-blue border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h2 className="text-2xl font-semibold text-navy">処理中</h2>
            <p className="text-navy/70 text-center max-w-md">
              資料を分析してナレッジに変換しています。少々お待ちください。
            </p>
          </div>
        )

      case UploadState.COMPLETED:
        return (
          <div className="space-y-6 py-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-navy">資料サマリー</h2>
              <Button
                variant={isEditing ? "default" : "outline"}
                onClick={() => setIsEditing(!isEditing)}
                className={`gap-2 ${isEditing ? "bg-blue hover:bg-blue/90" : "border-blue text-blue hover:bg-blue/10"}`}
              >
                {isEditing ? (
                  <>
                    <Check size={18} />
                    編集完了
                  </>
                ) : (
                  <>
                    <Edit size={18} />
                    編集する
                  </>
                )}
              </Button>
            </div>

            <div className="space-y-6">
              <Card className="bg-cream border-blue/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-navy text-lg">資料タイトル</CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <Input
                      value={documentSummary.title}
                      onChange={(e) => handleSummaryChange("title", e.target.value)}
                      className="bg-white border-blue/20"
                    />
                  ) : (
                    <p className="font-medium text-navy">{documentSummary.title}</p>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-cream border-blue/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-navy text-lg">資料サマリー</CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <Textarea
                      value={documentSummary.summary}
                      onChange={(e) => handleSummaryChange("summary", e.target.value)}
                      className="min-h-[120px] bg-white border-blue/20"
                    />
                  ) : (
                    <p className="whitespace-pre-wrap text-navy/80">{documentSummary.summary}</p>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-cream border-blue/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-navy text-lg">ナレッジポイント</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditing ? (
                    <Textarea
                      value={documentSummary.knowledge}
                      onChange={(e) => handleSummaryChange("knowledge", e.target.value)}
                      className="min-h-[120px] bg-white border-blue/20"
                    />
                  ) : (
                    <p className="whitespace-pre-wrap text-navy/80">{documentSummary.knowledge}</p>
                  )}

                  {/* Knowledge Tags */}
                  <div className="pt-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Tag size={16} className="text-blue" />
                      <span className="text-sm font-medium text-navy">ナレッジタグ</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {documentSummary.knowledgeTags.map((tag, index) => (
                        <div
                          key={index}
                          className="bg-blue/10 text-navy px-3 py-1 rounded-full text-sm flex items-center gap-1"
                        >
                          {tag}
                          {isEditing && (
                            <button
                              onClick={() => removeKnowledgeTag(tag)}
                              className="w-4 h-4 rounded-full bg-blue/20 flex items-center justify-center hover:bg-blue/30"
                            >
                              <X size={10} />
                            </button>
                          )}
                        </div>
                      ))}
                      {isEditing && (
                        <Input
                          ref={knowledgeTagInputRef}
                          placeholder="タグを追加してEnterを押す"
                          className="w-48 h-8 bg-white border-blue/20"
                          onKeyDown={handleKnowledgeTagInput}
                        />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-cream border-blue/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-navy text-lg">チャレンジ</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditing ? (
                    <Textarea
                      value={documentSummary.issues}
                      onChange={(e) => handleSummaryChange("issues", e.target.value)}
                      className="min-h-[120px] bg-white border-blue/20"
                    />
                  ) : (
                    <p className="whitespace-pre-wrap text-navy/80">{documentSummary.issues}</p>
                  )}

                  {/* Challenge Tags */}
                  <div className="pt-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Tag size={16} className="text-blue" />
                      <span className="text-sm font-medium text-navy">チャレンジタグ</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {documentSummary.challengeTags.map((tag, index) => (
                        <div
                          key={index}
                          className="bg-yellow/20 text-navy px-3 py-1 rounded-full text-sm flex items-center gap-1"
                        >
                          {tag}
                          {isEditing && (
                            <button
                              onClick={() => removeChallengeTag(tag)}
                              className="w-4 h-4 rounded-full bg-yellow/30 flex items-center justify-center hover:bg-yellow/40"
                            >
                              <X size={10} />
                            </button>
                          )}
                        </div>
                      ))}
                      {isEditing && (
                        <Input
                          ref={challengeTagInputRef}
                          placeholder="タグを追加してEnterを押す"
                          className="w-48 h-8 bg-white border-blue/20"
                          onKeyDown={handleChallengeTagInput}
                        />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end">
              <Button size="lg" onClick={finalizeDocument} className="gap-2 bg-blue hover:bg-blue/90">
                <Save size={18} />
                資料を保存
              </Button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return <div className="w-full max-w-4xl mx-auto">{renderContent()}</div>
}

