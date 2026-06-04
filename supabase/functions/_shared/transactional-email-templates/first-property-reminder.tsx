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
  ctaUrl?: string
  videoUrl?: string
  videoThumbnailUrl?: string
}

const DEFAULT_CTA = 'https://hub.mrflow.com.br/app/properties/new'
const DEFAULT_VIDEO = 'https://youtu.be/l8SxORuMqLU'
const DEFAULT_THUMB = 'https://img.youtube.com/vi/l8SxORuMqLU/maxresdefault.jpg'

const FirstPropertyReminder = ({
  firstName,
  ctaUrl = DEFAULT_CTA,
  videoUrl = DEFAULT_VIDEO,
  videoThumbnailUrl = DEFAULT_THUMB,
}: Props) => {
  const greeting = firstName ? `Olá, ${firstName}!` : 'Olá!'
  return (
    <Html lang="pt-BR" dir="ltr">
      <Head />
      <Preview>Cadastre seu primeiro imóvel em menos de 5 minutos</Preview>
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
            <Heading style={h1}>Vamos cadastrar seu primeiro imóvel?</Heading>
            <Text style={text}>{greeting}</Text>
            <Text style={text}>
              Notamos que você criou sua conta no <strong>Mr Flow Welcome Hub</strong>{' '}
              mas ainda não cadastrou nenhum imóvel. Para te ajudar, gravamos um vídeo
              rápido mostrando como fazer isso em <strong>menos de 5 minutos</strong>.
            </Text>

            <Section style={{ textAlign: 'center' as const, margin: '28px 0' }}>
              <Link href={videoUrl} style={videoLink}>
                <Img
                  src={videoThumbnailUrl}
                  alt="Veja como criar seu imóvel em menos de 5 minutos"
                  width="496"
                  style={thumb}
                />
              </Link>
              <Text style={videoCaption}>
                <Link href={videoUrl} style={link}>
                  ▶ Assistir no YouTube
                </Link>
              </Text>
            </Section>

            <Section style={{ textAlign: 'center' as const, margin: '32px 0 8px' }}>
              <Button style={button} href={ctaUrl}>
                Cadastrar meu primeiro imóvel
              </Button>
            </Section>

            <Text style={textSmall}>
              Se precisar de ajuda, é só responder este email. Estamos por aqui para
              encantar seus hóspedes desde o primeiro momento.
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
  component: FirstPropertyReminder,
  subject: 'Cadastre seu primeiro imóvel em menos de 5 minutos 🎥',
  displayName: 'Lembrete: cadastrar primeiro imóvel (24h)',
  previewData: {
    firstName: 'Marina',
    ctaUrl: DEFAULT_CTA,
    videoUrl: DEFAULT_VIDEO,
    videoThumbnailUrl: DEFAULT_THUMB,
  },
} satisfies TemplateEntry

export default FirstPropertyReminder

const main = {
  backgroundColor: '#ffffff',
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
  margin: '24px 0 0',
}
const link = { color: '#008e8e', textDecoration: 'none', fontWeight: '600' as const }
const videoLink = {
  position: 'relative' as const,
  display: 'inline-block',
  textDecoration: 'none',
  lineHeight: '0',
}
const thumb = {
  borderRadius: '12px',
  display: 'block',
  width: '100%',
  maxWidth: '496px',
  height: 'auto',
  border: '1px solid #e2e8f0',
}
const playOverlay = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  margin: '0',
}
const videoCaption = {
  fontSize: '13px',
  color: '#64748b',
  textAlign: 'center' as const,
  margin: '10px 0 0',
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
