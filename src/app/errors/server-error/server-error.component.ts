import { Component, OnInit } from '@angular/core';
import { Location} from  '@angular/common';

@Component({
  selector: 'app-server-error',
  templateUrl: './server-error.component.html',
  styleUrls: ['./server-error.component.css']
})
export class ServerErrorComponent implements OnInit {

  constructor(public location:Location) { }

  ngOnInit() {
  }

}
