import type { PitchDetails, RestaurantLead } from '../types';

export const IMAGINE_URL = 'https://imagine.justsimpleapps.online/';
export const WHATSAPP_NUMBER = '+91 98197 08112';

export const APPROVED_HTML_SIGNATURE = `<p style="margin: 0 0 14px;">Best regards,</p>
<table cellpadding="0" cellspacing="0" border="0" style="font-family: Arial, Helvetica, sans-serif; color: #382a25; margin-top: 8px;">
  <tr>
    <td style="padding-right: 14px; vertical-align: middle;">
      <a href="https://imagine.justsimpleapps.online/" target="_blank" style="text-decoration: none;">
        <img src="https://imagine.justsimpleapps.online/assets/imagine-logo.png" alt="Imagine Logo" width="48" height="48" style="display: block; border-radius: 12px; border: 0;" />
      </a>
    </td>
    <td style="border-left: 2px solid #ff6200; padding-left: 14px; vertical-align: middle;">
      <div style="font-size: 15px; font-weight: 700; color: #382a25; line-height: 1.3;">
        Owais Khan <span style="font-weight: 500; color: #75665e;">(dev)</span>
      </div>
      <div style="font-size: 13px; font-weight: 700; color: #ff6200; margin-top: 2px;">
        imagine. <span style="font-weight: 400; color: #75665e;">| Think it. We'll make it.</span>
      </div>
      <div style="font-size: 12px; margin-top: 4px; line-height: 1.5;">
        <a href="https://imagine.justsimpleapps.online/" target="_blank" style="color: #382a25; text-decoration: underline;">imagine.justsimpleapps.online</a>
         &bull;
        <a href="https://wa.me/919819708112" target="_blank" style="color: #b64000; text-decoration: none; font-weight: 600;">WhatsApp: +91 98197 08112</a>
      </div>
    </td>
  </tr>
</table>`;

export interface GeneratedPitch {
  subject: string;
  text: string;
  html: string;
  gmailUrl: string;
}

export function createDefaultPitch(lead: Pick<RestaurantLead, 'name' | 'cuisine' | 'locality'>): PitchDetails {
  return {
    opening: `Running ${lead.cuisine.toLowerCase()} service in ${lead.locality} means your team needs quick billing and clear order handoffs throughout every busy service.`,
    posType: 'Restaurant',
    workflow: 'menu, counter, and table workflow',
    reliability: 'your billing and KOTs keep moving smoothly through peak rush hours',
    featureTitle: 'Fast Billing & KOTs',
    features: 'Custom menu mapping, table and takeaway orders, instant kitchen tickets, discounts, and Cash / UPI / Card tracking',
    uptime: 'Rock-solid uptime built for your busiest dining and takeaway hours',
    caseStudy: 'Food Inn POS',
    demoLocation: lead.locality,
  };
}

export function generatePitch(lead: RestaurantLead): GeneratedPitch {
  const pitch = lead.pitch ?? createDefaultPitch(lead);
  const subject = `Custom ${pitch.posType} POS for ${lead.name} @ ₹2,500/month (Zero Downtime)`;
  const greeting = `Hi ${lead.name} Team,`;
  const offer = `At Imagine, we build fast, custom ${pitch.posType} POS systems tailored to your exact menu and ${pitch.workflow}, running on a server that never goes down so ${pitch.reliability}.`;
  const points = [
    `${pitch.featureTitle}: ${pitch.features}.`,
    `Server That Never Goes Down: ${pitch.uptime}.`,
    `₹0 Build / Setup Cost: Custom-configured for ${lead.name} with zero upfront development fee.`,
    'Flat ₹2,500/- per month: Covers server hosting, domain, and full ongoing maintenance with no hidden charges.',
  ];
  const portfolio = `You can check out our work, including ${pitch.caseStudy}, here:\n${IMAGINE_URL}`;
  const cta = `Would you be open to a quick 5-minute demo at your ${pitch.demoLocation} outlet or over a call this week? Simply reply to this email or message me on WhatsApp at ${WHATSAPP_NUMBER}.`;
  const textSignature = `Best regards,\n\nOwais Khan (dev)\nimagine. | Think it. We'll make it.\n${IMAGINE_URL}\nWhatsApp: ${WHATSAPP_NUMBER}`;
  const text = [greeting, pitch.opening, offer, `What you get:\n${points.map((point) => `* ${point}`).join('\n')}`, portfolio, cta, textSignature].join('\n\n');

  const paragraph = (value: string) => `<p style="margin: 0 0 14px; font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.6; color: #382a25;">${escapeHtml(value)}</p>`;
  const html = [
    paragraph(greeting),
    paragraph(pitch.opening),
    paragraph(offer),
    paragraph('What you get:'),
    `<ul style="margin: 0 0 16px; padding-left: 20px; font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.6; color: #382a25;">${points.map((point) => `<li style="margin-bottom: 7px;">${escapeHtml(point)}</li>`).join('')}</ul>`,
    `<p style="margin: 0 0 14px; font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.6; color: #382a25;">You can check out our work, including ${escapeHtml(pitch.caseStudy)}, here:<br /><a href="${IMAGINE_URL}" target="_blank" style="color: #b64000;">${IMAGINE_URL}</a></p>`,
    paragraph(cta),
    APPROVED_HTML_SIGNATURE,
  ].join('\n');

  const params = new URLSearchParams({
    view: 'cm',
    fs: '1',
    authuser: 'ashketchupkeke@gmail.com',
    to: lead.emails.join(','),
    su: subject,
    body: text,
  });

  return { subject, text, html, gmailUrl: `https://mail.google.com/mail/?${params.toString()}` };
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function hasForbiddenDash(value: string): boolean {
  return /[—–]/.test(value);
}
