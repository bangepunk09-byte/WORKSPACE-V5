/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Link,
  Calendar,
  Layers,
  Paperclip,
  Clock,
  Send,
  AlertCircle,
  Check,
  ExternalLink,
  Users,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { Task, User, TaskStatus, TaskWorkflowStep } from '../../types';
import { soundEffects } from '../../services/soundEffects';
import { syncTaskToGoogleCalendar } from '../../services/googleCalendarService';

interface TaskDetailDrawerProps {
  task: Task | null;
  onClose: () => void;
  onUpdateStatus?: (taskId: string, newStatus: TaskStatus) => void;
  onUpdateTask?: (task: Task) => void;
  onRestoreTask?: (taskId: string) => void;
  onRequestApproval?: (task: Task) => void;
  currentUser?: User;
}

export const TaskDetailDrawer: React.FC<TaskDetailDrawerProps> = ({
  task,
  onClose,
  onUpdateStatus,
  onUpdateTask,
  onRestoreTask,
  onRequestApproval,
  currentUser
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [newComment, setNewComment] = useState('');

  if (!task) return null;

  const isArchived = task.isArchived;

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'done': return { label: 'Completed', color: 'bg-emerald-100 text-emerald-800' };
      case 'on_review': case 'review': return { label: 'In Review', color: 'bg-amber-100 text-amber-800' };
      case 'on_progress': case 'in_progress': return { label: 'In Progress', color: 'bg-emerald-100 text-emerald-800' };
      default: return { label: 'To Do', color: 'bg-slate-100 text-slate-700' };
    }
  };

  const statusInfo = getStatusBadge(task.status);

  // Workflow steps with interactive state
  const [steps, setSteps] = useState<TaskWorkflowStep[]>(() => {
    if (task.workflowSteps && task.workflowSteps.length > 0) {
      return task.workflowSteps;
    }
    const isDone = task.status === 'done';
    const isReview = task.status === 'on_review' || task.status === 'review';
    const isProgress = task.status === 'on_progress' || task.status === 'in_progress';

    return [
      {
        id: 'step-1',
        name: 'Content Brief',
        description: 'Buat brief konten (copy, angle, & visual direction)',
        status: isProgress || isReview || isDone ? 'approved' : 'in_progress',
        assigneeName: 'Kiki Pratama',
        assigneeRole: 'Copywriter',
        assigneeAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        deadline: task.briefDeadline || '8 Nov',
        submittedDate: isProgress || isReview || isDone ? '8 Nov' : undefined,
        hasBrief: true,
        briefApprovalStatus: isProgress || isReview || isDone ? 'approved' : 'idle',
        briefApprover: {
          id: 'user-sarah',
          name: 'Sarah Jenkins',
          role: 'Content Lead',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
          groupName: '#marketing-announcement'
        }
      },
      {
        id: 'step-2',
        name: 'Design Production',
        description: 'Produksi desain berdasarkan brief yang disetujui',
        status: isDone || isReview ? 'completed' : isProgress ? 'in_progress' : 'waiting',
        assigneeName: task.assigneeName || 'Shakti Ramadhan',
        assigneeRole: 'Senior Designer',
        assigneeAvatar: task.assigneeAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
        deadline: task.designDeadline || '10 Nov',
        hasDeliverable: true,
        submittedLink: isReview || isDone ? 'https://www.figma.com/file/asli-ri-promo-tiket-v2' : ''
      },
      {
        id: 'step-3',
        name: 'Final Approval',
        description: 'Approval hasil desain untuk publikasi (Creative Lead & Content Lead)',
        status: isDone ? 'approved' : isReview ? 'in_progress' : 'waiting',
        creativeLeadApproval: {
          reviewerName: 'Alex Tan',
          reviewerRole: 'Creative Lead',
          reviewerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
          status: isDone ? 'approved' : 'pending'
        },
        contentLeadApproval: {
          reviewerName: 'Sarah Jenkins',
          reviewerRole: 'Content Lead',
          reviewerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
          status: isDone ? 'approved' : 'pending'
        }
      },
      {
        id: 'step-4',
        name: 'Completed',
        description: 'Konten siap dipublikasikan ke media sosial brand',
        status: isDone ? 'completed' : 'waiting'
      }
    ];
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-start p-6 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-3xl my-auto rounded-3xl bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 space-y-4">
            <h2 className="text-2xl font-black text-slate-900">{task.title}</h2>
            <p className="text-sm text-slate-600">{task.description}</p>
        </div>

        {/* Content - Vertical Scrolling */}
        <div className="p-7 space-y-10 text-xs">
          <section className="space-y-4">
            <h3 className="font-black text-slate-400 uppercase tracking-widest">Workflow</h3>
            {/* ... workflow steps ... */}
          </section>

          <section className="space-y-4">
            <h3 className="font-black text-slate-400 uppercase tracking-widest">Brief Content</h3>
             <div className="bg-slate-50 p-6 rounded-3xl space-y-5">
                <input type="text" defaultValue={task.title} className="w-full bg-white border-none rounded-2xl px-4 py-3" />
                <textarea defaultValue={task.description} rows={4} className="w-full bg-white border-none rounded-2xl px-4 py-3" />
             </div>
          </section>

          <section className="space-y-4">
            <h3 className="font-black text-slate-400 uppercase tracking-widest">Files</h3>
             {/* ... files ... */}
          </section>

          <section className="space-y-4">
            <h3 className="font-black text-slate-400 uppercase tracking-widest">Activity</h3>
             {/* ... activity ... */}
          </section>

          <section className="space-y-4">
            <h3 className="font-black text-slate-400 uppercase tracking-widest">Comments</h3>
             {/* ... comments ... */}
          </section>
        </div>
      </div>
    </div>
  );
};
