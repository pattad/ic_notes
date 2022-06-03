import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Nat32 "mo:base/Nat32";
import Iter "mo:base/Iter";

import Blob "mo:base/Blob";
import Array "mo:base/Array";
import HttpTypes "../motoko/ext/HttpTypes";

import Memory "mo:base/ExperimentalStableMemory";
import HashMap "mo:base/HashMap";

actor {

    type ImgId = Text;

    private stable var _currentMemoryOffset : Nat32  = 2;
    private stable var _imgOffset : [(ImgId, Nat32)] = [];
    private var imgOffset : HashMap.HashMap<ImgId, Nat32> = HashMap.fromIter(_imgOffset.vals(), 0, Text.equal, Text.hash);
    private stable var _imgSize : [(ImgId, Nat)] = [];
    private var imgSize : HashMap.HashMap<ImgId, Nat> = HashMap.fromIter(_imgSize.vals(), 0, Text.equal, Text.hash);

    // thumbnail handling
    private stable var _thumbs : [(ImgId, Blob)] = [];
    private var thumbs = HashMap.HashMap<ImgId, Blob>(0, Text.equal, Text.hash);

    system func preupgrade() {
        _imgOffset := Iter.toArray(imgOffset.entries());
        _imgSize := Iter.toArray(imgSize.entries());

        _thumbs := Iter.toArray(thumbs.entries());
    };

    system func postupgrade() {
        _imgOffset := [];
        _imgSize := [];

        thumbs := HashMap.fromIter<ImgId, Blob>(_thumbs.vals(), 10, Text.equal, Text.hash);
        _thumbs := [];
    };

    public shared(msg) func uploadImg(imgId : ImgId, image : Blob) {
        storeBlobImg(imgId, image);
    };

    public shared(msg) func uploadThumbnail(imgId : ImgId, thumbnail : Blob) {
        thumbs.put(imgId, thumbnail);
    };

    public query({ caller }) func getImage(id : ImgId): async Blob {
        var pic = loadBlobImg(id);
        switch(pic) {
            case (null) {
                return Blob.fromArray([]);
            };
            case (?existingPic) {
              return existingPic;
            };
        };
   };

    public query({ caller }) func getThumbnail(id : ImgId): async Blob {
        var pic = thumbs.get(id);
        switch(pic) {
            case (null) {
                return Blob.fromArray([]);
            };
            case (?existingPic) {
                 return existingPic;
            };
        };
    };

    private func storeBlobImg(imgId : ImgId, value : Blob)  {
        var size : Nat = Nat32.toNat(Nat32.fromIntWrap(value.size()));
        // Each page is 64KiB (65536 bytes)
        var growBy : Nat = size / 65536 + 1;
        let a = Memory.grow(Nat32.fromNat(growBy));
        Memory.storeBlob(_currentMemoryOffset, value);
        imgOffset.put(imgId, _currentMemoryOffset);
        imgSize.put(imgId, size);
        size := size + 4;
        _currentMemoryOffset += Nat32.fromNat(size);
    };

    private func loadBlobImg(imgId : ImgId) : ?Blob {
        let offset = imgOffset.get(imgId);
        switch(offset) {
            case (null) {
                return null;
            };
            case (?offset) {
              let size = imgSize.get(imgId);
                 switch(size) {
                    case (null) {
                        return null;
                    };
                    case (?size) {
                      return ?Memory.loadBlob(offset, size);
                    };
                };
            };
        };
    };
};