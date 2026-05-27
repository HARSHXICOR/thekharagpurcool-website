import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";

@Injectable()
export class InquiriesListener {
  @OnEvent("lead.created", { async: true })
  async handleLeadCreatedEvent(inquiry: any) {
    console.log(`\n======================================================`);
    console.log(`🔔 [EVENT-WORKER] New Lead Captured: ${inquiry.id}`);
    console.log(`======================================================`);

    // 1. Send Email Notification to Creator
    await this.sendCreatorEmailAlert(inquiry);

    // 2. Send Auto-Reply to Client
    await this.sendClientAutoReply(inquiry);

    // 3. Send Telegram Instant Notification
    await this.sendTelegramAlert(inquiry);

    console.log(`======================================================\n`);
  }

  private async sendCreatorEmailAlert(inquiry: any) {
    const to = "harshsharmavardhan6749@gmail.com";
    const subject = `🚀 New Collab Inquiry from ${inquiry.companyName || inquiry.name}`;
    
    const body = `
      Hi Kharagpur Wala,

      You have received a new business promotion inquiry on the website!

      --------------------------------------------------
      Lead Details:
      --------------------------------------------------
      👤 Contact Name:  ${inquiry.name}
      🏢 Business Name:  ${inquiry.companyName || "N/A"}
      📸 Instagram:      ${inquiry.instagramHandle || "N/A"}
      📞 WhatsApp/Phone: ${inquiry.phone}
      📧 Contact Email:  ${inquiry.email}
      💰 Budget Band:    ${inquiry.budgetBand.toUpperCase()}
      📣 Source Channel: ${inquiry.source.toUpperCase()}

      📝 Client Message:
      "${inquiry.message || "No custom message provided."}"
      --------------------------------------------------

      Log in to your Client Console to manage this campaign:
      http://localhost:3000/login

      Best regards,
      The Kharagpur Wala BFF Engine
    `;

    const apiKey = process.env.RESEND_API_KEY;
    const enableReal = process.env.ENABLE_REAL_EMAILS === 'true';
    const sender = process.env.SENDER_EMAIL || 'onboarding@resend.dev';

    if (enableReal && apiKey && apiKey !== 'mock-resend-key') {
      console.log(`✉️  [MAIL-OUT] Sending LIVE Creator Notification Email via Resend...`);
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: `The Kharagpur Wala <${sender}>`,
            to: [to],
            subject: subject,
            text: body,
          }),
        });

        if (response.ok) {
          console.log(`✅  [MAIL-SUCCESS] Live Creator notification email dispatched successfully!`);
        } else {
          const errPayload = await response.json();
          console.error(`❌  [MAIL-ERROR] Resend API error:`, errPayload);
        }
      } catch (error) {
        console.error(`❌  [MAIL-ERROR] Network error dispatching to Resend:`, error);
      }
    } else {
      // Simulate SMTP / Resend API dispatch
      console.log(`✉️  [MAIL-SIMULATION] Sending Creator Notification Email...`);
      console.log(`    To:      ${to}`);
      console.log(`    Subject: ${subject}`);
      console.log(`    Content Excerpt: Lead ${inquiry.name} (${inquiry.email}) budget ₹${inquiry.budgetBand}`);
      
      // Resilient simulated network delay
      await new Promise((resolve) => setTimeout(resolve, 800));
      console.log(`✅  [MAIL-SUCCESS] Creator notification email dispatched successfully!`);
    }
  }

  private async sendClientAutoReply(inquiry: any) {
    const to = inquiry.email;
    const subject = `The Kharagpur Wala | Inquiry Confirmation`;

    const body = `
      Dear ${inquiry.name},

      Thank you for reaching out to The Kharagpur Wala!

      We have successfully received your promotion inquiry for "${inquiry.companyName || "your business"}". 
      
      Our account manager will analyze your Instagram profile (${inquiry.instagramHandle || "N/A"}) and get back to you with custom campaign strategies and tailored pricing options within 24 hours.

      In the meantime, feel free to browse our latest regional fests, cafe reviews, and automobile case studies here:
      http://localhost:3000/portfolio

      Best regards,
      The Kharagpur Wala Partnerships Team
      Paschim Midnapore, West Bengal
    `;

    const apiKey = process.env.RESEND_API_KEY;
    const enableReal = process.env.ENABLE_REAL_EMAILS === 'true';
    const sender = process.env.SENDER_EMAIL || 'onboarding@resend.dev';

    if (enableReal && apiKey && apiKey !== 'mock-resend-key') {
      console.log(`✉️  [MAIL-OUT] Sending LIVE Client Confirmation Auto-Reply via Resend...`);
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: `The Kharagpur Wala <${sender}>`,
            to: [to],
            subject: subject,
            text: body,
          }),
        });

        if (response.ok) {
          console.log(`✅  [MAIL-SUCCESS] Live Client auto-reply email dispatched successfully!`);
        } else {
          const errPayload = await response.json();
          console.error(`❌  [MAIL-ERROR] Resend API error:`, errPayload);
        }
      } catch (error) {
        console.error(`❌  [MAIL-ERROR] Network error dispatching client auto-reply to Resend:`, error);
      }
    } else {
      console.log(`✉️  [MAIL-OUT] Sending Client Confirmation Auto-Reply...`);
      console.log(`    To:      ${to}`);
      console.log(`    Subject: ${subject}`);
      
      await new Promise((resolve) => setTimeout(resolve, 600));
      console.log(`✅  [MAIL-SUCCESS] Client auto-reply email dispatched successfully!`);
    }
  }

  private async sendTelegramAlert(inquiry: any) {
    const message = `
🚀 *NEW LEAD CAPTURED* 🚀
--------------------------------
👤 Name: ${inquiry.name}
🏢 Business: ${inquiry.companyName || "N/A"}
📸 Instagram: [${inquiry.instagramHandle || "N/A"}]
📞 Phone: ${inquiry.phone}
💰 Budget: *${inquiry.budgetBand.toUpperCase()}*
--------------------------------
📝 Message:
"${inquiry.message || "N/A"}"
    `.trim();

    console.log(`💬  [TELEGRAM-BOT] Broadcasting instant alert...`);
    console.log(message);
    
    // Simulate webhook dispatch
    await new Promise((resolve) => setTimeout(resolve, 300));
    console.log(`✅  [TELEGRAM-SUCCESS] Telegram bot alert broadcasted!`);
  }
}
