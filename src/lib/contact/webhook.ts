import { SITE_DOMAIN, SITE_URL } from '../config'
import { APP_VERSION } from '../package-version'

const CONTACT_FAVICON_URL = `${SITE_URL}/favicons/favicon-96x96.png?v=${APP_VERSION}`

import {
  CONTACT_WEBHOOK_TIMEOUT_MS,
  getBudgetLabel,
  getProjectTypeLabel,
} from './constants'
import type {
  ContactPayload,
  ContactWebhookDeliveryResult,
  ContactWebhookTarget,
} from './types'

type ContactWebhookPayload = Record<string, unknown>

// Resolves slug-shaped fields to their human-readable labels for rendering.
// Falls back to the raw slug if the lookup misses (e.g. a replayed payload
// that bypassed validation), so we never silently drop data.
function humanize(contact: ContactPayload): ContactPayload {
  return {
    ...contact,
    projectType:
      getProjectTypeLabel(contact.projectType) ?? contact.projectType,
    budget:
      getBudgetLabel(contact.projectType, contact.budget) ?? contact.budget,
  }
}

function buildDiscordPayload(
  contact: ContactPayload,
  timestamp: string,
): ContactWebhookPayload {
  const display = humanize(contact)
  return {
    username: SITE_DOMAIN,
    avatar_url: CONTACT_FAVICON_URL,
    embeds: [
      {
        author: {
          name: '📬  New Project Inquiry',
        },
        description: `**${display.name}** submitted a project inquiry.`,
        color: 0xd4ff00,
        fields: [
          { name: '👤  Name', value: `\`${display.name}\``, inline: true },
          { name: '📧  Email', value: `\`${display.email}\``, inline: true },
          { name: '\u200b', value: '\u200b', inline: true },
          { name: '💰  Budget', value: `\`${display.budget}\``, inline: true },
          {
            name: '📁  Project Type',
            value: `\`${display.projectType}\``,
            inline: true,
          },
          { name: '\u200b', value: '\u200b', inline: true },
          { name: '📝  Message', value: `>>> ${display.message}` },
        ],
        thumbnail: {
          url: CONTACT_FAVICON_URL,
        },
        footer: {
          text: `${SITE_DOMAIN}  •  Contact Form`,
          icon_url: CONTACT_FAVICON_URL,
        },
        timestamp,
      },
    ],
  }
}

function buildSlackPayload(contact: ContactPayload): ContactWebhookPayload {
  const display = humanize(contact)
  return {
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: 'New Project Inquiry' },
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Name:*\n${display.name}` },
          { type: 'mrkdwn', text: `*Email:*\n${display.email}` },
          { type: 'mrkdwn', text: `*Budget:*\n${display.budget}` },
          { type: 'mrkdwn', text: `*Project Type:*\n${display.projectType}` },
        ],
      },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: `*Message:*\n${display.message}` },
      },
    ],
  }
}

function buildGenericPayload(
  contact: ContactPayload,
  timestamp: string,
): ContactWebhookPayload {
  // Generic consumers get both the raw slug payload and a `display` object
  // with resolved labels — they can pick whichever is easier to consume.
  return {
    ...contact,
    display: humanize(contact),
    source: 'contact-form',
    timestamp,
  }
}

export function resolveWebhookTarget(webhookUrl: string): ContactWebhookTarget {
  if (webhookUrl.includes('discord.com/api/webhooks')) {
    return 'discord'
  }

  if (webhookUrl.includes('hooks.slack.com')) {
    return 'slack'
  }

  return 'generic'
}

export function getContactWebhookUrl(): string | null {
  const webhookUrl = process.env.CONTACT_WEBHOOK_URL?.trim()
  return webhookUrl ? webhookUrl : null
}

export function buildContactWebhookPayload({
  contact,
  webhookUrl,
  now = new Date(),
}: {
  contact: ContactPayload
  webhookUrl: string
  now?: Date
}): ContactWebhookPayload {
  const timestamp = now.toISOString()
  const target = resolveWebhookTarget(webhookUrl)

  switch (target) {
    case 'discord':
      return buildDiscordPayload(contact, timestamp)
    case 'slack':
      return buildSlackPayload(contact)
    case 'generic':
      return buildGenericPayload(contact, timestamp)
    default: {
      const exhaustiveCheck: never = target
      return exhaustiveCheck
    }
  }
}

export async function sendContactWebhook({
  contact,
  webhookUrl,
  fetchImpl = fetch,
}: {
  contact: ContactPayload
  webhookUrl: string
  fetchImpl?: typeof fetch
}): Promise<ContactWebhookDeliveryResult> {
  const payload = buildContactWebhookPayload({
    contact,
    webhookUrl,
  })

  try {
    const webhookResponse = await fetchImpl(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(CONTACT_WEBHOOK_TIMEOUT_MS),
    })

    if (!webhookResponse.ok) {
      const details = await webhookResponse.text().catch(() => 'Unknown error')
      console.error(`Webhook failed (${webhookResponse.status}): ${details}`)

      return {
        success: false,
        status: 502,
        code: 'webhook_failed',
        error: 'Webhook delivery failed.',
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Webhook delivery error:', error)

    return {
      success: false,
      status: 502,
      code: 'webhook_failed',
      error: 'Webhook delivery failed.',
    }
  }
}
