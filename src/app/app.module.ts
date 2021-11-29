import { DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgxSpinnerModule } from 'ngx-spinner';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthGuard } from './auth/auth.guard';
import { AuthorizationService } from './auth/authorization.service';
import { NoAuthGuardService } from './auth/no-auth-guard.service';
import { PartialComponent } from './partial/partial.component';
import { FooterComponent } from './partial/template/footer/footer.component';
import { HeaderComponent } from './partial/template/header/header.component';
import { SidebarComponent } from './partial/template/sidebar/sidebar.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxSelectModule } from 'ngx-select-ex';

@NgModule({
  declarations: [
    AppComponent,
    PartialComponent,
    HeaderComponent,
    SidebarComponent,
    FooterComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    NgxSpinnerModule,
    ReactiveFormsModule,
    NgxSelectModule,
    ToastrModule.forRoot({
      timeOut: 3000,
      closeButton: true,
      progressBar:true,
      preventDuplicates: true,
    }),
  ],
  providers: [DatePipe, AuthorizationService, NoAuthGuardService, AuthGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }
