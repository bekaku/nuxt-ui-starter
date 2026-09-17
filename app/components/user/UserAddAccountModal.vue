<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import * as z from 'zod'

const open = defineModel<boolean>({ default: false })

const { t } = useLang()
const { linkAccount, linkingAccount } = useAuth()

const schema = z.object({
  email: z.email(t('error.emailFormat')),
  password: z.string(t('error.passwordRequired')).min(4, t('error.requiredAmountCharacters', [8]))
})
type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  email: undefined,
  password: undefined
})
const showPassword = ref(false)

const resetState = () => {
  state.email = undefined
  state.password = undefined
  showPassword.value = false
}

// linkAccount already switches the active session to the newly linked account and
// triggers the broadcast + reload — this modal just closes once that succeeds.
const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  await linkAccount({
    emailOrUsername: event.data.email,
    password: event.data.password
  })
}

watch(open, (value) => {
  if (!value) {
    resetState()
  }
})
</script>

<template>
  <BaseModal
    v-model="open"
    :title="t('authen.addProfile') || 'Add account'"
    :description="t('authen.addProfileDescription') || ''"
  >
    <UForm
      :schema="schema"
      :state="state"
      class="flex flex-col gap-3.5"
      @submit="onSubmit"
    >
      <UFormField name="email">
        <UInput
          v-model="state.email"
          type="email"
          :placeholder="t('base.email')"
          size="lg"
          :disabled="linkingAccount"
          class="w-full"
          trailing-icon="lucide:mail"
        />
      </UFormField>

      <UFormField name="password">
        <UInput
          v-model="state.password"
          :type="showPassword ? 'text' : 'password'"
          :placeholder="t('authen.password')"
          size="lg"
          :disabled="linkingAccount"
          class="w-full"
        >
          <template #trailing>
            <UButton
              color="neutral"
              variant="link"
              :icon="showPassword ? 'lucide:eye' : 'lucide:eye-closed'"
              :aria-label="showPassword ? 'Hide password' : 'Show password'"
              @click="showPassword = !showPassword"
            />
          </template>
        </UInput>
      </UFormField>

      <UButton
        type="submit"
        block
        :loading="linkingAccount"
        color="neutral"
      >
        {{ t('authen.addProfile') || 'Add account' }}
      </UButton>
    </UForm>
  </BaseModal>
</template>
