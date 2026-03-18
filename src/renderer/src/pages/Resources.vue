<script setup lang="ts">

const { open } = useExternalLink();

interface BookResource {
  title: string;
  description: string;
  link: string;
  icon: string;
  category: "free" | "buy" | "subscription" | "community";
}

const resources: BookResource[] = [
  // ─── Free / Open Access ───────────────────────────────────────
  {
    title: "Project Gutenberg",
    description: "70,000+ free public domain ebooks. The oldest digital library.",
    link: "https://www.gutenberg.org",
    icon: "lucide:book-open",
    category: "free"
  },
  {
    title: "Standard Ebooks",
    description: "Beautifully formatted, typo-corrected public domain classics.",
    link: "https://standardebooks.org",
    icon: "lucide:sparkles",
    category: "free"
  },
  {
    title: "Open Library",
    description: "Borrow or download millions of books. Part of Internet Archive.",
    link: "https://openlibrary.org",
    icon: "lucide:library",
    category: "free"
  },
  {
    title: "ManyBooks",
    description: "Free ebooks in multiple formats including EPUB and MOBI.",
    link: "https://manybooks.net",
    icon: "lucide:books",
    category: "free"
  },
  {
    title: "Feedbooks",
    description: "Public domain and original ebooks, optimized for mobile reading.",
    link: "https://www.feedbooks.com",
    icon: "lucide:rss",
    category: "free"
  },
  {
    title: "Global Grey Ebooks",
    description: "Clean, well-formatted free ebooks across all genres.",
    link: "https://www.globalgreyebooks.com",
    icon: "lucide:globe",
    category: "free"
  },

  // ─── Buy ──────────────────────────────────────────────────────
  {
    title: "Amazon Kindle Store",
    description: "Largest ebook store. Millions of titles across every genre.",
    link: "https://www.amazon.com/kindle-store",
    icon: "lucide:shopping-cart",
    category: "buy"
  },
  {
    title: "Kobo",
    description: "DRM-friendly ebook store with great EPUB support.",
    link: "https://www.kobo.com",
    icon: "lucide:tablet",
    category: "buy"
  },
  {
    title: "Apple Books",
    description: "Apple's ebook store with a clean reading experience.",
    link: "https://books.apple.com",
    icon: "lucide:apple",
    category: "buy"
  },
  {
    title: "Smashwords",
    description: "Indie author marketplace. DRM-free ebooks in all formats.",
    link: "https://www.smashwords.com",
    icon: "lucide:pen-line",
    category: "buy"
  },
  {
    title: "Lulu",
    description: "Self-published books and ebooks from independent authors.",
    link: "https://www.lulu.com",
    icon: "lucide:feather",
    category: "buy"
  },

  // ─── Subscription ─────────────────────────────────────────────
  {
    title: "Kindle Unlimited",
    description: "Read millions of titles for a flat monthly fee.",
    link: "https://www.amazon.com/kindle-unlimited",
    icon: "lucide:infinity",
    category: "subscription"
  },
  {
    title: "Scribd",
    description: "Ebooks, audiobooks, magazines, and documents. All-in-one.",
    link: "https://www.scribd.com",
    icon: "lucide:scroll-text",
    category: "subscription"
  },
  {
    title: "Storytel",
    description: "Audiobooks and ebooks subscription, popular in Europe.",
    link: "https://www.storytel.com",
    icon: "lucide:headphones",
    category: "subscription"
  },

  // ─── Community / Discovery ────────────────────────────────────
  {
    title: "Goodreads",
    description: "Track, discover, and review books. World's largest book community.",
    link: "https://www.goodreads.com",
    icon: "lucide:users",
    category: "community"
  },
  {
    title: "LibraryThing",
    description: "Catalog your books and discover readers with similar taste.",
    link: "https://www.librarything.com",
    icon: "lucide:list-checks",
    category: "community"
  },
  {
    title: "The StoryGraph",
    description: "Track and discover books based on mood and pace. Goodreads alternative.",
    link: "https://www.thestorygraph.com",
    icon: "lucide:bar-chart-2",
    category: "community"
  }
];
</script>

<template>
  <div class="px-4 py-6 space-y-20">
    <div class="flex flex-wrap gap-4">
      <div v-for="resource in resources" :key="resource.title">
        <button
          @click="open(resource.link)"
          class="block p-4 shadow-md border-2 border-border bg-surface"
        >
          <Icon :name="resource.icon" class="text-xl" />
          <h3 class="font-bold">{{ resource.title }}</h3>
          <p class="text-sm">{{ resource.description }}</p>
        </button>
      </div>
    </div>
  </div>
</template>
