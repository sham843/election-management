import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { CallAPIService } from 'src/app/services/call-api.service';
import { CommonService } from 'src/app/services/common.service';

import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_kelly from "@amcharts/amcharts4/themes/kelly";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import { debounceTime } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { DatePipe } from '@angular/common';
import { DateTimeAdapter } from 'ng-pick-datetime';

@Component({
  selector: 'app-agents-activity',
  templateUrl: './agents-activity.component.html',
  styleUrls: ['./agents-activity.component.css'],
})
export class AgentsActivityComponent implements OnInit, OnDestroy {
  agentProfileCardData: any;
  agentProfileData: any;
  allAgentLists: any;
  allSubAgentsByAgentId: any;
  filterForm!: FormGroup;
  voterProfilefilterForm!: FormGroup;
  piChartArray = [];
  clientBoothAgentVoterList: any;

  votersPaginationNo = 1;
  votersPageSize: number = 10;
  votersTotal: any;
  selBothIdObj: any;
  votersCardData: any;
  cardActiveClass: boolean = true;
  subject: Subject<any> = new Subject();
  agentInfo: any;

  clientBoothAgentFamiliyList: any;
  familyPaginationNo = 1;
  familyPageSize: number = 10;
  familyTotal: any;
  boothFamilyDetailsArray: any;
  getAgentByBoothsData: any;
  agentAssBoothActivityGraphData: any;
  subAreaAgantDisabledFlag: boolean = true;

  getnewVotersList: any;
  newVotersPaginationNo = 1;
  newVotersPageSize: number = 10;
  newVotersTotal: any;
  defaultCalenderIconFlag: boolean = false;

  searchVoters = new FormControl('');
  searchNewVoters = new FormControl('');
  searchFamilyVoters = new FormControl('');
  searchAgentCallLogger = new FormControl('');

  allowClearBoothIdFlag: boolean = true;
  allowClearSubAgentsFlag: boolean = true;
  allowClearAgentFlag: boolean = true;

  maxDate: any = new Date();
  subAreaAgentIdDisabledFlag: boolean = true;
  SubAreaAgent: any = '';

  selectSubAreaAgentId: any = '';
  clientNameArray: any
  clientDropDownDis: boolean = true;
  clientDropDownCloseIcon: boolean = false;

  getCallLoggerList:any;
  callLoggerPaginationNo = 1;
  callLoggerPageSize: number = 10;
  getCallLoggerTotal: any;

  lat: any = 19.75117687556874;
  lng: any = 75.71630325927731;
  zoom: any = 6;
  previous:any;
  
  boothAgentTrackingList:any;
  boothAgentAppUseTrackRes:any;

  appUsesActivityPaginationNo = 1;
  appUsesActivityPageSize: number = 10;
  appUsesActivityTotal:any;
  
  defaultAgentActivityDivHide: boolean = false;
  agentCAllLogFlag:boolean = true;

  constructor(private spinner: NgxSpinnerService, private callAPIService: CallAPIService, private fb: FormBuilder, public dateTimeAdapter: DateTimeAdapter<any>, private datePipe: DatePipe, private commonService: CommonService, private router: Router, private route: ActivatedRoute, private toastrService: ToastrService) {
    { dateTimeAdapter.setLocale('en-IN') }


  }

  ngOnInit(): void {
    let ReceiveDataSnapshot = this.route.snapshot.params.Data;
    if(ReceiveDataSnapshot){
      this.agentInfo = this.commonService.decrypt(ReceiveDataSnapshot);
      this.agentInfo  = JSON.parse(this.agentInfo);
    }
    this.commonService.getlocalStorageData().IsTrackAgetCallLogger == 1 ?  this.agentCAllLogFlag = true :  this.agentCAllLogFlag = false
// agentCAllLogFlag
    // this.agentInfo = sessionStorage.getItem('agents-activity');
    // this.agentInfo = JSON.parse(this.agentInfo);

    this.deafultVoterProfilefilterForm();
    this.topFilterForm();
    this.getClientName();
    this.searchVoterFilter('false');
    this.searchNewVotersFilters('false');
    this.searchAgentCallLoggerFilters('false');
  }

  //--------------------------------------------------  top filter method's start  here -----------------------------------------------------------//

  topFilterForm() {
    this.filterForm = this.fb.group({
      AgentId: [0],
      ClientId: [0],
      BoothId: [0],
      AssemblyId: [0],
      subAreaAgentId: [0],

    });
    if (this.agentInfo) { // If data is find on session set deafult value
      if (this.agentInfo.SubUserTypeId == 3) {
        this.filterForm.controls['AgentId'].setValue(this.agentInfo.BoothAgentId);
        this.filterForm.controls['ClientId'].setValue(this.agentInfo.ClientId);
      } else {
        this.filterForm.controls['AgentId'].setValue(this.agentInfo.Addedby)
        this.filterForm.controls['ClientId'].setValue(this.agentInfo.ClientId)
        this.filterForm.controls['subAreaAgentId'].setValue(this.agentInfo.BoothAgentId);
      }
    } 
    // else {
    //   let localStorageAgenData = this.commonService.getlocalStorageData();
    //   this.filterForm.controls['AgentId'].setValue(localStorageAgenData.Id)
    //   this.filterForm.controls['ClientId'].setValue(localStorageAgenData.ClientId)
    //   this.filterForm.controls['subAreaAgentId'].setValue(0);
    // }
    this.getAgentProfileData();
  }

  get filterFormControls() { return this.filterForm.controls };

  getClientName() {
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_Get_Client_ddl?UserId=' + this.commonService.loggedInUserId(), false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.clientNameArray = res.data1;

        if (this.clientNameArray.length == 1) {
          this.filterForm.controls['ClientId'].setValue(this.clientNameArray[0].id); // Id men's agent Id
          this. getAllAgentList();
        }

        if (this.commonService.loggedInSubUserTypeId() == 1) {
          this.clientDropDownDis = false;
          this.clientDropDownCloseIcon = true;
        }
        else {
          this.clientDropDownDis = true;
          this.clientDropDownCloseIcon = false;
        }
        this.getAllAgentList();
        //this.clientNameArray.length == 1 ? (this.filterForm.patchValue({ ClientId: this.clientNameArray[0].id }), this.getAllAgentList(), this.clientIdFlag = false) : '';
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

  getAllAgentList() {
    this.spinner.show();
    let formData = this.filterForm.value;
    this.nullishTopFilterForm();
    this.callAPIService.setHttp('get', 'Web_Client_AgentList_ddl?ClientId=' + formData.ClientId + '&UserId=' + this.commonService.loggedInUserId(), false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.allAgentLists = res.data1;
        // if agent is find then default select agent 
        this.allAgentLists.forEach((element: any) => {
          if (element.AgentId == formData.AgentId) {
            this.filterForm.controls['AgentId'].setValue(element.AgentId);
          }
        });
        // if(this.agentInfo){
        //   this.agentInfo.SubUserTypeId == 3 ? this.getAgentByBooths() : this.areaSubAgentByAgentId();
        // }
        this.areaSubAgentByAgentId();
      } else {
        this.allAgentLists = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  areaSubAgentByAgentId() {
    this.spinner.show();
    let formData = this.filterForm.value;
    this.nullishTopFilterForm();
    let obj: any = 'ClientId=' + formData.ClientId + '&UserId=' + this.commonService.loggedInUserId() + '&BoothAgentId=' + formData.AgentId;
    this.callAPIService.setHttp('get', 'Web_Client_Area_AgentList_ddl?' + obj, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.allSubAgentsByAgentId = res.data1;
        // if agent is find sub agent info
        if (this.allSubAgentsByAgentId.length == 1) {
          this.filterForm.controls['subAreaAgentId'].setValue(this.allSubAgentsByAgentId[0].Id); // Id men's agent Id
          this.boothAgentTracking();
        } else {
          this.filterForm.controls['subAreaAgentId'].setValue(0);
        }
        this.getAgentProfileData();
        this.getAgentByBooths();

      } else {
        this.filterForm.controls['subAreaAgentId'].setValue(0)
        this.allSubAgentsByAgentId = [];
        this.getAgentByBooths();
        this.getAgentProfileData();
        this.boothAgentTracking();
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  getAgentByBooths() {
    this.spinner.show();
    let formData = this.filterForm.value;
    this.nullishTopFilterForm();
    let obj: any = 'ClientId=' + formData.ClientId + '&AgentId=' + this.getReturnAgentIdOrAreaAgentId();
    this.callAPIService.setHttp('get', 'Web_Client_AgentWithAssignedBoothsList?' + obj, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.boothAgentTracking();
        this.spinner.hide();
        this.getAgentByBoothsData = res.data1;

        // if sub agent is find show all booths
        if (this.getAgentByBoothsData.length == 1) {
          this.filterForm.controls['BoothId'].setValue(this.getAgentByBoothsData[0].BoothId); // Id men's agent Id
          this.defaultAgentActivityDivHide = true;
          this.getAgentProfileData();
        }
        this.spinner.hide();
        this.getAgentAssBoothActivityGraph();
      } else {
        this.boothAgentTracking();
        this.getAgentByBoothsData = [];
        this.getAgentAssBoothActivityGraph();
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  selBoothByAgent() {
    this.getAgentByBoothsData.filter((ele: any) => {
      if (this.filterForm.value.BoothId == ele.BoothId) {
        this.filterForm.controls['AssemblyId'].setValue(ele.AssemblyId)
        this.getAgentAssBoothActivityGraph();
      }
    })
  }

  clearTopFilter(flag: any) {
    if (flag == 'clientId') {
      sessionStorage.removeItem('agents-activity');
      this.filterForm.controls["ClientId"].setValue(0);
      this.filterForm.controls["subAreaAgentId"].setValue(0);
      this.filterForm.controls["BoothId"].setValue(0);
      this.filterForm.controls["AgentId"].setValue(0);
    } else if (flag == 'Agent') {
      sessionStorage.removeItem('agents-activity');
      this.filterForm.controls["subAreaAgentId"].setValue(0);
      this.filterForm.controls["BoothId"].setValue(0);
      this.filterForm.controls["AgentId"].setValue(0);
      this.defaultAgentActivityDivHide = false;
    } else if (flag == 'subAgent') {
      this.filterForm.controls["subAreaAgentId"].setValue(0);
      this.filterForm.controls["BoothId"].setValue(0);
    }
    this.getAgentAssBoothActivityGraph();
  }

  nullishTopFilterForm() {
    let fromData = this.filterForm.value;
    fromData.AgentId ?? this.filterForm.controls['AgentId'].setValue(this.commonService.getlocalStorageData().ClientId); 
    fromData.ClientId ?? this.filterForm.controls['ClientId'].setValue(0); 
    fromData.ClientId ?? this.filterForm.controls['ClientId'].setValue(0); 
    fromData.AssemblyId ?? this.filterForm.controls['AssemblyId'].setValue(0); 
    fromData.subAreaAgentId ?? this.filterForm.controls['subAreaAgentId'].setValue(0); 
  }

  //--------------------------------------------------  top filter method's End  here -----------------------------------------------------------//

  //--------------------------------------------------   global page method's call here   -------------------------------------------------------//

  getReturnAgentIdOrAreaAgentId() {
    let fromData = this.filterForm.value;
    let agentId: any;
    fromData.subAreaAgentId == 0 || fromData.subAreaAgentId == null || fromData.subAreaAgentId == undefined || fromData.subAreaAgentId == 3 ? agentId = fromData.AgentId : agentId = fromData.subAreaAgentId;
    return agentId
  }

  checkSubAreaAgentId() {
    let fromData = this.filterForm.value;
    if (fromData.subAreaAgentId == "" || fromData.subAreaAgentId == null || fromData.subAreaAgentId == undefined || fromData.subAreaAgentId == 0) {
      return fromData.AgentId
    } else {
      return fromData.subAreaAgentId
    }

  }

  dateTimeTransform(date:any){
    return this.datePipe.transform(this.commonService.dateTimeTransform(date), 'dd/mm/YYYY hh :mm a');
  }

  //--------------------------------------------------   global page method's call here   -------------------------------------------------------//

  //-------------------------------------------------- agent Profile method's start here left side  data -----------------------------------------------------------//

  getAgentProfileData() {
    this.spinner.show();
    let formData = this.filterForm.value;
    this.nullishTopFilterForm();
    this.callAPIService.setHttp('get', 'Web_get_Agent_Profile?UserId=' + this.checkSubAreaAgentId() + '&clientid=' + formData.ClientId, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.agentProfileData = res.data1[0];
      } else {
        this.agentProfileData = [];
        this.spinner.hide();
      }
      this.getAgentProfileCardData();
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  getAgentProfileCardData() {
    this.spinner.show();
    let formData = this.filterForm.value;
    this.nullishTopFilterForm();
    let checkBoothId: any
    formData.BoothId == null ? checkBoothId = 0 : checkBoothId = formData.BoothId;

    let obj = 'AgentId=' + formData.AgentId + '&ClientId=' + formData.ClientId + '&BoothId=' + checkBoothId + '&AssemblyId=' + formData.AssemblyId;
    this.callAPIService.setHttp('get', 'Web_Client_AgentWithAssignedBooths_Summary?' + obj, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.agentProfileCardData = res.data1[0];
      } else {
        this.agentProfileCardData = [];
        this.spinner.hide();
      }
      this.getpiChartArray(this.agentProfileCardData);
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  getpiChartArray(piChartData: any) {
    // data transform from orignal array 
    let obj: any = [{ 'category': "Total Filled", 'categoryCount': piChartData.TotalFilled }, , { 'category': 'Pending', 'categoryCount': piChartData.Pending }]
    this.piChartArray = obj;
    this.piechartAgentProfile();
  }

  piechartAgentProfile() {

    am4core.useTheme(am4themes_animated);

    // Create chart instance
    let chart = am4core.create("agentProfilePiChart", am4charts.PieChart);
    // Add and configure Series
    let pieSeries = chart.series.push(new am4charts.PieSeries());
    pieSeries.colors.list = [
      am4core.color("#44ff44"),
      am4core.color("#8b84f6"),
    ];

    pieSeries.dataFields.value = "categoryCount";
    pieSeries.dataFields.category = "Category";


    // Let's cut a hole in our Pie chart the size of 30% the radius
    // chart.innerRadius = am4core.percent(30);

    // Put a thick white border around each Slice
    pieSeries.slices.template.stroke = am4core.color("#fff");
    pieSeries.slices.template.strokeWidth = 2;
    pieSeries.slices.template.strokeOpacity = 1;
    pieSeries.slices.template
      .cursorOverStyle = [
        {
          "property": "cursor",
          "value": "pointer"
        }
      ];

    // Create a base filter effect (as if it's not there) for the hover to return to
    let shadow = pieSeries.slices.template.filters.push(new am4core.DropShadowFilter);
    shadow.opacity = 0;

    // Create hover state
    let hoverState: any = pieSeries.slices.template.states.getKey("hover"); // normally we have to create the hover state, in this case it already exists

    // Slightly shift the shadow and make it more prominent on hover
    let hoverShadow = hoverState.filters.push(new am4core.DropShadowFilter);
    hoverShadow.opacity = 0.7;
    hoverShadow.blur = 5;
    chart.radius = am4core.percent(100);
    // Add a legend
    chart.legend = new am4charts.Legend();
    chart.legend.maxWidth = 100;
    chart.legend.fontSize = 14;
    chart.legend.scrollable = true;
    chart.legend.position = "bottom";
    chart.legend.contentAlign = "right";

    let markerTemplate = chart.legend.markers.template;
    markerTemplate.width = 15;
    markerTemplate.height = 15;
    pieSeries.labels.template.disabled = true;


    chart.data = this.piChartArray;
  }

  //-------------------------------------------------- agent block  method start here    -------------------------------------------------- //

  blockUser(userId: any, blogStatus: any) {
    let checkBlogStatus: any;
    blogStatus == 0 ? checkBlogStatus = 1 : checkBlogStatus = 0;
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_Insert_Election_BlockBoothAgent?UserId=' + userId + '&ClientId=' + this.agentInfo.ClientId + '&CreatedBy=' + this.commonService.loggedInUserId() + '&IsBlock=' + checkBlogStatus, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.toastrService.success(res.data1[0].Msg);
        this.getAgentProfileData();
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
  //-------------------------------------------------- agent block  method End here    -------------------------------------------------- //

  // --------------------------------------------------   voter filter method's  start here   -------------------------------------------------- //

  deafultVoterProfilefilterForm() {
    let toDate: any = new Date();         //selected Date
    let fromDate = new Date((toDate) - 6 * 24 * 60 * 60 * 1000);
    this.voterProfilefilterForm = this.fb.group({
      weekRangePicker: [[fromDate, toDate]],
      ToDate: [this.datePipe.transform(toDate, 'dd/MM/yyyy')],
      FromTo: [this.datePipe.transform(fromDate, 'dd/MM/yyyy')],
      // Search: [''],
    })
  }

  voterDateRangeSelect(dateRange: any) {
    this.defaultCalenderIconFlag = true;
    this.voterProfilefilterForm.patchValue({
      ToDate: this.datePipe.transform(dateRange[1], 'dd/MM/yyyy'),
      FromTo: this.datePipe.transform(dateRange[0], 'dd/MM/yyyy'),
    });
    this.getAgentAssBoothActivityGraph();
  }

  clearFilterDateRangepicker() {
    this.defaultCalenderIconFlag = false;
    this.deafultVoterProfilefilterForm();
    this.getAgentAssBoothActivityGraph();

  }

  onClickPagintionVoters(pageNo: any) {
    this.votersPaginationNo = pageNo;
    this.getClientBoothAgentVoterList();
  }

  clickOnVoterList() {
    let clickOnVoterTab: any = document.getElementById('pills-migrated-tab');
    clickOnVoterTab.click();
    this.votersPaginationNo = 1;
    this.searchVoters.setValue('');
    this.getClientBoothAgentVoterList()
  }

  // --------------------------------------------------   voter filter method's  end here   -------------------------------------------------- //


  // --------------------------------------------------  voters Graph  method's  & card data  Start here right side panel  -------------------------------------------------- //
  getAgentAssBoothActivityGraph() {
    this.spinner.show();
    let formData = this.filterForm.value;
    this.nullishTopFilterForm();
    let checkBoothId: any
    formData.BoothId == null ? checkBoothId = 0 : checkBoothId = formData.BoothId;
    let obj = 'AgentId=' + this.getReturnAgentIdOrAreaAgentId() + '&ClientId=' + formData.ClientId + '&BoothId=' + checkBoothId + '&AssemblyId=' + formData.AssemblyId + '&FromDate=' + this.voterProfilefilterForm.value.FromTo + '&ToDate=' + this.voterProfilefilterForm.value.ToDate;
    this.callAPIService.setHttp('get', 'Web_Client_AgentWithAssignedBooths_ActivityGraph?' + obj, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.agentAssBoothActivityGraphData = res.data1;
      } else {
        this.agentAssBoothActivityGraphData = [];
        this.spinner.hide();
      }

      this.LineChartAgentPerformance(this.agentAssBoothActivityGraphData);
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  LineChartAgentPerformance(data: any) {
    // Themes begin
    am4core.useTheme(am4themes_animated);
    // Themes end

    // Create chart instance
    let chart = am4core.create("agentPerformancediv", am4charts.XYChart);

    // Add data


    data.map((ele: any) => {
      if (ele.Date) {
        let DateFormate = this.commonService.changeDateFormat(ele.Date);
        let transformDate = this.datePipe.transform(DateFormate, 'MMM d');
        ele.Date = transformDate;
      }
    })

    chart.data = data;


    // Create category axis
    let categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "Date";
    categoryAxis.renderer.opposite = false;

    categoryAxis.renderer.minGridDistance = 20;
    // Create value axis
    let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.renderer.inversed = false;
    valueAxis.title.text = "Agent Performance Count";
    valueAxis.renderer.minLabelPosition = 0.01;

    // Create series
    let series1 = chart.series.push(new am4charts.LineSeries());
    series1.dataFields.valueY = "VoterCount";
    series1.dataFields.categoryX = "Date";
    series1.name = "VoterCount";
    series1.bullets.push(new am4charts.CircleBullet());
    series1.tooltipText = "{valueY}";
    series1.legendSettings.valueText = "{valueY}";
    series1.visible = false;
    series1.smoothing = "monotoneX";
    series1.stroke = am4core.color("#00ff00");
    series1.strokeWidth = 3;
    // series1.tensionX = 0.8;
    // series1.tensionY = 1;

    let series2 = chart.series.push(new am4charts.LineSeries());
    series2.dataFields.valueY = "FamilyCount";
    series2.dataFields.categoryX = "Date";
    series2.name = 'FamilyCount';
    series2.bullets.push(new am4charts.CircleBullet());
    series2.tooltipText = "{valueY}";
    series2.legendSettings.valueText = "{valueY}";
    series2.smoothing = "monotoneX";
    series2.stroke = am4core.color("#463AFD");
    series2.strokeWidth = 3;
    // series1.tensionX = 0.8;
    // series1.tensionY = 1;

    // Add chart cursor
    chart.cursor = new am4charts.XYCursor();
    chart.cursor.behavior = "zoomY";


    let hs1 = series1.segments.template.states.create("hover")
    hs1.properties.strokeWidth = 5;
    series1.segments.template.strokeWidth = 1;

    let hs2 = series2.segments.template.states.create("hover")
    hs2.properties.strokeWidth = 5;
    series2.segments.template.strokeWidth = 1;

    // Add legend
    chart.legend = new am4charts.Legend();
    chart.legend.itemContainers.template.events.on("over", function (event: any) {
      let segments = event.target.dataItem.dataContext.segments;
      segments.each(function (segment: any) {
        segment.isHover = true;
      })
    })

    chart.legend.itemContainers.template.events.on("out", function (event: any) {
      let segments = event.target.dataItem.dataContext.segments;
      segments.each(function (segment: any) {
        segment.isHover = false;
      })
    })
    this.getVotersCardData();
  }


  getVotersCardData() {
    this.spinner.show();
    let formData = this.filterForm.value;
    this.nullishTopFilterForm();
    let checkBoothId: any
    formData.BoothId == null ? checkBoothId = 0 : checkBoothId = formData.BoothId;
    let obj: any = 'AgentId=' + this.getReturnAgentIdOrAreaAgentId() + '&ClientId=' + formData.ClientId + '&BoothId=' + checkBoothId+ '&AssemblyId=' + formData.AssemblyId
      + '&Search=&nopage=' + this.votersPaginationNo + '&FromDate=' + this.voterProfilefilterForm.value.FromTo + '&ToDate=' + this.voterProfilefilterForm.value.ToDate;
    this.callAPIService.setHttp('get', 'Web_Get_Client_Booth_Agent_DailyWork?' + obj, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.votersCardData = res.data1[0];
        this.getClientBoothAgentVoterList();
      } else {
        this.votersCardData = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  // --------------------------------------------------  voters Graph & card data  method's End here right side panel  -------------------------------------------------- //

  // ------------------------------------------  Voter list with filter start here  ------------------------------------------//

  getClientBoothAgentVoterList() {
    this.spinner.show();
    let formData = this.filterForm.value;
    this.nullishTopFilterForm();
    let checkBoothId: any
    formData.BoothId == null ? checkBoothId = 0 : checkBoothId = formData.BoothId;
    let obj: any = 'AgentId=' + this.getReturnAgentIdOrAreaAgentId() + '&ClientId=' + formData.ClientId + '&BoothId=' + checkBoothId + '&AssemblyId=' + formData.AssemblyId
      + '&Search=' + this.searchVoters.value + '&nopage=' + this.votersPaginationNo + '&FromDate=' + this.voterProfilefilterForm.value.FromTo + '&ToDate=' + this.voterProfilefilterForm.value.ToDate;
    this.callAPIService.setHttp('get', 'Web_Get_Client_Booth_Agent_VoterList?' + obj, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.clientBoothAgentVoterList = res.data1;
        this.votersTotal = res.data2[0].TotalCount;
      } else {
        this.clientBoothAgentVoterList = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }
  onKeyUpFilterVoters() {
    this.subject.next();
  }

  searchVoterFilter(flag: any) {
    if (flag == 'true') {
      if (this.searchVoters.value == "" || this.searchVoters == null) {
        this.toastrService.error("Please search and try again");
        return
      }
    }
    this.subject.pipe(debounceTime(700)).subscribe(() => {
      this.searchVoters.value;
      this.getClientBoothAgentVoterList();
    });
  }
  // ------------------------------------------  Voter list with filter start here  ------------------------------------------//

  //--------------------------------------------------------- FamiliyCard method's with filter start here -------------------------------------------//

  clickOnFamiliyCard() {
    this.spinner.show();
    let formData = this.filterForm.value;
    this.nullishTopFilterForm();
    let checkBoothId: any
    formData.BoothId == null ? checkBoothId = 0 : checkBoothId = formData.BoothId;
    let obj: any = 'AgentId=' + this.getReturnAgentIdOrAreaAgentId() + '&ClientId=' + formData.ClientId + '&BoothId=' + checkBoothId + '&AssemblyId=' + formData.AssemblyId
      + '&Search=' + this.searchFamilyVoters.value + '&nopage=' + this.familyPaginationNo + '&FromDate=' + this.voterProfilefilterForm.value.FromTo + '&ToDate=' + this.voterProfilefilterForm.value.ToDate;
    this.callAPIService.setHttp('get', 'Web_Get_Client_Agentwise_Booth_Familly_VoterList?' + obj, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.clientBoothAgentFamiliyList = res.data1;
        this.familyTotal = res.data2[0].TotalCount;
      } else {
        this.clientBoothAgentFamiliyList = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  onClickPagintionFamily(pageNo: any) {
    this.familyPaginationNo = pageNo;
    this.clickOnFamiliyCard();
  }

  familyDetails(ParentVoterId: any) {
    let formData = this.filterForm.value;
    this.nullishTopFilterForm();
    let obj = 'ParentVoterId=' + ParentVoterId + '&ClientId=' + formData.ClientId + '&Search=' + this.searchFamilyVoters.value + '&AgentId=' + formData.AgentId;
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_get_Agentwise_FamilyMember?' + obj, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();;
        this.boothFamilyDetailsArray = res.data1;
      } else {
        this.boothFamilyDetailsArray = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  onKeyUpFilterFamilyVoters() {
    this.subject.next();
  }

  searchFamilyVotersFilters(flag: any) {
    if (flag == 'true') {
      if (this.searchFamilyVoters.value == "" || this.searchFamilyVoters.value == null) {
        this.toastrService.error("Please search and try again");
        return
      }
    }
    this.subject.pipe(debounceTime(700)).subscribe(() => {
      this.searchFamilyVoters.value;
      this.clickOnFamiliyCard();
    });
  }
  //--------------------------------------------------------- FamiliyCard method's with filter end here -------------------------------------------//

  //--------------------------------------------------------- New Voters  list with filter start here  -------------------------------------------//

  clickOnNewVotersList() {
    this.spinner.show();
    let formData = this.filterForm.value;
    this.nullishTopFilterForm();
    let obj: any = 'AgentId=' + this.getReturnAgentIdOrAreaAgentId() + '&ClientId=' + formData.ClientId + '&Search=' + this.searchNewVoters.value + '&nopage=' + this.newVotersPaginationNo + '&FromDate=' + this.voterProfilefilterForm.value.FromTo + '&ToDate=' + this.voterProfilefilterForm.value.ToDate;
    this.callAPIService.setHttp('get', 'Web_Get_Client_Booth_Agent_NewVoterList?' + obj, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.getnewVotersList = res.data1;
        this.newVotersTotal = res.data2[0].TotalCount;
      } else {
        this.getnewVotersList = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  onClickPagintionNewVoters(pageNo: any) {
    this.newVotersPaginationNo = pageNo;
    this.clickOnNewVotersList();
  }

  onKeyUpFilterNewVoters() {
    this.subject.next();
  }

  searchNewVotersFilters(flag: any) {
    if (flag == 'true') {
      if (this.searchNewVoters.value == "" || this.searchNewVoters.value == null) {
        this.toastrService.error("Please search and try again");
        return
      }
    }
    this.subject.pipe(debounceTime(700)).subscribe(() => {
      this.searchNewVoters.value;
      this.clickOnNewVotersList();
    });
  }

  //--------------------------------------------------------- New Voters  list with filter End here  -------------------------------------------//

  //--------------------------------------------------------- Agents call tab  with filter start here --------------------------------------------------------- //
  
  agentCallLogger() {
    this.spinner.show();
    let formData = this.filterForm.value;
    this.nullishTopFilterForm();
    let obj: any = 'AgentId=' + this.getReturnAgentIdOrAreaAgentId() + '&ClientId=' + formData.ClientId + '&Search=' + this.searchAgentCallLogger.value + '&nopage=' + this.callLoggerPaginationNo + '&FromDate=' + this.voterProfilefilterForm.value.FromTo + '&ToDate=' + this.voterProfilefilterForm.value.ToDate;
    this.callAPIService.setHttp('get', 'Web_Get_Client_Booth_Agent_CallLogger?' + obj, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.getCallLoggerList = res.data1;
        this.getCallLoggerTotal = res.data2[0].TotalCount;
      } else {
        this.getCallLoggerList = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  onClickPagintionAgentCallLogger(pageNo: any) {
    this.callLoggerPaginationNo = pageNo;
    this.agentCallLogger();
  }

  onKeyUpFilterAgentCallLogger() {
    this.subject.next();
  }

  searchAgentCallLoggerFilters(flag: any) {
    if (flag == 'true') {
      if (this.searchAgentCallLogger.value == "" || this.searchAgentCallLogger.value == null) {
        this.toastrService.error("Please search and try again");
        return
      }
    }
    this.subject.pipe(debounceTime(700)).subscribe(() => {
      this.searchAgentCallLogger.value;
      this.agentCallLogger();
    });
  }

  //--------------------------------------------------------- Agents call tab  with filter end here --------------------------------------------------------- //

  //--------------------------------------------------------- App Use Track start here --------------------------------------------------------- //
    
  boothAgentAppUseTrack() {
      this.spinner.show();
      let formData = this.filterForm.value;
      this.nullishTopFilterForm();
      let obj: any = 'AgentId=' + this.getReturnAgentIdOrAreaAgentId() + '&ClientId=' + formData.ClientId + '&FromDate=' + this.voterProfilefilterForm.value.FromTo + '&ToDate=' + this.voterProfilefilterForm.value.ToDate+'&nopage='+this.appUsesActivityPaginationNo;
      this.callAPIService.setHttp('get', 'Web_Get_Client_Booth_Agent_AppUsesActivity?' + obj, false, false, false, 'electionServiceForWeb');
      this.callAPIService.getHttp().subscribe((res: any) => {
        if (res.data == 0) {
          this.spinner.hide();
          this.boothAgentAppUseTrackRes = res.data1;
          this.appUsesActivityTotal = res.data2[0].TotalCount;
        } else {
          this.boothAgentAppUseTrackRes = [];
          this.spinner.hide();
        }
      }, (error: any) => {
        this.spinner.hide();
        if (error.status == 500) {
          this.router.navigate(['../500'], { relativeTo: this.route });
        }
      })
    }

    onClickPagintionAppUseTrack(pageNo: any) {
      this.appUsesActivityPaginationNo = pageNo;
      this.boothAgentAppUseTrack();
    }

    //--------------------------------------------------------- App Use Track start here --------------------------------------------------------- //

  //--------------------------------------------------------- App Location Track start here --------------------------------------------------------- //
  boothAgentTracking() {
    this.boothAgentAppUseTrack();
    this.spinner.show();
    let formData = this.filterForm.value;
    this.nullishTopFilterForm();
    let obj: any = 'AgentId=' + this.getReturnAgentIdOrAreaAgentId() + '&ClientId=' + formData.ClientId + '&FromDate=' + this.voterProfilefilterForm.value.FromTo + '&ToDate=' + this.voterProfilefilterForm.value.ToDate;
    this.callAPIService.setHttp('get', 'Web_Get_Client_Booth_Agent_Tracking?' + obj, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.boothAgentTrackingList = res.data1;
        this.spinner.hide();
      } else {
        this.boothAgentTrackingList = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  clickedMarker(infowindow:any) {
    if (this.previous) {
        this.previous.close();
    }
    this.previous = infowindow;
 }
  //--------------------------------------------------------- App Location Track end here --------------------------------------------------------- //

  //-------------------------------------------------- agent Profile method's end here  left side data -----------------------------------------------------------//
  ngOnDestroy() {
    sessionStorage.removeItem('agents-activity');
  }

  clearFilters(flag: any) {
    if (flag == 'clearSearchVoters') {
      this.votersPaginationNo = 1;
      this.searchVoters.setValue('');
      this.getClientBoothAgentVoterList();
    } else if (flag == 'clearSearchNewVoters') {
      this.newVotersPaginationNo = 1;
      this.searchNewVoters.setValue('');
      this.clickOnNewVotersList();
    } else if (flag == 'clearSearchFamilyVoters') {
      this.familyPaginationNo = 1;
      this.searchFamilyVoters.setValue('');
      this.clickOnFamiliyCard();
    } else if (flag == 'clearSearchAgentCallLogger') {
      this.callLoggerPaginationNo = 1;
      this.searchAgentCallLogger.setValue('');
      this.agentCallLogger();
    }
    this.deafultVoterProfilefilterForm();
  }

}

