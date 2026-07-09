export default defineAppConfig({
  ui: {
    colors: {
      primary: 'blue',
      neutral: 'neutral',
      info: 'sky',
      secondary: 'slate',
      success: 'emerald',
      warning: 'amber',
      error: 'rose'
    },
    card: {
      slots: {
        root: 'overflow-visible',
        header: 'p-4 sm:px-4',
        body: 'p-2! sm:p-2!',
      }
    },
    prose: {
      icon: {
        base: 'size-4 shrink-0 align-sub'
      }
    }
  }
})
