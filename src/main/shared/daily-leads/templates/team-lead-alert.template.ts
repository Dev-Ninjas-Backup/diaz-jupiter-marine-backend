/**
 * HTML template for team member lead alert email.
 * Placeholders: MEMBER_NAME, LEAD_NAME, LEAD_EMAIL, LEAD_PRODUCT,
 * LEAD_STATUS, USER_ID, LEAD_TIME, RESPOND_URL, DASHBOARD_URL, YEAR
 */
export const TEAM_LEAD_ALERT_HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Lead — Action Required</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; padding: 20px; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #FF6F00 0%, #FFA726 100%); color: #fff; padding: 35px 30px; text-align: center; }
        .header h1 { font-size: 24px; font-weight: 700; margin-bottom: 6px; }
        .header p { font-size: 13px; opacity: 0.9; }
        .badge { background: rgba(255,255,255,0.25); display: inline-block; padding: 6px 18px; border-radius: 24px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-top: 12px; }
        .content { padding: 30px; }
        .greeting { font-size: 15px; color: #2c3e50; margin-bottom: 24px; }
        .warning-box { background: #FFF3E0; border: 1px solid #FFB74D; border-left: 5px solid #FF6F00; border-radius: 8px; padding: 16px 20px; margin-bottom: 24px; font-size: 14px; color: #E65100; font-weight: 600; }
        .lead-card { background: linear-gradient(135deg, #FFF8E1 0%, #FFF3CD 100%); border: 1px solid #FFD54F; border-left: 5px solid #FFA000; border-radius: 12px; padding: 24px; margin-bottom: 24px; }
        .lead-card h2 { font-size: 20px; color: #E65100; margin-bottom: 18px; font-weight: 700; }
        .lead-info { background: #fff; border-radius: 8px; padding: 20px; }
        .info-row { display: flex; padding: 12px 0; border-bottom: 1px solid #f5f5f5; }
        .info-row:last-child { border-bottom: none; }
        .info-label { font-weight: 700; color: #5a6c7d; min-width: 130px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.3px; }
        .info-value { color: #2c3e50; font-size: 14px; flex: 1; font-weight: 500; }
        .info-value a { color: #E65100; text-decoration: none; font-weight: 600; }
        .respond-btn { display: block; text-align: center; margin: 24px 0; }
        .respond-btn a { display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #FF6F00 0%, #FFA726 100%); color: #fff; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px; letter-spacing: 0.5px; }
        .note { font-size: 12px; color: #888; text-align: center; margin-top: 8px; }
        .footer { background: #F5F5F5; padding: 20px 30px; text-align: center; border-top: 2px solid #EEE; }
        .footer p { font-size: 12px; color: #5a6c7d; margin-bottom: 4px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⚡ New Lead — Action Required</h1>
            <p>You have been assigned a new lead to follow up</p>
            <span class="badge">⏰ Respond within 10 minutes</span>
        </div>
        <div class="content">
            <div class="greeting">
                <p>Hello <strong>{{MEMBER_NAME}}</strong>,</p>
                <p style="margin-top:8px;">A new lead has been assigned to you. Please respond within <strong>10 minutes</strong> or it will be escalated to the next team member.</p>
            </div>
            <div class="warning-box">
                ⚠️ If you do not click "I'm Responding" within 10 minutes, this lead will automatically be forwarded to the next team member.
            </div>
            <div class="lead-card">
                <h2>👤 {{LEAD_NAME}}</h2>
                <div class="lead-info">
                    <div class="info-row">
                        <span class="info-label">📧 Email</span>
                        <span class="info-value"><a href="mailto:{{LEAD_EMAIL}}">{{LEAD_EMAIL}}</a></span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">🚢 Product</span>
                        <span class="info-value">{{LEAD_PRODUCT}}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">📊 Status</span>
                        <span class="info-value">{{LEAD_STATUS}}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">🆔 User ID</span>
                        <span class="info-value">{{USER_ID}}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">🕐 Received</span>
                        <span class="info-value">{{LEAD_TIME}}</span>
                    </div>
                </div>
            </div>
            <div class="respond-btn">
                <a href="{{RESPOND_URL}}">✅ I'm Responding to This Lead</a>
            </div>
            <p class="note">Clicking the button confirms you are handling this lead and stops the 10-minute escalation timer.</p>
        </div>
        <div class="footer">
            <p><strong>Jupiter Marine Sales</strong></p>
            <p>© {{YEAR}} Jupiter Marine Sales. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

export type TeamLeadAlertVars = {
  MEMBER_NAME: string;
  LEAD_NAME: string;
  LEAD_EMAIL: string;
  LEAD_PRODUCT: string;
  LEAD_STATUS: string;
  USER_ID: string;
  LEAD_TIME: string;
  RESPOND_URL: string;
  DASHBOARD_URL: string;
  YEAR: string;
};

export function getTeamLeadAlertHtml(vars: TeamLeadAlertVars): string {
  let html = TEAM_LEAD_ALERT_HTML;
  for (const [key, value] of Object.entries(vars)) {
    html = html.replace(new RegExp(`{{${key}}}`, 'g'), String(value ?? ''));
  }
  return html;
}
