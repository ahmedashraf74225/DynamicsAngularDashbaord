import { Component, Input, ViewChild, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-queue-table',
  templateUrl: './queue-table.component.html',
  styleUrls: ['./queue-table.component.css']
})
export class QueueTableComponent implements OnChanges, AfterViewInit {
  @Input() data: any[] = [];
  
  displayedColumns: string[] = ['name', 'open', 'avgCaseAge', 'oldestCaseAge', 'compliance'];
  dataSource = new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator) set paginator(value: MatPaginator) {
    if (value) {
      this.dataSource.paginator = value;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] && this.data) {
      this.dataSource.data = this.data;
    }
  }

  ngAfterViewInit() {
    // Fallback assignment for initial load
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

   getBarColor(compliance: number): string {
    // Green: 95% or above (Within SLA)
    if (compliance >= 95) return '#6bb68c'; 
    
    // Yellow: 90-94% (Expires Soon)
    if (compliance >= 90) return '#f1d37e'; 
    
    // Red: 89% and below (Breached)
    return '#d32f2f';
  }

}