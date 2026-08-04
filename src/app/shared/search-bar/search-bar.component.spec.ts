import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchBarComponent } from './search-bar.component';

describe('SearchBarComponent', () => {
  let fixture: ComponentFixture<SearchBarComponent>;
  let component: SearchBarComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchBarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('emits the value after the debounce time', () => {
    vi.useFakeTimers();
    const emitted: string[] = [];
    component.searchChange.subscribe((v) => emitted.push(v));

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = 'Angular';
    input.dispatchEvent(new Event('input'));

    vi.advanceTimersByTime(300);
    expect(emitted).toEqual(['Angular']);
  });

  it('does not emit duplicate consecutive values', () => {
    vi.useFakeTimers();
    const emitted: string[] = [];
    component.searchChange.subscribe((v) => emitted.push(v));

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = 'Angular';
    input.dispatchEvent(new Event('input'));
    vi.advanceTimersByTime(300);

    input.value = 'Angular';
    input.dispatchEvent(new Event('input'));
    vi.advanceTimersByTime(300);

    expect(emitted).toEqual(['Angular']);
  });

  it('syncs the control from the value input', () => {
    fixture.componentRef.setInput('value', 'React');
    fixture.detectChanges();

    expect(component.control.value).toBe('React');
    expect((fixture.nativeElement.querySelector('input') as HTMLInputElement).value).toBe('React');
  });

  it('shows the clear button when there is a value and clears on click', () => {
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = 'Angular';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const clearButton = fixture.nativeElement.querySelector(
      '[aria-label="Clear search"]',
    ) as HTMLButtonElement;
    expect(clearButton).toBeTruthy();

    clearButton.click();
    expect(component.control.value).toBe('');

    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[aria-label="Clear search"]')).toBeFalsy();
  });
});
