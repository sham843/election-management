import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VotersProfileRoutingModule } from './voters-profile-routing.module';
import { VotersProfileComponent } from './voters-profile.component';
import { LightboxModule } from '@ngx-gallery/lightbox';
import { GalleryModule } from '@ngx-gallery/core';

@NgModule({
  declarations: [
    VotersProfileComponent
  ],
  imports: [
    CommonModule,
    VotersProfileRoutingModule,
    LightboxModule,
    GalleryModule,
  ]
})
export class VotersProfileModule { }
