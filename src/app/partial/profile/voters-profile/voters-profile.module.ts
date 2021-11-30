import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VotersProfileRoutingModule } from './voters-profile-routing.module';
import { VotersProfileComponent } from './voters-profile.component';


@NgModule({
  declarations: [
    VotersProfileComponent
  ],
  imports: [
    CommonModule,
    VotersProfileRoutingModule
  ]
})
export class VotersProfileModule { }
