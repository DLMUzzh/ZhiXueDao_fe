<template>
  <article class="card" @click="goDetail">
    <span v-if="post.isTop" class="card__pin">置顶</span>

    <div class="card__cover">
      <img
        v-if="post.coverImage"
        :src="post.coverImage"
        :alt="post.title"
        class="card__cover-img"
        loading="lazy"
      />
      <div v-else class="card__cover-placeholder">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" opacity="0.35">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
        </svg>
      </div>
    </div>

    <div class="card__body">
      <h3 v-if="titleHtml" class="card__title" v-html="titleHtml"></h3>
      <h3 v-else class="card__title">{{ post.title }}</h3>
      <p v-if="descriptionHtml" class="card__desc" v-html="descriptionHtml"></p>
      <p v-else-if="post.description" class="card__desc">{{ post.description }}</p>

      <div v-if="displayTags.length" class="card__tags">
        <span v-for="tag in displayTags" :key="tag" class="card__tag">{{ tag }}</span>
      </div>

      <div class="card__divider"></div>

      <div class="card__footer">
        <div class="card__author" @click.stop="goAuthor">
          <div class="card__author-avatar">
            <img v-if="post.authorAvatar" :src="post.authorAvatar" :alt="post.authorNickname" />
            <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <span class="card__author-name">{{ post.authorNickname }}</span>
        </div>

        <div class="card__actions">
          <button
            class="card__action-btn"
            :class="{ 'card__action-btn--active-like': post.liked }"
            @click.stop="$emit('like', post.id)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" :fill="post.liked ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <span>{{ formatCount(post.likeCount) }}</span>
          </button>

          <button
            class="card__action-btn"
            :class="{ 'card__action-btn--active-fav': post.faved }"
            @click.stop="$emit('fav', post.id)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" :fill="post.faved ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            <span>{{ formatCount(post.favoriteCount) }}</span>
          </button>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { FeedItem } from '../../types/knowpost'
import { formatCount } from '../../utils/format'
import { sanitizeHighlightHtml } from '../../utils/markdown'

const props = defineProps<{ post: FeedItem }>()

defineEmits<{
  like: [id: string]
  fav: [id: string]
}>()

const router = useRouter()

const displayTags = computed(() => props.post.tags.slice(0, 3))
const titleHtml = computed(() => (props.post.titleHtml ? sanitizeHighlightHtml(props.post.titleHtml) : ''))
const descriptionHtml = computed(() =>
  props.post.descriptionHtml ? sanitizeHighlightHtml(props.post.descriptionHtml) : '',
)

function goDetail() {
  router.push(`/post/${props.post.id}`)
}

function goAuthor() {
  // Feed 接口当前未返回 authorId，这里保留未来扩展位。
}
</script>

<style scoped>
.card {
  position: relative;
  background: #fff;
  border: 1px solid var(--gray-100);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xs);
  overflow: hidden;
  cursor: pointer;
  transition: transform 200ms ease, box-shadow 200ms ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.card__pin {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 2;
  padding: 2px 10px;
  border-radius: var(--radius-full);
  background: var(--accent-500);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.card__cover {
  width: 100%;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  background: var(--primary-50);
}

.card__cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 300ms ease;
}

.card:hover .card__cover-img {
  transform: scale(1.03);
}

.card__cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-500);
}

.card__body {
  padding: 16px;
}

.card__title {
  font-size: 16px;
  font-weight: 600;
  color: var(--gray-800);
  line-height: 1.45;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card__desc {
  margin-top: 6px;
  font-size: 13px;
  color: var(--gray-500);
  line-height: 1.55;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}

.card__tag {
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  background: var(--gray-100);
  color: var(--gray-700);
  font-size: 12px;
  line-height: 1.6;
}

.card__divider {
  height: 1px;
  background: var(--gray-100);
  margin: 12px 0;
}

.card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card__author {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.card__author-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--gray-100);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gray-400);
  flex-shrink: 0;
}

.card__author-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card__author-name {
  font-size: 13px;
  color: var(--gray-700);
  font-weight: 500;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card__actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.card__action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  color: var(--gray-500);
  background: none;
  border: none;
  cursor: pointer;
  transition: all 150ms ease;
  font-family: inherit;
}

.card__action-btn:hover {
  background: var(--gray-50);
}

.card__action-btn--active-like {
  color: #fa5252;
}

.card__action-btn--active-fav {
  color: #fcc419;
}

:deep(em) {
  color: var(--primary-600);
  background: var(--primary-50);
  font-style: normal;
  font-weight: 600;
  border-radius: 4px;
  padding: 0 2px;
}
</style>
