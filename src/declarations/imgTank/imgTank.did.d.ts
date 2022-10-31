import type { Principal } from '@dfinity/principal';
export type ImgId = string;
export interface _SERVICE {
  'getImage' : (arg_0: ImgId) => Promise<Array<number>>,
  'getThumbnail' : (arg_0: ImgId) => Promise<Array<number>>,
  'uploadImg' : (arg_0: ImgId, arg_1: Array<number>) => Promise<undefined>,
  'uploadThumbnail' : (arg_0: ImgId, arg_1: Array<number>) => Promise<
      undefined
    >,
}
