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
      { path: 'assign-booth-to-village', loadChildren: () => import('./partial/election-management/assign-booth-to-village/assign-booth-to-village.module').then(m => m.AssignBoothToVillageModule),data: { title: 'Assign Booth To Village', allowedRoles: ['1'] }  },
      { path: 'client-setting', loadChildren: () => import('./partial/election-management/client-setting/client-setting.module').then(m => m.ClientSettingModule) ,data: { title: 'Client Setting', allowedRoles: ['1'] } },
      //booth manag
      { path: 'agents-activity/:id', loadChildren: () => import('./partial/booth-management/agents-activity/agents-activity.module').then(m => m.AgentsActivityModule),data:{ title:'Agents Activity',allowedRoles:['1','2'] }},
      { path: 'agents-activity', loadChildren: () => import('./partial/booth-management/agents-activity/agents-activity.module').then(m => m.AgentsActivityModule),data:{ title:'Agents Activity',allowedRoles:['1','2'] }},
      { path: 'assign-agents-to-booth', loadChildren: () => import('./partial/booth-management/assign-agents-to-booth/assign-agents-to-booth.module').then(m => m.AssignAgentsToBoothModule),data:{ title:'Assign Agents To Booth',allowedRoles:['1','2'] } },
      { path: 'assign-candidate-to-constituency', loadChildren: () => import('./partial/booth-management/assign-candidate-to-constituency/assign-candidate-to-constituency.module').then(m => m.AssignCandidateToConstituencyModule),data:{ title:'Assign Candidate To Constituency',allowedRoles:['1','2'] } },
      { path: 'booth-analytics', loadChildren: () => import('./partial/booth-management/booth-analytics/booth-analytics.module').then(m => m.BoothAnalyticsModule),data:{ title:'Booth Analytics',allowedRoles:['1','2'] } },
      { path: 'booth-analytics1', loadChildren: () => import('./partial/booth-management/booth-analytics1/booth-analytics1.module').then(m => m.BoothAnalytics1Module),data:{ title:'Booth Analytics1',allowedRoles:['1','2'] } },
      { path: 'client-dashboard', loadChildren: () => import('./partial/booth-management/booth-dashboard/booth-dashboard.module').then(m => m.BoothDashboardModule),data:{ title:'Booth Dashboard',allowedRoles:['1','2'] } },
      { path: 'candidate-registration', loadChildren: () => import('./partial/booth-management/candidate-registration/candidate-registration.module').then(m => m.CandidateRegistrationModule),data:{ title:'Candidate Registration',allowedRoles:['1','2'] } },
      { path: 'view-boothwise-voters-list', loadChildren: () => import('./partial/booth-management/view-boothwise-voters-list/view-boothwise-voters-list.module').then(m => m.ViewBoothwiseVotersListModule),data:{ title:'View Booth Wise Voters List',allowedRoles:['1','2'] } },
      { path: 'view-boothwise-voters-list/:id', loadChildren: () => import('./partial/booth-management/view-boothwise-voters-list/view-boothwise-voters-list.module').then(m => m.ViewBoothwiseVotersListModule),data:{ title:'View Booth Wise Voters List',allowedRoles:['1','2'] } },
      { path: 'view-boothwise-voters-list1', loadChildren: () => import('./partial/booth-management/view-boothwise-voters-list1/view-boothwise-voters-list1.module').then(m => m.ViewBoothwiseVotersList1Module),data:{ title:'View Booth Wise Voters List1',allowedRoles:['1','2'] } },
      { path: 'add-supervisor', loadChildren: () => import('./partial/booth-management/add-supervisor/add-supervisor.module').then(m => m.AddSupervisorModule),data:{ title:'Add Supervisor',allowedRoles:['1','2'] } },
      { path: 'crm', loadChildren: () => import('./partial/booth-management/crm/crm.module').then(m => m.CrmModule) ,data:{ title:'CRM',allowedRoles:['1','2','6'] }},
      { path: 'crm-history/:id', loadChildren: () => import('./partial/booth-management/crm-history/crm-history.module').then(m => m.CrmHistoryModule) ,data:{ title:'CRM History',allowedRoles:['1','2','6'] }},
  
      { path: 'voters-profile/:id', loadChildren: () => import('./partial/profile/voters-profile/voters-profile.module').then(m => m.VotersProfileModule) ,data:{ title:'Voters Profile',allowedRoles:['1','2'] } },
      { path: 'restricted-mobile', loadChildren: () => import('./partial/settings/restricted-mobile/restricted-mobile.module').then(m => m.RestrictedMobileModule),data:{ title:'Restricted Mobile',allowedRoles:['1','2'] } },
      { path: 'my-profile', loadChildren: () => import('./my-profile/my-profile.module').then(m => m.MyProfileModule),data:{ title:'My Profile',allowedRoles:['1','2','6'] } },
      { path: 'notifications', loadChildren: () => import('./partial/booth-management/notifications/notifications.module').then(m => m.NotificationsModule), data: { title: 'Notifications', allowedRoles: ['1','2'] } },
      { path: 'forward-activities', loadChildren: () => import('./partial/booth-management/forward-activities/forward-activities.module').then(m => m.ForwardActivitiesModule), data: { title: 'Forward Activities', allowedRoles: ['1','2'] } },
      { path: 'name-correction', loadChildren: () => import('./partial/booth-management/name-correction/name-correction.module').then(m => m.NameCorrectionModule), data: { title: 'Voter Name Correction', allowedRoles: ['1','2'] } },
      { path: 'agent-setting', loadChildren: () => import('./partial/settings/agent-setting/agent-setting.module').then(m => m.AgentSettingModule), data: { title: 'Agent Setting', allowedRoles: ['1','2'] }  },
      { path: 'prominent-leader', loadChildren: () => import('./partial/settings/prominent-leader/prominent-leader.module').then(m => m.ProminentLeaderModule), data: { title: 'Prominent Leader', allowedRoles: ['1','2'] }   },
      { path: 'election-geofence-report', loadChildren: () => import('./partial/election-management/election-geofence-report/election-geofence-report.module').then(m => m.ElectionGeofenceReportModule), data: { title: 'Election Geofence Report', allowedRoles: ['1','2'] }},
      { path: 'surname-wise-report', loadChildren: () => import('./partial/booth-management/Reports/surname-wise-report/surname-wise-report.module').then(m => m.SurnameWiseReportModule), data: { title: 'Surname Wise Report', allowedRoles: ['1','2'] }  },
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
