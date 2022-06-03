import { Component, OnInit } from '@angular/core';
import { Note } from "../../declarations/notes/notes.did";
import { IcNotesService } from "../ic-notes.service";
import { Router } from "@angular/router";
import { LocalStorageService } from "../local-storage.service";
import { NgxSpinnerService } from "ngx-spinner";
import { AuthClientWrapper } from "../authClient";
import { Location } from '@angular/common'
import { DataUrl, NgxImageCompressService } from "ngx-image-compress";
import { IcImgTankService } from "../ic-imgTank.service";
import { v4 as uuidv4 } from 'uuid';

@Component({
    selector: 'app-editImg',
    templateUrl: './editImg.component.html',
    styleUrls: ['./editImg.component.scss']
})
export class EditImgComponent implements OnInit {

    title: string
    tags: string

    editTitle: boolean = false
    editTags: boolean = false

    hasWriteAccess: boolean = false

    image: Uint8Array = new Uint8Array
    thumbnailImage: Uint8Array = new Uint8Array

    note: Note;

    showError: boolean = false

    constructor(private icNotesService: IcNotesService,
                private localStorageService: LocalStorageService,
                private spinner: NgxSpinnerService,
                private authClientWrapper: AuthClientWrapper,
                private router: Router,
                private location: Location,
                private icImgService: IcImgTankService,
                private imageCompressService: NgxImageCompressService) {
        this.note = this.localStorageService.getActiveNote()
        this.title = this.note.title
        this.tags = ''
        this.note.tags.forEach(tag => this.tags = this.tags += ' #' + tag)

        if (!this.isNewNote()) {
            icImgService.getImage(this.note.content.substr(6,36)).then(imgArray => {
                this.image = new Uint8Array(imgArray);
                const imgTag = document.getElementById("img_large") as HTMLImageElement
                imgTag.setAttribute("src", this.fileToImgSrc(this.image))
            })
        }

        this.authClientWrapper.getIdentity().then(res => {
            if (res?.getPrincipal()) {
                this.hasWriteAccess = this.localStorageService.checkWriteAccess(res!.getPrincipal().toString())
            }
        })

    }

    ngOnInit(): void {
    }

    async selectFile(event: any) {
        this.showError = false
        var file: File
        var localUrl: DataUrl
        file = event.target.files[0]
        this.image = await file.arrayBuffer().then(tb => new Uint8Array(tb))

        const imgTag = document.getElementById("img_large") as HTMLImageElement

        imgTag.setAttribute("src", this.fileToImgSrc(this.image))

        if (event.target.files && event.target.files[0]) {
            var reader = new FileReader();
            reader.onload = (event: any) => {
                localUrl = event.target.result;
                this.compressFile(localUrl)
            }
            reader.readAsDataURL(event.target.files[0]);
        }
    }

    compressFile(image: DataUrl) {
        var orientation = -1;
        console.info('Size in bytes is now:', this.imageCompressService.byteCount(image));
        this.imageCompressService.compressFile(image, orientation, 50, 85, 150, 150).then(
            imgResultAfterCompress => {
                console.info('Size in bytes after compression:', this.imageCompressService.byteCount(imgResultAfterCompress));
                this.thumbnailImage = this.dataURItoUint8(imgResultAfterCompress.split(',')[1]);
            });
        this.imageCompressService.compressFile(image, orientation, 50, 95, 1024, 1024).then(
            imgResultAfterCompress => {
                console.info('Size in bytes after compression:', this.imageCompressService.byteCount(imgResultAfterCompress));
                this.image = this.dataURItoUint8(imgResultAfterCompress.split(',')[1])
                // IC max post size is 2MB
                if (this.image.byteLength > 2000000) {
                    this.showError = true
                }
            });
    }

    dataURItoUint8(dataURI: DataUrl) {
        const byteString = window.atob(dataURI);
        const arrayBuffer = new ArrayBuffer(byteString.length);
        const int8Array = new Uint8Array(arrayBuffer);
        for (let i = 0; i < byteString.length; i++) {
            int8Array[i] = byteString.charCodeAt(i);
        }
        return int8Array
    }

    fileToImgSrc(file: Uint8Array): string {
        const picBlob = new Blob([file]);
        return URL.createObjectURL(picBlob);
    }

    async updateNote() {
        this.spinner.show()

        this.saveTitle()
        this.saveTags()

        if (this.note.id != BigInt(0)) {
            setTimeout(() => {
                this.spinner.hide();
            }, 800);
            if (this.localStorageService.getActiveBoard() == null) {
                this.icNotesService.updateNote(this.note.id, this.note.title, this.note.content, this.note.tags)
                this.router.navigate(['/home'])
            } else {
                this.icNotesService.updateNoteOfBoard(this.localStorageService.getActiveBoard()!.id, this.note.id, this.note.title, this.note.content, this.note.tags).then(res => {
                    this.icNotesService.getBoard(this.localStorageService.getActiveBoard()!.id).then(board => {
                        this.localStorageService.setActiveBoard(board)
                        this.localStorageService.updateBoards(board)
                    })
                })
                this.router.navigate(['/board', this.localStorageService.getActiveBoard()!.id])
            }
        } else {
            let uuid = uuidv4();

            await this.icImgService.uploadImg(uuid, this.image, this.thumbnailImage)

            this.note.content = 'imgid:' + uuid + '/' + process.env.IMGTANK_CANISTER_ID

            if (this.localStorageService.getActiveBoard() == null) {
                this.icNotesService.addNote(this.note.title, this.note.content, this.note.tags).then(
                    res => {
                        this.spinner.hide()
                        this.router.navigate(['/home'])
                    }
                )
            } else {
                this.icNotesService.addNoteToBoard(this.localStorageService.getActiveBoard()!.id, this.note.title, this.note.content, []).then(res => {
                    this.icNotesService.getBoard(this.localStorageService.getActiveBoard()!.id).then(board => {
                        this.localStorageService.setActiveBoard(board)
                        this.localStorageService.updateBoards(board)
                        this.spinner.hide()
                        this.router.navigate(['/board', this.localStorageService.getActiveBoard()!.id])
                    })
                })
            }
        }
    }

    saveTitle() {
        this.note.title = this.title
        this.editTitle = false
    }

    saveTags() {
        this.note.tags = []
        let tmpTags = this.tags.replace(/#/g, '').replace(/,/g, '').split(' ')
        tmpTags.forEach(tag => {
            if (tag.trim().length > 0) this.note.tags = this.note.tags.concat([tag.trim()]);
        })

        // make it unique
        this.note.tags = [...new Set(this.note.tags)]

        this.tags = ''
        this.note.tags.forEach(tag => this.tags = this.tags += ' #' + tag)

        this.editTags = false
    }

    onTagChange() {
        let tmpTags = this.tags.trim().replace(/#/g, '').replace(/,/g, '').split(' ')
        let tmpTags2 = ''
        tmpTags.forEach(tag => {
                if (tag.trim().length > 0) tmpTags2 = tmpTags2 += ' #' + tag.trim();
            }
        )
        this.tags = tmpTags2
    }

    number(number: BigInt): number {
        return parseInt(number.toString())
    }

    isNewNote(): boolean {
        return this.note.id == BigInt(0)
    }

    navigateBack() {
        this.location.back()
    }

    focusOn(id: string) {
        document.getElementById(id)?.focus()
    }

    eTitle() {
        this.editTitle = true
        setTimeout(() => {
            this.focusOn('title')
        }, 100);
    }

    eTags() {
        this.editTags = true
        setTimeout(() => {
            this.focusOn('tags')
        }, 100);
    }

}
