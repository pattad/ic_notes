import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type ImgId = string;
export interface _SERVICE {
  'getImage' : ActorMethod<[ImgId], Uint8Array | number[]>,
  'getThumbnail' : ActorMethod<[ImgId], Uint8Array | number[]>,
  'uploadImg' : ActorMethod<[ImgId, Uint8Array | number[]], undefined>,
  'uploadThumbnail' : ActorMethod<[ImgId, Uint8Array | number[]], undefined>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
