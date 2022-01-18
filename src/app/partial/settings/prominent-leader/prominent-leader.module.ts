import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProminentLeaderRoutingModule } from './prominent-leader-routing.module';
import { ProminentLeaderComponent } from './prominent-leader.component';


@NgModule({
  declarations: [
    ProminentLeaderComponent
  ],
  imports: [
    CommonModule,
    ProminentLeaderRoutingModule
  ]
})
export class ProminentLeaderModule { }
