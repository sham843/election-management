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
  styleUrls: ['./agents-activity.component.css']
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

  allowClearBoothIdFlag:boolean = true;
  allowClearSubAgentsFlag:boolean = true;
  allowClearAgentFlag:boolean = true;

  maxDate: any = new Date();

  constructor(private spinner: NgxSpinnerService, private callAPIService: CallAPIService, private fb: FormBuilder, public dateTimeAdapter: DateTimeAdapter<any>, private datePipe: DatePipe, private commonService: CommonService, private router: Router, private route: ActivatedRoute, private toastrService: ToastrService) {
    { dateTimeAdapter.setLocale('en-IN') }
  }

  ngOnInit(): void {
    this.agentInfo = sessionStorage.getItem('agents-activity');
    this.agentInfo = JSON.parse(this.agentInfo);
    this.deafultVoterProfilefilterForm(); // voter list filter

    this.topFilterForm(this.agentInfo); // top filter method
    this.getAllAgentList();
    this.getAgentProfileData();
    this.getAgentProfileCardData();
    this.searchVoterFilter('false');
    this.searchNewVotersFilters('false');

    //this.getAgentAssBoothActivityGraph(); // right side data for all method's

  }



  //--------------------------------------------------  top filter method's start  here e -----------------------------------------------------------//

  topFilterForm(data: any) {
    this.filterForm = this.fb.group({
      AgentId: [],
      ClientId: [data.ClientId],
      BoothId: [0],
      AssemblyId: [0],
      subAreaAgentId: [this.agentInfo.SubUserTypeId],
    });

    data.SubUserTypeId == 3 ? this.filterForm.controls['AgentId'].setValue(data.BoothAgentId) :
      this.filterForm.controls['AgentId'].setValue(data.Addedby)
      this.filterForm.controls['subAreaAgentId'].setValue(data.BoothAgentId)
  }

  get filterFormControls() { return this.filterForm.controls };

  getAllAgentList() {
    this.spinner.show();
    let formData = this.filterForm.value;
    this.callAPIService.setHttp('get', 'Web_Client_AgentList_ddl?ClientId=' + formData.ClientId + '&UserId=' + formData.AgentId, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.allAgentLists = res.data1;
        //
        this.allAgentLists.length == 1 ? (this.filterForm.controls['AgentId'].setValue(this.allAgentLists[0].AgentId), this.allowClearAgentFlag = false) : this.allowClearAgentFlag = true;
        this.filterForm.value.SubUserTypeId == 3 ? this.getAgentByBooths() : this.areaSubAgentByAgentId(false);
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

  areaSubAgentByAgentId(flag:any) {
    // on chenage agent bind agent activity 
    this.spinner.show();
    let formData = this.filterForm.value;
    let checkBoothId:any
    formData.BoothId == null ? checkBoothId = 0 : checkBoothId = formData.BoothId;
    let obj: any = 'ClientId=' + formData.ClientId + '&UserId=' + formData.AgentId + '&BoothAgentId=' + checkBoothId;
    this.callAPIService.setHttp('get', 'Web_Client_Area_AgentList_ddl?' + obj, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.allSubAgentsByAgentId = res.data1;

        if (this.filterForm.value.SubUserTypeId == 4) {
          this.allSubAgentsByAgentId.length == 1 ? (this.filterForm.controls['subAreaAgentId'].setValue(this.allSubAgentsByAgentId[0].Id), this.subAreaAgantDisabledFlag = true, this.allowClearSubAgentsFlag = false) : this.subAreaAgantDisabledFlag = false, this.allowClearSubAgentsFlag = true;
        } else {
          this.allSubAgentsByAgentId.length == 1 ? (this.filterForm.controls['AgentId'].setValue(this.allSubAgentsByAgentId[0].AgentId), this.subAreaAgantDisabledFlag = true, this.allowClearSubAgentsFlag = false)  : this.subAreaAgantDisabledFlag= false, this.allowClearSubAgentsFlag = true;
        }

        if(flag == 'sel'){
          this.filterForm.controls['subAreaAgentId'].setValue(0) 
        }

        this.getAgentByBooths();
      } else {
        this.allSubAgentsByAgentId = [];
        this.getAgentByBooths();
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  getReturnAgentIdOrAreaAgentId() {
    let fromData = this.filterForm.value;
    let agentId: any;
    fromData.subAreaAgentId == 0 || fromData.subAreaAgentId == null || fromData.subAreaAgentId == undefined ? agentId = fromData.AgentId : agentId = fromData.subAreaAgentId;
    return agentId
  }

  getAgentByBooths() {
    this.spinner.show();
    let formData = this.filterForm.value;
    let obj: any = 'ClientId=' + formData.ClientId + '&AgentId=' + this.getReturnAgentIdOrAreaAgentId();
    this.callAPIService.setHttp('get', 'Web_Client_AgentWithAssignedBoothsList?' + obj, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.getAgentByBoothsData = res.data1;
        this.getAgentByBoothsData.length == 1 ? (this.filterForm.controls['BoothId'].setValue(this.getAgentByBoothsData[0].BoothId), this.selBoothByAgent(this.getAgentByBoothsData[0].BoothId), this.allowClearBoothIdFlag = false) : this.allowClearBoothIdFlag = true
        this.getAgentAssBoothActivityGraph();
      } else {
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

  selBoothByAgent(data: any) {
    this.getAgentByBoothsData.filter((ele: any) => {
      if (data == ele.BoothId) {
        this.filterForm.controls['AssemblyId'].setValue(ele.AssemblyId)
        this.getAgentAssBoothActivityGraph();
      }
    })
  }

  clearFilter(flag: any) {
    if (flag == "subAgent") {
      this.filterForm.patchValue({
        BoothId:0,
        subAreaAgentId:0,
      })
    } else if (flag == "Booth") {
      this.filterForm.controls["BoothId"].setValue(0);
    }else{
      this.topFilterForm(this.agentInfo);
    }
    console.log(this.filterForm.value);
    this.getAgentAssBoothActivityGraph();

  }
  //--------------------------------------------------  top filter method's end  here e -----------------------------------------------------------//

  //-------------------------------------------------- agent Profile method's start here left side data -----------------------------------------------------------//
  getAgentProfileData() {
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_get_Agent_Profile?UserId=' + this.filterForm.value.AgentId + '&clientid=' + this.filterForm.value.ClientId, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.agentProfileData = res.data1[0];
        // this.getpiChartArray(res.data1);
      } else {
        this.agentProfileData = [];
        this.spinner.hide();
      }

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
    let obj = 'AgentId=' + formData.AgentId + '&ClientId=' + formData.ClientId + '&BoothId=' + formData.BoothId + '&AssemblyId=' + formData.AssemblyId;
    this.callAPIService.setHttp('get', 'Web_Client_AgentWithAssignedBooths_Summary?' + obj, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.agentProfileCardData = res.data1[0];
        this.getpiChartArray(res.data1[0]);
      } else {
        this.agentProfileCardData = [];
        this.spinner.hide();
      }
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  getpiChartArray(piChartData: any) {
    // data transform from orignal array 
    let obj: any = [{ 'category': "TotalVoter", 'categoryCount': piChartData.TotalVoter }, , { 'category': 'TotalFamily', 'categoryCount': piChartData.TotalFamily }, { 'category': 'Pending', 'categoryCount': piChartData.Pending }]
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
      am4core.color("#CC9999"),
      am4core.color("#4DB6AC"),
      am4core.color("#FF6F91"),
      am4core.color("#FF9671"),
      am4core.color("#FFC75F"),
      am4core.color("#9FA8DA"),
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
    chart.legend.fontSize = 10;
    chart.legend.scrollable = true;
    chart.legend.position = "bottom";
    chart.legend.contentAlign = "left";

    let markerTemplate = chart.legend.markers.template;
    markerTemplate.width = 15;
    markerTemplate.height = 15;
    pieSeries.labels.template.disabled = true;


    chart.data = this.piChartArray;
  }


  blockUser(userId:any,blogStatus:any){
    let checkBlogStatus :any;
    blogStatus == 0  ? checkBlogStatus = 1 : checkBlogStatus = 0;
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_Insert_Election_BlockBoothAgent?UserId='+userId+'&ClientId='+this.agentInfo.ClientId + '&CreatedBy=' + this.commonService.loggedInUserId()+'&IsBlock='+checkBlogStatus, false, false, false, 'electionServiceForWeb');
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

  //-------------------------------------------------- agent Profile method's end here  left side data -----------------------------------------------------------//

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

  clickOnVoterList(){
    let clickOnVoterTab:any  =  document.getElementById('pills-migrated-tab');
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
    let checkBoothId:any
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

    let series2 = chart.series.push(new am4charts.LineSeries());
    series2.dataFields.valueY = "FamilyCount";
    series2.dataFields.categoryX = "Date";
    series2.name = 'FamilyCount';
    series2.bullets.push(new am4charts.CircleBullet());
    series2.tooltipText = "{valueY}";
    series2.legendSettings.valueText = "{valueY}";

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
    let checkBoothId:any
    formData.BoothId == null ? checkBoothId = 0 : checkBoothId = formData.BoothId;
    let obj: any = 'AgentId=' + this.getReturnAgentIdOrAreaAgentId() + '&ClientId=' + formData.ClientId + '&BoothId=' + checkBoothId + '&AssemblyId=' + formData.AssemblyId
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

  // --------------------------------------------------  voters Graph & card data   method's End here right side panel  -------------------------------------------------- //

  // ------------------------------------------  Voter list with filter start here  ------------------------------------------//

  getClientBoothAgentVoterList() {
    this.spinner.show();
    let formData = this.filterForm.value;
    let checkBoothId:any
    formData.BoothId == null ? checkBoothId = 0 : checkBoothId = formData.BoothId;
    let obj: any = 'AgentId=' + this.getReturnAgentIdOrAreaAgentId() + '&ClientId=' + formData.ClientId + '&BoothId=' + checkBoothId  + '&AssemblyId=' + formData.AssemblyId
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
    let checkBoothId:any
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

  // --------------------------------------------------  voters data  method's End  here right side panel -------------------------------------------------- //

  // --------------------------------------------------  global method's start here   -------------------------------------------------- //
  clearFilters(flag: any) {
    if (flag == 'clearSearchVoters') {
      this.votersPaginationNo = 1;
      this.searchVoters.setValue('');
      this.getClientBoothAgentVoterList();
    }else if (flag == 'clearSearchNewVoters') {
      this.newVotersPaginationNo = 1;
      this.searchNewVoters.setValue('');
      this.clickOnNewVotersList();
    }else if (flag == 'clearSearchFamilyVoters') {
      this.familyPaginationNo = 1;
      this.searchFamilyVoters.setValue('');
      this.clickOnFamiliyCard();
    }
    this.deafultVoterProfilefilterForm();
  }


  ngOnDestroy() {
    // sessionStorage.removeItem('agents-activity');
  }

  // --------------------------------------------------  global method's start here   -------------------------------------------------- //





}
