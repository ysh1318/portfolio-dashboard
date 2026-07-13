import { useEffect, useState, type FormEvent } from 'react'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { NewTestimonial, Testimonial } from '../lib/types'
import { Badge, Button, Card, Input, Label, Spinner, Textarea, Toast } from '../components/ui'

const BLANK: NewTestimonial = {
  clientName: '',
  business: '',
  quote: '',
  rating: 5,
  order: 0,
  visible: true,
}

// Same shape as Projects.tsx (§5.5) — add/edit/delete, reorder via
// numeric `order`, `visible` toggle to hide without deleting.
export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    const q = query(collection(db, 'testimonials'), orderBy('order', 'asc'))
    const unsub = onSnapshot(
      q,
      (snap) => {
        setTestimonials(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Testimonial, 'id'>) })))
        setLoading(false)
      },
      () => setLoading(false),
    )
    return () => unsub()
  }, [])

  function flash(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 1500)
  }

  async function handleCreate(data: NewTestimonial) {
    await addDoc(collection(db, 'testimonials'), data)
    setAdding(false)
    flash('Testimonial added')
  }

  async function handleUpdate(id: string, data: NewTestimonial) {
    await updateDoc(doc(db, 'testimonials', id), { ...data })
    setEditingId(null)
    flash('Testimonial updated')
  }

  async function handleToggleVisible(t: Testimonial) {
    await updateDoc(doc(db, 'testimonials', t.id), { visible: !t.visible })
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this testimonial? This cannot be undone.')) return
    await deleteDoc(doc(db, 'testimonials', id))
    flash('Testimonial deleted')
  }

  if (loading) return <Spinner />

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-extrabold text-slate-900">Testimonials</h1>
        {!adding && <Button onClick={() => setAdding(true)}>+ Add testimonial</Button>}
      </div>

      {adding && (
        <Card className="mb-6">
          <h2 className="text-sm font-bold text-slate-900 mb-4">New testimonial</h2>
          <TestimonialForm
            initial={{ ...BLANK, order: testimonials.length }}
            onSubmit={handleCreate}
            onCancel={() => setAdding(false)}
          />
        </Card>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {testimonials.map((t) =>
          editingId === t.id ? (
            <Card key={t.id} className="sm:col-span-2">
              <h2 className="text-sm font-bold text-slate-900 mb-4">Edit testimonial</h2>
              <TestimonialForm initial={t} onSubmit={(data) => handleUpdate(t.id, data)} onCancel={() => setEditingId(null)} />
            </Card>
          ) : (
            <Card key={t.id}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="font-extrabold text-slate-900">{t.clientName || 'Unnamed'}</h3>
                <Badge tone={t.visible ? 'green' : 'slate'}>{t.visible ? 'Visible' : 'Hidden'}</Badge>
              </div>
              {t.business && <p className="text-xs text-slate-400 mb-2">{t.business}</p>}
              <p className="text-sm text-slate-500 mb-3 line-clamp-3">"{t.quote}"</p>
              <p className="text-xs text-amber-500 mb-4">{'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}</p>
              <div className="flex flex-wrap gap-2">
                <Button variant="ghost" onClick={() => setEditingId(t.id)}>
                  Edit
                </Button>
                <Button variant="ghost" onClick={() => handleToggleVisible(t)}>
                  {t.visible ? 'Hide' : 'Show'}
                </Button>
                <Button variant="danger" onClick={() => handleDelete(t.id)}>
                  Delete
                </Button>
              </div>
            </Card>
          ),
        )}
      </div>

      {toast && <Toast message={toast} />}
    </div>
  )
}

function TestimonialForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial: NewTestimonial
  onSubmit: (data: NewTestimonial) => void
  onCancel: () => void
}) {
  const [clientName, setClientName] = useState(initial.clientName)
  const [business, setBusiness] = useState(initial.business)
  const [quote, setQuote] = useState(initial.quote)
  const [rating, setRating] = useState(initial.rating)
  const [order, setOrder] = useState(initial.order)
  const [visible, setVisible] = useState(initial.visible)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    await onSubmit({
      clientName,
      business,
      quote,
      rating: Math.max(1, Math.min(5, Number(rating) || 5)),
      order: Number(order) || 0,
      visible,
    })
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label>Client name</Label>
          <Input required value={clientName} onChange={(e) => setClientName(e.target.value)} />
        </div>
        <div>
          <Label>Business (optional)</Label>
          <Input value={business} onChange={(e) => setBusiness(e.target.value)} placeholder="e.g. Career Point Coaching" />
        </div>
      </div>
      <div>
        <Label>Quote</Label>
        <Textarea required rows={3} value={quote} onChange={(e) => setQuote(e.target.value)} />
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <Label>Rating (1–5)</Label>
          <Input type="number" min={1} max={5} value={rating} onChange={(e) => setRating(Number(e.target.value))} />
        </div>
        <div>
          <Label>Order</Label>
          <Input type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-600">
        <input type="checkbox" checked={visible} onChange={(e) => setVisible(e.target.checked)} className="rounded" />
        Visible on public site
      </label>
      <div className="flex gap-2">
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
