import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; // Required for Material

// Material Table & Paginator Modules
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';

import { AppComponent } from './app.component';
import { KpiCardComponent } from './components/kpi-card/kpi-card.component';
import { QueueTableComponent } from './components/queue-table/queue-table.component';
import { CriticalListComponent } from './components/critical-list/critical-list.component';
import { SlaGaugeComponent } from './components/sla-gauge/sla-gauge.component';
import { AlertsComponent } from './components/alerts/alerts.component';

@NgModule({
  declarations: [
    AppComponent,
    KpiCardComponent,
    QueueTableComponent,
    CriticalListComponent,
    SlaGaugeComponent,
    AlertsComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule, // Added for Material animations
    MatTableModule,          // Added for Queue & Critical tables
    MatPaginatorModule       // Added for pagination
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }