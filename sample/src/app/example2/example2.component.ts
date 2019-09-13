import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-example2',
  templateUrl: './example2.component.html',
  styleUrls: ['./example2.component.css']
})
export class Example2Component implements OnInit {

  privateMembe = "Non !";
  privateMember = "Super ce code !";
  privateMember2 = null

  constructor() { }

  ngOnInit() {
    var test = "test";
  }

  myFunction(myVar: any)
  {
    let t = 5;
    let p = "Hey !";
    let k = "Test";

    if ( myVar == 5 )  {
      return [ ]
    }
    else if( true ) {}

    return 8
  }

  public prop1
  public prop2
  public prop3
}
