import { useEffect, useState } from 'react'

interface Question {
  question_id: number
  text: string
  correct: boolean
  explanation: string
  _id?: string
}

interface LearningContent {
  summary: string
  big_note: string[]
  battle_relevance: string
  _id?: string
}

interface Topic {
  topic_id: number
  title: string
  learning_content: LearningContent
  questions: Question[]
  _id?: string
}

interface TransformedCheckpoint {
  topic_id: number
  title: string
  learning_content: {
    summary: string
    big_note: string[]
    battle_relevance: string
  }
  questions: Array<{
    question_id: number
    text: string
    correct: boolean
    explanation: string
  }>
}

interface TransformedConcept {
  id: number
  checkpoints: TransformedCheckpoint[]
}

interface FetchState {
  data: TransformedConcept[] | null
  loading: boolean
  error: string | null
}

const useFetchConcepts = () => {
  const [state, setState] = useState<FetchState>({
    data: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
  const API_BASE = 'https://poynt-sever-al5n.onrender.com/api/v1'
  const CONCEPTS_ENDPOINT = `${API_BASE}/concept/all`

  const transformData = (conceptData: any): TransformedConcept[] => {
    // If the API returns a single concept object
    const conceptsArray = Array.isArray(conceptData) ? conceptData : [conceptData]

    return conceptsArray.map((concept, index) => {
      const topics = concept.topics || []
      const checkpoints = topics.map((topic: Topic) => ({
        topic_id: topic.topic_id,
        title: topic.title,
        learning_content: {
          summary: topic.learning_content.summary,
          big_note: topic.learning_content.big_note,
          battle_relevance: topic.learning_content.battle_relevance,
        },
        questions: topic.questions.map(q => ({
          question_id: q.question_id,
          text: q.text,
          correct: q.correct,
          explanation: q.explanation,
        })),
      }))

      // Example: duplicate 5th topic as 6th
      if (checkpoints.length >= 5) {
        const fifth = checkpoints[4]
        checkpoints.push({
          ...fifth,
          topic_id: fifth.topic_id + 1,
        })
      }

      return {
        id: concept.concept_id ?? index + 1,
        checkpoints,
      }
    })
  }

  const getConcepts = async () => {
    try {
      console.log("Fetching concepts...");
      const response = await fetch(CONCEPTS_ENDPOINT)
      console.log("Response status:", response.status);

      if (!response.ok) throw new Error(`Failed to fetch concepts: ${response.statusText}`)

      const responseData = await response.json()
      // console.log("Raw response:", responseData);

      // Handle either single or multiple concept(s)
      const conceptData = responseData.data || responseData
      const transformedData = transformData(conceptData)
      // console.log("Transformed data:", transformedData)

      setState({
        data: transformedData,
        loading: false,
        error: null,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      console.error("Fetch error:", message)

      setState({
        data: null,
        loading: false,
        error: message,
      })
    }
  }

  getConcepts()
}, [])


  return state
}

export default useFetchConcepts