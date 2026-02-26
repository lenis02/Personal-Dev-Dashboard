import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TierBadge } from './tier-badge';

describe('TierBadge', () => {
  let component: TierBadge;
  let fixture: ComponentFixture<TierBadge>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TierBadge],
    }).compileComponents();

    fixture = TestBed.createComponent(TierBadge);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
