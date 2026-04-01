<template>
  <MainLayout>
    <div class="feed-page">
      <!-- 标题区 -->
      <div class="feed-header">
        <div class="feed-header__left">
          <h1 class="feed-header__title">发现知识</h1>
          <p class="feed-header__subtitle">探索社区中最有价值的知识内容</p>
        </div>
        <div class="feed-header__right">
          <div class="sort-select" @click="toggleSort" ref="sortRef">
            <span class="sort-select__label">{{ sortOptions[currentSort].label }}</span>
            <svg class="sort-select__icon" :class="{ 'sort-select__icon--open': sortOpen }" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
            <Transition name="dropdown">
              <div v-if="sortOpen" class="sort-select__dropdown">
                <button
                  v-for="(opt, key) in sortOptions"
                  :key="key"
                  class="sort-select__option"
                  :class="{ 'sort-select__option--active': currentSort === key }"
                  @click.stop="selectSort(key as SortKey)"
                >
                  {{ opt.label }}
                </button>
              </div>
            </Transition>
          </div>
        </div>
      </div>

      <!-- Tab 标签栏 -->
      <div class="feed-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="feed-tabs__item"
          :class="{ 'feed-tabs__item--active': activeTab === tab.key }"
          @click="switchTab(tab.key)"
        >
          {{ tab.label }}
        </button>
        <div class="feed-tabs__indicator" :style="indicatorStyle"></div>
      </div>

      <!-- 需要登录提示（关注 Tab） -->
      <div v-if="activeTab === 'following' && !authStore.isLoggedIn" class="feed-empty">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--gray-300)" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
        <h3 class="feed-empty__title">登录后查看关注内容</h3>
        <p class="feed-empty__desc">关注你感兴趣的创作者，获取个性化推荐</p>
        <RouterLink to="/login" class="feed-empty__btn">去登录</RouterLink>
      </div>

      <!-- 骨架屏 -->
      <div v-else-if="isFirstLoad" class="feed-grid">
        <CardSkeleton v-for="i in 9" :key="i" />
      </div>

      <!-- 空状态 -->
      <div v-else-if="posts.length === 0 && !loadError" class="feed-empty">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--gray-300)" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
        </svg>
        <h3 class="feed-empty__title">暂无内容</h3>
        <p class="feed-empty__desc">去创作你的第一篇知文吧</p>
        <RouterLink to="/create" class="feed-empty__btn">去创作</RouterLink>
      </div>

      <!-- 加载错误 -->
      <div v-else-if="posts.length === 0 && loadError" class="feed-empty">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--error)" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
        <h3 class="feed-empty__title">加载失败</h3>
        <p class="feed-empty__desc">{{ loadError }}</p>
        <button class="feed-empty__btn" @click="loadFeed(1, true)">重新加载</button>
      </div>

      <!-- 卡片网格 -->
      <template v-else>
        <div class="feed-grid">
          <KnowPostCard
            v-for="post in sortedPosts"
            :key="post.id"
            :post="post"
            @like="handleLike"
            @fav="handleFav"
          />
        </div>

        <!-- 底部加载状态 -->
        <div class="feed-bottom">
          <div v-if="isLoadingMore" class="feed-bottom__loading">
            <div class="spinner"></div>
            <span>加载中…</span>
          </div>
          <div v-else-if="!hasMore" class="feed-bottom__end">
            <span class="feed-bottom__end-line"></span>
            <span class="feed-bottom__end-text">已加载全部</span>
            <span class="feed-bottom__end-line"></span>
          </div>
          <button v-else class="feed-bottom__more-btn" @click="loadMore">
            加载更多
          </button>
        </div>
      </template>

      <!-- 滚动哨兵 -->
      <div ref="sentinelRef" class="feed-sentinel"></div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import MainLayout from '../components/layout/MainLayout.vue'
import KnowPostCard from '../components/home/KnowPostCard.vue'
import CardSkeleton from '../components/home/CardSkeleton.vue'
import { useAuthStore } from '../stores/auth'
import { useToast } from '../composables/useToast'
import * as feedService from '../services/feedService'
import type { FeedItem } from '../types/knowpost'
import type { ApiError } from '../types/auth'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

/* ---------- Tab ---------- */
type TabKey = 'recommend' | 'latest' | 'hot' | 'following'

const tabs: { key: TabKey; label: string }[] = [
  { key: 'recommend', label: '推荐' },
  { key: 'latest', label: '最新' },
  { key: 'hot', label: '热门' },
  { key: 'following', label: '关注' },
]
const activeTab = ref<TabKey>('recommend')

const indicatorStyle = computed(() => {
  const idx = tabs.findIndex(t => t.key === activeTab.value)
  return {
    transform: `translateX(${idx * 100}%)`,
    width: `${100 / tabs.length}%`,
  }
})

function switchTab(key: TabKey) {
  if (activeTab.value === key) return
  activeTab.value = key
  if (key !== 'following' || authStore.isLoggedIn) {
    loadFeed(1, true)
  }
}

/* ---------- Sort ---------- */
type SortKey = 'latest' | 'likes' | 'favs'

const sortOptions: Record<SortKey, { label: string }> = {
  latest: { label: '最新发布' },
  likes: { label: '最多点赞' },
  favs: { label: '最多收藏' },
}
const currentSort = ref<SortKey>('latest')
const sortOpen = ref(false)
const sortRef = ref<HTMLElement | null>(null)

function toggleSort() { sortOpen.value = !sortOpen.value }

function selectSort(key: SortKey) {
  currentSort.value = key
  sortOpen.value = false
}

function handleSortClickOutside(e: MouseEvent) {
  if (sortRef.value && !sortRef.value.contains(e.target as Node)) {
    sortOpen.value = false
  }
}

/* ---------- Feed 数据 ---------- */
const posts = ref<FeedItem[]>([])
const currentPage = ref(1)
const hasMore = ref(true)
const isFirstLoad = ref(true)
const isLoadingMore = ref(false)
const loadError = ref('')

const sortedPosts = computed(() => {
  const arr = [...posts.value]
  // 置顶优先
  arr.sort((a, b) => {
    if (a.isTop && !b.isTop) return -1
    if (!a.isTop && b.isTop) return 1
    return 0
  })

  if (activeTab.value === 'hot' || currentSort.value === 'likes') {
    arr.sort((a, b) => {
      if (a.isTop !== b.isTop) return a.isTop ? -1 : 1
      return b.likeCount - a.likeCount
    })
  } else if (currentSort.value === 'favs') {
    arr.sort((a, b) => {
      if (a.isTop !== b.isTop) return a.isTop ? -1 : 1
      return b.favoriteCount - a.favoriteCount
    })
  }

  return arr
})

async function loadFeed(page: number, reset = false) {
  if (reset) {
    isFirstLoad.value = true
    posts.value = []
    hasMore.value = true
    loadError.value = ''
  } else {
    isLoadingMore.value = true
  }

  try {
    const { data } = await feedService.getFeed(page, 20)
    if (reset) {
      posts.value = data.items
    } else {
      posts.value.push(...data.items)
    }
    currentPage.value = data.page
    hasMore.value = data.hasMore
    loadError.value = ''
  } catch (err) {
    const apiErr = err as ApiError
    loadError.value = apiErr.message || '网络异常，请稍后重试'
    if (!reset) {
      toast.error('加载失败，请重试')
    }
  } finally {
    isFirstLoad.value = false
    isLoadingMore.value = false
  }
}

function loadMore() {
  if (!hasMore.value || isLoadingMore.value) return
  loadFeed(currentPage.value + 1)
}

/* ---------- IntersectionObserver 滚动加载 ---------- */
const sentinelRef = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

function setupObserver() {
  if (!sentinelRef.value) return
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && hasMore.value && !isLoadingMore.value && !isFirstLoad.value && posts.value.length > 0) {
        loadMore()
      }
    },
    { rootMargin: '200px' },
  )
  observer.observe(sentinelRef.value)
}

/* ---------- 点赞 / 收藏 ---------- */
async function handleLike(postId: string) {
  if (!authStore.isLoggedIn) {
    router.push(`/login?redirect=${encodeURIComponent('/')}`)
    return
  }

  const post = posts.value.find(p => p.id === postId)
  if (!post) return

  // 乐观更新
  const wasLiked = post.liked
  post.liked = !wasLiked
  post.likeCount += wasLiked ? -1 : 1

  try {
    if (wasLiked) {
      await feedService.unlikePost(postId)
    } else {
      await feedService.likePost(postId)
    }
  } catch {
    // 回滚
    post.liked = wasLiked
    post.likeCount += wasLiked ? 1 : -1
    toast.error('操作失败，请重试')
  }
}

async function handleFav(postId: string) {
  if (!authStore.isLoggedIn) {
    router.push(`/login?redirect=${encodeURIComponent('/')}`)
    return
  }

  const post = posts.value.find(p => p.id === postId)
  if (!post) return

  const wasFaved = post.faved
  post.faved = !wasFaved
  post.favoriteCount += wasFaved ? -1 : 1

  try {
    if (wasFaved) {
      await feedService.unfavPost(postId)
    } else {
      await feedService.favPost(postId)
    }
  } catch {
    post.faved = wasFaved
    post.favoriteCount += wasFaved ? 1 : -1
    toast.error('操作失败，请重试')
  }
}

/* ---------- 生命周期 ---------- */
onMounted(() => {
  loadFeed(1, true)
  nextTick(() => setupObserver())
  document.addEventListener('click', handleSortClickOutside)
})

onUnmounted(() => {
  observer?.disconnect()
  document.removeEventListener('click', handleSortClickOutside)
})
</script>

<style scoped>
.feed-page {
  padding-bottom: 48px;
}

/* ===== Header ===== */
.feed-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
}

.feed-header__title {
  font-size: 28px;
  font-weight: 700;
  color: var(--gray-900);
  line-height: 1.3;
}

.feed-header__subtitle {
  font-size: 14px;
  color: var(--gray-500);
  margin-top: 4px;
}

/* ===== Sort Select ===== */
.sort-select {
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-md);
  background: #fff;
  cursor: pointer;
  user-select: none;
  font-size: 14px;
  color: var(--gray-700);
  transition: border-color 150ms ease;
}

.sort-select:hover {
  border-color: var(--gray-300);
}

.sort-select__icon {
  color: var(--gray-400);
  transition: transform 200ms ease;
}

.sort-select__icon--open {
  transform: rotate(180deg);
}

.sort-select__dropdown {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  min-width: 140px;
  background: #fff;
  border: 1px solid var(--gray-100);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  padding: 4px;
  z-index: 50;
}

.sort-select__option {
  display: block;
  width: 100%;
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  color: var(--gray-700);
  text-align: left;
  transition: background 120ms ease;
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
}

.sort-select__option:hover {
  background: var(--gray-50);
}

.sort-select__option--active {
  color: var(--primary-500);
  font-weight: 500;
}

/* ===== Tabs ===== */
.feed-tabs {
  position: relative;
  display: flex;
  border-bottom: 1px solid var(--gray-200);
  margin-bottom: 24px;
}

.feed-tabs__item {
  flex: 1;
  padding: 12px 0;
  text-align: center;
  font-size: 15px;
  font-weight: 500;
  color: var(--gray-700);
  background: none;
  border: none;
  cursor: pointer;
  transition: color 200ms ease;
  position: relative;
  z-index: 1;
  font-family: inherit;
}

.feed-tabs__item:hover {
  color: var(--gray-900);
  background: var(--gray-50);
  border-radius: var(--radius-sm) var(--radius-sm) 0 0;
}

.feed-tabs__item--active {
  color: var(--primary-500);
}

.feed-tabs__indicator {
  position: absolute;
  bottom: -1px;
  left: 0;
  height: 2px;
  background: var(--primary-500);
  border-radius: 1px;
  transition: transform 200ms ease, width 200ms ease;
}

/* ===== Grid ===== */
.feed-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

@media (max-width: 1199px) and (min-width: 768px) {
  .feed-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
}

@media (max-width: 767px) {
  .feed-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .feed-header__title {
    font-size: 22px;
  }

  .feed-header {
    flex-direction: column;
    gap: 12px;
  }
}

/* ===== Empty State ===== */
.feed-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80px 24px;
  text-align: center;
}

.feed-empty__title {
  font-size: 18px;
  font-weight: 600;
  color: var(--gray-800);
  margin-top: 16px;
}

.feed-empty__desc {
  font-size: 14px;
  color: var(--gray-500);
  margin-top: 6px;
}

.feed-empty__btn {
  display: inline-flex;
  align-items: center;
  margin-top: 20px;
  padding: 10px 28px;
  border-radius: var(--radius-full);
  background: var(--primary-500);
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: all 150ms ease;
  font-family: inherit;
}

.feed-empty__btn:hover {
  background: var(--primary-600);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(10, 110, 189, 0.25);
  text-decoration: none;
  color: #fff;
}

/* ===== Bottom ===== */
.feed-bottom {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 0 16px;
}

.feed-bottom__loading {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--gray-500);
  font-size: 14px;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--gray-200);
  border-top-color: var(--primary-500);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.feed-bottom__end {
  display: flex;
  align-items: center;
  gap: 16px;
  color: var(--gray-400);
  font-size: 13px;
}

.feed-bottom__end-line {
  width: 48px;
  height: 1px;
  background: var(--gray-200);
}

.feed-bottom__more-btn {
  padding: 10px 32px;
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-full);
  background: #fff;
  color: var(--gray-700);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 150ms ease;
  font-family: inherit;
}

.feed-bottom__more-btn:hover {
  border-color: var(--primary-500);
  color: var(--primary-500);
  background: var(--primary-50);
}

/* ===== Sentinel ===== */
.feed-sentinel {
  height: 1px;
}

/* ===== Dropdown Transition ===== */
.dropdown-enter-active {
  transition: all 150ms ease-out;
}

.dropdown-leave-active {
  transition: all 100ms ease-in;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.98);
}
</style>
