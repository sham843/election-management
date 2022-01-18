import { JSONParser } from '@amcharts/amcharts4/core';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CallAPIService } from 'src/app/services/call-api.service';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-agent-setting',
  templateUrl: './agent-setting.component.html',
  styleUrls: ['./agent-setting.component.css']
})
export class AgentSettingComponent implements OnInit {


  agentSettingForm!: FormGroup;
  selectAgentData = new FormControl('');
  agentSettingArray: any;
  allAgentList: any;
  allAgentListArray: any;
  IsCalllogTrackData: any;
  IsLacationTrackData: any;
  StrSettingArray: any[] = [];
  userId: any;
  SettingId: any;
  StrSettingArrayJSON: any;
  Flag: any;

  constructor(
    private spinner: NgxSpinnerService,
    private callAPIService: CallAPIService,
    private toastrService: ToastrService,
    private fb: FormBuilder,
    private commonService: CommonService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.getAllAgentList();
    this.getAgentSetting();
  }

  getAllAgentList() {
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_Client_AgentList_ddl?ClientId=' + 22 + '&UserId=' + this.commonService.loggedInUserId(), false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.allAgentListArray = res.data1;
      } else {
        this.allAgentListArray = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  getAgentSetting() {
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_Client_AgentSetting?UserId=' + this.commonService.loggedInUserId()
      + '&ClientId=' + 22, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.agentSettingArray = res.data1;
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

  onCheckisAlertData(event: any, obj: any) {
    event.target.checked == true ? this.IsCalllogTrackData = 1 : this.IsCalllogTrackData = 0;
    this.userId = obj.AgentId;
    this.SettingId = 1;
    this.Flag = this.IsCalllogTrackData;
    this.mergeCheckedData();
  }

  onCheckisAlertData1(event: any, obj: any) {
    event.target.checked == true ? this.IsLacationTrackData = 1 : this.IsLacationTrackData = 0;
    this.userId = obj.AgentId;
    this.SettingId = 2;
    this.Flag = this.IsLacationTrackData;
    this.mergeCheckedData();
  }

  mergeCheckedData() {
    let obj = { SettingId: this.SettingId, Flag: this.Flag , UserId: this.userId }
    this.StrSettingArray.push(obj);
  }

  onSubmitData() {
    this.spinner.show();
    this.StrSettingArrayJSON = JSON.stringify(this.StrSettingArray);
    let obj = '&CreatedBy=' + this.commonService.loggedInUserId() + '&StrSettingFlag=' + this.StrSettingArrayJSON
    this.callAPIService.setHttp('get', 'Sp_Web_Insert_Agent_Setting?ClientId=' + 22 + obj, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.toastrService.success(res.data1[0].Msg);
        this.StrSettingArray = [];
        this.getAgentSetting();
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

}
