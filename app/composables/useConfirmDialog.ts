import { LazyBaseConfirmDialog } from '#components'
import type { ButtonProps } from '@nuxt/ui';

/*
const confirm = useConfirmDialog();
  const conf = await confirm({
    title: t("base.deleteCountConfirm", { count: 1 }),
    description: t("base.deleteConfirmHelp"),
    confirmButton: {
      label: t("base.delete"),
      color: "error",
      icon: "lucide:trash",
    },
  });
*/
export interface ConfirmDialogOptions {
  title: string
  description?: string
  confirmButton?: ButtonProps;
  cancelButton?: ButtonProps;
}

export const useConfirmDialog = () => {
  const overlay = useOverlay()

  return (options: ConfirmDialogOptions): Promise<boolean> => {
    const modal = overlay.create(LazyBaseConfirmDialog, {
      destroyOnClose: true,
      props: options
    })

    return modal.open()
  }
}
