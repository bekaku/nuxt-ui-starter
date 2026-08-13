import type { ResponseMessage } from "~/types/common";
import type { FavoriteMenu } from "~/types/models";

export const useFavoriteMenuApi = () => {
  const api = useApi()
  const createFavorite = async (request: FavoriteMenu): Promise<FavoriteMenu | null> => {
    return api<FavoriteMenu>('/api/favoriteMenu', {
      method: 'POST',
      body: request
    })
  };
  const deleteFavorite = async (request: FavoriteMenu): Promise<ResponseMessage | null> => {
    return api<ResponseMessage>('/api/favoriteMenu', {
      method: 'DELETE',
      body: request
    })
  };

  return {
    createFavorite,
    deleteFavorite
  }
}
