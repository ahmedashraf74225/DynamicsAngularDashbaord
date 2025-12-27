import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SlaGaugeComponent } from './sla-gauge.component';

describe('SlaGaugeComponent', () => {
  let component: SlaGaugeComponent;
  let fixture: ComponentFixture<SlaGaugeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SlaGaugeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SlaGaugeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
