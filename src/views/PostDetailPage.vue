<template>
  <MainLayout>
    <div class="post-detail">
      <div v-if="isLoading" class="post-detail__skeleton">
        <div class="skeleton skeleton--title"></div>
        <div class="skeleton skeleton--meta"></div>
        <div class="skeleton skeleton--gallery"></div>
        <div class="skeleton skeleton--block" v-for="item in 4" :key="item"></div>
      </div>

      <div v-else-if="errorState" class="post-detail__error">
        <h1>{{ errorTitle }}</h1>
        <p>{{ errorDescription }}</p>
        <button type="button" @click="router.push('/')">返回首页</button>
      </div>

      <template v-else-if="post">
        <aside class="post-sidebar">
          <button class="post-sidebar__btn" :class="{ 'post-sidebar__btn--active-like': post.liked }" type="button" aria-label="点赞" @click="handleLike">
            ♡
            <span>{{ formatCount(post.likeCount) }}</span>
          </button>
          <button class="post-sidebar__btn" :class="{ 'post-sidebar__btn--active-fav': post.faved }" type="button" aria-label="收藏" @click="handleFav">
            ☆
            <span>{{ formatCount(post.favoriteCount) }}</span>
          </button>
          <button class="post-sidebar__btn post-sidebar__btn--disabled" type="button" aria-label="评论预留">
            💬
            <span>预留</span>
          </button>
          <button
            v-if="showBackToTop"
            class="post-sidebar__btn"
            type="button"
            aria-label="回到顶部"
            @click="scrollToTop"
          >
            ⬆
            <span>顶部</span>
          </button>
        </aside>

        <section class="post-main">
          <header class="post-header">
            <h1 class="post-header__title">{{ post.title }}</h1>

            <div class="post-header__meta">
              <div class="post-header__author">
                <div class="post-header__avatar">
                  <img v-if="post.authorAvatar" :src="post.authorAvatar" :alt="post.authorNickname" />
                  <span v-else>{{ post.authorNickname.slice(0, 1) }}</span>
                </div>
                <div>
                  <div class="post-header__author-name">{{ post.authorNickname }}</div>
                  <div class="post-header__date">{{ formatDateLabel(post.publishTime) }}</div>
                </div>
              </div>

              <button
                v-if="showFollowButton"
                class="post-header__follow-btn"
                :class="{ 'post-header__follow-btn--secondary': isFollowing }"
                type="button"
                @click="toggleFollow"
              >
                {{ followButtonText }}
              </button>
            </div>

            <div v-if="post.tags.length" class="post-header__tags">
              <span v-for="tag in post.tags" :key="tag">{{ tag }}</span>
            </div>
          </header>

          <section v-if="post.images.length" class="post-gallery">
            <button
              v-for="(image, index) in post.images"
              :key="image"
              class="post-gallery__item"
              type="button"
              @click="openLightbox(post.images, index)"
            >
              <img :src="image" :alt="`${post.title} 图片 ${index + 1}`" />
            </button>
          </section>

          <section class="post-content">
            <div v-if="contentLoading" class="post-content__loading">正文加载中…</div>
            <div
              v-else-if="contentHtml"
              class="post-content__body markdown-body"
              v-html="contentHtml"
              @click="handleContentClick"
            ></div>
            <div v-else class="post-content__failed">正文加载失败，请稍后重试。</div>
          </section>
        </section>

        <button class="post-ai-trigger" type="button" @click="panelOpen = true">AI 问答</button>

        <aside class="post-ai-panel" :class="{ 'post-ai-panel--open': panelOpen }">
          <div class="post-ai-panel__header">
            <div>
              <h2>AI 智能问答</h2>
              <p>基于本文内容为你解答</p>
            </div>
            <button type="button" aria-label="收起 AI 面板" @click="panelOpen = false">×</button>
          </div>

          <div class="post-ai-panel__body">
            <div v-if="answerHtml" class="markdown-body" v-html="answerHtml"></div>
            <div v-else class="post-ai-panel__empty">输入问题后，AI 会基于当前知文内容生成回答。</div>
          </div>

          <div class="post-ai-panel__footer">
            <textarea
              v-model="question"
              class="post-ai-panel__input"
              :disabled="isAnswering"
              placeholder="请输入你的问题…"
              @keydown.ctrl.enter.prevent="submitQuestion"
            ></textarea>
            <div class="post-ai-panel__actions">
              <button type="button" class="post-ai-panel__note">AI 回答仅基于本文内容</button>
              <button v-if="isAnswering" type="button" class="post-ai-panel__submit" @click="stopAnswer">
                停止
              </button>
              <button v-else type="button" class="post-ai-panel__submit" @click="submitQuestion">
                发送
              </button>
            </div>
          </div>
        </aside>

        <div class="post-mobile-bar">
          <button class="post-mobile-bar__btn" :class="{ 'post-mobile-bar__btn--active': post.liked }" type="button" @click="handleLike">
            ♡ {{ formatCount(post.likeCount) }}
          </button>
          <button class="post-mobile-bar__btn" :class="{ 'post-mobile-bar__btn--active': post.faved }" type="button" @click="handleFav">
            ☆ {{ formatCount(post.favoriteCount) }}
          </button>
          <button class="post-mobile-bar__btn" type="button" @click="panelOpen = true">
            AI 问答
          </button>
        </div>
      </template>

      <Teleport to="body">
        <div v-if="lightboxOpen" class="lightbox" @click.self="closeLightbox">
          <button class="lightbox__close" type="button" @click="closeLightbox">×</button>
          <button
            v-if="lightboxImages.length > 1"
            class="lightbox__nav lightbox__nav--prev"
            type="button"
            aria-label="上一张"
            @click="moveLightbox(-1)"
          >
            ‹
          </button>
          <img class="lightbox__image" :src="currentLightboxImage" alt="知文图片预览" />
          <button
            v-if="lightboxImages.length > 1"
            class="lightbox__nav lightbox__nav--next"
            type="button"
            aria-label="下一张"
            @click="moveLightbox(1)"
          >
            ›
          </button>
          <div class="lightbox__counter">{{ lightboxIndex + 1 }} / {{ lightboxImages.length }}</div>
          <div v-if="lightboxImages.length > 1" class="lightbox__thumbs">
            <button
              v-for="(image, index) in lightboxImages"
              :key="image"
              class="lightbox__thumb"
              :class="{ 'lightbox__thumb--active': index === lightboxIndex }"
              type="button"
              @click="lightboxIndex = index"
            >
              <img :src="image" :alt="`缩略图 ${index + 1}`" />
            </button>
          </div>
        </div>
      </Teleport>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MainLayout from '../components/layout/MainLayout.vue'
import { useToast } from '../composables/useToast'
import { useAuthStore } from '../stores/auth'
import type { ApiError } from '../types/auth'
import type { KnowpostDetailResponse } from '../types/knowpost'
import type { RelationStatusResponse } from '../types/relation'
import { formatCount, formatDateLabel } from '../utils/format'
import { renderMarkdownToHtml } from '../utils/markdown'
import { pushViewHistory } from '../utils/storage'
import { favKnowpost, likeKnowpost, unfavKnowpost, unlikeKnowpost } from '../services/actionService'
import { getEntityCounter } from '../services/counterService'
import { buildQaStreamUrl, fetchMarkdownContent, getKnowpostDetail } from '../services/knowpostService'
import { followUser, getRelationStatus, unfollowUser } from '../services/relationService'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()

const post = ref<KnowpostDetailResponse | null>(null)
const relation = ref<RelationStatusResponse | null>(null)
const contentMarkdown = ref('')
const isLoading = ref(true)
const contentLoading = ref(false)
const errorState = ref<'not_found' | 'forbidden' | 'network' | null>(null)
const panelOpen = ref(false)
const question = ref('')
const answerMarkdown = ref('')
const isAnswering = ref(false)
const showBackToTop = ref(false)

const lightboxOpen = ref(false)
const lightboxImages = ref<string[]>([])
const lightboxIndex = ref(0)

let answerStream: EventSource | null = null

const showFollowButton = computed(() => {
  if (!post.value || !authStore.user) return !!post.value
  return String(authStore.user.id) !== String(post.value.authorId)
})

const isFollowing = computed(() => relation.value?.following ?? false)
const followButtonText = computed(() => {
  if (relation.value?.mutual) return '互相关注'
  return relation.value?.following ? '已关注' : '关注'
})

const errorTitle = computed(() => {
  if (errorState.value === 'not_found') return '知文不存在或已被删除'
  if (errorState.value === 'forbidden') return '该知文为私密内容'
  return '页面加载失败'
})

const errorDescription = computed(() => {
  if (errorState.value === 'not_found') return '你访问的知文可能已下线，试试回到首页继续浏览。'
  if (errorState.value === 'forbidden') return '当前账号没有访问权限，请返回首页查看其他公开内容。'
  return '网络状态似乎有些不稳定，请稍后再试。'
})

const contentHtml = computed(() => renderMarkdownToHtml(contentMarkdown.value))
const answerHtml = computed(() => (answerMarkdown.value ? renderMarkdownToHtml(answerMarkdown.value) : ''))
const currentLightboxImage = computed(() => lightboxImages.value[lightboxIndex.value] || '')

watch(
  () => route.params.id,
  () => {
    void loadPostDetail()
  },
  { immediate: true },
)

async function loadPostDetail() {
  const postId = String(route.params.id || '')
  if (!postId) {
    errorState.value = 'not_found'
    isLoading.value = false
    return
  }

  isLoading.value = true
  errorState.value = null
  contentMarkdown.value = ''
  relation.value = null
  stopAnswer()

  try {
    const { data } = await getKnowpostDetail(postId)
    post.value = data
    panelOpen.value = false
    writeViewHistory(data)

    if (authStore.isLoggedIn && authStore.user && String(authStore.user.id) !== String(data.authorId)) {
      void loadRelationStatus(data.authorId)
    }

    if (authStore.isLoggedIn) {
      void syncCounter(postId)
    }

    contentLoading.value = true
    try {
      contentMarkdown.value = await fetchMarkdownContent(data.contentUrl)
    } finally {
      contentLoading.value = false
    }
  } catch (error) {
    const apiError = error as ApiError
    post.value = null
    if (apiError.status === 404) {
      errorState.value = 'not_found'
    } else if (apiError.status === 403 || apiError.message?.includes('私密')) {
      errorState.value = 'forbidden'
    } else {
      errorState.value = 'network'
    }
  } finally {
    isLoading.value = false
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

async function loadRelationStatus(authorId: string) {
  try {
    const { data } = await getRelationStatus(authorId)
    relation.value = data
  } catch {
    relation.value = null
  }
}

async function syncCounter(postId: string) {
  try {
    const { data } = await getEntityCounter('knowpost', postId, ['like', 'fav'])
    if (!post.value) return
    post.value.likeCount = data.counts.like ?? post.value.likeCount
    post.value.favoriteCount = data.counts.fav ?? post.value.favoriteCount
  } catch {
    // 可选计数校准失败时保持详情接口的计数即可。
  }
}

async function handleLike() {
  if (!post.value) return
  if (!authStore.isLoggedIn) {
    await router.push(`/login?redirect=${encodeURIComponent(route.fullPath)}`)
    return
  }

  const previousLiked = post.value.liked
  post.value.liked = !previousLiked
  post.value.likeCount += previousLiked ? -1 : 1

  try {
    if (previousLiked) {
      await unlikeKnowpost(post.value.id)
    } else {
      await likeKnowpost(post.value.id)
    }
  } catch {
    post.value.liked = previousLiked
    post.value.likeCount += previousLiked ? 1 : -1
    toast.error('操作失败，请稍后重试')
  }
}

async function handleFav() {
  if (!post.value) return
  if (!authStore.isLoggedIn) {
    await router.push(`/login?redirect=${encodeURIComponent(route.fullPath)}`)
    return
  }

  const previousFaved = post.value.faved
  post.value.faved = !previousFaved
  post.value.favoriteCount += previousFaved ? -1 : 1

  try {
    if (previousFaved) {
      await unfavKnowpost(post.value.id)
    } else {
      await favKnowpost(post.value.id)
    }
  } catch {
    post.value.faved = previousFaved
    post.value.favoriteCount += previousFaved ? 1 : -1
    toast.error('操作失败，请稍后重试')
  }
}

async function toggleFollow() {
  if (!post.value) return
  if (!authStore.isLoggedIn) {
    await router.push(`/login?redirect=${encodeURIComponent(route.fullPath)}`)
    return
  }

  const previous = relation.value ?? {
    following: false,
    followedBy: false,
    mutual: false,
  }

  const nextFollowing = !previous.following
  relation.value = {
    following: nextFollowing,
    followedBy: previous.followedBy,
    mutual: nextFollowing && previous.followedBy,
  }

  try {
    if (previous.following) {
      await unfollowUser(post.value.authorId)
    } else {
      await followUser(post.value.authorId)
    }
  } catch {
    relation.value = previous
    toast.error('关注操作失败，请稍后重试')
  }
}

function openLightbox(images: string[], index: number) {
  lightboxImages.value = images
  lightboxIndex.value = index
  lightboxOpen.value = true
}

function closeLightbox() {
  lightboxOpen.value = false
}

function moveLightbox(step: 1 | -1) {
  const total = lightboxImages.value.length
  if (!total) return
  lightboxIndex.value = (lightboxIndex.value + step + total) % total
}

function handleContentClick(event: MouseEvent) {
  const target = event.target
  if (!(target instanceof HTMLImageElement) || !target.src || !post.value) return

  const images = [...new Set([...post.value.images, target.src])]
  const index = images.findIndex((item) => item === target.src)
  openLightbox(images, index >= 0 ? index : 0)
}

async function submitQuestion() {
  const postId = post.value?.id
  const normalized = question.value.trim()
  if (!postId || !normalized || isAnswering.value) return

  stopAnswer()
  answerMarkdown.value = ''
  isAnswering.value = true
  question.value = ''

  const streamUrl = buildQaStreamUrl(postId, {
    question: normalized,
    topK: 5,
    maxTokens: 1024,
  })

  answerStream = new EventSource(streamUrl)
  answerStream.onmessage = (event) => {
    answerMarkdown.value += event.data
  }
  answerStream.onerror = () => {
    stopAnswer()
  }
}

function stopAnswer() {
  answerStream?.close()
  answerStream = null
  isAnswering.value = false
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function handleWindowScroll() {
  showBackToTop.value = window.scrollY > 500
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    if (lightboxOpen.value) {
      closeLightbox()
      return
    }

    if (panelOpen.value) {
      panelOpen.value = false
    }
  }
}

function writeViewHistory(detail: KnowpostDetailResponse) {
  pushViewHistory({
    id: detail.id,
    title: detail.title,
    coverImage: detail.images[0] ?? null,
    authorNickname: detail.authorNickname,
    viewedAt: new Date().toISOString(),
  })
}

onMounted(() => {
  window.addEventListener('scroll', handleWindowScroll, { passive: true })
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  stopAnswer()
  window.removeEventListener('scroll', handleWindowScroll)
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.post-detail {
  position: relative;
  display: grid;
  grid-template-columns: 72px minmax(0, 800px);
  gap: 28px;
  padding-bottom: 90px;
}

.post-detail__skeleton {
  display: grid;
  gap: 16px;
}

.skeleton {
  border-radius: var(--radius-lg);
  background: linear-gradient(90deg, var(--gray-100), var(--gray-50), var(--gray-100));
  background-size: 200% 100%;
  animation: shimmer 1.5s linear infinite;
}

.skeleton--title {
  width: 60%;
  height: 42px;
}

.skeleton--meta {
  width: 42%;
  height: 26px;
}

.skeleton--gallery {
  width: 100%;
  height: 220px;
}

.skeleton--block {
  width: 100%;
  height: 90px;
}

.post-detail__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 420px;
  text-align: center;
}

.post-detail__error h1 {
  font-size: 28px;
  color: var(--gray-900);
}

.post-detail__error p {
  margin-top: 10px;
  color: var(--gray-500);
}

.post-detail__error button {
  margin-top: 18px;
  height: 42px;
  padding: 0 26px;
  border-radius: var(--radius-full);
  background: var(--primary-500);
  color: #fff;
}

.post-sidebar {
  position: sticky;
  top: 96px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-self: start;
}

.post-sidebar__btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  width: 56px;
  padding: 12px 8px;
  border-radius: var(--radius-lg);
  background: #fff;
  border: 1px solid var(--gray-100);
  box-shadow: var(--shadow-xs);
  color: var(--gray-500);
  font-size: 22px;
}

.post-sidebar__btn span {
  font-size: 11px;
}

.post-sidebar__btn--active-like {
  color: #fa5252;
}

.post-sidebar__btn--active-fav {
  color: #fcc419;
}

.post-sidebar__btn--disabled {
  color: var(--gray-300);
}

.post-main {
  min-width: 0;
}

.post-header {
  padding-bottom: 24px;
  border-bottom: 1px solid var(--gray-100);
}

.post-header__title {
  font-size: 32px;
  font-weight: 700;
  color: var(--gray-900);
  line-height: 1.3;
}

.post-header__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 18px;
}

.post-header__author {
  display: flex;
  align-items: center;
  gap: 12px;
}

.post-header__avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  background: var(--primary-100);
  color: var(--primary-600);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.post-header__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.post-header__author-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--gray-800);
}

.post-header__date {
  margin-top: 4px;
  color: var(--gray-500);
  font-size: 12px;
}

.post-header__follow-btn {
  height: 36px;
  padding: 0 18px;
  border-radius: var(--radius-full);
  background: var(--primary-500);
  color: #fff;
  font-weight: 600;
}

.post-header__follow-btn--secondary {
  background: #fff;
  border: 1px solid var(--gray-200);
  color: var(--gray-700);
}

.post-header__tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 18px;
}

.post-header__tags span {
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  background: var(--primary-50);
  color: var(--primary-600);
  font-size: 12px;
}

.post-gallery {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding: 24px 0;
}

.post-gallery__item {
  flex-shrink: 0;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--gray-100);
}

.post-gallery__item img {
  display: block;
  height: 200px;
  width: auto;
  object-fit: cover;
}

.post-content {
  padding-top: 8px;
}

.post-content__loading,
.post-content__failed {
  padding: 40px 0;
  color: var(--gray-500);
}

.post-content__body :deep(h1),
.post-content__body :deep(h2),
.post-content__body :deep(h3) {
  margin-top: 1.4em;
  margin-bottom: 0.7em;
  color: var(--gray-900);
  line-height: 1.35;
}

.post-content__body :deep(h1) {
  font-size: 28px;
}

.post-content__body :deep(h2) {
  padding-left: 12px;
  border-left: 3px solid var(--primary-500);
  font-size: 22px;
}

.post-content__body :deep(h3) {
  font-size: 18px;
}

.post-content__body :deep(p),
.post-content__body :deep(li) {
  color: var(--gray-700);
  font-size: 16px;
  line-height: 1.85;
}

.post-content__body :deep(a) {
  color: var(--primary-500);
}

.post-content__body :deep(blockquote) {
  margin: 18px 0;
  padding: 16px;
  border-left: 3px solid var(--primary-200);
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
  background: var(--gray-50);
}

.post-content__body :deep(pre) {
  overflow-x: auto;
  padding: 16px;
  border-radius: var(--radius-md);
  background: #f6f8fa;
}

.post-content__body :deep(code) {
  font-family: var(--font-mono);
}

.post-content__body :deep(img) {
  display: block;
  max-width: 100%;
  margin: 18px auto;
  border-radius: var(--radius-md);
  cursor: zoom-in;
}

.post-content__body :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 18px 0;
}

.post-content__body :deep(th),
.post-content__body :deep(td) {
  border: 1px solid var(--gray-200);
  padding: 8px 12px;
}

.post-content__body :deep(th) {
  background: var(--gray-50);
}

.post-ai-trigger {
  position: fixed;
  right: 24px;
  bottom: 24px;
  height: 48px;
  padding: 0 22px;
  border-radius: var(--radius-full);
  background: var(--primary-500);
  color: #fff;
  box-shadow: var(--shadow-lg);
  z-index: 90;
}

.post-ai-panel {
  position: fixed;
  right: 24px;
  top: 88px;
  bottom: 24px;
  width: 380px;
  display: flex;
  flex-direction: column;
  padding: 18px;
  border-radius: var(--radius-xl);
  background: #fff;
  box-shadow: var(--shadow-xl);
  transform: translateX(calc(100% + 32px));
  transition: transform 300ms ease;
  z-index: 95;
}

.post-ai-panel--open {
  transform: translateX(0);
}

.post-ai-panel__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.post-ai-panel__header h2 {
  font-size: 18px;
  font-weight: 600;
  color: var(--gray-900);
}

.post-ai-panel__header p {
  margin-top: 6px;
  font-size: 12px;
  color: var(--gray-500);
}

.post-ai-panel__header button {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--gray-100);
}

.post-ai-panel__body {
  flex: 1;
  overflow-y: auto;
  margin-top: 16px;
  padding-right: 4px;
}

.post-ai-panel__empty {
  color: var(--gray-500);
  font-size: 14px;
  line-height: 1.7;
}

.post-ai-panel__footer {
  margin-top: 18px;
}

.post-ai-panel__input {
  width: 100%;
  min-height: 104px;
  padding: 14px;
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-md);
  resize: vertical;
}

.post-ai-panel__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 12px;
}

.post-ai-panel__note {
  color: var(--gray-500);
  font-size: 12px;
}

.post-ai-panel__submit {
  height: 38px;
  padding: 0 20px;
  border-radius: var(--radius-full);
  background: var(--primary-500);
  color: #fff;
  font-weight: 600;
}

.post-mobile-bar {
  display: none;
}

.lightbox {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.85);
  z-index: 999;
}

.lightbox__close {
  position: absolute;
  top: 24px;
  right: 24px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.16);
  color: #fff;
  font-size: 24px;
}

.lightbox__image {
  max-width: 90vw;
  max-height: 80vh;
  border-radius: var(--radius-md);
}

.lightbox__nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.18);
  color: #fff;
  font-size: 28px;
}

.lightbox__nav--prev {
  left: 24px;
}

.lightbox__nav--next {
  right: 24px;
}

.lightbox__counter {
  position: absolute;
  top: 26px;
  left: 24px;
  color: #fff;
  font-size: 14px;
}

.lightbox__thumbs {
  position: absolute;
  bottom: 24px;
  display: flex;
  gap: 10px;
  overflow-x: auto;
  max-width: 90vw;
}

.lightbox__thumb {
  width: 74px;
  height: 56px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  border: 2px solid transparent;
  opacity: 0.7;
}

.lightbox__thumb--active {
  border-color: var(--primary-500);
  opacity: 1;
}

.lightbox__thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@keyframes shimmer {
  0% {
    background-position: 100% 0;
  }
  100% {
    background-position: -100% 0;
  }
}

@media (max-width: 1199px) {
  .post-detail {
    grid-template-columns: 1fr;
  }

  .post-sidebar {
    display: none;
  }

  .post-mobile-bar {
    position: fixed;
    left: 16px;
    right: 16px;
    bottom: 16px;
    display: flex;
    gap: 10px;
    padding: 10px;
    border-radius: var(--radius-full);
    background: rgba(255, 255, 255, 0.94);
    box-shadow: var(--shadow-lg);
    z-index: 92;
  }

  .post-mobile-bar__btn {
    flex: 1;
    height: 40px;
    border-radius: var(--radius-full);
    background: var(--gray-100);
    color: var(--gray-700);
  }

  .post-mobile-bar__btn--active {
    background: var(--primary-50);
    color: var(--primary-600);
  }

  .post-ai-trigger {
    bottom: 76px;
  }
}

@media (max-width: 767px) {
  .post-header__title {
    font-size: 26px;
  }

  .post-header__meta {
    flex-direction: column;
    align-items: flex-start;
  }

  .post-gallery__item img {
    height: 180px;
  }

  .post-ai-panel {
    top: auto;
    right: 0;
    left: 0;
    bottom: 0;
    width: auto;
    height: 78vh;
    border-radius: var(--radius-xl) var(--radius-xl) 0 0;
    transform: translateY(100%);
  }

  .post-ai-panel--open {
    transform: translateY(0);
  }

  .post-ai-trigger {
    right: 16px;
  }
}
</style>
