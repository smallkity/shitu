import { ChevronDown, Check, X } from './Icons'
import type { Tag, TagGroup, TagSelection } from '../types'

interface FilterPanelProps {
  groups: TagGroup[]
  tags: Tag[]
  selection: TagSelection
  onToggle: (groupId: string, tagId: string) => void
  onClear: () => void
}

export function FilterPanel({ groups, tags, selection, onToggle, onClear }: FilterPanelProps) {
  const activeCount = Object.values(selection).reduce((count, ids) => count + ids.length, 0)

  return (
    <aside className="filter-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">FILTER BY TAGS</p>
          <h2>筛选照片</h2>
        </div>
        {activeCount > 0 && (
          <button className="clear-button" onClick={onClear}><X size={14} />清除</button>
        )}
      </div>
      <p className="filter-hint">同一组内为「或」，不同标签组之间为「且」</p>
      <div className="filter-groups">
        {groups.map((group) => {
          const groupTags = tags.filter((tag) => tag.groupId === group.id)
          const selected = selection[group.id] ?? []
          return (
            <details key={group.id} className="filter-group" open>
              <summary>
                <span className="group-summary-left">
                  <span className="group-dot" style={{ backgroundColor: group.color }} />
                  <span>{group.name}</span>
                  {selected.length > 0 && <b>{selected.length}</b>}
                </span>
                <ChevronDown size={16} />
              </summary>
              <div className="filter-options">
                {groupTags.map((tag) => {
                  const isSelected = selected.includes(tag.id)
                  return (
                    <button
                      key={tag.id}
                      className={`filter-option ${isSelected ? 'selected' : ''}`}
                      onClick={() => onToggle(group.id, tag.id)}
                    >
                      <span className="checkbox">{isSelected && <Check size={13} />}</span>
                      <span>{tag.name}</span>
                    </button>
                  )
                })}
              </div>
            </details>
          )
        })}
      </div>
    </aside>
  )
}
