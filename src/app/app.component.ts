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
  
  // NEW: Variables for the bottom section
  overallCompliance: number = 0;
  alertData: any[] = [];

  constructor(private dynamicsService: DynamicsService) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  async loadDashboardData() {
    try {
      const [queueRes, criticalRes, kpiRes] = await Promise.all([
        this.dynamicsService.getQueueData(),
        this.dynamicsService.getCriticalCases(),
        this.dynamicsService.getKpiData()
      ]);

      this.dashboardData = queueRes;
      this.criticalCases = criticalRes;
      this.kpis = kpiRes;

      // 1. Calculate Overall Compliance for the Gauge
      this.overallCompliance = this.kpis.total > 0 
        ? Math.round((this.kpis.within / this.kpis.total) * 100) 
        : 0;

      // 2. Generate Alerts based on Queue Compliance levels
      this.alertData = queueRes
        .filter(q => q.compliance < 80) // Only show queues that need attention
        .map(q => ({
          type: q.compliance < 50 ? 'danger' : 'warning',
          message: `${q.compliance < 50 ? 'Breached' : 'At Risk'} alert for queue: ${q.name}`
        }));
      
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
  }
}