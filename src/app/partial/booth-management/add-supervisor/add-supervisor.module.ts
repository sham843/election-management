import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AddSupervisorRoutingModule } from './add-supervisor-routing.module';
import { AddSupervisorComponent } from './add-supervisor.component';


@NgModule({
  declarations: [
    AddSupervisorComponent
  ],
  imports: [
    CommonModule,
    AddSupervisorRoutingModule
  ]
})
export class AddSupervisorModule { }
