import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VotersProfileRoutingModule } from './voters-profile-routing.module';
import { VotersProfileComponent } from './voters-profile.component';
import { LightboxModule } from '@ngx-gallery/lightbox';
import { GalleryModule } from '@ngx-gallery/core';
import { AgmCoreModule } from '@agm/core';
import { NgxStarRatingModule } from 'ngx-star-rating';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    VotersProfileComponent
  ],
  imports: [
    CommonModule,
    VotersProfileRoutingModule,
    LightboxModule,
    GalleryModule,
    NgxStarRatingModule ,
    ReactiveFormsModule,
    FormsModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyAkNBALkBX7trFQFCrcHO2I85Re2MmzTo8',
      language: 'en',
      libraries: ['geometry','places']
    }),
  ]
})
export class VotersProfileModule { }
