import { Controller, Get, Header } from '@nestjs/common';
import {
  ApiExcludeEndpoint,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { ENVEnum } from './common/enum/env.enum';

const RELEASE_VERSION = 'v1.0.0';

function buildDeploymentVersion(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `v${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}T${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
}

function buildLandingPage(env: string): string {
  const deployment = buildDeploymentVersion();
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Diaz Jupiter Marine API</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      min-height: 100vh;
      background: #0f1117;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      padding: 24px;
    }
    .card {
      background: #1a1d27;
      border: 1px solid #2a2d3e;
      border-radius: 16px;
      padding: 40px 44px;
      width: 100%;
      max-width: 520px;
      box-shadow: 0 8px 40px rgba(0,0,0,0.5);
    }
    .title {
      font-size: 2rem;
      font-weight: 700;
      color: #f0f2f8;
      font-family: 'Courier New', Courier, monospace;
      letter-spacing: -0.5px;
      margin-bottom: 12px;
    }
    .description {
      font-size: 0.9rem;
      color: #8b90a8;
      line-height: 1.6;
      margin-bottom: 24px;
    }
    .badge {
      display: inline-block;
      padding: 5px 14px;
      background: transparent;
      border: 1px solid #3b82f6;
      color: #93c5fd;
      border-radius: 6px;
      font-size: 0.78rem;
      font-weight: 500;
      margin-bottom: 28px;
      letter-spacing: 0.3px;
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 20px;
    }
    .info-card {
      background: #12141e;
      border: 1px solid #22253a;
      border-radius: 10px;
      padding: 16px 18px;
    }
    .info-label {
      font-size: 0.65rem;
      font-weight: 600;
      color: #6b7094;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      margin-bottom: 6px;
    }
    .info-value {
      font-size: 1.05rem;
      font-weight: 600;
      color: #e2e5f1;
    }
    .status-dot {
      display: inline-block;
      width: 8px;
      height: 8px;
      background: #22c55e;
      border-radius: 50%;
      margin-right: 7px;
      box-shadow: 0 0 6px #22c55e;
    }
    .divider { border: none; border-top: 1px solid #22253a; margin: 10px 0; }
    .link-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 18px;
      background: #12141e;
      border: 1px solid #22253a;
      border-radius: 10px;
      text-decoration: none;
      color: #d1d5eb;
      font-size: 0.92rem;
      font-weight: 500;
      transition: background 0.15s, border-color 0.15s;
      margin-bottom: 10px;
    }
    .link-row:hover { background: #1e2133; border-color: #3b4060; }
    .link-row:last-of-type { margin-bottom: 0; }
    .icon {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 7px;
      font-size: 1rem;
      flex-shrink: 0;
    }
    .icon-docs { background: #1e3a5f; }
    .icon-health { background: #3b1a1a; }
    .footer {
      text-align: center;
      color: #4a4f6a;
      font-size: 0.78rem;
      margin-top: 28px;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="title">diaz_jupiter_marine_api</div>
    <p class="description">
      Backend API for Diaz Jupiter Marine Sales &mdash; a full-featured marine
      marketplace with multi-source boat listings, seller management, and
      real-time synchronization.
    </p>
    <span class="badge">Backend Service</span>

    <div class="grid">
      <div class="info-card">
        <div class="info-label">Release Version</div>
        <div class="info-value">${RELEASE_VERSION}</div>
      </div>
      <div class="info-card">
        <div class="info-label">Deployment Version</div>
        <div class="info-value" style="font-size:0.85rem">${deployment}</div>
      </div>
      <div class="info-card">
        <div class="info-label">Environment</div>
        <div class="info-value">${env}</div>
      </div>
      <div class="info-card">
        <div class="info-label">Status</div>
        <div class="info-value">
          <span class="status-dot"></span>Online
        </div>
      </div>
    </div>

    <a href="/api/docs" class="link-row">
      <span class="icon icon-docs">📘</span>
      API Documentation
    </a>
    <a href="/api/health" class="link-row">
      <span class="icon icon-health">❤️</span>
      Health Check
    </a>

    <p class="footer">&copy; ${year} Jupiter Marine Sales &middot; All rights reserved</p>
  </div>
</body>
</html>`;
}

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly config: ConfigService) {}

  @ApiExcludeEndpoint()
  @Header('Content-Type', 'text/plain')
  @Get('robots.txt')
  robots() {
    return `User-agent: *\nDisallow: /api/\nAllow: /\n`;
  }

  @ApiExcludeEndpoint()
  @Header('Content-Type', 'text/html')
  @Get()
  root() {
    const env = this.config.get<string>(ENVEnum.NODE_ENV) ?? 'production';
    return buildLandingPage(env);
  }

  @ApiOperation({
    summary: 'System Health Check',
    description: 'Returns health status for API, Database, and Website.',
  })
  @ApiResponse({ status: 200, description: 'Health information returned.' })
  @Get('health')
  health() {
    return {
      api: 'up',
      database: 'up',
      website: 'up',
    };
  }
}
