import { Component, OnInit } from '@angular/core';
import { IcNotesService } from "../ic-notes.service";
import { AuthClientWrapper } from "../authClient";
import { Note } from "../../declarations/notes/notes.did";
import { isLocalhost } from "../config";
import { NavigationStart, Router } from "@angular/router";
import { LocalStorageService } from "../local-storage.service";
import { NgxSpinnerService } from "ngx-spinner";
import { IcImgTankService } from "../ic-imgTank.service";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

    content: string = ''
    title: string = ''
    isNewNote: boolean = true
    boardId: string = ''

    id: bigint = BigInt(0)

    notes: Note[] = []

    filteredNotes: Note[] = []

    filterByTag: string = ''

    tags = new Set<string>()

    loaded: boolean = false

    sortedBy: string = 'updated'

    hasWriteAccess: boolean = true

    constructor(private icNotesService: IcNotesService,
                private authClientWrapper: AuthClientWrapper,
                private spinner: NgxSpinnerService,
                private localStorageService: LocalStorageService,
                private router: Router,
                private icImgService: IcImgTankService,
                private domSanitizer: DomSanitizer) {

        this.boardId = ''

        if (router.url.indexOf('board/') != -1) {
            this.boardId = router.url.substr(router.url.indexOf('board/') + 6)
            console.info(this.boardId)
        }

        this.router.events.subscribe(event => {
            if (event instanceof NavigationStart) {
                console.info(event)
                this.boardId = ''
                if (event.url.indexOf('board/') != -1) {
                    this.boardId = event.url.substr(event.url.indexOf('board/') + 6)
                    console.info(this.boardId)
                    this.init()
                }
            }
        });

        if (this.authClientWrapper.authClient) {
            if (this.isLoggedIn()) {
                this.init()
            }
        } else {
            this.authClientWrapper.create().then(res => {
                    if (this.isLoggedIn()) {
                        this.init()
                    }
                }
            )
        }
    }

    init() {
        console.info('loading boards...')
        this.icNotesService.getBoards().then(boards => {
            this.localStorageService.setBoards(boards)
            console.info('boardId: ' + this.boardId)
            if (this.boardId.length > 0) {
                console.info(boards)
                for (var board of boards) {
                    if (board.id == this.boardId) {
                        console.info('activating board: ' + board.id)
                        this.localStorageService.setActiveBoard(board)
                    }
                }
                if (this.localStorageService.getActiveBoard()?.id != this.boardId) {
                    if (this.localStorageService.getBoardIds().filter(id => id == this.boardId).length == 0) {
                        // user not permitted for board --> request access
                        this.localStorageService.setActiveBoard(null)
                        this.router.navigate(['/reqAcc', this.boardId])
                        return
                    }
                }
            }

            if (this.localStorageService.getActiveBoard() != null) {
                this.refreshNotesOfBoard()
            } else {
                this.getNotes()
            }
        })

    }

    isLoggedIn() {
        return this.authClientWrapper.isLoggedIn;
    }

    getNotes() {
        this.icNotesService.getNotes().then(value => {
            this.notes = value
            let activeNote = this.localStorageService.getActiveNote()
            if (activeNote.id != BigInt(0)) {
                this.fastUpdate(activeNote)
            }
            this.updateTags()
            this.setFilterByTag(this.filterByTag)
            this.loadImages()
            this.loaded = true
        })
    }

    refreshNotesOfBoard() {
        this.notes = this.localStorageService.getActiveBoard()?.notes!
        let activeNote = this.localStorageService.getActiveNote()
        if (activeNote.id != BigInt(0)) {
            this.fastUpdate(activeNote)
        }
        this.updateTags()
        this.setFilterByTag(this.filterByTag)

        this.authClientWrapper.getIdentity().then(res => {
            if (res?.getPrincipal()) {
                this.hasWriteAccess = this.localStorageService.checkWriteAccess(res!.getPrincipal().toString())
            }
        })

        this.loadImages()
        this.loaded = true
    }

    addNote() {
        this.spinner.show()
        setTimeout(() => {
            this.spinner.hide();
        }, 800);
        this.removeFilter()
        let content = '<p>' + this.content.replace(/\r\n|\r|\n/g, '<br>') + '</p>'
        let tmpNote: Note[] = [{
            content: content,
            createdAt: BigInt(new Date().getTime() * 1000000),
            id: BigInt(0),
            isSensitive: false,
            isMarked: false,
            sortOrder: BigInt(0),
            boardId: BigInt(0),
            tags: [],
            title: this.title,
            updatedAt: BigInt(0),
            createdBy: '',
            updatedBy: ''
        }]

        this.filteredNotes = tmpNote.concat(this.notes)

        if (this.localStorageService.getActiveBoard() == null) {
            this.icNotesService.addNote(this.title, content, []).then(res => {
                this.getNotes()
            })
        } else {
            this.icNotesService.addNoteToBoard(this.localStorageService.getActiveBoard()!.id, this.title, content, []).then(res => {
                this.icNotesService.getBoard(this.localStorageService.getActiveBoard()!.id).then(board => {
                    this.localStorageService.setActiveBoard(board)
                    this.localStorageService.updateBoards(board)
                    this.refreshNotesOfBoard()
                })
            })
        }
        this.resetFields();
    }

    fastUpdate(updatedNote: Note) {
        this.notes.forEach(note => {
            if (note.id == updatedNote.id) {
                note.title = updatedNote.title
                note.content = updatedNote.content
                note.tags = updatedNote.tags
                note.updatedAt = BigInt(new Date().getTime() * 1000000)
            }
        })
        this.filteredNotes.forEach(note => {
            if (note.id == updatedNote.id) {
                note.title = updatedNote.title
                note.content = updatedNote.content
                note.tags = updatedNote.tags
                note.updatedAt = BigInt(new Date().getTime() * 1000000)
            }
        })
    }

    editNote(noteId: bigint) {
        if (noteId > 0) {
            let activeNote = this.notes.filter(note => note.id == noteId)[0]
            this.localStorageService.setActiveNote(activeNote)
            if (activeNote.content.startsWith('imgid:')) {
                this.router.navigate(['/editImg'])
            } else {
                this.router.navigate(['/edit'])
            }
        }
    }

    deleteNote(noteId: bigint) {
        this.notes = this.notes.filter(note => note.id != noteId)
        this.filteredNotes = this.filteredNotes.filter(note => note.id != noteId)

        if (this.localStorageService.getActiveBoard() == null) {
            this.icNotesService.deleteNote(noteId).then(res => {
                this.getNotes()
            })
        } else {
            this.icNotesService.deleteNoteOfBoard(this.localStorageService.getActiveBoard()?.id!, noteId).then(board => {
                this.localStorageService.setActiveBoard(board)
                this.localStorageService.updateBoards(board)
            })
        }

        this.resetFields();
    }

    login() {
        if (isLocalhost) {
            this.authClientWrapper.isLoggedIn = true;
            this.init()
        } else {
            this.authClientWrapper.login().then(res => {
                console.info('identity: ')
                console.info(res)
                console.info('principal: ' + res?.getPrincipal().toString())
                if (res) {
                    this.init()
                }
            });
        }
    }

    getCachedImage(id: string): SafeUrl | undefined {
        return this.localStorageService.cachedImages.get(id)
    }

    loadImages() {
        this.filteredNotes.forEach(note => {
            if (note.content.startsWith('imgid:')) {
                const imgId = note.content.substr(6, 36)
                if (!this.localStorageService.cachedImages.has(imgId)) {
                    this.icImgService.getThumbnail(imgId).then(imgArray => {
                        const safeUrl = this.domSanitizer.bypassSecurityTrustUrl(this.fileToImgSrc(new Uint8Array(imgArray)))
                        this.localStorageService.cachedImages.set(imgId, safeUrl)
                    })
                }
            }
        })
    }

    fileToImgSrc(file: Uint8Array): string {
        const picBlob = new Blob([file]);
        return URL.createObjectURL(picBlob);
    }

    private resetFields() {
        this.title = ''
        this.content = ''
        this.id = BigInt(0)
        this.isNewNote = true
    }

    number(number: BigInt):
        number {
        return parseInt(number.toString())
    }

    tagsToString(tags: string[]):
        string {
        let tagString = ''
        tags.forEach(tag => tagString = tagString += ' #' + tag)
        return tagString
    }

    updateTags() {
        this.notes.forEach(note => {
            note.tags.forEach(tag => this.tags.add(tag))
        })
    }

    setFilterByTag(tag: string) {
        this.filterByTag = tag
        if (tag.length > 0) {
            this.filteredNotes = this.notes.filter(note => new Set(note.tags).has(tag))
        } else {
            this.filteredNotes = this.notes
        }
        this.sortNotes()
    }

    removeFilter() {
        this.setFilterByTag('')
    }

    public async addNoteFull() {
        this.localStorageService.setNewNote()
        this.router.navigate(['/edit'])
    }

    public async addImageNote() {
        this.localStorageService.setNewNote()
        this.router.navigate(['/editImg'])
    }

    sortBy(attribute: string) {
        this.sortedBy = attribute
        this.sortNotes()
    }

    sortNotes() {
        if (this.sortedBy == 'updated') {
            this.filteredNotes.sort((a, b) => a.updatedAt < b.updatedAt ? 1 : -1)
        } else if (this.sortedBy == 'created') {
            this.filteredNotes.sort((a, b) => a.createdAt < b.createdAt ? 1 : -1)
        }
    }

    ngOnInit(): void {
    }
}
