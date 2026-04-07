import { NextResponse } from 'next/server'

interface ContactPayload {
  name: string
  email: string
  budget: string
  projectType: string
  message: string
}

function isDiscordWebhook(url: string): boolean {
  return url.includes('discord.com/api/webhooks')
}

function isSlackWebhook(url: string): boolean {
  return url.includes('hooks.slack.com')
}

function buildDiscordPayload(body: ContactPayload) {
  return {
    username: 'musabaqeel.com',
    avatar_url: 'https://musabaqeel.com/favicons/favicon-96x96.png',
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
          { name: '💰  Budget', value: `\`${body.budget || 'Not specified'}\``, inline: true },
          { name: '📁  Project Type', value: `\`${body.projectType || 'Not specified'}\``, inline: true },
          { name: '\u200b', value: '\u200b', inline: true },
          { name: '📝  Message', value: `>>> ${body.message}` },
        ],
        thumbnail: {
          url: 'https://musabaqeel.com/favicons/favicon-96x96.png',
        },
        footer: {
          text: 'musabaqeel.com  •  Contact Form',
          icon_url: 'https://musabaqeel.com/favicons/favicon-96x96.png',
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
          { type: 'mrkdwn', text: `*Budget:*\n${body.budget || 'Not specified'}` },
          { type: 'mrkdwn', text: `*Project Type:*\n${body.projectType || 'Not specified'}` },
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

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ContactPayload

    if (!body.name || !body.email || !body.message) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    const webhookUrl = process.env.CONTACT_WEBHOOK_URL
    if (!webhookUrl) {
      console.warn('CONTACT_WEBHOOK_URL not configured')
      return NextResponse.json({ success: true })
    }

    let payload: unknown
    if (isDiscordWebhook(webhookUrl)) {
      payload = buildDiscordPayload(body)
    } else if (isSlackWebhook(webhookUrl)) {
      payload = buildSlackPayload(body)
    } else {
      payload = buildGenericPayload(body)
    }

    const webhookRes = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!webhookRes.ok) {
      const errText = await webhookRes.text().catch(() => 'Unknown error')
      console.error(`Webhook failed (${webhookRes.status}): ${errText}`)
      return NextResponse.json({ success: false, error: 'Webhook delivery failed' }, { status: 502 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Contact route error:', err)
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 })
  }
}
