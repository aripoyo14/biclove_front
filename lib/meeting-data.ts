export interface Message {
  type: "user" | "system" | "assistant";
  content: string;
  timestamp?: string;
  author?: string;
}

export interface Meeting {
  id: number;
  title: string;
  date: string;
  participants: string[];
  messages: Message[];
  summary: string;
  knowledge: string;
  knowledgeTitles: string[]; // Added field for knowledge titles
  knowledgeTags: string[];
  issues: string;
  challengeTitles: string[]; // Added field for challenge titles
  challengeTags: string[]; // Changed from issueTags to challengeTags
  solutionKnowledge: string;
  isDocument?: boolean;
  owner: string;
}

// Mock current user
export const currentUser = 1;

const meetingsData: Meeting[] = [
  {
    id: 1,
    title: "Product Roadmap Discussion",
    date: "Today",
    participants: ["Sarah Johnson", "Michael Chen", "David Kim"],
    owner: "biclove@gmail.com", // Current user's meeting
    summary:
      "This meeting focused on our Q3 product roadmap. We prioritized features for the next release and discussed implementation timelines.",
    knowledge:
      "- Enhanced reporting dashboard is a high priority for enterprise customers\n- Mobile app improvements are needed for the next release\n- Integration with third-party tools is planned\n- API improvements should be included in the roadmap",
    knowledgeTitles: [
      "Enterprise Reporting Dashboard Priority",
      "Mobile App Enhancements",
      "Third-Party Integration Plans",
      "API Roadmap Inclusion",
    ],
    knowledgeTags: [
      "Roadmap",
      "Q3",
      "Features",
      "Reporting",
      "Mobile",
      "API",
      "Integration",
    ],
    issues:
      "- Timeline for API improvements needs to be determined\n- Resources for the reporting dashboard need to be allocated\n- Testing strategy for third-party integrations needs to be developed",
    challengeTitles: [
      "API Timeline Determination",
      "Dashboard Resource Allocation",
      "Integration Testing Strategy",
    ],
    challengeTags: ["Timeline", "Resources", "Testing", "API", "Integration"],
    solutionKnowledge:
      "- Previous API improvement projects typically took 4-6 weeks\n- The design team has dashboard templates that can accelerate development\n- We have documentation from previous third-party integrations\n- The QA team has developed a standard testing framework for integrations",
    messages: [
      {
        type: "system",
        content: "Meeting started at 10:00 AM",
        timestamp: "10:00 AM",
      },
      {
        type: "user",
        content:
          "Let's discuss our Q3 product roadmap. We need to prioritize features for the next release.",
        author: "Sarah Johnson",
        timestamp: "10:02 AM",
      },
      {
        type: "assistant",
        content:
          "Based on customer feedback, I suggest we focus on the following features:\n\n1. Enhanced reporting dashboard\n2. Mobile app improvements\n3. Integration with third-party tools",
        author: "AI Assistant",
        timestamp: "10:03 AM",
      },
      {
        type: "user",
        content:
          "I agree with those priorities. The reporting dashboard has been requested by several enterprise customers.",
        author: "Michael Chen",
        timestamp: "10:05 AM",
      },
      {
        type: "user",
        content:
          "We should also consider the timeline for the API improvements we discussed last week.",
        author: "David Kim",
        timestamp: "10:07 AM",
      },
      {
        type: "user",
        content: "Good point. Let's add that as item #4 on our priority list.",
        author: "Sarah Johnson",
        timestamp: "10:09 AM",
      },
      {
        type: "assistant",
        content:
          "I've updated the priority list:\n\n1. Enhanced reporting dashboard\n2. Mobile app improvements\n3. Integration with third-party tools\n4. API improvements\n\nShall I create tickets for these items in our project management system?",
        author: "AI Assistant",
        timestamp: "10:10 AM",
      },
      {
        type: "user",
        content:
          "Yes, please create the tickets and assign them to the respective team leads.",
        author: "Sarah Johnson",
        timestamp: "10:12 AM",
      },
      {
        type: "system",
        content: "Meeting ended at 10:30 AM",
        timestamp: "10:30 AM",
      },
    ],
  },
  {
    id: 2,
    title: "UX Design Review",
    date: "Today",
    participants: ["Emily Rodriguez", "Jessica Lee", "Robert Taylor"],
    owner: "emily@example.com", // Another user's meeting
    summary:
      "In this meeting, we reviewed three different versions of the new dashboard design. Version 2 was selected as it has the clearest information hierarchy and most intuitive navigation flow.",
    knowledge:
      "- Version 2 of the dashboard design was selected\n- The design has clear information hierarchy\n- The navigation flow is intuitive\n- The design aligns with our brand guidelines",
    knowledgeTitles: [
      "Dashboard Design Selection",
      "Information Hierarchy Clarity",
      "Intuitive Navigation Implementation",
      "Brand Alignment Confirmation",
    ],
    knowledgeTags: ["UX", "Design", "Dashboard", "Navigation", "Brand"],
    issues:
      "- Need to finalize the color scheme\n- Mobile responsiveness needs further testing\n- Some data visualization components need refinement",
    challengeTitles: [
      "Color Scheme Finalization",
      "Mobile Responsiveness Testing",
      "Data Visualization Refinement",
    ],
    challengeTags: ["Color", "Mobile", "Responsive", "Data Visualization"],
    solutionKnowledge:
      "- We can leverage our existing design system for color consistency\n- The UX team has a mobile testing framework ready\n- There are pre-built data visualization libraries we can use",
    messages: [
      {
        type: "system",
        content: "Meeting started at 2:00 PM",
        timestamp: "2:00 PM",
      },
      {
        type: "user",
        content:
          "Today we'll review the new dashboard design. Jessica has prepared some mockups for us to discuss.",
        author: "Emily Rodriguez",
        timestamp: "2:02 PM",
      },
      {
        type: "user",
        content:
          "I've created three different versions of the dashboard based on our previous discussions. Let me share my screen.",
        author: "Jessica Lee",
        timestamp: "2:04 PM",
      },
      {
        type: "assistant",
        content:
          "The mockups look great. Based on usability principles, I'd recommend version 2 as it has the clearest information hierarchy and most intuitive navigation flow.",
        author: "AI Assistant",
        timestamp: "2:10 PM",
      },
      {
        type: "user",
        content:
          "I agree with that assessment. Version 2 also aligns better with our brand guidelines.",
        author: "Robert Taylor",
        timestamp: "2:12 PM",
      },
      {
        type: "system",
        content: "Meeting ended at 3:00 PM",
        timestamp: "3:00 PM",
      },
    ],
  },
  {
    id: 3,
    title: "Sprint Planning",
    date: "Yesterday",
    participants: ["David Kim", "Jessica Lee", "Michael Chen"],
    owner: "david@example.com", // Another user's meeting
    summary:
      "We planned the upcoming sprint, assigning tasks and setting priorities for the next two weeks.",
    knowledge:
      "- The authentication framework will be implemented first\n- Performance optimization is scheduled for the second week\n- We need to allocate more resources to testing\n- The team will use the automated regression test suite",
    knowledgeTitles: [
      "Authentication Framework Priority",
      "Performance Optimization Schedule",
      "Testing Resource Allocation",
      "Automated Regression Testing",
    ],
    knowledgeTags: [
      "Sprint",
      "Planning",
      "Authentication",
      "Performance",
      "Testing",
      "Automation",
    ],
    issues:
      "- Limited resources for all planned tasks\n- Testing capacity is constrained\n- Some dependencies on external teams",
    challengeTitles: [
      "Resource Limitation Management",
      "Testing Capacity Constraints",
      "External Team Dependencies",
    ],
    challengeTags: ["Resources", "Testing", "Dependencies"],
    solutionKnowledge:
      "- We can reuse components from previous projects\n- The QA team has developed automated tests we can leverage\n- We should schedule a coordination meeting with dependent teams",
    messages: [],
  },
  {
    id: 4,
    title: "Marketing Strategy",
    date: "Yesterday",
    participants: ["Sarah Johnson", "Robert Taylor"],
    owner: "sarah@example.com", // Another user's meeting
    summary:
      "We discussed the Q3 marketing strategy, focusing on digital campaigns and content creation.",
    knowledge:
      "- Social media campaigns will focus on product features\n- We'll produce a series of webinars for enterprise customers\n- Content marketing will emphasize case studies\n- Budget allocation prioritizes digital channels",
    knowledgeTitles: [
      "Social Media Campaign Focus",
      "Enterprise Webinar Series",
      "Case Study Content Strategy",
      "Digital Channel Budget Priority",
    ],
    knowledgeTags: [
      "Marketing",
      "Social Media",
      "Webinars",
      "Content",
      "Budget",
      "Digital",
    ],
    issues:
      "- Limited budget for all planned initiatives\n- Content creation resources are stretched\n- Need to coordinate timing with product releases",
    challengeTitles: [
      "Budget Constraint Management",
      "Content Resource Optimization",
      "Product Release Coordination",
    ],
    challengeTags: ["Budget", "Resources", "Timing", "Coordination"],
    solutionKnowledge:
      "- We can repurpose existing content for some channels\n- Consider using external contractors for content creation\n- The webinar platform allows for efficient production",
    messages: [],
  },
  {
    id: 5,
    title: "Quarterly Review",
    date: "2 days ago",
    participants: [
      "Michael Chen",
      "Emily Rodriguez",
      "David Kim",
      "Jessica Lee",
    ],
    owner: "michael@example.com", // Another user's meeting
    summary:
      "We reviewed the Q2 results and discussed adjustments needed for Q3 objectives.",
    knowledge:
      "- Q2 revenue exceeded targets by 12%\n- Customer acquisition cost decreased by 8%\n- Feature adoption rates are below expectations\n- Customer support tickets increased by 15%",
    knowledgeTitles: [
      "Q2 Revenue Performance",
      "Customer Acquisition Cost Reduction",
      "Feature Adoption Challenges",
      "Support Ticket Volume Increase",
    ],
    knowledgeTags: [
      "Quarterly",
      "Review",
      "Revenue",
      "Acquisition",
      "Adoption",
      "Support",
    ],
    issues:
      "- Some key features were delayed\n- Marketing spend was over budget\n- Customer support team is understaffed",
    challengeTitles: [
      "Feature Delivery Delays",
      "Marketing Budget Overrun",
      "Support Team Staffing Shortage",
    ],
    challengeTags: ["Delays", "Budget", "Staffing", "Support"],
    solutionKnowledge:
      "- Reallocate resources based on priority features\n- Implement scheduled customer support training\n- Optimize marketing spend based on efficiency metrics",
    messages: [],
  },
  {
    id: 6,
    title: "Development Process Improvements",
    date: "3 days ago",
    participants: ["David Kim", "Michael Chen"],
    owner: "biclove@gmail.com", // Current user's meeting
    summary:
      "We identified several areas for improvement in our development process and created an action plan.",
    knowledge:
      "- User stories often lack detailed acceptance criteria\n- QA is brought in too late in the process\n- Sprint planning estimates are frequently inaccurate\n- Dependencies between tasks are not clearly mapped",
    knowledgeTitles: [
      "Acceptance Criteria Improvement",
      "Early QA Integration",
      "Sprint Estimation Accuracy",
      "Task Dependency Mapping",
    ],
    knowledgeTags: [
      "Development",
      "Process",
      "QA",
      "Sprint",
      "Planning",
      "Estimates",
      "Dependencies",
    ],
    issues:
      "- Developers and QA have different understanding of requirements\n- Last-minute changes cause delays\n- Complex tasks are underestimated",
    challengeTitles: [
      "Requirements Alignment Gap",
      "Change Management Impact",
      "Complex Task Estimation",
    ],
    challengeTags: ["Requirements", "Changes", "Estimation", "Complexity"],
    solutionKnowledge:
      "- Create a template for detailed acceptance criteria\n- Include QA in planning sessions\n- Break down complex tasks into smaller components\n- Implement a dependency mapping exercise during sprint planning",
    messages: [],
  },
  {
    id: 7,
    title: "Budget Planning",
    date: "Last week",
    participants: ["Sarah Johnson", "Robert Taylor", "Emily Rodriguez"],
    owner: "biclove@gmail.com", // Current user's meeting
    summary:
      "We finalized the budget for Q3, allocating resources across departments and projects.",
    knowledge:
      "- Infrastructure upgrades will require 25% of the IT budget\n- Marketing budget is increased by 15% for digital campaigns\n- We're planning to hire 3 new engineers\n- Training budget is maintained at current levels",
    knowledgeTitles: [
      "IT Infrastructure Budget Allocation",
      "Marketing Budget Increase",
      "Engineering Hiring Plan",
      "Training Budget Maintenance",
    ],
    knowledgeTags: [
      "Budget",
      "Planning",
      "Infrastructure",
      "Marketing",
      "Hiring",
      "Training",
    ],
    issues:
      "- Some departments requested more budget than available\n- Infrastructure costs are higher than expected\n- Need to balance short-term needs with long-term investments",
    challengeTitles: [
      "Budget Request Prioritization",
      "Infrastructure Cost Management",
      "Short vs Long-term Investment Balance",
    ],
    challengeTags: ["Budget", "Costs", "Balance", "Investment"],
    solutionKnowledge:
      "- Phase some expenses across quarters\n- Prioritize hiring in engineering\n- Proceed with planned infrastructure upgrades\n- Follow allocation patterns that worked well in previous quarters",
    messages: [],
  },
  // Document example
  {
    id: 8,
    title: "Q3 Market Expansion Strategy",
    date: "Today",
    participants: [],
    owner: "biclove@gmail.com", // Current user's document
    isDocument: true,
    summary:
      "This document outlines the company's strategy for expanding into new markets in Q3. It includes market research data, competitive analysis, and a proposed timeline for the expansion.",
    knowledge:
      "- Target markets include Southeast Asia and Latin America\n- Key competitors in these regions are Company A and Company B\n- Market entry strategy focuses on digital-first approach\n- Projected ROI is 15-20% within the first year",
    knowledgeTitles: [
      "Target Market Selection",
      "Competitive Landscape Analysis",
      "Digital-First Entry Strategy",
      "First-Year ROI Projection",
    ],
    knowledgeTags: [
      "Market",
      "Expansion",
      "Strategy",
      "Southeast Asia",
      "Latin America",
      "Digital",
      "ROI",
    ],
    issues:
      "- Limited resources for simultaneous market entry\n- Regulatory challenges in Southeast Asian markets\n- Strong local competition in Latin America\n- Currency fluctuation risks",
    challengeTitles: [
      "Resource Allocation for Market Entry",
      "Southeast Asian Regulatory Navigation",
      "Latin American Competitive Strategy",
      "Currency Risk Mitigation",
    ],
    challengeTags: [
      "Resources",
      "Regulatory",
      "Competition",
      "Currency",
      "Risk",
    ],
    solutionKnowledge:
      "- Phased approach to market entry can address resource constraints\n- Legal team has experience with Southeast Asian regulations\n- Partnership with local companies can mitigate competition\n- Financial hedging strategies can reduce currency risks",
    messages: [],
  },
  {
    id: 50,
    title: "Product Development Roadmap",
    date: "Yesterday",
    participants: [],
    owner: "jessica@example.com", // Another user's document
    isDocument: true,
    summary:
      "This document outlines the product development roadmap for the next 12 months, including feature priorities and release timelines.",
    knowledge:
      "- Q3 will focus on user experience improvements\n- Q4 includes major API enhancements\n- Mobile app redesign is scheduled for Q1 next year\n- Enterprise features will be developed throughout the year",
    knowledgeTitles: [
      "Q3 UX Enhancement Focus",
      "Q4 API Development Plan",
      "Q1 Mobile Redesign Schedule",
      "Enterprise Feature Roadmap",
    ],
    knowledgeTags: [
      "Product",
      "Development",
      "Roadmap",
      "UX",
      "API",
      "Mobile",
      "Enterprise",
    ],
    issues:
      "- Resource constraints may affect timelines\n- Technical debt needs to be addressed\n- Some features have dependencies on third-party services",
    challengeTitles: [
      "Resource Constraint Impact",
      "Technical Debt Reduction",
      "Third-Party Dependency Management",
    ],
    challengeTags: ["Resources", "Technical Debt", "Dependencies", "Timeline"],
    solutionKnowledge:
      "- Implement agile methodology to adapt to changing priorities\n- Allocate dedicated time for technical debt reduction\n- Establish clear communication channels with third-party providers",
    messages: [],
  },
];

export function getMeetingData(id: number): Meeting | undefined {
  return meetingsData.find((meeting) => meeting.id === id);
}

export function getAllMeetings(): Meeting[] {
  return meetingsData;
}

export function getUserMeetings(): Meeting[] {
  return meetingsData.filter((meeting) => meeting.owner === currentUser);
}

export function getOtherUsersMeetings(): Meeting[] {
  return meetingsData.filter((meeting) => meeting.owner !== currentUser);
}

export function isUserMeeting(meetingId: number): boolean {
  const meeting = getMeetingData(meetingId);
  return meeting ? meeting.owner === currentUser : false;
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
      const matchingTags = meeting.knowledgeTags.filter((tag) =>
        normalizedTags.includes(tag.toLowerCase())
      );

      return {
        id: meeting.id,
        title: meeting.title,
        knowledge: meeting.knowledge,
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
