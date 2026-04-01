<template>
  <MainLayout>
    <div class="create-page">
      <header class="create-page__header">
        <div>
          <h1 class="create-page__title">创作新知文</h1>
          <p class="create-page__subtitle">沉淀你的知识经验，让更多人从中受益。</p>
        </div>

        <div v-if="publishProgress" class="create-page__progress">
          <div class="create-page__progress-bar">
            <span class="create-page__progress-fill" :style="{ width: `${publishProgress.progress}%` }"></span>
          </div>
          <p class="create-page__progress-text">
            {{ publishProgress.progress }}% {{ publishProgress.message }}
          </p>
        </div>

        <div v-else class="create-page__actions">
          <button class="create-page__ghost-btn" type="button" disabled title="存为草稿即将支持">
            存为草稿
          </button>
          <button class="create-page__primary-btn" type="button" :disabled="isBusy" @click="publishPost">
            {{ isBusy ? '处理中…' : '发布' }}
          </button>
        </div>
      </header>

      <div class="create-page__pane-tabs">
        <button
          class="create-page__pane-tab"
          :class="{ 'create-page__pane-tab--active': activePane === 'edit' }"
          type="button"
          @click="activePane = 'edit'"
        >
          编辑
        </button>
        <button
          class="create-page__pane-tab"
          :class="{ 'create-page__pane-tab--active': activePane === 'preview' }"
          type="button"
          @click="activePane = 'preview'"
        >
          预览
        </button>
      </div>

      <div class="create-page__layout">
        <section class="editor-panel" :class="{ 'editor-panel--hidden': activePane === 'preview' }">
          <div class="field">
            <div class="field__header">
              <label class="field__label" for="title">标题 *</label>
              <span class="field__counter" :class="{ 'field__counter--error': titleTooLong }">
                {{ title.length }}/100
              </span>
            </div>
            <input
              id="title"
              v-model="title"
              class="field__input field__input--title"
              type="text"
              maxlength="100"
              :disabled="isBusy"
              placeholder="请输入知文标题"
            />
            <p v-if="titleError" class="field__error">{{ titleError }}</p>
          </div>

          <div class="field">
            <div class="field__header">
              <label class="field__label">封面图片 *</label>
              <span class="field__hint">支持 JPG / PNG / WebP，最多 15 张，单张 ≤ 10MB</span>
            </div>

            <div
              class="upload-dropzone"
              :class="{ 'upload-dropzone--active': dragActive }"
              @dragenter.prevent="dragActive = true"
              @dragover.prevent="dragActive = true"
              @dragleave.prevent="dragActive = false"
              @drop.prevent="handleDrop"
              @click="openPicker"
            >
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 3v12"/><path d="m17 8-5-5-5 5"/><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 16.25"/>
              </svg>
              <p class="upload-dropzone__title">
                {{ dragActive ? '松开以上传图片' : '拖拽图片到此处或点击上传' }}
              </p>
              <p class="upload-dropzone__subtitle">自动以第一张图片作为封面图</p>
            </div>

            <input
              ref="fileInputRef"
              class="upload-dropzone__input"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              @change="handleFileChange"
            />

            <p v-if="imageError" class="field__error">{{ imageError }}</p>

            <div v-if="images.length" class="image-strip">
              <div
                v-for="(item, index) in images"
                :key="item.localId"
                class="image-card"
                :draggable="!isBusy"
                @dragstart="handleImageDragStart(item.localId)"
                @dragover.prevent
                @drop.prevent="handleImageDrop(item.localId)"
              >
                <img :src="item.previewUrl" :alt="`上传图片 ${index + 1}`" />
                <span v-if="index === 0" class="image-card__cover">封面</span>
                <button class="image-card__remove" type="button" @click.stop="removeImage(item.localId)">
                  ×
                </button>

                <div v-if="item.status !== 'uploaded'" class="image-card__overlay">
                  <div v-if="item.status === 'uploading'" class="image-card__progress">
                    <span class="image-card__progress-bar" :style="{ width: `${item.progress}%` }"></span>
                  </div>
                  <div v-else class="image-card__retry">
                    <span>{{ item.error || '上传失败' }}</span>
                    <button type="button" @click.stop="retryImageUpload(item.localId)">重试</button>
                  </div>
                </div>
              </div>

              <button
                v-if="images.length < MAX_IMAGE_COUNT"
                class="image-card image-card--adder"
                type="button"
                @click="openPicker"
              >
                +
              </button>
            </div>
          </div>

          <div class="field">
            <div class="field__header">
              <label class="field__label" for="content">正文内容 * (Markdown)</label>
            </div>
            <textarea
              id="content"
              ref="contentRef"
              v-model="content"
              class="field__textarea"
              :disabled="isBusy"
              placeholder="在此输入知文正文，支持 Markdown 语法…"
              @keydown="handleContentKeydown"
            ></textarea>
            <p v-if="contentError" class="field__error">{{ contentError }}</p>
          </div>

          <div class="field">
            <div class="field__header">
              <label class="field__label" for="description">知识摘要</label>
              <div class="field__summary-tools">
                <span class="field__counter" :class="{ 'field__counter--error': descriptionTooLong }">
                  {{ description.length }}/50
                </span>
                <button
                  class="field__ai-btn"
                  type="button"
                  :disabled="isBusy || !content.trim()"
                  @click="generateDescription"
                >
                  {{ isGeneratingDescription ? '生成中…' : 'AI 生成' }}
                </button>
              </div>
            </div>
            <textarea
              id="description"
              v-model="description"
              class="field__textarea field__textarea--summary"
              maxlength="50"
              :disabled="isBusy"
              placeholder="不超过 50 字的摘要"
            ></textarea>
          </div>

          <div class="field">
            <div class="field__header">
              <label class="field__label" for="tag-input">标签</label>
              <span class="field__hint">最多添加 5 个标签</span>
            </div>
            <div class="tag-box">
              <span v-for="tag in tags" :key="tag" class="tag-box__item">
                {{ tag }}
                <button type="button" @click="removeTag(tag)">×</button>
              </span>
              <input
                id="tag-input"
                v-model="tagInput"
                class="tag-box__input"
                type="text"
                :disabled="isBusy || tags.length >= 5"
                placeholder="输入后按 Enter 添加"
                @keydown.enter.prevent="addTag"
                @keydown.backspace="handleTagBackspace"
              />
            </div>
          </div>

          <div class="field">
            <div class="field__header">
              <label class="field__label">可见范围</label>
            </div>
            <div class="visibility-group">
              <label v-for="option in visibilityOptions" :key="option.value" class="visibility-option">
                <input v-model="visible" class="visibility-option__input" type="radio" :value="option.value" />
                <span class="visibility-option__dot"></span>
                <span>{{ option.label }}</span>
              </label>
            </div>
          </div>
        </section>

        <aside class="preview-panel" :class="{ 'preview-panel--hidden': activePane === 'edit' }">
          <div class="preview-panel__header">
            <h2>实时预览</h2>
            <span>Markdown 渲染</span>
          </div>

          <article class="preview-card">
            <h1 class="preview-card__title">{{ title || '请输入标题' }}</h1>
            <p v-if="description" class="preview-card__description">{{ description }}</p>

            <div v-if="images.length" class="preview-card__gallery">
              <img
                v-for="item in images.slice(0, 3)"
                :key="item.localId"
                :src="item.previewUrl"
                :alt="item.file.name"
              />
            </div>

            <div v-if="tags.length" class="preview-card__tags">
              <span v-for="tag in tags" :key="tag">{{ tag }}</span>
            </div>

            <div class="preview-card__markdown markdown-body" v-html="previewHtml"></div>
          </article>
        </aside>
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '../components/layout/MainLayout.vue'
import { useToast } from '../composables/useToast'
import type { ApiError } from '../types/auth'
import type { CreateVisibility, PublishProgressState, UploadImageItem } from '../types/knowpost'
import {
  MAX_IMAGE_COUNT,
  getFileExtension,
  validateImageFile,
} from '../utils/file'
import { renderMarkdownToHtml } from '../utils/markdown'
import {
  confirmKnowpostContent,
  createDraft,
  publishKnowpost,
  requestUploadPresign,
  suggestKnowpostDescription,
  updateKnowpost,
  uploadToPresignedUrl,
} from '../services/knowpostService'

const router = useRouter()
const toast = useToast()

const fileInputRef = ref<HTMLInputElement | null>(null)
const contentRef = ref<HTMLTextAreaElement | null>(null)
const activePane = ref<'edit' | 'preview'>('edit')

const title = ref('')
const content = ref('')
const description = ref('')
const tagInput = ref('')
const tags = ref<string[]>([])
const visible = ref<CreateVisibility>('public')
const images = ref<UploadImageItem[]>([])
const draftId = ref<string | null>(null)
const submitAttempted = ref(false)
const dragActive = ref(false)
const draggingImageId = ref<string | null>(null)

const isGeneratingDescription = ref(false)
const publishProgress = ref<PublishProgressState | null>(null)

let typingTimer = 0

const visibilityOptions: Array<{ value: CreateVisibility; label: string }> = [
  { value: 'public', label: '公开' },
  { value: 'followers', label: '仅关注者' },
  { value: 'private', label: '私密' },
]

const isBusy = computed(() => isGeneratingDescription.value || !!publishProgress.value)
const titleTooLong = computed(() => title.value.length > 100)
const descriptionTooLong = computed(() => description.value.length > 50)
const titleError = computed(() => (submitAttempted.value && !title.value.trim() ? '请输入标题' : ''))
const contentError = computed(() => (submitAttempted.value && !content.value.trim() ? '请输入正文内容' : ''))
const imageError = computed(() => {
  if (!submitAttempted.value) return ''
  if (!images.value.length) return '请至少上传 1 张图片'
  if (!uploadedImageUrls.value.length) return '请等待图片上传完成后再发布'
  return ''
})

const uploadedImageUrls = computed(() =>
  images.value
    .filter((item) => item.status === 'uploaded' && item.remoteUrl)
    .map((item) => item.remoteUrl as string),
)

const previewHtml = computed(() => renderMarkdownToHtml(content.value || '开始写下你的知识内容吧…'))

function openPicker() {
  if (isBusy.value) return
  fileInputRef.value?.click()
}

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const files = target.files ? Array.from(target.files) : []
  if (files.length) {
    void enqueueFiles(files)
  }
  target.value = ''
}

function handleDrop(event: DragEvent) {
  dragActive.value = false
  if (isBusy.value) return

  const files = Array.from(event.dataTransfer?.files ?? [])
  if (files.length) {
    void enqueueFiles(files)
  }
}

async function enqueueFiles(files: File[]) {
  if (!files.length) return

  const availableSlots = MAX_IMAGE_COUNT - images.value.length
  if (availableSlots <= 0) {
    toast.warning(`最多上传 ${MAX_IMAGE_COUNT} 张图片`)
    return
  }

  const acceptedFiles = files.slice(0, availableSlots)
  for (const file of acceptedFiles) {
    const validationError = validateImageFile(file)
    if (validationError) {
      toast.error(validationError)
      continue
    }

    const item: UploadImageItem = {
      localId: createLocalId(),
      file,
      previewUrl: URL.createObjectURL(file),
      status: 'uploading',
      progress: 0,
      remoteUrl: null,
      error: '',
    }

    images.value.push(item)
    void uploadImageItem(item.localId)
  }

  if (files.length > availableSlots) {
    toast.warning(`最多上传 ${MAX_IMAGE_COUNT} 张图片，其余文件已忽略`)
  }
}

async function uploadImageItem(localId: string) {
  const item = images.value.find((entry) => entry.localId === localId)
  if (!item) return

  item.status = 'uploading'
  item.progress = 0
  item.error = ''

  try {
    const postId = await ensureDraftId()
    const { data } = await requestUploadPresign({
      scene: 'knowpost_image',
      postId,
      contentType: item.file.type,
      ext: getFileExtension(item.file),
    })

    await uploadToPresignedUrl({
      putUrl: data.putUrl,
      headers: data.headers,
      body: item.file,
      onProgress: (progress) => {
        item.progress = progress
      },
    })

    item.progress = 100
    item.status = 'uploaded'
    item.remoteUrl = resolveRemoteUrl(data.putUrl, data.objectKey)
  } catch (error) {
    const apiError = error as ApiError
    item.status = 'error'
    item.error = apiError.message || '图片上传失败'
  }
}

function retryImageUpload(localId: string) {
  void uploadImageItem(localId)
}

function removeImage(localId: string) {
  const index = images.value.findIndex((item) => item.localId === localId)
  if (index === -1) return

  URL.revokeObjectURL(images.value[index].previewUrl)
  images.value.splice(index, 1)
}

function handleImageDragStart(localId: string) {
  draggingImageId.value = localId
}

function handleImageDrop(targetId: string) {
  const sourceId = draggingImageId.value
  draggingImageId.value = null
  if (!sourceId || sourceId === targetId) return

  const sourceIndex = images.value.findIndex((item) => item.localId === sourceId)
  const targetIndex = images.value.findIndex((item) => item.localId === targetId)
  if (sourceIndex === -1 || targetIndex === -1) return

  const [moved] = images.value.splice(sourceIndex, 1)
  images.value.splice(targetIndex, 0, moved)
}

function handleContentKeydown(event: KeyboardEvent) {
  if (event.key !== 'Tab' || !contentRef.value) return
  event.preventDefault()

  const textarea = contentRef.value
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const nextValue = `${content.value.slice(0, start)}  ${content.value.slice(end)}`
  content.value = nextValue

  requestAnimationFrame(() => {
    textarea.selectionStart = textarea.selectionEnd = start + 2
  })
}

async function generateDescription() {
  if (!content.value.trim()) {
    toast.warning('请先填写正文内容')
    return
  }

  isGeneratingDescription.value = true
  window.clearInterval(typingTimer)

  try {
    const { data } = await suggestKnowpostDescription(content.value)
    await animateDescription(data.description.slice(0, 50))
  } catch (error) {
    const apiError = error as ApiError
    toast.error(apiError.message || '生成失败，请手动输入')
  } finally {
    isGeneratingDescription.value = false
  }
}

function addTag() {
  const normalized = tagInput.value.trim()
  if (!normalized || tags.value.includes(normalized) || tags.value.length >= 5) {
    tagInput.value = ''
    return
  }

  tags.value.push(normalized)
  tagInput.value = ''
}

function removeTag(tag: string) {
  tags.value = tags.value.filter((item) => item !== tag)
}

function handleTagBackspace(event: KeyboardEvent) {
  if (event.key !== 'Backspace' || tagInput.value || !tags.value.length) return
  tags.value = tags.value.slice(0, -1)
}

async function publishPost() {
  submitAttempted.value = true
  if (!validateBeforePublish()) return

  const unfinishedImage = images.value.some((item) => item.status === 'uploading')
  if (unfinishedImage) {
    toast.warning('图片仍在上传中，请稍候')
    return
  }

  try {
    setPublishProgress('creating_draft', 10, '创建草稿中…')
    const postId = await ensureDraftId()

    setPublishProgress('preparing_upload', 25, '准备上传…')
    const markdownBlob = new Blob([content.value], { type: 'text/markdown' })
    const { data: presign } = await requestUploadPresign({
      scene: 'knowpost_content',
      postId,
      contentType: 'text/markdown',
      ext: '.md',
    })

    setPublishProgress('uploading_content', 50, '上传内容中…')
    const uploadResult = await uploadToPresignedUrl({
      putUrl: presign.putUrl,
      headers: presign.headers,
      body: markdownBlob,
    })

    if (!uploadResult.etag) {
      throw new Error('上传响应缺少 ETag，请稍后重试')
    }

    setPublishProgress('confirming_content', 68, '确认上传…')
    await confirmKnowpostContent(postId, {
      objectKey: presign.objectKey,
      etag: uploadResult.etag,
      size: markdownBlob.size,
      sha256: await digestSha256(markdownBlob),
    })

    setPublishProgress('saving_metadata', 84, '保存信息…')
    await updateKnowpost(postId, {
      title: title.value.trim(),
      tags: tags.value,
      imgUrls: uploadedImageUrls.value,
      visible: visible.value,
      description: description.value.trim() || undefined,
    })

    setPublishProgress('publishing', 100, '发布中…')
    await publishKnowpost(postId)

    toast.success('发布成功！')
    submitAttempted.value = false
    await router.push(`/post/${postId}`)
  } catch (error) {
    const apiError = error as ApiError | Error
    toast.error(apiError.message || '发布失败，请稍后重试')
  } finally {
    publishProgress.value = null
  }
}

function validateBeforePublish() {
  if (!title.value.trim()) {
    toast.warning('请输入标题')
    return false
  }

  if (!content.value.trim()) {
    toast.warning('请输入正文内容')
    return false
  }

  if (!uploadedImageUrls.value.length) {
    toast.warning('请至少上传 1 张图片')
    return false
  }

  return true
}

async function ensureDraftId() {
  if (draftId.value) {
    return draftId.value
  }

  const { data } = await createDraft()
  draftId.value = data.id
  return data.id
}

function setPublishProgress(step: PublishProgressState['step'], progress: number, message: string) {
  publishProgress.value = {
    step,
    progress,
    message,
  }
}

function resolveRemoteUrl(putUrl: string, objectKey: string) {
  const publicBaseUrl = import.meta.env.VITE_OSS_PUBLIC_BASE_URL as string | undefined
  if (publicBaseUrl) {
    return new URL(objectKey.replace(/^\/+/, ''), ensureTrailingSlash(publicBaseUrl)).toString()
  }

  const url = new URL(putUrl)
  url.search = ''
  url.hash = ''
  return url.toString()
}

function ensureTrailingSlash(value: string) {
  return value.endsWith('/') ? value : `${value}/`
}

function createLocalId() {
  return `upload-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

async function digestSha256(blob: Blob) {
  const buffer = await blob.arrayBuffer()
  const digest = await crypto.subtle.digest('SHA-256', buffer)
  return Array.from(new Uint8Array(digest))
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('')
}

async function animateDescription(targetText: string) {
  description.value = ''

  await new Promise<void>((resolve) => {
    let index = 0
    typingTimer = window.setInterval(() => {
      description.value = targetText.slice(0, index + 1)
      index += 1
      if (index >= targetText.length) {
        window.clearInterval(typingTimer)
        resolve()
      }
    }, 18)
  })
}

onBeforeUnmount(() => {
  window.clearInterval(typingTimer)
  images.value.forEach((item) => {
    URL.revokeObjectURL(item.previewUrl)
  })
})
</script>

<style scoped>
.create-page {
  padding-bottom: 40px;
}

.create-page__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 24px;
}

.create-page__title {
  font-size: 30px;
  font-weight: 700;
  color: var(--gray-900);
}

.create-page__subtitle {
  margin-top: 8px;
  color: var(--gray-500);
}

.create-page__actions {
  display: flex;
  gap: 12px;
}

.create-page__ghost-btn,
.create-page__primary-btn {
  height: 42px;
  padding: 0 22px;
  border-radius: var(--radius-full);
  font-weight: 600;
}

.create-page__ghost-btn {
  border: 1px solid var(--gray-200);
  background: #fff;
  color: var(--gray-400);
  cursor: not-allowed;
}

.create-page__primary-btn {
  background: var(--primary-500);
  color: #fff;
}

.create-page__primary-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.create-page__progress {
  width: min(320px, 100%);
}

.create-page__progress-bar {
  width: 100%;
  height: 10px;
  border-radius: var(--radius-full);
  background: var(--gray-100);
  overflow: hidden;
}

.create-page__progress-fill {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, var(--primary-500), var(--accent-500));
}

.create-page__progress-text {
  margin-top: 10px;
  font-size: 13px;
  color: var(--gray-600, var(--gray-500));
}

.create-page__pane-tabs {
  display: none;
  gap: 10px;
  margin-bottom: 16px;
}

.create-page__pane-tab {
  padding: 8px 16px;
  border-radius: var(--radius-full);
  border: 1px solid var(--gray-200);
  background: #fff;
  color: var(--gray-600, var(--gray-500));
}

.create-page__pane-tab--active {
  border-color: var(--primary-500);
  background: var(--primary-50);
  color: var(--primary-500);
}

.create-page__layout {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(340px, 1fr);
  gap: 24px;
}

.editor-panel,
.preview-panel {
  min-width: 0;
}

.editor-panel,
.preview-card {
  border: 1px solid var(--gray-100);
  border-radius: var(--radius-xl);
  background: rgba(255, 255, 255, 0.96);
  box-shadow: var(--shadow-sm);
}

.editor-panel {
  padding: 24px;
}

.field + .field {
  margin-top: 26px;
}

.field__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.field__label {
  font-size: 15px;
  font-weight: 600;
  color: var(--gray-800);
}

.field__hint,
.field__counter {
  color: var(--gray-500);
  font-size: 12px;
}

.field__counter--error {
  color: var(--error);
}

.field__input,
.field__textarea,
.tag-box {
  width: 100%;
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-md);
  background: #fff;
}

.field__input {
  height: 52px;
  padding: 0 16px;
}

.field__input--title {
  font-size: 22px;
  font-weight: 600;
}

.field__textarea {
  min-height: 320px;
  padding: 16px;
  resize: vertical;
  line-height: 1.8;
}

.field__textarea--summary {
  min-height: 108px;
}

.field__input:focus,
.field__textarea:focus,
.tag-box:focus-within {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px var(--primary-50);
}

.field__error {
  margin-top: 8px;
  color: var(--error);
  font-size: 12px;
}

.field__summary-tools {
  display: flex;
  align-items: center;
  gap: 12px;
}

.field__ai-btn {
  height: 32px;
  padding: 0 14px;
  border-radius: var(--radius-full);
  background: var(--gray-100);
  color: var(--gray-700);
  font-size: 12px;
  font-weight: 600;
}

.field__ai-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.upload-dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 180px;
  border: 1px dashed var(--gray-300);
  border-radius: var(--radius-lg);
  background: #fff;
  color: var(--gray-400);
  cursor: pointer;
  transition: border-color 150ms ease, background 150ms ease;
}

.upload-dropzone:hover,
.upload-dropzone--active {
  border-color: var(--primary-500);
  background: var(--primary-50);
  color: var(--primary-500);
}

.upload-dropzone__title {
  font-size: 15px;
  font-weight: 600;
}

.upload-dropzone__subtitle {
  font-size: 12px;
}

.upload-dropzone__input {
  display: none;
}

.image-strip {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 12px;
  margin-top: 14px;
}

.image-card {
  position: relative;
  aspect-ratio: 4 / 3;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--gray-100);
  border: 1px solid var(--gray-200);
}

.image-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-card__cover {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  background: var(--primary-500);
  color: #fff;
  font-size: 11px;
}

.image-card__remove {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
}

.image-card__overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: rgba(33, 37, 41, 0.22);
}

.image-card__progress {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.35);
}

.image-card__progress-bar {
  display: block;
  height: 100%;
  background: var(--accent-500);
}

.image-card__retry {
  width: 100%;
  padding: 10px;
  background: rgba(250, 82, 82, 0.82);
  color: #fff;
  text-align: center;
  font-size: 12px;
}

.image-card__retry button {
  margin-top: 8px;
  padding: 4px 12px;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.18);
  color: #fff;
}

.image-card--adder {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: var(--gray-400);
}

.tag-box {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 10px 12px;
}

.tag-box__item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: var(--radius-sm);
  background: var(--primary-50);
  color: var(--primary-600);
  font-size: 13px;
}

.tag-box__input {
  flex: 1;
  min-width: 140px;
  border: none;
  outline: none;
  background: transparent;
}

.visibility-group {
  display: flex;
  gap: 18px;
  flex-wrap: wrap;
}

.visibility-option {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--gray-700);
}

.visibility-option__input {
  display: none;
}

.visibility-option__dot {
  position: relative;
  width: 16px;
  height: 16px;
  border: 1px solid var(--gray-300);
  border-radius: 50%;
}

.visibility-option__input:checked + .visibility-option__dot {
  border-color: var(--primary-500);
}

.visibility-option__input:checked + .visibility-option__dot::after {
  content: '';
  position: absolute;
  inset: 3px;
  border-radius: 50%;
  background: var(--primary-500);
}

.preview-panel {
  position: sticky;
  top: 88px;
}

.preview-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.preview-panel__header h2 {
  font-size: 18px;
  font-weight: 600;
  color: var(--gray-900);
}

.preview-panel__header span {
  font-size: 12px;
  color: var(--gray-500);
}

.preview-card {
  padding: 22px;
}

.preview-card__title {
  font-size: 26px;
  font-weight: 700;
  color: var(--gray-900);
  line-height: 1.3;
}

.preview-card__description {
  margin-top: 10px;
  color: var(--gray-500);
}

.preview-card__gallery {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-top: 18px;
}

.preview-card__gallery img {
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  border-radius: var(--radius-md);
}

.preview-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.preview-card__tags span {
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  background: var(--gray-100);
  color: var(--gray-700);
  font-size: 12px;
}

.preview-card__markdown {
  margin-top: 22px;
}

.markdown-body :deep(h1),
.markdown-body :deep(h2),
.markdown-body :deep(h3) {
  color: var(--gray-900);
  line-height: 1.4;
  margin-top: 1.4em;
  margin-bottom: 0.7em;
}

.markdown-body :deep(h1) {
  font-size: 28px;
}

.markdown-body :deep(h2) {
  font-size: 22px;
  padding-left: 12px;
  border-left: 3px solid var(--primary-500);
}

.markdown-body :deep(h3) {
  font-size: 18px;
}

.markdown-body :deep(p),
.markdown-body :deep(li) {
  color: var(--gray-700);
  line-height: 1.8;
}

.markdown-body :deep(a) {
  color: var(--primary-500);
}

.markdown-body :deep(blockquote) {
  margin: 18px 0;
  padding: 14px 18px;
  border-left: 3px solid var(--primary-200);
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
  background: var(--gray-50);
}

.markdown-body :deep(pre) {
  overflow-x: auto;
  padding: 16px;
  border-radius: var(--radius-md);
  background: #f6f8fa;
}

.markdown-body :deep(code) {
  font-family: var(--font-mono);
}

.markdown-body :deep(img) {
  display: block;
  max-width: 100%;
  border-radius: var(--radius-md);
  margin: 16px 0;
}

.markdown-body :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 18px 0;
}

.markdown-body :deep(th),
.markdown-body :deep(td) {
  border: 1px solid var(--gray-200);
  padding: 8px 12px;
}

.markdown-body :deep(th) {
  background: var(--gray-50);
}

@media (max-width: 1199px) {
  .create-page__pane-tabs {
    display: flex;
  }

  .create-page__layout {
    grid-template-columns: 1fr;
  }

  .preview-panel {
    position: static;
  }

  .editor-panel--hidden,
  .preview-panel--hidden {
    display: none;
  }
}

@media (max-width: 767px) {
  .create-page__header {
    flex-direction: column;
  }

  .create-page__actions,
  .create-page__progress {
    width: 100%;
  }

  .create-page__actions {
    justify-content: stretch;
  }

  .create-page__ghost-btn,
  .create-page__primary-btn {
    flex: 1;
  }

  .editor-panel {
    padding: 18px;
  }

  .field__input--title {
    font-size: 18px;
  }

  .preview-card__gallery {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
