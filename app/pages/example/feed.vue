<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";
import type { LabelValue } from "~/types/common";

definePageMeta({
  layout: "feed",
  // requiresPermission: ['role_manage', 'rome_list'],
  // breadcrumbs: ExampleHomeBreadcrumb,
  // tabs: TabTest,
});
useSeoMeta({
  title: "Feed page",
});
const authenStore = useAuthenStore();
const { isMobile } = useDevice();

const links: NavigationMenuItem[][] = [
  [
    {
      label: "Menu",
      type: "label",
    },
    {
      label: "Home",
      icon: "i-lucide-house",
      to: "/",
    },
    {
      label: "Friends",
      icon: "lucide:square-user-round",
      badge: "4",
    },
    {
      label: "Groups",
      icon: "i-lucide-users",
    },
    {
      label: "Memories",
      icon: "lucide:history",
    },
    {
      label: "Saved",
      icon: "lucide:bookmark",
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
    {
      label: "Messages",
      icon: "lucide:message-circle",
    },
    {
      label: "Social",
      type: "label",
    },
    {
      label: "Feeds",
      icon: "lucide:newspaper",
    },
    {
      label: "Pages",
      icon: "lucide:flag",
    },
    {
      label: "Events",
      icon: "lucide:calendar-fold",
    },
  ],
];

const storyItems = [
  {
    you: true,
  },
  {
    image:
      "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=200&auto=format&fit=crop",
    avatar: "https://i.pravatar.cc/150?img=11",
    name: "Sam Brown",
  },
  {
    image:
      "https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?q=80&w=200&auto=format&fit=crop",
    avatar: "https://i.pravatar.cc/150?img=20",
    name: "Laura Fisher",
  },
  {
    image:
      "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=200&auto=format&fit=crop",
    avatar: "https://i.pravatar.cc/150?img=33",
    name: "Diana Vooss",
  },
  {
    image:
      "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=200&auto=format&fit=crop",
    avatar: "https://i.pravatar.cc/150?img=60",
    name: "Roger Miller",
  },
];
</script>

<template>
  <main
    class="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 flex flex-col lg:flex-row gap-8 items-start"
  >
    <!-- Left  -->
    <div
      v-if="!isMobile"
      class="hidden md:block w-full lg:w-64 shrink-0 lg:sticky lg:top-[6rem] lg:h-[calc(100vh-7rem)] flex flex-col gap-6"
    >
      <UserCard
        v-if="authenStore.auth"
        :avatar="{
          src: authenStore.auth?.avatar?.image,
        }"
        :cover-image="authenStore.loginedCover"
        :name="authenStore.loginedDisplay"
        description="Software Engineer"
        height="100px"
        avatar-top="70px"
        avatar-size="3xl"
        avartar-class="top-[95px]"
        :description-style="{ marginTop: '10px' }"
      />

      <div class="flex-1 overflow-y-auto scrollbar-hide my-4">
        <UNavigationMenu
          :items="links[0]"
          orientation="vertical"
          tooltip
          popover
        />
      </div>
    </div>

    <!-- Center  -->

    <div class="flex-1 flex flex-col gap-6 min-w-0">
      <!-- Story  -->
      <div class="pb-2 w-full">
        <UCarousel
          class="w-full"
          v-slot="{ item }"
          arrows
          :prev="{ variant: 'solid' }"
          :next="{ variant: 'solid' }"
          :items="storyItems"
          :ui="{
            item: 'basis-1/4 md:basis-1/5 ps-0',
            prev: 'sm:start-8',
            next: 'sm:end-8',
            container: 'ms-0',
          }"
        >
          <template v-if="item.you">
            <div
              class="w-28 h-44 shrink-0 rounded-2xl bg-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-300 transition relative overflow-hidden bg-cover"
              style="
                background-image: url(https://images.unsplash.com/photo-1782064230154-ba47c8714d9e?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D);
              "
            >
              <div class="absolute inset-0 bg-white/40"></div>
              <div
                class="w-8 h-8 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold z-10 shadow-sm mb-2"
              >
                +
              </div>
              <span class="text-sm font-bold text-white z-10 drop-shadow-md"
                >Add Story</span
              >
            </div>
          </template>
          <div
            v-else
            class="w-28 h-44 shrink-0 rounded-2xl bg-cover bg-center relative cursor-pointer group"
            :style="`
              background-image: url(${item.image});
            `"
          >
            <div
              class="absolute inset-0 bg-gradient-to-b from-black/20 to-black/60 rounded-2xl"
            ></div>
            <UAvatar
              class="absolute top-3 left-1/2 -translate-x-1/2 rounded-full border-2 border-blue-500"
              :src="item.avatar"
              :alt="item.name"
              size="3xl"
              loading="lazy"
            />
            <span
              class="absolute bottom-3 left-0 w-full text-center text-white text-xs font-bold px-1"
              >{{ item.name }}</span
            >
          </div>
        </UCarousel>
      </div>

      <!-- Post area -->
      <div class="w-full">
        <UCard variant="outline">
          <div class="flex items-center gap-4">
            <UAvatar
              :src="authenStore.auth?.avatar?.image"
              loading="lazy"
              size="xl"
            />
            <div class="flex-1 bg-muted p-3 rounded-md text-sm cursor-pointer">
              What's new, Alexandra?
            </div>

            <div class="flex items-center gap-1">
              <UTooltip text="Photo">
                <UButton variant="ghost" color="neutral" icon="lucide:image" />
              </UTooltip>
              <UTooltip text="Video">
                <UButton
                  variant="ghost"
                  color="neutral"
                  icon="lucide:square-play"
                />
              </UTooltip>
              <UTooltip text="Files">
                <UButton
                  variant="ghost"
                  color="neutral"
                  icon="lucide:paperclip"
                />
              </UTooltip>
              <UTooltip text="Feeling">
                <UButton variant="ghost" color="neutral" icon="lucide:smile" />
              </UTooltip>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Post section -->

      <div class="w-full pb-10">
        <UCard>
          <div class="w-full flex flex-col gap-4 px-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <img
                  src="https://i.pravatar.cc/150?img=20"
                  class="w-10 h-10 rounded-full"
                />
                <div>
                  <h4 class="font-bold text-sm text-slate-800">Laura Fisher</h4>
                  <p class="text-xs text-gray-500">12 hours ago</p>
                </div>
              </div>
              <button class="text-gray-400 hover:text-gray-600">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
                  ></path>
                </svg>
              </button>
            </div>

            <div class="text-gray-700 leading-relaxed">
              This was one of the most epic journeys, that i've got myself
              involved in. Maybe one of the most memorizable in my entire life!
            </div>

            <div class="w-full  grid grid-cols-2 gap-4 h-[400px]">
              <img
                src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
                class="w-full h-full object-cover rounded-2xl row-span-2"
              />
              <img
                src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=400&auto=format&fit=crop"
                class="w-full h-[192px] object-cover rounded-2xl"
              />
              <img
                src="https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=400&auto=format&fit=crop"
                class="w-full h-[192px] object-cover rounded-2xl"
              />
            </div>
          </div>
        </UCard>
      </div>
    </div>

    <!-- Right  -->
    <aside
      class="w-full lg:w-80 shrink-0 lg:sticky lg:top-[6rem] lg:h-[calc(100vh-7rem)] overflow-y-auto scrollbar-hide flex flex-col gap-8"
    >
      Right
    </aside>
  </main>
</template>
