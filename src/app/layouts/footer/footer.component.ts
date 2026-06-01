import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `<footer class="bg-gray-900 text-gray-400 text-center py-4 text-sm">Job Board {{ currentYear }}</footer>`,
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
