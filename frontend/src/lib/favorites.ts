const FAVORITES_KEY = 'studom-favorite-universities'

export function getFavoriteIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]')
  } catch {
    return []
  }
}

export function setFavoriteIds(ids: string[]) {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids))
  } catch {
    // storage unavailable — favorites just won't persist for this browser
  }
}
