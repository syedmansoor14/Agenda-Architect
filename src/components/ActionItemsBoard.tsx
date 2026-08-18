import React, { useState } from 'react';
import { CheckSquare, Plus, Trash2, Calendar, User, Tag, Check, AlertCircle } from 'lucide-react';
import { ActionItem } from '../types';

interface ActionItemsBoardProps {
  actionItems: ActionItem[];
  onUpdateActionItems: (items: ActionItem[]) => void;
}

const PRIORITY_BADGES: Record<string, { bg: string; text: string; border: string }> = {
  High: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  Medium: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  Low: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
};

export const ActionItemsBoard: React.FC<ActionItemsBoardProps> = ({
  actionItems,
  onUpdateActionItems,
}) => {
  const [filter, setFilter] = useState<'all' | 'open' | 'completed'>('all');
  const [showAddForm, setShowAddForm] = useState(false);

  // New action item fields
  const [newTask, setNewTask] = useState('');
  const [newOwner, setNewOwner] = useState('');
  const [newPriority, setNewPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [newDeadline, setNewDeadline] = useState('');
  const [newContext, setNewContext] = useState('');

  const handleToggleCompleted = (id: string) => {
    onUpdateActionItems(
      actionItems.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const handleDelete = (id: string) => {
    onUpdateActionItems(actionItems.filter((i) => i.id !== id));
  };

  const handleAdd = () => {
    if (!newTask.trim() || !newOwner.trim()) return;
    const newItem: ActionItem = {
      id: `act-${Date.now()}`,
      task: newTask.trim(),
      owner: newOwner.trim(),
      priority: newPriority,
      suggestedDeadline: newDeadline.trim() || undefined,
      context: newContext.trim() || undefined,
      completed: false,
    };
    onUpdateActionItems([...actionItems, newItem]);
    setNewTask('');
    setNewOwner('');
    setNewDeadline('');
    setNewContext('');
    setShowAddForm(false);
  };

  const filteredItems = actionItems.filter((item) => {
    if (filter === 'open') return !item.completed;
    if (filter === 'completed') return !!item.completed;
    return true;
  });

  const completedCount = actionItems.filter((i) => i.completed).length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckSquare className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Action Items & Deliverables
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                ({completedCount}/{actionItems.length} resolved)
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Clear owners, priority level, and timeline expectations
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Filter tabs */}
          <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs font-medium text-slate-600">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                filter === 'all' ? 'bg-white text-slate-900 font-bold shadow-2xs' : ''
              }`}
            >
              All ({actionItems.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('open')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                filter === 'open' ? 'bg-white text-slate-900 font-bold shadow-2xs' : ''
              }`}
            >
              Open ({actionItems.length - completedCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter('completed')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                filter === 'completed' ? 'bg-white text-slate-900 font-bold shadow-2xs' : ''
              }`}
            >
              Done ({completedCount})
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Action Items List */}
      <div className="space-y-2.5">
        {filteredItems.map((item) => {
          const priorityStyle = PRIORITY_BADGES[item.priority] || PRIORITY_BADGES.Medium;
          return (
            <div
              key={item.id}
              className={`p-3.5 rounded-xl border transition-all flex items-start justify-between group ${
                item.completed
                  ? 'bg-slate-50 border-slate-200 opacity-60'
                  : 'bg-white border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start space-x-3">
                <button
                  type="button"
                  onClick={() => handleToggleCompleted(item.id)}
                  className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center border transition-colors cursor-pointer ${
                    item.completed
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'border-slate-300 hover:border-emerald-500 bg-white'
                  }`}
                  title={item.completed ? 'Mark uncompleted' : 'Mark completed'}
                >
                  {item.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </button>

                <div>
                  <h4
                    className={`text-xs sm:text-sm font-semibold text-slate-900 leading-snug ${
                      item.completed ? 'line-through text-slate-500' : ''
                    }`}
                  >
                    {item.task}
                  </h4>

                  {item.context && (
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {item.context}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {/* Owner tag */}
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                      <User className="w-3 h-3 text-slate-400" />
                      <span>{item.owner}</span>
                    </span>

                    {/* Priority badge */}
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${priorityStyle.bg} ${priorityStyle.text} ${priorityStyle.border}`}
                    >
                      {item.priority} Priority
                    </span>

                    {/* Deadline */}
                    {item.suggestedDeadline && (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>Due: {item.suggestedDeadline}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleDelete(item.id)}
                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600 transition-opacity p-1 cursor-pointer"
                title="Delete action item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="text-center py-6 text-xs text-slate-400">
            No action items in this filter.
          </div>
        )}
      </div>

      {showAddForm && (
        <div className="mt-4 p-4 rounded-xl bg-slate-100 border border-slate-300 space-y-3">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Add Action Item
          </h4>
          <input
            type="text"
            placeholder="Action description (e.g. Run benchmark load tests on CRDT backend)"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-900"
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Owner (e.g. Marcus / Tech Lead)"
              value={newOwner}
              onChange={(e) => setNewOwner(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-900"
            />
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value as 'High' | 'Medium' | 'Low')}
              className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 font-medium"
            >
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
            <input
              type="text"
              placeholder="Target Deadline (e.g. Friday 5pm)"
              value={newDeadline}
              onChange={(e) => setNewDeadline(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-900"
            />
          </div>
          <input
            type="text"
            placeholder="Brief context or rationale (Optional)"
            value={newContext}
            onChange={(e) => setNewContext(e.target.value)}
            className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-900"
          />
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAdd}
              className="px-3 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded cursor-pointer"
            >
              Save Item
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
