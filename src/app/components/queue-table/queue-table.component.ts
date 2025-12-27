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

  // Using a setter ensures the paginator is linked the moment it renders
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
    // Green (80%+), Orange (50%-79%), Red (<50%)
    if (compliance >= 80) return '#6bb68c'; 
    if (compliance >= 50) return '#f1d37e'; 
    return '#d32f2f';
  }
}