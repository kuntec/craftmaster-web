export interface ChatModel {
    id:          string
    name:        string
    provider:    'openai' | 'anthropic' | 'google'
    modelId:     string
    credits:     number
    description: string
    badge:       string
    color:       string
    fast:        boolean
  }
  
  export interface Message {
    role:      'user' | 'assistant'
    content:   string
    model?:    string
    credits?:  number
    createdAt: string
  }
  
  export interface Conversation {
    _id:          string
    title:        string
    modelId:      string
    messages:     Message[]
    totalCredits: number
    createdAt:    string
    updatedAt:    string
  }