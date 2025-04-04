// 会議録音から要約・知見・課題の表示と編集ができるWebアプリ
// React + Next.jsで構成。録音、サマリー生成、タグ付け、編集保存機能付き
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

//録音の状態を管理するための enum 例えば、録音中は RECORDING、録音停止後は STOPPED など、状態を定義
enum RecordingState {
  IDLE = 0,
  REQUESTING_PERMISSION = 1,
  RECORDING = 2,
  PAUSED = 3,
  STOPPED = 4,
  PROCESSING = 5,
  COMPLETED = 6,
}

//20250404追加（knowledgeTitle challengeTitle)======================================
// 会議の要約データ構造を定義
interface MeetingSummary {
  summary: string;
  knowledge: string;
  knowledgeTitle: string; // ← 20250404追加
  knowledgeTags: string[];
  issues: string;
  challengeTitle: string; // ← 20250404追加
  challengeTags: string[]; // Changed from issueTags
  solutionKnowledge: string;
}
//=================================================================================

export default function RecordMeeting() {
  const router = useRouter();

  // 会議ID（新規作成後にバックエンドから受け取るID）★ここを追加！
  const [meetingId, setMeetingId] = useState<number | null>(null); // ★ここ追加

  // 録音状態（録音中／停止中など）を管理するステート
  const [recordingState, setRecordingState] = useState<RecordingState>(
    RecordingState.IDLE
  );

  // 録音時間をカウントするステート
  const [recordingTime, setRecordingTime] = useState(0);

  // 編集モードかどうか
  const [isEditing, setIsEditing] = useState(false);

  // 20250404追加（knowledgeTitle　challengeTitle）==========================================================
  // 会議の内容（サマリー、知見、悩みなど）を保持するステート
  const [meetingSummary, setMeetingSummary] = useState<MeetingSummary>({
    summary: "",
    knowledge: "",
    knowledgeTitle: "", // ← 20250404追加
    knowledgeTags: [],
    issues: "",
    challengeTitle: "", // ← 20250404追加
    challengeTags: [], // Changed from issueTags
    solutionKnowledge: "",
  });
  //========================================================================================================

  //==============================================
  //★★20250404追加 🆕 会議タイトルを保存するためのステート
  const [meetingTitle, setMeetingTitle] = useState<string>("");
  //==============================================

  // 会議IDと各項目のIDを保存する
  const [knowledgeId, setKnowledgeId] = useState<number | null>(null);
  const [challengeId, setChallengeId] = useState<number | null>(null);

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

  // 録音開始処理
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

  // 録音一時停止・再開
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

  // ★（新コード）録音停止処理
  //MediaRecorder.stop() は非同期処理。onstop は録音データが完全に受信されたあとに呼ばれるので、録音データが空ではない状態で saveRecording() が動く
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      const recorder = mediaRecorderRef.current;

      recorder.onstop = () => {
        console.log("🎤 録音が完全に停止しました");
        console.log("🧩 チャンク数：", audioChunksRef.current.length);
        saveRecording(); // ✅ ここで呼び出す！
      };

      recorder.stop(); // 録音停止（ここでは saveRecording を呼ばない）
      setRecordingState(RecordingState.STOPPED);

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  // (当初のコード）録音停止処理
  //  const stopRecording = () => {
  //    if (mediaRecorderRef.current) {
  //      mediaRecorderRef.current.stop();
  //      setRecordingState(RecordingState.STOPPED);

  //      if (timerRef.current) {
  //        clearInterval(timerRef.current);
  //      }
  //    }
  //  };

  // (当初のコード）録音データをサーバに送信する
  //  const saveRecording = () => {
  //   setRecordingState(RecordingState.PROCESSING);

  // Simulate AI processing
  //   setTimeout(() => {
  // In a real app, you would send the audio to an API for transcription and summarization
  //   const knowledge =
  //     "- Enhanced reporting dashboard is a high priority for enterprise customers\n- Mobile app improvements are needed for the next release\n- Integration with third-party tools is planned\n- API improvements should be included in the roadmap";

  //     const issues =
  //       "- Timeline for API improvements needs to be determined\n- Resources for the reporting dashboard need to be allocated\n- Testing strategy for third-party integrations needs to be developed";

  // Auto-generate tags from the knowledge and issues text
  //      const knowledgeTags = extractTagsFromText(knowledge);
  //  /   const challengeTags = extractTagsFromText(issues);

  //      setMeetingSummary({
  //        summary:
  //          "This meeting focused on the Q3 product roadmap. The team discussed prioritizing features for the next release, including an enhanced reporting dashboard, mobile app improvements, and integration with third-party tools. The team also discussed API improvements that were mentioned in a previous meeting.",
  //        knowledge,
  //        knowledgeTags,
  //        issues,
  //        challengeTags,
  //        solutionKnowledge:
  //          "- Previous API improvement projects typically took 4-6 weeks\n- The design team has dashboard templates that can accelerate development\n- We have documentation from previous third-party integrations\n- The QA team has developed a standard testing framework for integrations",
  //      });

  //      setRecordingState(RecordingState.COMPLETED);

  // ★（新コード20250401）録音データをサーバー（FastAPI）に送信して、要約などを受け取る関数
  const saveRecording = async () => {
    // UIに「現在処理中です」と表示させるため、状態を更新
    setRecordingState(RecordingState.PROCESSING);

    // 録音データが空の場合、エラーメッセージを出して処理を中断
    if (audioChunksRef.current.length === 0) {
      console.error("録音データがありません");
      return;
    }

    // 録音中に集めた音声のかけら（Blob）を1つの音声ファイルにまとめる
    const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });

    // FormData（送信用の封筒）を作り、その中に音声ファイルを入れる
    const formData = new FormData();
    formData.append("file", audioBlob, "meeting.webm"); // "file" という名前で送る
    formData.append("user_id", "1"); //   ★202050403 追加：FastAPI側で必須

    try {
      // fetchを使って、FastAPIのエンドポイントにPOST送信する
      const response = await fetch("http://localhost:8000/upload-audio", {
        method: "POST",
        body: formData,
      });

      // 通信がうまくいかなかった場合はエラーを出す
      if (!response.ok) {
        throw new Error("音声ファイルのアップロードに失敗しました");
      }

      // サーバーから返ってきたJSONデータを取得
      const result = await response.json();

      //==============================================
      // ★★20250404追加　🆕 タイトルをステートに保存！
      setMeetingTitle(result.title);
      //==============================================

      //録音完了時にmeeting_idを保存
      setMeetingId(result.meeting_id); // ← ★ここ追加（ステートに保存）
      setKnowledgeId(result.parsed_summary.knowledges[0]?.id || null);
      setChallengeId(result.parsed_summary.challenges[0]?.id || null);

      console.log("アップロード成功:", result);

      //20250404追加（knowledgeTitle　challengeTitle)=============================================
      // サーバーからの結果を画面に表示するため、stateに保存
      setMeetingSummary({
        summary: result.parsed_summary.summary,
        knowledge: result.parsed_summary.knowledges
          .map((k) => k.content)
          .join("\n"),
        knowledgeTitle:
          result.parsed_summary.knowledges[0]?.title || "自動知見タイトル", // ← 20250404追加
        knowledgeTags: [], // ← タグが必要なら後でここを拡張
        issues: result.parsed_summary.challenges
          .map((c) => c.content)
          .join("\n"),
        challengeTitle:
          result.parsed_summary.challenges[0]?.title || "自動課題タイトル", // ← 20250404追加
        challengeTags: [],
        solutionKnowledge: "", // 今は未使用なので空でOK
      });
      //===========================================================================================

      // UIの状態を「完了」に変更し、要約表示などを可能にする
      setRecordingState(RecordingState.COMPLETED);
    } catch (error) {
      // エラーが起きた場合の処理（ログ表示と状態リセット）
      console.error("送信中にエラー:", error);
      setRecordingState(RecordingState.STOPPED);
    }

    // マイクを止めるため、MediaRecorderの音声ストリームを全て停止
    if (mediaRecorderRef.current) {
      const tracks = mediaRecorderRef.current.stream.getTracks();
      tracks.forEach((track) => track.stop()); // 全てのトラックを停止
      mediaRecorderRef.current = null; // recorderを初期化
    }

    // 録音データをリセット（次回の録音に備える）
    audioChunksRef.current = [];
  };

  //当初のコード（20250401) マイクを止めるため、MediaRecorderの音声ストリームをすべて停止
  //      if (mediaRecorderRef.current) {
  //        const tracks = mediaRecorderRef.current.stream.getTracks();
  //        tracks.forEach((track) => track.stop());
  //        mediaRecorderRef.current = null;
  //     }
  //      audioChunksRef.current = [];
  //    }, 2000);
  //  };

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

  // removeIssueTag の名前を removeChallengeTag に変更します
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

  //finalizeMeeting関数の書き換え　★追加
  const finalizeMeeting = () => {
    if (!meetingId) {
      alert("保存できる会議が見つかりません");
      return;
    }

    router.push(`/meeting/${meetingId}`); // ← 実際のmeeting_idで詳細画面へ遷移
  };

  //元のfinalizeMeeting関数
  //  const finalizeMeeting = () => {
  // 実際のアプリでは, 会議データをバックエンドに保存して
  // 新しく作成された会議のIDを取得する

  // 現在の会議を取得して、最も高い ID を見つけます
  //    const allMeetings = getAllMeetings();
  //    const newMeetingId = Math.max(...allMeetings.map((m) => m.id)) + 1;

  // 新しい会議オブジェクトを作成する
  //    const newMeeting = {
  //      id: newMeetingId,
  //      title: "Product Roadmap Discussion", // 仮タイトル　これは、実際のアプリでのユーザー入力から取得されます
  //      date: "Today",
  //      participants: ["Sarah Johnson", "Michael Chen", "David Kim"],
  //      owner: currentUser,
  //      summary: meetingSummary.summary,
  //     knowledge: meetingSummary.knowledge,
  //      knowledgeTags: meetingSummary.knowledgeTags,
  //      issues: meetingSummary.issues,
  //      challengeTags: meetingSummary.challengeTags,
  //      solutionKnowledge: meetingSummary.solutionKnowledge,
  //      messages: [],
  //      isDocument: false,
  //    };

  //    router.push(`/meeting/1`); //仮遷移
  //  };

  // 編集内容を保存（PUT）する処理　★ここ追加
  const saveEditedMeeting = async () => {
    if (!meetingId) {
      alert("保存できる会議IDがありません");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8000/update-meeting/${meetingId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            //======================================================
            title: meetingTitle, // ← 20250404追加書き換え　これで編集できる(当初は”編集後のタイトル（仮）”となっていた)
            //======================================================
            summary: meetingSummary.summary,
            knowledges: [
              {
                id: knowledgeId, // ← ここを state から渡す
                //==================================================
                title: meetingSummary.knowledgeTitle, // ← 20250404追加書き換え
                //==================================================
                content: meetingSummary.knowledge,
                tags: meetingSummary.knowledgeTags,
              },
            ],
            challenges: [
              {
                id: challengeId, // ← ここも同様に
                //=================================================
                title: meetingSummary.challengeTitle, // ← 20250404追加書き換え
                //=================================================
                content: meetingSummary.issues,
                tags: meetingSummary.challengeTags,
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        throw new Error("更新に失敗しました");
      }

      alert("編集内容を保存しました");
      router.push("/home");
      setTimeout(() => {
        router.refresh();
      }, 300);
    } catch (error) {
      console.error("PUTリクエストエラー:", error);
    }
  };
  // ★追加ここまで（編集内容を保存（PUT）する処理）

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
                onClick={saveEditedMeeting} // finalizeMeetingからsaveEditedMeetingに変更！！
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
