<script setup lang="ts">
import type { FormError, FormSubmitEvent } from '@nuxt/ui'
import * as z from 'zod'
import type { ResponseMessage } from '~/types/common'

definePageMeta({
  layout: false
})
useSeoMeta({
  title: 'Forgot password'
})

const { t } = useLang()
const { inputSanitizeHtml } = useBase()
const api = useApi()
const { isDark } = useTheme();
type Step = 'email' | 'code' | 'password' | 'success'
const step = ref<Step>('email')
const stepOrder: Exclude<Step, 'success'>[] = ['email', 'code', 'password']
const stepIndex = computed(() => {
  const index = stepOrder.indexOf(step.value as Exclude<Step, 'success'>)
  return index === -1 ? stepOrder.length - 1 : index
})

// ---------------------------------------------------------------- step 1

const emailSchema = z.object({
  email: z.email(t('error.emailFormat'))
})
type EmailSchema = z.output<typeof emailSchema>
const emailState = reactive<Partial<EmailSchema>>({ email: '' })

const requesting = ref(false)

const requestCode = async (email: string): Promise<boolean> => {
  try {
    await api<ResponseMessage>('/api/auth/requestVerifyCodeToResetPwd', {
      method: 'POST',
      body: { email }
    })
    return true
  } catch (error) {
    console.error('Failed to request password reset code', error)
    return false
  }
}

const onRequestCode = async (event: FormSubmitEvent<EmailSchema>) => {
  if (requesting.value) {
    return
  }
  requesting.value = true
  const ok = await requestCode(inputSanitizeHtml(event.data.email))
  requesting.value = false
  if (ok) {
    step.value = 'code'
    startResendCooldown()
  }
}

// ---------------------------------------------------------------- step 2

const codeDigits = ref<number[]>([])
const codeValue = computed(() => codeDigits.value.map(String).join(''))
const codeSchema = z.object({
  code: z.string().regex(/^\d{6}$/, t('error.numberFormat'))
})
type CodeSchema = z.output<typeof codeSchema>
const codeState = reactive<Partial<CodeSchema>>({ code: '' })
watch(codeValue, (value) => {
  codeState.code = value
})

const verifying = ref(false)

const onVerifyCode = async (event: FormSubmitEvent<CodeSchema>) => {
  if (verifying.value) {
    return
  }
  verifying.value = true
  try {
    await api<void>('/api/auth/sendVerifyCodeToResetPwd', {
      method: 'POST',
      body: { email: emailState.email, token: event.data.code }
    })
    step.value = 'password'
  } catch (error) {
    console.error('Failed to verify password reset code', error)
  } finally {
    verifying.value = false
  }
}

const resendSecondsLeft = ref(0)
let resendTimer: ReturnType<typeof setInterval> | undefined

const clearResendTimer = () => {
  if (resendTimer) {
    clearInterval(resendTimer)
    resendTimer = undefined
  }
}
const startResendCooldown = () => {
  resendSecondsLeft.value = 60
  clearResendTimer()
  resendTimer = setInterval(() => {
    resendSecondsLeft.value -= 1
    if (resendSecondsLeft.value <= 0) {
      clearResendTimer()
    }
  }, 1000)
}
const canResend = computed(() => resendSecondsLeft.value <= 0 && !requesting.value)

const onResend = async () => {
  if (!canResend.value || !emailState.email) {
    return
  }
  requesting.value = true
  const ok = await requestCode(emailState.email)
  requesting.value = false
  if (ok) {
    startResendCooldown()
  }
}

const changeEmail = () => {
  step.value = 'email'
  clearResendTimer()
  resendSecondsLeft.value = 0
  codeDigits.value = []
  codeState.code = ''
  passwordState.newPassword = ''
  passwordState.confirmPassword = ''
}

// ---------------------------------------------------------------- step 3

const passwordSchema = z.object({
  newPassword: z.string().min(8, t('error.requiredAmountCharacters', [8])),
  confirmPassword: z.string().min(1, t('error.validateRequireField'))
})
type PasswordSchema = z.output<typeof passwordSchema>
const passwordState = reactive<Partial<PasswordSchema>>({
  newPassword: '',
  confirmPassword: ''
})

const validatePasswordStep = (state: Partial<PasswordSchema>): FormError[] => {
  const errors: FormError[] = []
  if (
    state.newPassword
    && state.confirmPassword
    && state.newPassword !== state.confirmPassword
  ) {
    errors.push({
      name: 'confirmPassword',
      message: t('error.passwordNotMatchNew')
    })
  }
  return errors
}

const resetting = ref(false)

const onResetPassword = async (event: FormSubmitEvent<PasswordSchema>) => {
  if (resetting.value) {
    return
  }
  resetting.value = true
  try {
    await api<ResponseMessage>('/api/auth/resetPassword', {
      method: 'POST',
      body: {
        email: emailState.email,
        token: codeState.code,
        newPassword: event.data.newPassword
      }
    })
    passwordState.newPassword = ''
    passwordState.confirmPassword = ''
    codeState.code = ''
    codeDigits.value = []
    clearResendTimer()
    step.value = 'success'
    emailState.email = ''
  } catch (error) {
    console.error('Failed to reset password', error)
  } finally {
    resetting.value = false
  }
}

const isSubmitting = computed(() => requesting.value || verifying.value || resetting.value)

const stepAnnouncement = computed(() => {
  switch (step.value) {
    case 'email':
      return t('authen.forgotPasswordHeading')
    case 'code':
      return t('authen.verification')
    case 'password':
      return t('authen.setPassword')
    default:
      return t('authen.resetPasswordSuccessTitle')
  }
})

onBeforeUnmount(clearResendTimer)
</script>

<template>
  <div class="flex min-h-dvh items-center justify-center bg-white dark:bg-neutral-950 py-10 px-5">
    <div class="w-full max-w-100">
      <div class="mb-7 flex flex-col items-center text-center">
        <NuxtImg   :src="!isDark ? '/logo/logo-black.png' : '/logo/logo-white.png'" width="72" height="72" alt="RAG AI" />

        <h1 class="mt-4 text-2xl font-bold text-black dark:text-white">
          {{ $t('authen.forgotPasswordHeading') }}
        </h1>

        <p class="sr-only" role="status" aria-live="polite">
          {{ stepAnnouncement }}
        </p>
      </div>

      <div v-if="step !== 'success'" class="mb-6 flex items-center justify-center gap-2" aria-hidden="true">
        <template v-for="(label, idx) in stepOrder" :key="label">
          <span
            class="flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
            :class="stepIndex >= idx
              ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
              : 'bg-neutral-200 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400'"
          >
            {{ idx + 1 }}
          </span>
          <span v-if="idx < stepOrder.length - 1" class="h-px w-8 bg-neutral-200 dark:bg-neutral-800" />
        </template>
      </div>

      <!-- Step 1: email -->
      <UForm
        v-if="step === 'email'"
        :schema="emailSchema"
        :state="emailState"
        class="flex flex-col gap-3.5"
        @submit="onRequestCode"
      >
        <p class="text-center text-sm text-muted">
          {{ $t('authen.forgotPwdTitle') }}
        </p>

        <UFormField name="email">
          <UInput
            v-model="emailState.email"
            type="email"
            :placeholder="$t('base.email')"
            size="xl"
            block
            autofocus
            :disabled="requesting"
            class="w-full"
            trailing-icon="lucide:mail"
          />
        </UFormField>

        <UButton
          type="submit"
          size="xl"
          block
          :loading="requesting"
          color="neutral"
          variant="solid"
          class="bg-gray-900! text-white! font-semibold rounded-full! mt-1 dark:bg-white! dark:text-gray-900!"
        >
          {{ $t('authen.sendCode') }}
        </UButton>
      </UForm>

      <!-- Step 2: verification code -->
      <UForm
        v-else-if="step === 'code'"
        :schema="codeSchema"
        :state="codeState"
        class="flex flex-col gap-3.5"
        @submit="onVerifyCode"
      >
        <p class="text-center text-sm text-muted">
          {{ $t('authen.forgotPasswordSentGeneric') }}
        </p>

        <UFormField name="code" class="flex justify-center">
          <UPinInput
            v-model="codeDigits"
            type="number"
            :length="6"
            otp
            size="xl"
            :disabled="verifying"
            :aria-label="$t('authen.verificationCode')"
          />
        </UFormField>

        <p class="text-center text-xs text-muted">
          {{ $t('authen.login_main_helper6') }}
          {{ $t('authen.login_main_helper5') }}
        </p>

        <UButton
          type="submit"
          size="xl"
          block
          :disabled="codeValue.length !== 6"
          :loading="verifying"
          color="neutral"
          variant="solid"
          class="bg-gray-900! text-white! font-semibold rounded-full! mt-1 dark:bg-white! dark:text-gray-900!"
        >
          {{ $t('authen.verifyCode') }}
        </UButton>

        <div class="flex items-center justify-between text-sm">
          <UButton
            variant="link"
            color="neutral"
            size="sm"
            class="p-0!"
            :disabled="isSubmitting"
            @click="changeEmail"
          >
            {{ $t('authen.changeEmail') }}
          </UButton>

          <UButton
            variant="link"
            color="neutral"
            size="sm"
            class="p-0!"
            :disabled="!canResend"
            @click="onResend"
          >
            {{ canResend ? $t('authen.resendCode') : $t('authen.resendCodeIn', [resendSecondsLeft]) }}
          </UButton>
        </div>
      </UForm>

      <!-- Step 3: new password -->
      <UForm
        v-else-if="step === 'password'"
        :schema="passwordSchema"
        :state="passwordState"
        :validate="validatePasswordStep"
        class="flex flex-col gap-3.5"
        @submit="onResetPassword"
      >
        <UFormField name="newPassword">
          <BaseInputPassword
            v-model="passwordState.newPassword"
            :placeholder="$t('authen.newPassword')"
            size="xl"
          />
        </UFormField>

        <UFormField name="confirmPassword">
          <BaseInputPassword
            v-model="passwordState.confirmPassword"
            :placeholder="$t('authen.confirmPassword')"
            size="xl"
            :progress="false"
          />
        </UFormField>

        <p class="text-xs text-muted">
          {{ $t('authen.helper2') }}
        </p>

        <UButton
          type="submit"
          size="xl"
          block
          :loading="resetting"
          color="neutral"
          variant="solid"
          class="bg-gray-900! text-white! font-semibold rounded-full! mt-1 dark:bg-white! dark:text-gray-900!"
        >
          {{ $t('authen.resetPassword') }}
        </UButton>
      </UForm>

      <!-- Success -->
      <div v-else class="flex flex-col items-center gap-4 text-center">
        <Icon name="lucide:circle-check" class="size-12 text-success" />

        <h2 class="text-lg font-semibold text-black dark:text-white">
          {{ $t('authen.resetPasswordSuccessTitle') }}
        </h2>

        <UButton
          size="xl"
          block
          color="neutral"
          variant="solid"
          class="bg-gray-900! text-white! font-semibold rounded-full! dark:bg-white! dark:text-gray-900!"
          @click="navigateTo('/auth/login')"
        >
          {{ $t('authen.continueToLogin') }}
        </UButton>
      </div>

      <p v-if="step !== 'success' && !isSubmitting" class="mt-6 text-center text-sm text-muted">
        <NuxtLink to="/auth/login" class="font-medium text-black dark:text-white hover:underline">
          {{ $t('authen.backToLogin') }}
        </NuxtLink>
      </p>

      <div class="flex gap-2 justify-center py-4">
        <BaseLangugeSwitcher />
        <BaseThemeSwitcher />
      </div>
    </div>
  </div>
</template>
