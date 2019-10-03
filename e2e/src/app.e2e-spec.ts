import { LoginPage } from './app.po';
import { MainPage } from './app.po';
import { browser, logging } from 'protractor';

describe('socket-chat App', () => {
  let login_page: LoginPage;
  let main_page: MainPage;

  beforeEach(() => {
    login_page = new LoginPage();
    login_page = new MainPage();
  });

  it('should display welcome', () => {
    login_page.navigateTo();
    expect(login_page.getHeadingText()).toEqual('Welcome!');
  });

  it('should display login message', () => {
    login_page.navigateTo();
    expect(login_page.getLoginMessage()).toEqual('Please Log In Below:');
  });

  it('should contain login button', () => {
    login_page.navigateTo();
    expect(login_page.getLoginButton()).getText().toEqual('Login');
  });

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});
