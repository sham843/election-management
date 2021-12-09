import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-voter-call-entries',
  templateUrl: './voter-call-entries.component.html',
  styleUrls: ['./voter-call-entries.component.css']
})
export class VoterCallEntriesComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<VoterCallEntriesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {}

  ngOnInit(): void {
  }

  onNoClick(text:any): void {
    this.dialogRef.close(text);
  }
}
