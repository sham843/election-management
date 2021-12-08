import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AssignBoothToVillageRoutingModule } from './assign-booth-to-village-routing.module';
import { AssignBoothToVillageComponent } from './assign-booth-to-village.component';


@NgModule({
  declarations: [
    AssignBoothToVillageComponent
  ],
  imports: [
    CommonModule,
    AssignBoothToVillageRoutingModule
  ]
})
export class AssignBoothToVillageModule { }
