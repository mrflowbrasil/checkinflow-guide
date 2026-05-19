/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
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

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Seu código de verificação</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Img
            src="https://hub.mrflow.com.br/mrflow-logo.png"
            alt="Mr Flow"
            width="120"
            height="32"
            style={logo}
          />
        </Section>
        <Section style={card}>
          <Heading style={h1}>Confirme sua identidade</Heading>
          <Text style={text}>Use o código abaixo para confirmar sua identidade:</Text>
          <Text style={codeStyle}>{token}</Text>
          <Text style={textSmall}>
            Este código expira em breve. Se você não solicitou, pode ignorar este email
            com segurança.
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

export default ReauthenticationEmail

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
const codeStyle = {
  fontFamily: "'JetBrains Mono', 'Courier New', monospace",
  fontSize: '32px',
  fontWeight: '700' as const,
  color: '#008e8e',
  letterSpacing: '0.2em',
  textAlign: 'center' as const,
  margin: '24px 0',
  padding: '20px',
  backgroundColor: '#f1f5f9',
  borderRadius: '14px',
}
const hr = { borderColor: '#e2e8f0', margin: '32px 0 20px' }
const footer = { fontSize: '12px', color: '#94a3b8', textAlign: 'center' as const, margin: '0' }
