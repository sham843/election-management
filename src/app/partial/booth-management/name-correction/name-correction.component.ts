import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NameCorrectionDialogComponent } from '../../dialogs/name-correction-dialog/name-correction-dialog.component';
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
    const dialogRef = this.dialog.open(NameCorrectionDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }
}
