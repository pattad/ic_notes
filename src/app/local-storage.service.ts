import { Injectable } from '@angular/core';
import { Board, BoardAccessRequest, Note } from "../declarations/notes/notes.did";
import { IcNotesService } from "./ic-notes.service";

@Injectable({
    providedIn: 'root'
})
export class LocalStorageService {

    private activeNote: Note
    private activeBoard: Board | null

    private boardIds: string[] = []
    private boards: Board[] = []

    private accessRequests: BoardAccessRequest[] = []

    constructor(private icNotesService: IcNotesService) {
        this.activeNote = this.createNewNote()
        this.activeBoard = null
    }

    private createNewNote(): Note {
        var newNote: Note = {
            content: '',
            createdAt: BigInt(new Date().getTime() * 1000000),
            id: BigInt(0),
            isSensitive: false,
            sortOrder: BigInt(0),
            isMarked: false,
            boardId: BigInt(0),
            tags: [],
            title: '',
            updatedAt: BigInt(new Date().getTime() * 1000000),
            createdBy: '',
            updatedBy: ''
        }
        return newNote
    }

    public setNewNote() {
        this.activeNote = this.createNewNote()
    }

    public setActiveNote(note: Note) {
        this.activeNote = note
    }

    public getActiveNote(): Note {
        return this.activeNote
    }

    public getActiveBoard(): Board | null {
        return this.activeBoard
    }

    public async setActiveBoard(value: Board | null) {
        this.activeBoard = value
        this.refreshAccessRequests()
    }

    public refreshAccessRequests() {
        this.accessRequests = []
        if (this.activeBoard != null) {
            this.icNotesService.getAccessRequests(this.activeBoard?.id!).then(requests => {
                this.accessRequests = requests.filter(req => req.status == 'open')
            });
        }
    }

    public updateBoards(board: Board) {
        for (let i = 0; i < this.boards.length; i++) {
            if (this.boards[i].id == board.id) {
                this.boards[i] = board
            }
        }
    }

    public getAccessRequests(): BoardAccessRequest[] {
        return this.accessRequests
    }

    public getBoardIds(): string[] {
        return this.boardIds
    }

    public getBoards(): Board[] {
        return this.boards
    }

    public setBoards(boards: Board[]){
        this.boards = boards
    }

    public checkWriteAccess(principal: string): boolean {
        if (this.getActiveBoard() != null) {
            if (this.getActiveBoard()!.membersWrite.filter(userId => userId == principal).length > 0) {
                return true
            }
            if (this.getActiveBoard()!.admins.filter(userId => userId == principal).length > 0) {
                return true
            }
        } else {
            return true
        }
        return false
    }

}
