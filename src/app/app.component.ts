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

  // NEW: UI State variables
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

      // 1. Calculate Overall Compliance for the Gauge
      this.overallCompliance = this.kpis.total > 0 
        ? Math.round((this.kpis.within / this.kpis.total) * 100) 
        : 0;

      // 2. Generate Alerts based on Queue Compliance levels
      this.alertData = queueRes
        .filter(q => q.compliance < 80)
        .map(q => ({
          type: q.compliance < 50 ? 'danger' : 'warning',
          message: `${q.compliance < 50 ? 'Breached' : 'At Risk'} alert for queue: ${q.name}`
        }));
      
      this.isLoading = false;

    } catch (error) {
      console.error("Error loading dashboard data:", error);
      this.isLoading = false;
      this.hasError = true;
      this.errorMessage = 'Failed to load dashboard data. Please check your connection and try again.';
      
      // Show error in alerts section
      this.alertData = [{
        type: 'danger',
        message: 'Failed to load dashboard data. Click the refresh button to retry.'
      }];
    }
  }

  // NEW: Manual refresh method
  refreshData() {
    this.loadDashboardData();
  }
}