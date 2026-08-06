import type { AppNavigationMenuItem, LoginRequest, RefreshTokenResponse, ResponseMessage } from '~/types/common';
import type { AppUser, FavoriteMenu } from '~/types/models';
import { useAppBroadcastChannels } from './useAppBroadcastChannels';
import { useBase } from './useBase';
export const useAuth = () => {
  const nuxtApp = useNuxtApp();
  const api = useApi();
  const { sendBroradcastChanelReload } = useAppBroadcastChannels()
  const { getDeviceId } = useAppDevice()
  const { isServer } = useConfiguration()
  const loading = ref<boolean>(false);
  const t = nuxtApp.$i18n.t;
  const confirm = useConfirmDialog();
  const { inputSanitizeHtml } = useBase()

  const auth = useState<AppUser | null>('auth:user', () => null);
  const appNavigations = useState<AppNavigationMenuItem[]>('auth:navigations', () => []);
  const isLoggedIn = computed(() => !!auth.value);
  const loginedAvatar = computed(() => auth.value?.avatar ? auth.value?.avatar.thumbnail || auth.value?.avatar.image : '/images/user.png');
  const loginedDisplay = computed(() => auth.value?.email || auth.value?.username || 'Unkonwn');

  const setAuth = (payload: AppUser) => {
    auth.value = payload;
  };

  const clearAuth = () => {
    auth.value = null;
  };

  const setAppNavigations = (items: AppNavigationMenuItem[]) => {
    appNavigations.value = items;
  };

  const addFavoriteMenus = (item: FavoriteMenu) => {
    if (!auth.value || !auth.value.favoriteMenus) {
      return
    }
    auth.value.favoriteMenus.push(item);
  };
  const removeFavoriteMenus = (index: number) => {
    if (!auth.value || !auth.value.favoriteMenus) {
      return
    }
    auth.value.favoriteMenus.splice(index, 1);;
  };

  const signin = async (req: LoginRequest): Promise<RefreshTokenResponse | null> => {

    loading.value = true
    const deviceId = await getDeviceId()
    try {
      const response = await api<RefreshTokenResponse>('/api/auth/login', {
        method: 'POST',
        body: {
          data: {
            emailOrUsername: inputSanitizeHtml(req.emailOrUsername),
            password: inputSanitizeHtml(req.password),
            loginFrom: 'WEB',
            deviceId: deviceId,
          }
        }
      })

      if (response && response.authenticationToken) {
        // await setAuthenToken(response);
        // currentUserId.value= response.userId
      }
      return new Promise((resolve) => {
        resolve(response);
      });
    } catch (error) {
      console.error('Failed to fetch profile', error)

      return new Promise((resolve) => resolve(null));
    } finally {
      loading.value = false
    }

  }
  const signout = async () => {
    const conf = await confirm({
      title: t("app.monogram"),
      description: t("helper.logoutConfirm"),
    });
    if (conf) {
      await signoutProcess()
    }
  };

  const signoutProcess = async (): Promise<void> => {
    console.log('signoutProcess');
    const loader = useLoader();
    loader.open();
    const response = await api.raw<ResponseMessage>('/api/auth/logout', {
      method: 'POST',
    })
    console.log('signoutProcess > response', response);

    if (response && response.status == 200) {
      clearAuth();
      await sendBroradcastChanelReload();
      loader.close();
      navigateTo('/auth/login', { replace: true })

    }

  }

  const fetchMe = async (): Promise<AppUser | null> => {
    try {
      const response = await api.raw<AppUser>('/api/appUser/currentUserData', {
        method: 'GET'
      })
      if (response && response?.status == 200 && response._data && !isAppException(response._data)) {
        setAuth(response._data);
      }

      return response._data || null;
    } catch (e) {
      return null;
    }
  };

  const onSwithUser = async (userId: number | string) => {
    if (!isServer() || !userId) {
      return;
    }
    await sendBroradcastChanelReload();
    setTimeout(() => {
      window.location.replace('/')
    }, 100)
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
    onSwithUser
  }

}
