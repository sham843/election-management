import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ViewBoothwiseVotersListRoutingModule } from './view-boothwise-voters-list-routing.module';
import { ViewBoothwiseVotersListComponent } from './view-boothwise-voters-list.component';


@NgModule({
  declarations: [
    ViewBoothwiseVotersListComponent
  ],
  imports: [
    CommonModule,
    ViewBoothwiseVotersListRoutingModule
  ]
})
export class ViewBoothwiseVotersListModule { }
