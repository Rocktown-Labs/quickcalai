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

export interface ReEngagementEmailProps {
  name: string;
}

export default function ReEngagementEmail({ name }: ReEngagementEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>We fixed QuickCalAI — and added something you are going to love</Preview>
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
                We owe you an apology{name ? `, ${name}` : ''}
              </Text>

              <Text className="text-[#888888] text-base leading-relaxed mb-4">
                A little while ago, QuickCalAI was in a rough state. Uploads were failing, webhooks were breaking, and frankly, the experience was not what we promised. If you tried the app back then and it did not work — that was on us, not you.
              </Text>

              <Text className="text-[#888888] text-base leading-relaxed mb-6">
                The good news? We have rebuilt the core from the ground up. Here is what is different now:
              </Text>

              <Section className="bg-[#1a1a1a] rounded-lg p-5 mb-6 space-y-3">
                <Text className="text-[#efefef] text-sm leading-relaxed m-0">
                  <span className="text-[#c23326] font-bold">Fixed:</span> Uploads no longer hang or timeout
                </Text>
                <Text className="text-[#efefef] text-sm leading-relaxed m-0">
                  <span className="text-[#c23326] font-bold">Fixed:</span> Premium status now syncs correctly
                </Text>
                <Text className="text-[#efefef] text-sm leading-relaxed m-0">
                  <span className="text-[#c23326] font-bold">New:</span> Shareable preview pages — send a link instead of a file
                </Text>
                <Text className="text-[#efefef] text-sm leading-relaxed m-0">
                  <span className="text-[#c23326] font-bold">New:</span> Manual event creation for one-off entries
                </Text>
              </Section>

              <Text className="text-[#888888] text-base leading-relaxed mb-6">
                We would love for you to give QuickCalAI another shot. Upload a schedule and see the difference for yourself.
              </Text>

              <Button
                href="https://quickcal.ai/dashboard"
                className="bg-[#c23326] text-white font-bold px-6 py-3 rounded-lg text-center block box-border"
              >
                Try QuickCalAI Again
              </Button>

              <Text className="text-[#888888] text-sm mt-6 mb-0">
                If you have any feedback or just want to vent about the old version, hit reply — we are listening.
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

ReEngagementEmail.PreviewProps = {
  name: 'John',
} satisfies ReEngagementEmailProps;

export { ReEngagementEmail };