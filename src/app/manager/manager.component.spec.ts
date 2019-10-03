import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagerComponent } from './manager.component';

describe('ManagerComponent', () => {
  let component: ManagerComponent;
  let fixture: ComponentFixture<ManagerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManagerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should have no channel after leaving channel', () =>{
    component.leaveChannel();
    expect(component.currentChannel).toBe("");
  });

  it('should have no group after leaving group', () =>{
    component.leaveGroup();
    expect(component.currentGroup).toBe("");
  });

  it('should not be assis after leaving group', () =>{
    component.leaveGroup();
    expect(component.isAssis).toBeFalsy();
  });

  it('should have no messages after clearing', () =>{
    component.clearMessages();
    expect(component.messages.length).toBe(0);
  });
});
