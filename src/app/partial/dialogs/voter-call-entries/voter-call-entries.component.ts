import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CallAPIService } from 'src/app/services/call-api.service';
import { CommonService } from 'src/app/services/common.service';
import { DatePipe } from '@angular/common';
import { DateTimeAdapter } from 'ng-pick-datetime';

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
  
  feedbackTypeArray = [{id:1, name:'Positive'},{id:2, name:'Negitive'},{id:3, name:'Neutral'}]
  enterNewFeedbackForm!:FormGroup;
  submitted:boolean = false;


  constructor(
    public dialogRef: MatDialogRef<VoterCallEntriesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private spinner: NgxSpinnerService,
    private callAPIService: CallAPIService,
    private router: Router,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private fb:FormBuilder,
    private commonService: CommonService,
    public dateTimeAdapter: DateTimeAdapter<any>,
    private datePipe: DatePipe,
    ) { dateTimeAdapter.setLocale('en-IN') }

  ngOnInit(): void {
    this.voterId = this.data.voterId;
    this.defaultFeedbackForm();
    this.feedbacksList();
  }

  defaultFeedbackForm(){
    this.enterNewFeedbackForm = this.fb.group({
      Id:[''],	
      VoterId:[''],	
      FeedBackDate:	[''],
      FeedBackType:	[''],
      Description:[''],	
      FollowupDate:[''],
      CreatedBy:[this.commonService.loggedInUserId()],	
      NotToCall:['']
    })
  }

  get f() { return this.enterNewFeedbackForm.controls };

  feedbacksList(){
    this.spinner.show();
    let obj: any = 'VoterId='+ this.voterId +'&nopage='+this.feedbacksPaginationNo;
    this.callAPIService.setHttp('get', 'Get_Electioncrm_1_0?' + obj, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.getFeedbacksList = res.data1;
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

  // doNotCall(event:any){
  //   console.log(event.target.checked)
  // }
  onNoClick(text:any): void {
    this.dialogRef.close(text);
  }

  clearForm(){
    this.defaultFeedbackForm();
    this.submitted = false;
  }

  onSubmitFeedbackForm(){
    console.log(this.enterNewFeedbackForm.value)
  }

  voterDateRangeSelect(asd:any){

  }
  
}
