import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BoothAnalyticsRoutingModule } from './booth-analytics-routing.module';
import { BoothAnalyticsComponent } from './booth-analytics.component';


@NgModule({
  declarations: [
    BoothAnalyticsComponent
  ],
  imports: [
    CommonModule,
    BoothAnalyticsRoutingModule
  ]
})
export class BoothAnalyticsModule { }
