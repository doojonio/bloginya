import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentDomComponent } from './document-dom.component';

describe('DocumentDomComponent', () => {
  let component: DocumentDomComponent;
  let fixture: ComponentFixture<DocumentDomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentDomComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentDomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
