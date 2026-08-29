'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import AdminCard from './AdminCard';
import JobForm from './JobForm';
import JobDetailsModal from './JobDetailsModal';
import { BriefcaseIcon, PlusIcon, PencilIcon, TrashIcon, EyeIcon } from './icons';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function JobsManager({ initialJobs = [] }) {
  const [jobs, setJobs] = useState(initialJobs);
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [viewingJob, setViewingJob] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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
                        {job.department} {job.city ? `• ${job.city}` : ''} • Last date: {formatDate(job.last_date)}
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
