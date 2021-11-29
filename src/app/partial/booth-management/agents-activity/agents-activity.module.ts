import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AgentsActivityRoutingModule } from './agents-activity-routing.module';
import { AgentsActivityComponent } from './agents-activity.component';


@NgModule({
  declarations: [
    AgentsActivityComponent
  ],
  imports: [
    CommonModule,
    AgentsActivityRoutingModule
  ]
})
export class AgentsActivityModule { }
