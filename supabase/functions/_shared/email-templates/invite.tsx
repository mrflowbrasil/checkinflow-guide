/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

export const InviteEmail = ({
  siteName,
  siteUrl,
  confirmationUrl,
}: InviteEmailProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Você foi convidado para o {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Img
            src="https://pgdfcufjdyhmaqikwbdq.supabase.co/storage/v1/object/public/email-assets/mrflow-logo.png"
            alt="Mr Flow"
            width="120"
            height="32"
            style={logo}
          />
        </Section>
        <Section style={card}>
          <Heading style={h1}>Você foi convidado</Heading>
          <Text style={text}>
            Você recebeu um convite para fazer parte do{' '}
            <Link href={siteUrl} style={link}>
              <strong>{siteName}</strong>
            </Link>
            . Clique no botão abaixo para aceitar e criar sua conta de anfitrião.
          </Text>
          <Section style={{ textAlign: 'center' as const, margin: '32px 0' }}>
            <Button style={button} href={confirmationUrl}>
              Aceitar convite
            </Button>
          </Section>
          <Text style={textSmall}>
            Se você não esperava este convite, pode ignorar este email com segurança.
          </Text>
        </Section>
        <Hr style={hr} />
        <Text style={footer}>
          © 2026 Mr Flow Welcome Hub · Encantando hóspedes desde o primeiro momento.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default InviteEmail

const main = {
  backgroundColor: '#f6f6f7',
  fontFamily:
    "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
  padding: '40px 0',
}
const container = { maxWidth: '560px', margin: '0 auto', padding: '0 20px' }
const header = { padding: '0 0 24px', textAlign: 'center' as const }
const logo = { margin: '0 auto', height: '32px', width: 'auto' }
const card = {
  backgroundColor: '#ffffff',
  borderRadius: '14px',
  padding: '40px 32px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
}
const h1 = { fontSize: '24px', fontWeight: '700' as const, color: '#0f172a', margin: '0 0 16px', lineHeight: '1.3' }
const text = { fontSize: '15px', color: '#475569', lineHeight: '1.6', margin: '0 0 16px' }
const textSmall = { fontSize: '13px', color: '#64748b', lineHeight: '1.6', margin: '24px 0 0' }
const link = { color: '#008e8e', textDecoration: 'none' }
const button = {
  backgroundColor: '#008e8e',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: '600' as const,
  borderRadius: '14px',
  padding: '14px 28px',
  textDecoration: 'none',
  display: 'inline-block',
}
const hr = { borderColor: '#e2e8f0', margin: '32px 0 20px' }
const footer = { fontSize: '12px', color: '#94a3b8', textAlign: 'center' as const, margin: '0' }
