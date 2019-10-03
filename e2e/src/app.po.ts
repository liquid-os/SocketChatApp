import { browser, by, element } from 'protractor';

export class LoginPage {
  navigateTo() {
    return browser.get('/login') as Promise<any>;
  }

  getTitleText() {
    return element(by.css('app-login h1')).getText() as Promise<string>;
  }

  getLoginText() {
    return element(by.css('app-login h3')).getText() as Promise<string>;
  }

  getLoginButton() {
    return element(by.css('app-login _ngcontent-quq-c1'));
  }
}

export class MainPage {
  navigateTo() {
    return browser.get('/manager') as Promise<any>;
  }

  getTitleText() {
    return element(by.css('app-manager _ngcontent-ooe-c1')).getText() as Promise<string>;
  }
}
