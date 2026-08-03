import { Component, effect, input, output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './search-bar.component.html',
})
export class SearchBarComponent {
  value = input('');
  searchChange = output<string>();

  control = new FormControl('', { nonNullable: true });

  constructor() {
    this.control.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((v) => this.searchChange.emit(v));

    effect(() => {
      this.control.setValue(this.value(), { emitEvent: false });
    });
  }

  clear() {
    this.control.setValue('');
  }
}
