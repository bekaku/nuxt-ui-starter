import type { LoginRequest, RefreshTokenResponse } from '~/types/common'
import type { IdType, LinkedAccount } from '~/types/models'

export const useAuthApi = () => {
  const api = useApi()

  const getLinkedAccounts = async (): Promise<LinkedAccount[] | null> => {
    return api<LinkedAccount[]>('/api/auth/linkedAccounts', {
      method: 'POST'
    })
  }

  const linkAccount = async (req: LoginRequest): Promise<RefreshTokenResponse | null> => {
    return api<RefreshTokenResponse>('/api/auth/linkAccount', {
      method: 'POST',
      body: req
    })
  }

  // No request body. Success is either an empty body (a still-valid per-user refresh
  // cookie was reused) or a RefreshTokenResponse (fresh login) — both 200. Callers MUST
  // key off response.status, not response._data.
  const switchAccount = async (targetUserId: IdType) => {
    return api.raw<RefreshTokenResponse | null>(`/api/auth/switchAccount/${targetUserId}`, {
      method: 'POST'
    })
  }

  // No request body. Success is 200 with an empty body.
  const removeLinkAccount = async (targetUserId: IdType) => {
    return api.raw<null>(`/api/auth/removeLinkAccount/${targetUserId}`, {
      method: 'POST'
    })
  }

  return {
    getLinkedAccounts,
    linkAccount,
    switchAccount,
    removeLinkAccount
  }
}
