export const idlFactory = ({ IDL }) => {
  const ImgId = IDL.Text;
  return IDL.Service({
    'getImage' : IDL.Func([ImgId], [IDL.Vec(IDL.Nat8)], ['query']),
    'getThumbnail' : IDL.Func([ImgId], [IDL.Vec(IDL.Nat8)], ['query']),
    'uploadImg' : IDL.Func([ImgId, IDL.Vec(IDL.Nat8)], [], ['oneway']),
    'uploadThumbnail' : IDL.Func([ImgId, IDL.Vec(IDL.Nat8)], [], ['oneway']),
  });
};
export const init = ({ IDL }) => { return []; };
