export const useAppCookie = () => {
  const config = useRuntimeConfig()
  // const event = useRequestEvent();
  const currentUserId = useCookie<number | string | null>(config.public.currentUserKeyName)
  return {
    currentUserId,
  }
}
