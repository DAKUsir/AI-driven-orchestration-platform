import { create } from 'zustand'
import api from '../utils/api'

const useCareerStore = create((set) => ({
  // Resume parsing
  parsedText: '',
  parsing: false,

  // Analysis
  analysis: '',
  analyzing: false,

  // Rephrase
  rephrased: '',
  rephrasing: false,

  // Cover letter
  coverLetter: '',
  generatingCover: false,

  // Interview questions
  interviewQuestions: '',
  generatingQuestions: false,

  // General
  error: null,
  activeTab: 'upload',

  setActiveTab: (tab) => set({ activeTab: tab }),
  setParsedText: (text) => set({ parsedText: text }),
  clearError: () => set({ error: null }),

  // 1. Upload & Parse Resume
  uploadResume: async (file) => {
    set({ parsing: true, error: null })
    try {
      const form = new FormData()
      form.append('resume', file)
      const { data } = await api.post('/resume/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      set({
        parsedText: data.parsedText || '',
        parsing: false,
        activeTab: 'analyze',
      })
      return data.parsedText
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Upload failed',
        parsing: false,
      })
      return null
    }
  },

  // 2. Analyze Resume
  analyzeResume: async (resumeText, jobDescription, withJobDescription, temperature, maxTokens) => {
    set({ analyzing: true, error: null, analysis: '' })
    try {
      const { data } = await api.post('/resume/analyze', {
        resumeText,
        jobDescription,
        withJobDescription,
        temperature,
        maxTokens,
      })
      set({ analysis: data.analysis || '', analyzing: false })
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Analysis failed',
        analyzing: false,
      })
    }
  },

  // 3. Rephrase Text
  rephraseText: async (text, temperature, maxTokens) => {
    set({ rephrasing: true, error: null, rephrased: '' })
    try {
      const { data } = await api.post('/resume/rephrase', {
        text,
        temperature,
        maxTokens,
      })
      set({ rephrased: data.rephrased || '', rephrasing: false })
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Rephrase failed',
        rephrasing: false,
      })
    }
  },

  // 4. Generate Cover Letter
  generateCoverLetter: async (resumeText, jobDescription, temperature, maxTokens) => {
    set({ generatingCover: true, error: null, coverLetter: '' })
    try {
      const { data } = await api.post('/resume/cover-letter', {
        resumeText,
        jobDescription,
        temperature,
        maxTokens,
      })
      set({ coverLetter: data.coverLetter || '', generatingCover: false })
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Cover letter generation failed',
        generatingCover: false,
      })
    }
  },

  // 5. Generate Interview Questions
  generateInterviewQuestions: async (jobDescription, temperature, maxTokens) => {
    set({ generatingQuestions: true, error: null, interviewQuestions: '' })
    try {
      const { data } = await api.post('/resume/interview-questions', {
        jobDescription,
        temperature,
        maxTokens,
      })
      set({
        interviewQuestions: data.questions || '',
        generatingQuestions: false,
      })
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Interview questions generation failed',
        generatingQuestions: false,
      })
    }
  },

  // Reset all
  resetAll: () =>
    set({
      parsedText: '',
      analysis: '',
      rephrased: '',
      coverLetter: '',
      interviewQuestions: '',
      error: null,
    }),
}))

export default useCareerStore
