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
      { path: 'create-elections', loadChildren: () => import('./partial/election-management/create-elections/create-elections.module').then(m => m.CreateElectionsModule), data: { title: 'Dashboard', allowedRoles: ['1'] }},
      { path: 'create-constituency', loadChildren: () => import('./partial/election-management/create-constitueny/create-constitueny.module').then(m => m.CreateConstituenyModule),data: { title: 'Create Constituency', allowedRoles: ['1'] } },
      { path: 'create-regional-leader', loadChildren: () => import('./partial/election-management/create-regional-leader/create-regional-leader.module').then(m => m.CreateRegionalLeaderModule),data: { title: 'Create Regional Leader', allowedRoles: ['1'] } },
      { path: 'assign-elections-to-regional-leader', loadChildren: () => import('./partial/election-management/assign-elections-to-regional-leader/assign-elections-to-regional-leader.module').then(m => m.AssignElectionsToRegionalLeaderModule),data: { title: 'Assign Elections To Regional Leader', allowedRoles: ['1'] }},
      { path: 'assign-booth-to-constituency', loadChildren: () => import('./partial/election-management/assign-booth-to-constituency/assign-booth-to-constituency.module').then(m => m.AssignBoothToConstituencyModule),data: { title: 'Assign Booth To Constituency Module', allowedRoles: ['1'] } },
      { path: 'election-dashboard', loadChildren: () => import('./partial/election-management/election-dashboard/election-dashboard.module').then(m => m.ElectionDashboardModule),data: { title: 'Election Dashboard', allowedRoles: ['1'] } },
    
      //booth manag
      { path: 'agents-activity', loadChildren: () => import('./partial/booth-management/agents-activity/agents-activity.module').then(m => m.AgentsActivityModule),data:{ title:'Agents Activity',allowedRoles:['1','2'] }},
      { path: 'assign-agents-to-booth', loadChildren: () => import('./partial/booth-management/assign-agents-to-booth/assign-agents-to-booth.module').then(m => m.AssignAgentsToBoothModule),data:{ title:'Assign Agents To Booth',allowedRoles:['1','2'] } },
      { path: 'assign-candidate-to-constituency', loadChildren: () => import('./partial/booth-management/assign-candidate-to-constituency/assign-candidate-to-constituency.module').then(m => m.AssignCandidateToConstituencyModule),data:{ title:'Assign Candidate To Constituency',allowedRoles:['1','2'] } },
      { path: 'booth-analytics', loadChildren: () => import('./partial/booth-management/booth-analytics/booth-analytics.module').then(m => m.BoothAnalyticsModule),data:{ title:'Booth Analytics',allowedRoles:['1','2'] } },
      { path: 'booth-dashboard', loadChildren: () => import('./partial/booth-management/booth-dashboard/booth-dashboard.module').then(m => m.BoothDashboardModule),data:{ title:'Booth Dashboard',allowedRoles:['1','2'] } },
      { path: 'candidate-registration', loadChildren: () => import('./partial/booth-management/candidate-registration/candidate-registration.module').then(m => m.CandidateRegistrationModule),data:{ title:'Candidate Registration',allowedRoles:['1','2'] } },
      { path: 'view-boothwise-voters-list', loadChildren: () => import('./partial/booth-management/view-boothwise-voters-list/view-boothwise-voters-list.module').then(m => m.ViewBoothwiseVotersListModule),data:{ title:'View Booth Wise Voters List',allowedRoles:['1','2'] } },
      { path: 'voters-profile', loadChildren: () => import('./partial/profile/voters-profile/voters-profile.module').then(m => m.VotersProfileModule) },
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
