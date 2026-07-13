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
import type { NewProject, Project } from '../lib/types'
import { Badge, Button, Card, Input, Label, Spinner, Textarea, Toast } from '../components/ui'

const BLANK: NewProject = {
  title: '',
  description: '',
  imageUrl: '',
  liveUrl: '',
  tags: [],
  order: 0,
  visible: true,
}

// Spec §5.5: list of `projects` with add/edit/delete, reorder via numeric
// `order` input, `visible` toggle to hide without deleting.
export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    const q = query(collection(db, 'projects'), orderBy('order', 'asc'))
    const unsub = onSnapshot(
      q,
      (snap) => {
        setProjects(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Project, 'id'>) })))
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

  async function handleCreate(data: NewProject) {
    await addDoc(collection(db, 'projects'), data)
    setAdding(false)
    flash('Project added')
  }

  async function handleUpdate(id: string, data: NewProject) {
    await updateDoc(doc(db, 'projects', id), { ...data })
    setEditingId(null)
    flash('Project updated')
  }

  async function handleToggleVisible(p: Project) {
    await updateDoc(doc(db, 'projects', p.id), { visible: !p.visible })
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this project? This cannot be undone.')) return
    await deleteDoc(doc(db, 'projects', id))
    flash('Project deleted')
  }

  if (loading) return <Spinner />

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-extrabold text-slate-900">Projects</h1>
        {!adding && (
          <Button onClick={() => setAdding(true)}>+ Add project</Button>
        )}
      </div>

      {adding && (
        <Card className="mb-6">
          <h2 className="text-sm font-bold text-slate-900 mb-4">New project</h2>
          <ProjectForm
            initial={{ ...BLANK, order: projects.length }}
            onSubmit={handleCreate}
            onCancel={() => setAdding(false)}
          />
        </Card>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {projects.map((p) =>
          editingId === p.id ? (
            <Card key={p.id} className="sm:col-span-2">
              <h2 className="text-sm font-bold text-slate-900 mb-4">Edit project</h2>
              <ProjectForm initial={p} onSubmit={(data) => handleUpdate(p.id, data)} onCancel={() => setEditingId(null)} />
            </Card>
          ) : (
            <Card key={p.id}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="font-extrabold text-slate-900">{p.title || 'Untitled'}</h3>
                <Badge tone={p.visible ? 'green' : 'slate'}>{p.visible ? 'Visible' : 'Hidden'}</Badge>
              </div>
              <p className="text-sm text-slate-500 mb-3 line-clamp-3">{p.description}</p>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {p.tags?.map((t) => (
                  <span key={t} className="text-xs bg-slate-100 text-slate-500 rounded-full px-2.5 py-1">
                    {t}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="ghost" onClick={() => setEditingId(p.id)}>
                  Edit
                </Button>
                <Button variant="ghost" onClick={() => handleToggleVisible(p)}>
                  {p.visible ? 'Hide' : 'Show'}
                </Button>
                <Button variant="danger" onClick={() => handleDelete(p.id)}>
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

function ProjectForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial: NewProject
  onSubmit: (data: NewProject) => void
  onCancel: () => void
}) {
  const [title, setTitle] = useState(initial.title)
  const [description, setDescription] = useState(initial.description)
  const [imageUrl, setImageUrl] = useState(initial.imageUrl)
  const [liveUrl, setLiveUrl] = useState(initial.liveUrl)
  const [tagsInput, setTagsInput] = useState(initial.tags.join(', '))
  const [order, setOrder] = useState(initial.order)
  const [visible, setVisible] = useState(initial.visible)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    await onSubmit({
      title,
      description,
      imageUrl,
      liveUrl,
      tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
      order: Number(order) || 0,
      visible,
    })
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label>Title</Label>
          <Input required value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <Label>Live URL</Label>
          <Input value={liveUrl} onChange={(e) => setLiveUrl(e.target.value)} placeholder="https://…" />
        </div>
      </div>
      <div>
        <Label>Description</Label>
        <Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div>
        <Label>Image URL</Label>
        <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://… or /img/…" />
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
          <Label>Tags (comma separated)</Label>
          <Input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="React, Firebase, CBT" />
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
