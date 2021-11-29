import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CreateConstituenyRoutingModule } from './create-constitueny-routing.module';
import { CreateConstituenyComponent } from './create-constitueny.component';


@NgModule({
  declarations: [
    CreateConstituenyComponent
  ],
  imports: [
    CommonModule,
    CreateConstituenyRoutingModule
  ]
})
export class CreateConstituenyModule { }
