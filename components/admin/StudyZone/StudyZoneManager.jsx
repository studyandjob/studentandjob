'use client';

import { useState } from 'react';
import AdminCard from '../AdminCard';
import { GraduationCapIcon, SparklesIcon, BookIcon, FileTextIcon } from '../icons';
import ClassesSubjectsManager from './ClassesSubjectsManager';
import QuestionGenerator from './QuestionGenerator';
import QuestionBankBrowser from './QuestionBankBrowser';
import StudyMaterialsManager from './StudyMaterialsManager';

const SUB_TABS = [
  { id: 'generate', label: 'Generate Questions (AI)', icon: SparklesIcon },
  { id: 'bank', label: 'Question Bank', icon: BookIcon },
  { id: 'materials', label: 'Guess & Old Papers', icon: FileTextIcon },
  { id: 'setup', label: 'Classes & Subjects', icon: GraduationCapIcon },
];

export default function StudyZoneManager({ initialClasses = [], initialSubjects = [], initialMaterials = [] }) {
  const [subTab, setSubTab] = useState('generate');
  const [classes, setClasses] = useState(initialClasses);
  const [subjects, setSubjects] = useState(initialSubjects);

  return (
    <AdminCard
      title="Study Zone — AI Exam Engine"
      description="Manage classes/subjects, generate AI questions from chapter content, and publish guess/old papers."
      icon={GraduationCapIcon}
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

      {classes.length === 0 && subTab !== 'setup' && (
        <p className="mb-4 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
          Add at least one class and subject under "Classes & Subjects" before generating or browsing questions.
        </p>
      )}

      {subTab === 'generate' && <QuestionGenerator classes={classes} subjects={subjects} />}
      {subTab === 'bank' && <QuestionBankBrowser classes={classes} subjects={subjects} />}
      {subTab === 'materials' && <StudyMaterialsManager classes={classes} subjects={subjects} initialRows={initialMaterials} />}
      {subTab === 'setup' && (
        <ClassesSubjectsManager classes={classes} subjects={subjects} onClassesChange={setClasses} onSubjectsChange={setSubjects} />
      )}
    </AdminCard>
  );
}
