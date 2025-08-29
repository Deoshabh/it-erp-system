import { Controller, Get, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';
import { LeadService } from '../services/lead.service';
import { CustomerService } from '../services/customer.service';
import { OpportunityService } from '../services/opportunity.service';

@ApiTags('sales')
@ApiBearerAuth()
@Controller('sales')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SalesController {
  constructor(
    private readonly leadService: LeadService,
    private readonly customerService: CustomerService,
    private readonly opportunityService: OpportunityService,
  ) {}

  @Get('statistics')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.SALES)
  @ApiOperation({ summary: 'Get overall sales statistics' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Sales statistics retrieved successfully' })
  async getOverallStatistics() {
    try {
      const [leadStats, customerStats, opportunityStats] = await Promise.all([
        this.leadService.getLeadStatistics(),
        this.customerService.getCustomerStatistics(),
        this.opportunityService.getOpportunityStatistics(),
      ]);

      return {
        leads: leadStats,
        customers: customerStats,
        opportunities: opportunityStats,
        summary: {
          totalLeads: leadStats.totalLeads || 0,
          totalCustomers: customerStats.totalCustomers || 0,
          totalOpportunities: opportunityStats.totalOpportunities || 0,
          totalRevenue: opportunityStats.totalValue || 0,
          conversionRate: leadStats.totalLeads > 0 
            ? ((customerStats.totalCustomers || 0) / leadStats.totalLeads * 100).toFixed(2)
            : '0.00',
        }
      };
    } catch (error) {
      // Return empty stats if services aren't implemented yet
      return {
        leads: { totalLeads: 0 },
        customers: { totalCustomers: 0 },
        opportunities: { totalOpportunities: 0, totalValue: 0 },
        summary: {
          totalLeads: 0,
          totalCustomers: 0,
          totalOpportunities: 0,
          totalRevenue: 0,
          conversionRate: '0.00',
        }
      };
    }
  }

  @Get('dashboard-data')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.SALES)
  @ApiOperation({ summary: 'Get sales dashboard data' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Sales dashboard data retrieved successfully' })
  async getDashboardData() {
    try {
      const statistics = await this.getOverallStatistics();
      
      return {
        ...statistics,
        recentActivity: {
          recentLeads: [],
          recentCustomers: [],
          recentOpportunities: [],
        },
        performance: {
          monthlyGrowth: '0%',
          quarterlyGrowth: '0%',
          yearlyGrowth: '0%',
        }
      };
    } catch (error) {
      return {
        leads: { totalLeads: 0 },
        customers: { totalCustomers: 0 },
        opportunities: { totalOpportunities: 0, totalValue: 0 },
        summary: {
          totalLeads: 0,
          totalCustomers: 0,
          totalOpportunities: 0,
          totalRevenue: 0,
          conversionRate: '0.00',
        },
        recentActivity: {
          recentLeads: [],
          recentCustomers: [],
          recentOpportunities: [],
        },
        performance: {
          monthlyGrowth: '0%',
          quarterlyGrowth: '0%',
          yearlyGrowth: '0%',
        }
      };
    }
  }
}
