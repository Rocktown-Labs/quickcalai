import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { db } from '@quickcalai/db';
import { uploads, events } from '@quickcalai/db/schema';
import { eq } from '@quickcalai/db';
import { Calendar, Clock, MapPin, Download, CalendarDays } from 'lucide-react';
import Link from 'next/link';

interface SharePageProps {
  params: Promise<{ token: string }>;
}

async function getSharedUpload(token: string) {
  const upload = await db
    .select({
      id: uploads.id,
      fileName: uploads.fileName,
      icsUrl: uploads.icsUrl,
      status: uploads.status,
      createdAt: uploads.createdAt,
    })
    .from(uploads)
    .where(eq(uploads.shareToken, token))
    .limit(1);

  if (!upload[0] || upload[0].status !== 'completed') {
    return null;
  }

  const uploadEvents = await db
    .select({
      id: events.id,
      title: events.title,
      description: events.description,
      location: events.location,
      startTime: events.startTime,
      endTime: events.endTime,
      isAllDay: events.isAllDay,
    })
    .from(events)
    .where(eq(events.uploadId, upload[0].id))
    .orderBy(events.startTime);

  return {
    upload: upload[0],
    events: uploadEvents,
  };
}

export async function generateMetadata({ params }: SharePageProps): Promise<Metadata> {
  const { token } = await params;
  const data = await getSharedUpload(token);

  if (!data) {
    return { title: 'Schedule Not Found | QuickCalAI' };
  }

  const fileName = data.upload.fileName.replace(/\.[^/.]+$/, '');
  return {
    title: `${fileName} — QuickCalAI`,
    description: `${data.events.length} events ready to add to your calendar`,
  };
}

function formatEventDate(startTime: Date, isAllDay: boolean) {
  const date = new Date(startTime);
  if (isAllDay) {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatEventTime(startTime: Date, endTime: Date | null) {
  const start = new Date(startTime);
  const startStr = start.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  if (!endTime) return startStr;

  const end = new Date(endTime);
  const endStr = end.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  return `${startStr} – ${endStr}`;
}

export default async function SharePage({ params }: SharePageProps) {
  const { token } = await params;
  const data = await getSharedUpload(token);

  if (!data) {
    notFound();
  }

  const { upload, events: uploadEvents } = data;
  const fileName = upload.fileName.replace(/\.[^/.]+$/, '');

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#efefef]">
      <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <CalendarDays className="w-6 h-6 text-[#c23326]" />
            <span className="text-sm font-bold text-[#c23326]">QuickCalAI</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{fileName}</h1>
          <p className="text-[#888888]">
            {uploadEvents.length} event{uploadEvents.length !== 1 ? 's' : ''} ready to add to your calendar
          </p>
        </div>

        {/* Download Button */}
        {upload.icsUrl && (
          <a
            href={upload.icsUrl}
            download={`${fileName}.ics`}
            className="flex items-center justify-center gap-2 w-full bg-[#c23326] hover:bg-[#d43d2f] text-white font-bold py-3 px-6 rounded-xl transition-colors mb-8"
          >
            <Download className="w-5 h-5" />
            Download .ics File
          </a>
        )}

        {/* Events List */}
        <div className="space-y-3">
          {uploadEvents.map((event, index) => (
            <div
              key={event.id}
              className="bg-[#161616] border border-[#333333] rounded-xl p-4 md:p-5"
            >
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center justify-center w-12 h-12 bg-[#c23326]/10 rounded-lg shrink-0">
                  <span className="text-xs font-bold text-[#c23326]">
                    {new Date(event.startTime).toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                  <span className="text-lg font-bold text-[#efefef]">
                    {new Date(event.startTime).getDate()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[#efefef] mb-1 truncate">
                    {event.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#888888]">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatEventTime(event.startTime, event.endTime)}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    )}
                  </div>
                  {event.description && event.description !== event.title && (
                    <p className="text-sm text-[#888888] mt-2 line-clamp-2">
                      {event.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-10 text-center">
          <p className="text-sm text-[#888888]">
            Powered by{' '}
            <Link href="/" className="text-[#c23326] hover:underline">
              QuickCalAI
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}