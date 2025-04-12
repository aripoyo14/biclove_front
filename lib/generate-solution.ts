import type { Meeting } from "./meeting-data"

// This is a mock implementation. In a real application, this would use more sophisticated
// logic or potentially an AI service to generate solutions based on meeting data.
export function generateSolutionProposal(meeting: Meeting): string {
  // Map of meeting IDs to custom solution proposals
  const customSolutions: Record<number, string> = {
    1: "Based on previous API improvement projects and available resources, implementing the enhanced reporting dashboard should be prioritized with a phased approach over 4-6 weeks, leveraging existing dashboard templates and the standard testing framework for third-party integrations.",
    2: "To address the design challenges, the team should utilize the existing design system for color consistency, implement the mobile testing framework, and integrate the pre-built data visualization libraries to refine the selected dashboard design (Version 2).",
    3: "To optimize the sprint execution, the team should leverage the authentication framework from the previous project, apply performance optimization techniques from the last refactoring, and utilize automated regression tests to address the resource allocation and testing capacity constraints.",
    4: "To maximize marketing impact within the constraints, the team should repurpose existing content, engage external contractors for content creation, and utilize the webinar platform to streamline production, allowing for efficient budget allocation across all initiatives.",
    5: "To address the delayed features and budget concerns, the team should reallocate resources based on priority, implement the scheduled customer support training, and optimize marketing spend based on efficiency metrics from previous campaigns.",
    6: "To improve the development process, the team should create a template for detailed acceptance criteria, include QA in planning sessions, break down complex tasks into smaller components, and implement a dependency mapping exercise during sprint planning.",
    7: "To manage the budget effectively, the team should proceed with the planned infrastructure upgrades and new hires in engineering while phasing some expenses across quarters, following the allocation patterns that worked well in previous quarters.",
  }

  // Return custom solution if available, otherwise generate a generic one
  return (
    customSolutions[meeting.id] ||
    "Based on the meeting information and identified challenges, the team should leverage existing knowledge and resources to implement a phased approach that addresses the key issues while maintaining project timelines and quality standards."
  )
}

// Mock function to get relevant reference sites based on meeting ID
export function getRelevantReferences(meetingId: number) {
  // Different references for different meeting types
  const referencesByMeeting: Record<number, Array<{ title: string; url: string; description: string }>> = {
    1: [
      {
        title: "Best Practices for API Development",
        url: "https://example.com/api-best-practices",
        description: "A comprehensive guide to modern API development techniques and standards.",
      },
      {
        title: "Dashboard Design Patterns",
        url: "https://example.com/dashboard-design",
        description: "Collection of effective dashboard design patterns for enterprise applications.",
      },
      {
        title: "Integration Testing Strategies",
        url: "https://example.com/integration-testing",
        description: "Learn how to create effective testing strategies for third-party integrations.",
      },
    ],
    2: [
      {
        title: "UI Design Principles",
        url: "https://example.com/ui-design",
        description: "Core principles for creating intuitive and effective user interfaces.",
      },
      {
        title: "Mobile Responsive Design",
        url: "https://example.com/responsive-design",
        description: "Techniques for ensuring designs work well across all device sizes.",
      },
      {
        title: "Data Visualization Best Practices",
        url: "https://example.com/data-viz",
        description:
          "Guidelines for creating clear and effective data visualizations that communicate insights clearly.",
      },
    ],
    3: [
      {
        title: "Authentication Security Best Practices",
        url: "https://example.com/auth-security",
        description: "Modern approaches to secure user authentication implementation.",
      },
      {
        title: "Performance Optimization Techniques",
        url: "https://example.com/performance-opt",
        description: "Methods for improving application performance and responsiveness.",
      },
      {
        title: "Automated Testing Frameworks",
        url: "https://example.com/testing-frameworks",
        description: "Overview of tools and approaches for automating regression testing.",
      },
    ],
    4: [
      {
        title: "Content Marketing Strategies",
        url: "https://example.com/content-marketing",
        description: "Effective approaches to content marketing for SaaS products.",
      },
      {
        title: "Webinar Production Guide",
        url: "https://example.com/webinar-guide",
        description: "Step-by-step guide to producing engaging webinars for enterprise customers.",
      },
      {
        title: "Social Media Campaign Planning",
        url: "https://example.com/social-campaigns",
        description: "Templates and strategies for effective social media campaigns.",
      },
    ],
    5: [
      {
        title: "Resource Allocation in Software Projects",
        url: "https://example.com/resource-allocation",
        description: "Strategies for effective resource allocation in software development.",
      },
      {
        title: "Customer Support Training Methods",
        url: "https://example.com/support-training",
        description: "Effective training approaches for customer support teams.",
      },
      {
        title: "Marketing Budget Optimization",
        url: "https://example.com/marketing-budget",
        description: "Techniques for optimizing marketing spend and measuring ROI.",
      },
    ],
    6: [
      {
        title: "Agile Acceptance Criteria Templates",
        url: "https://example.com/acceptance-criteria",
        description: "Templates and examples for writing detailed acceptance criteria.",
      },
      {
        title: "QA Integration in Agile Teams",
        url: "https://example.com/qa-integration",
        description: "Best practices for involving QA earlier in the development process.",
      },
      {
        title: "Task Estimation Techniques",
        url: "https://example.com/task-estimation",
        description: "Methods for more accurate estimation of complex development tasks.",
      },
    ],
    7: [
      {
        title: "IT Infrastructure Planning",
        url: "https://example.com/infrastructure-planning",
        description: "Guidelines for planning and budgeting IT infrastructure upgrades.",
      },
      {
        title: "Phased Budget Implementation",
        url: "https://example.com/phased-budgeting",
        description: "Strategies for implementing large budgets in phases across quarters.",
      },
      {
        title: "Tech Hiring Budget Planning",
        url: "https://example.com/tech-hiring-budget",
        description: "Approaches to budgeting for technical hiring in competitive markets.",
      },
    ],
  }

  return (
    referencesByMeeting[meetingId] || [
      {
        title: "Project Management Best Practices",
        url: "https://example.com/pm-best-practices",
        description: "A guide to effective project management techniques and methodologies.",
      },
      {
        title: "Team Collaboration Tools",
        url: "https://example.com/collaboration-tools",
        description: "Overview of tools and approaches for improving team collaboration.",
      },
      {
        title: "Problem-Solving Frameworks",
        url: "https://example.com/problem-solving",
        description: "Structured approaches to identifying and solving business challenges.",
      },
    ]
  )
}

export async function sendChallengeToSolution(challengeContent: string) {
  try {
    const response = await fetch(
      // デプロイ環境用
      process.env.NEXT_PUBLIC_API_ENDPOINT + '/solution_knowledge', { 
      // ローカル環境用
      //'http://127.0.0.1:8000/solution_knowledge', { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: challengeContent,
        is_search: true, // 検索クエリであることを示すフラグ
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send challenge to solution endpoint');
    }

    const data = await response.json();
    return {
      summary: data.summary || "検索結果のサマリー",
      knowledges: data.knowledges || [],
    };
  } catch (error) {
    console.error('Error sending challenge to solution:', error);
    throw error;
  }
}

