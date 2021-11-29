import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CreateElectionsRoutingModule } from './create-elections-routing.module';
import { CreateElectionsComponent } from './create-elections.component';


@NgModule({
  declarations: [
    CreateElectionsComponent
  ],
  imports: [
    CommonModule,
    CreateElectionsRoutingModule
  ]
})
export class CreateElectionsModule { }
