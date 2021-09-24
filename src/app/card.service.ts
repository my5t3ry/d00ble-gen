import {Injectable} from '@angular/core';
import {ConfigService} from "./config.service";

@Injectable({
  providedIn: 'root'
})
export class CardService {

  get configService(): ConfigService {
    return this._configService;
  }

  constructor(private _configService: ConfigService) {
  }

  getCards(): Promise<{ images: { image: any; style: any; }[]; }[]> {
    return new Promise<{ images: { image: any; style: any; }[]; }[]>(resolve => {
      let result: { images: { image: any; style: any; }[]; }[] = []
      let i = 0;
      while (i < this._configService.config.numCards) {
        let images: { image: any; style: any }[] = []
        let ii = 0;
        while (ii < this._configService.config.numImagesOnCard) {
          images.push({image: this.getRandomImage(), style: this.getRandomStyle()});
          ii++;
        }
        result.push({images: images})
        i++;
      }
      resolve(result);
    })
  }

  private getRandomImage() {
    return this._configService.images[Math.floor(Math.random() * this._configService.images.length)];
  }

  private getRandomStyle() {
    return {
      width: this._configService.config.minImageWidth + (Math.floor(Math.random() * (this._configService.config.maxImageWidth - this._configService.config.minImageWidth))),
      rotation: Math.floor(Math.random() * this._configService.config.maxRotation)
    }
  }
}
