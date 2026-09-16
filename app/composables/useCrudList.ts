import { CrudAction, SearchOperationsByLength, SearchParamiter, SearchSeparator } from '~/libs/constants'
import type { ApiResponse, CrudListApiOptions, ICrudAction, ICrudListHeader, ISortModeType } from '~/types/common'

export const useCrudList = <T>(options: CrudListApiOptions) => {
  const { inputSanitizeHtml, getPageQuery, getCurrentPath, appNavigateTo, onReplaceUrl } = useBase()
  const loader = useLoader()
  const { t } = useLang()
  const api = useApi()
  const {
    isInfiniteDisabled,
    firstLoaded,
    loading,
    pages,
    sorts,
    dataList,
    apiEndpoint,
    endpointDelete,
    additionalUri,
    manualActionList,
    advanceSearchUri,
    keywordSearchText,
    queryParam,
    loadData,
    resetData,
    onPageChange: onPageChangeBase,
    onPerPageChange: onPerPageChangeBase,
    onNextPage,
    onReload,
    onSort: onSortBase,
    onSortColumn: onSortColumnBase,
    onSortMode: onSortModeBase,
    getItemById,
    getItemByIndex,
    removeItemById,
    removeItemByIndex
  } = usePagefecth<T>(options)

  const sortTimeout = ref<any>()
  const headers = shallowRef<ICrudListHeader[]>(options.headers || [])
  const crudName = ref(options?.crudName)// PascalCase only eg: User, AppRole

  const deleteApiEndpoint = computed(() =>
    endpointDelete.value
      ? endpointDelete.value
      : crudName.value
        ? `/api/${pascalToCamelCase(crudName.value)}`// springboot: pascalToCamelCase(crudName.value), pascalToKebab(crudName.value)
        : ''
  )

  const searchableHeaders = computed<ICrudListHeader[]>(() => {
    if (!headers.value || headers.value.length === 0) {
      return []
    }
    return headers.value.filter(c => c.options?.searchable === true)
  })
  const pathParam = computed(() => {
    if (!options) {
      return
    }
    return `${getCurrentPath(false)}${queryParam.value ? '?' + queryParam.value : ''}`
  })
  // When no `headers` were supplied the caller declares searchable columns on the table
  // `columns` instead, which this composable never sees - so there is nothing to validate
  // against and dropping the term would discard every restored filter.
  const validateColunmExist = (colnmName: string): boolean =>
    searchableHeaders.value.length === 0
      ? true
      : searchableHeaders.value.find(c => c.column === colnmName) != undefined
  const setQSearch = (q: string, operation: string): string | undefined => {
    const qSplit = q.split(operation)
    if (qSplit.length != 2 || !qSplit[0] || !validateColunmExist(qSplit[0])) {
      return undefined
    }
    return inputSanitizeHtml(q.trim())
  }
  // Values are URL-encoded so that ampersands, spaces and '#' survive transport. The
  // servlet decodes the parameter before ControllerUtil splits it, so ';' ':' '=' arrive
  // intact. Known limit: a value containing a literal ';' still breaks the backend split.
  const buildAdvanceSearchUri = (terms: string[]) =>
    `${SearchParamiter}=${encodeURIComponent(terms.join(SearchSeparator))}`
  const validateQSearch = () => {
    const qParam = getPageQuery<string>(SearchParamiter)
    const qParmArray = qParam?.split(SearchSeparator)
    if (!qParmArray || qParmArray.length == 0) {
      return
    }
    const terms: string[] = []
    for (const q of qParmArray) {
      // Longest operator first, first match wins - see SearchOperationsByLength.
      for (const operation of SearchOperationsByLength) {
        const term = setQSearch(q, operation)
        if (term != undefined) {
          terms.push(term)
          break
        }
      }
    }
    if (terms.length > 0) {
      advanceSearchUri.value = buildAdvanceSearchUri(terms)
    }
  }

  const onPageChange = async (pageNo: number | undefined) => {
    if (pageNo == undefined || !pages.value) {
      return
    }
    await onPageChangeBase(pageNo)
    onPasteUrlPathParam()
  }

  const onPerPageChange = async (no: number | undefined) => {
    if (no == undefined || !pages.value) {
      return
    }
    await onPerPageChangeBase(no)
    onPasteUrlPathParam()
  }

  const onSort = async (column: string, mode: ISortModeType): Promise<void> => {
    if (column == undefined || mode == undefined) {
      return
    }
    await onSortBase(column, mode)
    sortTimeout.value = setTimeout(() => {
      onPasteUrlPathParam()
    }, 150)
  }
  const onSortColumn = async (column: string | undefined): Promise<void> => {
    if (column == undefined) {
      return
    }

    await onSortColumnBase(column)
    sortTimeout.value = setTimeout(() => {
      onPasteUrlPathParam()
    }, 150)
  }

  const onSortMode = async (mode: ISortModeType): Promise<void> => {
    await onSortModeBase(mode)
    sortTimeout.value = setTimeout(() => {
      onPasteUrlPathParam()
    }, 150)
  }

  const onPasteUrlPathParam = async () => {
    if (!pathParam.value) {
      return
    }
    // appNavigateTo(pathParam.value);
    onReplaceUrl(pathParam.value)
    // await loadData();
  }

  const resetToFirstPage = () => {
    if (pages.value) {
      pages.value.current = 1
    }
  }
  const onSearch = async (q: string) => {
    keywordSearchText.value = ''
    advanceSearchUri.value = buildAdvanceSearchUri(q ? q.split(SearchSeparator) : [])
    resetToFirstPage()
    onPasteUrlPathParam()
    await loadData()
  }
  const onKeywordSearch = async (keyword: string) => {
    keywordSearchText.value = inputSanitizeHtml(keyword)
    resetToFirstPage()
    onPasteUrlPathParam()
    await loadData()
  }
  const onItemDelete = async (
    index: number | number[]
  ) => {
    if (!deleteApiEndpoint.value || index == undefined) {
      console.warn('No delete endpoint defined')
      return
    }
    const indexArray = []
    if (!Array.isArray(index)) {
      indexArray.push(index)
    } else {
      indexArray.push(...index)
    }
    indexArray.sort((a, b) => b - a)
    loader.open()
    for (const i of indexArray) {
      const item: any = getItemByIndex(i)
      if (item && item.id) {
        const status = await deleteProcess(item.id)
        if (status === 200) {
          dataList.value.splice(i, 1)
        }
      }
    }
    loader.close()
  }

  const deleteProcess = async (id: string): Promise<number> => {
    if (!deleteApiEndpoint.value) {
      return 400
    }
    try {
      const response = await api.raw<ApiResponse<void>>(`${deleteApiEndpoint.value}/${id}`, {
        method: 'DELETE'
      })
      return response.status
    } catch (error) {
      console.error('An error occurred while delete data.:', error)
      return 400
    }
  }

  const onNewForm = () => {
    if (options?.pathNew) {
      appNavigateTo(options.pathNew)
    } else if (crudName.value) {
      appNavigateTo(`/${pascalToKebab(crudName.value)}/${CrudAction.NEW}/0`)
    }
  }
  const onItemClick = async (index: number, type: ICrudAction) => {
    const item: any = await getItemByIndex(index)
    if (!item) {
      return
    }
    if (options?.pathView) {
      appNavigateTo(`${options.pathView}/${item.id}`)
    } else if (crudName.value) {
      appNavigateTo(`/${pascalToKebab(crudName.value)}/${type == 'view' ? CrudAction.VIEW : CrudAction.EDIT}/${item.id}`)
    }
  }
  const onItemCopy = async (index: number) => {
    const item: any = await getItemByIndex(index)
    if (!item) {
      return
    }
    if (options?.pathCopy) {
      appNavigateTo(`${options.pathCopy}/${item.id}`)
    } else if (crudName.value) {
      appNavigateTo(
        `/${pascalToKebab(crudName.value)}/${CrudAction.COPY}/${item.id}`
      )
    }
  }

  // Init and auto load
  validateQSearch()
  if (options?.fetchListOnload == undefined || options.fetchListOnload === true) {
    loadData()
  }
  onBeforeUnmount(() => {
    dataList.value = []
    advanceSearchUri.value = ''
    keywordSearchText.value = ''
    manualActionList.value = undefined
    additionalUri.value = undefined
    apiEndpoint.value = undefined
    endpointDelete.value = undefined
    crudName.value = undefined
    if (sortTimeout.value) {
      clearTimeout(sortTimeout.value)
      sortTimeout.value = null
    }
  })
  return {
    isInfiniteDisabled,
    firstLoaded,
    loading,
    pages,
    sorts,
    dataList,
    apiEndpoint,
    endpointDelete,
    additionalUri,
    manualActionList,
    advanceSearchUri,
    keywordSearchText,
    queryParam,
    crudName,
    headers,
    loadData,
    resetData,
    onPageChange,
    onPerPageChange,
    onNextPage,
    onReload,
    onSort,
    onSortColumn,
    onSortMode,
    getItemById,
    getItemByIndex,
    removeItemById,
    removeItemByIndex,
    onSearch,
    onKeywordSearch,
    onNewForm,
    onItemDelete,
    onItemClick,
    onItemCopy
  }
}
