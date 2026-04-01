<template>
  <div class="auth-layout">
    <!-- 左侧品牌区 -->
    <aside class="auth-layout__brand">
      <div class="brand-content">
        <!-- Logo -->
        <div class="brand-logo">
          <div class="brand-logo__icon">
            <svg width="42" height="42" viewBox="0 0 42 42" fill="none">
              <circle cx="21" cy="21" r="20" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
              <path d="M21 8C14.4 8 9 13.4 9 20c0 4.2 2.2 7.9 5.5 10l1-2.5C13 25.7 11.5 23 11.5 20c0-5.2 4.3-9.5 9.5-9.5s9.5 4.3 9.5 9.5c0 3-1.5 5.7-3.8 7.5l1 2.5c3.3-2.1 5.3-5.8 5.3-10C33 13.4 27.6 8 21 8z" fill="white"/>
              <circle cx="21" cy="20" r="4" fill="white"/>
              <path d="M21 26l-3 8h6l-3-8z" fill="rgba(255,255,255,0.9)"/>
            </svg>
          </div>
          <span class="brand-logo__text">学知岛</span>
        </div>

        <!-- 口号 -->
        <p class="brand-slogan">"以岛为岸，以知为光"</p>

        <!-- 特色图标 -->
        <div class="brand-features">
          <div class="brand-feature">
            <div class="brand-feature__icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
            </div>
            <div>
              <div class="brand-feature__title">知识沉淀</div>
              <div class="brand-feature__desc">图文并茂，Markdown 创作</div>
            </div>
          </div>
          <div class="brand-feature">
            <div class="brand-feature__icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z"/>
                <path d="M9 21h6"/><path d="M10 17v4"/><path d="M14 17v4"/>
              </svg>
            </div>
            <div>
              <div class="brand-feature__title">AI 智能问答</div>
              <div class="brand-feature__desc">基于知文内容的 RAG 对话</div>
            </div>
          </div>
          <div class="brand-feature">
            <div class="brand-feature__icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div>
              <div class="brand-feature__title">社区互动</div>
              <div class="brand-feature__desc">关注、点赞、收藏、交流</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 装饰元素 -->
      <div class="brand-decor brand-decor--1"></div>
      <div class="brand-decor brand-decor--2"></div>
      <div class="brand-decor brand-decor--3"></div>
    </aside>

    <!-- 右侧表单区 -->
    <main class="auth-layout__form">
      <!-- 移动端顶部 Logo -->
      <div class="mobile-brand">
        <div class="brand-logo brand-logo--mobile">
          <div class="brand-logo__icon brand-logo__icon--mobile">
            <svg width="32" height="32" viewBox="0 0 42 42" fill="none">
              <circle cx="21" cy="21" r="20" fill="var(--primary-50)" stroke="var(--primary-200)" stroke-width="1"/>
              <path d="M21 8C14.4 8 9 13.4 9 20c0 4.2 2.2 7.9 5.5 10l1-2.5C13 25.7 11.5 23 11.5 20c0-5.2 4.3-9.5 9.5-9.5s9.5 4.3 9.5 9.5c0 3-1.5 5.7-3.8 7.5l1 2.5c3.3-2.1 5.3-5.8 5.3-10C33 13.4 27.6 8 21 8z" fill="var(--primary-500)"/>
              <circle cx="21" cy="20" r="4" fill="var(--primary-500)"/>
              <path d="M21 26l-3 8h6l-3-8z" fill="var(--primary-400)"/>
            </svg>
          </div>
          <span class="brand-logo__text brand-logo__text--mobile">学知岛</span>
        </div>
        <p class="mobile-brand__slogan">以岛为岸，以知为光</p>
      </div>

      <div class="form-wrapper">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.auth-layout {
  display: flex;
  min-height: 100vh;
  min-height: 100dvh;
}

/* ===== 左侧品牌区 ===== */
.auth-layout__brand {
  position: relative;
  width: 45%;
  background: linear-gradient(135deg, var(--primary-500) 0%, var(--primary-700) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 48px;
}

.brand-content {
  position: relative;
  z-index: 2;
  max-width: 380px;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.brand-logo__icon {
  width: 42px;
  height: 42px;
  flex-shrink: 0;
}

.brand-logo__text {
  font-size: 28px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 2px;
}

.brand-slogan {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 48px;
  font-style: italic;
  letter-spacing: 1px;
}

/* 特色列表 */
.brand-features {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.brand-feature {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.brand-feature__icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
  backdrop-filter: blur(4px);
}

.brand-feature__title {
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 4px;
}

.brand-feature__desc {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
}

/* 装饰圆 */
.brand-decor {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.04);
}

.brand-decor--1 {
  width: 300px;
  height: 300px;
  top: -80px;
  right: -60px;
}

.brand-decor--2 {
  width: 200px;
  height: 200px;
  bottom: -40px;
  left: -30px;
}

.brand-decor--3 {
  width: 120px;
  height: 120px;
  bottom: 30%;
  right: 10%;
  background: rgba(255, 255, 255, 0.06);
}

/* ===== 右侧表单区 ===== */
.auth-layout__form {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--gray-50);
  padding: 48px 24px;
  overflow-y: auto;
}

.form-wrapper {
  width: 100%;
  max-width: 420px;
}

/* ===== 移动端品牌 ===== */
.mobile-brand {
  display: none;
  text-align: center;
  margin-bottom: 32px;
}

.brand-logo--mobile {
  justify-content: center;
  margin-bottom: 8px;
}

.brand-logo__icon--mobile {
  width: 32px;
  height: 32px;
}

.brand-logo__text--mobile {
  font-size: 22px;
  color: var(--primary-500);
}

.mobile-brand__slogan {
  font-size: 14px;
  color: var(--gray-500);
}

/* ===== 响应式 ===== */
@media (max-width: 1023px) and (min-width: 768px) {
  .auth-layout__brand {
    width: 35%;
    padding: 32px;
  }
  .brand-features {
    display: none;
  }
}

@media (max-width: 767px) {
  .auth-layout {
    flex-direction: column;
  }
  .auth-layout__brand {
    display: none;
  }
  .mobile-brand {
    display: block;
  }
  .auth-layout__form {
    justify-content: flex-start;
    padding-top: 60px;
  }
}
</style>
