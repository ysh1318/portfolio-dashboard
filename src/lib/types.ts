// Shared Firestore document shapes — see spec §4.2.
// Keep this file in sync with the public site's `src/lib/types.ts` (they
// read/write the same collections).

export interface SiteContent {
  heroHeadline: string
  heroSubtext: string
  servicesIntro: string
  industriesIntro: string
  processIntro: string
  pricingNote: string
  connectIntro: string
}

export const SITE_CONTENT_FIELDS: { key: keyof SiteContent; label: string; multiline?: boolean }[] = [
  { key: 'heroHeadline', label: 'Hero headline' },
  { key: 'heroSubtext', label: 'Hero subtext', multiline: true },
  { key: 'servicesIntro', label: 'Services intro', multiline: true },
  { key: 'industriesIntro', label: 'Industries intro', multiline: true },
  { key: 'processIntro', label: 'Process intro', multiline: true },
  { key: 'pricingNote', label: 'Pricing note', multiline: true },
  { key: 'connectIntro', label: 'Connect intro', multiline: true },
]

export interface SiteStatus {
  isAvailable: boolean
  availableFromDate: { seconds: number; nanoseconds: number } | null
  bannerMessage: string
}

export interface Project {
  id: string
  title: string
  description: string
  imageUrl: string
  liveUrl: string
  tags: string[]
  order: number
  visible: boolean
}

export type NewProject = Omit<Project, 'id'>

export interface Testimonial {
  id: string
  clientName: string
  business: string
  quote: string
  rating: number
  order: number
  visible: boolean
}

export type NewTestimonial = Omit<Testimonial, 'id'>

export const LEAD_STATUSES = ['new', 'contacted', 'quoted', 'won', 'lost'] as const
export type LeadStatus = (typeof LEAD_STATUSES)[number]

export interface Lead {
  id: string
  name: string
  business: string
  projectType: string
  subject: string
  message: string
  sourcePage: string
  status: string
  notes: string
  createdAt: { seconds: number; nanoseconds: number } | null
}
