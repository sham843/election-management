import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CreateRegionalLeaderRoutingModule } from './create-regional-leader-routing.module';
import { CreateRegionalLeaderComponent } from './create-regional-leader.component';


@NgModule({
  declarations: [
    CreateRegionalLeaderComponent
  ],
  imports: [
    CommonModule,
    CreateRegionalLeaderRoutingModule
  ]
})
export class CreateRegionalLeaderModule { }
