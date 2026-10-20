// In-app user manual registry. Each topic is one Markdown file per locale:
//   app/manual/<slug>.<locale>.md
// Titles/descriptions live here so the index page can render and search them without loading content.

export interface ManualText {
  th: string
  en: string
  [locale: string]: string
}

export interface ManualTopic {
  slug: string
  icon: string
  title: ManualText
  description: ManualText
}

export interface ManualSection {
  key: string
  title: ManualText
  topics: ManualTopic[]
}

export interface ManualContent {
  content: string
  locale: string
}

export const MANUAL_DEFAULT_LOCALE = 'th'

export const MANUAL_SECTIONS: ManualSection[] = [
  {
    key: 'admin-console',
    title: { th: 'การใช้งาน Admin console', en: 'Using Admin console' },
    topics: [
      {
        slug: 'admin-getting-started',
        icon: 'lucide:rocket',
        title: { th: 'เริ่มต้นใช้งานหน้า admin', en: 'Getting started with admin' },
        description: {
          th: 'เข้าสู่ระบบ สิงหาศผ่าน เมนูและการค้นหา เมนูโปรด การสลับบัญชี และการตั้งค่าส่วนตัว',
          en: 'Sign in, navigation, search, favorites, account switching and personal settings'
        }
      },
      {
        slug: 'users-roles-permissions',
        icon: 'lucide:users',
        title: { th: 'ผู้ใช้ กลุ่มผู้ใช้งาน และสิทธิ์', en: 'Users, roles and permissions' },
        description: {
          th: 'เพิ่มผู้ใช้ สร้างกลุ่มและกำหนดสิทธิ์ และออกคีย์ Api client ให้ระบบอื่น',
          en: 'Add users, create groups, assign permissions and issue API client keys'
        }
      },
      {
        slug: 'ai-knowledge-base',
        icon: 'lucide:brain-circuit',
        title: { th: 'คลังความรู้ AI และแชท', en: 'AI knowledge base and chat' },
        description: {
          th: 'upload และลบเอกสารกลาง ถามและแนะนำหน้าแชท คำถามที่ไม่มีคำตอบ และแชททดสอบ',
          en: 'Upload and manage central docs, chat guidance, unanswered questions and test chat'
        }
      }
    ]
  },
  {
    key: 'vm-client',
    title: { th: 'การเชื่อมต่อ VM client', en: 'VM client integration' },
    topics: [
      {
        slug: 'vm-integration',
        icon: 'lucide:server',
        title: { th: 'คู่มือเชื่อมต่อสำหรับ VM ของวิทยาลัย', en: 'VM integration guide for colleges' },
        description: {
          th: 'สำหรับนักพัฒนาฝั่ง VM: ยืนยันตัวตน ส่งเอกสาร ชิงก้ออาจารย์ที่ปรึกษา และเรียกแชท บทวิเคราะห์ ผลทำนายแทนผู้ใช้',
          en: 'For VM developers: identity, documents, advisor data and per-user analysis calls'
        }
      },
      {
        slug: 'vm-person-context',
        icon: 'lucide:file-signature',
        title: { th: 'การลงลายเซ็น person context', en: 'Signing the person context' },
        description: {
          th: 'สำหรับนักพัฒนาฝั่ง VM: สร้าง header X-Person-* และลายเซ็น HMAC เมื่อเรียกแทนผู้ใช้ปลายทาง',
          en: 'For VM developers: build X-Person-* headers and HMAC signatures for end users'
        }
      }
    ]
  },
  {
    key: 'llm-gateway',
    title: { th: 'External LLM Gateway', en: 'External LLM Gateway' },
    topics: [
      {
        slug: 'llm-gateway-keys',
        icon: 'lucide:key-round',
        title: { th: 'จัดการคีย์ LLM Gateway', en: 'Manage LLM Gateway keys' },
        description: {
          th: 'สำหรับผู้ดูแลระบบ: ออก แก้ไข rotate ปิดใช้งานคีย์ และการดูการใช้งาน',
          en: 'For admins: issue, edit, rotate, disable keys and monitor usage'
        }
      },
      {
        slug: 'llm-gateway-integration',
        icon: 'lucide:plug',
        title: { th: 'คู่มือเชื่อมต่อ LLM Gateway', en: 'LLM Gateway integration guide' },
        description: {
          th: 'สำหรับนักพัฒนาระบบอื่น: เรียก /v1/models, chat completions และ embeddings แบบ OpenAI',
          en: 'For external developers: call /v1/models, chat completions and embeddings the OpenAI way'
        }
      },
      {
        slug: 'llm-playground',
        icon: 'lucide:messages-square',
        title: { th: 'ใช้งาน LLM Playground', en: 'Using the LLM Playground' },
        description: {
          th: 'สำหรับผู้ทดลองโมเดล: แชทกับโมเดลของ gateway เลือกโมเดล แบบรูป เปิด/ปิดการคิด และแก้ปัญหา',
          en: 'For model testers: chat with gateway models, pick models, toggle thinking and debug'
        }
      }
    ]
  },
  {
    key: 'backend-ops',
    title: { th: 'Backend และการดูแลระบบ', en: 'Backend and operations' },
    topics: [
      {
        slug: 'server-operations',
        icon: 'lucide:server-cog',
        title: { th: 'คู่มือติดตั้งและดูแลระบบ', en: 'Install and operations guide' },
        description: {
          th: 'สำหรับทีมดูแล server: ส่วนประกอบ การติดตั้ง ค่าที่ต้องตั้ง การอัปเดต และย้อนเวอร์ชัน การรับมือการแจ้งเตือน และปัญหาที่พบบ่อย',
          en: 'For server teams: components, install, config, updates, rollbacks, alerts and common issues'
        }
      },
      {
        slug: 'api-overview',
        icon: 'lucide:braces',
        title: { th: 'ภาพรวม API สำหรับนักพัฒนา', en: 'API overview for developers' },
        description: {
          th: 'กลุ่มของ API การยืนยันตัวตน สิทธิ์ รูปแบบ response และ error, id, การแบ่งหน้า และ streaming',
          en: 'API groups, auth, permissions, response and error shapes, ids, pagination and streaming'
        }
      },
      {
        slug: 'executive-overview',
        icon: 'lucide:monitor',
        title: { th: 'ภาพรวมระบบสำหรับผู้บริหาร', en: 'System overview for executives' },
        description: {
          th: 'ระบบช่วยอะไร ใครใช้งาน การปกป้องข้อมูลนักเรียน การทำนายความเสี่ยง ออกกลางคืน และข้อจำกัดปัจจุบัน แบบไม่ใช่ศัพท์เทคนิค',
          en: 'What the system does, who uses it, student data protection, risk forecasting and limits in plain terms'
        }
      }
    ]
  }
]

// Lazy, build-time bundled Markdown (no server route, no extra dependency).
const CONTENT = import.meta.glob<string>('./*.md', { query: '?raw', import: 'default' })

export const findManualTopic = (slug: string): ManualTopic | undefined => {
  return MANUAL_SECTIONS.flatMap(section => section.topics).find(topic => topic.slug === slug)
}

export const manualText = (text: ManualText, locale: string): string => {
  return text[locale] || text[MANUAL_DEFAULT_LOCALE]
}

/** Markdown for a topic in the locale, falling back to Thai; null when the topic file does not exist. */
export const loadManualContent = async (slug: string, locale: string): Promise<ManualContent | null> => {
  const requested = CONTENT[`./${slug}.${locale}.md`]
  if (requested) {
    return { content: await requested(), locale }
  }
  const fallback = CONTENT[`./${slug}.${MANUAL_DEFAULT_LOCALE}.md`]
  if (!fallback) {
    return null
  }
  return { content: await fallback(), locale: MANUAL_DEFAULT_LOCALE }
}
