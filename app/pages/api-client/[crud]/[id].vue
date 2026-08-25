<script setup lang="ts">
import z from "zod";
import type { ApiClient } from "~/types/models";
definePageMeta({
  pageName: "model.apiClient.table",
  requiresPermission: ["api_client_view", "api_client_add", "api_client_edit"],
});
const { t } = useLang();
const api = useApi();
const toast = useToast();
const key = ref();
const { writeToClipboard } = useBase();
const confirm = useConfirmDialog();
const loader = useLoader();
const schema = z.object({
  apiName: z
    .string()
    .min(1, t("error.validateRequireField"))
    .describe(
      uiConfig({
        label: t("model.apiClient.apiName"),
        ui: {
          type: "text",
          required: true,
          clearable: true,
          maxlength: 100,
        },
      }),
    ),
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
  onSubmit,
  crudId,
} = useCrudForm<ApiClient>(
  {
    crudName: "ApiClient",
    preventRedirectToList: true,
  },
  state,
);
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
  }finally{
    loader.close();
  }
};
</script>
<template>
  <BaseDashboardPanel
    id="api-client-crud-index"
    :title="$t('model.apiClient.table')"
  >
    <BaseForm
      :zod-schema="schema"
      v-model="state"
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
      @on-submit="onSubmit"
      @on-delete="onDelete"
    >
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
      <div v-if="crudAction == 'edit' && key" class="border border-default rounded-md m-6">
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
