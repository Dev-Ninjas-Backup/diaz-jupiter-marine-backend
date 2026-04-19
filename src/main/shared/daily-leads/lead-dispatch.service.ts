import { ENVEnum } from '@/common/enum/env.enum';
import { MailService } from '@/lib/mail/mail.service';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { getTeamLeadAlertHtml } from './templates/team-lead-alert.template';

@Injectable()
export class LeadDispatchService {
  private readonly logger = new Logger(LeadDispatchService.name);
  private readonly ESCALATION_MINUTES = 10;

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Called after a new lead is created.
   * Finds the active member at order=0 and dispatches the lead to them.
   */
  async dispatchNewLead(leadId: number): Promise<void> {
    const member = await this.prisma.client.leadAssignmentMember.findFirst({
      where: { order: 0, isActive: true },
      orderBy: { order: 'asc' },
    });

    if (!member) {
      this.logger.warn(
        'No active assignment member at order 0. Skipping lead dispatch.',
      );
      return;
    }

    await this.createDispatchAndSendEmail(
      leadId,
      member.id,
      member.email,
      member.name,
      0,
    ).catch((err) => {
      this.logger.error(
        `Failed to dispatch lead ${leadId} to order 0: ${err?.message}`,
      );
    });
  }

  /**
   * Mark a dispatch as responded using the unique token from the email link.
   * Returns basic info so the caller can render a confirmation page.
   */
  async respondToDispatch(token: string): Promise<{
    leadId: number;
    memberEmail: string;
    memberName: string;
    alreadyResponded: boolean;
  }> {
    const dispatch = await this.prisma.client.leadEmailDispatch.findUnique({
      where: { token },
    });

    if (!dispatch) {
      throw new NotFoundException('Invalid or expired response token.');
    }

    if (dispatch.isResponded) {
      return {
        leadId: dispatch.leadId,
        memberEmail: dispatch.memberEmail,
        memberName: dispatch.memberName,
        alreadyResponded: true,
      };
    }

    await this.prisma.client.leadEmailDispatch.update({
      where: { token },
      data: { isResponded: true, respondedAt: new Date() },
    });

    this.logger.log(
      `Lead ${dispatch.leadId} responded by ${dispatch.memberEmail} (order ${dispatch.assignmentOrder})`,
    );

    return {
      leadId: dispatch.leadId,
      memberEmail: dispatch.memberEmail,
      memberName: dispatch.memberName,
      alreadyResponded: false,
    };
  }

  /**
   * Called by the cron every minute.
   * Finds dispatches that are 10+ minutes old, not responded, and not yet escalated.
   * Escalates each to the next member in order.
   */
  async escalatePendingDispatches(): Promise<void> {
    const cutoff = new Date(Date.now() - this.ESCALATION_MINUTES * 60 * 1000);

    const pending = await this.prisma.client.leadEmailDispatch.findMany({
      where: {
        isResponded: false,
        escalatedAt: null,
        sentAt: { lt: cutoff },
      },
    });

    if (pending.length === 0) return;

    this.logger.log(`Escalating ${pending.length} overdue dispatch(es)...`);

    for (const dispatch of pending) {
      // Mark as escalated first to prevent double-processing
      await this.prisma.client.leadEmailDispatch.update({
        where: { id: dispatch.id },
        data: { escalatedAt: new Date() },
      });

      const nextOrder = dispatch.assignmentOrder + 1;
      const nextMember =
        await this.prisma.client.leadAssignmentMember.findFirst({
          where: { order: nextOrder, isActive: true },
        });

      if (!nextMember) {
        this.logger.warn(
          `Lead ${dispatch.leadId}: no active member at order ${nextOrder}. Escalation chain exhausted.`,
        );
        continue;
      }

      this.logger.log(
        `Lead ${dispatch.leadId}: escalating from order ${dispatch.assignmentOrder} → order ${nextOrder} (${nextMember.email})`,
      );

      await this.createDispatchAndSendEmail(
        dispatch.leadId,
        nextMember.id,
        nextMember.email,
        nextMember.name,
        nextOrder,
      ).catch((err) => {
        this.logger.error(
          `Failed to escalate lead ${dispatch.leadId} to order ${nextOrder}: ${err?.message}`,
        );
      });
    }
  }

  /**
   * Returns dispatch report grouped by lead.
   * If leadId is provided, filters to that lead only.
   */
  async getDispatchReport(leadId?: number) {
    const dispatches = await this.prisma.client.leadEmailDispatch.findMany({
      where: leadId ? { leadId } : undefined,
      orderBy: [{ leadId: 'asc' }, { assignmentOrder: 'asc' }],
      include: { lead: true },
    });

    // Group by leadId
    const grouped = new Map<
      number,
      { lead: (typeof dispatches)[0]['lead']; dispatches: typeof dispatches }
    >();

    for (const d of dispatches) {
      if (!grouped.has(d.leadId)) {
        grouped.set(d.leadId, { lead: d.lead, dispatches: [] });
      }
      grouped.get(d.leadId)!.dispatches.push(d);
    }

    return Array.from(grouped.values()).map(({ lead, dispatches: disps }) => ({
      lead_id: lead.id,
      lead_name: lead.name,
      lead_email: lead.email,
      lead_product: lead.product,
      lead_status: lead.status,
      created_at: lead.createdAt.toISOString(),
      total_dispatches: disps.length,
      responded: disps.some((d) => d.isResponded),
      dispatches: disps.map((d) => ({
        id: d.id,
        member_email: d.memberEmail,
        member_name: d.memberName,
        assignment_order: d.assignmentOrder,
        sent_at: d.sentAt.toISOString(),
        is_responded: d.isResponded,
        responded_at: d.respondedAt?.toISOString() ?? null,
        escalated_at: d.escalatedAt?.toISOString() ?? null,
      })),
    }));
  }

  private async createDispatchAndSendEmail(
    leadId: number,
    memberId: number,
    memberEmail: string,
    memberName: string,
    assignmentOrder: number,
  ): Promise<void> {
    const lead = await this.prisma.client.dailyLead.findUnique({
      where: { id: leadId },
    });
    if (!lead) {
      this.logger.warn(`Lead ${leadId} not found; skipping dispatch`);
      return;
    }

    const token = randomUUID();
    const baseUrl = this.configService.get<string>(ENVEnum.BASE_URL) ?? '';
    const respondUrl = `${baseUrl}/daily_leads/respond?token=${token}`;

    // Persist dispatch record before sending email
    await this.prisma.client.leadEmailDispatch.create({
      data: {
        leadId,
        memberId,
        memberEmail,
        memberName,
        assignmentOrder,
        token,
      },
    });

    const html = getTeamLeadAlertHtml({
      MEMBER_NAME: memberName,
      LEAD_NAME: lead.name,
      LEAD_EMAIL: lead.email,
      LEAD_STATUS: lead.status,
      USER_ID: lead.userId,
      LEAD_TIME: this.formatDate(lead.createdAt),
      RESPOND_URL: respondUrl,
      DASHBOARD_URL: baseUrl || 'https://admin.jupitermarinesales.com/',
      YEAR: String(new Date().getUTCFullYear()),
    });

    const text = `New lead assigned: ${lead.name} (${lead.email}). Please respond within 10 minutes: ${respondUrl}`;

    await this.mailService.sendMail({
      to: memberEmail,
      subject: `[Action Required] New Lead: ${lead.name} — Respond within 10 mins`,
      html,
      text,
    });

    this.logger.log(
      `Lead ${leadId} dispatched to ${memberEmail} (order ${assignmentOrder}), token: ${token}`,
    );
  }

  private formatDate(date: Date): string {
    return date.toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'UTC',
      timeZoneName: 'short',
    });
  }
}
