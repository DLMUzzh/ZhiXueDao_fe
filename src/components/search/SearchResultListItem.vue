<template>
  <article class="result-item" @click="goDetail">
    <div class="result-item__thumb">
      <img v-if="post.coverImage" :src="post.coverImage" :alt="post.title" loading="lazy" />
      <div v-else class="result-item__thumb-placeholder">知文</div>
    </div>

    <div class="result-item__content">
      <h3 class="result-item__title" v-html="titleHtml"></h3>
      <p class="result-item__desc" v-html="descriptionHtml"></p>

      <div v-if="post.tags.length" class="result-item__tags">
        <span v-for="tag in post.tags.slice(0, 3)" :key="tag" class="result-item__tag">
          {{ tag }}
        </span>
      </div>

      <div class="result-item__meta">
        <span class="result-item__author">{{ post.authorNickname }}</span>
        <button
          class="result-item__action"
          :class="{ 'result-item__action--like': post.liked }"
          @click.stop="$emit('like', post.id)"
          aria-label="点赞"
        >
          ♡ {{ formatCount(post.likeCount) }}
        </button>
        <button
          class="result-item__action"
          :class="{ 'result-item__action--fav': post.faved }"
          @click.stop="$emit('fav', post.id)"
          aria-label="收藏"
        >
          ☆ {{ formatCount(post.favoriteCount) }}
        </button>
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

const props = defineProps<{
  post: FeedItem
}>()

defineEmits<{
  like: [id: string]
  fav: [id: string]
}>()

const router = useRouter()

const titleHtml = computed(() => sanitizeHighlightHtml(props.post.titleHtml || props.post.title))
const descriptionHtml = computed(() =>
  sanitizeHighlightHtml(props.post.descriptionHtml || props.post.description || '暂无摘要'),
)

function goDetail() {
  router.push(`/post/${props.post.id}`)
}
</script>

<style scoped>
.result-item {
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr);
  gap: 16px;
  padding: 18px;
  border: 1px solid var(--gray-100);
  border-radius: var(--radius-lg);
  background: #fff;
  box-shadow: var(--shadow-sm);
  transition: transform 200ms ease, box-shadow 200ms ease;
  cursor: pointer;
}

.result-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.result-item__thumb {
  width: 120px;
  height: 80px;
  border-radius: var(--radius-md);
  background: var(--gray-100);
  overflow: hidden;
}

.result-item__thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.result-item__thumb-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--gray-400);
  font-size: 12px;
  font-weight: 600;
}

.result-item__content {
  min-width: 0;
}

.result-item__title {
  font-size: 18px;
  font-weight: 600;
  color: var(--gray-900);
  line-height: 1.45;
}

.result-item__desc {
  margin-top: 8px;
  color: var(--gray-500);
  font-size: 14px;
  line-height: 1.7;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.result-item__tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 12px;
}

.result-item__tag {
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  background: var(--gray-100);
  color: var(--gray-700);
  font-size: 12px;
}

.result-item__meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 14px;
  color: var(--gray-500);
}

.result-item__author {
  margin-right: auto;
  font-size: 13px;
}

.result-item__action {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 8px;
  border-radius: var(--radius-sm);
  color: var(--gray-500);
  transition: background 150ms ease, color 150ms ease;
}

.result-item__action:hover {
  background: var(--gray-50);
}

.result-item__action--like {
  color: #fa5252;
}

.result-item__action--fav {
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

@media (max-width: 767px) {
  .result-item {
    grid-template-columns: 96px minmax(0, 1fr);
    gap: 12px;
    padding: 14px;
  }

  .result-item__thumb {
    width: 96px;
    height: 72px;
  }

  .result-item__title {
    font-size: 16px;
  }

  .result-item__meta {
    flex-wrap: wrap;
  }
}
</style>
