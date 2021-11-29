import { Component,  ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { filter, map } from 'rxjs/operators';
import { Subject } from "rxjs";
import { Router, NavigationEnd, ActivatedRoute, NavigationStart } from '@angular/router';
// import { NgxSpinnerService } from 'ngx-spinner';
// import { ConnectionService } from 'ng-connection-service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  status = 'ONLINE';
  isConnected = true;
  @ViewChild('openModal') openModal: any;
  @ViewChild('close') close: any;




}
