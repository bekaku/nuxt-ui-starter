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
    '@nuxt/eslint',
    '@nuxt/ui',
    '@vueuse/nuxt',
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
        'browser-image-compression',
        'clsx',
        'date-fns',
        'date-fns/locale',
        'isomorphic-dompurify',
        'jszip',
        'tailwind-merge',
        'vue3-apexcharts',
        'zod',
        '@tato30/vue-pdf',
        'pdf-lib',
        'plyr'
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
  i18n: {
    strategy: 'no_prefix',
    locales: [
      {
        code: 'en',
        iso: 'en',
        // file: 'en/index.ts',
        // file: 'en.json',
        files: getFileList('en'),
      },
      {
        code: 'th',
        iso: 'th',
        // file: 'th.json',
        // file: 'th/index.ts',
        files: getFileList('th'),
      },
    ],
    langDir: 'locales',
    defaultLocale: 'th',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'locale',
      fallbackLocale: 'th',
    },
  },
  // i18n: {
  //   locales: [
  //     { code: 'en', language: 'en-US', file: 'en.json', name: 'English' },
  //     { code: 'ja', language: 'ja-JP', file: 'ja.json', name: 'Japanese' }
  //   ],
  //   defaultLocale: 'en'
  // },
  compatibilityDate: '2025-07-15',
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
        name: 'NotoSansThaiLooped',
        src: '/fonts/NotoSansThaiLooped-Light.ttf',
        weight: 300,
        global: true
      },
      {
        name: 'NotoSansThaiLooped',
        src: '/fonts/NotoSansThaiLooped-Regular.ttf',
        weight: 400,
        global: true
      },
      {
        name: 'NotoSansThaiLooped',
        src: '/fonts/NotoSansThaiLooped-Medium.ttf',
        weight: 500,
        global: true
      },
      {
        name: 'GoogleSans',
        src: '/fonts/GoogleSans-Regular.ttf',
        weight: 400,
        global: true
      },
      {
        name: 'GoogleSans',
        src: '/fonts/GoogleSans-Medium.ttf',
        weight: 500,
        global: true
      },
      {
        name: 'GoogleSans',
        src: '/fonts/GoogleSans-Bold.ttf',
        weight: 700,
        global: true
      },
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
      jwtKeyName: '_session_',
      refreshJwtKeyName: '_slid_',
      currentUserKeyName: '_sid',
      jwtAges: 7,//days
      jwtAgesSecond: 604800,//7 days = 7 * 24 * 60 * 60 = 604800 seconds
      limitFileUploadSize: 52428800,//byte LimitFileSizeMB * 1024 * 1024;
      maxImageToResize: 1776,
      maxImageToResizeMb: 10,
      defaultMaxItemsPerPage: 50,
      defultItemsPerPage: 10,
      acceptFiles: [
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/pdf',
        'application/vnd.rar',
        'application/zip',
        'application/x-zip-compressed',
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'text/plain',
        'text/csv',
        'video/mpeg',
        'video/mp4',
        'video/quicktime',
        'video/x-msvideo',
        'video/webm',
        'audio/mpeg',
        'audio/wav',
        'audio/ogg',
        'audio/flac',
        'audio/mp4'
      ]
    }
  },
  routeRules: {
    '/api/**': {
      cors: true
    }
  },
  experimental: { nitroAutoImports: true },
  devServer: {
    port: 3003
  },
  imports: {
    dirs: [
      'api',
    ]
  },
  // future: {
  //   compatibilityVersion: 5
  // },
})
