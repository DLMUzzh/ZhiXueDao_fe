import axios from 'axios'
import apiClient from './apiClient'
import type {
  ConfirmContentRequest,
  CreateDraftResponse,
  DescriptionSuggestResponse,
  KnowpostDetailResponse,
  PresignRequest,
  PresignResponse,
  UpdateKnowpostRequest,
} from '../types/knowpost'

const PREFIX = '/api/v1/knowposts'

export function createDraft() {
  return apiClient.post<CreateDraftResponse>(`${PREFIX}/drafts`)
}

export function requestUploadPresign(payload: PresignRequest) {
  return apiClient.post<PresignResponse>('/api/v1/storage/presign', payload)
}

export function confirmKnowpostContent(id: string, payload: ConfirmContentRequest) {
  return apiClient.post<void>(`${PREFIX}/${id}/content/confirm`, payload)
}

export function updateKnowpost(id: string, payload: UpdateKnowpostRequest) {
  return apiClient.patch<void>(`${PREFIX}/${id}`, payload)
}

export function publishKnowpost(id: string) {
  return apiClient.post<void>(`${PREFIX}/${id}/publish`)
}

export function suggestKnowpostDescription(content: string) {
  return apiClient.post<DescriptionSuggestResponse>(`${PREFIX}/description/suggest`, { content })
}

export function getKnowpostDetail(id: string) {
  return apiClient.get<KnowpostDetailResponse>(`${PREFIX}/detail/${id}`)
}

export async function uploadToPresignedUrl(options: {
  putUrl: string
  headers: Record<string, string>
  body: Blob
  onProgress?: (progress: number) => void
}) {
  const response = await axios.put(options.putUrl, options.body, {
    headers: options.headers,
    onUploadProgress: (event) => {
      if (!event.total || !options.onProgress) return
      options.onProgress(Math.min(100, Math.round((event.loaded / event.total) * 100)))
    },
  })

  return {
    etag: (response.headers.etag as string | undefined) ?? '',
    status: response.status,
  }
}

export async function fetchMarkdownContent(contentUrl: string) {
  const response = await fetch(contentUrl)
  if (!response.ok) {
    throw new Error('正文内容加载失败')
  }

  return response.text()
}

export function buildQaStreamUrl(id: string, params: { question: string; topK?: number; maxTokens?: number }) {
  const path = `/api/v1/knowposts/${id}/qa/stream`
  const query = new URLSearchParams({
    question: params.question,
    topK: String(params.topK ?? 5),
    maxTokens: String(params.maxTokens ?? 1024),
  })

  const baseUrl = import.meta.env.VITE_API_BASE_URL
  if (baseUrl) {
    const url = new URL(path, baseUrl)
    url.search = query.toString()
    return url.toString()
  }

  return `${path}?${query.toString()}`
}
