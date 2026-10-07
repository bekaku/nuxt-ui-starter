<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";
const items: NavigationMenuItem[][] = [
  [
    {
      label: "Home",
      icon: "i-lucide-house",
      to: "/example/feed",
    },
    {
      label: "Reels",
      icon: "i-lucide-circle-play",
    },
    {
      label: "Marketplace",
      icon: "i-lucide-store",
    },
    {
      label: "Groups",
      icon: "i-lucide-users",
    },
    {
      label: "Gamming",
      icon: "i-lucide-gamepad",
    },
  ],
];
</script>

<template>
  <div>
    <UHeader class="w-full" to="#" :ui="{container:'max-w-[1440px]'}">
      <!-- #left (not #title): UHeader wraps #title in its own <a>, and our content has a <ULink> -> nested anchors -> SSR/hydration duplicate -->
      <template #left>
        <div class="flex gap-2 items-center">
          <ULink to="/">
            <BaseLogo :width="110" img-class="w-[55px]" />
          </ULink>

          <!-- Show only large device -->
          <UInput
            class="hidden md:block"
            icon="i-lucide-search"
            size="md"
            variant="soft"
            placeholder="Search..."
          />
        </div>
      </template>
      <UNavigationMenu
        :items="items"
        tooltip
        collapsed
        class="w-full"
        :ui="{
          root: 'justify-around border-t border-default py-2',
          item: 'py-0 gap-4 px-4',
          link: 'flex-col gap-1 px-3',
          linkLeadingIcon: 'size-6',
          linkLabel: 'text-[10px]/3 font-normal',
        }"
      />

      <template #right>
        <!-- Show only small device -->
        <Icon name="lucide:search" class="block md:hidden size-5 shrink-0" />
        <UChip color="error" inset>
          <Icon name="lucide:message-circle" class="size-5 shrink-0" />
        </UChip>
        <UChip color="error" inset>
          <Icon name="lucide:bell" class="size-5 shrink-0" />
        </UChip>
        <UserMenu class="w-48" />
      </template>

      <template #body>
        <UNavigationMenu
          :items="items"
          orientation="vertical"
          class="-mx-2.5"
        />
      </template>
    </UHeader>
    <UMain class="bg-default/75">
      <slot />
    </UMain>
  </div>
</template>
