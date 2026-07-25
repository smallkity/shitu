import { useState } from 'react'
import { Edit3, FolderPlus, Plus, Trash2, X } from './Icons'
import { createTag, createTagGroup, deleteTag, deleteTagGroup, renameTag, renameTagGroup } from '../lib/repository'
import type { Tag, TagGroup } from '../types'

interface TagManagerProps {
  groups: TagGroup[]
  tags: Tag[]
  photoTagCounts: Map<string, number>
  onClose: () => void
}

const COLORS = ['#d68b5d', '#7b8fb2', '#c98593', '#769b82', '#a187b8', '#c29b62']

export function TagManager({ groups, tags, photoTagCounts, onClose }: TagManagerProps) {
  const [newGroupName, setNewGroupName] = useState('')
  const [newTagByGroup, setNewTagByGroup] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)

  async function addGroup() {
    const name = newGroupName.trim()
    if (!name) return
    setBusy(true)
    try {
      await createTagGroup(name, COLORS[groups.length % COLORS.length])
      setNewGroupName('')
    } finally { setBusy(false) }
  }

  async function addTag(groupId: string) {
    const name = (newTagByGroup[groupId] ?? '').trim()
    if (!name) return
    setBusy(true)
    try {
      await createTag(groupId, name)
      setNewTagByGroup((current) => ({ ...current, [groupId]: '' }))
    } finally { setBusy(false) }
  }

  async function promptRenameGroup(group: TagGroup) {
    const name = window.prompt('重命名标签集', group.name)
    if (name?.trim()) await renameTagGroup(group, name)
  }

  async function promptRenameTag(tag: Tag) {
    const name = window.prompt('重命名标签', tag.name)
    if (name?.trim()) await renameTag(tag, name)
  }

  async function removeGroup(group: TagGroup) {
    if (window.confirm(`删除“${group.name}”及其中所有标签？`)) await deleteTagGroup(group.id)
  }

  async function removeTag(tag: Tag) {
    if (window.confirm(`删除标签“${tag.name}”？`)) await deleteTag(tag.id)
  }

  return (
    <div className="manager-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="tag-manager" role="dialog" aria-modal="true" aria-label="管理标签">
        <header className="manager-header">
          <div><p className="eyebrow">YOUR VOCABULARY</p><h2>管理标签</h2></div>
          <button className="icon-button" onClick={onClose} aria-label="关闭"><X size={20} /></button>
        </header>
        <div className="manager-content">
          <div className="new-group-form">
            <input value={newGroupName} onChange={(event) => setNewGroupName(event.target.value)} placeholder="新建标签集，例如：旅行地点" onKeyDown={(event) => event.key === 'Enter' && addGroup()} />
            <button className="secondary-button" onClick={addGroup} disabled={busy}><FolderPlus size={16} />新建标签集</button>
          </div>
          <div className="manager-groups">
            {groups.map((group) => {
              const groupTags = tags.filter((tag) => tag.groupId === group.id)
              return (
                <div className="manager-group" key={group.id}>
                  <div className="manager-group-header">
                    <div className="manager-group-title"><span className="group-dot large" style={{ backgroundColor: group.color }} /><h3>{group.name}</h3><span className="count-badge">{groupTags.length}</span></div>
                    <div className="manager-actions"><button className="icon-button subtle" onClick={() => promptRenameGroup(group)} aria-label="重命名标签集"><Edit3 size={15} /></button><button className="icon-button danger subtle" onClick={() => removeGroup(group)} aria-label="删除标签集"><Trash2 size={15} /></button></div>
                  </div>
                  <div className="managed-tags">
                    {groupTags.map((tag) => <div className="managed-tag" key={tag.id}><span>{tag.name}</span><small>{photoTagCounts.get(tag.id) ?? 0} 张</small><button className="tag-action" onClick={() => promptRenameTag(tag)} aria-label={`重命名${tag.name}`}><Edit3 size={13} /></button><button className="tag-action danger" onClick={() => removeTag(tag)} aria-label={`删除${tag.name}`}><Trash2 size={13} /></button></div>)}
                  </div>
                  <div className="new-tag-form"><input value={newTagByGroup[group.id] ?? ''} onChange={(event) => setNewTagByGroup((current) => ({ ...current, [group.id]: event.target.value }))} placeholder="添加一个标签…" onKeyDown={(event) => event.key === 'Enter' && addTag(group.id)} /><button className="round-add" onClick={() => addTag(group.id)} disabled={busy} aria-label="添加标签"><Plus size={16} /></button></div>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
