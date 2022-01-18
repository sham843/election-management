import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ViewBoothwiseVotersList1Component } from './view-boothwise-voters-list1.component';

const routes: Routes = [{ path: '', component: ViewBoothwiseVotersList1Component }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ViewBoothwiseVotersList1RoutingModule { }
