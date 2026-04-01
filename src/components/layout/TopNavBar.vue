<template>
  <nav class="navbar">
    <div class="navbar__inner">
      <RouterLink to="/" class="navbar__logo">
        <div class="navbar__logo-icon">
          <svg width="32" height="32" viewBox="0 0 42 42" fill="none">
            <circle cx="21" cy="21" r="20" fill="var(--primary-50)" stroke="var(--primary-200)" stroke-width="1"/>
            <path d="M21 8C14.4 8 9 13.4 9 20c0 4.2 2.2 7.9 5.5 10l1-2.5C13 25.7 11.5 23 11.5 20c0-5.2 4.3-9.5 9.5-9.5s9.5 4.3 9.5 9.5c0 3-1.5 5.7-3.8 7.5l1 2.5c3.3-2.1 5.3-5.8 5.3-10C33 13.4 27.6 8 21 8z" fill="var(--primary-500)"/>
            <circle cx="21" cy="20" r="4" fill="var(--primary-500)"/>
            <path d="M21 26l-3 8h6l-3-8z" fill="#5BA3D9"/>
          </svg>
        </div>
        <span class="navbar__logo-text">学知岛</span>
      </RouterLink>

      <div class="navbar__nav">
        <RouterLink to="/" class="navbar__link" :class="{ 'navbar__link--active': $route.path === '/' }">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          <span>首页</span>
        </RouterLink>
        <RouterLink to="/search" class="navbar__link" :class="{ 'navbar__link--active': $route.path === '/search' }">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <span>搜索</span>
        </RouterLink>
        <RouterLink to="/create" class="navbar__link" :class="{ 'navbar__link--active': $route.path === '/create' }">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
          <span>创作</span>
        </RouterLink>
        <RouterLink to="/learn" class="navbar__link" :class="{ 'navbar__link--active': $route.path === '/learn' }">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
          <span>学习中心</span>
        </RouterLink>
      </div>

      <form ref="searchRef" class="navbar__search" @submit.prevent="submitSearch()">
        <svg class="navbar__search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          v-model="searchKeyword"
          class="navbar__search-input"
          type="search"
          placeholder="搜索知文"
          aria-label="搜索知文"
          @focus="handleSearchFocus"
          @keydown.down.prevent="moveActive(1)"
          @keydown.up.prevent="moveActive(-1)"
          @keydown.esc="closeSuggest"
          @keydown.enter.prevent="handleEnter"
        />
        <button
          v-if="searchKeyword"
          type="button"
          class="navbar__search-clear"
          aria-label="清空搜索"
          @click="clearSearch"
        >
          ×
        </button>

        <Transition name="dropdown">
          <div v-if="showSuggestPanel" class="navbar__suggest">
            <div class="navbar__suggest-title">联想建议</div>
            <div v-if="isSuggesting" class="navbar__suggest-state">加载中…</div>
            <div v-else-if="!suggestions.length" class="navbar__suggest-state">暂无匹配建议</div>
            <button
              v-for="(item, index) in suggestions"
              :key="item"
              type="button"
              class="navbar__suggest-item"
              :class="{ 'navbar__suggest-item--active': activeIndex === index }"
              @mousedown.prevent="submitSearch(item)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <span>{{ item }}</span>
            </button>
          </div>
        </Transition>
      </form>

      <div class="navbar__right">
        <template v-if="authStore.isLoggedIn">
          <div ref="userMenuRef" class="navbar__user" @click="toggleMenu">
            <div class="navbar__avatar">
              <img v-if="authStore.user?.avatar" :src="authStore.user.avatar" alt="头像" />
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <span class="navbar__username">{{ authStore.user?.nickname || '用户' }}</span>
            <svg class="navbar__caret" :class="{ 'navbar__caret--open': menuOpen }" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>

            <Transition name="dropdown">
              <div v-if="menuOpen" class="navbar__dropdown">
                <RouterLink to="/profile" class="navbar__dropdown-item" @click="menuOpen = false">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                  个人主页
                </RouterLink>
                <button class="navbar__dropdown-item navbar__dropdown-item--danger" @click="handleLogout">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  退出登录
                </button>
              </div>
            </Transition>
          </div>
        </template>
        <template v-else>
          <RouterLink to="/login" class="navbar__login-btn">登录</RouterLink>
        </template>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { getSearchSuggestions } from '../../services/searchService'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

const menuOpen = ref(false)
const userMenuRef = ref<HTMLElement | null>(null)
const searchRef = ref<HTMLElement | null>(null)
const searchKeyword = ref(typeof route.query.q === 'string' ? route.query.q : '')
const suggestions = ref<string[]>([])
const isSuggesting = ref(false)
const searchFocused = ref(false)
const activeIndex = ref(-1)

let suggestTimer = 0

const showSuggestPanel = computed(() => searchFocused.value && searchKeyword.value.trim().length > 0)

watch(
  () => route.query.q,
  (value) => {
    if (typeof value === 'string') {
      searchKeyword.value = value
      return
    }

    if (route.path !== '/search') {
      searchKeyword.value = ''
    }
  },
)

watch(searchKeyword, (value) => {
  window.clearTimeout(suggestTimer)
  activeIndex.value = -1

  if (!searchFocused.value || value.trim().length < 1) {
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

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

function handleSearchFocus() {
  searchFocused.value = true
}

function handleClickOutside(event: MouseEvent) {
  if (userMenuRef.value && !userMenuRef.value.contains(event.target as Node)) {
    menuOpen.value = false
  }

  if (searchRef.value && !searchRef.value.contains(event.target as Node)) {
    closeSuggest()
  }
}

function closeSuggest() {
  searchFocused.value = false
  activeIndex.value = -1
}

function clearSearch() {
  searchKeyword.value = ''
  suggestions.value = []
}

function submitSearch(keyword = searchKeyword.value) {
  const normalized = keyword.trim()
  if (!normalized) {
    router.push('/search')
    closeSuggest()
    return
  }

  searchKeyword.value = normalized
  closeSuggest()
  router.push({
    path: '/search',
    query: { q: normalized },
  })
}

function moveActive(step: 1 | -1) {
  if (!suggestions.value.length) return
  const nextIndex = activeIndex.value + step
  if (nextIndex < 0) {
    activeIndex.value = suggestions.value.length - 1
    return
  }

  activeIndex.value = nextIndex % suggestions.value.length
}

function handleEnter() {
  if (activeIndex.value >= 0 && suggestions.value[activeIndex.value]) {
    submitSearch(suggestions.value[activeIndex.value])
    return
  }

  submitSearch()
}

async function handleLogout() {
  menuOpen.value = false
  await authStore.logoutAction()
  router.push('/login')
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => {
  window.clearTimeout(suggestTimer)
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  height: 64px;
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--gray-100);
}

.navbar__inner {
  max-width: 1200px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 0 24px;
}

.navbar__logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  flex-shrink: 0;
}

.navbar__logo-icon {
  width: 32px;
  height: 32px;
}

.navbar__logo-text {
  font-size: 20px;
  font-weight: 700;
  color: var(--gray-900);
  letter-spacing: 1px;
}

.navbar__nav {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
}

.navbar__link {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 500;
  color: var(--gray-700);
  text-decoration: none;
  transition: all 150ms ease;
}

.navbar__link:hover {
  background: var(--gray-50);
  color: var(--gray-900);
  text-decoration: none;
}

.navbar__link--active {
  color: var(--primary-500);
  background: var(--primary-50);
}

.navbar__search {
  position: relative;
  display: flex;
  align-items: center;
  width: 280px;
  height: 40px;
  padding: 0 10px 0 12px;
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.92);
  transition: border-color 150ms ease, box-shadow 150ms ease;
}

.navbar__search:focus-within {
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px var(--primary-50);
}

.navbar__search-icon {
  flex-shrink: 0;
  color: var(--gray-400);
}

.navbar__search-input {
  flex: 1;
  min-width: 0;
  height: 100%;
  border: none;
  outline: none;
  background: transparent;
  padding: 0 8px;
}

.navbar__search-clear {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  color: var(--gray-400);
}

.navbar__search-clear:hover {
  background: var(--gray-100);
  color: var(--gray-700);
}

.navbar__suggest {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  padding: 10px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--gray-100);
  background: #fff;
  box-shadow: var(--shadow-lg);
}

.navbar__suggest-title {
  margin-bottom: 8px;
  font-size: 12px;
  font-weight: 600;
  color: var(--gray-500);
}

.navbar__suggest-state {
  padding: 10px 8px;
  color: var(--gray-500);
  font-size: 13px;
}

.navbar__suggest-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 8px;
  border-radius: var(--radius-sm);
  color: var(--gray-700);
  text-align: left;
}

.navbar__suggest-item:hover,
.navbar__suggest-item--active {
  background: var(--gray-50);
}

.navbar__right {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.navbar__login-btn {
  display: inline-flex;
  align-items: center;
  height: 36px;
  padding: 0 20px;
  border-radius: var(--radius-full);
  background: var(--primary-500);
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: all 150ms ease;
}

.navbar__login-btn:hover {
  background: var(--primary-600);
  text-decoration: none;
  color: #fff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(10, 110, 189, 0.25);
}

.navbar__user {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px 4px 4px;
  border-radius: var(--radius-full);
  cursor: pointer;
  position: relative;
  transition: background 150ms ease;
}

.navbar__user:hover {
  background: var(--gray-50);
}

.navbar__avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--gray-100);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gray-500);
}

.navbar__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.navbar__username {
  font-size: 14px;
  font-weight: 500;
  color: var(--gray-700);
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.navbar__caret {
  color: var(--gray-400);
  transition: transform 200ms ease;
}

.navbar__caret--open {
  transform: rotate(180deg);
}

.navbar__dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 160px;
  padding: 4px;
  border-radius: var(--radius-md);
  border: 1px solid var(--gray-100);
  background: #fff;
  box-shadow: var(--shadow-lg);
  z-index: 200;
}

.navbar__dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  background: none;
  color: var(--gray-700);
  text-align: left;
  font-size: 14px;
  text-decoration: none;
  transition: background 120ms ease;
}

.navbar__dropdown-item:hover {
  background: var(--gray-50);
  text-decoration: none;
}

.navbar__dropdown-item--danger {
  color: var(--error);
}

.navbar__dropdown-item--danger:hover {
  background: var(--error-bg);
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

@media (max-width: 900px) {
  .navbar__inner {
    gap: 12px;
  }

  .navbar__search {
    width: 220px;
  }
}

@media (max-width: 767px) {
  .navbar__inner {
    padding: 0 16px;
    gap: 12px;
  }

  .navbar__nav {
    gap: 0;
    flex: 0;
  }

  .navbar__link span,
  .navbar__username,
  .navbar__logo-text {
    display: none;
  }

  .navbar__link {
    padding: 8px 10px;
  }

  .navbar__search {
    width: 1px;
    min-width: 120px;
    flex: 1;
  }
}
</style>
