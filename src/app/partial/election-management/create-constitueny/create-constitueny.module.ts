import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CreateConstituenyRoutingModule } from './create-constitueny-routing.module';
import { CreateConstituenyComponent } from './create-constitueny.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSelectModule } from 'ngx-select-ex';
// import { AgmCoreModule } from '@agm/core';
// import { AgmDrawingModule } from '@agm/drawing';


@NgModule({
  declarations: [
    CreateConstituenyComponent
  ],
  imports: [
    CommonModule,
    CreateConstituenyRoutingModule,
    NgxSelectModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
  ]
})
export class CreateConstituenyModule { }

// AgmCoreModule.forRoot({ 
//   apiKey: 'AIzaSyBCSDtf8g7XZ9B-P20ZqzOIr1TUQAg4Fj0',
//   libraries: ['drawing','places', 'geometry'] }),
//   AgmDrawingModule,
// ],
