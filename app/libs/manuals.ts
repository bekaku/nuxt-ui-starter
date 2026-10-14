export interface ManualItem {
  slug: string
  icon: string
  titleTh: string
  titleEn: string
  descTh: string
  descEn: string
}

export interface ManualCategory {
  key: string
  titleTh: string
  titleEn: string
  items: ManualItem[]
}

export const manualCategories: ManualCategory[] = [
  {
    key: 'admin-console',
    titleTh: 'การใช้งาน Admin console',
    titleEn: 'Using Admin console',
    items: [
      {
        slug: 'admin-getting-started',
        icon: 'lucide:rocket',
        titleTh: 'เริ่มต้นใช้งานหน้า admin',
        titleEn: 'Getting started with admin',
        descTh: 'เข้าสู่ระบบ สิงหาศผ่าน เมนูและการค้นหา เมนูโปรด การสลับบัญชี และการตั้งค่าส่วนตัว',
        descEn: 'Sign in, navigation, search, favorites, account switching and personal settings'
      },
      {
        slug: 'users-roles-permissions',
        icon: 'lucide:users',
        titleTh: 'ผู้ใช้ กลุ่มผู้ใช้งาน และสิทธิ์',
        titleEn: 'Users, roles and permissions',
        descTh: 'เพิ่มผู้ใช้ สร้างกลุ่มและกำหนดสิทธิ์ และออกคีย์ Api client ให้ระบบอื่น',
        descEn: 'Add users, create groups, assign permissions and issue API client keys'
      },
      {
        slug: 'ai-knowledge-base',
        icon: 'lucide:brain-circuit',
        titleTh: 'คลังความรู้ AI และแชท',
        titleEn: 'AI knowledge base and chat',
        descTh: 'upload และลบเอกสารกลาง ถามและแนะนำหน้าแชท คำถามที่ไม่มีคำตอบ และแชททดสอบ',
        descEn: 'Upload and manage central docs, chat guidance, unanswered questions and test chat'
      }
    ]
  },
  {
    key: 'vm-client',
    titleTh: 'การเชื่อมต่อ VM client',
    titleEn: 'VM client integration',
    items: [
      {
        slug: 'vm-integration',
        icon: 'lucide:server',
        titleTh: 'คู่มือเชื่อมต่อสำหรับ VM ของวิทยาลัย',
        titleEn: 'VM integration guide for colleges',
        descTh: 'สำหรับนักพัฒนาฝั่ง VM: ยืนยันตัวตน ส่งเอกสาร ชิงก้ออาจารย์ที่ปรึกษา และเรียกแชท บทวิเคราะห์ ผลทำนายแทนผู้ใช้',
        descEn: 'For VM developers: identity, documents, advisor data and per-user analysis calls'
      },
      {
        slug: 'vm-person-context',
        icon: 'lucide:file-signature',
        titleTh: 'การลงลายเซ็น person context',
        titleEn: 'Signing the person context',
        descTh: 'สำหรับนักพัฒนาฝั่ง VM: สร้าง header X-Person-* และลายเซ็น HMAC เมื่อเรียกแทนผู้ใช้ปลายทาง',
        descEn: 'For VM developers: build X-Person-* headers and HMAC signatures for end users'
      }
    ]
  },
  {
    key: 'llm-gateway',
    titleTh: 'External LLM Gateway',
    titleEn: 'External LLM Gateway',
    items: [
      {
        slug: 'llm-gateway-keys',
        icon: 'lucide:key-round',
        titleTh: 'จัดการคีย์ LLM Gateway',
        titleEn: 'Manage LLM Gateway keys',
        descTh: 'สำหรับผู้ดูแลระบบ: ออก แก้ไข rotate ปิดใช้งานคีย์ และการดูการใช้งาน',
        descEn: 'For admins: issue, edit, rotate, disable keys and monitor usage'
      },
      {
        slug: 'llm-gateway-integration',
        icon: 'lucide:plug',
        titleTh: 'คู่มือเชื่อมต่อ LLM Gateway',
        titleEn: 'LLM Gateway integration guide',
        descTh: 'สำหรับนักพัฒนาระบบอื่น: เรียก /v1/models, chat completions และ embeddings แบบ OpenAI',
        descEn: 'For external developers: call /v1/models, chat completions and embeddings the OpenAI way'
      },
      {
        slug: 'llm-playground',
        icon: 'lucide:messages-square',
        titleTh: 'ใช้งาน LLM Playground',
        titleEn: 'Using the LLM Playground',
        descTh: 'สำหรับผู้ทดลองโมเดล: แชทกับโมเดลของ gateway เลือกโมเดล แบบรูป เปิด/ปิดการคิด และแก้ปัญหา',
        descEn: 'For model testers: chat with gateway models, pick models, toggle thinking and debug'
      }
    ]
  },
  {
    key: 'backend-ops',
    titleTh: 'Backend และการดูแลระบบ',
    titleEn: 'Backend and operations',
    items: [
      {
        slug: 'server-operations',
        icon: 'lucide:server-cog',
        titleTh: 'คู่มือติดตั้งและดูแลระบบ',
        titleEn: 'Install and operations guide',
        descTh: 'สำหรับทีมดูแล server: ส่วนประกอบ การติดตั้ง ค่าที่ต้องตั้ง การอัปเดต และย้อนเวอร์ชัน การรับมือการแจ้งเตือน และปัญหาที่พบบ่อย',
        descEn: 'For server teams: components, install, config, updates, rollbacks, alerts and common issues'
      },
      {
        slug: 'api-overview',
        icon: 'lucide:braces',
        titleTh: 'ภาพรวม API สำหรับนักพัฒนา',
        titleEn: 'API overview for developers',
        descTh: 'กลุ่มของ API การยืนยันตัวตน สิทธิ์ รูปแบบ response และ error, id, การแบ่งหน้า และ streaming',
        descEn: 'API groups, auth, permissions, response and error shapes, ids, pagination and streaming'
      },
      {
        slug: 'executive-overview',
        icon: 'lucide:monitor',
        titleTh: 'ภาพรวมระบบสำหรับผู้บริหาร',
        titleEn: 'System overview for executives',
        descTh: 'ระบบช่วยอะไร ใครใช้งาน การปกป้องข้อมูลนักเรียน การทำนายความเสี่ยง ออกกลางคืน และข้อจำกัดปัจจุบัน แบบไม่ใช่ศัพท์เทคนิค',
        descEn: 'What the system does, who uses it, student data protection, risk forecasting and limits in plain terms'
      }
    ]
  }
]

export const manualFlatList: ManualItem[] = manualCategories.flatMap(c => c.items)

export const findManual = (slug: string): ManualItem | undefined => {
  return manualFlatList.find(item => item.slug === slug)
}

export const findManualCategory = (slug: string): ManualCategory | undefined => {
  return manualCategories.find(c => c.items.some(item => item.slug === slug))
}

export const getPrevNextManual = (slug: string): { prev?: ManualItem, next?: ManualItem } => {
  const idx = manualFlatList.findIndex(item => item.slug === slug)
  if (idx < 0) return {}
  return {
    prev: idx > 0 ? manualFlatList[idx - 1] : undefined,
    next: idx < manualFlatList.length - 1 ? manualFlatList[idx + 1] : undefined
  }
}
