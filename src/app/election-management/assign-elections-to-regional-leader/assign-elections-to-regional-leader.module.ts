import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AssignElectionsToRegionalLeaderRoutingModule } from './assign-elections-to-regional-leader-routing.module';
import { AssignElectionsToRegionalLeaderComponent } from './assign-elections-to-regional-leader.component';


@NgModule({
  declarations: [
    AssignElectionsToRegionalLeaderComponent
  ],
  imports: [
    CommonModule,
    AssignElectionsToRegionalLeaderRoutingModule
  ]
})
export class AssignElectionsToRegionalLeaderModule { }
