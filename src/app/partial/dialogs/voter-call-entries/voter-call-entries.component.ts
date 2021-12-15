import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CallAPIService } from 'src/app/services/call-api.service';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-voter-call-entries',
  templateUrl: './voter-call-entries.component.html',
  styleUrls: ['./voter-call-entries.component.css']
})
export class VoterCallEntriesComponent implements OnInit {
  voterId:any
  
  getFeedbacksList:any
  getFeedbacksListTotal:any;
  feedbacksPaginationNo:any = 1;
  feedbacksPageSize: number = 10;


  enterNewFeedbackForm!:FormGroup;


  constructor(
    public dialogRef: MatDialogRef<VoterCallEntriesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private spinner: NgxSpinnerService,
    private callAPIService: CallAPIService,
    private router: Router,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private fb:FormBuilder,
    ) {}

  ngOnInit(): void {
    this.voterId = this.data.voterId;
    this.feedbacksList()
  }

  feedbacksList(){
    this.spinner.show();
    let obj: any = 'VoterId='+ this.voterId +'&nopage='+this.feedbacksPaginationNo;
    this.callAPIService.setHttp('get', 'Get_Electioncrm_1_0?' + obj, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.getFeedbacksList = res.data1;
        console.log(this.getFeedbacksList);
        this.getFeedbacksListTotal = res.data2[0].TotalCount;
      } else {
        this.getFeedbacksList = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  onSubmitFeedbackForm(){
    this.enterNewFeedbackForm = this.fb.group({
      Id:[],	
      VoterId:[],	
      FeedBackDate:	[],
      FeedBackType:	[],
      Description:[],	
      FollowupDate:[],
      CreatedBy:[],	
      NotToCall:[]
    })
  }


  doNotCall(event:any){
    console.log(event.target.checked)
  }
  onNoClick(text:any): void {
    this.dialogRef.close(text);
  }

  // default cal
}
