import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NameCorrectionRoutingModule } from './name-correction-routing.module';
import { NameCorrectionComponent } from './name-correction.component';


@NgModule({
  declarations: [
    NameCorrectionComponent
  ],
  imports: [
    CommonModule,
    NameCorrectionRoutingModule
  ]
})
export class NameCorrectionModule { }
