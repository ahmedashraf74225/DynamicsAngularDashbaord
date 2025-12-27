import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CriticalListComponent } from './critical-list.component';

describe('CriticalListComponent', () => {
  let component: CriticalListComponent;
  let fixture: ComponentFixture<CriticalListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CriticalListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CriticalListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
