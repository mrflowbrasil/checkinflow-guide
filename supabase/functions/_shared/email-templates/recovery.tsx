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
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
}

export const RecoveryEmail = ({
  siteName,
  confirmationUrl,
}: RecoveryEmailProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Redefina sua senha do {siteName}</Preview>
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
          <Heading style={h1}>Redefinir sua senha</Heading>
          <Text style={text}>
            Recebemos um pedido para redefinir a senha da sua conta no{' '}
            <span style={brandHighlight}>Mr Flow Welcome Hub</span>. Clique no
            botão abaixo para escolher uma nova senha.
          </Text>
          <Section style={{ textAlign: 'center' as const, margin: '32px 0' }}>
            <Button style={button} href={confirmationUrl}>
              Redefinir senha
            </Button>
          </Section>
          <Text style={textSmall}>
            Este link expira em 1 hora. Se você não solicitou a redefinição, pode
            ignorar este email — sua senha continua a mesma.
          </Text>
        </Section>
        <Hr style={hr} />
        <Text style={footer}>
          © 2026 Mr Flow Welcome Hub · Encantando hóspedes desde o primeiro
          momento.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default RecoveryEmail

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
const h1 = {
  fontSize: '24px',
  fontWeight: '700' as const,
  color: '#0f172a',
  margin: '0 0 16px',
  lineHeight: '1.3',
}
const text = {
  fontSize: '15px',
  color: '#475569',
  lineHeight: '1.6',
  margin: '0 0 16px',
}
const brandHighlight = {
  color: '#008e8e',
  fontWeight: '700' as const,
}
const textSmall = {
  fontSize: '13px',
  color: '#64748b',
  lineHeight: '1.6',
  margin: '24px 0 0',
}
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
const footer = {
  fontSize: '12px',
  color: '#94a3b8',
  textAlign: 'center' as const,
  margin: '0',
}
