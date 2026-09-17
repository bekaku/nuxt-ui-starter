import type { AppNavigationMenuItem, LoginRequest, RefreshTokenResponse, ResponseMessage } from '~/types/common'
import type { AppUser, FavoriteMenu, IdType, LinkedAccount } from '~/types/models'
import { useAppBroadcastChannels } from './useAppBroadcastChannels'
import { useBase } from './useBase'
import { useAuthApi } from '~/api/useAuthApi'

export const useAuth = () => {
  const nuxtApp = useNuxtApp()
  const api = useApi()
  const authApi = useAuthApi()
  const { sendBroradcastChanelReload } = useAppBroadcastChannels()
  const { getDeviceId } = useAppDevice()
  const loading = ref<boolean>(false)
  const t = nuxtApp.$i18n.t
  const confirm = useConfirmDialog()
  const { inputSanitizeHtml } = useBase()

  const auth = useState<AppUser | null>('auth:user', () => null)
  const appNavigations = useState<AppNavigationMenuItem[]>('auth:navigations', () => [])
  const isLoggedIn = computed(() => !!auth.value)
  const loginedAvatar = computed(() => auth.value?.avatar ? auth.value?.avatar.thumbnail || auth.value?.avatar.image : '/images/user.png')
  const loginedDisplay = computed(() => auth.value?.email || auth.value?.username || 'Unkonwn')

  // Linked-accounts session state — shared across both layouts, fetched lazily on the
  // client only (see UserMenu.vue). Not page state: see frontend/tasks/009.
  const linkedAccounts = useState<LinkedAccount[]>('auth:linkedAccounts', () => [])
  const linkedAccountsFetched = useState<boolean>('auth:linkedAccountsFetched', () => false)
  const linkedAccountsLoading = ref<boolean>(false)
  const switchingAccountId = ref<IdType>(null)
  const linkingAccount = ref<boolean>(false)
  const removingAccountId = ref<IdType>(null)

  const setAuth = (payload: AppUser) => {
    auth.value = payload
  }

  const clearAuth = () => {
    auth.value = null
  }

  const setAppNavigations = (items: AppNavigationMenuItem[]) => {
    appNavigations.value = items
  }

  const addFavoriteMenus = (item: FavoriteMenu) => {
    if (!auth.value || !auth.value.favoriteMenus) {
      return
    }
    auth.value.favoriteMenus.push(item)
  }
  const removeFavoriteMenus = (index: number) => {
    if (!auth.value || !auth.value.favoriteMenus) {
      return
    }
    auth.value.favoriteMenus.splice(index, 1)
  }

  const signin = async (req: LoginRequest): Promise<RefreshTokenResponse | null> => {
    loading.value = true
    const deviceId = await getDeviceId()
    try {
      const response = await api<RefreshTokenResponse>('/api/auth/login', {
        method: 'POST',
        body: {
          emailOrUsername: inputSanitizeHtml(req.emailOrUsername),
          password: req.password,
          loginFrom: 'WEB',
          deviceId: deviceId
        }
      })

      if (response && response.authenticationToken) {
        // await setAuthenToken(response);
        // currentUserId.value= response.userId
      }
      return new Promise((resolve) => {
        resolve(response)
      })
    } catch (error) {
      console.error('Failed to fetch profile', error)

      return new Promise(resolve => resolve(null))
    } finally {
      loading.value = false
    }
  }
  const signout = async () => {
    const conf = await confirm({
      title: t('app.monogram'),
      description: t('helper.logoutConfirm')
    })
    if (conf) {
      await signoutProcess()
    }
  }

  const signoutProcess = async (): Promise<void> => {
    const loader = useLoader()
    loader.open()
    try {
      const response = await api.raw<ResponseMessage>('/api/auth/logout', {
        method: 'POST'
      })

      if (response && response.status == 200) {
        clearAuth()
        await sendBroradcastChanelReload()
        navigateTo('/auth/login', { replace: true })
      }
    } catch (error) {
      console.error('Failed to signout', error)
    } finally {
      loader.close()
    }
  }

  const fetchMe = async (): Promise<AppUser | null> => {
    try {
      const response = await api.raw<AppUser>('/api/appUser/currentUserData', {
        method: 'GET'
      })
      if (response && response?.status == 200 && response._data && !isAppException(response._data)) {
        setAuth(response._data)
      }

      return response._data || null
    } catch (e) {
      return null
    }
  }

  // Every session-derived state (auth, permissions, navigation, cookies) is server-set
  // via cookies, so the only correct way to pick up a switched/linked/removed session is
  // a full reload — client-only, cookies are the source of truth during SSR.
  const reloadAsCurrentSession = async (): Promise<void> => {
    await sendBroradcastChanelReload()
    if (import.meta.client) {
      await navigateTo('/', { external: true })
    }
  }

  const fetchLinkedAccounts = async (force = false): Promise<LinkedAccount[]> => {
    if (!import.meta.client) {
      return linkedAccounts.value
    }
    if (linkedAccountsFetched.value && !force) {
      return linkedAccounts.value
    }
    linkedAccountsLoading.value = true
    try {
      const response = await authApi.getLinkedAccounts()
      linkedAccounts.value = response || []
      linkedAccountsFetched.value = true
    } catch (error) {
      console.error('Failed to fetch linked accounts', error)
    } finally {
      linkedAccountsLoading.value = false
    }
    return linkedAccounts.value
  }

  const onSwithUser = async (userId: IdType) => {
    if (!userId || switchingAccountId.value) {
      return
    }
    switchingAccountId.value = userId
    try {
      const response = await authApi.switchAccount(userId)
      if (response && response.status == 200) {
        await reloadAsCurrentSession()
      }
    } catch (error) {
      console.error('Failed to switch account', error)
    } finally {
      switchingAccountId.value = null
    }
  }

  // linkAccount also switches the active session to the newly linked account (the
  // backend sets the target user's auth cookies) — treat it as a session change, not a
  // passive add.
  const linkAccount = async (req: LoginRequest): Promise<boolean> => {
    if (linkingAccount.value) {
      return false
    }
    linkingAccount.value = true
    try {
      const deviceId = await getDeviceId()
      const response = await authApi.linkAccount({
        emailOrUsername: inputSanitizeHtml(req.emailOrUsername),
        password: req.password,
        loginFrom: 'WEB',
        deviceId
      })
      if (response && response.authenticationToken) {
        await reloadAsCurrentSession()
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to link account', error)
      return false
    } finally {
      linkingAccount.value = false
    }
  }

  const removeLinkedAccount = async (targetUserId: IdType, wasCurrentUser: boolean): Promise<void> => {
    if (!targetUserId || removingAccountId.value) {
      return
    }
    removingAccountId.value = targetUserId
    try {
      const response = await authApi.removeLinkAccount(targetUserId)
      if (response && response.status == 200) {
        if (wasCurrentUser) {
          await reloadAsCurrentSession()
        } else {
          await fetchLinkedAccounts(true)
        }
      }
    } catch (error) {
      console.error('Failed to remove linked account', error)
    } finally {
      removingAccountId.value = null
    }
  }

  return {
    auth,
    isLoggedIn,
    loading,
    signin,
    signout,
    signoutProcess,
    fetchMe,
    setAuth,
    clearAuth,
    appNavigations,
    setAppNavigations,
    addFavoriteMenus,
    removeFavoriteMenus,
    loginedAvatar,
    loginedDisplay,
    onSwithUser,
    linkedAccounts,
    linkedAccountsLoading,
    switchingAccountId,
    linkingAccount,
    removingAccountId,
    fetchLinkedAccounts,
    linkAccount,
    removeLinkedAccount
  }
}
