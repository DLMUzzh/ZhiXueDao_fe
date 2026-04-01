<template>
  <MainLayout>
    <div class="search-page">
      <section class="search-hero">
        <div class="search-hero__content">
          <h1 class="search-hero__title">搜索知识</h1>
          <p class="search-hero__subtitle">用关键词发现社区中更适合你的知文内容</p>

          <div ref="searchBoxRef" class="search-box">
            <div class="search-box__input-wrap">
              <svg class="search-box__icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                v-model="searchInput"
                class="search-box__input"
                type="search"
                placeholder="输入关键词搜索知文…"
                aria-label="搜索知文"
                @focus="handleInputFocus"
                @keydown.down.prevent="moveActive(1)"
                @keydown.up.prevent="moveActive(-1)"
                @keydown.esc="closeDropdown"
                @keydown.enter.prevent="handleEnter"
              />
              <button
                v-if="searchInput"
                class="search-box__clear"
                type="button"
                aria-label="清空搜索"
                @click="clearInput"
              >
                ×
              </button>
              <button class="search-box__submit" type="button" @click="submitSearch()">
                搜索
              </button>
            </div>

            <Transition name="dropdown">
              <div v-if="showDropdown" class="search-dropdown">
                <div class="search-dropdown__section">
                  <div class="search-dropdown__header">联想建议</div>
                  <div v-if="isSuggesting" class="search-dropdown__state">加载中…</div>
                  <div v-else-if="!suggestions.length" class="search-dropdown__state">无匹配建议</div>
                  <button
                    v-for="(item, index) in suggestions"
                    :key="`suggest-${item}`"
                    class="search-dropdown__item"
                    :class="{ 'search-dropdown__item--active': activeIndex === index }"
                    type="button"
                    @mousedown.prevent="submitSearch(item)"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    <span>{{ item }}</span>
                  </button>
                </div>

                <div v-if="history.length" class="search-dropdown__section">
                  <div class="search-dropdown__header">
                    <span>搜索历史</span>
                    <button class="search-dropdown__clear" type="button" @mousedown.prevent="handleClearHistory">
                      清除历史
                    </button>
                  </div>
                  <button
                    v-for="(item, historyIndex) in history"
                    :key="`history-${item}`"
                    class="search-dropdown__item"
                    :class="{ 'search-dropdown__item--active': activeIndex === suggestions.length + historyIndex }"
                    type="button"
                    @mousedown.prevent="submitSearch(item)"
                  >
                    <span class="search-dropdown__history-dot"></span>
                    <span>{{ item }}</span>
                  </button>
                </div>
              </div>
            </Transition>
          </div>

          <div class="search-tags">
            <span class="search-tags__label">热门标签:</span>
            <button
              v-for="tag in hotTags"
              :key="tag"
              class="search-tags__tag"
              type="button"
              @click="submitSearch(tag)"
            >
              {{ tag }}
            </button>
          </div>
        </div>
      </section>

      <section v-if="hasSearched || isSearching || results.length" class="search-result">
        <div class="search-result__toolbar">
          <div>
            <h2 class="search-result__title">搜索结果</h2>
            <p class="search-result__count">
              {{ resultCountText }}
            </p>
          </div>

          <div v-if="!isMobile" class="search-result__view-switch">
            <button
              class="search-result__view-btn"
              :class="{ 'search-result__view-btn--active': effectiveViewMode === 'grid' }"
              type="button"
              aria-label="网格视图"
              @click="viewMode = 'grid'"
            >
              ▦
            </button>
            <button
              class="search-result__view-btn"
              :class="{ 'search-result__view-btn--active': effectiveViewMode === 'list' }"
              type="button"
              aria-label="列表视图"
              @click="viewMode = 'list'"
            >
              ☰
            </button>
          </div>
        </div>

        <div v-if="isSearching" :class="resultContainerClass">
          <CardSkeleton v-for="item in 6" :key="item" />
        </div>

        <div v-else-if="errorMessage && !results.length" class="search-state">
          <h3 class="search-state__title">搜索失败</h3>
          <p class="search-state__desc">{{ errorMessage }}</p>
          <button class="search-state__btn" type="button" @click="retrySearch">重新搜索</button>
        </div>

        <div v-else-if="hasSearched && !results.length" class="search-state">
          <h3 class="search-state__title">未找到相关内容</h3>
          <p class="search-state__desc">换个关键词试试，或者从热门标签开始浏览。</p>
        </div>

        <div v-else>
          <div :class="resultContainerClass">
            <KnowPostCard
              v-if="effectiveViewMode === 'grid'"
              v-for="post in results"
              :key="post.id"
              :post="post"
              @like="handleLike"
              @fav="handleFav"
            />
            <SearchResultListItem
              v-else
              v-for="post in results"
              :key="post.id"
              :post="post"
              @like="handleLike"
              @fav="handleFav"
            />
          </div>

          <div class="search-result__footer">
            <div v-if="isLoadingMore" class="search-result__loading">正在加载更多…</div>
            <button
              v-else-if="hasMore"
              class="search-result__load-more"
              type="button"
              @click="loadMore"
            >
              加载更多
            </button>
            <div v-else-if="results.length" class="search-result__finished">已加载全部</div>
          </div>

          <div ref="sentinelRef" class="search-result__sentinel"></div>
        </div>
      </section>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MainLayout from '../components/layout/MainLayout.vue'
import CardSkeleton from '../components/home/CardSkeleton.vue'
import KnowPostCard from '../components/home/KnowPostCard.vue'
import SearchResultListItem from '../components/search/SearchResultListItem.vue'
import { useToast } from '../composables/useToast'
import { useAuthStore } from '../stores/auth'
import type { ApiError } from '../types/auth'
import type { FeedItem } from '../types/knowpost'
import { normalizeHighlightHtml } from '../utils/highlight'
import { clearSearchHistory, pushSearchHistory, readSearchHistory } from '../utils/storage'
import { favKnowpost, likeKnowpost, unfavKnowpost, unlikeKnowpost } from '../services/actionService'
import { getSearchSuggestions, searchKnowposts } from '../services/searchService'

const hotTags = ['Java', 'Python', 'AI', '前端', '产品']

const route = useRoute()
const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()

const searchBoxRef = ref<HTMLElement | null>(null)
const sentinelRef = ref<HTMLElement | null>(null)
const searchInput = ref('')
const suggestions = ref<string[]>([])
const history = ref<string[]>(readSearchHistory())
const dropdownOpen = ref(false)
const activeIndex = ref(-1)
const isSuggesting = ref(false)
const isSearching = ref(false)
const isLoadingMore = ref(false)
const hasSearched = ref(false)
const errorMessage = ref('')
const results = ref<FeedItem[]>([])
const nextAfter = ref<string | null>(null)
const hasMore = ref(false)
const isMobile = ref(window.innerWidth < 768)
const viewMode = ref<'grid' | 'list'>('grid')

let suggestTimer = 0
let observer: IntersectionObserver | null = null

const effectiveViewMode = computed(() => (isMobile.value ? 'list' : viewMode.value))
const resultContainerClass = computed(() =>
  effectiveViewMode.value === 'grid' ? 'search-result__grid' : 'search-result__list',
)
const showDropdown = computed(() => {
  return dropdownOpen.value && (searchInput.value.trim().length > 0 || history.value.length > 0)
})
const resultCountText = computed(() => {
  if (!results.value.length) return '暂无结果'
  return hasMore.value ? `已展示 ${results.value.length} 条` : `共 ${results.value.length} 条`
})

watch(searchInput, (value) => {
  window.clearTimeout(suggestTimer)
  activeIndex.value = -1

  if (!dropdownOpen.value || value.trim().length < 1) {
    suggestions.value = []
    isSuggesting.value = false
    return
  }

  suggestTimer = window.setTimeout(async () => {
    isSuggesting.value = true
    try {
      const { data } = await getSearchSuggestions(value.trim(), 5)
      suggestions.value = data.items
    } catch {
      suggestions.value = []
    } finally {
      isSuggesting.value = false
    }
  }, 300)
})

watch(
  () => route.query.q,
  async (value) => {
    const keyword = typeof value === 'string' ? value.trim() : ''
    searchInput.value = keyword

    if (!keyword) {
      resetSearchState()
      return
    }

    await runSearch(keyword, true)
  },
  { immediate: true },
)

function handleInputFocus() {
  dropdownOpen.value = true
}

function closeDropdown() {
  dropdownOpen.value = false
  activeIndex.value = -1
}

function clearInput() {
  searchInput.value = ''
}

function handleEnter() {
  const dropdownItems = [...suggestions.value, ...history.value]
  if (activeIndex.value >= 0 && dropdownItems[activeIndex.value]) {
    submitSearch(dropdownItems[activeIndex.value])
    return
  }

  submitSearch()
}

function moveActive(step: 1 | -1) {
  const dropdownItems = [...suggestions.value, ...history.value]
  if (!dropdownItems.length) return

  const next = activeIndex.value + step
  if (next < 0) {
    activeIndex.value = dropdownItems.length - 1
    return
  }

  activeIndex.value = next % dropdownItems.length
}

async function submitSearch(keyword = searchInput.value) {
  const normalized = keyword.trim()
  if (!normalized) {
    await router.replace('/search')
    resetSearchState()
    closeDropdown()
    return
  }

  pushSearchHistory(normalized)
  history.value = readSearchHistory()
  closeDropdown()

  if (route.query.q === normalized) {
    await runSearch(normalized, true)
    return
  }

  await router.push({
    path: '/search',
    query: { q: normalized },
  })
}

async function runSearch(keyword: string, reset: boolean) {
  const normalized = keyword.trim()
  if (!normalized) {
    resetSearchState()
    return
  }

  errorMessage.value = ''
  hasSearched.value = true

  if (reset) {
    isSearching.value = true
    results.value = []
    nextAfter.value = null
    hasMore.value = false
  } else {
    isLoadingMore.value = true
  }

  try {
    const { data } = await searchKnowposts({
      q: normalized,
      size: 20,
      after: reset ? undefined : nextAfter.value ?? undefined,
    })

    const mappedItems = data.items.map((item) => withHighlight(item, normalized))
    results.value = reset ? mappedItems : [...results.value, ...mappedItems]
    nextAfter.value = data.nextAfter ?? null
    hasMore.value = data.hasMore

    if (results.value.length) {
      await nextTick()
      setupObserver()
    }
  } catch (error) {
    const apiError = error as ApiError
    errorMessage.value = apiError.message || '搜索失败，请稍后重试'
    toast.error(errorMessage.value)
  } finally {
    isSearching.value = false
    isLoadingMore.value = false
  }
}

async function loadMore() {
  if (!hasMore.value || isLoadingMore.value || !route.query.q || typeof route.query.q !== 'string') {
    return
  }

  await runSearch(route.query.q, false)
}

function handleClearHistory() {
  clearSearchHistory()
  history.value = []
}

function retrySearch() {
  if (typeof route.query.q === 'string' && route.query.q.trim()) {
    void runSearch(route.query.q, true)
  }
}

async function handleLike(postId: string) {
  if (!authStore.isLoggedIn) {
    await router.push(`/login?redirect=${encodeURIComponent(route.fullPath)}`)
    return
  }

  const post = results.value.find((item) => item.id === postId)
  if (!post) return

  const previousLiked = post.liked
  post.liked = !previousLiked
  post.likeCount += previousLiked ? -1 : 1

  try {
    if (previousLiked) {
      await unlikeKnowpost(postId)
    } else {
      await likeKnowpost(postId)
    }
  } catch {
    post.liked = previousLiked
    post.likeCount += previousLiked ? 1 : -1
    toast.error('操作失败，请稍后重试')
  }
}

async function handleFav(postId: string) {
  if (!authStore.isLoggedIn) {
    await router.push(`/login?redirect=${encodeURIComponent(route.fullPath)}`)
    return
  }

  const post = results.value.find((item) => item.id === postId)
  if (!post) return

  const previousFaved = post.faved
  post.faved = !previousFaved
  post.favoriteCount += previousFaved ? -1 : 1

  try {
    if (previousFaved) {
      await unfavKnowpost(postId)
    } else {
      await favKnowpost(postId)
    }
  } catch {
    post.faved = previousFaved
    post.favoriteCount += previousFaved ? 1 : -1
    toast.error('操作失败，请稍后重试')
  }
}

function resetSearchState() {
  hasSearched.value = false
  errorMessage.value = ''
  results.value = []
  nextAfter.value = null
  hasMore.value = false
  isSearching.value = false
  isLoadingMore.value = false
}

function withHighlight(item: FeedItem, keyword: string): FeedItem {
  return {
    ...item,
    titleHtml: normalizeHighlightHtml(item.title, keyword),
    descriptionHtml: normalizeHighlightHtml(item.description, keyword),
  }
}

function handleWindowResize() {
  isMobile.value = window.innerWidth < 768
}

function handleClickOutside(event: MouseEvent) {
  if (searchBoxRef.value && !searchBoxRef.value.contains(event.target as Node)) {
    closeDropdown()
  }
}

function setupObserver() {
  observer?.disconnect()
  if (!sentinelRef.value) return

  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        void loadMore()
      }
    },
    { rootMargin: '160px' },
  )

  observer.observe(sentinelRef.value)
}

onMounted(() => {
  setupObserver()
  window.addEventListener('resize', handleWindowResize)
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  window.clearTimeout(suggestTimer)
  observer?.disconnect()
  window.removeEventListener('resize', handleWindowResize)
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.search-page {
  padding-bottom: 40px;
}

.search-hero {
  position: relative;
  overflow: hidden;
  padding: 36px 0 28px;
}

.search-hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at top left, rgba(10, 110, 189, 0.16), transparent 32%),
    radial-gradient(circle at top right, rgba(18, 184, 134, 0.14), transparent 28%);
  pointer-events: none;
}

.search-hero__content {
  position: relative;
}

.search-hero__title {
  font-size: 32px;
  font-weight: 700;
  color: var(--gray-900);
}

.search-hero__subtitle {
  margin-top: 10px;
  font-size: 15px;
  color: var(--gray-500);
}

.search-box {
  position: relative;
  margin-top: 24px;
  max-width: 720px;
}

.search-box__input-wrap {
  display: flex;
  align-items: center;
  height: 56px;
  padding: 0 8px 0 18px;
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-lg);
  background: #fff;
  box-shadow: var(--shadow-sm);
}

.search-box__input-wrap:focus-within {
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px var(--primary-50);
}

.search-box__icon {
  color: var(--gray-400);
  flex-shrink: 0;
}

.search-box__input {
  flex: 1;
  min-width: 0;
  height: 100%;
  border: none;
  outline: none;
  background: transparent;
  padding: 0 14px;
  font-size: 16px;
}

.search-box__clear {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  color: var(--gray-400);
}

.search-box__clear:hover {
  background: var(--gray-100);
  color: var(--gray-700);
}

.search-box__submit {
  height: 40px;
  padding: 0 22px;
  border-radius: var(--radius-full);
  background: var(--primary-500);
  color: #fff;
  font-weight: 600;
  transition: background 150ms ease, transform 150ms ease;
}

.search-box__submit:hover {
  background: var(--primary-600);
  transform: translateY(-1px);
}

.search-dropdown {
  position: absolute;
  top: calc(100% + 10px);
  left: 0;
  right: 0;
  padding: 12px;
  border: 1px solid var(--gray-100);
  border-radius: var(--radius-lg);
  background: #fff;
  box-shadow: var(--shadow-lg);
  z-index: 20;
}

.search-dropdown__section + .search-dropdown__section {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--gray-100);
}

.search-dropdown__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  color: var(--gray-500);
  font-size: 12px;
  font-weight: 600;
}

.search-dropdown__clear {
  color: var(--gray-500);
  font-size: 12px;
}

.search-dropdown__item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 8px;
  border-radius: var(--radius-sm);
  color: var(--gray-700);
  text-align: left;
}

.search-dropdown__item:hover,
.search-dropdown__item--active {
  background: var(--gray-50);
}

.search-dropdown__state {
  padding: 10px 8px;
  color: var(--gray-500);
  font-size: 13px;
}

.search-dropdown__history-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--gray-300);
}

.search-tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 14px;
}

.search-tags__label {
  color: var(--gray-500);
  font-size: 13px;
}

.search-tags__tag {
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  background: var(--gray-100);
  color: var(--gray-700);
  font-size: 12px;
  transition: background 150ms ease, color 150ms ease;
}

.search-tags__tag:hover {
  background: var(--primary-50);
  color: var(--primary-600);
}

.search-result {
  margin-top: 18px;
}

.search-result__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.search-result__title {
  font-size: 22px;
  font-weight: 600;
  color: var(--gray-900);
}

.search-result__count {
  margin-top: 4px;
  color: var(--gray-500);
  font-size: 14px;
}

.search-result__view-switch {
  display: flex;
  gap: 8px;
}

.search-result__view-btn {
  width: 38px;
  height: 38px;
  border-radius: var(--radius-md);
  border: 1px solid var(--gray-200);
  background: #fff;
  color: var(--gray-500);
}

.search-result__view-btn--active {
  border-color: var(--primary-500);
  background: var(--primary-50);
  color: var(--primary-500);
}

.search-result__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.search-result__list {
  display: grid;
  gap: 16px;
}

.search-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 260px;
  border: 1px dashed var(--gray-200);
  border-radius: var(--radius-xl);
  background: rgba(255, 255, 255, 0.6);
  text-align: center;
}

.search-state__title {
  font-size: 20px;
  font-weight: 600;
  color: var(--gray-800);
}

.search-state__desc {
  margin-top: 8px;
  color: var(--gray-500);
}

.search-state__btn {
  margin-top: 18px;
  height: 40px;
  padding: 0 24px;
  border-radius: var(--radius-full);
  background: var(--primary-500);
  color: #fff;
  font-weight: 600;
}

.search-result__footer {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 28px 0 8px;
}

.search-result__load-more {
  height: 42px;
  padding: 0 28px;
  border-radius: var(--radius-full);
  border: 1px solid var(--gray-200);
  background: #fff;
  color: var(--gray-700);
  font-weight: 600;
}

.search-result__load-more:hover {
  border-color: var(--primary-500);
  color: var(--primary-500);
}

.search-result__loading,
.search-result__finished {
  color: var(--gray-500);
  font-size: 14px;
}

.search-result__sentinel {
  height: 1px;
}

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

@media (max-width: 1199px) and (min-width: 768px) {
  .search-result__grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
}

@media (max-width: 767px) {
  .search-hero {
    padding-top: 20px;
  }

  .search-hero__title {
    font-size: 26px;
  }

  .search-box__input-wrap {
    height: 52px;
    padding-left: 14px;
  }

  .search-box__submit {
    padding: 0 16px;
  }

  .search-result__toolbar {
    align-items: flex-start;
  }
}
</style>
