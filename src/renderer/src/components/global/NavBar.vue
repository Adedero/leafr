<script setup lang="ts">
import Icon from "../ui/Icon.vue";

const links = {
  top: [
    {
      label: "Home",
      to: "/",
      icon: "lucide:home"
    },
    {
      label: "Library",
      to: "/library",
      icon: "lucide:library-big"
    },
    {
      label: "Bookmarks",
      to: "/bookmarks",
      icon: "lucide:bookmark"
    },
    {
      label: "Analytics",
      to: "/analytics",
      icon: "lucide:bar-chart-big"
    }
  ],
  bottom: [
    {
      label: "Resources",
      to: "/resources",
      icon: "lucide:globe"
    },
    {
      label: "Settings",
      to: "/settings",
      icon: "lucide:settings"
    }
  ]
} as const;
</script>

<template>
  <div class="h-full flex flex-col gap-2">
    <ul class="grid gap-1 mt-5">
      <li v-for="link in links.top" :key="link.label">
        <RouterLink
          :to="link.to"
          class="py-3 flex flex-col gap-1 items-center justify-center text-center"
          exact-active-class="text-primary"
        >
          <Icon :name="link.icon" class="text-xl" />
          <p class="font-bold text-[0.7rem]">
            {{ link.label }}
          </p>
        </RouterLink>
      </li>
    </ul>

    <ul class="grid gap-1 mt-auto">
      <li v-for="link in links.bottom" :key="link.label">
        <RouterLink
          :to="link.to"
          class="py-3 flex flex-col gap-1 items-center justify-center text-center"
          exact-active-class="text-primary"
        >
          <Icon :name="link.icon" class="text-xl" />
          <p class="font-bold text-[0.7rem]">
            {{ link.label }}
          </p>
        </RouterLink>
      </li>
    </ul>
  </div>
</template>
