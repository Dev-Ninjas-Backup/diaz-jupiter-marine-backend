/**
 * HTML template for new daily lead email alert to admin.
 * Placeholders: LEAD_NAME, LEAD_EMAIL, STATUS, USER_ID, LEAD_TIME,
 * TIMESTAMP, CLIENT_NAME, YEAR, DASHBOARD_URL
 * Conditional: PRODUCT_ROW (injected as full <tr> pair or empty string)
 */
export const NEW_LEAD_ALERT_HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>New Lead Alert</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; padding: 20px; line-height: 1.6; }
        .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); }
        .email-header { background-color: #2196F3; color: #ffffff !important; padding: 35px 30px; text-align: center; position: relative; }
        .email-header h1 { font-size: 26px; font-weight: 700; margin-bottom: 8px; color: #ffffff !important; }
        .email-header p { font-size: 13px; opacity: 0.95; color: #ffffff !important; }
        .alert-badge { background-color: rgba(255, 255, 255, 0.3); color: #ffffff !important; display: inline-block; padding: 8px 20px; border-radius: 24px; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-top: 12px; letter-spacing: 1px; }
        .email-content { padding: 30px; }
        .greeting { font-size: 15px; color: #2c3e50; margin-bottom: 28px; line-height: 1.7; }
        .lead-card { background-color: #E3F2FD; border: 1px solid #90CAF9; border-left: 5px solid #2196F3; border-radius: 12px; padding: 28px; margin-bottom: 28px; }
        .lead-card h2 { font-size: 22px; color: #1976D2; margin-bottom: 22px; font-weight: 700; }
        .lead-info { background-color: #ffffff; border-radius: 10px; padding: 16px 20px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05); }
        .action-buttons { margin-top: 28px; }
        .btn { display: inline-block; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px; text-align: center; background-color: #2196F3; color: #ffffff !important; margin-right: 12px; margin-bottom: 8px; }
        .btn-secondary { background-color: #ffffff; color: #1976D2 !important; border: 2px solid #2196F3; }
        .email-footer { background-color: #F5F9FC; padding: 24px 30px; text-align: center; border-top: 2px solid #D6E9F5; }
        .email-footer p { font-size: 12px; color: #5a6c7d; margin-bottom: 8px; font-weight: 500; }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-header" style="background-color:#2196F3;color:#ffffff;padding:35px 30px;text-align:center;">
            <h1 style="color:#ffffff;font-size:26px;font-weight:700;margin-bottom:8px;">🔔 New Lead Alert</h1>
            <p style="color:#ffffff;font-size:13px;">{{TIMESTAMP}}</p>
            <span class="alert-badge" style="background-color:rgba(255,255,255,0.3);color:#ffffff;display:inline-block;padding:8px 20px;border-radius:24px;font-size:11px;font-weight:700;text-transform:uppercase;margin-top:12px;letter-spacing:1px;">⚡ Instant Notification</span>
        </div>
        <div class="email-content">
            <div class="greeting">
                <p>Hello <strong>{{CLIENT_NAME}}</strong>,</p>
                <p>A new daily lead has been submitted. Here are the details:</p>
            </div>
            <div class="lead-card">
                <h2>👤 {{LEAD_NAME}}</h2>
                <div class="lead-info">
                    <table width="100%" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
                        <tr>
                            <td style="font-weight:700;color:#5a6c7d;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;padding:10px 0 2px;border-top:1px solid #f0f0f0;">📧 Email</td>
                        </tr>
                        <tr>
                            <td style="color:#1976D2;font-size:14px;font-weight:600;padding:0 0 10px;overflow-wrap:break-word;word-wrap:break-word;word-break:break-word;"><a href="mailto:{{LEAD_EMAIL}}" style="color:#1976D2;text-decoration:none;font-weight:600;overflow-wrap:break-word;word-wrap:break-word;word-break:break-word;">{{LEAD_EMAIL}}</a></td>
                        </tr>
                        <tr>
                            <td style="font-weight:700;color:#5a6c7d;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;padding:10px 0 2px;border-top:1px solid #f0f0f0;">📊 Status</td>
                        </tr>
                        <tr>
                            <td style="color:#2c3e50;font-size:14px;font-weight:500;padding:0 0 10px;overflow-wrap:break-word;word-wrap:break-word;">{{STATUS}}</td>
                        </tr>
                        <tr>
                            <td style="font-weight:700;color:#5a6c7d;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;padding:10px 0 2px;border-top:1px solid #f0f0f0;">🆔 User ID</td>
                        </tr>
                        <tr>
                            <td style="color:#2c3e50;font-size:14px;font-weight:500;padding:0 0 10px;overflow-wrap:break-word;word-wrap:break-word;">{{USER_ID}}</td>
                        </tr>
                        <tr>
                            <td style="font-weight:700;color:#5a6c7d;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;padding:10px 0 2px;border-top:1px solid #f0f0f0;">🕐 Received</td>
                        </tr>
                        <tr>
                            <td style="color:#2c3e50;font-size:14px;font-weight:500;padding:0 0 10px;overflow-wrap:break-word;word-wrap:break-word;">{{LEAD_TIME}}</td>
                        </tr>
                        {{PRODUCT_ROW}}
                    </table>
                </div>
            </div>
            <div class="action-buttons">
                <a href="mailto:{{LEAD_EMAIL}}" class="btn" style="display:inline-block;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;background-color:#2196F3;color:#ffffff;">📧 Respond Now</a>
                <a href="{{DASHBOARD_URL}}" class="btn btn-secondary" style="display:inline-block;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;background-color:#ffffff;color:#1976D2;border:2px solid #2196F3;">📊 View Dashboard</a>
            </div>
        </div>
        <div class="email-footer">
            <p><strong>Jupiter Marine Sales</strong></p>
            <p>© {{YEAR}} Jupiter Marine Sales. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

export type NewLeadAlertVars = {
  LEAD_NAME: string;
  LEAD_EMAIL: string;
  STATUS: string;
  USER_ID: string;
  LEAD_TIME: string;
  TIMESTAMP: string;
  CLIENT_NAME: string;
  YEAR: string;
  DASHBOARD_URL: string;
  PRODUCT?: string;
  PRODUCT_URL?: string;
};

export function getNewLeadAlertHtml(vars: NewLeadAlertVars): string {
  let html = NEW_LEAD_ALERT_HTML;

  const productDisplay = vars.PRODUCT
    ? vars.PRODUCT_URL
      ? `<a href="${vars.PRODUCT_URL}" style="color:#1976D2;text-decoration:none;font-weight:600;overflow-wrap:break-word;word-wrap:break-word;word-break:break-word;">${vars.PRODUCT}</a>`
      : vars.PRODUCT
    : null;

  const productRow = productDisplay
    ? `<tr>
                            <td style="font-weight:700;color:#5a6c7d;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;padding:10px 0 2px;border-top:1px solid #f0f0f0;">🚢 Product</td>
                        </tr>
                        <tr>
                            <td style="color:#2c3e50;font-size:14px;font-weight:500;padding:0 0 10px;overflow-wrap:break-word;word-wrap:break-word;word-break:break-word;">${productDisplay}</td>
                        </tr>`
    : '';
  html = html.replace('{{PRODUCT_ROW}}', productRow);

  const { PRODUCT: _product, PRODUCT_URL: _productUrl, ...rest } = vars;
  for (const [key, value] of Object.entries(rest)) {
    html = html.replace(new RegExp(`{{${key}}}`, 'g'), String(value ?? ''));
  }
  return html;
}
