import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ElectionManagementComponent } from './election-management/election-management.component';

const routes: Routes = [

  
    // { path: 'create-elections', loadChildren: () => import('./election-management/create-elections/create-elections.module').then(m => m.CreateElectionsModule) }, { path: 'login', loadChildren: () => import('./login/login.module').then(m => m.LoginModule) }, 
    // { path: 'create-constituency', loadChildren: () => import('./create-constitueny/create-constitueny.module').then(m => m.CreateConstituenyModule) }, { path: 'create-regional-leader', loadChildren: () => import('./create-regional-leader/create-regional-leader.module').then(m => m.CreateRegionalLeaderModule) }, { path: 'assign-elections-to-regional-leader', loadChildren: () => import('./assign-elections-to-regional-leader/assign-elections-to-regional-leader.module').then(m => m.AssignElectionsToRegionalLeaderModule) }, { path: 'assign-booth-to-constituency', loadChildren: () => import('./assign-booth-to-constituency/assign-booth-to-constituency.module').then(m => m.AssignBoothToConstituencyModule) }, { path: 'election-dashboard', loadChildren: () => import('./election-dashboard/election-dashboard.module').then(m => m.ElectionDashboardModule) }
  ];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
