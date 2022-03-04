import { Component, OnInit } from '@angular/core';
import { IcNotesService } from "../ic-notes.service";

@Component({
  selector: 'app-newboard',
  templateUrl: './newboard.component.html',
  styleUrls: ['./newboard.component.scss']
})
export class NewBoardComponent implements OnInit {

  name: string;
  description: string;

  constructor(private icNotesService: IcNotesService) {
    this.name = ''
    this.description = ''
  }

  ngOnInit(): void {
  }

  createBoard() {

  }
}
