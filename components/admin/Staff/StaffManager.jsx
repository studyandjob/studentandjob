'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import AdminCard from '../AdminCard';
import { UsersIcon, UserCircleIcon, PlusIcon, CheckSquareIcon } from '../icons';
import UserList from './UserList';
import AddUser from './AddUser';
import TaskAssignment from './TaskAssignment';

const SUB_TABS = [
  { id: 'list', label: 'User List', icon: UserCircleIcon },
  { id: 'add', label: 'User', icon: PlusIcon },
  { id: 'assign', label: 'Task Assignment', icon: CheckSquareIcon },
];

export default function StaffManager({ initialStaff = [], initialPermissions = [] }) {
  const [subTab, setSubTab] = useState('list');
  const [staff, setStaff] = useState(initialStaff);
  const [permissions, setPermissions] = useState(initialPermissions); // [{ user_id, module }]
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');

  const permissionsByUser = permissions.reduce((acc, p) => {
    (acc[p.user_id] = acc[p.user_id] || []).push(p.module);
    return acc;
  }, {});

  function handleCreated(user) {
    setStaff((prev) => [user, ...prev]);
    setSubTab('assign');
  }

  function handlePermissionsChanged(userId, modules) {
    setPermissions((prev) => [...prev.filter((p) => p.user_id !== userId), ...modules.map((module) => ({ user_id: userId, module }))]);
  }

  async function handleDelete(user) {
    if (!confirm(`"${user.name}" ka account hamesha ke liye delete karein? Wo ab login nahi kar sakenge.`)) return;
    setDeletingId(user.id);
    setError('');
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      const res = await fetch('/api/staff/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId: user.id }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Delete nahi ho saka.');
      setStaff((prev) => prev.filter((s) => s.id !== user.id));
      setPermissions((prev) => prev.filter((p) => p.user_id !== user.id));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <AdminCard
      title="Staff / Users"
      description="Staff accounts jo /user par login karke sirf unhe assign kiye gaye sections manage kar sakte hain."
      icon={UsersIcon}
    >
      <div className="mb-5 flex flex-wrap gap-2 border-b border-aline pb-4">
        {SUB_TABS.map((t) => {
          const Icon = t.icon;
          const active = subTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setSubTab(t.id)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition ${
                active ? 'bg-atl text-white' : 'bg-[#F5F9F8] text-amuted hover:bg-[#E9F1EF]'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      {subTab === 'list' && (
        <UserList staff={staff} permissionsByUser={permissionsByUser} onDelete={handleDelete} deletingId={deletingId} />
      )}
      {subTab === 'add' && <AddUser onCreated={handleCreated} />}
      {subTab === 'assign' && (
        <TaskAssignment staff={staff} permissionsByUser={permissionsByUser} onChanged={handlePermissionsChanged} />
      )}
    </AdminCard>
  );
}
