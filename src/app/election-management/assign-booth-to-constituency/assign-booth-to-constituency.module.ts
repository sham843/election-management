import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AssignBoothToConstituencyRoutingModule } from './assign-booth-to-constituency-routing.module';
import { AssignBoothToConstituencyComponent } from './assign-booth-to-constituency.component';


@NgModule({
  declarations: [
    AssignBoothToConstituencyComponent
  ],
  imports: [
    CommonModule,
    AssignBoothToConstituencyRoutingModule
  ]
})
export class AssignBoothToConstituencyModule { }
