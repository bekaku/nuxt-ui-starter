import { BackendRootPath, CrudAction, PageActionParamiter, PageIdParamiter } from "~/libs/constants";
import type { CrudFormApiOptions, ICrudAction, IMethod, RequestDto, } from "~/types/common"

export const useCrudForm = <T>(options: CrudFormApiOptions, entity: Ref<Partial<any>>) => {
  const { appNavigateTo, getParam, getPreviousPath, appThrowError } = useBase();
  const confirm = useConfirmDialog();
  const loader = useLoader();
  const { t } = useLang();
  const toast = import.meta.client ? useToast() : null
  const api = useApi();
  const previousPath = ref(getPreviousPath() as string);
  const loading = ref(false);
  const crudId = ref<number | undefined>(getParam<number>(PageIdParamiter));
  const requestEntityName = ref<string | undefined>(options?.requestEntityName ? options.requestEntityName : undefined);
  const crudAction = ref<ICrudAction | undefined>(getParam<ICrudAction>(PageActionParamiter));
  const fetchDataLink = ref(options.fetchDataLink);
  const firstLoaded = ref(false);
  const requireActions: ICrudAction[] = ['copy', 'edit', 'new', 'view'];


  const preValidate = () => {
    let isValid = true;
    if (crudId.value === undefined || !crudAction.value || crudAction.value == undefined) {
      isValid = false;
    }
    if (crudAction.value == undefined || !requireActions.includes(crudAction.value)) {
      isValid = false;
    }

    if (isValid) {
      return true;
    }
    return appThrowError({
      statusCode: 400,
      statusMessage: "Bad Request: action allow only ('copy', 'edit', 'new', 'view')"
    })
  }
  const isEditMode = computed<boolean>(() => crudAction.value !== 'view');
  const onEnableEditForm = () => {
    crudAction.value = 'edit';
  }
  const apiEnpoint = computed(() => {
    //springboot: pascalToCamelCase(crudName.value), pascalToKebab(crudName.value)
    if (crudAction.value === CrudAction.EDIT) {
      return options.actionPut
        ? options.actionPut
        : options.crudName ? `${options.apiEndpoint || '/api'}/${pascalToCamelCase(options.crudName)}${(options.methodPutIncludeId === undefined || options.methodPutIncludeId === true ? '/' + entity.value.id : '')}` : '';
    }
    return options.actionPost
      ? options.actionPost
      : options.crudName ? `${options.apiEndpoint || '/api'}/${pascalToCamelCase(options.crudName)}` : '';
  });

  const deleteApiEndpoint = computed(() => {
    return options.actionDelete
      ? options.actionDelete
      : options.crudName
        ? `${options.apiEndpoint || '/api'}/${pascalToCamelCase(options.crudName)}/${crudId.value
        }`
        : '';
  });
  const getFetchDataLink = computed(() => {
    if (fetchDataLink.value) {
      return fetchDataLink.value;
    }
    if (!crudId.value) {
      return;
    }
    return `${options.apiEndpoint || '/api'}/${pascalToCamelCase(options.crudName ? options.crudName : '')}/${crudId.value}`;
  });
  const fetchDataById = async (): Promise<T | null> => {
    if (!getFetchDataLink.value) {
      return null
    }
    loading.value = true;
    try {
      const response = await api.raw<T>(getFetchDataLink.value, {
        method: "GET",
      });
      loading.value = false;
      if (response.status == 200 && response._data) {
        entity.value = response._data;
        // Object.assign(entity, response.data);
      }
      return response._data || null;
    } catch (error: any) {
      console.error('useCrudForm>fetchDataById', error);
    } finally {
      if (!firstLoaded.value) {
        firstLoaded.value = true;
      }
      loading.value = false;
    }

    return null
  };

  const preFectData = async (): Promise<void> => {
    if (
      crudAction.value == CrudAction.VIEW || crudAction.value == CrudAction.COPY || crudAction.value == CrudAction.EDIT
    ) {
      await fetchDataById();
      if (crudAction.value == CrudAction.COPY) {
        entity.value.id = null;
      }
    }
  };
  const resetEntity = () => {
    for (const key in entity.value) {
      delete entity.value[key];
    }
  };
  const onBack = () => {
    let backLink: string | undefined = '';
    if (options.backToPreviousPath != undefined && options.backToPreviousPath) {
      backLink = previousPath.value;
    }
    const basePath = options.basePath || BackendRootPath;
    if (!backLink) {
      backLink = options.backLink
        ? options.backLink
        : previousPath.value ? previousPath.value
          : options.crudName
            ? `${basePath ? '/' + basePath : ''}/${pascalToKebab(options.crudName)}`
            : '';
    }
    if (backLink) {
      appNavigateTo(backLink);
    }
  };
  const onSubmit = async (): Promise<void> => {

    if (!entity.value || !apiEnpoint.value) {
      return
    }
    await onSubmitProcess<T>(
      entity.value,
      (crudAction.value === CrudAction.VIEW || crudAction.value === CrudAction.EDIT) ? (options.methodPut || 'PUT') : 'POST',
      apiEnpoint.value
    )
  }
  const onSubmitProcess = async <E>(
    data: any,
    methodType: IMethod,
    enpoint: string,
    jsonRootName: string | undefined = undefined,
  ): Promise<void> => {


    if (import.meta.dev) {
      console.log(
        'useCrudFrom > onSubmit',
        {
          enpoint,
          methodType,
          data
        }
      );
    }
    if (!enpoint) {
      return
    }
    if (!apiEnpoint.value) {
      return
    }
    // const requestItem: { [k: string]: T } = {};
    // const requestItem: RequestDto = {};
    // requestItem[requestEntityName.value
    //     ? requestEntityName.value : `${pascalToCamelCase(options.crudName)}`] = crudEntity.value;

    // requestItem.data = crudEntity.value;
    // requestItem[jsonRootName || 'data'] = data

    loading.value = true;
    try {
      const response = await api.raw<T>(enpoint, {
        method: methodType,
        body: data
      });

      if (response.status != 200 && response.status != 201) {
        return
      }
      if (response && (response.status == 200 || response.status == 201)) {
        if (
          crudAction.value === CrudAction.NEW ||
          crudAction.value === CrudAction.COPY
        ) {
          showToast({
            message: t('success.insertSuccesfull'),
            status: response.status
          });


        } else if (crudAction.value === CrudAction.EDIT) {
          showToast({
            message: t('success.updateSuccesfull'),
            status: response.status
          });
        }
      }

      if (!options.preventRedirectToList) {
        onBack();
      }
    } catch (error: any) {
      console.error('useCrudForm>onSubmit', error);
      // if (error.message) {
      //   showToast({
      //     message: error.message,
      //     status: 500
      //   });
      // }
    } finally {
      loading.value = false;
    }
  };

  const onDelete = async () => {
    console.log('onDelete');
    if (crudAction.value !== CrudAction.EDIT && crudAction.value !== CrudAction.VIEW) {
      return;
    }

    if (!entity.value || !crudId.value || !deleteApiEndpoint.value) {
      console.warn("Cannot delete: Missing required data (entity, id, or endpoint)");
      return;
    }
    loading.value = true;
    try {
      const response = await api<void>(deleteApiEndpoint.value, {
        method: "DELETE",
      });
      if (import.meta.dev) {
        console.log('useCrudFrom > onDelete', deleteApiEndpoint.value, response);
      }
      onBack();
    } catch (error: any) {
      console.error('useCrudForm>onDelete', error);
      if (error.message) {

        showToast({
          message: error.message,
          status: 500
        });
      }
    } finally {
      loading.value = false;
    }
  };

  const showToast = (options: { message: string; status: number }) => {
    if (toast) {
      toast.add({
        description: options.message,
        icon: options.status < 400 ? 'lucide:circle-check' : 'i-lucide-alert-circle',
        color: options.status < 400 ? 'success' : 'error',
      })
    }
  };


  if (options?.preValidate === undefined || options?.preValidate) {
    preValidate();
  }
  if (options?.fectchDataOnLoad === undefined || options?.fectchDataOnLoad) {
    preFectData();
  }
  onBeforeUnmount(() => {
    resetEntity();
  });
  const methods = { onBack, onSubmit, onSubmitProcess, onDelete, fetchDataById, preFectData, onEnableEditForm };
  return {
    loading,
    ...methods,
    crudId,
    crudAction,
    crudName: options.crudName,
    requestEntityName,
    fetchDataLink,
    firstLoaded,
    isEditMode,
  };

}
