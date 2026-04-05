import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LeadDispatchService } from './lead-dispatch.service';

@Injectable()
export class LeadDispatchCronService {
  private readonly logger = new Logger(LeadDispatchCronService.name);

  constructor(private readonly leadDispatchService: LeadDispatchService) {}

  /**
   * Runs every minute to check for dispatches that have not been responded to
   * within 10 minutes and escalates them to the next team member.
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async handleEscalation(): Promise<void> {
    this.logger.debug('Checking for overdue lead dispatches...');
    await this.leadDispatchService.escalatePendingDispatches().catch((err) => {
      this.logger.error(`Lead escalation cron error: ${err?.message}`);
    });
  }
}
