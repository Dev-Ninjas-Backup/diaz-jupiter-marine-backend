import { MailModule } from '@/lib/mail/mail.module';
import { Module } from '@nestjs/common';
import { DailyLeadsController } from './daily-leads.controller';
import { DailyLeadsService } from './daily-leads.service';
import { LeadAssignmentMemberService } from './lead-assignment-member.service';
import { LeadDispatchCronService } from './lead-dispatch-cron.service';
import { LeadDispatchService } from './lead-dispatch.service';

@Module({
  imports: [MailModule],
  controllers: [DailyLeadsController],
  providers: [
    DailyLeadsService,
    LeadDispatchService,
    LeadAssignmentMemberService,
    LeadDispatchCronService,
  ],
  exports: [DailyLeadsService, LeadDispatchService],
})
export class DailyLeadsModule {}
