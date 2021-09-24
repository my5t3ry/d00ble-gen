import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";


@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private _images: any = null;
  private _config = {
    numCards: 12,
    maxImageWidth: 100,
    minImageWidth: 15,
    numImagesOnCard: 9,
    nativeCardSize: 1240,
    nativeCardPadding: 120,
    backgroundColor: {r: 143, g: 247, b: 178, a: 0.54},
    cardScaling: 100,
    maxRotation: 360
  }


  get config(): { backgroundColor: { a: number; r: number; b: number; g: number }; numCards: number; maxImageWidth: number; minImageWidth: number; cardScaling: number; maxRotation: number; nativeCardSize: number; nativeCardPadding: number; numImagesOnCard: number } {
    return this._config;
  }

  constructor(private http: HttpClient) {
    this.http.get("assets/defaultimages.json").subscribe(result => {
      this.images = <{ data: string | ArrayBuffer | null; uuid: string }[]>result;
    })
  }

  addImage(image: { data: string | ArrayBuffer | null; uuid: string }) {
    this._images.push(image)
  }

  get images(): any {
    return this._images;
  }

  set images(value: { data: string | ArrayBuffer | null; uuid: string }[]) {
    this._images = value;
  }

  public getBackgroundRgba(): string {
    return `background-color: rgba(${this.config.backgroundColor.r}, ${this.config.backgroundColor.g}, ${this.config.backgroundColor.b},${this.config.backgroundColor.a});`;
  }

  public getCardStyle(): string {
    return ` ${this.getBackgroundRgba()}
    width: ${Math.floor(this._config.nativeCardSize * (this._config.cardScaling / 100))}px;
    height: ${Math.floor(this._config.nativeCardSize * (this._config.cardScaling / 100))}px;
    padding: ${Math.floor(this._config.nativeCardPadding * (this._config.cardScaling / 100))}px;`
  }
}
