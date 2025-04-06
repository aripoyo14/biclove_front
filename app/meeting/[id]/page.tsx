"use client";

import { use } from "react";
import { useState, useEffect } from "react";
import { notFound } from "next/navigation";
import SidebarNav from "@/components/sidebar-nav";
import {
  getLatestMeetings,
  isUserMeeting,
  findRelatedKnowledge,
  Meeting,
} from "@/lib/meeting-data";
import {
  BookOpen,
  AlertTriangle,
  Lightbulb,
  Plus,
  Minus,
  Tag,
  LinkIcon,
  Calendar,
  Clock,
} from "lucide-react";
import {
  generateSolutionProposal,
  getRelevantReferences,
  sendChallengeToSolution,
} from "@/lib/generate-solution";

// Update interfaces to include title
interface KnowledgeItem {
  title: string;
  content: string;
  tags: string[];
}

interface ChallengeItem {
  title: string;
  content: string;
  tags: string[];
  relatedKnowledge?: Array<{
    id: number;
    title: string;
    knowledge: string;
    matchingTags: string[];
    relevance: number;
  }>;
}

export default function MeetingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [expandedRefs, setExpandedRefs] = useState<number[]>([]);
  const [expandedRelated, setExpandedRelated] = useState<{ [challengeIndex: number]: number[] }>({});
  const [solutionResponse, setSolutionResponse] = useState<{ summary: string; knowledge_ids: number[] } | null>(null);

  useEffect(() => {
    const fetchMeeting = async () => {
      try {
        const meetings = await getLatestMeetings();
        console.log('Fetched meetings:', meetings);
        console.log('Looking for meeting with id:', Number.parseInt(id));
        const foundMeeting = meetings.find(m => m.id === Number.parseInt(id));
        console.log('Found meeting:', foundMeeting);
        
        if (!foundMeeting) {
          console.log('Meeting not found, redirecting to 404');
          notFound();
          return;
        }
        
        setMeeting(foundMeeting);
      } catch (error) {
        console.error('Error fetching meeting:', error);
        notFound();
      }
    };
    fetchMeeting();
  }, [id]);

  if (!meeting) {
    return null; // またはローディングスピナーを表示
  }

  // Check if this is the current user's meeting
  const isOwner = isUserMeeting(meeting.id);

  // Check if this is a document (uploaded) or a recording
  const isDocument = meeting.isDocument === true;

  // Get solution proposal and references only for user's own meetings
  const solutionProposal = isOwner ? generateSolutionProposal(meeting) : "";
  const references = isOwner ? getRelevantReferences(meeting.id) : [];

  const toggleReference = (index: number) => {
    setExpandedRefs((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const toggleRelated = (challengeIndex: number, itemId: number) => {
    setExpandedRelated((prev) => {
      const currentExpanded = prev[challengeIndex] || [];
      const newExpanded = currentExpanded.includes(itemId)
        ? currentExpanded.filter((id) => id !== itemId)
        : [...currentExpanded, itemId];

      return {
        ...prev,
        [challengeIndex]: newExpanded,
      };
    });
  };

  // Parse knowledge into multiple items with titles from the meeting data
  const knowledgeItems: KnowledgeItem[] = meeting.knowledges.map(knowledge => ({
    title: knowledge.title,
    content: knowledge.content,
    tags: [], // タグは現在の実装では使用されていないため空配列を設定
  }));

  // Parse challenges into multiple items with titles from the meeting data
  const challengeItems: ChallengeItem[] = meeting.challenges.map(challenge => ({
    title: challenge.title,
    content: challenge.content,
    tags: [], // タグは現在の実装では使用されていないため空配列を設定
    relatedKnowledge: !isDocument ? findRelatedKnowledge([]).map(related => ({
      ...related,
      relevance: related.matchingTags?.length || 0,
    })) : undefined,
  }));

  // Check if we're viewing from the sidebar (we'll always show the content but hide Hints)
  const isViewingFromSidebar = false;

  const handleGenerateSolution = async () => {
    try {
      // すべてのchallengeの内容を集約
      const allChallengeContent = challengeItems
        .map(item => item.content)
        .join('\n\n');

      // 集約した内容を送信
      const response = await sendChallengeToSolution(allChallengeContent);
      setSolutionResponse(response);
    } catch (error) {
      console.error('Error generating solution:', error);
    }
  };

  return (
    <div className="flex h-screen bg-cream">
      <SidebarNav activeId={meeting.id} />

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="border-b p-4 flex justify-between items-center border-blue/10">
          <div className="flex-1">
            <h1 className="text-lg font-medium text-navy">{meeting.title}</h1>
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

        <div className="flex-1 overflow-auto">
          <div className="max-w-3xl mx-auto py-8 px-4 pb-16">
            <div className="space-y-8">
              {/* Meeting Title and Date/Time - Enhanced for recordings */}
              {!isDocument && (
                <div className="bg-white border border-blue/20 rounded-lg p-6 shadow-sm">
                  <h1 className="text-2xl font-bold text-navy mb-4">
                    {meeting.title}
                  </h1>
                  <div className="flex items-center gap-4 text-navy/70">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-blue" />
                      <span>{new Date(meeting.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-blue" />
                      <span>会議時間: 45分</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Owner information */}
              <div className="bg-blue/5 p-3 rounded-lg text-navy/70 flex items-center justify-between">
                <div>
                  {isOwner
                    ? "あなたのナレッジ"
                    : `ユーザー${meeting.user_id}さんのナレッジ`}
                </div>
                <div>{new Date(meeting.created_at).toLocaleDateString()}</div>
              </div>

              {/* Summary - Show for all recordings and owner's uploads */}
              {(!isDocument || isOwner) && (
                <div className="bg-white border border-blue/20 rounded-lg p-6 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue/10 p-2 rounded-full">
                      <BookOpen className="text-blue h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-navy mb-3">
                        Summary
                      </h2>
                      <p className="text-navy/80 leading-relaxed">
                        {meeting.summary}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Multiple Knowledge Items with Titles */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-navy">Knowledge</h2>
                {knowledgeItems.map((item, index) => (
                  <div
                    key={index}
                    className="bg-white border border-blue/20 rounded-lg p-6 shadow-sm"
                  >
                    <div className="flex items-start gap-4">
                      <div className="bg-yellow/10 p-2 rounded-full">
                        <Lightbulb className="text-yellow h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        {/* Use the provided title for each knowledge item */}
                        <h3 className="text-lg font-medium text-navy mb-3">
                          {item.title}
                        </h3>
                        <div className="whitespace-pre-wrap text-navy/80 leading-relaxed mb-4">
                          {item.content}
                        </div>

                        {/* Knowledge Tags */}
                        {item.tags.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Tag size={16} className="text-blue" />
                              <span className="text-sm font-medium text-navy">
                                Tags
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {item.tags.map((tag, tagIndex) => (
                                <div
                                  key={tagIndex}
                                  className="bg-blue/10 text-navy px-3 py-1 rounded-full text-sm"
                                >
                                  {tag}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Multiple Challenge Items with Titles and Related Knowledge - Only show for recordings */}
              {!isDocument && challengeItems.length > 0 && (
                <div className="space-y-8">
                  <h2 className="text-xl font-semibold text-navy">Challenge</h2>
                  {challengeItems.map((item, challengeIndex) => (
                    <div key={challengeIndex} className="space-y-4">
                      {/* Challenge Item with Title */}
                      <div className="bg-white border border-blue/20 rounded-lg p-6 shadow-sm">
                        <div className="flex items-start gap-4">
                          <div className="bg-red-100 p-2 rounded-full">
                            <AlertTriangle className="text-red-500 h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            {/* Use the provided title for each challenge item */}
                            <h3 className="text-lg font-medium text-navy mb-3">
                              {item.title}
                            </h3>
                            <div className="whitespace-pre-wrap text-navy/80 leading-relaxed mb-4">
                              {item.content}
                            </div>

                            {/* Challenge Tags */}
                            {item.tags.length > 0 && (
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <Tag size={16} className="text-blue" />
                                  <span className="text-sm font-medium text-navy">
                                    Tags
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {item.tags.map((tag, tagIndex) => (
                                    <div
                                      key={tagIndex}
                                      className="bg-yellow/20 text-navy px-3 py-1 rounded-full text-sm"
                                    >
                                      {tag}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Related Knowledge for this specific Challenge */}
                      {item.relatedKnowledge &&
                        item.relatedKnowledge.length > 0 && (
                          <div className="bg-blue/5 border border-blue/20 rounded-lg p-6 shadow-sm ml-8">
                            <h3 className="text-lg font-semibold text-navy mb-4">
                              Related Knowledge
                            </h3>
                            <div className="space-y-3">
                              {item.relatedKnowledge.map((relatedItem) => (
                                <div
                                  key={relatedItem.id}
                                  className="bg-white rounded-lg border border-blue/10 overflow-hidden"
                                >
                                  <div className="p-3 flex justify-between items-center">
                                    <h4 className="text-blue font-medium">
                                      {relatedItem.title}
                                    </h4>
                                    <button
                                      onClick={() =>
                                        toggleRelated(
                                          challengeIndex,
                                          relatedItem.id
                                        )
                                      }
                                      className="flex items-center justify-center w-6 h-6 rounded-full bg-blue/10 hover:bg-blue/20 text-blue transition-colors"
                                    >
                                      {expandedRelated[
                                        challengeIndex
                                      ]?.includes(relatedItem.id) ? (
                                        <Minus size={14} />
                                      ) : (
                                        <Plus size={14} />
                                      )}
                                    </button>
                                  </div>

                                  {expandedRelated[challengeIndex]?.includes(
                                    relatedItem.id
                                  ) && (
                                    <div className="p-3 pt-0 border-t border-blue/10 animate-in fade-in slide-in-from-top-2 duration-200">
                                      <p className="text-navy/70 text-sm whitespace-pre-wrap">
                                        {relatedItem.knowledge}
                                      </p>

                                      <div className="mt-3 pt-3 border-t border-blue/5">
                                        <h5 className="text-xs font-medium text-navy/60 uppercase mb-2">
                                          関連するタグ
                                        </h5>
                                        <div className="flex flex-wrap gap-1">
                                          {relatedItem.matchingTags.map(
                                            (tag, idx) => (
                                              <span
                                                key={idx}
                                                className="text-xs px-2 py-0.5 bg-blue/10 text-navy rounded-full"
                                              >
                                                {tag}
                                              </span>
                                            )
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              )}

              {/* Related Knowledge (formerly Hints) - Only show for owner's content */}
              {isOwner && !isViewingFromSidebar && (
                <div className="bg-blue/5 border border-blue/20 rounded-lg p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-navy">
                      Related Knowledge
                    </h2>
                    <button 
                      onClick={handleGenerateSolution}
                      className="bg-blue text-white px-4 py-2 rounded-lg hover:bg-blue/90 transition-colors"
                    >
                      知見生成
                    </button>
                  </div>
                  
                  {solutionResponse && (
                    <>
                      <p className="text-navy/90 leading-relaxed text-lg font-medium mb-6">
                        {solutionResponse.summary}
                      </p>

                      <div className="border-t border-blue/10 pt-4 mt-6">
                        <h3 className="text-navy font-medium flex items-center gap-2 mb-4">
                          <LinkIcon className="h-4 w-4" />
                          参考情報
                        </h3>

                        <div className="space-y-3">
                          {references.map((site, index) => (
                            <div
                              key={index}
                              className="bg-white rounded-lg border border-blue/10 overflow-hidden"
                            >
                              <div className="p-3 flex justify-between items-center">
                                <h4 className="text-blue font-medium">
                                  {site.title}
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
                                  <p className="text-navy/70 text-sm">
                                    {site.description}
                                  </p>

                                  <div className="mt-3 pt-3 border-t border-blue/5">
                                    <h5 className="text-xs font-medium text-navy/60 uppercase mb-2">
                                      Key Points
                                    </h5>
                                    <ul className="text-sm text-navy/70 space-y-1 pl-4 list-disc">
                                      <li>
                                        Comprehensive guide to best practices and
                                        standards
                                      </li>
                                      <li>
                                        Includes practical examples and
                                        implementation tips
                                      </li>
                                      <li>
                                        Updated with the latest industry
                                        recommendations
                                      </li>
                                    </ul>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Helper function to parse knowledge content into multiple items with titles
function parseKnowledgeItems(
  knowledgeContent: string,
  allTags: string[],
  titles: string[]
): KnowledgeItem[] {
  // Split the knowledge content by bullet points
  const knowledgePoints = knowledgeContent
    .split("\n")
    .filter((line) => line.trim().startsWith("-"))
    .map((line) => line.trim().substring(1).trim());

  if (knowledgePoints.length === 0) {
    // If no bullet points, treat the whole content as one item
    return [
      {
        title: titles[0] || "主要なナレッジポイント",
        content: knowledgeContent,
        tags: allTags,
      },
    ];
  }

  // Group knowledge points by theme
  const knowledgeGroups: string[][] = [];
  let currentGroup: string[] = [];
  let currentTheme = "";

  knowledgePoints.forEach((point) => {
    // Simple heuristic: if the point contains similar words to the current theme, add it to the current group
    // Otherwise, start a new group
    const words = point.toLowerCase().split(/\s+/);

    if (
      currentGroup.length === 0 ||
      hasCommonWords(words, currentTheme.toLowerCase().split(/\s+/))
    ) {
      currentGroup.push(point);
      if (currentTheme === "") {
        currentTheme = words.slice(0, 3).join(" "); // Use first few words as theme
      }
    } else {
      knowledgeGroups.push([...currentGroup]);
      currentGroup = [point];
      currentTheme = words.slice(0, 3).join(" ");
    }
  });

  if (currentGroup.length > 0) {
    knowledgeGroups.push(currentGroup);
  }

  // Create knowledge items from groups with titles
  return knowledgeGroups.map((group, index) => {
    const content = group.map((point) => `- ${point}`).join("\n");

    // Use provided title if available, otherwise generate one
    const title = titles[index] || `ナレッジポイント ${index + 1}`;

    // Assign relevant tags to each group
    const relevantTags = allTags.filter((tag) => {
      const tagWords = tag.toLowerCase().split(/\s+/);
      return group.some((point) => {
        const pointWords = point.toLowerCase().split(/\s+/);
        return hasCommonWords(tagWords, pointWords);
      });
    });

    return {
      title,
      content,
      tags: relevantTags.length > 0 ? relevantTags : [allTags[0]], // Fallback to first tag if no matches
    };
  });
}

// Helper function to parse challenge content into multiple items with titles
function parseChallengeItems(
  challengeContent: string,
  allTags: string[],
  titles: string[]
): ChallengeItem[] {
  // Split the challenge content by bullet points
  const challengePoints = challengeContent
    .split("\n")
    .filter((line) => line.trim().startsWith("-"))
    .map((line) => line.trim().substring(1).trim());

  if (challengePoints.length === 0) {
    // If no bullet points, treat the whole content as one item
    return [
      {
        title: titles[0] || "主要な課題",
        content: challengeContent,
        tags: allTags,
      },
    ];
  }

  // Group challenge points by theme
  const challengeGroups: string[][] = [];
  let currentGroup: string[] = [];
  let currentTheme = "";

  challengePoints.forEach((point) => {
    // Simple heuristic: if the point contains similar words to the current theme, add it to the current group
    // Otherwise, start a new group
    const words = point.toLowerCase().split(/\s+/);

    if (
      currentGroup.length === 0 ||
      hasCommonWords(words, currentTheme.toLowerCase().split(/\s+/))
    ) {
      currentGroup.push(point);
      if (currentTheme === "") {
        currentTheme = words.slice(0, 3).join(" "); // Use first few words as theme
      }
    } else {
      challengeGroups.push([...currentGroup]);
      currentGroup = [point];
      currentTheme = words.slice(0, 3).join(" ");
    }
  });

  if (currentGroup.length > 0) {
    challengeGroups.push(currentGroup);
  }

  // Create challenge items from groups with titles
  return challengeGroups.map((group, index) => {
    const content = group.map((point) => `- ${point}`).join("\n");

    // Use provided title if available, otherwise generate one
    const title = titles[index] || `課題 ${index + 1}`;

    // Assign relevant tags to each group
    const relevantTags = allTags.filter((tag) => {
      const tagWords = tag.toLowerCase().split(/\s+/);
      return group.some((point) => {
        const pointWords = point.toLowerCase().split(/\s+/);
        return hasCommonWords(tagWords, pointWords);
      });
    });

    return {
      title,
      content,
      tags: relevantTags.length > 0 ? relevantTags : [allTags[0]], // Fallback to first tag if no matches
    };
  });
}

// Helper function to check if two arrays of words have common elements
function hasCommonWords(words1: string[], words2: string[]): boolean {
  // Filter out common words that aren't meaningful for comparison
  const commonWords = [
    "and",
    "the",
    "to",
    "a",
    "an",
    "in",
    "on",
    "for",
    "of",
    "with",
    "is",
    "are",
  ];
  const filteredWords1 = words1.filter(
    (word) => !commonWords.includes(word) && word.length > 3
  );
  const filteredWords2 = words2.filter(
    (word) => !commonWords.includes(word) && word.length > 3
  );

  return filteredWords1.some((word) => filteredWords2.includes(word));
}
