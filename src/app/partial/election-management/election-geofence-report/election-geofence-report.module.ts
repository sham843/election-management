import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ElectionGeofenceReportRoutingModule } from './election-geofence-report-routing.module';
import { ElectionGeofenceReportComponent } from './election-geofence-report.component';
import { AgmCoreModule } from '@agm/core';
import { AgmDrawingModule } from '@agm/drawing';


@NgModule({
  declarations: [
    ElectionGeofenceReportComponent
  ],
  imports: [
    CommonModule,
    ElectionGeofenceReportRoutingModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyAkNBALkBX7trFQFCrcHO2I85Re2MmzTo8',
      language: 'en',
      libraries: ['places', 'drawing', 'geometry'],
    }),
    AgmDrawingModule,
  ]
})
export class ElectionGeofenceReportModule { }
