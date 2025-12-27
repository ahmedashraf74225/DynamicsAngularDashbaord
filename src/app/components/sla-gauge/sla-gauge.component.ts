import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-sla-gauge',
  templateUrl: './sla-gauge.component.html',
  styleUrls: ['./sla-gauge.component.css']
})
export class SlaGaugeComponent {
  @Input() percent: number = 0;
}