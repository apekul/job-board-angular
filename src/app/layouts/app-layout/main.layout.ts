import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  standalone: true,
  selector: 'app-main-layout',
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './main-layout.html',
  styleUrls: ['./main-layout.css'],
})
export class MainLayout {}
