import { Injectable } from '@angular/core';
import { _SERVICE } from "../declarations/imgTank/imgTank.did";
import { Actor, HttpAgent } from "@dfinity/agent";
import { AuthClientWrapper } from "./authClient";
import { idlFactory } from '../declarations/imgTank';
import { isLocalhost } from "./config";

const imgTank = require('src/declarations/imgTank').imgTank;

@Injectable({
    providedIn: 'root'
})
export class IcImgTankService {

    constructor(private authClientWrapper: AuthClientWrapper) {
    }

    public async uploadImg(id: string, image: Uint8Array, thumbnail: Uint8Array) {
        let icActor = await this.getActor();

        const picArr: Array<number> = [...image];
        const thArr: Array<number> = [...thumbnail];

        await icActor.uploadImg(id, picArr)
        await icActor.uploadThumbnail(id, thArr)
    }

    public async getImage(id: string): Promise<Array<number>> {
        let icActor = await this.getActor();
        return await icActor.getImage(id);
    }

    public async getThumbnail(id: string): Promise<Array<number>> {
        let icActor = await this.getActor();
        return await icActor.getThumbnail(id);
    }

    private async getActor() {
        if (isLocalhost) {
            return imgTank;
        } else {
            const identity = await this.authClientWrapper.getIdentity()
            const agent = new HttpAgent({identity});
            console.log('canisterId:' + process.env.IMGTANK_CANISTER_ID);
            let imgTank_actor = Actor.createActor<_SERVICE>(idlFactory, {
                agent,
                canisterId: process.env.IMGTANK_CANISTER_ID as string,
            });
            return imgTank_actor;
        }
    }
}
