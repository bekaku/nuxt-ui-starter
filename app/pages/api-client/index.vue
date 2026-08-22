<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import {
  ICrudListHeaderOptionSearchType,
  type ICrudFilterOptions,
} from "~/types/common";
import type { ApiClient } from "~/types/models";

definePageMeta({
  pageName: "model.apiClient.table",
  requiresPermission: ["api_client_list"],
});
const { t } = useLang();
const { formatDateTime, formatDate } = useDateFns();
const UIcon = resolveComponent("UIcon");
const UButton = resolveComponent("UButton");
const UBadge = resolveComponent("UBadge");

const {
  dataList,
  loading,
  firstLoaded,
  pages,
  sorts,
  onPageChange,
  onPerPageChange,
  onSort,
  onReload,
  onSearch,
  onItemDelete,
  onNewForm,
  onItemClick,
  onItemCopy,
  crudName,
  onKeywordSearch,
} = useCrudList<ApiClient>({
  crudName: "ApiClient",
  apiEndpoint: "/api/apiClient",
  headers: [],
  itemsPerPage: 10,
  defaultSorts: [
    {
      column: "id",
      mode: "desc",
    },
  ],
});
const columns = ref<TableColumn<ApiClient>[]>([
  {
    accessorKey: "apiName",
    header: t("model.apiClient.apiName"),
    cell: ({ row }) => row.getValue("apiName"),

    meta: {
      options: {
        sortable: true,
        searchable: true,
        searchType: ICrudListHeaderOptionSearchType.TEXT,
        searchOperation: ":",
        searchModel: "",
        searchOperationReadonly: false,
      } as ICrudFilterOptions,
    } as any,
  },
  {
    accessorKey: "byPass",
    header: t("model.apiClient.byPass"),
    cell: ({ row }) => {
      const byPass = row.getValue("byPass");
      return h(UIcon, {
        name: byPass ? "lucide:circle-check" : "lucide:circle-x",
        class: byPass ? "text-primary size-6" : "text-neutral size-6",
      });
    },

    meta: {
      options: {
        sortable: true,
        searchable: true,
        searchType: ICrudListHeaderOptionSearchType.BOOLEAN,
        searchOperation: "=",
        searchModel: true,
        searchOperationReadonly: true,
      } as ICrudFilterOptions,
    } as any,
  },
  {
    accessorKey: "status",
    header: t("model.apiClient.status"),
    cell: ({ row }) => {
      const status = row.getValue("status");
      return h(UIcon, {
        name: status ? "lucide:circle-check" : "lucide:circle-x",
        class: status ? "text-primary size-6" : "text-neutral size-6",
      });
    },

    meta: {
      options: {
        sortable: true,
        searchable: true,
        searchType: ICrudListHeaderOptionSearchType.BOOLEAN,
        searchOperation: "=",
        searchModel: true,
        searchOperationReadonly: true,
      } as ICrudFilterOptions,
    } as any,
  },
]);
const onCellTypeClick = (index: number) => {
  let rowItem = dataList.value[index];
  console.log("rowItem", rowItem);
};
</script>

<template>
  <BaseDashboardPanel
    id="api-client-index"
    :title="$t('model.apiClient.table')"
  >
    <BaseTable
      icon="lucide:layout-list"
      :title="$t('model.apiClient.table')"
      :crud-name="crudName"
      :list="dataList"
      :show-checkbox="true"
      :loading="loading"
      :first-loaded="firstLoaded"
      :columns="columns"
      v-model:sorts="sorts"
      v-model:paging="pages"
      @on-item-delete="onItemDelete"
      @on-page-no-change="onPageChange"
      @on-items-perpage-change="onPerPageChange"
      @on-new-form="onNewForm"
      @on-item-click="onItemClick"
      @on-item-copy="onItemCopy"
      @on-sort="onSort"
      @on-reload="onReload"
      @on-keyword-search="onKeywordSearch"
      @on-search="onSearch"
    >
      <!-- accessorKey or id of column can be used as slots everywhere in side BaseTable
    <template #actions-cell="{ row }">
     Action slot
    </template>
    <template #code-cell="{ row }">
     Code slot
    </template>
    -->
    </BaseTable>
  </BaseDashboardPanel>
</template>
