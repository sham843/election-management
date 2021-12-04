import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CallAPIService } from 'src/app/services/call-api.service';
import { CommonService } from 'src/app/services/common.service';


@Component({
  selector: 'app-voters-profile',
  templateUrl: './voters-profile.component.html',
  styleUrls: ['./voters-profile.component.css']
})
export class VotersProfileComponent implements OnInit {
  voterProfileData: any;
  voterListData: any;

  constructor(
    private spinner: NgxSpinnerService,
    private callAPIService: CallAPIService,
    private toastrService: ToastrService,
    private fb: FormBuilder,
    private commonService: CommonService,
    private router: Router,
    private route: ActivatedRoute,
  ) { 
     let getsessionStorageData: any = sessionStorage.getItem('voter-profile');
     let getStorageData= JSON.parse(getsessionStorageData); 
     this.voterListData = {'AgentId': getStorageData.AgentId ,'ClientID': getStorageData.ClientID, 'VoterId': getStorageData.VoterId}
}

  ngOnInit(): void {
    this.getVoterProfileData();
  }
                                // Get Voter Profile Data.....................
  getVoterProfileData() {
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_Get_Voter_Profile?ClientId=' + this.voterListData.ClientID + '&AgentId='+ this.voterListData.AgentId + '&VoterId='+ this.voterListData.VoterId , false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.voterProfileData = res.data1[0];
      } else {
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  ngOnDestroy() {
    sessionStorage.removeItem('voter-profile');
  }

}
