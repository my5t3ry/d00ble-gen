import {
  ApplicationRef,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
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
  styleUrls: ['./config.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfigComponent {
  set rendering(value: boolean) {
    this._rendering = value;
  }

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
              private cd: ChangeDetectorRef,
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


  createCardComponents(cards: { images: { image: any; style: any }[] }[]) {
    return new Promise<ComponentRef<CardComponent>[]>(resolve => {

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
      resolve(result);
    })
  }

  async render() {
    this.rendering = true;
    this.cd.detectChanges();

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: [3508, 2480]
    });
    const that = this;
    setTimeout(function () {
      new Promise(resolve => {
        that.cardService.getCards().then(result => {
          that._cards = result;
          that.createCardComponents(result).then(compRefs => {
            let resultWrapper = document.getElementById("result-wrapper");
            compRefs.forEach(curRef => {
              if (resultWrapper) {

                const domElem = (curRef.hostView as EmbeddedViewRef<any>)
                  .rootNodes[0] as HTMLElement;
                resultWrapper.appendChild(domElem);
                let cardElement = domElem.getElementsByClassName("dooble-card").item(0);
                if (cardElement) {

                  cardElement.setAttribute("style", that.cardService.configService.getCardStyle())
                  html2canvas(<HTMLElement>cardElement).then(canvas => {

                    that.appRef.detachView(curRef.hostView);
                    curRef.destroy();

                    const contentDataURL = canvas.toDataURL('image/png')
                    let curOffset = that.calcOffset(that._cardsRendered, canvas);
                    pdf.addImage(contentDataURL, 'PNG', curOffset.x, curOffset.y, canvas.width, canvas.height)

                    that._cardsRendered++;
                    that.cd.detectChanges();

                    if (that._cardsRendered == that._cards.length && resultWrapper) {
                      resultWrapper.innerHTML = '';

                      resolve(true);
                    }

                    if (that._cardsRendered % 6 == 0
                      && that._cardsRendered != that._cards.length) {
                      pdf.addPage(
                        [3508, 2480],
                        "portrait"
                      )
                    }

                  });
                }
              }
            });
          })
        })
      }).then(() => {
        pdf.save('custom-d00ble.pdf');
        that._rendering = false;
        that._cardsRendered = 0;
        that.cd.detectChanges();
        that._cards = []
      })
    }, 200)
  }

  get cardService(): CardService {
    return this._cardService;
  }

  private calcOffset(_cardsRendered: number, canvas: HTMLCanvasElement) {
    return {
      y: (Math.floor(this._cardsRendered % 6 / 2) * canvas.height) + 30 + (30 * Math.floor(this._cardsRendered % 6 / 2)),
      x: (Math.floor(this._cardsRendered % 6 % 2) * canvas.width) + 50 + (50 * Math.floor(this._cardsRendered % 2))
    }
  }
}
