"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { getOtherUsersMeetings, Meeting } from "@/lib/meeting-data";

interface CarouselItem {
  id: number;
  title: string;
  author: string;
  date: string;
  //tags: string[]
}

export default function KnowledgeCarousel() {
  const router = useRouter();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleItems, setVisibleItems] = useState(3);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        console.log("Fetching other users meetings...");
        const latestMeetings = await getOtherUsersMeetings();
        console.log("Fetched meetings:", latestMeetings);
        setMeetings(latestMeetings);
      } catch (error) {
        console.error("Error fetching meetings:", error);
        setMeetings([]); // エラー時は空の配列を設定
      }
    };
    fetchMeetings();
  }, []);

  const carouselItems: CarouselItem[] = meetings.map((meeting) => ({
    id: meeting.id,
    title: meeting.knowledges[0]?.title || "タイトルなし", // 最初のナレッジのタイトルを使用
    author: meeting.user_name, // user_idの代わりにuser_nameを使用
    date: new Date(meeting.created_at).toLocaleDateString(),
    // tags: meeting.knowledges.map(k => k.title).slice(0, 3), // ナレッジのタイトルをタグとして使用
  }));

  useEffect(() => {
    const updateVisibleItems = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setVisibleItems(1);
      } else if (width < 1024) {
        setVisibleItems(2);
      } else {
        setVisibleItems(3);
      }
    };

    updateVisibleItems();
    window.addEventListener("resize", updateVisibleItems);
    return () => window.removeEventListener("resize", updateVisibleItems);
  }, []);

  const maxIndex = Math.max(0, carouselItems.length - visibleItems);

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  const handleItemClick = (id: number) => {
    // 開発中のメッセージを表示
    alert("申し訳ありません。本機能は現在開発中です");
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1"></div>
        <div className="flex gap-2">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={cn(
              "p-1 rounded-full",
              currentIndex === 0 ? "text-navy/40" : "hover:bg-blue/10 text-navy"
            )}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={handleNext}
            disabled={currentIndex >= maxIndex}
            className={cn(
              "p-1 rounded-full",
              currentIndex >= maxIndex
                ? "text-navy/40"
                : "hover:bg-blue/10 text-navy"
            )}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="overflow-hidden" ref={containerRef}>
        <div
          className="flex transition-transform duration-300 ease-in-out"
          style={{
            transform: `translateX(-${currentIndex * (100 / visibleItems)}%)`,
          }}
        >
          {carouselItems.map((item) => (
            <div
              key={item.id}
              className="min-w-[calc(100%/var(--visible-items))] px-2"
              style={{ "--visible-items": visibleItems } as any}
            >
              <div
                className="border border-blue/20 rounded-lg p-4 hover:border-blue/50 transition-colors cursor-pointer bg-white"
                onClick={() => handleItemClick(item.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-medium text-navy">{item.title}</h3>
                    <p className="text-sm text-navy/70">by {item.author}</p>
                  </div>
                </div>

                {/*  Tags
                {item.tags.length > 0 && (
                  <div className="flex items-center flex-wrap gap-1 mt-2 mb-1">
                    <Tag size={12} className="text-blue" />
                    {item.tags.map((tag, index) => (
                      <span key={index} className="text-xs px-2 py-0.5 bg-blue/10 text-navy rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              */}
                <div className="text-xs text-navy/60 mt-2">{item.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
