import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AgentSettingRoutingModule } from './agent-setting-routing.module';
import { AgentSettingComponent } from './agent-setting.component';


@NgModule({
  declarations: [
    AgentSettingComponent
  ],
  imports: [
    CommonModule,
    AgentSettingRoutingModule
  ]
})
export class AgentSettingModule { }
