import { Component, OnInit } from '@angular/core';
import { DynamicsService } from './services/dynamics.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'd365-dashboard';
  
  dashboardData: any[] = [];
  criticalCases: any[] = [];
  kpis = { total: 0, within: 0, atRisk: 0, breached: 0 };
  
  // Variables for the bottom section
  overallCompliance: number = 0;
  alertData: any[] = [];

  // UI State variables
  isLoading: boolean = false;
  hasError: boolean = false;
  errorMessage: string = '';
  lastUpdated: Date | null = null;

  constructor(private dynamicsService: DynamicsService) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  async loadDashboardData() {
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';

    try {
      const [queueRes, criticalRes, kpiRes] = await Promise.all([
        this.dynamicsService.getQueueData(),
        this.dynamicsService.getCriticalCases(),
        this.dynamicsService.getKpiData()
      ]);

      this.dashboardData = queueRes;
      this.criticalCases = criticalRes;
      this.kpis = kpiRes;
      this.lastUpdated = new Date();

      const totalSlaVolume = this.kpis.within + this.kpis.atRisk + this.kpis.breached;

      this.overallCompliance = totalSlaVolume > 0 
        ? Math.round((this.kpis.within / totalSlaVolume) * 100) 
        : 0;

      this.alertData = this.generateAlerts(queueRes);
      
      this.isLoading = false;

    } catch (error) {
      console.error("Error loading dashboard data:", error);
      this.isLoading = false;
      this.hasError = true;
      this.errorMessage = 'Failed to load dashboard data. Please check your connection and try again.';
      
      this.alertData = [{
        type: 'danger',
        message: 'Failed to load dashboard data. Click the refresh button to retry.'
      }];
    }
  }

  private generateAlerts(queueData: any[]): any[] {
    const alerts: any[] = [];

    queueData.forEach(q => {
      if (q.compliance < 90) {
        alerts.push({
          type: 'danger',
          message: `🚨 Breached SLA: ${q.name} (${q.compliance}% compliance)`
        });
      } 
      else if (q.compliance < 95) {
        alerts.push({
          type: 'warning',
          message: `⚠️ Expires Soon: ${q.name} (${q.compliance}% compliance)`
        });
      }
    });

    alerts.sort((a, b) => {
      const priority: any = { danger: 1, warning: 2};
      return priority[a.type] - priority[b.type];
    });

    return alerts;
  }

  refreshData() {
    this.loadDashboardData();
  }
}