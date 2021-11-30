import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ViewBoothwiseVotersListRoutingModule } from './view-boothwise-voters-list-routing.module';
import { ViewBoothwiseVotersListComponent } from './view-boothwise-voters-list.component';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSelectModule } from 'ngx-select-ex';


@NgModule({
  declarations: [
    ViewBoothwiseVotersListComponent
  ],
  imports: [
    CommonModule,
    ViewBoothwiseVotersListRoutingModule,
    NgxSelectModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    Ng2SearchPipeModule,
  ]
})
export class ViewBoothwiseVotersListModule { }
