import Map "mo:base/HashMap";
import Text "mo:base/Text";
import Array "mo:base/Array";
import Iter "mo:base/Iter";

import Time "mo:base/Time";
import Int "mo:base/Int";
import Nat "mo:base/Nat";
import Bool "mo:base/Bool";
import Option "mo:base/Option";
import Result "mo:base/Result";

import Principal "mo:base/Principal";


shared({ caller = initializer }) actor class() {

    type PrincipalName = Text;
    type BoardId = Text;

    public type Note = {
        id : Int;
        title : Text;
        tags : [Text];
        boardId : Int;
        content : Text;
        isSensitive : Bool;
        isMarked : Bool;
        sortOrder : Int;
        createdAt : Int;
        updatedAt : Int;
        createdBy : PrincipalName;
        updatedBy : PrincipalName;
    };

    public type Board = {
        id : BoardId;
        name : Text;
        description : Text;
        admins : [PrincipalName];
        membersWrite : [PrincipalName];
        membersRead : [PrincipalName];
        notes : [Note];
        isPrivate : Bool;
        createdAt : Int;
        updatedAt : Int;
    };

    public type BoardAccessRequest = {
        id : Int;
        boardId : BoardId;
        user : PrincipalName;
        accessGranted : Bool;
        grantedByUser : PrincipalName;
        createdAt : Int;
        updatedAt : Int;
    };

    private stable var nextNoteId : Nat = 1;

    // contains default notes of user that are not linked to a board
    private stable var stable_notesByUser : [(PrincipalName, [Note])] = [];
    private var notesByUser = Map.HashMap<PrincipalName, [Note]>(0, Text.equal, Text.hash);

    private stable var stable_boardsById : [(BoardId, Board)] = [];
    private var boardsById = Map.HashMap<BoardId, Board>(0, Text.equal, Text.hash);

    private stable var stable_boardsByUsers : [(PrincipalName, [BoardId])] = [];
    private var boardsByUsers = Map.HashMap<PrincipalName, [BoardId]>(0, Text.equal, Text.hash);

    public type CommonError = {
        #duplicate_id : Text;
        #board_not_found : Text;
        #not_authorized : Text;
        #other : Text;
    };

    public shared({ caller }) func createBoard(boardId: BoardId, name : Text, description : Text, isPrivate : Bool): async Result.Result<Board, CommonError>  {
        let principalName = Principal.toText(caller);

        let board : Board = {id = boardId; name = name;
            description = description; createdAt = Time.now();
            updatedAt = Time.now(); notes = []; isPrivate = isPrivate;
            admins = [principalName]; membersWrite = []; membersRead = []};

        switch(boardsById.get(boardId)) {
            case (null) {
                boardsById.put(boardId, board);
            };
            case (?existing) {
                 return #err(#duplicate_id("duplicate board id"));
            };
        };

        return #ok(board);
    };

    public shared({ caller }) func addNoteToBoard(boardId: BoardId, title : Text, content : Text, tags : [Text]): async Result.Result<Note, CommonError> {
        let principalName = Principal.toText(caller);

        let note : Note = {id = nextNoteId; title = title;
            content = content; createdAt = Time.now();
            updatedAt = Time.now(); boardId = 0; tags = tags; isSensitive = false;
            isMarked = false; sortOrder = 0;
            createdBy = principalName; updatedBy = principalName};

        nextNoteId += 1;

        var board = boardsById.get(boardId);

        switch(board) {
            case (null) {
                #err(#board_not_found("board doesn't exist"));
            };
            case (?existingBoard) {

                func identity(x : PrincipalName): Bool { x == principalName };
                if(Option.isSome(Array.find<Text>(existingBoard.admins, identity)) or
                    Option.isSome(Array.find<Text>(existingBoard.membersWrite, identity))) {

                     let notes = Array.append<Note>([note], existingBoard.notes);

                     let board : Board = {id = existingBoard.id; name = existingBoard.name;
                                 description = existingBoard.description; createdAt = existingBoard.createdAt;
                                 updatedAt = Time.now(); notes = notes; isPrivate = existingBoard.isPrivate;
                                 admins = existingBoard.admins; membersWrite = existingBoard.membersWrite; membersRead = existingBoard.membersRead};

                     boardsById.put(boardId, board);
                     #ok(note);
                } else {
                    #err(#not_authorized("user not authorized"));
                };
            };
        };
    };

    public shared({ caller }) func updateNoteOfBoard(boardId: BoardId, noteId : Int, title: Text, content : Text, tags : [Text]): async () {

    };

    public shared({ caller }) func deleteNoteOfBoard(boardId: BoardId, noteId : Int): async () {

    };

    public shared({ caller }) func addNote(title : Text, content : Text, tags : [Text]): async () {
        let principalName = Principal.toText(caller);

        let note : Note = {id = nextNoteId; title = title;
            content = content; createdAt = Time.now();
            updatedAt = Time.now(); boardId = 0; tags = tags; isSensitive = false;
            isMarked = false; sortOrder = 0;
            createdBy = principalName; updatedBy = principalName};

        nextNoteId += 1;

        var notesOfUser = notesByUser.get(principalName);

        switch(notesOfUser) {
            case (null) {
                var notes : [Note] = [];
                notes := Array.append<Note>([note], notes);
                notesByUser.put(principalName, notes);
            };
            case (?existingNotes) {
                 var notes = Array.append<Note>([note], existingNotes);
                 notesByUser.put(principalName, notes);
            };
        };
    };

    public query({ caller }) func getNotes() : async [Note] {
        let principalName = Principal.toText(caller);
        var notesOfUser = notesByUser.get(principalName);

        switch(notesOfUser) {
            case (null) {
                var notes : [Note] = [];
                return notes;
            };
            case (?existingNotes) {
                 return existingNotes;
            };
        };
    };

    public shared({ caller }) func updateNote(id : Int, title: Text, content : Text, tags : [Text]): async () {
        let principalName = Principal.toText(caller);
        var notesOfUser = notesByUser.get(principalName);


        switch(notesOfUser) {
            case (null) {};
            case (?existingNotes) {
                    var updatedNotes = Array.map<Note,Note>(existingNotes, func (note : Note) : Note {
                        if (note.id == id) {
                            return {
                                id = note.id; title = title;
                                            content = content; createdAt = note.createdAt;
                                            updatedAt = Time.now(); boardId = note.boardId; tags = tags;
                                            isSensitive = note.isSensitive;
                                            isMarked = note.isMarked;
                                            sortOrder = note.sortOrder;
                                            createdBy = note.createdBy;
                                            updatedBy = note.updatedBy;
                            };
                        };
                        note
                    });
                notesByUser.put(principalName, updatedNotes);
            };
        };
    };


    public shared({ caller }) func deleteNote(id : Int): async () {
        let principalName = Principal.toText(caller);
        var notesOfUser = notesByUser.get(principalName);

        var updatedNotes : [Note] = [];

        switch(notesOfUser) {
            case (null) {};
            case (?existingNotes) {
                for(note : Note in existingNotes.vals()){
                    if (note.id != id) {
                        updatedNotes := Array.append<Note>(updatedNotes, [note]);
                    };
                };
            };
        };

        notesByUser.put(principalName, updatedNotes);
    };

    public shared({ caller }) func whoami() : async Text {
        return Principal.toText(caller);
    };

    public func notesCnt() : async Nat {
        return nextNoteId;
    };

    public func userCnt() : async Nat {
        return notesByUser.size();
    };

    system func preupgrade() {
         stable_notesByUser := Iter.toArray(notesByUser.entries());
         stable_boardsById := Iter.toArray(boardsById.entries());
         stable_boardsByUsers := Iter.toArray(boardsByUsers.entries());
    };

    system func postupgrade() {
        notesByUser := Map.fromIter<PrincipalName, [Note]>(stable_notesByUser.vals(), 10, Text.equal, Text.hash);
        stable_notesByUser := [];

        boardsById := Map.fromIter<BoardId, Board>(stable_boardsById.vals(), 10, Text.equal, Text.hash);
        stable_boardsById := [];

        boardsByUsers := Map.fromIter<PrincipalName, [BoardId]>(stable_boardsByUsers.vals(), 10, Text.equal, Text.hash);
        stable_boardsByUsers := [];
    };
};
