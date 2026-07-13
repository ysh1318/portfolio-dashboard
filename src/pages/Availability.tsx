import { useEffect, useState } from 'react'
import { doc, onSnapshot, setDoc, Timestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { SiteStatus } from '../lib/types'
import { Button, Card, Input, Label, Spinner, Toast } from '../components/ui'

const EMPTY: SiteStatus = { isAvailable: true, availableFromDate: null, bannerMessage: '' }

function tsToDateInput(ts: SiteStatus['availableFromDate']) {
  if (!ts) return ''
  return new Date(ts.seconds * 1000).toISOString().slice(0, 10)
}

// Spec §5.4: toggle for isAvailable, date picker for availableFromDate,
// text input for bannerMessage — saves to `settings/status`. Feeds the
// public site's AvailabilityBanner (site-wide) directly.
export default function Availability() {
  const [saved, setSaved] = useState<SiteStatus>(EMPTY)
  const [isAvailable, setIsAvailable] = useState(true)
  const [dateInput, setDateInput] = useState('')
  const [bannerMessage, setBannerMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    const ref = doc(db, 'settings', 'status')
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          const data = { ...EMPTY, ...(snap.data() as Partial<SiteStatus>) }
          setSaved(data)
          setIsAvailable(data.isAvailable)
          setDateInput(tsToDateInput(data.availableFromDate))
          setBannerMessage(data.bannerMessage)
        }
        setLoading(false)
      },
      () => setLoading(false),
    )
    return () => unsub()
  }, [])

  const dirty =
    isAvailable !== saved.isAvailable ||
    dateInput !== tsToDateInput(saved.availableFromDate) ||
    bannerMessage !== saved.bannerMessage

  async function handleSave() {
    setSaving(true)
    try {
      const payload: SiteStatus = {
        isAvailable,
        availableFromDate: dateInput ? (Timestamp.fromDate(new Date(dateInput)) as unknown as SiteStatus['availableFromDate']) : null,
        bannerMessage,
      }
      await setDoc(doc(db, 'settings', 'status'), payload, { merge: true })
      setSaved(payload)
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
    <div className="max-w-lg">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-extrabold text-slate-900">Availability</h1>
        <Button onClick={handleSave} disabled={!dirty || saving}>
          {saving ? 'Saving…' : 'Save changes'}
        </Button>
      </div>
      <Card className="space-y-5">
        <div>
          <Label>Status</Label>
          <div className="flex gap-2">
            <button
              onClick={() => setIsAvailable(true)}
              className={`flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                isAvailable ? 'bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 text-white' : 'bg-white/70 text-slate-600 border border-slate-200'
              }`}
            >
              Available
            </button>
            <button
              onClick={() => setIsAvailable(false)}
              className={`flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                !isAvailable ? 'bg-amber-400 text-white' : 'bg-white/70 text-slate-600 border border-slate-200'
              }`}
            >
              Booked / Unavailable
            </button>
          </div>
        </div>

        {!isAvailable && (
          <div>
            <Label>Available again from</Label>
            <Input type="date" value={dateInput} onChange={(e) => setDateInput(e.target.value)} />
          </div>
        )}

        <div>
          <Label>Banner message (optional)</Label>
          <Input
            placeholder={isAvailable ? 'e.g. Taking on 1 new project this month' : 'e.g. Fully booked — back from 12 Aug'}
            value={bannerMessage}
            onChange={(e) => setBannerMessage(e.target.value)}
          />
          <p className="text-xs text-slate-400 mt-1.5">Leave blank to use the site's default wording for this status.</p>
        </div>
      </Card>
      {toast && <Toast message={toast} tone={toast.startsWith('Failed') ? 'red' : 'green'} />}
    </div>
  )
}
