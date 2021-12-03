import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AgentsActivityRoutingModule } from './agents-activity-routing.module';
import { AgentsActivityComponent } from './agents-activity.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSelectModule } from 'ngx-select-ex';
import { OwlNativeDateTimeModule, OwlDateTimeModule } from 'ng-pick-datetime';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


@NgModule({
  declarations: [
    AgentsActivityComponent
  ],
  imports: [
    CommonModule,
    AgentsActivityRoutingModule,
    // BrowserAnimationsModule,
    NgxSelectModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    MatCheckboxModule,
    Ng2SearchPipeModule,
    OwlNativeDateTimeModule,
    OwlDateTimeModule,
  ]
})
export class AgentsActivityModule { }
