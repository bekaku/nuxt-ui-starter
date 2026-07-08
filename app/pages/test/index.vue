<script setup lang="ts">
definePageMeta({
  layout: false,
});
useSeoMeta({
  title: "Test page",
});
const { getFavoriteNavigations } = useMenu();
const appStore = useAppStore();
</script>
<template>
  <div>
    <div class="flex flex-col p-4">
      <UButton
        label="Home"
        icon="lucide:arrow-left"
        to="/"
        color="warning"
        class="w-fit"
      />

      <div class="flex items-end gap-3 p-4">
        <div>
          <NuxtImg
            preset="avatar"
            src="/images/user.png"
            width="50"
            class="rounded-md"
          />
        </div>

        <div>
          <NuxtImg
            src="https://plus.unsplash.com/premium_photo-1781034652016-aab63ad73af5?q=80&w=800"
            width="150"
            class="rounded-md"
          />
        </div>
      </div>

      <h1 class="text-2xl font-bold">Favorite Navigation</h1>
      <div class="p-4">
        <UNavigationMenu
          v-if="getFavoriteNavigations && getFavoriteNavigations.length > 0"
          :highlight="true"
          highlight-color="primary"
          orientation="vertical"
          :items="getFavoriteNavigations"
          class="data-[orientation=vertical]:w-48"
        />
      </div>
      <h1 class="text-2xl font-bold">Filter Navigation</h1>
      <div class="p-4">
        <UNavigationMenu
          v-if="appStore.appNavigations && appStore.appNavigations.length > 0"
          :highlight="true"
          highlight-color="primary"
          orientation="vertical"
          :items="appStore.appNavigations"
          class="data-[orientation=vertical]:w-48"
        />
      </div>
    </div>
  </div>
</template>
