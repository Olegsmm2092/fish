export const loadQuizData = async () => {
  const response = await fetch('/data/quiz.json')
  if (!response.ok) {
    throw new Error('Failed to load quiz data')
  }
  return await response.json()
}
