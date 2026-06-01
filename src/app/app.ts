import { Component } from '@angular/core';
import { MainLayout } from './layouts/app-layout/main.layout';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [MainLayout],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App {}
