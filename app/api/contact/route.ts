import { NextResponse } from 'next/server'
import { FAVICON_96_URL, SITE_DOMAIN } from '@/lib/config'
import type { ContactPayload } from '@/types'

type ParseContactPayloadResult =
  | { success: true; data: ContactPayload }
  | { success: false; error: string }

type WebhookPayload =
  | ReturnType<typeof buildDiscordPayload>
  | ReturnType<typeof buildSlackPayload>
  | ReturnType<typeof buildGenericPayload>

function normalizeField(value: unknown): string | null {
  if (typeof value !== 'string') return null
  return value.trim()
}

function parseContactPayload(value: unknown): ParseContactPayloadResult {
  if (!value || typeof value !== 'object') {
    return { success: false, error: 'Invalid request body' }
  }

  const body = value as Record<string, unknown>
  const name = normalizeField(body.name)
  const email = normalizeField(body.email)
  const message = normalizeField(body.message)

  if (!name || !email || !message) {
    return { success: false, error: 'Missing required fields' }
  }

  return {
    success: true,
    data: {
      name,
      email,
      budget: normalizeField(body.budget) ?? '',
      projectType: normalizeField(body.projectType) ?? '',
      message,
    },
  }
}

function isDiscordWebhook(url: string): boolean {
  return url.includes('discord.com/api/webhooks')
}

function isSlackWebhook(url: string): boolean {
  return url.includes('hooks.slack.com')
}

function buildDiscordPayload(body: ContactPayload) {
  return {
    username: SITE_DOMAIN,
    avatar_url: FAVICON_96_URL,
    embeds: [
      {
        author: {
          name: '📬  New Project Inquiry',
        },
        description: `**${body.name}** submitted a project inquiry.`,
        color: 0xd4ff00,
        fields: [
          { name: '👤  Name', value: `\`${body.name}\``, inline: true },
          { name: '📧  Email', value: `\`${body.email}\``, inline: true },
          { name: '\u200b', value: '\u200b', inline: true },
          {
            name: '💰  Budget',
            value: `\`${body.budget || 'Not specified'}\``,
            inline: true,
          },
          {
            name: '📁  Project Type',
            value: `\`${body.projectType || 'Not specified'}\``,
            inline: true,
          },
          { name: '\u200b', value: '\u200b', inline: true },
          { name: '📝  Message', value: `>>> ${body.message}` },
        ],
        thumbnail: {
          url: FAVICON_96_URL,
        },
        footer: {
          text: `${SITE_DOMAIN}  •  Contact Form`,
          icon_url: FAVICON_96_URL,
        },
        timestamp: new Date().toISOString(),
      },
    ],
  }
}

function buildSlackPayload(body: ContactPayload) {
  return {
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: 'New Project Inquiry' },
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Name:*\n${body.name}` },
          { type: 'mrkdwn', text: `*Email:*\n${body.email}` },
          {
            type: 'mrkdwn',
            text: `*Budget:*\n${body.budget || 'Not specified'}`,
          },
          {
            type: 'mrkdwn',
            text: `*Project Type:*\n${body.projectType || 'Not specified'}`,
          },
        ],
      },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: `*Message:*\n${body.message}` },
      },
    ],
  }
}

function buildGenericPayload(body: ContactPayload) {
  return {
    name: body.name,
    email: body.email,
    budget: body.budget,
    projectType: body.projectType,
    message: body.message,
    timestamp: new Date().toISOString(),
  }
}

function buildWebhookPayload(
  webhookUrl: string,
  body: ContactPayload,
): WebhookPayload {
  if (isDiscordWebhook(webhookUrl)) {
    return buildDiscordPayload(body)
  }

  if (isSlackWebhook(webhookUrl)) {
    return buildSlackPayload(body)
  }

  return buildGenericPayload(body)
}

export async function POST(request: Request) {
  try {
    let rawBody: unknown
    try {
      rawBody = await request.json()
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON body' },
        { status: 400 },
      )
    }

    const parsedBody = parseContactPayload(rawBody)
    if (!parsedBody.success) {
      return NextResponse.json(
        { success: false, error: parsedBody.error },
        { status: 400 },
      )
    }

    const body = parsedBody.data

    const webhookUrl = process.env.CONTACT_WEBHOOK_URL
    if (!webhookUrl) {
      console.warn('CONTACT_WEBHOOK_URL not configured')
      return NextResponse.json({ success: true })
    }

    const webhookRes = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildWebhookPayload(webhookUrl, body)),
    })

    if (!webhookRes.ok) {
      const errText = await webhookRes.text().catch(() => 'Unknown error')
      console.error(`Webhook failed (${webhookRes.status}): ${errText}`)
      return NextResponse.json(
        { success: false, error: 'Webhook delivery failed' },
        { status: 502 },
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Contact route error:', err)
    return NextResponse.json(
      { success: false, error: 'Internal error' },
      { status: 500 },
    )
  }
}
