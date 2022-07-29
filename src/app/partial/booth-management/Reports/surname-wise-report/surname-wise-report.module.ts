import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SurnameWiseReportRoutingModule } from './surname-wise-report-routing.module';
import { SurnameWiseReportComponent } from './surname-wise-report.component';


@NgModule({
  declarations: [
    SurnameWiseReportComponent
  ],
  imports: [
    CommonModule,
    SurnameWiseReportRoutingModule
  ]
})
export class SurnameWiseReportModule { }
