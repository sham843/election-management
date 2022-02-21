import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoothAnalytics1RoutingModule } from './booth-analytics1-routing.module';
import { BoothAnalytics1Component } from './booth-analytics1.component';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSelectModule } from 'ngx-select-ex';

@NgModule({
  declarations: [
    BoothAnalytics1Component
  ],
  imports: [
    CommonModule,
    BoothAnalytics1RoutingModule,
    NgxSelectModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    Ng2SearchPipeModule,
  ]
})
export class BoothAnalytics1Module { }
