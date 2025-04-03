"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import {
  Mic,
  Pause,
  Play,
  Square,
  Save,
  Edit,
  Check,
  X,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import {
  extractTagsFromText,
  getAllMeetings,
  currentUser,
} from "@/lib/meeting-data";

enum RecordingState {
  IDLE = 0,
  REQUESTING_PERMISSION = 1,
  RECORDING = 2,
  PAUSED = 3,
  STOPPED = 4,
  PROCESSING = 5,
  COMPLETED = 6,
}

// Update the MeetingSummary interface
interface MeetingSummary {
  summary: string;
  knowledge: string;
  knowledgeTags: string[];
  issues: string;
  challengeTags: string[]; // Changed from issueTags
  solutionKnowledge: string;
}

export default function RecordMeeting() {
  const router = useRouter();
  const [recordingState, setRecordingState] = useState<RecordingState>(
    RecordingState.IDLE
  );
  const [recordingTime, setRecordingTime] = useState(0);
  const [isEditing, setIsEditing] = useState(false);

  // Update the initial state
  const [meetingSummary, setMeetingSummary] = useState<MeetingSummary>({
    summary: "",
    knowledge: "",
    knowledgeTags: [],
    issues: "",
    challengeTags: [], // Changed from issueTags
    solutionKnowledge: "",
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const knowledgeTagInputRef = useRef<HTMLInputElement>(null);
  // Rename issueTagInputRef to challengeTagInputRef
  const challengeTagInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const startRecording = async () => {
    setRecordingState(RecordingState.REQUESTING_PERMISSION);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      setRecordingState(RecordingState.RECORDING);

      // Start timer
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setRecordingState(RecordingState.IDLE);
    }
  };

  const pauseRecording = () => {
    if (
      mediaRecorderRef.current &&
      recordingState === RecordingState.RECORDING
    ) {
      mediaRecorderRef.current.pause();
      setRecordingState(RecordingState.PAUSED);

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    } else if (
      mediaRecorderRef.current &&
      recordingState === RecordingState.PAUSED
    ) {
      mediaRecorderRef.current.resume();
      setRecordingState(RecordingState.RECORDING);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecordingState(RecordingState.STOPPED);

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  // Update the saveRecording function
  const saveRecording = () => {
    setRecordingState(RecordingState.PROCESSING);

    // Simulate AI processing
    setTimeout(() => {
      // In a real app, you would send the audio to an API for transcription and summarization
      const knowledge =
        "- Enhanced reporting dashboard is a high priority for enterprise customers\n- Mobile app improvements are needed for the next release\n- Integration with third-party tools is planned\n- API improvements should be included in the roadmap";

      const issues =
        "- Timeline for API improvements needs to be determined\n- Resources for the reporting dashboard need to be allocated\n- Testing strategy for third-party integrations needs to be developed";

      // Auto-generate tags from the knowledge and issues text
      const knowledgeTags = extractTagsFromText(knowledge);
      const challengeTags = extractTagsFromText(issues);

      setMeetingSummary({
        summary:
          "This meeting focused on the Q3 product roadmap. The team discussed prioritizing features for the next release, including an enhanced reporting dashboard, mobile app improvements, and integration with third-party tools. The team also discussed API improvements that were mentioned in a previous meeting.",
        knowledge,
        knowledgeTags,
        issues,
        challengeTags,
        solutionKnowledge:
          "- Previous API improvement projects typically took 4-6 weeks\n- The design team has dashboard templates that can accelerate development\n- We have documentation from previous third-party integrations\n- The QA team has developed a standard testing framework for integrations",
      });

      setRecordingState(RecordingState.COMPLETED);

      // Reset recording state
      if (mediaRecorderRef.current) {
        const tracks = mediaRecorderRef.current.stream.getTracks();
        tracks.forEach((track) => track.stop());
        mediaRecorderRef.current = null;
      }
      audioChunksRef.current = [];
    }, 2000);
  };

  const handleSummaryChange = (
    field: keyof MeetingSummary,
    value: string | string[]
  ) => {
    setMeetingSummary((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleKnowledgeTagInput = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter" && e.currentTarget.value.trim() !== "") {
      e.preventDefault();
      const newTag = e.currentTarget.value.trim();
      if (!meetingSummary.knowledgeTags.includes(newTag)) {
        handleSummaryChange("knowledgeTags", [
          ...meetingSummary.knowledgeTags,
          newTag,
        ]);
      }
      e.currentTarget.value = "";
    }
  };

  // Rename handleIssueTagInput to handleChallengeTagInput
  const handleChallengeTagInput = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter" && e.currentTarget.value.trim() !== "") {
      e.preventDefault();
      const newTag = e.currentTarget.value.trim();
      if (!meetingSummary.challengeTags.includes(newTag)) {
        handleSummaryChange("challengeTags", [
          ...meetingSummary.challengeTags,
          newTag,
        ]);
      }
      e.currentTarget.value = "";
    }
  };

  // Rename removeIssueTag to removeChallengeTag
  const removeChallengeTag = (tagToRemove: string) => {
    handleSummaryChange(
      "challengeTags",
      meetingSummary.challengeTags.filter((tag) => tag !== tagToRemove)
    );
  };

  const removeKnowledgeTag = (tagToRemove: string) => {
    handleSummaryChange(
      "knowledgeTags",
      meetingSummary.knowledgeTags.filter((tag) => tag !== tagToRemove)
    );
  };

  const finalizeMeeting = async () => {
    // In a real app, you would save the meeting data to your backend
    // and get the ID of the newly created meeting
    // Get the current meetings to find the highest ID
    const allMeetings = getAllMeetings();
    const newMeetingId = Math.max(...allMeetings.map((m) => m.id)) + 1;

    // Create a new meeting object
    const newMeeting = {
      id: newMeetingId,
      user_id: currentUser,
      title: meetingSummary.title || "Product Roadmap Discussion", // This would come from user input in a real app
      summary: meetingSummary.summary,
      knowledge: meetingSummary.knowledge,
      issues: meetingSummary.issues,
      solutionKnowledge: meetingSummary.solutionKnowledge,
      created_at: new Date().toISOString(),
      //knowledgeTags: meetingSummary.knowledgeTags,
      //challengeTags: meetingSummary.challengeTags,
      //messages: [],
      //isDocument: false,
    };
    console.log("送信されたnewMeetingの内容", newMeeting);
    // In a real app, you would add this to your database
    // For now, we'll just navigate to an existing meeting
    try {
      const res = await fetch("http://127.0.0.1:8001" + "/meeting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMeeting),
      });

      if (!res.ok) {
        throw new Error("Failed to create meeting");
      }

      const responseData = await res.json();
      console.log("success", responseData);
    } catch (error) {
      console.log("Error", error.message);
    }
    // Navigate to the meeting detail page
    //router.push(`/meeting/1`)
  };

  const renderContent = () => {
    switch (recordingState) {
      case RecordingState.IDLE:
        return (
          <div className="flex flex-col items-center justify-center py-12 space-y-6">
            <div className="w-24 h-24 rounded-full bg-blue/10 flex items-center justify-center">
              <Mic size={48} className="text-blue" />
            </div>
            <h2 className="text-2xl font-semibold text-navy">
              Start Recording
            </h2>
            <p className="text-navy/70 text-center max-w-md">
              Click the button below to start recording your meeting. The audio
              will be processed to generate a summary.
            </p>
            <Button
              size="lg"
              onClick={startRecording}
              className="gap-2 bg-blue hover:bg-blue/90"
            >
              <Mic size={18} />
              Start Recording
            </Button>
          </div>
        );

      case RecordingState.REQUESTING_PERMISSION:
        return (
          <div className="flex flex-col items-center justify-center py-12 space-y-6">
            <div className="w-24 h-24 rounded-full bg-blue/10 flex items-center justify-center animate-pulse">
              <Mic size={48} className="text-blue" />
            </div>
            <h2 className="text-2xl font-semibold text-navy">
              Requesting Microphone Access
            </h2>
            <p className="text-navy/70 text-center max-w-md">
              Please allow access to your microphone to start recording.
            </p>
          </div>
        );

      case RecordingState.RECORDING:
      case RecordingState.PAUSED:
        return (
          <div className="flex flex-col items-center justify-center py-12 space-y-6">
            <div
              className={`w-24 h-24 rounded-full ${
                recordingState === RecordingState.RECORDING
                  ? "bg-red-500"
                  : "bg-yellow"
              } flex items-center justify-center`}
            >
              <span className="text-white text-xl font-bold">
                {formatTime(recordingTime)}
              </span>
            </div>
            <h2 className="text-2xl font-semibold text-navy">
              {recordingState === RecordingState.RECORDING
                ? "Recording in Progress"
                : "Recording Paused"}
            </h2>
            <div className="flex gap-4">
              <Button
                variant="outline"
                size="lg"
                onClick={pauseRecording}
                className="gap-2 border-blue text-blue hover:bg-blue/10"
              >
                {recordingState === RecordingState.RECORDING ? (
                  <>
                    <Pause size={18} />
                    Pause
                  </>
                ) : (
                  <>
                    <Play size={18} />
                    Resume
                  </>
                )}
              </Button>
              <Button
                variant="destructive"
                size="lg"
                onClick={stopRecording}
                className="gap-2"
              >
                <Square size={18} />
                Stop Recording
              </Button>
            </div>
          </div>
        );

      case RecordingState.STOPPED:
        return (
          <div className="flex flex-col items-center justify-center py-12 space-y-6">
            <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center">
              <Check size={48} className="text-white" />
            </div>
            <h2 className="text-2xl font-semibold text-navy">
              Recording Complete
            </h2>
            <p className="text-navy/70 text-center max-w-md">
              Your recording is ready to be processed. Click the button below to
              generate a summary.
            </p>
            <div className="flex gap-4">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setRecordingState(RecordingState.IDLE)}
                className="border-blue text-blue hover:bg-blue/10"
              >
                Discard
              </Button>
              <Button
                size="lg"
                onClick={saveRecording}
                className="gap-2 bg-blue hover:bg-blue/90"
              >
                <Save size={18} />
                Process Recording
              </Button>
            </div>
          </div>
        );

      case RecordingState.PROCESSING:
        return (
          <div className="flex flex-col items-center justify-center py-12 space-y-6">
            <div className="w-24 h-24 rounded-full bg-blue/10 flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-blue border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h2 className="text-2xl font-semibold text-navy">
              Processing Recording
            </h2>
            <p className="text-navy/70 text-center max-w-md">
              Your recording is being processed. This may take a few moments.
            </p>
          </div>
        );

      case RecordingState.COMPLETED:
        return (
          <div className="space-y-6 py-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-navy">
                Meeting Record
              </h2>
              <Button
                variant={isEditing ? "default" : "outline"}
                onClick={() => setIsEditing(!isEditing)}
                className={`gap-2 ${
                  isEditing
                    ? "bg-blue hover:bg-blue/90"
                    : "border-blue text-blue hover:bg-blue/10"
                }`}
              >
                {isEditing ? (
                  <>
                    <Check size={18} />
                    Done Editing
                  </>
                ) : (
                  <>
                    <Edit size={18} />
                    Edit
                  </>
                )}
              </Button>
            </div>

            <div className="space-y-6">
              <Card className="bg-cream border-blue/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-navy text-lg">Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <Textarea
                      value={meetingSummary.summary}
                      onChange={(e) =>
                        handleSummaryChange("summary", e.target.value)
                      }
                      className="min-h-[120px] bg-white border-blue/20"
                    />
                  ) : (
                    <p className="whitespace-pre-wrap text-navy/80">
                      {meetingSummary.summary}
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-cream border-blue/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-navy text-lg flex items-center justify-between">
                    <span>Knowledge</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditing ? (
                    <Textarea
                      value={meetingSummary.knowledge}
                      onChange={(e) =>
                        handleSummaryChange("knowledge", e.target.value)
                      }
                      className="min-h-[120px] bg-white border-blue/20"
                    />
                  ) : (
                    <p className="whitespace-pre-wrap text-navy/80">
                      {meetingSummary.knowledge}
                    </p>
                  )}

                  {/* Knowledge Tags */}
                  <div className="pt-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Tag size={16} className="text-blue" />
                      <span className="text-sm font-medium text-navy">
                        Tags
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {meetingSummary.knowledgeTags.map((tag, index) => (
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
                  <CardTitle className="text-navy text-lg">Challenge</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditing ? (
                    <Textarea
                      value={meetingSummary.issues}
                      onChange={(e) =>
                        handleSummaryChange("issues", e.target.value)
                      }
                      className="min-h-[120px] bg-white border-blue/20"
                    />
                  ) : (
                    <p className="whitespace-pre-wrap text-navy/80">
                      {meetingSummary.issues}
                    </p>
                  )}

                  {/* Challenge Tags */}
                  <div className="pt-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Tag size={16} className="text-blue" />
                      <span className="text-sm font-medium text-navy">
                        Tags
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {meetingSummary.challengeTags.map((tag, index) => (
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
              <Button
                size="lg"
                onClick={finalizeMeeting}
                className="gap-2 bg-blue hover:bg-blue/90"
              >
                <Save size={18} />
                Save meeting
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return <div className="w-full max-w-4xl mx-auto">{renderContent()}</div>;
}
