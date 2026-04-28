/**
 * HTML template for team member lead alert email.
 * Placeholders: MEMBER_NAME, LEAD_NAME, LEAD_EMAIL,
 * LEAD_STATUS, USER_ID, LEAD_TIME, RESPOND_URL, DASHBOARD_URL, YEAR
 * Conditional: PRODUCT_ROW (injected as full <div> or empty string)
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
        .header { background-color: #2196F3; color: #ffffff !important; padding: 35px 30px; text-align: center; }
        .header h1 { font-size: 24px; font-weight: 700; margin-bottom: 6px; color: #ffffff !important; }
        .header p { font-size: 13px; opacity: 0.95; color: #ffffff !important; }
        .badge { background-color: rgba(255,255,255,0.3); color: #ffffff !important; display: inline-block; padding: 6px 18px; border-radius: 24px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-top: 12px; }
        .content { padding: 30px; }
        .greeting { font-size: 15px; color: #2c3e50; margin-bottom: 24px; }
        .warning-box { background-color: #E3F2FD; border: 1px solid #90CAF9; border-left: 5px solid #2196F3; border-radius: 8px; padding: 16px 20px; margin-bottom: 24px; font-size: 14px; color: #1565C0; font-weight: 600; }
        .lead-card { background-color: #E3F2FD; border: 1px solid #90CAF9; border-left: 5px solid #2196F3; border-radius: 12px; padding: 24px; margin-bottom: 24px; }
        .lead-card h2 { font-size: 20px; color: #1976D2; margin-bottom: 18px; font-weight: 700; }
        .lead-info { background-color: #ffffff; border-radius: 8px; padding: 20px; }
        .info-row { display: flex; padding: 12px 0; border-bottom: 1px solid #f5f5f5; }
        .info-row:last-child { border-bottom: none; }
        .info-label { font-weight: 700; color: #5a6c7d; min-width: 130px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.3px; }
        .info-value { color: #2c3e50; font-size: 14px; flex: 1; font-weight: 500; }
        .info-value a { color: #1976D2; text-decoration: none; font-weight: 600; }
        .respond-btn { display: block; text-align: center; margin: 24px 0; }
        .respond-btn a { display: inline-block; padding: 16px 40px; background-color: #2196F3; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px; letter-spacing: 0.5px; }
        .note { font-size: 12px; color: #888; text-align: center; margin-top: 8px; }
        .footer { background-color: #F5F9FC; padding: 20px 30px; text-align: center; border-top: 2px solid #D6E9F5; }
        .footer p { font-size: 12px; color: #5a6c7d; margin-bottom: 4px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header" style="background-color:#2196F3;color:#ffffff;padding:35px 30px;text-align:center;">
            <h1 style="color:#ffffff;font-size:24px;font-weight:700;margin-bottom:6px;">⚡ New Lead — Action Required</h1>
            <p style="color:#ffffff;font-size:13px;">You have been assigned a new lead to follow up</p>
            <span class="badge" style="background-color:rgba(255,255,255,0.3);color:#ffffff;display:inline-block;padding:6px 18px;border-radius:24px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-top:12px;">⏰ Respond within 10 minutes</span>
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
                    {{PRODUCT_ROW}}
                </div>
            </div>
            <div class="respond-btn">
                <a href="{{RESPOND_URL}}" style="display:inline-block;padding:16px 40px;background-color:#2196F3;color:#ffffff !important;text-decoration:none;border-radius:8px;font-weight:700;font-size:16px;letter-spacing:0.5px;">✅ I'm Responding to This Lead</a>
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
  LEAD_STATUS: string;
  USER_ID: string;
  LEAD_TIME: string;
  RESPOND_URL: string;
  DASHBOARD_URL: string;
  YEAR: string;
  PRODUCT?: string;
  PRODUCT_URL?: string;
};

export function getTeamLeadAlertHtml(vars: TeamLeadAlertVars): string {
  let html = TEAM_LEAD_ALERT_HTML;

  const productDisplay = vars.PRODUCT
    ? vars.PRODUCT_URL
      ? `<a href="${vars.PRODUCT_URL}" style="color:#1976D2;text-decoration:none;font-weight:600;">${vars.PRODUCT}</a>`
      : vars.PRODUCT
    : null;

  const productRow = productDisplay
    ? `<div class="info-row" style="display:flex;padding:12px 0;border-bottom:1px solid #f5f5f5;">
                        <span class="info-label" style="font-weight:700;color:#5a6c7d;min-width:130px;font-size:13px;text-transform:uppercase;letter-spacing:0.3px;">🚢 Product</span>
                        <span class="info-value" style="color:#2c3e50;font-size:14px;flex:1;font-weight:500;">${productDisplay}</span>
                    </div>`
    : '';
  html = html.replace('{{PRODUCT_ROW}}', productRow);

  const { PRODUCT: _product, PRODUCT_URL: _productUrl, ...rest } = vars;
  for (const [key, value] of Object.entries(rest)) {
    html = html.replace(new RegExp(`{{${key}}}`, 'g'), String(value ?? ''));
  }
  return html;
}
