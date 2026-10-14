export interface LocalizedText {
  th: string
  en: string
  [locale: string]: string
}

export interface ManualItem {
  slug: string
  icon: string
  title: LocalizedText
  desc: LocalizedText
}

export interface ManualCategory {
  key: string
  title: LocalizedText
  items: ManualItem[]
}

export const pickManualText = (text: LocalizedText, locale: string): string => {
  return text[locale] || text.th
}

export const manualCategories: ManualCategory[] = [
  {
    key: 'admin-console',
    title: { th: 'การใช้งาน Admin console', en: 'Using Admin console' },
    items: [
      {
        slug: 'admin-getting-started',
        icon: 'lucide:rocket',
        title: { th: 'เริ่มต้นใช้งานหน้า admin', en: 'Getting started with admin' },
        desc: {
          th: 'เข้าสู่ระบบ สิงหาศผ่าน เมนูและการค้นหา เมนูโปรด การสลับบัญชี และการตั้งค่าส่วนตัว',
          en: 'Sign in, navigation, search, favorites, account switching and personal settings'
        }
      },
      {
        slug: 'users-roles-permissions',
        icon: 'lucide:users',
        title: { th: 'ผู้ใช้ กลุ่มผู้ใช้งาน และสิทธิ์', en: 'Users, roles and permissions' },
        desc: {
          th: 'เพิ่มผู้ใช้ สร้างกลุ่มและกำหนดสิทธิ์ และออกคีย์ Api client ให้ระบบอื่น',
          en: 'Add users, create groups, assign permissions and issue API client keys'
        }
      },
      {
        slug: 'ai-knowledge-base',
        icon: 'lucide:brain-circuit',
        title: { th: 'คลังความรู้ AI และแชท', en: 'AI knowledge base and chat' },
        desc: {
          th: 'upload และลบเอกสารกลาง ถามและแนะนำหน้าแชท คำถามที่ไม่มีคำตอบ และแชททดสอบ',
          en: 'Upload and manage central docs, chat guidance, unanswered questions and test chat'
        }
      }
    ]
  },
  {
    key: 'vm-client',
    title: { th: 'การเชื่อมต่อ VM client', en: 'VM client integration' },
    items: [
      {
        slug: 'vm-integration',
        icon: 'lucide:server',
        title: { th: 'คู่มือเชื่อมต่อสำหรับ VM ของวิทยาลัย', en: 'VM integration guide for colleges' },
        desc: {
          th: 'สำหรับนักพัฒนาฝั่ง VM: ยืนยันตัวตน ส่งเอกสาร ชิงก้ออาจารย์ที่ปรึกษา และเรียกแชท บทวิเคราะห์ ผลทำนายแทนผู้ใช้',
          en: 'For VM developers: identity, documents, advisor data and per-user analysis calls'
        }
      },
      {
        slug: 'vm-person-context',
        icon: 'lucide:file-signature',
        title: { th: 'การลงลายเซ็น person context', en: 'Signing the person context' },
        desc: {
          th: 'สำหรับนักพัฒนาฝั่ง VM: สร้าง header X-Person-* และลายเซ็น HMAC เมื่อเรียกแทนผู้ใช้ปลายทาง',
          en: 'For VM developers: build X-Person-* headers and HMAC signatures for end users'
        }
      }
    ]
  },
  {
    key: 'llm-gateway',
    title: { th: 'External LLM Gateway', en: 'External LLM Gateway' },
    items: [
      {
        slug: 'llm-gateway-keys',
        icon: 'lucide:key-round',
        title: { th: 'จัดการคีย์ LLM Gateway', en: 'Manage LLM Gateway keys' },
        desc: {
          th: 'สำหรับผู้ดูแลระบบ: ออก แก้ไข rotate ปิดใช้งานคีย์ และการดูการใช้งาน',
          en: 'For admins: issue, edit, rotate, disable keys and monitor usage'
        }
      },
      {
        slug: 'llm-gateway-integration',
        icon: 'lucide:plug',
        title: { th: 'คู่มือเชื่อมต่อ LLM Gateway', en: 'LLM Gateway integration guide' },
        desc: {
          th: 'สำหรับนักพัฒนาระบบอื่น: เรียก /v1/models, chat completions และ embeddings แบบ OpenAI',
          en: 'For external developers: call /v1/models, chat completions and embeddings the OpenAI way'
        }
      },
      {
        slug: 'llm-playground',
        icon: 'lucide:messages-square',
        title: { th: 'ใช้งาน LLM Playground', en: 'Using the LLM Playground' },
        desc: {
          th: 'สำหรับผู้ทดลองโมเดล: แชทกับโมเดลของ gateway เลือกโมเดล แบบรูป เปิด/ปิดการคิด และแก้ปัญหา',
          en: 'For model testers: chat with gateway models, pick models, toggle thinking and debug'
        }
      }
    ]
  },
  {
    key: 'backend-ops',
    title: { th: 'Backend และการดูแลระบบ', en: 'Backend and operations' },
    items: [
      {
        slug: 'server-operations',
        icon: 'lucide:server-cog',
        title: { th: 'คู่มือติดตั้งและดูแลระบบ', en: 'Install and operations guide' },
        desc: {
          th: 'สำหรับทีมดูแล server: ส่วนประกอบ การติดตั้ง ค่าที่ต้องตั้ง การอัปเดต และย้อนเวอร์ชัน การรับมือการแจ้งเตือน และปัญหาที่พบบ่อย',
          en: 'For server teams: components, install, config, updates, rollbacks, alerts and common issues'
        }
      },
      {
        slug: 'api-overview',
        icon: 'lucide:braces',
        title: { th: 'ภาพรวม API สำหรับนักพัฒนา', en: 'API overview for developers' },
        desc: {
          th: 'กลุ่มของ API การยืนยันตัวตน สิทธิ์ รูปแบบ response และ error, id, การแบ่งหน้า และ streaming',
          en: 'API groups, auth, permissions, response and error shapes, ids, pagination and streaming'
        }
      },
      {
        slug: 'executive-overview',
        icon: 'lucide:monitor',
        title: { th: 'ภาพรวมระบบสำหรับผู้บริหาร', en: 'System overview for executives' },
        desc: {
          th: 'ระบบช่วยอะไร ใครใช้งาน การปกป้องข้อมูลนักเรียน การทำนายความเสี่ยง ออกกลางคืน และข้อจำกัดปัจจุบัน แบบไม่ใช่ศัพท์เทคนิค',
          en: 'What the system does, who uses it, student data protection, risk forecasting and limits in plain terms'
        }
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
