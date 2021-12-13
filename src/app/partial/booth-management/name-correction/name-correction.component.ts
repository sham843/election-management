import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
@Component({
  selector: 'app-name-correction',
  templateUrl: './name-correction.component.html',
  styleUrls: ['./name-correction.component.css']
})
export class NameCorrectionComponent implements OnInit {

  constructor(
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
  }

  openDialogNameCorrection() {
    const dialogRef = this.dialog.open(NameCorrectionComponent);

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }
}
