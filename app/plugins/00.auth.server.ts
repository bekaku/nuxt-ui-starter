import { parse } from 'cookie-es'

export default defineNuxtPlugin(async () => {
  const { auth, fetchMe } = useAuth()
  const { initialAppNav } = useMenu()
  const { jwtKeyName, refreshJwtKeyName } = useConfiguration()

  if (auth.value)
    return

  const requestHeaders = useRequestHeaders(['cookie'])
  if (!requestHeaders.cookie)
    return

  const cookies = parse(requestHeaders.cookie)
  const hasAuthCookie = Boolean(
    (jwtKeyName && cookies[jwtKeyName as string])
    || (refreshJwtKeyName && cookies[refreshJwtKeyName as string])
  )
  if (!hasAuthCookie)
    return

  const user = await fetchMe()

  if (user) {
    await initialAppNav()
  }
})
