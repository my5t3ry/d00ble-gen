import {Component} from '@angular/core';
import {ConfigService} from "./config.service";
import * as uuid from "uuid";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'd00ble-gen';

}
