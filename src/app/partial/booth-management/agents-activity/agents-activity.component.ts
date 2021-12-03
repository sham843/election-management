import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { CallAPIService } from 'src/app/services/call-api.service';
import { CommonService } from 'src/app/services/common.service';

import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_kelly from "@amcharts/amcharts4/themes/kelly";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

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

  constructor(private spinner: NgxSpinnerService, private callAPIService: CallAPIService, private fb: FormBuilder,
    private commonService: CommonService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
    let agentInfo:any =  sessionStorage.getItem('agents-activity');
    this.topFilterForm(JSON.parse(agentInfo)); // top filter method
    this.getAllAgentList();
    this.getAgentProfileData();
    this.getAgentProfileCardData();

    this.deafultVoterProfilefilterForm(); // voter list filter
  }

  //--------------------------------------------------  top filter method's start  here e -----------------------------------------------------------//
  topFilterForm(data:any) {
    let setAgentId:any;
    data.SubUserTypeId == 3 ? setAgentId = data.BoothAgentId : setAgentId = data.
    console.log(data);
    this.filterForm = this.fb.group({
      AgentId: [data.BoothAgentId],
      ClientId: [data.ClientId],
      BoothId: [0],
      AssemblyId: [0],
      subAreaAgentId:[]
    })
  }

  getAllAgentList() {
    this.spinner.show();
    let formData = this.filterForm.value;
    this.callAPIService.setHttp('get', 'Web_Client_AgentList_ddl?ClientId=' + formData.ClientId + '&UserId=' + this.commonService.loggedInUserId(), false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.allAgentLists = res.data1;
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

  areaSubAgentByAgentId(){
    this.spinner.show();
    let formData = this.filterForm.value;
    let agentId:any;

    formData.subAreaAgentId == "" ||  formData.subAreaAgentId == null || formData.subAreaAgentId == undefined ?  agentId =  formData.ClientId :  agentId =  formData.subAreaAgentId;
   
    let obj:any =  'ClientId='+agentId+'&UserId=' + this.commonService.loggedInUserId()+'&BoothAgentId='+formData.BoothId;
    this.callAPIService.setHttp('get', 'Web_Client_Area_AgentList_ddl?'+obj, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.allSubAgentsByAgentId = res.data1;
        this.getAgentByBooths();
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

  getAgentByBooths(){
    this.spinner.show();
    let formData = this.filterForm.value;
    let obj:any =  'ClientId='+formData.ClientId+'&AgentId=' + formData.AgentId +'&BoothAgentId='+formData.BoothId;
    this.callAPIService.setHttp('get', 'Web_Client_AgentWithAssignedBoothsList?'+obj, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.allSubAgentsByAgentId = res.data1;
        console.log(this.allSubAgentsByAgentId)
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
  
  clearFilter(flag:any){

  }
  //--------------------------------------------------  top filter method's end  here e -----------------------------------------------------------//

  //-------------------------------------------------- agent Profile method's start here -----------------------------------------------------------//
  getAgentProfileData(){
    this.spinner.show();
    this.callAPIService.setHttp('get', 'Web_get_Agent_Profile?UserId=' + this.commonService.loggedInUserId()+'&clientid='+this.filterForm.value.ClientId, false, false, false, 'electionServiceForWeb');
    this.callAPIService.getHttp().subscribe((res: any) => {
      if (res.data == 0) {
        this.spinner.hide();
        this.agentProfileData = res.data1[0];
        this.getpiChartArray(res.data1);
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
      } else {
        this.agentProfileCardData = [];
        this.spinner.hide();
      }
      this.getpiChartArray(res.data1);
    }, (error: any) => {
      this.spinner.hide();
      if (error.status == 500) {
        this.router.navigate(['../500'], { relativeTo: this.route });
      }
    })
  }

  getpiChartArray(piChartData:any){ // data transform from orignal array 
    piChartData.filter((ele:any)=>{
      let obj:any = [{'category':"TotalVoter",'categoryCount':ele.TotalVoter},{'category':'TotalFamily','categoryCount':ele.TotalFamily},{'category':'Pending','categoryCount':ele.Pending}];
      this.piChartArray = obj;
    })
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

  //-------------------------------------------------- agent Profile method's end here -----------------------------------------------------------//

  // --------------------------------------------------  voters data  method's Start here right side panel  -------------------------------------------------- //
 
  // --------------------------------------------------   voter filter metho's  start here   -------------------------------------------------- //

  deafultVoterProfilefilterForm(){
    this.voterProfilefilterForm = this.fb.group({
      fromTo: [['','']],
      FromDate: [['','']],
      ToDate: [['','']],
      Search:[''],
    })
  }

  onKeyUpSearchFilter(){

  }

  voterDateRangeSelect(){
    
  }
  clearFilterVoter(flag:any){
    
  }

  // --------------------------------------------------   voter filter metho's  start here   -------------------------------------------------- //

  ngOnDestroy(){
    sessionStorage.removeItem('agents-activity');
  }
  
  // --------------------------------------------------  voters data  method's End  here right side panel -------------------------------------------------- //




}
