import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CallAPIService } from '../services/call-api.service';
import { CommonService } from '../services/common.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(private callAPIService: CallAPIService, private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private toastrService: ToastrService, private router: Router,
    private route: ActivatedRoute, private commonService: CommonService) { }

  ngOnInit(): void {
    let jsonObj: any = {"data":"0","data1": [{"Id":1,"FullName":"Sunil Ramesh Chavan","MobileNo":"5123456789","Address":"test user","StateId":1,"DistrictId":8,"TalukaId":0,"VillageId":481,"ReferenceName":null,"ContactNo":null,"DesignationId":0,"DesignationName":"","ProfilePhoto":"http://ncpserviceweb.eanifarm.com//Images/ProfilePhoto/12102021121304095PM_1_images(3).jpg","FName":"Sunil","MName":"Ramesh","LName":"Chavan","IsRural":0,"ConstituencyNo":0,"Gender":1,"Username":"election","UserTypeId":1,"SubUserTypeId":1,"LoginType":1,"CommiteeId":0,"CommiteeName":null,"CommitteeLevelId":null}] ,"data2": [{"PageId":1,"PageType":1,"PageURL":"my-profile","pageName":"My Profile","PageGroup":"My Profile","PageIcon":"\u003ci class=\"fas fa-user-cog\"\u003e\u003c/i\u003e"},{"PageId":2,"PageType":2,"PageURL":"election-dashboard","pageName":"Election Dashboard","PageGroup":"Election Management","PageIcon":"\u003ci class=\"fas fa-vote-yea\"\u003e\u003c/i\u003e"},{"PageId":3,"PageType":2,"PageURL":"create-elections","pageName":"Create Elections","PageGroup":"Election Management","PageIcon":"\u003ci class=\"fas fa-vote-yea\"\u003e\u003c/i\u003e"},{"PageId":4,"PageType":2,"PageURL":"create-constituency","pageName":"Create Consituency","PageGroup":"Election Management","PageIcon":""},{"PageId":5,"PageType":2,"PageURL":"assign-booth-to-constituency","pageName":"Assign Booth to Consituency","PageGroup":"Election Management","PageIcon":""},{"PageId":6,"PageType":2,"PageURL":"create-regional-leader","pageName":"Create Regional Leader","PageGroup":"Election Management","PageIcon":""},{"PageId":7,"PageType":2,"PageURL":"assign-elections-to-regional-leader","pageName":"Assign Elections to Regional Leader","PageGroup":"Election Management","PageIcon":""},{"PageId":8,"PageType":2,"PageURL":"candidate-registration","pageName":"Candidate Registration","PageGroup":"Election Management","PageIcon":""},{"PageId":9,"PageType":3,"PageURL":"booth-dashboard","pageName":"Regional Leader Dashboard","PageGroup":"Booth Management","PageIcon":"\u003ci class=\"fas fa-people-arrows\"\u003e\u003c/i\u003e"},{"PageId":10,"PageType":3,"PageURL":"assign-agents-to-booth","pageName":"Assing Agents to Booths","PageGroup":"Booth Management","PageIcon":"\u003ci class=\"fas fa-user-shield\"\u003e\u003c/i\u003e"},{"PageId":11,"PageType":3,"PageURL":"view-boothwise-voters-list","pageName":"View Boothwise Voters List","PageGroup":"Booth Management","PageIcon":""},{"PageId":12,"PageType":3,"PageURL":"assign-candidate-to-constituency","pageName":"Assign Candidate to Constituency","PageGroup":"Booth Management","PageIcon":null},{"PageId":13,"PageType":3,"PageURL":"agents-activity","pageName":"Agent Activity","PageGroup":"Booth Management","PageIcon":null},{"PageId":14,"PageType":3,"PageURL":"booth-analytics","pageName":"Booth Analytics","PageGroup":"Booth Management","PageIcon":null}] }
    sessionStorage.setItem('loggedInDetails', JSON.stringify(jsonObj));
    this.router.navigate(['../' + this.commonService.redirectToDashborad()], { relativeTo: this.route });
  }

}

