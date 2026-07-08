// https://nuxt.com/docs/api/configuration/nuxt-config

const fileLangNames = [
  'app',
  'base',
  'helper',
  'model',
  'error',
]

function getFileList(locale: string) {
  return fileLangNames.map(name => `${locale}/${name}.json`)
}

export default defineNuxtConfig({
  modules: [
    '@pinia/nuxt',
    '@nuxt/eslint',
    '@nuxt/ui',
    '@vueuse/nuxt',
    '@pinia/nuxt',
    '@nuxtjs/i18n',
    '@nuxt/icon',
    '@nuxtjs/device',
    '@nuxt/image'
  ],

  devtools: {
    enabled: false
  },
  ssr: true,
  vite: {
    optimizeDeps: {
      include: [
        '@capacitor/device',
        '@internationalized/date',
        '@tanstack/table-core',
        '@unovis/vue',
        'date-fns',
        'date-fns/locale',
        'zod',
        'dompurify',
      ]
    }
  },
  css: ['~/assets/css/main.css'],
  // appConfig: {
  //   ui: {
  //     colors: {
  //       primary: 'blue',
  //       neutral: 'zinc'
  //     },
  //   }
  // },
  // ui: {
  //   theme: {
  //     colors: [
  //       'primary',
  //       'secondary',
  //       'tertiary',
  //       'info',
  //       'success',
  //       'warning',
  //       'error',
  //       'red',
  //     ]
  //   }
  // },
  routeRules: {
    '/api/**': {
      cors: true
    }
  },
  experimental: { nitroAutoImports: true },
  devServer: {
    port: 3005
  },
  imports: {
    dirs: [
      'api',
    ]
  },
  future: {
    compatibilityVersion: 5
  },
  i18n: {
    strategy: 'no_prefix',
    locales: [
      {
        code: 'en',
        iso: 'en',
        // file: 'en/index.ts',
        files: getFileList('en'),
      },
      {
        code: 'th',
        iso: 'th',
        // file: 'th/index.ts',
        files: getFileList('th'),
      },
    ],
    // vueI18n: 'i18n.config.ts',
    // lazy: true,
    langDir: 'locales',
    defaultLocale: 'th',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'locale',
      fallbackLocale: 'th',
    },
  },
  compatibilityDate: '2024-07-11',
  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },
  image: {
    presets: {
      avatar: {
        modifiers: {
          format: 'jpg',
          width: 50,
          height: 50
        }
      }
    }
  },
  fonts: {
    families: [
      // { name: 'Kanit', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], global: true },
      {
        name: 'Kanit',
        src: '/fonts/Kanit-Regular.ttf',
        weight: 400,
        global: true
      },
      {
        name: 'Kanit',
        src: '/fonts/Kanit-Bold.ttf',
        weight: 700,
        global: true
      },
      {
        name: 'Prompt',
        src: '/fonts/Prompt-Regular.ttf',
        weight: 400,
        global: true
      },
      {
        name: 'Prompt',
        src: '/fonts/Prompt-Bold.ttf',
        weight: 700,
        global: true
      }
    ],
  },
  runtimeConfig: {
    // The private keys which are only available within server-side
    apiSecret: '123',// can be overridden by NUXT_API_SECRET environment variable
    // Keys within public, will be also exposed to the client-side
    public: {
      apiDomain: 'localhost',//override by NUXT_PUBLIC_API_BASE in .env
      apiBase: '/api',//override by NUXT_PUBLIC_API_BASE in .env
      cdnBase: '/api',
      apiClient: '',
      timeOut: 0,
      appVersion: '',
      codeVersion: 0,
      webUrl: '',
      defaultLocale: 'th',
      jwtKeyName: '_token',
      refreshJwtKeyName: '_refresh_token',
      currentUserKeyName: '_current_user',
      jwtAges: 7,//days
      jwtAgesSecond: 604800,//7 days = 7 * 24 * 60 * 60 = 604800 seconds
    }
  },
})
