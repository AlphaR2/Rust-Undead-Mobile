import { Question } from '@/components/GameCard/CheckpointModal'

export interface QuizQuestion extends Question {
  topic_id: number
}

export const selectRandomQuestions = (topics: any[]): QuizQuestion[] => {
  const selectedQuestions: QuizQuestion[] = []

  topics.forEach((topic) => {
    if (topic.questions && topic.questions.length > 0) {
      const randomIndex = Math.floor(Math.random() * topic.questions.length)
      const selectedQuestion = {
        ...topic.questions[randomIndex],
        topic_id: topic.topic_id,
      }
      selectedQuestions.push(selectedQuestion)
    }
  })

  return selectedQuestions
}

export const calculateQuizScore = (answers: boolean[]): number => {
  const correctAnswers = answers.filter((answer) => answer).length
  return Math.round((correctAnswers / answers.length) * 100)
}

export const PASS_THRESHOLD = 60
