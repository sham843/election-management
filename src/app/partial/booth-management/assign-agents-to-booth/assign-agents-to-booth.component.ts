import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CallAPIService } from 'src/app/services/call-api.service';
import { CommonService } from 'src/app/services/common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DeleteComponent } from '../../dialogs/delete/delete.component';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { any } from '@amcharts/amcharts4/.internal/core/utils/Array';

@Component({
  selector: 'app-assign-agents-to-booth',
  templateUrl: './assign-agents-to-booth.component.html',
  styleUrls: ['./assign-agents-to-booth.component.css'],
  animations: [
    trigger('keyfieldExpanded', [
        state('collapsed', style({height: '0px', minHeight: '0'})),
        state('expanded', style({height: '*'})),
        transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
],
})
export class AssignAgentsToBoothComponent implements OnInit {

  assAgentToBoothForm!: FormGroup;
  assignAgentForm!: FormGroup;
  submitted = false;
  aAsubmitted = false;
  paginationNo: number = 1;
  pageSize: number = 10;
  total: any;
  btnText = 'Add Agent';
  filterForm!: FormGroup;
  subject: Subject<any> = new Subject();
  searchFilter = "";
  HighlightRow: any;
  electionNameArray: any;
  clientNameArray: any;
  constituencyNameArray: any;
  AssemblyNameArray: any = [];
  BoothSubeleNonSubEleArray: any;
  insertBoothAgentArray: any;
  globalClientId: any;
  clientAgentWithBoothArray: any = [];
  index: any;
  searchboothList = '';
  AssemblyBoothArray: any = [];
  getAllClientAgentList: any;
  clientAgentListFlag: boolean = false;
  ClientAgentListddl: any;
  constituencyData = '';
  userId: any;
  ClientId: any;
  assBoothObjData: any;
  checkAssemblyArray: any = [];
  boothDivHide: boolean = false;
  boothListMergeArray: any = [];
  searchAssembly = '';
  assemblyArray: any = [];
  assemblyCheckBoxCheck!: boolean;
  AssemblyId: any;
  assemblyIdArray: any = [];
  boothListArray: any;
  selBoothId: any;
  assemblyBoothJSON: any;
  ConstituencyId: any;
  ConstituencyIdArray: any = [];
  globalEditObj: any;
  modalTextChange :any;
  agentBlogStatus :any
  agentwiseAssigBoothArray: any = [];
  agentwiseAssigBoothHide : boolean = false;
  defaultAgentDataFlag : boolean = false;
  disabledNoOfCasesDiv : boolean = false;

  globalHeaderId:any;
  getMobileNoOnSelAgent:any;

  filterElectionNameArray:any; 
  filterconstituencyNameArray:any; 
  filterAssemblyArray:any; 
  filterclientWiseBoothListArray:any; 
  filterAssembleListArray:any; 

  loginPages:any[] = [];
  filterClientNameArray:any;
  agentModalFlag:boolean = false;
  // paginationNo :number = 1;
  assemblyId:any;
  checkLoginClientId:any;
  onClickBoothId:any;
  boothAssignAgentMergedArray:any;
  agentwiseAssBoothArray:any;

  @ViewChild('openAssignAgentToBooths') openAssignAgentToBooths: any;
  @ViewChild('closeAddAgentModal') closeAddAgentModal: any;
  @ViewChild('closeAssignAgent') closeAssignAgent: any;

  constructor(
    private spinner: NgxSpinnerService,
    private callAPIService: CallAPIService,
    private toastrService: ToastrService,
    private fb: FormBuilder,
    private commonService: CommonService,
    private router: Router,
    private route: ActivatedRoute,
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.checkLoginClientId = this.commonService.getlocalStorageData().ClientId
    this.agentToBoothForm();
    this.agentForm();
    this.defaultFilterForm();
    this.searchFilters('false');
    this.getClientName();
    this.filterClientName();
    this.filterClientHaveSubEleOrNonSubEle();
  
    
  }

  agentToBoothForm() {
    this.assAgentToBoothForm = this.fb.group({
      Id:[0],
      ClientId: ['', [Validators.required]],
      UserId: ['', [Validators.required]],
      ElectionId: ['', [Validators.required]],
      ConstituencyId: ['', [Validators.required]],
      AssemblyId: [''],
      boothId: [''],
      CreatedBy:[this.commonService.loggedInUserId()]
    })
  }

  get a() { return this.assAgentToBoothForm.controls };

  resetAssignAgentForm() {
  
  }


  getClientName() {
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_Get_Client_ddl?UserId=' + this.commonService.loggedInUserId(), false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.clientNameArray = res.data1;
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  Client_AgentList() {//Client_AgentList
    this.spinner.show();
    let data = this.assAgentToBoothForm.value;
    this.callAPIService.setHttp('get', 'Web_Client_AgentList?ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId(), false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.getAllClientAgentList = res.data1;
      } else {
        this.getAllClientAgentList = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  getAgentwiseAssignedBooth() {//getAgentwiseAssigBooth
    this.spinner.show();
    this.nullishFilterForm();
    let data = this.assAgentToBoothForm.value;
    this.callAPIService.setHttp('get', 'Web_get_Agentwise_AssignedBooth?AgentId=' + data.UserId + '&ClientId=' + data.ClientId, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
      } else {
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  sepEleByBoothId(data:any){

  }



  getClientAgentList() {
    this.callAPIService.setHttp('get', 'Web_Client_AgentList_ddl?ClientId=' + this.globalClientId + '&UserId=' + this.commonService.loggedInUserId(), false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.ClientAgentListddl = res.data1;
      } else {
        this.ClientAgentListddl = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  getElectionName() {
    this.callAPIService.setHttp('get', 'Web_Get_Election_byClientId_ddl?ClientId=' + this.assAgentToBoothForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId(), false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.electionNameArray = res.data1;
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

  getConstituencyName() {
    this.spinner.show();
    this.nullishFilterForm();
    this.callAPIService.setHttp('get', 'Web_Get_Constituency_byClientId_ddl?ClientId=' + this.assAgentToBoothForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + this.assAgentToBoothForm.value.ElectionId, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.constituencyNameArray = res.data1;
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


  getAssemblyName() {
    this.spinner.show();
    let data = this.assAgentToBoothForm.value; 
    this.callAPIService.setHttp('get', 'Web_Get_Assembly_byClientId_ddl?ClientId=' + data.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + data.ElectionId
      + '&ConstituencyId=' + data.ConstituencyId, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.assemblyArray = res.data1;
      } else {
        this.assemblyArray = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }
 
  getIsSubElectionApplicable() {
    let eleIsSubElectionApplicable: any;
    this.electionNameArray.filter((ele: any) => {
      if (ele.ElectionId == this.assAgentToBoothForm.value.ElectionId) {
        eleIsSubElectionApplicable = ele.IsSubElectionApplicable
      };
    })
    return eleIsSubElectionApplicable;
  }

  onCheckChangeAssembly(event: any, assemblyId: any) {
    if (event.target.checked){
      this.assemblyIdArray.push(assemblyId);
      this.getBoothsByAssembleId(assemblyId);
    }else{
      this.boothListMergeArray = this.boothListMergeArray.filter((ele: any) => {
        if (ele.AssemblyId !== assemblyId) {
          return ele;
        }
      });
      let uncheckAssemblyBoothArrayckAs = this.AssemblyBoothArray.filter((ele: any) => {
        if (ele.AssemblyId !== assemblyId) {
          return ele;
        }
      });
      this.checkBoxCehckBoothArray(this.AssemblyBoothArray = uncheckAssemblyBoothArrayckAs);
    }
  }

  onCheckChangeBooths(event: any, BoothId: any, ConstituencyId: any, AssemblyId: any, ElectionId: any) {
    if (event.target.checked == false) {
      let index = this.AssemblyBoothArray.map((x: any) => { return x.BoothId; }).indexOf(BoothId);
      this.AssemblyBoothArray.splice(index, 1);
    }
    else {
      this.AssemblyBoothArray.push({'BoothId':BoothId,"ConstituencyId":ConstituencyId,'AssemblyId':AssemblyId,'ElectionId':ElectionId});
    }
  }
  

  getBoothsByAssembleId(assembleId:any) {
    this.spinner.show();
    let data = this.assAgentToBoothForm.value;
    let url;
    this.getIsSubElectionApplicable() == 1 ? url = 'Web_Get_Booths_by_Subelection_ddl_1_0?' : url = 'Web_Get_Booths_NonSubElection_ddl?';
    this.callAPIService.setHttp('get', url + 'ClientId=' + data.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + data.ElectionId
      + '&ConstituencyId=' + data.ConstituencyId + '&AssemblyId=' + assembleId, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.boothListArray = res.data1;
      } else {
        this.spinner.hide();
        this.boothListArray = [];
        //this.toastrService.error("Data is not available");
      }
    }, (error: any) => {
      if (error.status == 500) {
        this.spinner.hide();
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }



  onSubmitAssAgentToBoothForm(){
    this.aAsubmitted = true;
    let formData = this.assAgentToBoothForm.value;

    if (this.assAgentToBoothForm.invalid) {
      this.spinner.hide();
      return;
    }
    else if (this.AssemblyBoothArray.length == 0){
      this.toastrService.error("Assembly Or Booth is required");
      return;
    }
    else {
      debugger;
      this.spinner.hide();
      this.assemblyBoothJSON = JSON.stringify(this.AssemblyBoothArray.concat(this.agentwiseAssigBoothArray));
      let id;
      formData.Id == "" || formData.Id == null  || formData.Id == undefined ? id = 0 : id = formData.Id;
     // this.agentwiseAssigBoothArray.lenght != 0 ? id = this.globalHeaderId : '';

 
      let obj = 'Id='+  id + '&UserId=' + formData.UserId + '&ClientId=' + formData.ClientId
        + '&strAssmblyBoothId=' + this.assemblyBoothJSON + '&CreatedBy=' + this.commonService.loggedInUserId();

      // this.callAPIService.setHttp('get', 'Web_Insert_Election_AssignBoothToAgentHeader?Id=' + obj, false, false, false, 'electionServiceForWeb');
      this.callAPIService.setHttp('post', 'Web_Insert_Election_AssignBoothToAgentHeader_Post', false, obj, false, 'electionServiceForWeb');
      this.callAPIService.getHttp().subscribe((res: any) => {
        if (res.data == 0) {
          this.toastrService.success(res.data1[0].Msg);
        } else {
          this.spinner.hide();
          //this.toastrService.error("Data is not available");
        }
      }, (error: any) => {
        if (error.status == 500) {
          this.router.navigate(['../500'], { relativeTo: this.route });
        }
      })
    }
  }

  sendDownloadLink(mobileNo:any){
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Send_App_Download_link?mobileno=' + mobileNo, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.toastrService.success(res.data1);
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


  // ---------------------------------------------  filter's method's start here  --------------------------------------------- //

  filterData() {
    this.paginationNo = 1;
    this.filterClientHaveSubEleOrNonSubEle();
    this.resetAssignAgentForm();
  }

  clearFilter(flag: any) {
    if (flag == 'clientName') {
      this.defaultFilterForm();
      this.clientAgentWithBoothArray =[];
    } else if (flag == 'electionId') {
      this.filterForm.controls['ElectionId'].setValue(0);
      this.filterForm.controls['ConstituencyId'].setValue(0);
      this.filterForm.controls['AssemblyId'].setValue(0);
      this.filterForm.controls['BoothId'].setValue(0);
      this.clientAgentWithBoothArray =[];
    }else if (flag == 'Constituency') {
      this.filterForm.controls['ConstituencyId'].setValue(0);
      this.filterForm.controls['AssemblyId'].setValue(0);
      this.filterForm.controls['BoothId'].setValue(0);
      this.clientAgentWithBoothArray =[];
    } else if (flag == 'AssemblyId') {
      this.filterForm.controls['AssemblyId'].setValue(0);
      this.filterForm.controls['BoothId'].setValue(0);
      this.clientAgentWithBoothArray =[];
    } 
    else if (flag == 'BoothId') {
      this.filterForm.controls['BoothId'].setValue(0);
    } else if (flag == 'search') {
      this.filterForm.controls['Search'].setValue('');
    }
    this.paginationNo = 1;
    // this.filterClientHaveSubEleOrNonSubEle();
    // this.resetAssignAgentForm();
  }

  defaultFilterForm() {
  
    this.filterForm = this.fb.group({
      ClientId: [this.commonService.getlocalStorageData().ClientId],
      ElectionId: [0],
      ConstituencyId: [0],
      BoothId: [0],
      AssemblyId: [0],
      Search: [''],
    })
  }

  nullishTopFilterForm() {
    let fromData = this.filterForm.value;
    fromData.ElectionId ?? this.filterForm.controls['ElectionId'].setValue(0); 
    fromData.ConstituencyId ?? this.filterForm.controls['ConstituencyId'].setValue(0); 
    fromData.BoothId ?? this.filterForm.controls['BoothId'].setValue(0); 
    fromData.AssemblyId ?? this.filterForm.controls['AssemblyId'].setValue(0); 
    fromData.Search ?? this.filterForm.controls['Search'].setValue(''); 
  }
  
  onKeyUpFilter() {
    this.subject.next();
  }

  searchFilters(flag: any) {
    if (flag == 'true') {
      if (this.filterForm.value.Search == "" || this.filterForm.value.Search == null) {
        this.toastrService.error("Please search and try again");
        return
      }
    }
    this.subject.pipe(debounceTime(700)).subscribe(() => {
      this.searchFilter = this.filterForm.value.Search;
      this.paginationNo = 1;
      this.filterClientHaveSubEleOrNonSubEle();
    });
  }

  clearAggentToBooth(flag: any) {

  }

  nullishFilterForm() {
    let fromData = this.assAgentToBoothForm.value;
    fromData.ClientId ?? this.assAgentToBoothForm.controls['ClientId'].setValue(this.commonService.getlocalStorageData().ClientId); 
    fromData.UserId ?? this.assAgentToBoothForm.controls['UserId'].setValue(0); 
    fromData.ElectionId ?? this.assAgentToBoothForm.controls['ElectionId'].setValue(0); 
    fromData.ConstituencyId ?? this.assAgentToBoothForm.controls['ConstituencyId'].setValue(0); 
    fromData.AssemblyId ?? this.assAgentToBoothForm.controls['AssemblyId'].setValue(0); 
    fromData.boothId ?? this.assAgentToBoothForm.controls['boothId'].setValue(0); 
    fromData.CreatedBy ?? this.assAgentToBoothForm.controls['CreatedBy'].setValue(0); 
  }

  clearAssemblyBooth() {
    this.boothListMergeArray = [];
    this.assemblyArray = [];
  }


  filterClientName() {
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_Get_Client_ddl?UserId=' + this.commonService.loggedInUserId(), false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.filterClientNameArray = res.data1;

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


  fillterElectionName() {
    this.spinner.show();
    this.globalClientId = this.assAgentToBoothForm.value.ClientId;
    this.callAPIService.setHttp('get', 'Web_Get_Election_byClientId_ddl?ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId(), false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.filterElectionNameArray = res.data1;
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

  filterConstituencyName() {
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_Get_Constituency_byClientId_ddl?ClientId=' + this.filterForm.value.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + this.filterForm.value.ElectionId, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.filterconstituencyNameArray = res.data1;
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

  filterAssemblyName() {
    this.spinner.show();
    let data = this.filterForm.value; 
    this.callAPIService.setHttp('get', 'Web_Get_Assembly_byClientId_ddl?ClientId=' + data.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + data.ElectionId
      + '&ConstituencyId=' + data.ConstituencyId, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.filterAssemblyArray = res.data1;
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

  filterBoothsByAssembleId() {
    this.spinner.show();
    let data = this.filterForm.value;
    let url;
    this.FilterIsSubElectionApplicable() == 1 ? url = 'Web_Get_Booths_by_Subelection_ddl_1_0?' : url = 'Web_Get_Booths_NonSubElection_ddl?';
    this.callAPIService.setHttp('get', url + 'ClientId=' + data.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + data.ElectionId
      + '&ConstituencyId=' + data.ConstituencyId + '&AssemblyId=' + data.AssemblyId, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.filterAssembleListArray = res.data1;
        } else {
        this.filterAssembleListArray = [];
        this.spinner.hide();
        //this.toastrService.error("Data is not available");
      }
    }, (error: any) => {
      if (error.status == 500) {
        this.spinner.hide();
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  ClientWiseBoothList() {
    let fromData = this.filterForm.value;
    let obj = 'ClientId=' + fromData.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + fromData.ElectionId + '&ConstituencyId=' + fromData.ConstituencyId
      + '&AssemblyId=' + fromData.AssemblyId + '&IsSubElectionApplicable=' + this.AssemblyId + '&VillageId=' + 0
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_Get_Clientwise_BoothList?' + obj, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.filterclientWiseBoothListArray = res.data1;
       } else {
        this.filterclientWiseBoothListArray = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  

  FilterIsSubElectionApplicable(){
    let eleIsSubElectionApplicable: any;
    this.filterElectionNameArray.filter((ele: any) => {
      if (ele.ElectionId == this.filterForm.value.ElectionId) {
        eleIsSubElectionApplicable = ele.IsSubElectionApplicable
      };
    })
    return eleIsSubElectionApplicable;
  }


  filterClientHaveSubEleOrNonSubEle(){
    this.spinner.show();
    this.nullishTopFilterForm();
    let data = this.filterForm.value;
    let url;
    this.FilterIsSubElectionApplicable() == 1 ? url = 'Web_Client_AgentWithBooths_1_0?' : url = 'Web_Client_AgentWithBooths_1_0_NoSubEle?';
    this.callAPIService.setHttp('get', url + 'ClientId=' + data.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&ElectionId=' + data.ElectionId
      + '&ConstituencyId=' + data.ConstituencyId + '&AssemblyId=' + data.AssemblyId+ '&BoothId=' + data.BoothId + '&Search=' + data.Search+ '&nopage=' + this.paginationNo, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.clientAgentWithBoothArray = res.data1;
        this.total = res.data2[0].TotalCount;

      } else {
        this.clientAgentWithBoothArray = [];
        this.spinner.hide();
        //this.toastrService.error("Data is not available");
      }
    }, (error: any) => {
      if (error.status == 500) {
        this.spinner.hide();
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }


  // ---------------------------------------------  filter's method's end here  --------------------------------------------- //

  // ------------------------------------------  add agent method's start here -------------------------------------------- //

  agentForm() {
    this.assignAgentForm = this.fb.group({
      Id: [0],
      ClientId: [''],
      FullName: [''],
      FName: ['',Validators.compose([Validators.required ,Validators.pattern(/^\S*$/),this.commonService.onlyEnglish])],
      MName: ['',Validators.compose([Validators.pattern(/^\S*$/),this.commonService.onlyEnglish])],
      LName: ['',Validators.compose([Validators.required ,Validators.pattern(/^\S*$/),this.commonService.onlyEnglish])],
      Address: ['',],
      // Validators.pattern(/^(\s+\S+\s*)*(?!\s).*$/)
      MobileNo: ['', [Validators.required, Validators.pattern("^((\\+91-?)|0)?[0-9]{10}$")]],
      IsMemberAddAllow: [''],
      CreatedBy: ['']
    })
  }

  get f() { return this.assignAgentForm.controls };

  clearAggentForm() {
    this.submitted = false;
    this.btnText = 'Add agent';
    this.agentForm();
  }

  // ------------------------------------------  add agent method's end here -------------------------------------------- //

  //------------------------------------------   pagination start here  -------------------------------------------- //

  onClickPagintion(pageNo: number) {
    this.clearAssemblyBooth();
    this.agentToBoothForm();
    this.paginationNo = pageNo;
    this.filterClientHaveSubEleOrNonSubEle();
  }

  //------------------------------------------ edit Assign Booth Election form   ------------------------------------------  //
  patchAssBoothElection(HeaderId: any, flag:any) {
    this.clearAssemblyBooth();
    this.defaultAgentDataFlag = true;
    this.btnText = 'Update agent';
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_Election_GetBoothToAgentDetails?HeaderId=' + HeaderId, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        // res.data1[0].BoothId = this.assemblyId.toString();
       } else {
        this.spinner.hide();
        //this.toastrService.error("Data is not available");
      }
    }, (error: any) => {
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  editAssignBoothsPatchValue(objData: any, flag:any) {
    debugger;
    this.agentwiseAssigBoothHide = true;
    this.globalEditObj = objData;
    this.assAgentToBoothForm.patchValue({
      Id: objData.HeaderId,

    });
    flag  != 'Add agent with Booths' ?  (this.getClientName(), this.btnText = 'Update agent'): this.getElectionName();
    let Assembly:any;
    typeof(objData.Assembly) == "number" ?  Assembly = objData.Assembly.toString() : Assembly = objData.Assembly;
    let checkAssemblyComma =   Assembly.includes(",");
    checkAssemblyComma == true ? this.ConstituencyIdArray = Assembly.split(',') : this.ConstituencyIdArray = Assembly.split(' ');
   
    let checkBooth:any;
    typeof(objData.BoothId) == "number" ?  checkBooth = objData.BoothId.toString() : checkBooth = objData.BoothId;
    let checkBoothComma = checkBooth.includes(",");
    checkBoothComma == true ? this.AssemblyBoothArray = checkBooth.split(',') : this.AssemblyBoothArray = checkBooth.split(' ');
  }

  checkBoxCehckAssemblyArray(ConstituencyId: any) {
    for (let i = 0; i < ConstituencyId.length; i++) {
      for (let j = 0; j <this.assemblyArray.length; j++) {
        if (this.assemblyArray[j].Id == Number(ConstituencyId[i])) {
          this.assemblyArray[j].checked = true;
          this.getBoothsByAssembleId(Number(ConstituencyId[i]));
        }
      }
    }
  }

  checkBoxCehckBoothArray(ConstituencyId: any) {
    for (let i = 0; i < ConstituencyId.length; i++) {
      for (let j = 0; j < this.boothListArray.length; j++) {
        if (this.boothListArray[j].BoothId == ConstituencyId[i].BoothId) {
          this.boothListArray[j].checked = true;
        }
      }
    }
  }
  //------------------------------------------ edit Assign Booth Election form   ------------------------------------------  //

  //------------------------------------------   assign booth list modal start here  -------------------------------------------- //
  assignedBoothModel(assBoothObj: any) {
    this.assBoothObjData = assBoothObj;
  }

  addAgent() {
    this.submitted = true;
    if (this.assignAgentForm.invalid) {
      this.spinner.hide();
      return;
    }
    else {
      this.spinner.show();
      let data = this.assignAgentForm.value;
      data.IsMemberAddAllow == true ? data.IsMemberAddAllow = 1 : data.IsMemberAddAllow = 0 //only assign true = 1 & false = 0
      let FullName = data.FName + " " + data.MName + " " + data.LName;
      data.FullName = FullName;
      this.globalClientId = this.assAgentToBoothForm.value.ClientId;
      let obj = data.Id + '&FullName=' + data.FullName + '&MobileNo=' + data.MobileNo
        + '&FName=' + data.FName + '&MName=' + data.MName + '&LName=' + data.LName + '&Address=' + data.Address
        + '&IsMemberAddAllow=' + data.IsMemberAddAllow + '&ClientId=' + this.filterForm.value.ClientId + '&CreatedBy=' + this.commonService.loggedInUserId()
      this.callAPIService.setHttp('get', 'Web_Client_InsertBoothAgent?Id=' + obj, false, false, false, 'electionServiceForWeb');
      this.callAPIService.getHttp().subscribe((res: any) => {
        if (res.data == 0) {
          this.clientAgentListFlag = true;
          this.spinner.hide();
          this.toastrService.success(res.data1[0].Msg);
          // this.agentModalFlag = true;
          this.openAssignAgentToBooth();
          this.Client_AgentList();
          // this.getClientAgentList();
          this.resetAgentForm();
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

  openAssignAgentToBooth(){
    if(this.agentModalFlag){
      let closeAddAgentModal = this.closeAddAgentModal.nativeElement;
      closeAddAgentModal.click();
      let el: any = this.openAssignAgentToBooths.nativeElement;
      el.click();
    }
  }
  editAgent(data:any){
    this.btnText = 'Update Agent';
    this.assignAgentForm.patchValue({
      Id: data.UserId,
      FName: data.FName,
      MName: data.MName,
      LName: data.LName,
      Address: data.Address,
      MobileNo: data.MobileNo,
      IsMemberAddAllow: data.IsMemberAddAllow,
      CreatedBy: this.commonService.loggedInUserId()
    })
  }

  resetAgentForm(){
      this.agentForm();
      this.btnText = 'Add Agent';
      this.submitted = false;
  }
  //------------------------------------------   assign booth list modal end here  -------------------------------------------- //

  blockUser(userId:any,ClientId:any, blogStatus:any){
    let checkBlogStatus :any;
    blogStatus == 0  ? checkBlogStatus = 1 : checkBlogStatus = 0;
    
    this.spinner.show();
    let data = this.assAgentToBoothForm.value;
    this.callAPIService.setHttp('get', 'Web_Insert_Election_BlockBoothAgent?UserId='+userId+'&ClientId='+ClientId + '&CreatedBy=' + this.commonService.loggedInUserId()+'&IsBlock='+checkBlogStatus, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.toastrService.success(res.data1[0].Msg);
        this.filterClientHaveSubEleOrNonSubEle();
        this.Client_AgentList();
        this.spinner.hide();
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


  showAssignBoots(){


  }

  assignAgentToBooth(data:any){
    this.btnText = 'Update agent'
    this.assemblyId = data.Assembly;
    this.onClickBoothId = data.BoothId; 
    this.editAssignBoothsPatchValue(data, false);
  }
}

