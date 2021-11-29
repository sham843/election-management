import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';
import { AuthorizationGuard } from './auth/authorization.guard';
import { NoAuthGuardService } from './auth/no-auth-guard.service';
import { PageNotFoundComponent } from './errors/page-not-found/page-not-found.component';
import { ServerErrorComponent } from './errors/server-error/server-error.component';
import { PartialComponent } from './partial/partial.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadChildren: () => import('./login/login.module').then(m => m.LoginModule), data: { title: 'Login' }, canActivate: [NoAuthGuardService] },
  {
    path: '',
    canActivate: [AuthGuard],
    canActivateChild: [AuthorizationGuard],
    component: PartialComponent, children: [
      //Ele manag
      { path: 'create-elections', loadChildren: () => import('./partial/election-management/create-elections/create-elections.module').then(m => m.CreateElectionsModule), data: { title: 'Dashboard', allowedRoles: [] }},
      { path: 'create-constituency', loadChildren: () => import('./partial/election-management/create-constitueny/create-constitueny.module').then(m => m.CreateConstituenyModule) },
      { path: 'create-regional-leader', loadChildren: () => import('./partial/election-management/create-regional-leader/create-regional-leader.module').then(m => m.CreateRegionalLeaderModule) },
      { path: 'assign-elections-to-regional-leader', loadChildren: () => import('./partial/election-management/assign-elections-to-regional-leader/assign-elections-to-regional-leader.module').then(m => m.AssignElectionsToRegionalLeaderModule) },
      { path: 'assign-booth-to-constituency', loadChildren: () => import('./partial/election-management/assign-booth-to-constituency/assign-booth-to-constituency.module').then(m => m.AssignBoothToConstituencyModule) },
      { path: 'election-dashboard', loadChildren: () => import('./partial/election-management/election-dashboard/election-dashboard.module').then(m => m.ElectionDashboardModule) },
    
      //booth manag
      { path: 'agents-activity', loadChildren: () => import('./partial/booth-management/agents-activity/agents-activity.module').then(m => m.AgentsActivityModule) },
      { path: 'assign-agents-to-booth', loadChildren: () => import('./partial/booth-management/assign-agents-to-booth/assign-agents-to-booth.module').then(m => m.AssignAgentsToBoothModule) },
      { path: 'assign-candidate-to-constituency', loadChildren: () => import('./partial/booth-management/assign-candidate-to-constituency/assign-candidate-to-constituency.module').then(m => m.AssignCandidateToConstituencyModule) },
      { path: 'booth-analytics', loadChildren: () => import('./partial/booth-management/booth-analytics/booth-analytics.module').then(m => m.BoothAnalyticsModule) },
      { path: 'booth-dashboard', loadChildren: () => import('./partial/booth-management/booth-dashboard/booth-dashboard.module').then(m => m.BoothDashboardModule) },
      { path: 'candidate-registration', loadChildren: () => import('./partial/booth-management/candidate-registration/candidate-registration.module').then(m => m.CandidateRegistrationModule) },
      { path: 'view-boothwise-voters-list', loadChildren: () => import('./partial/booth-management/view-boothwise-voters-list/view-boothwise-voters-list.module').then(m => m.ViewBoothwiseVotersListModule) },
    ]
  },
  { path: '500', component: ServerErrorComponent },
  { path: '**', component: PageNotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
