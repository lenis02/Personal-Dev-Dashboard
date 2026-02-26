import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SbdChart } from './sbd-chart';

describe('SbdChart', () => {
  let component: SbdChart;
  let fixture: ComponentFixture<SbdChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SbdChart],
    }).compileComponents();

    fixture = TestBed.createComponent(SbdChart);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
