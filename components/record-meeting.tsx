"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Mic,
  Pause,
  Play,
  Square,
  Save,
  Edit,
  Check,
  X,
  BookOpen,
  Lightbulb,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

// 録音状態を管理するための enum
enum RecordingState {
  IDLE = 0,
  REQUESTING_PERMISSION = 1,
  RECORDING = 2,
  PAUSED = 3,
  STOPPED = 4,
  PROCESSING = 5,
  COMPLETED = 6,
}

// 個別の知見・課題の型定義
interface KnowledgeItem {
  id: number;
  title: string;
  content: string;
  tags: string[];
}

interface ChallengeItem {
  id: number;
  title: string;
  content: string;
  tags: string[];
}

// 会議全体のデータ構造
interface MeetingSummary {
  summary: string;
  knowledges: KnowledgeItem[];
  challenges: ChallengeItem[];
  solutionKnowledge: string;
}

export default function RecordMeeting() {
  const router = useRouter();

  // 各 state の初期化
  const [meetingId, setMeetingId] = useState<number | null>(null);
  const [meetingTitle, setMeetingTitle] = useState<string>("");
  const [meetingSummary, setMeetingSummary] = useState<MeetingSummary>({
    summary: "",
    knowledges: [],
    challenges: [],
    solutionKnowledge: "",
  });
  const [recordingState, setRecordingState] = useState<RecordingState>(
    RecordingState.IDLE
  );
  const [recordingTime, setRecordingTime] = useState(0);
  const [isEditing, setIsEditing] = useState(false);

  // 保存用ID（update 時用）※バックエンドで設定されたIDを保持
  const [knowledgeId, setKnowledgeId] = useState<number | null>(null);
  const [challengeId, setChallengeId] = useState<number | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const knowledgeTagInputRef = useRef<HTMLInputElement>(null);
  const challengeTagInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // 録音開始
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
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setRecordingState(RecordingState.IDLE);
    }
  };

  // 一時停止／再開
  const pauseRecording = () => {
    if (
      mediaRecorderRef.current &&
      recordingState === RecordingState.RECORDING
    ) {
      mediaRecorderRef.current.pause();
      setRecordingState(RecordingState.PAUSED);
      if (timerRef.current) clearInterval(timerRef.current);
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

  // 録音停止
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      const recorder = mediaRecorderRef.current;
      recorder.onstop = () => {
        console.log("Recording fully stopped");
        saveRecording();
      };
      recorder.stop();
      setRecordingState(RecordingState.STOPPED);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  // 録音データ送信と結果受信
  const saveRecording = async () => {
    setRecordingState(RecordingState.PROCESSING);
    if (audioChunksRef.current.length === 0) {
      console.error("No audio data available");
      return;
    }

    const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
    const formData = new FormData();
    formData.append("file", audioBlob, "meeting.webm");
    formData.append("user_id", "1");

    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_API_ENDPOINT + "/upload-audio",
        { method: "POST", body: formData }
      );
      if (!response.ok) throw new Error("Audio file upload failed");

      // レスポンス受信後の処理例（修正箇所）
      const result = await response.json();

      // meeting_id および meeting.title（不要な引用符の除去付き）をセット
      setMeetingId(result.meeting_id);
      setMeetingTitle(
        result.meeting.title ? result.meeting.title.replace(/^"|"$/g, "") : ""
      );

      // knowledges / challenges はトップレベルに存在するため、それぞれから id を取得
      setKnowledgeId(result.knowledges[0]?.id || null);
      setChallengeId(result.challenges[0]?.id || null);

      console.log("Upload successful:", result);

      // meetingSummary の各項目をセット（title に関しては両端の引用符を除去）
      setMeetingSummary({
        summary: result.meeting.summary,
        knowledges: result.knowledges.map((k: any) => ({
          id: k.id,
          title: k.title
            ? k.title.replace(/^"|"$/g, "")
            : "デフォルト知見タイトル",
          content: k.content,
          tags: k.tags || [],
        })),
        challenges: result.challenges.map((c: any) => ({
          id: c.id,
          title: c.title
            ? c.title.replace(/^"|"$/g, "")
            : "デフォルト課題タイトル",
          content: c.content,
          tags: c.tags || [],
        })),
        solutionKnowledge: "",
      });

      setRecordingState(RecordingState.COMPLETED);
    } catch (error) {
      console.error("Error during upload:", error);
      setRecordingState(RecordingState.STOPPED);
    }

    if (mediaRecorderRef.current) {
      const tracks = mediaRecorderRef.current.stream.getTracks();
      tracks.forEach((track) => track.stop());
      mediaRecorderRef.current = null;
    }
    audioChunksRef.current = [];
  };

  // 編集用：Summary は単一項目なのでそのまま
  const handleSummaryChange = (field: keyof MeetingSummary, value: string) => {
    setMeetingSummary((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // 編集用：特定の知見の更新関数
  const updateKnowledgeItem = (
    index: number,
    field: keyof KnowledgeItem,
    value: string
  ) => {
    setMeetingSummary((prev) => {
      const newKnowledges = [...prev.knowledges];
      newKnowledges[index] = { ...newKnowledges[index], [field]: value };
      return { ...prev, knowledges: newKnowledges };
    });
  };

  // 編集用：特定の課題の更新関数
  const updateChallengeItem = (
    index: number,
    field: keyof ChallengeItem,
    value: string
  ) => {
    setMeetingSummary((prev) => {
      const newChallenges = [...prev.challenges];
      newChallenges[index] = { ...newChallenges[index], [field]: value };
      return { ...prev, challenges: newChallenges };
    });
  };

  // 編集内容の保存（PUTリクエスト）
  const saveEditedMeeting = async () => {
    if (!meetingId) {
      alert("保存できる会議IDがありません");
      return;
    }
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_ENDPOINT}/update-meeting/${meetingId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          // knowledges/challenges をそれぞれ配列として送信
          body: JSON.stringify({
            title: meetingTitle,
            summary: meetingSummary.summary,
            knowledges: meetingSummary.knowledges,
            challenges: meetingSummary.challenges,
          }),
        }
      );
      if (!response.ok) throw new Error("Update failed");
      const result = await response.json();
      console.log("Update response:", result);
      if (result.meeting_id) {
        setMeetingId(result.meeting_id);
      } else {
        console.error("No meeting_id returned from server");
      }
      alert("編集内容を保存しました");
      router.push(`/meeting/${meetingId}`);
      setTimeout(() => router.refresh(), 300);
    } catch (error) {
      console.error("PUT request error:", error);
    }
  };

  //const handleUploadClick = async (e: React.ChangeEvent<HTMLInputElement>) => {
  // const file = e.target.files?.[0];
  //  if (!file) return;
  //  const formData = new FormData();
  //   formData.append("file", file);
  //   formData.append("user_id", "1");

  //   try {
  //     const response = await fetch(
  //       process.env.NEXT_PUBLIC_API_ENDPOINT + "/upload-audio",
  //       { method: "POST", body: formData }
  //     );
  //     if (!response.ok) throw new Error("Audio file upload failed");
  //     const result = await response.json();

  //     setMeetingId(result.meeting_id);
  //     setKnowledgeId(result.parsed_summary.knowledges[0]?.id || null);
  //     setChallengeId(result.parsed_summary.challenges[0]?.id || null);
  //     console.log("Upload successful:", result);

  //     setMeetingSummary({
  //       summary: result.parsed_summary.summary,
  //       knowledges: result.parsed_summary.knowledges.map((k: any) => ({
  //         id: k.id,
  //         // title が存在する場合、両端の引用符 " を除去する処理を追加
  //         title: k.title
  //           ? k.title.replace(/^"|"$/g, "")
  //           : "デフォルト知見タイトル",
  //         content: k.content,
  //         tags: k.tags || [],
  //       })),
  //       challenges: result.parsed_summary.challenges.map((c: any) => ({
  //         id: c.id,
  //         title: c.title
  //           ? c.title.replace(/^"|"$/g, "")
  //           : "デフォルト課題タイトル",
  //         content: c.content,
  //         tags: c.tags || [],
  //       })),
  //       solutionKnowledge: "",
  //     });
  //     setRecordingState(RecordingState.COMPLETED);
  //   } catch (error) {
  //     console.error("Error during file upload:", error);
  //     setRecordingState(RecordingState.STOPPED);
  //   }

  //   if (mediaRecorderRef.current) {
  //     const tracks = mediaRecorderRef.current.stream.getTracks();
  //     tracks.forEach((track) => track.stop());
  //     mediaRecorderRef.current = null;
  //   }
  //   audioChunksRef.current = [];
  // };

  // レンダリング：録音状態に応じた UI
  const renderContent = () => {
    switch (recordingState) {
      case RecordingState.IDLE:
        return (
          <div className="flex flex-col items-center justify-center py-12 space-y-6">
            <div className="w-24 h-24 rounded-full bg-blue/10 flex items-center justify-center">
              <Mic size={48} className="text-blue" />
            </div>
            <h2 className="text-2xl font-semibold text-navy">
              録音を開始します
            </h2>
            <p className="text-navy/70 text-center max-w-md">
            下のボタンをクリックすると、会議の録音が開始されます。
            音声は要約を作成するために処理されます。
            </p>
            {/*<div>
              <input
                accept="audio/*"
                id="upload-button"
                type="file"
                onChange={handleUploadClick}
              />
            </div>*/}
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
              マイク接続のリクエスト
            </h2>
            <p className="text-navy/70 text-center max-w-md">
              録音を開始するには、マイクにアクセスできるようにしてください。
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
                ? "録音中"
                : "録音一時停止"}
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
              処理中
            </h2>
            <p className="text-navy/70 text-center max-w-md">
              録音したデータを処理中です。しばらくお待ちください。
            </p>
          </div>
        );

      case RecordingState.COMPLETED:
        return (
          <div className="space-y-8 py-8">
            <header className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-navy">
                Meeting Record
              </h2>
              <Button
                variant={isEditing ? "default" : "outline"}
                onClick={() => setIsEditing(!isEditing)}
                className="gap-2"
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
            </header>

            {/* Summary Card */}
            <div className="bg-white border border-blue/20 rounded-lg p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="bg-blue/10 p-2 rounded-full">
                  <BookOpen className="text-blue h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-navy mb-3">
                    Summary
                  </h2>
                  {isEditing ? (
                    <Textarea
                      value={meetingSummary.summary}
                      onChange={(e) =>
                        handleSummaryChange("summary", e.target.value)
                      }
                      className="min-h-[120px] bg-white border-blue/20"
                    />
                  ) : (
                    <p className="text-navy/80 leading-relaxed whitespace-pre-wrap">
                      {meetingSummary.summary}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Knowledge Card */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-navy">Knowledge</h2>
              {meetingSummary.knowledges.map((item, index) => (
                <div
                  key={item.id}
                  className="bg-white border border-blue/20 rounded-lg p-6 shadow-sm mb-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-yellow/10 p-2 rounded-full">
                      <Lightbulb className="text-yellow h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      {isEditing ? (
                        <>
                          <Input
                            value={item.title}
                            onChange={(e) =>
                              updateKnowledgeItem(
                                index,
                                "title",
                                e.target.value
                              )
                            }
                            className="mb-2"
                          />
                          <Textarea
                            value={item.content}
                            onChange={(e) =>
                              updateKnowledgeItem(
                                index,
                                "content",
                                e.target.value
                              )
                            }
                            className="min-h-[100px] bg-white border-blue/20"
                          />
                        </>
                      ) : (
                        <>
                          <h3 className="text-lg font-medium text-navy mb-3">
                            {item.title}
                          </h3>
                          <p className="text-navy/80 leading-relaxed whitespace-pre-wrap">
                            {item.content}
                          </p>
                        </>
                      )}
                      {/* タグ表示（必要なら） */}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Challenge Card */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-navy">Challenge</h2>
              {meetingSummary.challenges.map((item, index) => (
                <div
                  key={item.id}
                  className="bg-white border border-blue/20 rounded-lg p-6 shadow-sm mb-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-red-100 p-2 rounded-full">
                      <AlertTriangle className="text-red-500 h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      {isEditing ? (
                        <>
                          <Input
                            value={item.title}
                            onChange={(e) =>
                              updateChallengeItem(
                                index,
                                "title",
                                e.target.value
                              )
                            }
                            className="mb-2"
                          />
                          <Textarea
                            value={item.content}
                            onChange={(e) =>
                              updateChallengeItem(
                                index,
                                "content",
                                e.target.value
                              )
                            }
                            className="min-h-[100px] bg-white border-blue/20"
                          />
                        </>
                      ) : (
                        <>
                          <h3 className="text-lg font-medium text-navy mb-3">
                            {item.title}
                          </h3>
                          <p className="text-navy/80 leading-relaxed whitespace-pre-wrap">
                            {item.content}
                          </p>
                        </>
                      )}
                      {/* タグ表示（必要なら） */}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <Button
                size="lg"
                onClick={saveEditedMeeting}
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
