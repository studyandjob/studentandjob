'use client';

import { TrashIcon } from '../icons';

const MODULE_LABELS = {
  jobs: 'Jobs',
  studyzone: 'Study Zone',
  results: 'Results',
  scholarships: 'Scholarships',
};

export default function UserList({ staff, permissionsByUser, onDelete, deletingId }) {
  if (staff.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-amuted">
        No staff accounts yet — create one from the "Add User" tab.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2.5">
      {staff.map((s) => {
        const modules = permissionsByUser[s.id] || [];
        return (
          <li
            key={s.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-aline bg-white px-4 py-3"
          >
            <div className="min-w-0 flex-1 text-sm text-aink">
              <p className="font-semibold">{s.name}</p>
              <p className="text-xs text-amuted">{s.email}</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {modules.length === 0 ? (
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[0.7rem] font-semibold text-amuted">
                    No tasks assigned yet
                  </span>
                ) : (
                  modules.map((m) => (
                    <span
                      key={m}
                      className="rounded-full bg-atl2/10 px-2.5 py-1 text-[0.7rem] font-semibold text-atl2"
                    >
                      {MODULE_LABELS[m] || m}
                    </span>
                  ))
                )}
              </div>
            </div>
            <button
              onClick={() => onDelete(s)}
              disabled={deletingId === s.id}
              className="flex flex-shrink-0 items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3.5 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-600 hover:text-white disabled:opacity-60"
            >
              <TrashIcon className="h-3.5 w-3.5" />
              {deletingId === s.id ? 'Removing...' : 'Remove'}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
