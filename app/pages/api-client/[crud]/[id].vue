<script setup lang="ts">
import z from "zod";
import { CrudAction } from "~/libs/constants";
import type {
  ApiClient,
  ApiClientSaveRequest,
  AppUser,
  IdType,
} from "~/types/models";

definePageMeta({
  pageName: "model.apiClient.table",
  requiresPermission: ["api_client_view", "api_client_add", "api_client_edit"],
});
const { t } = useLang();
const api = useApi();
const toast = useToast();
const key = ref();
const { writeToClipboard, onReplaceUrl } = useBase();
const confirm = useConfirmDialog();
const loader = useLoader();
const { isMobile } = useAppDevice();
const { hasPermission } = useRbac();
// Picking an owner reads /api/appUser, which needs its own permission.
const canSelectOwner = computed(() => hasPermission({ permissions: ["app_user_list"] }));
const idToString = (id: IdType): string => {
  if (typeof id === "string") return id;
  if (typeof id === "bigint") return id.toString();
  return "";
};
const {
  dataList: appUsers,
  loading: appUsersLoading,
  firstLoaded: appUsersFirstLoaded,
  isInfiniteDisabled: appUsersExhausted,
  loadData: loadAppUsers,
  onNextPage: loadMoreAppUsers,
} = usePagefecth<AppUser>({
  apiEndpoint: "/api/appUser",
  additionalUri: "_q=active=true",
  itemsPerPage: 50,
  concatList: true,
  fetchListOnload: false,
  defaultSorts: [{ column: "username", mode: "asc" }],
});
const schema = z.object({
  apiName: z
    .string()
    .min(1, t("error.validateRequireField"))
    .describe(
      uiConfig({
        label: t("model.apiClient.apiName"),
        description: t("helper.apiClient.apiNameIsAcceptApiclient"),
        ui: {
          type: "text",
          required: true,
          clearable: true,
          maxlength: 100,
        },
      }),
    ),
  appUserId: z
    .string()
    .describe(
      uiConfig({
        label: t("model.apiClient.appUser"),
        description: t("helper.apiClient.appUserOptional"),
        ui: {
          type: "input-menu",
          required: false,
        },
      }),
    )
    .optional(),
  expiresAt: z
    .string()
    .describe(
      uiConfig({
        label: t("model.apiClient.expiresAt"),
        description: t("helper.apiClient.expiresAtEndOfDay"),
        ui: {
          type: "date",
          required: false,
        },
      }),
    )
    .optional(),
  byPass: z
    .any()
    .describe(
      uiConfig({
        label: t("model.apiClient.byPass"),
        ui: {
          type: "checkbox",
          required: false,
          clearable: false,
        },
      }),
    )
    .optional(),
  status: z
    .any()
    .describe(
      uiConfig({
        label: t("model.apiClient.status"),
        ui: {
          type: "checkbox",
          required: false,
          clearable: true,
        },
      }),
    )
    .optional(),
});
type Schema = z.output<typeof schema>;
const state = ref<Partial<Schema>>({
  apiName: "",
  appUserId: "",
  expiresAt: "",
  byPass: false,
  status: true,
});
const {
  crudAction,
  loading,
  crudName,
  isEditMode,
  onDelete,
  onBack,
  onEnableEditForm,
  onSubmitProcess,
  crudId,
} = useCrudForm<ApiClient>(
  {
    crudName: "ApiClient",
    preventRedirectToList: true,
  },
  state,
);
if (canSelectOwner.value) {
  await loadAppUsers();
}
// The API returns an ISO instant, the date field needs YYYY-MM-DD. Normalise on load.
watch(
  () => state.value.expiresAt,
  (value) => {
    if (value && value.length > 10) {
      state.value.expiresAt = value.slice(0, 10);
    }
  },
  { immediate: true },
);
const appUserOptions = computed(() => {
  const options = appUsers.value
    .filter((user) => user.active !== false)
    .flatMap((user) => {
      const value = idToString(user.id);
      if (!value) return [];
      return [{
        label: user.username ? `${user.username} (${user.email})` : user.email,
        description: user.email,
        value,
      }];
    });
  // Keep an already linked owner selectable even when it is not on the loaded page.
  const current = state.value.appUserId;
  if (!current || options.some((option) => option.value === current)) {
    return options;
  }
  return [{ label: current, description: "", value: current }, ...options];
});
const onGenerateAPIKEY = async () => {
  if (!crudId.value) {
    return;
  }

  const conf = await confirm({
    title: t("base.generateApiKey"),
    description: t("helper.keyGenerateHelp"),
    confirmButton: {
      label: t("base.confirm"),
      icon: "lucide:key-round",
    },
  });
  if (!conf) {
    return;
  }
  loader.open();
  try {
    const response = await api.raw<string>(
      `/api/apiClient/generate/${crudId.value}`,
      {
        method: "POST",
      },
    );
    if (response && response?.status == 200 && response._data) {
      key.value = response._data;
      toast.add({
        description: t("helper.keyGenerateHelp2"),
        icon: "i-lucide-check",
        color: "success",
      });
    }
  } catch (error) {
    console.error("Failed to generate API kEY ", error);
  } finally {
    loader.close();
  }
};
// appUserId and expiresAt are applied together on every write: omitting one clears it.
const buildPayload = (): ApiClientSaveRequest => ({
  apiName: state.value.apiName || "",
  byPass: state.value.byPass === true,
  status: state.value.status !== false,
  appUserId: state.value.appUserId || null,
  // The picker gives a calendar date; the backend field is an Instant.
  expiresAt: state.value.expiresAt ? `${state.value.expiresAt}T23:59:59Z` : null,
});
const onManualSubmit = async () => {
  // A view screen is read-only. useCrudForm.onSubmit guards this, and calling
  // onSubmitProcess directly would bypass the guard task 002 added.
  if (crudAction.value === CrudAction.VIEW) {
    return;
  }
  // copy creates a new record, exactly like new; only edit issues a PUT.
  const isCreate =
    crudAction.value === CrudAction.NEW || crudAction.value === CrudAction.COPY;
  if (isCreate) {
    const response = await onSubmitProcess<ApiClientSaveRequest>(
      buildPayload(),
      "POST",
      "/api/apiClient",
    );
    if (response && response.key && response.id) {
      onReplaceUrl(`/api-client/edit/${response.id}`);
      // Literal, not CrudAction.EDIT: the constant object is not `as const`, so its
      // members widen to string and will not assign to ICrudAction.
      crudAction.value = "edit";
      key.value = response.key;
    }
    return;
  }
  if (!crudId.value) {
    return;
  }
  await onSubmitProcess<ApiClientSaveRequest>(
    buildPayload(),
    "PUT",
    `/api/apiClient/${crudId.value}`,
  );
};
</script>

<template>
  <BaseDashboardPanel
    id="api-client-crud-index"
    :title="$t('model.apiClient.table')"
  >
    <BaseForm
      v-model="state"
      :zod-schema="schema"
      :edit-mode="isEditMode"
      :crud-action="crudAction"
      :loading="loading"
      :crud-name="crudName"
      icon="lucide:form"
      :title="$t('model.apiClient.table')"
      orientation="horizontal"
      class="max-w-[1020px]"
      @on-back="onBack"
      @on-edit-enable="onEnableEditForm"
      @on-submit="onManualSubmit"
      @on-delete="onDelete"
    >
      <template #field-appUserId="{ field }">
        <UFormField
          :orientation="isMobile ? 'vertical' : 'horizontal'"
          :label="field.label"
          name="appUserId"
          :help="$t('helper.apiClient.appUserOptional')"
          class="w-full"
          :ui="{
            labelWrapper: 'w-48 shrink-0',
            container: 'flex-1 w-full'
          }"
        >
          <template v-if="canSelectOwner">
            <UInputMenu
              v-model="state.appUserId"
              :items="appUserOptions"
              value-key="value"
              label-key="label"
              description-key="description"
              :filter-fields="['label', 'description']"
              :placeholder="$t('model.apiClient.appUser')"
              :disabled="loading"
              class="w-full"
              mode="combobox"
            />
            <div
              v-if="appUsersLoading && !appUsersFirstLoaded"
              class="text-sm text-muted mt-2"
            >
              {{ $t('helper.apiClient.appUserLoading') }}
            </div>
            <UEmpty
              v-else-if="appUsersFirstLoaded && appUserOptions.length === 0"
              icon="lucide:user-x"
              :title="$t('helper.apiClient.appUserEmpty')"
              variant="naked"
              class="my-2"
            />
            <BaseLoadmore
              v-else-if="appUsersFirstLoaded"
              :disabled="appUsersExhausted"
              :loading="appUsersLoading"
              :load-mesage="$t('helper.apiClient.appUserLoadMore')"
              :nomore-message="$t('helper.apiClient.appUserNoMore')"
              @on-next="loadMoreAppUsers"
            />
          </template>
          <UAlert
            v-else
            color="warning"
            variant="subtle"
            icon="lucide:shield-alert"
            :description="$t('helper.apiClient.appUserPermissionRequired')"
          />
        </UFormField>
      </template>

      <!-- you can override prepend fields here -->
      <!-- <template #prepend-fields> </template> -->

      <!-- you can override form fields here auto generate slot by field-${z.object.id} -->
      <!--
      <template #field-apiName>
        <UFormField :label="$t('model.apiClient.apiName')" name="apiName" class="w-full">
          Override apiName
        </UFormField>
      </template>
      <template #field-apiToken>
        <UFormField :label="$t('model.apiClient.apiToken')" name="apiToken" class="w-full">
          Override apiToken
        </UFormField>
      </template>
      <template #field-byPass>
        <UFormField :label="$t('model.apiClient.byPass')" name="byPass" class="w-full">
          Override byPass
        </UFormField>
      </template>
      <template #field-status>
        <UFormField :label="$t('model.apiClient.status')" name="status" class="w-full">
          Override status
        </UFormField>
      </template>
      -->
      <div
        v-if="crudAction == 'edit' && key"
        class="border border-default rounded-md m-6"
      >
        <BaseItem
          :separator="false"
          :title="key"
          :description="$t('helper.keyGenerateHelp2')"
        >
          <template #end>
            <UButton
              icon="lucide:copy"
              :label="$t('base.copy')"
              @click="writeToClipboard(key)"
            />
          </template>
        </BaseItem>
      </div>

      <template v-if="crudAction == 'edit' && crudId" #crud-action-end>
        <UButton
          icon="lucide:key-round"
          :label="$t('base.generateApiKey')"
          @click="onGenerateAPIKEY"
        />
      </template>
    </BaseForm>
  </BaseDashboardPanel>
</template>
