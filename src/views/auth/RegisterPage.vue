<template>
  <AuthLayout>
    <!-- 标题 -->
    <h1 class="auth-title">加入学知岛</h1>
    <p class="auth-subtitle">完成注册，开始分享知识</p>

    <!-- 错误 / 成功 Banner -->
    <AlertBanner :visible="!!errorMsg" type="error" @close="errorMsg = ''">
      <span v-html="errorMsg"></span>
    </AlertBanner>
    <AlertBanner :visible="!!successMsg" type="success" :closable="false">
      {{ successMsg }}
    </AlertBanner>

    <form class="auth-form" @submit.prevent="handleRegister">
      <!-- 手机号 -->
      <FormInput
        v-model="phone"
        type="tel"
        placeholder="请输入手机号"
        :error-msg="phoneError"
        :disabled="isSubmitting"
        @blur="validatePhone"
      >
        <template #leftIcon>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
          </svg>
        </template>
      </FormInput>

      <!-- 验证码 -->
      <div class="form-gap">
        <CodeInput
          v-model="code"
          :btn-disabled="!isPhoneValid"
          :is-counting="countdown.isCounting.value"
          :remaining="countdown.remaining.value"
          :is-sending="isSendingCode"
          :disabled="isSubmitting"
          @send="handleSendCode"
        />
      </div>

      <!-- 密码 -->
      <div class="form-gap">
        <FormInput
          v-model="password"
          type="password"
          placeholder="请设置不少于 8 位的密码"
          :show-toggle="true"
          :error-msg="passwordError"
          :hint="!passwordError ? '密码需不少于 8 位，建议包含字母与数字' : ''"
          :disabled="isSubmitting"
          @blur="validatePassword"
        >
          <template #leftIcon>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </template>
        </FormInput>
      </div>

      <!-- 服务条款 -->
      <div class="form-gap">
        <label class="agreement" :class="{ 'agreement--shake': agreementShake }">
          <div
            class="agreement__checkbox"
            :class="{ 'agreement__checkbox--checked': agreed }"
            @click.prevent="agreed = !agreed; agreementError = ''"
          >
            <svg v-if="agreed" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <span class="agreement__text">
            我已阅读并同意
            <span class="agreement__link" @click.stop="openModal('terms')">《用户协议》</span>
            和
            <span class="agreement__link" @click.stop="openModal('privacy')">《隐私政策》</span>
          </span>
        </label>
        <p v-if="agreementError" class="agreement__error">{{ agreementError }}</p>
      </div>

      <!-- 注册按钮 -->
      <div class="form-gap-lg">
        <PrimaryButton
          text="立即注册"
          loading-text="注册中…"
          :loading="isSubmitting"
          :disabled="!canSubmit"
          @click="handleRegister"
        />
      </div>
    </form>

    <!-- 底部链接 -->
    <div class="auth-links">
      <p class="auth-links__item">
        已有账号？
        <RouterLink :to="loginLink" class="auth-link">返回登录</RouterLink>
      </p>
    </div>

    <!-- 协议弹窗 -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="modalType" class="modal-overlay" @click.self="closeModal">
        <div class="modal-card">
          <!-- 标题栏 -->
          <div class="modal-header">
            <h2 class="modal-title">{{ modalType === 'terms' ? '用户协议' : '隐私政策' }}</h2>
            <button class="modal-close" @click="closeModal" aria-label="关闭">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <!-- 内容区 -->
          <div ref="scrollRef" class="modal-body" @scroll="checkScrollBottom">
            <!-- 用户协议 -->
            <div v-if="modalType === 'terms'" class="modal-content">
              <p class="modal-meta">更新日期：2026 年 3 月 30 日 &nbsp;|&nbsp; 生效日期：2026 年 4 月 1 日</p>

              <h3>一、服务说明</h3>
              <p>欢迎使用学知岛平台（以下简称"本平台"）。本平台由学知岛团队开发和运营，致力于为大学生及青年知识工作者提供轻量化的知识分享与学习社区服务。在您注册、登录或使用本平台之前，请务必仔细阅读并充分理解本协议的全部内容。如果您不同意本协议中的任何条款，请勿注册或使用本平台提供的任何服务。</p>
              <p>本平台通过互联网向用户提供知识内容发布、知文浏览、AI 智能问答、社交互动（关注、点赞、收藏）等服务。我们将持续优化产品功能，为用户提供更好的使用体验。</p>

              <h3>二、账号管理</h3>
              <p>2.1 用户需通过手机号码注册账号，每个手机号仅能注册一个账号。注册时需设置不少于 8 位的登录密码，建议包含字母与数字的组合以提高安全性。</p>
              <p>2.2 用户应妥善保管自己的账号和密码信息，因保管不善导致的账号被盗用、信息泄露等后果由用户自行承担。如果发现账号存在异常登录或被盗情况，请立即联系本平台客服进行处理。</p>
              <p>2.3 用户账号的所有权归本平台所有，用户仅享有使用权。禁止通过任何方式赠与、借用、租用、转让或出售账号，也不得盗用他人的账号。</p>
              <p>2.4 本平台有权在以下情况下对用户账号进行限制或注销：违反本协议约定；长期未使用且无任何内容产出；通过非正常手段注册的批量账号；存在安全风险的账号。</p>

              <h3>三、用户行为规范</h3>
              <p>3.1 用户在本平台发布的内容应当遵守中华人民共和国相关法律法规，不得发布任何违法违规、色情低俗、暴力恐怖、侵犯他人权益、散布虚假信息或恶意营销推广的内容。</p>
              <p>3.2 用户不得利用本平台实施以下行为：干扰平台的正常运行和其他用户的正常使用；使用自动化程序、脚本等方式批量操作；伪造身份信息或冒充他人；传播恶意软件或实施网络攻击。</p>
              <p>3.3 用户在使用 AI 问答功能时，不得故意输入违法违规、有害的提示词来引导 AI 生成不当内容。AI 生成的回答仅供参考，用户不应将其视为专业的法律、医学或投资建议。</p>
              <p>3.4 本平台对违反上述规范的用户，保留警告、限制功能、删除内容或封禁账号的权利，情节严重的将依法追究法律责任。</p>

              <h3>四、知识产权</h3>
              <p>4.1 用户在本平台发布的原创知文内容，其知识产权归用户本人所有。但用户授予本平台在全球范围内免费的、非独占的、可转许可的使用权，包括但不限于存储、展示、传播等，用于平台的正常运营和推广。</p>
              <p>4.2 用户保证发布的内容不侵犯任何第三方的知识产权。若因侵权行为引发纠纷，由发布内容的用户自行承担全部法律责任，本平台有权下架相关内容。</p>
              <p>4.3 未经本平台书面许可，任何人不得以任何方式复制、转载、抓取本平台的界面设计、软件代码、数据等内容。</p>

              <h3>五、免责声明</h3>
              <p>5.1 本平台不对用户发布内容的真实性、准确性和完整性做出任何保证或承诺。用户在使用平台内容时应自行判断，因使用平台内容而产生的任何损失由用户自行承担。</p>
              <p>5.2 因不可抗力因素（包括但不限于自然灾害、政策法规变化、网络基础设施故障等）导致服务中断或数据丢失的，本平台不承担相应责任。</p>
              <p>5.3 本平台可能包含指向第三方网站或服务的链接，这些链接仅为方便用户提供，本平台对第三方网站的内容和安全性不承担任何责任。</p>

              <h3>六、协议变更</h3>
              <p>本平台有权根据业务发展的需要修改本协议内容。修改后的协议将在平台上公布，并在公布后七日生效。用户如继续使用本平台服务，即视为接受变更后的协议。如用户不同意变更内容，可以选择注销账号并停止使用本平台的服务。如有任何疑问，请通过平台内的"帮助与反馈"功能与我们联系。</p>
            </div>

            <!-- 隐私政策 -->
            <div v-if="modalType === 'privacy'" class="modal-content">
              <p class="modal-meta">更新日期：2026 年 3 月 30 日 &nbsp;|&nbsp; 生效日期：2026 年 4 月 1 日</p>

              <h3>一、我们收集的信息</h3>
              <p>为了向您提供服务，本平台需要收集以下信息：</p>
              <p><strong>1.1 注册信息：</strong>手机号码（用于账号注册与身份验证）、登录密码（加密存储）、用户昵称（默认为"新用户"，可修改）。</p>
              <p><strong>1.2 个人资料信息：</strong>您自愿填写的头像、个人简介、性别等资料。这些信息将展示在您的个人主页上，帮助其他用户了解您。</p>
              <p><strong>1.3 使用信息：</strong>您浏览、发布、点赞、收藏、关注等行为数据；AI 问答的对话内容（用于优化回答质量）；设备信息（操作系统、浏览器类型等）；IP 地址和访问时间。</p>
              <p><strong>1.4 内容信息：</strong>您发布的知文文本和图片内容（图片通过对象存储服务保存）。</p>

              <h3>二、信息使用方式</h3>
              <p>我们收集的信息将用于以下目的：</p>
              <p>2.1 为您提供核心产品功能，包括账号注册与登录、知文发布与浏览、AI 问答、社交互动等基础服务。</p>
              <p>2.2 根据您的浏览历史和兴趣偏好为您推荐可能感兴趣的知文内容，以提升您的学习体验和内容发现效率。</p>
              <p>2.3 进行平台安全维护，包括但不限于识别和防范恶意账号、检测异常行为、打击刷量等违规操作。</p>
              <p>2.4 进行数据统计和分析，用以改善和优化我们的产品功能和服务质量。这些分析均基于匿名化处理的数据进行。</p>
              <p>2.5 向您发送重要的服务通知，例如系统维护公告、安全风险提示、功能更新提醒等。</p>

              <h3>三、信息共享</h3>
              <p>3.1 本平台不会将您的个人信息出售给任何第三方。</p>
              <p>3.2 在以下情形下，我们可能会与第三方共享您的信息：获得您明确同意的情况下；为遵守法律法规、响应政府部门的合法要求；为维护本平台及其用户的合法权益所必需的情况。</p>
              <p>3.3 我们可能使用第三方服务提供商来协助运营（如云存储、短信服务等）。这些服务提供商只能在为我们提供服务的范围内接触到相关数据，并且必须遵守严格的数据保护义务。</p>

              <h3>四、信息安全措施</h3>
              <p>4.1 我们采用行业标准的安全技术措施来保护您的个人信息，包括但不限于：使用 HTTPS 加密传输协议；对用户密码采用 BCrypt 算法进行加盐哈希存储；数据库访问的严格权限控制和定期备份；服务器部署在可靠的云服务基础设施上并配置防火墙。</p>
              <p>4.2 我们采用令牌（Token）机制进行用户身份认证，令牌具有有效期限制，并支持自动刷新和安全注销。</p>
              <p>4.3 尽管我们已采取合理的安全措施，但互联网环境并非百分之百安全。如果发生个人信息安全事件，我们将及时通知您并采取必要的补救措施。</p>

              <h3>五、用户权利</h3>
              <p>5.1 <strong>访问与修改：</strong>您有权随时通过个人资料编辑页面访问和修改您的个人信息，包括昵称、头像和个人简介等。</p>
              <p>5.2 <strong>删除内容：</strong>您有权删除自己发布的知文内容。删除操作不可逆，请谨慎操作。</p>
              <p>5.3 <strong>注销账号：</strong>您有权申请注销您的账号。注销后，我们将在合理期限内删除或匿名化处理您的个人信息，但法律法规要求保留的除外。</p>
              <p>5.4 <strong>管理授权：</strong>您可以在浏览器设置中管理 Cookie 和本地存储，但这可能影响您使用本平台某些功能的体验。</p>

              <h3>六、未成年人保护</h3>
              <p>本平台的主要服务面向 18 周岁及以上的用户。如果您是未满 18 周岁的未成年人，请在监护人的陪同和指导下阅读本政策并使用本平台服务。我们不会在明知的情况下收集未满 14 周岁儿童的个人信息。</p>

              <h3>七、联系我们</h3>
              <p>如果您对本隐私政策有任何疑问、意见或建议，或者需要行使上述任何权利，您可以通过以下方式与我们联系：</p>
              <p>通过平台内的"帮助与反馈"功能提交您的问题或请求。我们将在收到您的反馈后 15 个工作日内予以回复和处理。</p>

              <h3>八、政策更新</h3>
              <p>我们可能会根据法律法规的变化或业务发展的需要，适时修订本隐私政策。更新后的隐私政策将在本平台上发布并注明更新日期。重大变更将以弹窗或站内信的形式通知您。请您定期查阅本政策的最新版本，以了解我们对个人信息保护的最新承诺。</p>
            </div>
          </div>

          <!-- 底部操作区 -->
          <div class="modal-footer">
            <button
              class="modal-confirm-btn"
              :class="{ 'modal-confirm-btn--disabled': !canConfirm }"
              :disabled="!canConfirm"
              @click="confirmRead"
            >
              {{ canConfirm ? '我已阅读完毕' : '请滑动阅读全部内容' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
  </AuthLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import AuthLayout from '../../components/auth/AuthLayout.vue'
import FormInput from '../../components/auth/FormInput.vue'
import CodeInput from '../../components/auth/CodeInput.vue'
import PrimaryButton from '../../components/auth/PrimaryButton.vue'
import AlertBanner from '../../components/auth/AlertBanner.vue'
import { useAuthStore } from '../../stores/auth'
import { useCountdown } from '../../composables/useCountdown'
import { useToast } from '../../composables/useToast'
import * as authService from '../../services/authService'
import type { ApiError } from '../../types/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const countdown = useCountdown(60)
const toast = useToast()

/* ---------- 表单状态 ---------- */
const phone = ref('')
const code = ref('')
const password = ref('')
const agreed = ref(false)
const phoneError = ref('')
const passwordError = ref('')
const agreementError = ref('')
const errorMsg = ref('')
const successMsg = ref('')
const isSendingCode = ref(false)
const isSubmitting = ref(false)
const agreementShake = ref(false)

/* ---------- 协议弹窗 ---------- */
const modalType = ref<'terms' | 'privacy' | null>(null)
const canConfirm = ref(false)
const scrollRef = ref<HTMLDivElement | null>(null)

function openModal(type: 'terms' | 'privacy') {
  modalType.value = type
  canConfirm.value = false
  nextTick(() => checkScrollBottom())
}

function closeModal() {
  modalType.value = null
}

function checkScrollBottom() {
  if (!scrollRef.value) return
  const { scrollTop, clientHeight, scrollHeight } = scrollRef.value
  canConfirm.value = scrollTop + clientHeight >= scrollHeight - 4
}

function confirmRead() {
  agreed.value = true
  agreementError.value = ''
  closeModal()
}

/* ---------- 校验 ---------- */
const PHONE_REG = /^1[3-9]\d{9}$/
const isPhoneValid = computed(() => PHONE_REG.test(phone.value))
const canSubmit = computed(() =>
  isPhoneValid.value && code.value.length >= 1 && password.value.length >= 8 && agreed.value,
)

function validatePhone() {
  phoneError.value = phone.value && !isPhoneValid.value ? '请输入正确的手机号' : ''
}

function validatePassword() {
  passwordError.value = password.value && password.value.length < 8 ? '密码长度不足 8 位' : ''
}

/* ---------- 跳转链接 ---------- */
const redirect = computed(() => (route.query.redirect as string) || '/')
const loginLink = computed(() => {
  const r = route.query.redirect
  return r ? `/login?redirect=${encodeURIComponent(r as string)}` : '/login'
})

onMounted(() => {
  if (authStore.isLoggedIn) {
    router.replace(redirect.value)
  }
})

/* ---------- 发送验证码 ---------- */
async function handleSendCode() {
  validatePhone()
  if (!isPhoneValid.value) return

  isSendingCode.value = true
  try {
    await authService.sendCode({
      scene: 'REGISTER',
      identifierType: 'PHONE',
      identifier: phone.value,
    })
    toast.success('验证码已发送')
    countdown.start()
  } catch (err) {
    const apiErr = err as ApiError
    toast.error(apiErr.message || '发送失败，请稍后重试')
  } finally {
    isSendingCode.value = false
  }
}

/* ---------- 提交注册 ---------- */
async function handleRegister() {
  if (isSubmitting.value) return

  // 最终校验
  validatePhone()
  validatePassword()

  if (!agreed.value) {
    agreementError.value = '请先同意服务条款'
    agreementShake.value = true
    setTimeout(() => { agreementShake.value = false }, 600)
    return
  }

  if (!canSubmit.value) return

  errorMsg.value = ''
  successMsg.value = ''
  isSubmitting.value = true

  try {
    await authService.register({
      identifierType: 'PHONE',
      identifier: phone.value,
      code: code.value,
      password: password.value,
      nickname: '新用户',
    })

    // 注册成功后自动登录
    const { data: loginData } = await authService.login({
      identifierType: 'PHONE',
      identifier: phone.value,
      code: code.value,
    })

    authStore.setTokens(loginData.accessToken, loginData.refreshToken)
    await authStore.fetchUser()

    successMsg.value = '注册成功，已自动登录'

    setTimeout(() => {
      router.replace(redirect.value)
    }, 500)
  } catch (err) {
    const apiErr = err as ApiError
    if (apiErr.message?.includes('已注册')) {
      errorMsg.value = `该手机号已注册，<a href="/login" style="color:var(--primary-500);text-decoration:underline">前往登录</a>`
    } else {
      errorMsg.value = apiErr.message || '验证码错误或已过期'
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.auth-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: 8px;
}

.auth-subtitle {
  font-size: 15px;
  color: var(--gray-500);
  margin-bottom: 36px;
}

.auth-form {
  width: 100%;
}

.form-gap {
  margin-top: 20px;
}

.form-gap-lg {
  margin-top: 32px;
}

/* ===== Agreement ===== */
.agreement {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
  user-select: none;
}

.agreement__checkbox {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  border: 1.5px solid var(--gray-200);
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
  transition: all 150ms ease;
}

.agreement__checkbox--checked {
  background: var(--primary-500);
  border-color: var(--primary-500);
}

.agreement__text {
  font-size: 13px;
  color: var(--gray-700);
  line-height: 1.5;
}

.agreement__link {
  color: var(--primary-500);
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
}

.agreement__link:hover {
  text-decoration: underline;
}

.agreement__error {
  font-size: 12px;
  color: var(--error);
  margin-top: 6px;
  margin-left: 28px;
}

.agreement--shake {
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-4px); }
  40%, 80% { transform: translateX(4px); }
}

/* ===== Links ===== */
.auth-links {
  margin-top: 28px;
  text-align: center;
}

.auth-links__item {
  font-size: 14px;
  color: var(--gray-500);
}

.auth-link {
  color: var(--primary-500);
  font-weight: 500;
  text-decoration: none;
}

.auth-link:hover {
  color: var(--primary-600);
  text-decoration: underline;
}

/* ===== Modal ===== */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  padding: 24px;
}

.modal-card {
  width: 560px;
  max-width: 100%;
  max-height: 70vh;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid var(--gray-100, #F1F3F5);
  flex-shrink: 0;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--gray-900, #212529);
  margin: 0;
}

.modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--gray-500, #868E96);
  cursor: pointer;
  transition: all 150ms ease;
}

.modal-close:hover {
  background: var(--gray-100, #F1F3F5);
  color: var(--gray-700, #495057);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
  overscroll-behavior: contain;
}

.modal-body::-webkit-scrollbar {
  width: 6px;
}

.modal-body::-webkit-scrollbar-track {
  background: transparent;
}

.modal-body::-webkit-scrollbar-thumb {
  background: var(--gray-200, #E9ECEF);
  border-radius: 3px;
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background: var(--gray-500, #868E96);
}

.modal-content h3 {
  font-size: 15px;
  font-weight: 600;
  color: var(--gray-800, #343A40);
  margin: 20px 0 8px;
}

.modal-content h3:first-of-type {
  margin-top: 8px;
}

.modal-content p {
  font-size: 13.5px;
  line-height: 1.75;
  color: var(--gray-700, #495057);
  margin: 0 0 8px;
}

.modal-meta {
  font-size: 12px !important;
  color: var(--gray-500, #868E96) !important;
  margin-bottom: 16px !important;
  padding-bottom: 12px;
  border-bottom: 1px dashed var(--gray-200, #E9ECEF);
}

.modal-footer {
  padding: 16px 24px 20px;
  border-top: 1px solid var(--gray-100, #F1F3F5);
  flex-shrink: 0;
}

.modal-confirm-btn {
  display: block;
  width: 100%;
  height: 44px;
  border: none;
  border-radius: 999px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 200ms ease;
  background: var(--primary-500, #0A6EBD);
  color: #fff;
}

.modal-confirm-btn:hover:not(:disabled) {
  background: var(--primary-600, #085A9A);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(10, 110, 189, 0.3);
}

.modal-confirm-btn--disabled {
  background: var(--gray-200, #E9ECEF);
  color: var(--gray-500, #868E96);
  cursor: not-allowed;
}

/* ===== Modal Transition ===== */
.modal-fade-enter-active {
  transition: opacity 200ms ease;
}

.modal-fade-enter-active .modal-card {
  transition: transform 200ms ease, opacity 200ms ease;
}

.modal-fade-leave-active {
  transition: opacity 150ms ease;
}

.modal-fade-leave-active .modal-card {
  transition: transform 150ms ease, opacity 150ms ease;
}

.modal-fade-enter-from {
  opacity: 0;
}

.modal-fade-enter-from .modal-card {
  transform: scale(0.95);
  opacity: 0;
}

.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-leave-to .modal-card {
  transform: scale(0.95);
  opacity: 0;
}
</style>
