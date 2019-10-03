import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoginComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  
  it('should report when all fields are not filled', () => {
    expect(component.allFieldsFilled()).toBeTruthy();
  });

  it('should report when all fields are filled', () => {
    component.username = "test";
    component.password = "test";
    component.email = "test@test.test";
    expect(component.allFieldsFilled()).toBeTruthy();
  });
});
