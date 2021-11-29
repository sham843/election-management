import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AssignAgentsToBoothRoutingModule } from './assign-agents-to-booth-routing.module';
import { AssignAgentsToBoothComponent } from './assign-agents-to-booth.component';


@NgModule({
  declarations: [
    AssignAgentsToBoothComponent
  ],
  imports: [
    CommonModule,
    AssignAgentsToBoothRoutingModule
  ]
})
export class AssignAgentsToBoothModule { }
