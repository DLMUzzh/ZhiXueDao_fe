<template>
  <div class="skeleton-card">
    <div class="skeleton-card__cover skeleton-shimmer"></div>
    <div class="skeleton-card__body">
      <div class="skeleton-card__title skeleton-shimmer"></div>
      <div class="skeleton-card__desc skeleton-shimmer"></div>
      <div class="skeleton-card__desc skeleton-card__desc--short skeleton-shimmer"></div>
      <div class="skeleton-card__tags">
        <div class="skeleton-card__tag skeleton-shimmer"></div>
        <div class="skeleton-card__tag skeleton-card__tag--short skeleton-shimmer"></div>
      </div>
      <div class="skeleton-card__divider"></div>
      <div class="skeleton-card__footer">
        <div class="skeleton-card__avatar skeleton-shimmer"></div>
        <div class="skeleton-card__name skeleton-shimmer"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.skeleton-card {
  background: #fff;
  border: 1px solid var(--gray-100);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.skeleton-card__cover {
  width: 100%;
  aspect-ratio: 16 / 10;
}

.skeleton-card__body {
  padding: 16px;
}

.skeleton-card__title {
  height: 18px;
  width: 80%;
  border-radius: 4px;
}

.skeleton-card__desc {
  height: 14px;
  width: 100%;
  border-radius: 4px;
  margin-top: 10px;
}

.skeleton-card__desc--short {
  width: 60%;
}

.skeleton-card__tags {
  display: flex;
  gap: 6px;
  margin-top: 12px;
}

.skeleton-card__tag {
  height: 22px;
  width: 52px;
  border-radius: var(--radius-sm);
}

.skeleton-card__tag--short {
  width: 40px;
}

.skeleton-card__divider {
  height: 1px;
  background: var(--gray-100);
  margin: 12px 0;
}

.skeleton-card__footer {
  display: flex;
  align-items: center;
  gap: 8px;
}

.skeleton-card__avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
}

.skeleton-card__name {
  height: 14px;
  width: 64px;
  border-radius: 4px;
}

/* ===== Shimmer ===== */
.skeleton-shimmer {
  background: linear-gradient(
    90deg,
    var(--gray-100) 25%,
    var(--gray-50) 50%,
    var(--gray-100) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
