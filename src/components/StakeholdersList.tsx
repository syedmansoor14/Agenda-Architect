import React, { useState } from 'react';
import { Users, Plus, Trash2, Edit3, Check, Sparkles } from 'lucide-react';
import { Stakeholder } from '../types';

interface StakeholdersListProps {
  stakeholders: Stakeholder[];
  onUpdateStakeholders: (updated: Stakeholder[]) => void;
}

export const StakeholdersList: React.FC<StakeholdersListProps> = ({
  stakeholders,
  onUpdateStakeholders,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // New stakeholder state
  const [newName, setNewName] = useState('');
  const [newDept, setNewDept] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newInput, setNewInput] = useState('');

  const handleAdd = () => {
    if (!newName.trim() || !newRole.trim()) return;
    const item: Stakeholder = {
      id: `stk-${Date.now()}`,
      nameOrRole: newName.trim(),
      departmentOrTeam: newDept.trim() || undefined,
      responsibility: newRole.trim(),
      keyInterestOrInput: newInput.trim() || undefined,
    };
    onUpdateStakeholders([...stakeholders, item]);
    setNewName('');
    setNewDept('');
    setNewRole('');
    setNewInput('');
    setShowAddForm(false);
  };

  const handleDelete = (id: string) => {
    onUpdateStakeholders(stakeholders.filter((s) => s.id !== id));
  };

  const handleUpdate = (id: string, field: keyof Stakeholder, value: string) => {
    onUpdateStakeholders(
      stakeholders.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Stakeholders & Meeting Roles
            </h3>
            <p className="text-xs text-slate-500">
              Identified owners, attendees, and input required
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/60 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Stakeholder</span>
        </button>
      </div>

      {/* Stakeholders grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {stakeholders.map((s) => (
          <div
            key={s.id}
            className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all group"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-bold text-slate-900">
                    {s.nameOrRole}
                  </h4>
                  {s.departmentOrTeam && (
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                      {s.departmentOrTeam}
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(s.id)}
                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600 transition-opacity p-1 cursor-pointer"
                title="Remove stakeholder"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-2 text-xs text-slate-700">
              <span className="font-semibold text-slate-900">Meeting Role: </span>
              <span>{s.responsibility}</span>
            </div>

            {s.keyInterestOrInput && (
              <div className="mt-2 p-2 rounded-lg bg-indigo-50/60 border border-indigo-100/80 text-xs text-indigo-950">
                <span className="font-semibold text-indigo-800">Required Input: </span>
                <span>{s.keyInterestOrInput}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {showAddForm && (
        <div className="mt-4 p-4 rounded-xl bg-slate-100 border border-slate-300 space-y-3">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Add Stakeholder or Attendee
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Name or Role (e.g. Lead Architect)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-900"
            />
            <input
              type="text"
              placeholder="Department / Org (e.g. Platform Team)"
              value={newDept}
              onChange={(e) => setNewDept(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-900"
            />
          </div>
          <input
            type="text"
            placeholder="Responsibility in meeting (e.g. Presents latency benchmark results)"
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-900"
          />
          <input
            type="text"
            placeholder="Key input or approval needed (e.g. Approve database schema choice)"
            value={newInput}
            onChange={(e) => setNewInput(e.target.value)}
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
              className="px-3 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded cursor-pointer"
            >
              Save Stakeholder
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
