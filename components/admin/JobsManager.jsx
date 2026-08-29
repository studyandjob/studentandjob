'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import AdminCard from './AdminCard';
import JobForm from './JobForm';
import JobDetailsModal from './JobDetailsModal';
import { BriefcaseIcon, PlusIcon, PencilIcon, TrashIcon, EyeIcon, TimerIcon, SaveIcon } from './icons';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
}

/** True once the job's last_date has already passed (compares dates only, ignores time-of-day). */
function isPastLastDate(dateStr) {
  if (!dateStr) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dateStr);
  due.setHours(0, 0, 0, 0);
  return due < today;
}

const DAY_PRESETS = [30, 60, 90];

/**
 * Auto-delete settings box shown at the top of the Jobs tab. Lets the admin
 * choose after how many days (past the last_date) an expired job should be
 * permanently removed — 30 / 60 / 90 or a custom number. Saved to
 * site_settings.job_delete_after_days (see sql/add_job_auto_delete.sql).
 */
function AutoDeleteSettings({ settings, onSaved }) {
  const [days, setDays] = useState(settings?.job_delete_after_days ?? 30);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setDays(settings?.job_delete_after_days ?? 30);
  }, [settings?.job_delete_after_days]);

  async function save(value) {
    setSaving(true);
    setMessage('');
    const targetId = settings?.id;
    const payload = { job_delete_after_days: value, updated_at: new Date().toISOString() };
    const { data, error: saveError } = targetId
      ? await supabase.from('site_settings').update(payload).eq('id', targetId).select().maybeSingle()
      : await supabase.from('site_settings').insert(payload).select().maybeSingle();
    setSaving(false);
    if (saveError) {
      setMessage(`Error: ${saveError.message}`);
      return;
    }
    setMessage('Saved.');
    if (data) onSaved?.(data);
  }

  return (
    <div className="mb-5 rounded-xl border border-aline bg-[#FCFAF6] p-4">
      <div className="mb-2.5 flex items-center gap-2">
        <TimerIcon className="h-4 w-4 text-atl2" />
        <p className="text-sm font-semibold text-aink">Auto-Delete Expired Jobs</p>
      </div>
      <p className="mb-3 text-xs text-amuted">
        A job is automatically deleted this many days after its Last Date passes — keeps the database and
        website fast by not carrying old, closed job posts forever. Set to 0 to turn auto-delete off.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {DAY_PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => {
              setDays(preset);
              save(preset);
            }}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
              Number(days) === preset ? 'bg-atl text-white' : 'border border-aline text-amuted hover:text-aink'
            }`}
          >
            {preset} days
          </button>
        ))}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-amuted">Custom:</span>
          <input
            type="number"
            min="0"
            value={days}
            onChange={(e) => setDays(e.target.value)}
            className="w-20 rounded-md border border-aline bg-white px-2 py-1.5 text-xs text-aink outline-none focus:border-atl2"
          />
        </div>
        <button
          type="button"
          disabled={saving}
          onClick={() => save(Number(days) || 0)}
          className="flex items-center gap-1.5 rounded-md bg-atl2 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-atl2/90 disabled:opacity-60"
        >
          <SaveIcon className="h-3.5 w-3.5" /> {saving ? 'Saving...' : 'Save'}
        </button>
        {message && (
          <span className={`text-xs ${message.startsWith('Error') ? 'text-red-600' : 'text-atl2'}`}>{message}</span>
        )}
      </div>
    </div>
  );
}

export default function JobsManager({ initialJobs = [], settings: initialSettings }) {
  const [jobs, setJobs] = useState(initialJobs);
  const [settings, setSettings] = useState(initialSettings);
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [viewingJob, setViewingJob] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Cleanup pass: every time the admin opens the Jobs tab, ask the database
  // to permanently delete any job whose last_date + job_delete_after_days
  // has passed (see delete_expired_jobs() in sql/add_job_auto_delete.sql),
  // then re-fetch so the list reflects it immediately. This runs only here
  // — not on the public site — so the cleanup never adds load to visitors.
  useEffect(() => {
    (async () => {
      await supabase.rpc('delete_expired_jobs');
      const { data } = await supabase.from('jobs_table').select('*').order('created_at', { ascending: false });
      if (data) setJobs(data);
    })();
  }, []);

  function openAddForm() {
    setEditingJob(null);
    setShowForm(true);
  }

  function openEditForm(job) {
    setEditingJob(job);
    setShowForm(true);
  }

  async function handleSubmit(form) {
    setSaving(true);
    setError('');
    try {
      if (editingJob) {
        const { data, error: updateError } = await supabase
          .from('jobs_table')
          .update(form)
          .eq('id', editingJob.id)
          .select()
          .single();
        if (updateError) throw updateError;
        setJobs((prev) => prev.map((j) => (j.id === data.id ? data : j)));
      } else {
        const { data, error: insertError } = await supabase.from('jobs_table').insert(form).select().single();
        if (insertError) throw insertError;
        setJobs((prev) => [data, ...prev]);
      }
      setShowForm(false);
      setEditingJob(null);
    } catch (err) {
      setError(err.message || 'Could not save the job.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this job posting? This cannot be undone.')) return;
    const { error: deleteError } = await supabase.from('jobs_table').delete().eq('id', id);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    setJobs((prev) => prev.filter((j) => j.id !== id));
  }

  async function toggleStatus(job) {
    const nextStatus = job.status === 'closed' ? 'active' : 'closed';
    const { data, error: updateError } = await supabase
      .from('jobs_table')
      .update({ status: nextStatus })
      .eq('id', job.id)
      .select()
      .single();
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setJobs((prev) => prev.map((j) => (j.id === data.id ? data : j)));
  }

  return (
    <div className="flex flex-col gap-5">
      <AdminCard
        title={showForm ? (editingJob ? 'Edit Job' : 'Add New Job') : 'Jobs'}
        description={showForm ? undefined : 'Post government and private job ads with structured fields the AI matching engine can read.'}
        icon={BriefcaseIcon}
      >
        {error && (
          <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}

        {showForm ? (
          <JobForm
            initialJob={editingJob}
            saving={saving}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingJob(null);
            }}
          />
        ) : (
          <>
            <AutoDeleteSettings settings={settings} onSaved={setSettings} />

            <button
              onClick={openAddForm}
              className="mb-5 flex items-center gap-2 rounded-full bg-atl px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-atl2"
            >
              <PlusIcon className="h-4 w-4" /> Add New Job
            </button>

            {jobs.length === 0 ? (
              <p className="py-8 text-center text-sm text-amuted">No jobs posted yet.</p>
            ) : (
              <ul className="divide-y divide-aline">
                {jobs.map((job) => (
                  <li key={job.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-aink">{job.title}</p>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[0.68rem] font-bold uppercase tracking-wide ${
                            job.job_type === 'Government' ? 'bg-atl/10 text-atl' : 'bg-agold/15 text-agold'
                          }`}
                        >
                          {job.job_type}
                        </span>
                        <span className="rounded-full bg-aline/60 px-2 py-0.5 text-[0.68rem] font-semibold text-amuted">
                          {job.sector}
                        </span>
                        {job.status === 'closed' && (
                          <span className="rounded-full bg-red-100 px-2 py-0.5 text-[0.68rem] font-bold text-red-600">
                            Closed
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-amuted">
                        {job.department} {job.city ? `• ${job.city}` : ''} • Last date:{' '}
                        <span className={isPastLastDate(job.last_date) ? 'font-semibold text-red-600' : ''}>
                          {formatDate(job.last_date)}
                        </span>
                      </p>
                    </div>
                    <div className="flex flex-shrink-0 gap-2">
                      <button
                        onClick={() => setViewingJob(job)}
                        className="flex items-center gap-1 rounded-md border border-aline px-3 py-1.5 text-xs font-semibold text-amuted transition hover:text-aink"
                      >
                        <EyeIcon className="h-3.5 w-3.5" /> View
                      </button>
                      <button
                        onClick={() => toggleStatus(job)}
                        className="rounded-md border border-aline px-3 py-1.5 text-xs font-semibold text-amuted transition hover:text-aink"
                      >
                        {job.status === 'closed' ? 'Reopen' : 'Close'}
                      </button>
                      <button
                        onClick={() => openEditForm(job)}
                        className="flex items-center gap-1 rounded-md border border-atl2/30 bg-atl2/10 px-3 py-1.5 text-xs font-semibold text-atl2 transition hover:bg-atl2 hover:text-white"
                      >
                        <PencilIcon className="h-3.5 w-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(job.id)}
                        className="flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-600 hover:text-white"
                      >
                        <TrashIcon className="h-3.5 w-3.5" /> Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </AdminCard>

      {viewingJob && (
        <JobDetailsModal
          job={viewingJob}
          onClose={() => setViewingJob(null)}
          onEdit={() => {
            openEditForm(viewingJob);
            setViewingJob(null);
          }}
        />
      )}
    </div>
  );
}
