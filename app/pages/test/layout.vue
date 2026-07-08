<script setup lang="ts">
definePageMeta({
  layout: false,
});
</script>
<template>
  <div>
    <h1>Layout</h1>
  </div>
  <div class="grid grid-cols-1 md:grid-cols-3 sm:grid-cols-2 gap-4">
    <div class="bg-green-100 p-4 border border-green-500 rounded-md">
      Column 1
    </div>

    <div class="bg-green-100 p-4 border border-green-500 rounded-md">
      Column 2
    </div>

    <div class="bg-green-100 p-4 border border-green-500 rounded-md">
      Column 3
    </div>
  </div>

  <div class="grid grid-cols-12 gap-4 mt-8">
    <div class="col-span-12 md:col-span-4 bg-gray-200 p-4">
      Column 1 (พื้นที่ 4/12)
    </div>

    <div class="col-span-12 md:col-span-8 bg-blue-200 p-4">
      Column 2 (พื้นที่ 8/12)
    </div>
  </div>

</template>
