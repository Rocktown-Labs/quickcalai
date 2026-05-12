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

export interface WelcomeEmailProps {
  name: string;
}

export default function WelcomeEmail({ name }: WelcomeEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Welcome to QuickCalAI - turn any schedule into calendar events instantly</Preview>
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
                Welcome aboard{name ? `, ${name}` : ''}!
              </Text>

              <Text className="text-[#888888] text-base leading-relaxed mb-6">
                You just joined thousands of parents and coaches who use QuickCalAI to extract calendar events from images and PDFs - no more typing schedules by hand.
              </Text>

              <Section className="bg-[#1a1a1a] rounded-lg p-5 mb-6">
                <Text className="text-[#efefef] font-bold mb-2 m-0">
                  Here is how it works:
                </Text>
                <Text className="text-[#888888] text-sm leading-relaxed m-0">
                  1. Upload a photo or PDF of any schedule<br />
                  2. Our AI reads the dates, times, and events<br />
                  3. Download an .ics file and import to any calendar
                </Text>
              </Section>

              <Button
                href="https://quickcalai.com/dashboard"
                className="bg-[#c23326] text-white font-bold px-6 py-3 rounded-lg text-center block box-border"
              >
                Upload Your First Schedule
              </Button>

              <Text className="text-[#888888] text-sm mt-6 mb-0">
                Questions? Just reply to this email - we read every one.
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

WelcomeEmail.PreviewProps = {
  name: 'John',
} satisfies WelcomeEmailProps;

export { WelcomeEmail };