import { Task, Meeting } from '../types';

/**
 * Service to generate Google Calendar links and push events via Google Calendar API.
 */

export interface GoogleCalendarEvent {
  summary: string;
  description?: string;
  start: { dateTime?: string; date?: string; timeZone?: string };
  end: { dateTime?: string; date?: string; timeZone?: string };
  location?: string;
}

/**
 * Generates a 1-click Google Calendar URL for adding a task deadline or meeting.
 */
export function generateGoogleCalendarUrl(params: {
  title: string;
  description?: string;
  startDate?: string; // YYYY-MM-DD or ISO string
  endDate?: string;
  location?: string;
}): string {
  const baseUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
  const textParam = `&text=${encodeURIComponent(params.title)}`;

  let datesParam = '';
  if (params.startDate) {
    // Format YYYYMMDDTHHMMSSZ or YYYYMMDD
    const cleanStart = params.startDate.replace(/[-:]/g, '').split('.')[0];
    const cleanEnd = params.endDate
      ? params.endDate.replace(/[-:]/g, '').split('.')[0]
      : cleanStart;
    
    // If only date YYYYMMDD (length 8)
    if (cleanStart.length === 8) {
      datesParam = `&dates=${cleanStart}/${cleanEnd}`;
    } else {
      datesParam = `&dates=${cleanStart}Z/${cleanEnd}Z`;
    }
  }

  const detailsParam = params.description
    ? `&details=${encodeURIComponent(params.description)}`
    : '';
  const locationParam = params.location
    ? `&location=${encodeURIComponent(params.location)}`
    : '';

  return `${baseUrl}${textParam}${datesParam}${detailsParam}${locationParam}`;
}

/**
 * Helper to generate Google Calendar URL for a Task.
 */
export function getTaskGoogleCalendarUrl(task: Task): string {
  const startDate = task.deadline || task.startDate || new Date().toISOString().split('T')[0];
  const formattedStart = startDate.includes('T') ? startDate : `${startDate}T09:00:00`;
  const formattedEnd = startDate.includes('T') ? startDate : `${startDate}T17:00:00`;
  const departmentName = task.groupName || task.assigneeDept || 'Semua Divisi';

  const description = `Task: ${task.title}\n` +
    `Divisi: ${departmentName}\n` +
    `Prioritas: ${task.priority.toUpperCase()}\n` +
    `Status: ${task.status.toUpperCase()}\n` +
    `Deskripsi: ${task.description || '-'}\n\n` +
    `Di-sync dari AI Studio Workspace.`;

  return generateGoogleCalendarUrl({
    title: `[TASK] ${task.title}`,
    description,
    startDate: formattedStart,
    endDate: formattedEnd,
    location: `Workspace AI Studio - ${departmentName}`
  });
}

/**
 * Helper to generate Google Calendar URL for a Meeting.
 */
export function getMeetingGoogleCalendarUrl(meeting: Meeting): string {
  const timeStr = meeting.startTime || '10:00';
  const startIso = `${meeting.date}T${timeStr}:00`;
  const description = `Meeting: ${meeting.title}\n` +
    `Penyelenggara: ${meeting.organizerName}\n` +
    `Deskripsi: ${meeting.description || '-'}\n` +
    `Link Meeting: ${meeting.meetLink || '-'}`;

  return generateGoogleCalendarUrl({
    title: `[MEETING] ${meeting.title}`,
    description,
    startDate: startIso,
    endDate: startIso,
    location: meeting.meetLink || meeting.location || 'Online'
  });
}

/**
 * Syncs a task directly to Google Calendar API if access token is present,
 * or opens Google Calendar render URL as seamless fallback.
 */
export async function syncTaskToGoogleCalendar(
  task: Task,
  accessToken?: string
): Promise<{ success: boolean; eventUrl?: string; message: string }> {
  if (!accessToken) {
    // Fallback: Open Google Calendar in 1-click modal window
    const url = getTaskGoogleCalendarUrl(task);
    window.open(url, '_blank', 'noopener,noreferrer');
    return {
      success: true,
      eventUrl: url,
      message: 'Membuka Google Calendar untuk menyimpan jadwal tugas.'
    };
  }

  try {
    const startDate = task.deadline || task.startDate || new Date().toISOString().split('T')[0];
    const departmentName = task.groupName || task.assigneeDept || 'Global';

    const eventBody: GoogleCalendarEvent = {
      summary: `[TASK] ${task.title}`,
      description: `Task: ${task.title}\nDivisi: ${departmentName}\nPrioritas: ${task.priority.toUpperCase()}\n\n${task.description || ''}`,
      start: {
        date: startDate.includes('T') ? undefined : startDate,
        dateTime: startDate.includes('T') ? startDate : undefined,
        timeZone: 'Asia/Jakarta'
      },
      end: {
        date: startDate.includes('T') ? undefined : startDate,
        dateTime: startDate.includes('T') ? startDate : undefined,
        timeZone: 'Asia/Jakarta'
      },
      location: `Workspace - ${departmentName}`
    };

    const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventBody)
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `HTTP ${res.status}`);
    }

    const data = await res.json();
    return {
      success: true,
      eventUrl: data.htmlLink,
      message: 'Jadwal berhasil disinkronisasi ke Google Calendar!'
    };
  } catch (err: any) {
    const fallbackUrl = getTaskGoogleCalendarUrl(task);
    window.open(fallbackUrl, '_blank', 'noopener,noreferrer');
    return {
      success: true,
      eventUrl: fallbackUrl,
      message: `Google Calendar API notice: ${err.message}. Membuka tautan langsung Google Calendar.`
    };
  }
}

/**
 * Syncs a meeting directly to primary Google Calendar API, or opens 1-click URL fallback.
 */
export async function syncMeetingToGoogleCalendar(
  meeting: Meeting,
  accessToken?: string
): Promise<{ success: boolean; eventUrl?: string; message: string }> {
  if (!accessToken) {
    const url = getMeetingGoogleCalendarUrl(meeting);
    window.open(url, '_blank', 'noopener,noreferrer');
    return {
      success: true,
      eventUrl: url,
      message: 'Membuka Google Calendar untuk menyimpan jadwal meeting.'
    };
  }

  try {
    const timeStart = meeting.startTime || '10:00';
    const timeEnd = meeting.endTime || '11:00';
    const startDateTime = `${meeting.date}T${timeStart}:00`;
    const endDateTime = `${meeting.date}T${timeEnd}:00`;

    const eventBody: GoogleCalendarEvent = {
      summary: `[MEETING] ${meeting.title}`,
      description: `Meeting: ${meeting.title}\nPenyelenggara: ${meeting.organizerName}\nDeskripsi: ${meeting.description || '-'}\nLink: ${meeting.meetLink || '-'}`,
      start: {
        dateTime: startDateTime,
        timeZone: 'Asia/Jakarta'
      },
      end: {
        dateTime: endDateTime,
        timeZone: 'Asia/Jakarta'
      },
      location: meeting.meetLink || meeting.location || 'Online'
    };

    const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventBody)
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `HTTP ${res.status}`);
    }

    const data = await res.json();
    return {
      success: true,
      eventUrl: data.htmlLink,
      message: 'Jadwal meeting berhasil di-push ke Google Calendar!'
    };
  } catch (err: any) {
    const fallbackUrl = getMeetingGoogleCalendarUrl(meeting);
    window.open(fallbackUrl, '_blank', 'noopener,noreferrer');
    return {
      success: true,
      eventUrl: fallbackUrl,
      message: `Notice: ${err.message}. Membuka tautan langsung Google Calendar.`
    };
  }
}
