import { DataManager } from '@helio/wc-data';
import { template } from '@helio/wc-utils';
import { I18n } from '../../core/wc-i18n.js';

export class wcTranslate extends HTMLElement {
  constructor(self) {
    self = super(self);
    return self;
  }

  //autoInjected:getter & setter for i18n
  set i18n(value) { this.setAttribute('i18n', value); }
  get i18n() { return this.getAttribute('i18n'); }

  get translate() {
    return this.getAttribute('translate') ||
      this.getAttribute('t') ||
      this.getAttribute('i18n') ||
      this.translateKey ||
      this.innerHTML;
  }

  update() {
    let context = {};
    Array.from(this.attributes).forEach(attr => {
      if (attr.name.indexOf('t-') > -1) {
        context[attr.name.replace('t-', '')] = attr.value;
      }
    });
    if (this.translations) {
      let translateString = I18n.MISSING(this.translate);
      if(this.translations[this.translate] != null){
        translateString = this.translations[this.translate]
      }
      this.innerHTML = template(translateString, context);
    } 
  }

  connectedCallback() {
    this.translateKey = this.translate;
    this.innerHTML = '';
    DataManager.on('data', 'translations', translations => {
      this.translations = translations;
      this.update();
    });
    let attrObserver = new MutationObserver(() => this.update());
    attrObserver.observe(this, { attributes: true });
    this.update();
  }
}