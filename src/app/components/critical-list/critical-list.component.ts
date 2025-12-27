import { Component, Input, ViewChild, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-critical-list',
  templateUrl: './critical-list.component.html',
  styleUrls: ['./critical-list.component.css']
})
export class CriticalListComponent implements OnChanges, AfterViewInit {
  @Input() cases: any[] = [];

  // Defining the properties the HTML is looking for
  displayedColumns: string[] = ['caseNumber', 'queueName', 'enteredAt', 'exitedAt', 'owner'];
  dataSource = new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // Watch for data changes from the parent component
  ngOnChanges(changes: SimpleChanges) {
    if (changes['cases'] && this.cases) {
      this.dataSource.data = this.cases;
    }
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }
}