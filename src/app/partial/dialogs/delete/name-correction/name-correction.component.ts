import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-name-correction',
  templateUrl: './name-correction.component.html',
  styleUrls: ['./name-correction.component.css']
})
export class NameCorrectionComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<NameCorrectionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {}

  ngOnInit(): void {
  }

  onNoClick(text:any): void {
    this.dialogRef.close(text);
  }
}
