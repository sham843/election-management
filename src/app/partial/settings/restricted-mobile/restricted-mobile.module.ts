import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RestrictedMobileRoutingModule } from './restricted-mobile-routing.module';
import { RestrictedMobileComponent } from './restricted-mobile.component';


@NgModule({
  declarations: [
    RestrictedMobileComponent
  ],
  imports: [
    CommonModule,
    RestrictedMobileRoutingModule
  ]
})
export class RestrictedMobileModule { }
