import type { AppNavigationMenuItem } from "~/types/common";
import type { FavoriteMenu } from "~/types/models";

export const useMenu = () => {

  // const { t } = useLang();
  const nuxtApp = useNuxtApp();
  const t = nuxtApp.$i18n.t;
  const { hasPermissionLazy } = useRbac();
  const appStore = useAppStore();
  const { setAppNavigations } = appStore;
  const { favoriteMenus, appNavigations } = storeToRefs(appStore)
  const appNavs: AppNavigationMenuItem[][] = [
    [
      {
        label: t("nav.dashboard"),
        icon: "lucide:home",
        to: "/",
        permissions: ['login'],
      },
      {
        label: t("nav.developers"),
        icon: "lucide:file-code",
        slot: 'developer-label' as const,
        defaultOpen: true,
        children: [
          {
            label: t("model_permission"),
            icon: "lucide:lock-keyhole",
            to: "/permission",
            permissions: ['permission_list'],
          },
        ]
      },
      {
        label: t("nav.forAdmin"),
        icon: "lucide:folder-cog",
        slot: 'admin-label' as const,
        defaultOpen: true,
        children: [
          {
            label: t("nav.userRole"),
            icon: "lucide:users",
            to: "/app-role",
            permissions: ['app_role_list'],
          },
          {
            label: t("nav.appUser"),
            icon: "lucide:user",
            to: "/app-user",
            permissions: ['app_user_list'],
          },
        ]
      },
      {
        label: t("nav.more"),
        icon: 'lucide:more-horizontal',
        slot: 'more-label' as const,
        defaultOpen: true,
        children: [
          {
            label: t("drive.title"),
            icon: "lucide:folder",
            to: "/my-drive/folder/0",
            permissions: ['file_manager_manage'],
          },
        ]
      },
    ],
    [
      {
        label: "Settings",
        to: "/settings",
        icon: "i-lucide-settings",
        defaultOpen: true,
        type: "trigger",
        slot: 'settings-label' as const,
        children: [
          {
            label: "General",
            to: "/settings",
            exact: true,
          },
          {
            label: "Members",
            to: "/settings/members",
          },
          {
            label: "Notifications",
            to: "/settings/notifications",
          },
          {
            label: "Security",
            to: "/settings/security",
          },
        ],
      },
      {
        label: 'Example',
        icon: 'lucide:file',
        defaultOpen: true,
        slot: 'example-label' as const,
        children: [
          {
            label: "Modal",
            icon: 'lucide:copy',
            to: "/example/modal",
          },
          {
            label: "Customers",
            icon: "i-lucide-users",
            to: "/example/customers",
          },
          {
            label: "Inbox",
            icon: "i-lucide-inbox",
            to: "/example/inbox",
            badge: "4",
          },
        ]
      },
      {
        label: "Test Page",
        icon: "lucide:bug",
        to: "/test",
      },
    ]
  ];

  const isPermitted = async (permissions?: string[]): Promise<boolean> => {
    // ถ้าไม่ได้ระบุ permissions ถือว่าผ่าน (ปรับเป็น false ได้ถ้าต้องการให้ default เป็นห้ามเข้า)
    if (!permissions || permissions.length === 0) return true;

    // สมมติว่า hasPermissionLazy เดิมรับ object หน้าตา { permissions: string[] }
    // คุณอาจจะต้องปรับให้ตรงกับ parameter จริงของ hasPermissionLazy ในระบบของคุณ
    return await hasPermissionLazy({ permissions });
  }
  const getFavoriteNavigations = computed<AppNavigationMenuItem[][]>(() => {
    const items: AppNavigationMenuItem[] = [];

    for (const menu of favoriteMenus.value) {
      // ค้นหาเมนูจาก drawers (สมมติว่า drawers เป็น reactive state อย่าลืม .value ถ้าจำเป็นนะครับ)
      const result = findByUrl(appNavigations.value as AppNavigationMenuItem[][], menu.url);
      if (result) {
        // แนะนำให้ Clone object ป้องกัน reference ตีกันกับเมนูหลัก
        items.push({ ...result });
      }
    }

    if (items.length > 0) {
      return [
        [
          {
            label: t('base.faveoriteMenuTitle'), // ถ้าใช้ i18n อย่าลืมครอบ t('...') นะครับ
            // ปรับ format ไอคอนให้ตรงกับของใหม่ที่เป็น string (หรือจะใช้ object แบบเดิมถ้า components รองรับ)
            icon: 'lucide:star',
            slot: 'favorite-label' as const,
            defaultOpen: false,
            badge: items.length,
            children: items

          }
        ]
      ];
    }

    return []; // ถ้าไม่มี favorite ให้ return array ว่าง
  });
  const filterNavItems = async (items: AppNavigationMenuItem[]): Promise<AppNavigationMenuItem[]> => {
    const filteredItems: AppNavigationMenuItem[] = [];

    for (const item of items) {
      // Clone object เพื่อป้องกันไม่ให้ไปแก้ไขข้อมูลต้นฉบับ (appNavs) โดยตรง
      const newItem = { ...item };

      // 1. ตรวจสอบสิทธิ์ของเมนูระดับนี้
      const hasAccess = await isPermitted(newItem.permissions);
      if (!hasAccess) continue; // ถ้าไม่มีสิทธิ์ให้ข้ามเมนูนี้ไปเลย

      // 2. ถ้ามี children ให้ไปกรอง children ต่อด้วยฟังก์ชันตัวเอง (Recursive)
      if (newItem.children) {
        newItem.children = await filterNavItems(newItem.children);

        // 3. กฎเหล็ก: ถ้าเดิมมี children แต่พอกรองสิทธิ์แล้วไม่เหลือเลย ไม่ต้องแสดง Parent
        if (newItem.children.length === 0) {
          continue;
        }
      }

      // ถ้ารอดเงื่อนไขทั้งหมดมาได้ แปลว่าแสดงผลได้
      filteredItems.push(newItem);
    }

    return filteredItems;
  }
  const initialAppNav = async (): Promise<boolean> => {
    const aclFinal: AppNavigationMenuItem[][] = [];

    // Loop จัดการแต่ละกลุ่มเมนู (เนื่องจากข้อมูลใหม่เป็น Array 2 มิติ)
    for (const navGroup of appNavs) {
      // นำกลุ่มเมนูไปกรองสิทธิ์
      const filteredGroup = await filterNavItems(navGroup);

      // ถ้าในกลุ่มนั้นยังมีเมนูเหลืออยู่ (หลังจากโดนตัดตัวที่ไม่มีสิทธิ์ออกไป) ค่อยนำไปใช้งาน
      if (filteredGroup.length > 0) {
        aclFinal.push(filteredGroup);
      }
    }

    if (aclFinal.length > 0) {
      setAppNavigations(aclFinal); // ส่งข้อมูลที่ผ่านการกรองแล้วไป render
    }
    return true;
  }

  const isFaveroteExist = (url: string) => {
    return favoriteMenus.value.some((item: FavoriteMenu) => item.url === url);
  }
  const getFaveroteIndex = (url: string) => {
    return favoriteMenus.value.findIndex((item: FavoriteMenu) => item.url === url);
  }
  const findByUrl = (groups: AppNavigationMenuItem[][], to: string): AppNavigationMenuItem | null => {
    // สร้างฟังก์ชันย่อยสำหรับค้นหาแบบ Recursive (1 มิติ)
    const searchRecursive = (items: AppNavigationMenuItem[]): AppNavigationMenuItem | null => {
      for (const item of items) {
        if (item.to === to) return item;
        if (item.children) {
          const found = searchRecursive(item.children);
          if (found) return found;
        }
      }
      return null;
    };

    // ค้นหาในแต่ละกลุ่ม (Group) ของ Array 2 มิติ
    for (const group of groups) {
      const found = searchRecursive(group);
      if (found) return found;
    }

    return null;
  }
  return {
    appNavs,
    initialAppNav,
    isFaveroteExist,
    getFaveroteIndex,
    findByUrl,
    getFavoriteNavigations
  }

}
