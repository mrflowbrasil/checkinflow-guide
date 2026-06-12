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
import type { TemplateEntry } from './registry.ts'

interface Props {
  firstName?: string
  email?: string
  tempPassword?: string
  resetUrl?: string
  appUrl?: string
}

const DEFAULT_RESET = 'https://hub.mrflow.com.br/reset-password'
const DEFAULT_APP = 'https://hub.mrflow.com.br/app'

const QuickSignupWelcome = ({
  firstName,
  email,
  tempPassword,
  resetUrl = DEFAULT_RESET,
  appUrl = DEFAULT_APP,
}: Props) => {
  const greeting = firstName ? `Olá, ${firstName}!` : 'Olá!'
  return (
    <Html lang="pt-BR" dir="ltr">
      <Head />
      <Preview>Sua conta no Mr Flow Welcome Hub está pronta — guarde sua senha</Preview>
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
            <Heading style={h1}>Bem-vindo ao Welcome Hub 🎉</Heading>
            <Text style={text}>{greeting}</Text>
            <Text style={text}>
              Sua conta foi criada com sucesso e você já tem{' '}
              <strong>30 dias grátis no plano Single</strong>, sem cartão de crédito.
            </Text>

            <Text style={textSmall}>Seu acesso:</Text>
            <Section style={credentialsBox}>
              <Text style={credLabel}>E-mail</Text>
              <Text style={credValue}>{email}</Text>
              <Text style={{ ...credLabel, marginTop: '12px' }}>Senha temporária</Text>
              <Text style={passwordValue}>{tempPassword}</Text>
            </Section>

            <Text style={text}>
              Por segurança, recomendamos trocar essa senha agora mesmo — leva menos de 1 minuto.
            </Text>

            <Section style={{ textAlign: 'center' as const, margin: '28px 0 8px' }}>
              <Button style={button} href={resetUrl}>
                Trocar minha senha agora
              </Button>
            </Section>

            <Text style={textSmall}>
              Ou{' '}
              <Link href={appUrl} style={link}>
                acessar meu painel
              </Link>{' '}
              direto e trocar depois nas configurações.
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
}

export const template = {
  component: QuickSignupWelcome,
  subject: 'Sua conta no Welcome Hub está pronta 🎉',
  displayName: 'Cadastro rápido (landing page)',
  previewData: {
    firstName: 'Marina',
    email: 'marina@example.com',
    tempPassword: 'Aa3@K9p2WqLm7Rn4',
    resetUrl: DEFAULT_RESET,
    appUrl: DEFAULT_APP,
  },
} satisfies TemplateEntry

export default QuickSignupWelcome

const main = {
  backgroundColor: '#ffffff',
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
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
  border: '1px solid #e2e8f0',
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
  margin: '0 0 14px',
}
const textSmall = {
  fontSize: '13px',
  color: '#64748b',
  lineHeight: '1.6',
  margin: '20px 0 8px',
  fontWeight: '600' as const,
}
const credentialsBox = {
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  padding: '16px 20px',
  margin: '8px 0 18px',
}
const credLabel = {
  fontSize: '11px',
  color: '#64748b',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.08em',
  margin: '0 0 4px',
  fontWeight: '600' as const,
}
const credValue = {
  fontSize: '15px',
  color: '#0f172a',
  margin: '0',
  fontWeight: '500' as const,
}
const passwordValue = {
  fontSize: '18px',
  color: '#0f172a',
  margin: '0',
  fontFamily: "'SF Mono', Menlo, Consolas, monospace",
  fontWeight: '700' as const,
  letterSpacing: '0.04em',
}
const link = { color: '#008e8e', textDecoration: 'none', fontWeight: '600' as const }
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
