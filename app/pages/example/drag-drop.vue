<script setup lang="ts">
import type { ExampleTask } from "~/types/models";
useSeoMeta({
  title: "Darg and Drop",
});
const draging = ref(false);

// Auto-scroll the board sideways while a card is dragged near its left/right edge
const scrollArea = useTemplateRef<{ $el: HTMLElement }>("scrollArea");
const EDGE_SIZE = 160;
const MAX_SCROLL_SPEED = 32;
let pointerX = 0;
let scrollFrame = 0;

const trackPointer = (event: MouseEvent) => {
  pointerX = event.clientX;
};
const autoScroll = () => {
  const el = scrollArea.value?.$el;
  if (el) {
    const rect = el.getBoundingClientRect();
    const toLeft = pointerX - rect.left;
    const toRight = rect.right - pointerX;
    if (toLeft < EDGE_SIZE) {
      el.scrollLeft -=
        MAX_SCROLL_SPEED * Math.min(1, (EDGE_SIZE - toLeft) / EDGE_SIZE);
    } else if (toRight < EDGE_SIZE) {
      el.scrollLeft +=
        MAX_SCROLL_SPEED * Math.min(1, (EDGE_SIZE - toRight) / EDGE_SIZE);
    }
  }
  scrollFrame = requestAnimationFrame(autoScroll);
};
const stopAutoScroll = () => {
  cancelAnimationFrame(scrollFrame);
  document.removeEventListener("dragover", trackPointer);
  document.removeEventListener("pointermove", trackPointer);
};
const onDragStart = () => {
  draging.value = true;
  document.addEventListener("dragover", trackPointer);
  document.addEventListener("pointermove", trackPointer);
  scrollFrame = requestAnimationFrame(autoScroll);
};
const onDragEnd = () => {
  draging.value = false;
  stopAutoScroll();
};
onBeforeUnmount(stopAutoScroll);
const todoItems = ref<ExampleTask[]>([
  {
    id: 1,
    task: "Task 1",
    description: "Analyze the new requirements gathered from the customer.",
    chips: ["Meeting"],
    avatar: "https://cdn.quasar.dev/img/avatar1.jpg",
  },
  {
    id: 2,
    task: "Task 10",
    description: "Show the retrieved data from the server in grid control.",
    chips: ["Database", "SQL"],
    avatar: "https://cdn.quasar.dev/img/avatar2.jpg",
  },
  {
    id: 3,
    task: "Task 3",
    description:
      "Arrange a web meeting with the customer to get new requirements.",
    chips: ["Meeting"],
    avatar: "https://cdn.quasar.dev/img/avatar3.jpg",
  },
  {
    id: 4,
    task: "Task 20",
    description: "Enhance editing functionality.",
    chips: ["Editting"],
    avatar: "https://cdn.quasar.dev/img/avatar3.jpg",
  },
  {
    id: 5,
    task: "Task 22",
    description: "Arrange web meeting with the customer to show editing demo.",
    chips: ["Editting", "Meeting"],
    avatar: "https://cdn.quasar.dev/img/avatar3.jpg",
  },
]);
const inProgressItems = ref<ExampleTask[]>([
  {
    id: 6,
    task: "Task 2",
    description: "Improve application performance",
    chips: ["Improvment"],
    avatar: "https://cdn.quasar.dev/img/avatar4.jpg",
  },
  {
    id: 7,
    task: "Task 4",
    description: "Fix the issues reported in the IE browser.",
    chips: ["IE"],
    avatar: "https://cdn.quasar.dev/img/avatar2.jpg",
  },
  {
    id: 8,
    task: "Task 11",
    description: "Fix cannot open user’s default database SQL error.",
    chips: ["Database", "Sql2020"],
    avatar: "https://cdn.quasar.dev/img/avatar3.jpg",
  },
  {
    id: 9,
    task: "Task 20",
    description: "Enhance editing functionality.",
    chips: ["Editting"],
    avatar: "https://cdn.quasar.dev/img/avatar3.jpg",
  },
  {
    id: 10,
    task: "Task 21",
    description: "Improve the performance of the editing functionality.",
    chips: ["Performance"],
    avatar: "https://cdn.quasar.dev/img/avatar3.jpg",
  },
]);
const testingItems = ref<ExampleTask[]>([
  {
    id: 11,
    task: "Task 24",
    description: "Fix the issues reported by the customer.",
    chips: ["Customer"],
    avatar: "https://cdn.quasar.dev/img/avatar4.jpg",
  },
  {
    id: 12,
    task: "Task 25",
    description: "Fix the issues reported in Safari browser.",
    chips: ["Fix", "Safari"],
    avatar: "https://cdn.quasar.dev/img/avatar2.jpg",
  },
  {
    id: 13,
    task: "Task 26",
    description: "Check Login page validation.",
    chips: ["Testing"],
    avatar: "https://cdn.quasar.dev/img/avatar3.jpg",
  },
  {
    id: 14,
    task: "Task 27",
    description: "Fix the issues reported in data binding.",
    chips: ["Editting", "Test"],
    avatar: "https://cdn.quasar.dev/img/avatar3.jpg",
  },
  {
    id: 15,
    task: "Task 29",
    description: "Fix editing issues reported in Firefox.",
    chips: ["Fix"],
    avatar: "https://cdn.quasar.dev/img/avatar3.jpg",
  },
]);
const doneItems = ref<ExampleTask[]>([
  {
    id: 16,
    task: "Task 8",
    description: "Test the application in the IE browser.",
    chips: ["REview", "IE"],
    avatar: "https://cdn.quasar.dev/img/avatar4.jpg",
  },
  {
    id: 17,
    task: "Task 13",
    description: "Analyze SQL server 2008 connection.",
    chips: ["Analyze"],
    avatar: "https://cdn.quasar.dev/img/avatar2.jpg",
  },
  {
    id: 18,
    task: "Task 16",
    description: "Stored procedure for initial data binding of the grid.",
    chips: ["Databinding"],
    avatar: "https://cdn.quasar.dev/img/avatar3.jpg",
  },
]);
const deployItems = ref<ExampleTask[]>([
  {
    id: 19,
    task: "Task 19",
    description: "Test the application in the IE browser.",
    chips: ["REview", "IE"],
    avatar: "https://cdn.quasar.dev/img/avatar4.jpg",
  },
  {
    id: 20,
    task: "Task 20",
    description: "Analyze SQL server 2008 connection.",
    chips: ["Analyze"],
    avatar: "https://cdn.quasar.dev/img/avatar2.jpg",
  },
  {
    id: 21,
    task: "Task 21",
    description: "Stored procedure for initial data binding of the grid.",
    chips: ["Databinding"],
    avatar: "https://cdn.quasar.dev/img/avatar3.jpg",
  },
]);


const columns = [
  {
    key: "todo",
    title: "Todo",
    icon: "lucide:file",
    iconClass: "text-warning",
    dot: "bg-warning",
    accent: "bg-warning",
    items: todoItems
  },
  {
    key: "in-progress",
    title: "In Progress",
    icon: "lucide:clock",
    iconClass: "text-primary",
    dot: "bg-primary",
    accent: "bg-primary",
    items: inProgressItems
  },
  {
    key: "testing",
    title: "Testing",
    icon: "lucide:bug",
    iconClass: "text-error",
    dot: "bg-error",
    accent: "bg-error",
    items: testingItems
  },
  {
    key: "done",
    title: "Done",
    icon: "lucide:check-circle-2",
    iconClass: "text-success",
    dot: "bg-success",
    accent: "bg-success",
    items: doneItems
  },
  {
    key: "deploy",
    title: "Deploy",
    icon: "lucide:rocket",
    iconClass: "text-info",
    dot: "bg-info",
    accent: "bg-info",
    items: deployItems
  }
];
</script>

<template>
  <BaseDashboardPanel id="example-drag-drop" title="Darg and Drop" body-class="max-w-full">
    <UScrollArea
      ref="scrollArea"
      orientation="horizontal"
      class="w-full p-4"
    >
      <div class="flex flex-none items-start gap-4">
        <section
          v-for="col in columns"
          :key="col.key"
          class="w-[320px] shrink-0 rounded-xl bg-elevated/50 ring ring-default transition-colors"
          :class="{ 'ring-primary/50 ring-dashed bg-primary/5': draging }"
        >
          <header class="flex items-center justify-between px-4 py-3">
            <div class="flex items-center gap-2">
              <span class="size-2.5 rounded-full" :class="col.dot" />
              <h3 class="text-sm font-semibold text-highlighted">
                {{ col.title }}
              </h3>
            </div>
            <UBadge
              color="neutral"
              variant="subtle"
              size="sm"
              :label="col.items.value.length"
            />
          </header>
          <UScrollArea orientation="vertical" class="h-[72vh] w-full">
            <BaseDragable
              v-model="col.items.value"
              group="my-tasks"
              label-key="task"
              value-key="id"
              list-class="flex min-h-[70vh] flex-col gap-3 px-3 pb-3"
              @on-drag-start="onDragStart"
              @on-drag-end="onDragEnd"
            >
              <template #item="{ item }">
                <ExampleTaskCard
                  v-if="item"
                  :item="item"
                  :icon="col.icon"
                  :icon-class="col.iconClass"
                  :accent="col.accent"
                />
              </template>
            </BaseDragable>
          </UScrollArea>
        </section>
      </div>
    </UScrollArea>
  </BaseDashboardPanel>
</template>
