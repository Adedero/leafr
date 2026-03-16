type StoredValue<T> = {
  value: T;
  expiresAt: number;
};

interface CacheOptions {
  defaultTTL?: number;
  cleanupInterval?: number;
  prefix?: string;
}

export class TTLCache {
  private memoryCache = new Map<string, StoredValue<any>>();
  private useLocalStorage: boolean;
  private defaultTTL: number;
  private cleanupIntervalId?: number;
  private prefix: string;

  constructor(options?: CacheOptions) {
    this.defaultTTL = options?.defaultTTL ?? 5 * 60_000;
    this.prefix = options?.prefix ?? "__ttlcache__";
    this.useLocalStorage = this.checkLocalStorage();

    const interval = options?.cleanupInterval ?? 60_000;
    this.cleanupIntervalId = window.setInterval(() => this.cleanup(), interval);
  }

  // ─── Private ──────────────────────────────────────────

  private checkLocalStorage(): boolean {
    try {
      const key = `${this.prefix}test__`;
      localStorage.setItem(key, "1");
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }

  private prefixed(key: string): string {
    return `${this.prefix}${key}`;
  }

  private serialize<T>(value: StoredValue<T>): string {
    return JSON.stringify(value);
  }

  private deserialize<T>(str: string | null): StoredValue<T> | null {
    if (!str) return null;
    try {
      return JSON.parse(str) as StoredValue<T>;
    } catch {
      return null;
    }
  }

  private isExpired(stored: StoredValue<any>): boolean {
    return stored.expiresAt < Date.now();
  }

  // ─── Public ───────────────────────────────────────────

  set<T>(key: string, value: T, ttl?: number): void {
    const expiresAt = Date.now() + (ttl ?? this.defaultTTL);
    const stored: StoredValue<T> = { value, expiresAt };

    if (this.useLocalStorage) {
      try {
        localStorage.setItem(this.prefixed(key), this.serialize(stored));
        return;
      } catch {
        // quota exceeded — fall through to memory
      }
    }
    this.memoryCache.set(key, stored);
  }

  get<T>(key: string): T | undefined {
    // check localStorage first
    if (this.useLocalStorage) {
      const stored = this.deserialize<T>(localStorage.getItem(this.prefixed(key)));
      if (stored) {
        if (this.isExpired(stored)) {
          this.remove(key);
          return undefined;
        }
        return stored.value;
      }
    }

    // fallback to memory (e.g. set during quota error)
    const mem = this.memoryCache.get(key);
    if (mem) {
      if (this.isExpired(mem)) {
        this.memoryCache.delete(key);
        return undefined;
      }
      return mem.value as T;
    }

    return undefined;
  }

  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  remove(key: string): void {
    if (this.useLocalStorage) localStorage.removeItem(this.prefixed(key));
    this.memoryCache.delete(key);
  }

  /** Clears only keys belonging to this cache instance */
  clear(): void {
    if (this.useLocalStorage) {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key?.startsWith(this.prefix)) localStorage.removeItem(key);
      }
    }
    this.memoryCache.clear();
  }

  async fetch<T>(key: string, fetcher: () => Promise<T>, ttl?: number): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== undefined) return cached;
    const result = await fetcher();
    this.set(key, result, ttl);
    return result;
  }

  stopCleanup(): void {
    if (this.cleanupIntervalId) clearInterval(this.cleanupIntervalId);
  }

  private cleanup(): void {
    const now = Date.now();

    for (const [key, stored] of this.memoryCache.entries()) {
      if (stored.expiresAt < now) this.memoryCache.delete(key);
    }

    if (this.useLocalStorage) {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (!key?.startsWith(this.prefix)) continue; // ✅ only touch our keys
        const stored = this.deserialize(localStorage.getItem(key));
        if (stored && this.isExpired(stored)) localStorage.removeItem(key);
      }
    }
  }
}
