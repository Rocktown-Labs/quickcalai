import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Button,
  Tailwind,
} from '@react-email/components';

export interface ProcessingCompleteEmailProps {
  fileName: string;
  eventCount: number;
  shareUrl?: string;
  icsUrl?: string;
}

export default function ProcessingCompleteEmail({
  fileName,
  eventCount,
  shareUrl,
  icsUrl,
}: ProcessingCompleteEmailProps) {
  const displayName = fileName.replace(/\.[^/.]+$/, '');

  return (
    <Html lang="en">
      <Head />
      <Preview>Your calendar events from {displayName} are ready</Preview>
      <Tailwind>
        <Body className="bg-[#0a0a0a] font-sans py-8">
          <Container className="max-w-[600px] mx-auto bg-[#161616] rounded-xl overflow-hidden">
            {/* Header */}
            <Section className="bg-[#c23326] px-8 py-6">
              <Text className="text-white text-2xl font-bold m-0">
                QuickCalAI
              </Text>
            </Section>

            {/* Content */}
            <Section className="px-8 py-8">
              <Text className="text-[#efefef] text-xl font-bold mb-4">
                Your calendar is ready!
              </Text>

              <Text className="text-[#888888] text-base leading-relaxed mb-6">
                We found <span className="text-[#efefef] font-bold">{eventCount} event{eventCount !== 1 ? 's' : ''}</span> in <span className="text-[#efefef] font-bold">{displayName}</span>.
              </Text>

              {shareUrl && (
                <Section className="bg-[#1a1a1a] rounded-lg p-5 mb-4">
                  <Text className="text-[#efefef] font-bold mb-2 m-0">
                    Share with your team
                  </Text>
                  <Text className="text-[#888888] text-sm leading-relaxed mb-3 m-0">
                    Send this link so others can view and download the calendar without signing up:
                  </Text>
                  <Button
                    href={shareUrl}
                    className="bg-[#c23326] text-white font-bold px-6 py-3 rounded-lg text-center block box-border"
                  >
                    View Shared Schedule
                  </Button>
                </Section>
              )}

              {icsUrl && (
                <Button
                  href={icsUrl}
                  className="bg-[#212121] border border-[#333333] text-[#efefef] font-bold px-6 py-3 rounded-lg text-center block box-border mt-4"
                >
                  Download .ics File
                </Button>
              )}

              <Text className="text-[#888888] text-sm mt-6 mb-0">
                Import the .ics file into Google Calendar, Outlook, Apple Calendar, or any app that supports calendar files.
              </Text>
            </Section>

            {/* Footer */}
            <Section className="px-8 py-6 border-t border-[#333333]">
              <Text className="text-[#666666] text-xs text-center m-0">
                QuickCalAI · Making schedule sharing effortless
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

ProcessingCompleteEmail.PreviewProps = {
  fileName: 'Football 2026-27.pdf',
  eventCount: 12,
  shareUrl: 'https://quickcalai.com/s/abc123',
  icsUrl: 'https://blob.vercel-storage.com/calendar.ics',
} satisfies ProcessingCompleteEmailProps;

export { ProcessingCompleteEmail };