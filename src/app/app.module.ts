import { DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthGuard } from './auth/auth.guard';
import { AuthorizationService } from './auth/authorization.service';
import { NoAuthGuardService } from './auth/no-auth-guard.service';
import { PartialComponent } from './partial/partial.component';

@NgModule({
  declarations: [
    AppComponent,
    PartialComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [DatePipe, AuthorizationService, NoAuthGuardService, AuthGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }
