import { Route } from '@angular/router';
import { AuthCallbackComponent } from '../core/auth-callback';
import { DashboardPage } from './pages/dashboard.page';
import { ClientsPage } from './pages/clients.page';
import { ProjectsPage } from './pages/projects.page';
import { TasksPage } from './pages/tasks.page';

export const appRoutes: Route[] = [
  { path: 'login/success', component: AuthCallbackComponent },
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'dashboard', component: DashboardPage },
  { path: 'clients', component: ClientsPage },
  { path: 'projects', component: ProjectsPage },
  { path: 'tasks', component: TasksPage },
];
