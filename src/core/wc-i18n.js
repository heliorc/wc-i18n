import { DataProvider, DataManager } from '@helio/wc-data';
import { StateManager } from '@helio/wc-core';
import { template } from '@helio/wc-utils';
import { wcTranslate } from '../components/translate/translate.js';

export let I18n = new class extends DataProvider {
    constructor(self) {
        self = super(self);
        this._strings = (window.helio && window.helio.i18n) || {};
        this._lang = 'en_US';
        this._defaultLang = 'en';
        this._defaultRegion = 'US';

        StateManager.onParamChange(
            ['locale','region','lang'], (changes, newState)=>{
                console.debug(changes);
                //If we have a region or lang set but no locale.
                if((newState['region'] || newState['lang']) && !newState['locale']){
                    const newLang = newState['lang'] || this._defaultLang;
                    const newRegion = newState['region'] || this._defaultRegion;
                    const newLocale = `${newLang}_${newRegion}`;
                    StateManager.setParam('locale', newLocale);
                }
                //If we have a locale change with a region or lang set.
                if((newState['region'] || newState['lang']) && newState['locale']){
                    const splitLocale = newState['locale'].split('_');
                    newState['lang'] && StateManager.setParam('lang', splitLocale[0]);
                    newState['region'] && StateManager.setParam('region', splitLocale[1]);
                }

                newState['locale'] && this.setLang(newState['locale']);
            });

        customElements.define('wc-translate', wcTranslate);
        document.addEventListener("DOMContentLoaded", () => this.$resolveModel('translations'));
        return self;
    }

    get debug() {
        return !!(this._debug || StateManager.getParam('i18n-debug'));
    }

    set debug(val) {
        this._debug = !!(val);
    }

    /**
     * @return {string}
     */
    MISSING(key) {
        return (this.debug && `[MISSING:${key}]`) || '';
    }

    get lang() {
        return this._lang;
    }

    get strings() {
        return this._strings[this.lang] || {};
    }

    get(key, data) {
        const strings = this._strings[this.lang];
        let string = (strings && strings[key]);
        if (data) {
            string = template(string, data);
        }
        // type coercion desired in this case for string = undefined possibility
        return string != null ? string : I18n.MISSING(key);
    }

    getAll(namespace) {
        if (namespace) {
            return Object.entries(this._strings[this.lang]).filter(([key, value]) => {
                return key.startsWith(namespace) && value;
            }).reduce((reducer, [key, val]) => {
                reducer[key.replace(namespace + '.', '')] = val;
                return reducer;
            }, {});
        } else {
            return this._strings[this.lang];
        }
    }

    setLang(lang) {
        this._lang = lang;
        this.$resolveModel('translations');
    }

    addStrings(lang, strings) {
        this._strings[lang] = Object.assign({}, this._strings[lang], strings);
        this.$resolveModel('translations');
        return this._strings[lang];
    }

    get translations() {
        return Promise.resolve(this.strings);
    }
};