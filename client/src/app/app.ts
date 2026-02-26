import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NxWelcome } from './nx-welcome';
import { DashboardComponent } from '../../features/dashboard';

@Component({
  standalone: true,
  imports: [NxWelcome, RouterModule, DashboardComponent],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected title = 'client';
}
