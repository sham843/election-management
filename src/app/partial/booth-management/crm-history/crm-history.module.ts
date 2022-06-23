import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CrmHistoryRoutingModule } from './crm-history-routing.module';
import { CrmHistoryComponent } from './crm-history.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSelectModule } from 'ngx-select-ex';
import { OwlNativeDateTimeModule, OwlDateTimeModule } from 'ng-pick-datetime';

@NgModule({
  declarations: [
    CrmHistoryComponent
  ],
  imports: [
    CommonModule,
    CrmHistoryRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    NgxSelectModule,
    OwlNativeDateTimeModule,
    OwlDateTimeModule
  ]
})
export class CrmHistoryModule { }
