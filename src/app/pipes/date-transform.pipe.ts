import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateTransform'
})
export class DateTransformPipe implements PipeTransform {

  constructor(private datePipe:DatePipe){ }

  transform(value: any, ...args: unknown[]): unknown { // Date time transform 
    var date_components = value.split(" ");
    var date = date_components[0].split("/").reverse().join('-');
   
   return  this.datePipe.transform(new Date(date + ' '+ date_components[1]), 'dd/mm/YYYY hh:mm a');
  }

}
