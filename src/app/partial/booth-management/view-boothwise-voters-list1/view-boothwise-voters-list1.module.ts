import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ViewBoothwiseVotersList1RoutingModule } from './view-boothwise-voters-list1-routing.module';
import { ViewBoothwiseVotersList1Component } from './view-boothwise-voters-list1.component';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSelectModule } from 'ngx-select-ex';
import { OwlNativeDateTimeModule, OwlDateTimeModule } from 'ng-pick-datetime';

@NgModule({
  declarations: [
    ViewBoothwiseVotersList1Component
  ],
  imports: [
    CommonModule,
    ViewBoothwiseVotersList1RoutingModule,
    NgxSelectModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    Ng2SearchPipeModule,
    OwlNativeDateTimeModule,
    OwlDateTimeModule
  ]
})
export class ViewBoothwiseVotersList1Module { }
