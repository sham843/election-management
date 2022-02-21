import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BoothAnalytics1Component } from './booth-analytics1.component';

const routes: Routes = [{ path: '', component: BoothAnalytics1Component }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BoothAnalytics1RoutingModule { }
