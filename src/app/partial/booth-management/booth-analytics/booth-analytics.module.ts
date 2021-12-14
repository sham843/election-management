import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BoothAnalyticsRoutingModule } from './booth-analytics-routing.module';
import { BoothAnalyticsComponent } from './booth-analytics.component';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSelectModule } from 'ngx-select-ex';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';



@NgModule({
  declarations: [
    BoothAnalyticsComponent
  ],
  imports: [
    CommonModule,
    BoothAnalyticsRoutingModule,
    NgxSelectModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    Ng2SearchPipeModule,
    NgxDatatableModule,
  ]
})
export class BoothAnalyticsModule { }
