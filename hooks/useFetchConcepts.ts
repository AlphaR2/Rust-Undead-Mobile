import { useCallback, useEffect, useState } from 'react'

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

const API_BASE = 'https://undead-protocol.onrender.com/api/v1'

const useFetchConcepts = () => {
  const [state, setState] = useState<FetchState>({
    data: null,
    loading: true,
    error: null,
  })

  const organizationId = process.env.EXPO_PUBLIC_ORGANIZATIONID

  const transformData = useCallback((conceptData: any): TransformedConcept[] => {
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
        questions: topic.questions.map((q) => ({
          question_id: q.question_id,
          text: q.text,
          correct: q.correct,
          explanation: q.explanation,
        })),
      }))

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
  }, [])

  const getConcepts = useCallback(async () => {
    if (!organizationId) {
      setState({
        data: null,
        loading: false,
        error: 'Organization ID not configured',
      })
      return
    }

    try {
      const response = await fetch(
        `https://undead-protocol.onrender.com/concept/all/${process.env.EXPO_PUBLIC_ORGANIZATION_ID}`,
        {
          method: 'GET',
          headers: {
            // 'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.EXPO_PUBLIC_AUTH_PASSWORD}`,
          },
        },
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch concepts: ${response.statusText}`)
      }

      const responseData = await response.json()
      console.log("responseData:", responseData)
      const conceptData = responseData.data || responseData
      const transformedData = transformData(conceptData)

      setState({
        data: transformedData,
        loading: false,
        error: null,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch concepts'
      console.error('Error fetching concepts:', errorMessage)

      setState({
        data: null,
        loading: false,
        error: errorMessage,
      })
    }
  }, [organizationId, transformData])

  useEffect(() => {
    getConcepts()
  }, [getConcepts])

  return {
    ...state,
    refetch: getConcepts,
  }
}

export default useFetchConcepts
