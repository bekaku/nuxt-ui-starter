<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { LinkedAccount } from '~/types/models'

const { showName = true } = defineProps<{
  collapsed?: boolean
  showName?: boolean
  dropdownUi?: DropdownMenuItem['ui']
}>()

const colorMode = useColorMode()
const appConfig = useAppConfig()

const colors = [
  'red',
  'orange',
  'amber',
  'yellow',
  'lime',
  'green',
  'emerald',
  'teal',
  'cyan',
  'sky',
  'blue',
  'indigo',
  'violet',
  'purple',
  'fuchsia',
  'pink',
  'rose'
]
const neutrals = [
  'slate',
  'gray',
  'zinc',
  'neutral',
  'stone',
  'taupe',
  'mauve',
  'mist',
  'olive'
]
const _safelistColors = [
  ...colors.map(c => `var(--color-${c}-500) var(--color-${c}-400)`),
  ...neutrals.map(n => `var(--color-${n}-500) var(--color-${n}-400)`)
]
const { t, locale, onSwitchLocale } = useLang()
const {
  signout,
  loginedAvatar,
  loginedDisplay,
  linkedAccounts,
  linkedAccountsLoading,
  switchingAccountId,
  removingAccountId,
  fetchLinkedAccounts,
  onSwithUser,
  removeLinkedAccount
} = useAuth()
const confirm = useConfirmDialog()
const user = ref({
  name: loginedDisplay,
  avatar: {
    src: loginedAvatar,
    alt: loginedDisplay,
    size: 'md'
  }
})

const isMenuOpen = ref(false)
const showAddAccountModal = ref(false)

// Fetch the linked-accounts list lazily on first dropdown open (client-only) rather
// than on every layout render or during SSR — see frontend/tasks/009.
watch(isMenuOpen, (open) => {
  if (open) {
    fetchLinkedAccounts()
  }
})

const accountDisplayName = (account: LinkedAccount): string => account.email || account.username || ''

const onSelectAccount = (account: LinkedAccount) => (e: Event) => {
  e.preventDefault()
  if (account.currentUser) {
    return
  }
  onSwithUser(account.id)
}

const onRemoveAccount = (account: LinkedAccount) => async (e: Event) => {
  e.preventDefault()
  const conf = await confirm({
    title: t('app.monogram'),
    description: t('authen.removeProfileConfirmDescription', { name: accountDisplayName(account) })
  })
  if (conf) {
    await removeLinkedAccount(account.id, !!account.currentUser)
  }
}

const accountItems = computed<DropdownMenuItem[]>(() => {
  if (linkedAccountsLoading.value && !linkedAccounts.value.length) {
    return [
      {
        type: 'label',
        label: t('authen.allProfiles') || 'Accounts'
      },
      {
        label: t('base.pleaseWaitWhileLoading') || 'Loading...',
        loading: true,
        disabled: true
      }
    ]
  }

  const rows: DropdownMenuItem[] = [
    {
      type: 'label',
      label: t('authen.allProfiles') || 'Accounts'
    }
  ]

  for (const account of linkedAccounts.value) {
    rows.push({
      label: accountDisplayName(account),
      avatar: {
        src: account.avatar?.thumbnail || account.avatar?.image || '/images/user.png',
        alt: accountDisplayName(account),
        size: 'sm'
      } as any,
      type: 'checkbox',
      checked: account.currentUser,
      disabled: account.currentUser || switchingAccountId.value === account.id,
      loading: switchingAccountId.value === account.id,
      onSelect: onSelectAccount(account)
    })
  }

  rows.push({
    label: t('authen.addProfile') || 'Add account',
    icon: 'i-lucide-user-plus',
    onSelect: (e: Event) => {
      e.preventDefault()
      showAddAccountModal.value = true
    }
  })

  if (linkedAccounts.value.length > 1) {
    rows.push({
      label: t('authen.removeProfile') || 'Remove an account',
      icon: 'i-lucide-user-minus',
      color: 'error',
      children: linkedAccounts.value.map(account => ({
        label: accountDisplayName(account),
        avatar: {
          src: account.avatar?.thumbnail || account.avatar?.image || '/images/user.png',
          alt: accountDisplayName(account),
          size: 'sm'
        } as any,
        disabled: removingAccountId.value === account.id,
        loading: removingAccountId.value === account.id,
        onSelect: onRemoveAccount(account)
      }))
    })
  }

  return rows
})

const items = computed<DropdownMenuItem[][]>(() => [
  [
    {
      type: 'label',
      label: user.value.name || '',
      avatar: user.value.avatar as any
    }
  ],
  accountItems.value,
  [
    {
      label: 'Profile',
      icon: 'i-lucide-user'
    },
    {
      label: 'Billing',
      icon: 'i-lucide-credit-card'
    },
    {
      label: t('base.setting') || 'Settings',
      icon: 'i-lucide-settings',
      to: '/settings'
    }
  ],
  [
    {
      label: 'Theme',
      icon: 'i-lucide-palette',
      children: [
        {
          label: 'Primary',
          slot: 'chip',
          chip: appConfig.ui.colors.primary,
          content: {
            align: 'center',
            collisionPadding: 16
          },
          children: colors.map(color => ({
            label: color,
            chip: color,
            slot: 'chip',
            checked: appConfig.ui.colors.primary === color,
            type: 'checkbox',
            onSelect: (e) => {
              e.preventDefault()

              appConfig.ui.colors.primary = color
            }
          }))
        },
        {
          label: 'Neutral',
          slot: 'chip',
          chip:
            appConfig.ui.colors.neutral === 'neutral'
              ? 'old-neutral'
              : appConfig.ui.colors.neutral,
          content: {
            align: 'end',
            collisionPadding: 16
          },
          children: neutrals.map(color => ({
            label: color,
            chip: color === 'neutral' ? 'old-neutral' : color,
            slot: 'chip',
            type: 'checkbox',
            checked: appConfig.ui.colors.neutral === color,
            onSelect: (e) => {
              e.preventDefault()

              appConfig.ui.colors.neutral = color
            }
          }))
        }
      ]
    }
  ],
  [
    {
      label: t('base.themeSetting') || 'Apperance',
      icon: 'i-lucide-sun-moon',
      children: [
        {
          label: t('theme.light') || 'Light',
          icon: 'i-lucide-sun',
          type: 'checkbox',
          checked: colorMode.value === 'light',
          onSelect(e: Event) {
            e.preventDefault()

            colorMode.preference = 'light'
          }
        },
        {
          label: t('theme.dark') || 'Dark',
          icon: 'i-lucide-moon',
          type: 'checkbox',
          checked: colorMode.value === 'dark',
          onUpdateChecked(checked: boolean) {
            if (checked) {
              colorMode.preference = 'dark'
            }
          },
          onSelect(e: Event) {
            e.preventDefault()
          }
        }
      ]
    },
    {
      label: t('base.translations') || 'Translations',
      icon: 'lucide:globe',
      children: [
        {
          label: 'English',
          type: 'checkbox',
          checked: locale.value === 'en',
          onSelect(e: Event) {
            e.preventDefault()
            onSwitchLocale('en')
          }
        },
        {
          label: 'ไทย',
          type: 'checkbox',
          checked: locale.value === 'th',
          onSelect(e: Event) {
            e.preventDefault()
            onSwitchLocale('th')
          }
        }
      ]
    }
  ],
  [
    {
      label: 'Documentation',
      icon: 'i-lucide-book-open',
      to: 'https://ui.nuxt.com/docs/getting-started/installation/nuxt',
      target: '_blank'
    },
    {
      label: 'GitHub repository',
      icon: 'i-simple-icons-github',
      to: 'https://github.com/bekaku/nuxt-fullstack',
      target: '_blank'
    },
    {
      label: t('base.logout') || 'Logout',
      icon: 'i-lucide-log-out',
      color: 'error',
      onSelect(e: Event) {
        e.preventDefault()
        signout()
      }
    }
  ]
])
</script>

<template>
  <UDropdownMenu
    v-bind="$attrs"
    v-model:open="isMenuOpen"
    :items="items"
    :content="{ align: 'center', collisionPadding: 12 }"
    :ui="
      dropdownUi || {
        content: collapsed ? 'w-48' : 'w-(--reka-dropdown-menu-trigger-width)'
      }
    "
  >
    <UButton
      v-bind="{
        ...(user as any),
        label: collapsed || !showName ? undefined : user?.name,
        trailingIcon: collapsed ? undefined : 'i-lucide-chevrons-up-down'
      }"
      color="neutral"
      variant="ghost"
      block
      :square="collapsed"
      class="data-[state=open]:bg-elevated"
      :ui="{
        trailingIcon: 'text-muted'
      }"
    />

    <template #chip-leading="{ item }">
      <div class="inline-flex items-center justify-center shrink-0 size-5">
        <span
          class="rounded-full ring ring-bg bg-(--chip-light) dark:bg-(--chip-dark) size-2"
          :style="{
            '--chip-light': `var(--color-${(item as any).chip}-500)`,
            '--chip-dark': `var(--color-${(item as any).chip}-400)`
          }"
        />
      </div>
    </template>
  </UDropdownMenu>

  <UserAddAccountModal v-model="showAddAccountModal" />
</template>
