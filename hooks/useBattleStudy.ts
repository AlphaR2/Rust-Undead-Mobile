import { useState, useEffect, useCallback, useMemo } from "react";
import { PublicKey } from "@solana/web3.js";
import { useGameData } from "@/hooks/useGameData";
import { useUndeadProgram, usePDAs } from "./useUndeadProgram";
import { Concept } from "@/types/undead";

// Study content interface - what we show in the learning phase
export interface StudyContent {
  conceptId: number;
  title: string;
  description: string;
  selectedTopics: StudyTopic[];
}

export interface StudyTopic {
  topicId: number;
  title: string;
  summary: string;
  bigNotes: string[];
  battleRelevance: string;
}

// Question interface for battle quiz - NO ANSWERS INCLUDED
export interface BattleQuestion {
  questionId: number;
  text: string;
  conceptId: number;
  topicId: number;
  conceptTitle: string;
  topicTitle: string;
  difficulty?: string;
}

// Battle room study data extracted from on-chain
interface BattleStudyData {
  selectedConceptIds: number[];
  selectedTopicIds: number[];
  selectedQuestionIds: number[]; //Added question IDs
  battleRoomExists: boolean;
  roomState: any;
}

// Rate limiting utility
class RateLimiter {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  private delay: number;

  constructor(delayMs: number = 1000) {
    this.delay = delayMs;
  }

  async add<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      this.process();
    });
  }

  private async process() {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;

    while (this.queue.length > 0) {
      const fn = this.queue.shift()!;
      try {
        await fn();
      } catch (error) {
        console.error("Rate limiter error:", error);
      }

      // Wait between requests to avoid rate limiting
      if (this.queue.length > 0) {
        await new Promise((resolve) => setTimeout(resolve, this.delay));
      }
    }

    this.processing = false;
  }
}

// Create a singleton rate limiter instance
const rateLimiter = new RateLimiter(1500); // 1.5 second delay between requests

// Enhanced fetch function with retry logic and rate limiting
async function fetchWithRetry(
  url: string,
  maxRetries: number = 3
): Promise<Response> {
  return rateLimiter.add(async () => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await fetch(url);

        if (response.status === 429) {
          // Rate limited - wait longer before retry
          const retryAfter = response.headers.get("Retry-After");
          const waitTime = retryAfter
            ? parseInt(retryAfter) * 1000
            : Math.pow(2, i) * 2000;

          console.warn(
            `Rate limited. Waiting ${waitTime}ms before retry ${
              i + 1
            }/${maxRetries}`
          );
          await new Promise((resolve) => setTimeout(resolve, waitTime));
          continue;
        }

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response;
      } catch (error: any) {
        console.error(`Attempt ${i + 1} failed:`, error.message);

        if (i === maxRetries - 1) throw error;

        // Exponential backoff for other errors
        const waitTime = Math.pow(2, i) * 1000;
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }

    throw new Error("Max retries exceeded");
  });
}

export const useBattleStudyContent = (roomId: string) => {
  const [studyContent, setStudyContent] = useState<StudyContent[]>([]);
  const [battleQuestions, setBattleQuestions] = useState<BattleQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [battleRoomData, setBattleRoomData] = useState<BattleStudyData | null>(
    null
  );
  const [loadingProgress, setLoadingProgress] = useState({
    current: 0,
    total: 0,
  });
  const [rawConcepts, setRawConcepts] = useState<Concept[]>([]); // Store fetched concepts for reuse

  const { fetchBattleRoomState, decodeRoomId } = useGameData();
  const program = useUndeadProgram();

  const battleRoomPda = useMemo(() => {
    if (!roomId || !program.program?.programId) return null;
    try {
      return decodeRoomId(roomId).battleRoomPda;
    } catch {
      return null;
    }
  }, [roomId, program.program?.programId, decodeRoomId]);

  // Fetch battle room state and extract study data
  const loadBattleRoomData = useCallback(async () => {
    if (!battleRoomPda || !fetchBattleRoomState) {
      console.warn("Missing battleRoomPda or fetchBattleRoomState");
      return null;
    }

    try {
      // console.log("🔍 Loading battle room data from:", battleRoomPda);

      const battleRoom = await fetchBattleRoomState(battleRoomPda.toString());

      // console.log(
      //   "🔍 Full battle room object:",
      //   JSON.stringify(battleRoom, null, 2)
      // );

      if (!battleRoom) {
        throw new Error("Battle room not found");
      }

      // Extract the raw state data
      const rawState = battleRoom.state || {};

      // Extract all the arrays from battle room state
      const selectedConceptIds = rawState.state.selectedConcepts || [];
      const selectedTopicIds = rawState.state.selectedTopics || [];
      const selectedQuestionIds = rawState.state.selectedQuestions || []; //Extract question IDs

      // console.log("📊 Extracted battle room study data:", {
      //   conceptIds: selectedConceptIds,
      //   topicIds: selectedTopicIds,
      //   questionIds: selectedQuestionIds, // Log question IDs
      //   roomState: rawState,
      // });

      const studyData: BattleStudyData = {
        selectedConceptIds,
        selectedTopicIds,
        selectedQuestionIds, // Include question IDs
        battleRoomExists: true,
        roomState: rawState,
      };

      setBattleRoomData(studyData);
      return studyData;
    } catch (error: any) {
      console.error("❌ Error loading battle room data:", error);
      throw error;
    }
  }, [battleRoomPda, fetchBattleRoomState]);

  // Fetch concepts and store them for reuse
  const fetchConcepts = useCallback(async (conceptIds: number[]) => {
    if (!conceptIds?.length) {
      throw new Error("No concepts to fetch");
    }

    // console.log("🔍 Fetching concepts for IDs:", conceptIds);
    // console.log(
    //   `📊 Making ${conceptIds.length} API requests with rate limiting...`
    // );

    try {
      const concepts: Concept[] = [];
      setLoadingProgress({ current: 0, total: conceptIds.length });

      for (let i = 0; i < conceptIds.length; i++) {
        const conceptId = conceptIds[i];
        // console.log(
        //   `📥 Fetching concept ${conceptId} (${i + 1}/${conceptIds.length})`
        // );

        try {
          const response = await fetchWithRetry(
            `https://poynt-sever.onrender.com/api/v1/concept/${conceptId}`
          );

          const responseData = await response.json();

          if (!responseData.data || !responseData.data[0]) {
            console.warn(`⚠️ No data returned for concept ${conceptId}`);
            continue;
          }

          concepts.push(responseData.data[0] as Concept);
          // console.log(`✅ Successfully fetched concept ${conceptId}`);
          setLoadingProgress({
            current: i + 1,
            total: conceptIds.length,
          });
        } catch (error: any) {
          console.error(
            `❌ Failed to fetch concept ${conceptId}:`,
            error.message
          );
          setLoadingProgress({
            current: i + 1,
            total: conceptIds.length,
          });
          continue;
        }
      }

      if (concepts.length === 0) {
        throw new Error("Failed to fetch any concepts");
      }

      // console.log("✅ All concepts fetched successfully:", concepts.length);
      setRawConcepts(concepts); // Store for reuse
      return concepts;
    } catch (error: any) {
      console.error("❌ Error fetching concepts:", error);
      throw error;
    }
  }, []);

  // Transform concepts into study content (existing logic)
  const processStudyContent = useCallback(
    (concepts: Concept[], studyData: BattleStudyData) => {
      const { selectedTopicIds } = studyData;

      // console.log("🔧 Processing study content from concepts");

      const studyContent: StudyContent[] = [];

      for (
        let conceptIndex = 0;
        conceptIndex < concepts.length;
        conceptIndex++
      ) {
        const concept = concepts[conceptIndex];

        // Get the selected topics for this specific concept (2 topics per concept)
        const topicsForThisConcept = selectedTopicIds.slice(
          conceptIndex * 2,
          conceptIndex * 2 + 2
        );

        // console.log(
        //   `🔍 Concept ${concept.concept_id}: Looking for topics with IDs:`,
        //   topicsForThisConcept
        // );

        // Filter concept's topics to match the selected topic IDs
        const selectedTopicsForConcept = topicsForThisConcept
          .map((selectedTopicId) => {
            const matchingTopic = concept.topics.find(
              (topic) => topic.topic_id === selectedTopicId
            );
            if (!matchingTopic) {
              console.warn(
                `⚠️ Topic ${selectedTopicId} not found in concept ${concept.concept_id}`
              );
              return null;
            }
            return matchingTopic;
          })
          .filter(
            (topic): topic is NonNullable<typeof topic> => topic !== null
          );

        const studyTopics: StudyTopic[] = selectedTopicsForConcept.map(
          (topic) => ({
            topicId: topic.topic_id,
            title: topic.title,
            summary: topic.learning_content.summary,
            bigNotes: topic.learning_content.big_note,
            battleRelevance: topic.learning_content.battle_relevance,
          })
        );

        studyContent.push({
          conceptId: concept.concept_id,
          title: concept.title,
          description: concept.description,
          selectedTopics: studyTopics,
        });
      }

      // console.log("✅ Study content processed:", {
      //   conceptsCount: studyContent.length,
      //   totalTopics: studyContent.reduce(
      //     (sum, c) => sum + c.selectedTopics.length,
      //     0
      //   ),
      // });

      return studyContent;
    },
    []
  );

  //Extract questions from concepts (following same filtering pattern)
  const getQuestionsForBattle = useCallback(() => {
    if (!rawConcepts.length || !battleRoomData?.selectedQuestionIds.length) {
      console.warn(
        "❌ Cannot extract questions: missing concepts or question IDs"
      );
      return [];
    }

    const { selectedQuestionIds } = battleRoomData;

    // console.log("🎯 Extracting questions for battle:");
    // console.log("Selected question IDs:", selectedQuestionIds);

    try {
      const questions: BattleQuestion[] = [];

      // Go through each concept → topic → questions to find matching IDs
      for (const concept of rawConcepts) {
        for (const topic of concept.topics) {
          for (const question of topic.questions) {
            // Check if this question ID is in our selected questions
            if (selectedQuestionIds.includes(question.question_id)) {
              const battleQuestion: BattleQuestion = {
                questionId: question.question_id,
                text: question.text,
                conceptId: concept.concept_id,
                topicId: topic.topic_id,
                conceptTitle: concept.title,
                topicTitle: topic.title,
                // NO correct answer included - that stays on-chain
              };

              questions.push(battleQuestion);
              // console.log(
              //   `✅ Found question ${
              //     question.question_id
              //   }: "${question.text.slice(0, 50)}..."`
              // );
            }
          }
        }
      }

      // Sort questions by the order they appear in selectedQuestionIds
      const sortedQuestions = selectedQuestionIds
        .map((id) => questions.find((q) => q.questionId === id))
        .filter((q): q is BattleQuestion => q !== undefined);

      // console.log("🎯 Questions extracted for battle:", {
      //   requested: selectedQuestionIds.length,
      //   found: sortedQuestions.length,
      //   questionIds: sortedQuestions.map((q) => q.questionId),
      // });

      if (sortedQuestions.length !== selectedQuestionIds.length) {
        console.warn(
          `⚠️ Question count mismatch! Expected ${selectedQuestionIds.length}, found ${sortedQuestions.length}`
        );
      }

      setBattleQuestions(sortedQuestions);
      return sortedQuestions;
    } catch (error: any) {
      console.error("❌ Error extracting questions:", error);
      return [];
    }
  }, [rawConcepts, battleRoomData]);

  // Main loading function - Updated to handle both study content and questions
  const loadStudyContent = useCallback(async () => {
    if (!roomId) {
      setError("Room ID is required");
      return;
    }

    if (!battleRoomPda) {
      setError("Invalid room ID format");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Step 1: Load battle room data
      const studyData = await loadBattleRoomData();

      if (!studyData) {
        throw new Error("Could not load battle room data");
      }

      // Step 2: Fetch concepts (reusable for both study and questions)
      const concepts = await fetchConcepts(studyData.selectedConceptIds);

      // Step 3: Process study content
      const content = processStudyContent(concepts, studyData);
      setStudyContent(content);

      // Step 4: Extract questions automatically
      // Questions will be available via getQuestionsForBattle() after concepts are loaded

      // console.log("🎯 Study content and questions data loaded successfully!");
    } catch (error: any) {
      console.error("❌ Error loading study content:", error);
      setError(error.message || "Failed to load study content");
      setStudyContent([]);
      setRawConcepts([]);
      setBattleQuestions([]);
    } finally {
      setLoading(false);
    }
  }, [
    roomId,
    battleRoomPda,
    loadBattleRoomData,
    fetchConcepts,
    processStudyContent,
  ]);

  // Load content when hook is initialized
  useEffect(() => {
    if (
      roomId &&
      battleRoomPda &&
      !loading &&
      studyContent.length === 0 &&
      !error
    ) {
      loadStudyContent();
    }
  }, [roomId, battleRoomPda]); // Removed loadStudyContent from deps to prevent loops

  // Refresh function for manual reload
  const refreshStudyContent = useCallback(() => {
    setStudyContent([]);
    setBattleQuestions([]);
    setRawConcepts([]);
    setError(null);
    loadStudyContent();
  }, [loadStudyContent]);

  // Helper function to get flattened topics for navigation
  const allTopics = useMemo(() => {
    return studyContent.flatMap((concept) =>
      concept.selectedTopics.map((topic) => ({
        ...topic,
        conceptTitle: concept.title,
        conceptId: concept.conceptId,
      }))
    );
  }, [studyContent]);

  // Auto-extract questions when concepts are loaded
  useEffect(() => {
    if (
      rawConcepts.length > 0 &&
      battleRoomData &&
      battleQuestions.length === 0
    ) {
      // console.log("🎯 Auto-extracting questions after concepts loaded");
      getQuestionsForBattle();
    }
  }, [
    rawConcepts,
    battleRoomData,
    battleQuestions.length,
    getQuestionsForBattle,
  ]);

  return {
    // Data
    studyContent,
    battleRoomData,
    allTopics,
    loadingProgress,
    battleQuestions,
    rawConcepts,

    // State
    loading,
    error,
    isReady: !loading && !error && studyContent.length > 0,
    questionsReady: !loading && !error && battleQuestions.length > 0,

    // Actions
    refreshStudyContent,
    getQuestionsForBattle,

    // Computed
    conceptsCount: studyContent.length,
    topicsCount: allTopics.length,
    questionsCount: battleQuestions.length,
    battleRoomPda,
  };
};
