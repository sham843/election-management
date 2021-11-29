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
      { path: 'create-elections', loadChildren: () => import('./partial/election-management/create-elections/create-elections.module').then(m => m.CreateElectionsModule) },
      { path: 'create-constituency', loadChildren: () => import('./partial/election-management/create-constitueny/create-constitueny.module').then(m => m.CreateConstituenyModule) },
      { path: 'create-regional-leader', loadChildren: () => import('./partial/election-management/create-regional-leader/create-regional-leader.module').then(m => m.CreateRegionalLeaderModule) },
      { path: 'assign-elections-to-regional-leader', loadChildren: () => import('./partial/election-management/assign-elections-to-regional-leader/assign-elections-to-regional-leader.module').then(m => m.AssignElectionsToRegionalLeaderModule) },
      { path: 'assign-booth-to-constituency', loadChildren: () => import('./partial/election-management/assign-booth-to-constituency/assign-booth-to-constituency.module').then(m => m.AssignBoothToConstituencyModule) },
      { path: 'election-dashboard', loadChildren: () => import('./partial/election-management/election-dashboard/election-dashboard.module').then(m => m.ElectionDashboardModule) },
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
