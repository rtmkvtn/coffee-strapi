interface CacheItem {
  data: any
  timestamp: number
  ttl: number
}

class MemoryCache {
  private cache: Map<string, CacheItem> = new Map()
  private timers: Map<string, NodeJS.Timeout> = new Map()

  set(key: string, value: any, ttlSeconds: number = 300): void {
    // Clear existing timer if it exists
    const existingTimer = this.timers.get(key)
    if (existingTimer) {
      clearTimeout(existingTimer)
    }

    // Set cache item
    this.cache.set(key, {
      data: value,
      timestamp: Date.now(),
      ttl: ttlSeconds * 1000,
    })

    // Set expiration timer
    const timer = setTimeout(() => {
      this.delete(key)
    }, ttlSeconds * 1000)

    this.timers.set(key, timer)
  }

  get(key: string): any | null {
    const item = this.cache.get(key)
    if (!item) {
      return null
    }

    // Check if expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.delete(key)
      return null
    }

    return item.data
  }

  delete(key: string): void {
    this.cache.delete(key)
    const timer = this.timers.get(key)
    if (timer) {
      clearTimeout(timer)
      this.timers.delete(key)
    }
  }

  clear(): void {
    // Clear all timers
    this.timers.forEach((timer) => clearTimeout(timer))
    this.timers.clear()
    this.cache.clear()
  }

  has(key: string): boolean {
    return this.cache.has(key) && this.get(key) !== null
  }

  size(): number {
    return this.cache.size
  }

  // Get cache statistics
  getStats(): {
    size: number
    keys: string[]
    memoryUsage: string
  } {
    const keys = Array.from(this.cache.keys())
    return {
      size: this.cache.size,
      keys,
      memoryUsage: `${Math.round(JSON.stringify(Array.from(this.cache.entries())).length / 1024)}KB`,
    }
  }
}

// Export singleton instance
export const cache = new MemoryCache()

// Cache key generators
export const CacheKeys = {
  PRODUCTS_ALL: 'products:all:with-relations',
  PRODUCT_BY_ID: (id: string | number) => `product:${id}:with-relations`,
  CATEGORIES_ALL: 'categories:all',
  INGREDIENTS_ALL: 'ingredients:all',
  PORTIONS_ALL: 'portions:all',
}

// Cache invalidation helpers
export const invalidateProductCache = () => {
  cache.delete(CacheKeys.PRODUCTS_ALL)
  // Clear all individual product caches
  const keys = Array.from(cache['cache'].keys())
  keys.forEach((key) => {
    if (key.startsWith('product:') && key.includes(':with-relations')) {
      cache.delete(key)
    }
  })
}

export const invalidateRelatedCaches = () => {
  cache.delete(CacheKeys.CATEGORIES_ALL)
  cache.delete(CacheKeys.INGREDIENTS_ALL)
  cache.delete(CacheKeys.PORTIONS_ALL)
  invalidateProductCache()
}
