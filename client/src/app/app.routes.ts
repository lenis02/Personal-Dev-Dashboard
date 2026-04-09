import { Route } from '@angular/router';
import { AuthCallbackComponent } from '../core/auth-callback';
import { DashboardPage } from './pages/dashboard.page';
import { ClientsPage } from './pages/clients.page';
import { ProjectsPage } from './pages/projects.page';
import { TasksPage } from './pages/tasks.page';
import { RevenuePage } from './pages/revenue.page';
import { ProjectDocumentsPage } from './pages/project-documents.page';

export const appRoutes: Route[] = [
  { path: 'login/success', component: AuthCallbackComponent },
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'dashboard', component: DashboardPage },
  { path: 'clients', component: ClientsPage },
  { path: 'projects', component: ProjectsPage },
  { path: 'tasks', component: TasksPage },
  { path: 'revenue', component: RevenuePage },
  { path: 'projects/:id/documents', component: ProjectDocumentsPage },
];
