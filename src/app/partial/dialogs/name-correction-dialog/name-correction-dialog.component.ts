import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-name-correction-dialog',
  templateUrl: './name-correction-dialog.component.html',
  styleUrls: ['./name-correction-dialog.component.css']
})
export class NameCorrectionDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<NameCorrectionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {}

  ngOnInit(): void {
  }

  onNoClick(text:any): void {
    this.dialogRef.close(text);
  }
}
