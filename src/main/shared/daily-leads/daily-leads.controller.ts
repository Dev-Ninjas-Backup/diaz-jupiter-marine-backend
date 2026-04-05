import { PermissionEnum } from '@/common/enum/permission.enum';
import { RequirePermission } from '@/common/jwt/jwt.decorator';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DailyLeadsService } from './daily-leads.service';
import { CreateAssignmentMemberDto } from './dto/create-assignment-member.dto';
import { CreateDailyLeadDto } from './dto/create-daily-lead.dto';
import { DailyLeadsPaginatedResponseDto } from './dto/daily-lead-response.dto';
import { GetDailyLeadsQueryDto } from './dto/get-daily-leads-query.dto';
import { UpdateAssignmentMemberDto } from './dto/update-assignment-member.dto';
import { UpdateDailyLeadDto } from './dto/update-daily-lead.dto';
import { LeadAssignmentMemberService } from './lead-assignment-member.service';
import { LeadDispatchService } from './lead-dispatch.service';

/** True if param is a positive integer string (e.g. "1", "42") */
function isNumericId(param: string): boolean {
  const num = parseInt(param, 10);
  return String(num) === param && num >= 1;
}

/** Parse and validate numeric id; throws BadRequestException if invalid */
function parseLeadId(id: string): number {
  const num = parseInt(id, 10);
  if (Number.isNaN(num) || num < 1 || !Number.isInteger(num)) {
    throw new BadRequestException('Lead id must be a positive integer.');
  }
  return num;
}

@ApiTags('Daily Leads')
@Controller('daily_leads')
export class DailyLeadsController {
  constructor(
    private readonly dailyLeadsService: DailyLeadsService,
    private readonly leadDispatchService: LeadDispatchService,
    private readonly memberService: LeadAssignmentMemberService,
  ) {}

  // ─────────────────────────────────────────────────────────────
  // Daily Leads CRUD
  // ─────────────────────────────────────────────────────────────

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all daily leads (paginated, sortable, filter by today)',
    description:
      "Returns daily leads with pagination, date-wise sorting, and optional today filter. Query: page, limit, sortOrder (asc|desc), today (true = only today's leads in UTC).",
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiQuery({ name: 'today', required: false, type: Boolean })
  @ApiResponse({ status: 200, type: DailyLeadsPaginatedResponseDto })
  async getAll(@Query() query: GetDailyLeadsQueryDto) {
    return this.dailyLeadsService.getAll({
      page: query.page,
      limit: query.limit,
      sortOrder: query.sortOrder,
      today: query.today,
    });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a daily lead' })
  @ApiResponse({ status: 201, description: 'Lead created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 409, description: 'Duplicate lead' })
  async create(@Body() dto: CreateDailyLeadDto) {
    const lead = await this.dailyLeadsService.create(dto);
    return { status: 'success', total_leads: 1, leads: [lead] };
  }

  // ─────────────────────────────────────────────────────────────
  // Token-based email response (public — no auth, token is the key)
  // ─────────────────────────────────────────────────────────────

  @Get('respond')
  @HttpCode(HttpStatus.OK)
  @Header('Content-Type', 'text/html; charset=utf-8')
  @ApiOperation({
    summary: 'Respond to lead via email token',
    description:
      'Team members click this link from their email. The token marks them as having responded, stopping the 10-minute escalation timer.',
  })
  @ApiQuery({ name: 'token', required: true, type: String })
  async respondToLead(@Query('token') token: string): Promise<string> {
    if (!token) {
      return buildHtmlPage('Missing Token', 'No token provided.', false);
    }
    try {
      const result = await this.leadDispatchService.respondToDispatch(token);
      if (result.alreadyResponded) {
        return buildHtmlPage(
          'Already Responded',
          `You have already confirmed your response to this lead (Lead #${result.leadId}).`,
          true,
        );
      }
      return buildHtmlPage(
        'Response Confirmed',
        `Thank you, <strong>${result.memberName}</strong>! You have confirmed that you are handling Lead #${result.leadId}. The escalation timer has been stopped.`,
        true,
      );
    } catch {
      return buildHtmlPage(
        'Invalid Token',
        'This response link is invalid or has expired.',
        false,
      );
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Dispatch Report (admin protected)
  // ─────────────────────────────────────────────────────────────

  @Get('dispatch-report')
  @RequirePermission(PermissionEnum.LEADS_DISPATCH_REPORT)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Lead email dispatch report',
    description:
      'Returns a report of all dispatched lead emails — which team members received each lead email, and whether they responded. Filter by lead_id query param.',
  })
  @ApiQuery({
    name: 'lead_id',
    required: false,
    type: Number,
    description: 'Filter report by a specific lead ID',
  })
  async getDispatchReport(@Query('lead_id') leadId?: string) {
    const id = leadId ? parseInt(leadId, 10) : undefined;
    if (leadId && (isNaN(id!) || id! < 1)) {
      throw new BadRequestException('lead_id must be a positive integer.');
    }
    const report = await this.leadDispatchService.getDispatchReport(id);
    return {
      status: 'success',
      total_leads: report.length,
      report,
    };
  }

  // ─────────────────────────────────────────────────────────────
  // Assignment Member Management (admin protected)
  // ─────────────────────────────────────────────────────────────

  @Get('assignment-members')
  @RequirePermission(PermissionEnum.LEADS_ASSIGNMENT_MANAGE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List all lead assignment team members',
    description:
      'Returns team members ordered by their notification order (0 = first).',
  })
  async getMembers() {
    const members = await this.memberService.getAll();
    return { status: 'success', total: members.length, members };
  }

  @Post('assignment-members')
  @RequirePermission(PermissionEnum.LEADS_ASSIGNMENT_MANAGE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Add a team member to the lead assignment order',
    description:
      'Adds a team member who will receive lead notification emails. Order 0 = first notified.',
  })
  @ApiResponse({ status: 201, description: 'Member added' })
  @ApiResponse({ status: 409, description: 'Duplicate email or order' })
  async addMember(@Body() dto: CreateAssignmentMemberDto) {
    const member = await this.memberService.create(dto);
    return { status: 'success', member };
  }

  @Patch('assignment-members/:id')
  @RequirePermission(PermissionEnum.LEADS_ASSIGNMENT_MANAGE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update a team member (email, name, order, isActive)',
  })
  @ApiResponse({ status: 200, description: 'Member updated' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  async updateMember(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAssignmentMemberDto,
  ) {
    const member = await this.memberService.update(id, dto);
    return { status: 'success', member };
  }

  @Delete('assignment-members/:id')
  @RequirePermission(PermissionEnum.LEADS_ASSIGNMENT_MANAGE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Remove a team member from the lead assignment order',
  })
  @ApiResponse({ status: 200, description: 'Member removed' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  async deleteMember(@Param('id', ParseIntPipe) id: number) {
    await this.memberService.delete(id);
    return { status: 'success', message: `Member ${id} removed.` };
  }

  // ─────────────────────────────────────────────────────────────
  // Lead by ID or user_id (must come AFTER all static routes)
  // ─────────────────────────────────────────────────────────────

  @Get(':idOrUserId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get lead(s) by numeric id or user_id',
    description:
      'Pass a numeric id (e.g. 1) for a single lead, or user_id (e.g. FY271407489) for all leads of that user.',
  })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 404, description: 'Lead(s) not found' })
  async getByIdOrUserId(@Param('idOrUserId') idOrUserId: string) {
    if (isNumericId(idOrUserId)) {
      const lead = await this.dailyLeadsService.getById(
        parseLeadId(idOrUserId),
      );
      if (!lead) {
        return { status: 'error', message: 'Lead not found', lead: null };
      }
      return { status: 'success', lead };
    }
    return this.dailyLeadsService.getByUserId(idOrUserId);
  }

  @Patch(':idOrUserId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update lead(s) by numeric id or user_id',
    description:
      'Pass numeric id to update one lead. Pass user_id to update by user_id; include product in body to update a specific lead, or omit to update all leads for that user.',
  })
  @ApiResponse({ status: 200, description: 'Lead(s) updated' })
  @ApiResponse({ status: 404, description: 'Lead(s) not found' })
  async update(
    @Param('idOrUserId') idOrUserId: string,
    @Body() dto: UpdateDailyLeadDto,
  ) {
    if (isNumericId(idOrUserId)) {
      const lead = await this.dailyLeadsService.update(
        parseLeadId(idOrUserId),
        dto,
      );
      if (!lead) {
        return { status: 'error', message: 'Lead not found', lead: null };
      }
      return { status: 'success', lead };
    }
    const result = await this.dailyLeadsService.updateByUserId(idOrUserId, dto);
    if (result.updated === 0) {
      return { status: 'error', message: 'No leads found for this user_id' };
    }
    return { status: 'success', updated: result.updated, leads: result.leads };
  }

  @Delete(':idOrUserId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete lead(s) by numeric id or user_id',
  })
  @ApiResponse({ status: 200, description: 'Lead(s) deleted' })
  @ApiResponse({ status: 404, description: 'Lead(s) not found' })
  async delete(@Param('idOrUserId') idOrUserId: string) {
    if (isNumericId(idOrUserId)) {
      const deleted = await this.dailyLeadsService.delete(
        parseLeadId(idOrUserId),
      );
      if (!deleted) {
        return { status: 'error', message: 'Lead not found' };
      }
      return { status: 'success', message: 'Lead deleted' };
    }
    const deleted = await this.dailyLeadsService.deleteByUserId(idOrUserId);
    if (deleted === 0) {
      return { status: 'error', message: 'No leads found for this user_id' };
    }
    return {
      status: 'success',
      message: `${deleted} lead(s) deleted`,
      deleted,
    };
  }
}

/** Builds a minimal HTML response page for the email respond endpoint */
function buildHtmlPage(
  title: string,
  message: string,
  success: boolean,
): string {
  const color = success ? '#2E7D32' : '#C62828';
  const bg = success ? '#E8F5E9' : '#FFEBEE';
  const icon = success ? '✅' : '❌';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — Jupiter Marine Sales</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
    .card { background: ${bg}; border: 2px solid ${color}; border-radius: 12px; padding: 40px; max-width: 480px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .icon { font-size: 48px; margin-bottom: 16px; }
    h1 { color: ${color}; font-size: 22px; margin-bottom: 12px; }
    p { color: #333; font-size: 15px; line-height: 1.6; }
    .footer { margin-top: 24px; font-size: 12px; color: #888; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${icon}</div>
    <h1>${title}</h1>
    <p>${message}</p>
    <div class="footer">Jupiter Marine Sales</div>
  </div>
</body>
</html>`;
}
