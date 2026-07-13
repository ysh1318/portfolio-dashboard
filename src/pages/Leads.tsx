import { useEffect, useMemo, useState } from 'react'
import { collection, doc, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { Lead } from '../lib/types'
import { LEAD_STATUSES } from '../lib/types'
import { Badge, Button, Card, Label, Spinner, Textarea, Toast } from '../components/ui'

function formatDate(ts: Lead['createdAt']) {
  if (!ts) return '—'
  return new Date(ts.seconds * 1000).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

const STATUS_TONE: Record<string, 'slate' | 'amber' | 'green' | 'red'> = {
  new: 'amber',
  contacted: 'slate',
  quoted: 'slate',
  won: 'green',
  lost: 'red',
}

// Spec §5.2: table of `leads`, sortable by createdAt, filterable by status
// and sourcePage. Click a lead → detail panel: edit status/notes inline,
// view full submitted message.
export default function Leads() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [toast, setToast] = useState('')

  useEffect(() => {
    const q = query(collection(db, 'leads'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(
      q,
      (snap) => {
        setLeads(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Lead, 'id'>) })))
        setLoading(false)
      },
      () => setLoading(false),
    )
    return () => unsub()
  }, [])

  const sourcePages = useMemo(
    () => Array.from(new Set(leads.map((l) => l.sourcePage).filter(Boolean))),
    [leads],
  )

  const filtered = useMemo(() => {
    let list = leads
    if (statusFilter !== 'all') list = list.filter((l) => l.status === statusFilter)
    if (sourceFilter !== 'all') list = list.filter((l) => l.sourcePage === sourceFilter)
    list = [...list].sort((a, b) => {
      const av = a.createdAt?.seconds ?? 0
      const bv = b.createdAt?.seconds ?? 0
      return sortDir === 'desc' ? bv - av : av - bv
    })
    return list
  }, [leads, statusFilter, sourceFilter, sortDir])

  const selected = leads.find((l) => l.id === selectedId) ?? null

  async function saveLead(id: string, updates: Partial<Pick<Lead, 'status' | 'notes'>>) {
    try {
      await updateDoc(doc(db, 'leads', id), updates)
      setToast('Saved')
      setTimeout(() => setToast(''), 1500)
    } catch {
      setToast('Failed to save')
      setTimeout(() => setToast(''), 2000)
    }
  }

  if (loading) return <Spinner />

  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-6 items-start">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <h1 className="text-xl font-extrabold text-slate-900">Leads</h1>
          <div className="flex flex-wrap gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-sm"
            >
              <option value="all">All statuses</option>
              {LEAD_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-sm"
            >
              <option value="all">All sources</option>
              {sourcePages.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <button
              onClick={() => setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))}
              className="rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-white"
            >
              Date {sortDir === 'desc' ? '↓ newest' : '↑ oldest'}
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="text-sm text-slate-500 py-8 text-center">No leads match these filters.</p>
        ) : (
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-slate-400 border-b border-slate-200">
                  <th className="px-2 py-2">Name</th>
                  <th className="px-2 py-2">Business</th>
                  <th className="px-2 py-2">Source</th>
                  <th className="px-2 py-2">Status</th>
                  <th className="px-2 py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => setSelectedId(lead.id)}
                    className={`cursor-pointer border-b border-slate-100 hover:bg-white/70 transition ${
                      selectedId === lead.id ? 'bg-white/80' : ''
                    }`}
                  >
                    <td className="px-2 py-3 font-semibold text-slate-900">{lead.name || '—'}</td>
                    <td className="px-2 py-3 text-slate-600">{lead.business || '—'}</td>
                    <td className="px-2 py-3 text-slate-500">{lead.sourcePage || '—'}</td>
                    <td className="px-2 py-3">
                      <Badge tone={STATUS_TONE[lead.status] ?? 'slate'}>{lead.status || 'new'}</Badge>
                    </td>
                    <td className="px-2 py-3 text-slate-500 whitespace-nowrap">{formatDate(lead.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card className={selected ? '' : 'hidden lg:block'}>
        {!selected ? (
          <p className="text-sm text-slate-500 text-center py-8">Select a lead to view details.</p>
        ) : (
          <LeadDetail key={selected.id} lead={selected} onSave={saveLead} onClose={() => setSelectedId(null)} />
        )}
      </Card>

      {toast && <Toast message={toast} />}
    </div>
  )
}

function LeadDetail({
  lead,
  onSave,
  onClose,
}: {
  lead: Lead
  onSave: (id: string, updates: Partial<Pick<Lead, 'status' | 'notes'>>) => void
  onClose: () => void
}) {
  const [status, setStatus] = useState(lead.status || 'new')
  const [notes, setNotes] = useState(lead.notes || '')

  const dirty = status !== (lead.status || 'new') || notes !== (lead.notes || '')

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-extrabold text-slate-900">{lead.name || 'Unnamed lead'}</h2>
        <button onClick={onClose} className="lg:hidden text-sm text-slate-400">
          Close
        </button>
      </div>

      <dl className="space-y-2 text-sm mb-5">
        <div className="flex justify-between gap-4">
          <dt className="text-slate-400">Business</dt>
          <dd className="text-slate-900 font-medium text-right">{lead.business || '—'}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-slate-400">Project type</dt>
          <dd className="text-slate-900 font-medium text-right">{lead.projectType || '—'}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-slate-400">Subject</dt>
          <dd className="text-slate-900 font-medium text-right">{lead.subject || '—'}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-slate-400">Source page</dt>
          <dd className="text-slate-900 font-medium text-right">{lead.sourcePage || '—'}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-slate-400">Submitted</dt>
          <dd className="text-slate-900 font-medium text-right">{formatDate(lead.createdAt)}</dd>
        </div>
      </dl>

      <div className="mb-4">
        <Label>Message</Label>
        <p className="text-sm text-slate-700 bg-white/70 rounded-2xl border border-slate-200 p-3 whitespace-pre-wrap">
          {lead.message || '—'}
        </p>
      </div>

      <div className="mb-4">
        <Label>Status</Label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-white/70 px-4 py-2.5 text-sm"
        >
          {LEAD_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-5">
        <Label>Notes</Label>
        <Textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>

      <Button className="w-full" disabled={!dirty} onClick={() => onSave(lead.id, { status, notes })}>
        Save changes
      </Button>
    </div>
  )
}
