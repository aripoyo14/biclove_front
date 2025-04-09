export interface Message {
  type: "user" | "system" | "assistant"
  content: string
  timestamp?: string
  author?: string
}

export interface Challenge {
  id: number
  user_id: number
  meeting_id: number
  title: string
  content: string
  created_at: string
}

export interface Knowledge {
  id: number
  user_id: number
  meeting_id: number
  title: string
  content: string
  thanks_count: number
  created_at: string
}

export interface Challenge {
  id: number
  user_id: number
  meeting_id: number
  title: string
  content: string
  created_at: string
}

export interface Knowledge {
  id: number
  user_id: number
  meeting_id: number
  title: string
  content: string
  thanks_count: number
  created_at: string
}

export interface Meeting {
  id: number
  user_id: number
  title: string
  summary: string
  time: string
  created_at: string
  challenges: Challenge[]
  knowledges: Knowledge[]
}

// Mock current user
export const currentUser = {
  id: 1,
  email: "biclove@gmail.com"
}

let meetingsData: Meeting[] = []

export async function getLatestMeetings(): Promise<Meeting[]> {
  try {
    const response = await fetch(
      process.env.NEXT_PUBLIC_API_ENDPOINT + `/latest_meeting?user_id=${currentUser.id}`, // デプロイ環境用
      // `http://127.0.0.1:8000/latest_meeting?user_id=${currentUser.id}`, // ローカル環境用
    );
    if (!response.ok) {
      throw new Error('Failed to fetch latest meeting');
    }
    const data = await response.json();
    meetingsData = data as Meeting[];
    return meetingsData;
  } catch (error) {
    console.error('Error fetching latest meeting:', error);
    throw error;
  }
}

// export function getAllMeetings(): Meeting[] {
//   return meetingsData
// }

export function getUserMeetings(): Meeting[] {
  return meetingsData.filter((meeting) => meeting.user_id === currentUser.id)
}

export function getOtherUsersMeetings(): Meeting[] {
  return meetingsData.filter((meeting) => meeting.owner !== currentUser)
}

export function isUserMeeting(meetingId: number): boolean {
  const meeting = meetingsData.find((meeting) => meeting.id === meetingId)
  return meeting ? meeting.user_id === currentUser.id : false
}

// Function to find related knowledge based on matching tags
export function findRelatedKnowledge(
  tags: string[]
): { id: number; title: string; knowledge: string; matchingTags: string[] }[] {
  if (!tags || tags.length === 0) return [];

  // Convert tags to lowercase for case-insensitive matching
  const normalizedTags = tags.map((tag) => tag.toLowerCase());

  return meetingsData
    .map((meeting) => {
      // Find matching tags
      const matchingTags = meeting.knowledges.map((knowledge) => knowledge.content).filter((tag) => normalizedTags.includes(tag.toLowerCase()))

      return {
        id: meeting.id,
        title: meeting.title,
        knowledge: meeting.summary,
        matchingTags,
        matchCount: matchingTags.length,
      };
    })
    .filter((item) => item.matchCount > 0) // Only include items with matching tags
    .sort((a, b) => b.matchCount - a.matchCount) // Sort by number of matching tags
    .slice(0, 3); // Limit to top 3 matches
}

// Function to extract tags from text
export function extractTagsFromText(text: string): string[] {
  // This is a simple implementation that extracts key terms
  // In a real app, you might use NLP or a more sophisticated algorithm

  // Remove common words and punctuation
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
    "be",
    "will",
    "should",
    "can",
  ];

  // Split text into lines, then words
  const words = text
    .split("\n")
    .flatMap((line) =>
      line
        .replace(/^-\s+/g, "") // Remove bullet points
        .split(/\s+/)
    )
    .map((word) => word.replace(/[.,;:!?()]/g, "").trim()) // Remove punctuation
    .filter(
      (word) =>
        word.length > 3 && // Only words longer than 3 characters
        !commonWords.includes(word.toLowerCase()) && // Exclude common words
        !/^\d+$/.test(word) // Exclude numbers
    );

  // Count word frequency
  const wordCount = words.reduce((acc, word) => {
    const lowerWord = word.toLowerCase();
    acc[lowerWord] = (acc[lowerWord] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Get top words by frequency
  return Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1]) // Sort by frequency
    .slice(0, 10) // Take top 10
    .map(([word]) => word.charAt(0).toUpperCase() + word.slice(1)); // Capitalize first letter
}
