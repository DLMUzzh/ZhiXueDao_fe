export interface FeedItem {
  id: string
  title: string
  description: string
  coverImage: string | null
  tags: string[]
  authorAvatar: string | null
  authorNickname: string
  tagJson: string
  likeCount: number
  favoriteCount: number
  liked: boolean
  faved: boolean
  isTop?: boolean
  titleHtml?: string
  descriptionHtml?: string
}

export interface FeedResponse {
  items: FeedItem[]
  page: number
  size: number
  hasMore: boolean
}

export interface ActionResponse {
  changed: boolean
  liked?: boolean
  faved?: boolean
}

export type KnowpostVisibility = 'public' | 'followers' | 'school' | 'private' | 'unlisted'
export type CreateVisibility = 'public' | 'followers' | 'private'
export type UploadStatus = 'uploading' | 'uploaded' | 'error'

export interface CreateDraftResponse {
  id: string
}

export interface PresignRequest {
  scene: 'knowpost_content' | 'knowpost_image'
  postId: string
  contentType: string
  ext: string
}

export interface PresignResponse {
  objectKey: string
  putUrl: string
  headers: Record<string, string>
  expiresIn: number
}

export interface ConfirmContentRequest {
  objectKey: string
  etag: string
  size: number
  sha256: string
}

export interface UpdateKnowpostRequest {
  title?: string
  tagId?: number
  tags?: string[]
  imgUrls?: string[]
  visible?: KnowpostVisibility
  description?: string
  isTop?: boolean
}

export interface DescriptionSuggestResponse {
  description: string
}

export interface KnowpostDetailResponse {
  id: string
  title: string
  description: string
  contentUrl: string
  images: string[]
  tags: string[]
  authorAvatar: string | null
  authorNickname: string
  authorId: string
  authorTagJson: string
  likeCount: number
  favoriteCount: number
  liked: boolean
  faved: boolean
  isTop: boolean
  visible: KnowpostVisibility
  type: string
  publishTime: string
}

export interface UploadImageItem {
  localId: string
  file: File
  previewUrl: string
  status: UploadStatus
  progress: number
  remoteUrl: string | null
  error: string
}

export type PublishStep =
  | 'creating_draft'
  | 'preparing_upload'
  | 'uploading_content'
  | 'confirming_content'
  | 'saving_metadata'
  | 'publishing'

export interface PublishProgressState {
  step: PublishStep
  progress: number
  message: string
}

export interface ViewHistoryItem {
  id: string
  title: string
  coverImage: string | null
  authorNickname: string
  viewedAt: string
}
