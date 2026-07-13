import { useEffect, useState } from 'react'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { SiteContent } from '../lib/types'
import { SITE_CONTENT_FIELDS } from '../lib/types'
import { Button, Card, Input, Label, Spinner, Textarea, Toast } from '../components/ui'

const EMPTY: SiteContent = {
  heroHeadline: '',
  heroSubtext: '',
  servicesIntro: '',
  industriesIntro: '',
  processIntro: '',
  pricingNote: '',
  connectIntro: '',
}

// Spec §5.3: form mapped to `siteContent/main` fields — edit and save,
// updates the live public site instantly via its `useSiteContent` hook,
// no redeploy needed.
export default function ContentEditor() {
  const [saved, setSaved] = useState<SiteContent>(EMPTY)
  const [draft, setDraft] = useState<SiteContent>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    const ref = doc(db, 'siteContent', 'main')
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          const data = { ...EMPTY, ...(snap.data() as Partial<SiteContent>) }
          setSaved(data)
          setDraft(data)
        }
        setLoading(false)
      },
      () => setLoading(false),
    )
    return () => unsub()
  }, [])

  const dirty = JSON.stringify(saved) !== JSON.stringify(draft)

  async function handleSave() {
    setSaving(true)
    try {
      await setDoc(doc(db, 'siteContent', 'main'), draft, { merge: true })
      setSaved(draft)
      setToast('Saved — live on the site now')
    } catch {
      setToast('Failed to save')
    } finally {
      setSaving(false)
      setTimeout(() => setToast(''), 2000)
    }
  }

  if (loading) return <Spinner />

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-extrabold text-slate-900">Site Content</h1>
        <Button onClick={handleSave} disabled={!dirty || saving}>
          {saving ? 'Saving…' : 'Save changes'}
        </Button>
      </div>
      <Card>
        <div className="space-y-5">
          {SITE_CONTENT_FIELDS.map((field) => (
            <div key={field.key}>
              <Label>{field.label}</Label>
              {field.multiline ? (
                <Textarea
                  rows={3}
                  value={draft[field.key]}
                  onChange={(e) => setDraft({ ...draft, [field.key]: e.target.value })}
                />
              ) : (
                <Input
                  value={draft[field.key]}
                  onChange={(e) => setDraft({ ...draft, [field.key]: e.target.value })}
                />
              )}
            </div>
          ))}
        </div>
      </Card>
      {toast && <Toast message={toast} tone={toast.startsWith('Failed') ? 'red' : 'green'} />}
    </div>
  )
}
