import {
  ApplicationRef,
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  EmbeddedViewRef,
  Injector
} from '@angular/core';
import {ConfigService} from "../config.service";
import * as uuid from "uuid";
import {ColorEvent} from "ngx-color";
import {CardService} from "../card.service";
import {CardComponent} from "../card/card.component";
import {jsPDF} from "jspdf";
import html2canvas from "html2canvas";

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.scss']
})
export class ConfigComponent {
  get rendering(): boolean {
    return this._rendering;
  }

  get cards(): any {
    return this._cards;
  }

  get cardsRendered(): number {
    return this._cardsRendered;
  }

  private _cardsRendered: number = 0;
  private _cards: { images: { image: any; style: any; }[]; }[] = [];
  private _rendering: boolean = false;

  constructor(private _configService: ConfigService,
              private _cardService: CardService,
              private componentFactoryResolver: ComponentFactoryResolver,
              private appRef: ApplicationRef,
              private injector: Injector) {
  }

  onFileChange(event: any) {
    if (event.target.files && event.target.files.length) {
      for (let i = 0; i < event.target.files.length; i++) {
        const reader = new FileReader();
        reader.readAsDataURL(event.target.files[i]);
        reader.onload = () => {
          let image = {data: reader.result, uuid: uuid.v4()}
          this._configService.addImage(image)
        };
      }
    }
  }

  get configService(): ConfigService {
    return this._configService;
  }

  handleChange($event: ColorEvent) {
    this._configService.config.backgroundColor = $event.color.rgb;
  }

  resetImages() {
    this._configService.images = [];
  }


  createHtmlCards(cards: { images: { image: any; style: any }[] }[]) {
    let result: ComponentRef<CardComponent>[] = [];
    cards.forEach(curCard => {
      const componentRef = this.componentFactoryResolver
        .resolveComponentFactory(CardComponent)
        .create(this.injector);

      this.appRef.attachView(componentRef.hostView);
      componentRef.instance.card = curCard;
      componentRef.changeDetectorRef.detectChanges();
      componentRef.changeDetectorRef.detach()

      result.push(componentRef)
    })
    return result;
  }

  render(): void {
    this._rendering = true;
    this._cards = this.cardService.getCards();
    let compRefs = this.createHtmlCards(this._cards);
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: [3508, 2480]
    });

    new Promise(resolve => {
      let resultWrapper = document.getElementById("result-wrapper");
      compRefs.forEach(curRef => {
        if (resultWrapper) {
          const domElem = (curRef.hostView as EmbeddedViewRef<any>)
            .rootNodes[0] as HTMLElement;
          resultWrapper.appendChild(domElem);
          // @ts-ignore
          let cardElement = domElem.getElementsByClassName("dooble-card").item(0);
          if (cardElement) {
            cardElement.setAttribute("style", this.cardService.configService.getCardStyle())
            html2canvas(<HTMLElement>cardElement).then(canvas => {
              this.appRef.detachView(curRef.hostView);
              curRef.destroy();

              const contentDataURL = canvas.toDataURL('image/png')
              let curOffset = this.calcOffset(this._cardsRendered, canvas);
              this._cardsRendered++;
              pdf.addImage(contentDataURL, 'PNG', curOffset.x, curOffset.y, canvas.width, canvas.height)
              if (this._cardsRendered == this._cards.length) {
                // @ts-ignore
                resultWrapper.innerHTML = '';
                resolve(true);
              }
              if (this._cardsRendered % 6 == 0
                && this._cardsRendered != this._cards.length) {
                pdf.addPage(
                  [3508, 2480],
                  "portrait"
                )
              }
            });
          }
        }
      });
    }).then(() => {
      pdf.save('custom-d00ble.pdf');
      this._rendering = false;
      this._cardsRendered = 0;
    })
  }

  get cardService(): CardService {
    return this._cardService;
  }

  private calcOffset(_cardsRendered: number, canvas: HTMLCanvasElement) {
    return {
      y: (Math.floor(this._cardsRendered % 6 / 2) * canvas.height) + 30 + (30 * Math.floor(this._cardsRendered / 2)),
      x: (Math.floor(this._cardsRendered % 6 % 2) * canvas.width) + 50 + (50 * Math.floor(this._cardsRendered % 2))
    }
  }
}
