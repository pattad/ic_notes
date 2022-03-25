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
        icon : ?Blob;
        isPrivate : Bool;
        createdAt : Int;
        updatedAt : Int;
    };

    public type BoardAccessRequest = {
        id : Int;
        boardId : BoardId;
        user : PrincipalName;
        displayName: Text;
        status: Text;
        grantedByUser : ?PrincipalName;
        createdAt : Int;
        updatedAt : Int;
    };

    private stable var nextNoteId : Nat = 1;
    private stable var nextRequestId : Nat = 1;

    // contains default notes of user that are not linked to a board
    private stable var stable_notesByUser : [(PrincipalName, [Note])] = [];
    private var notesByUser = Map.HashMap<PrincipalName, [Note]>(0, Text.equal, Text.hash);

    private stable var stable_boardsById : [(BoardId, Board)] = [];
    private var boardsById = Map.HashMap<BoardId, Board>(0, Text.equal, Text.hash);

    private stable var stable_boardsByUsers : [(PrincipalName, [BoardId])] = [];
    private var boardsByUsers = Map.HashMap<PrincipalName, [BoardId]>(0, Text.equal, Text.hash);

    private stable var stable_requestsByBoard : [(BoardId, [BoardAccessRequest])] = [];
    private var requestsByBoard = Map.HashMap<BoardId, [BoardAccessRequest]>(0, Text.equal, Text.hash);

    private stable var stable_userNames : [(PrincipalName, Text)] = [];
    private var userNames = Map.HashMap<PrincipalName, Text>(0, Text.equal, Text.hash);

    public type CommonError = {
        #duplicate_id : Text;
        #board_not_found : Text;
        #not_authorized : Text;
        #other : Text;
    };

    public shared({ caller }) func requestAccess(boardId : BoardId, displayName : Text): async ()  {
        let principalName = Principal.toText(caller);

        let request : BoardAccessRequest = {id = nextRequestId; boardId = boardId;
            user = principalName;
            displayName = displayName;
            status = "open";
            grantedByUser = null;
            createdAt = Time.now();
            updatedAt = Time.now()};

        nextRequestId += 1;

        var requests = requestsByBoard.get(boardId);

        switch(requests) {
            case (null) {
                var requests : [BoardAccessRequest] = [];
                requests := Array.append<BoardAccessRequest>([request], requests);
                requestsByBoard.put(boardId, requests);
            };
            case (?existingRequests) {
                var requests = Array.append<BoardAccessRequest>([request], existingRequests);
                requestsByBoard.put(boardId, requests);
            };
        };

        userNames.put(principalName, displayName);
    };

    public query({ caller }) func getAccessRequests(boardId : BoardId): async Result.Result<[BoardAccessRequest], CommonError>   {
        let principalName = Principal.toText(caller);

        var requests = requestsByBoard.get(boardId);

        switch(requests) {
            case (null) {
                #ok([]);
            };
            case (?existingRequests) {
                #ok(existingRequests);
            };
        };
    };

    public shared({ caller }) func grantAccessRequest(boardId : BoardId, requestId : Int, permission : Text, status : Text): async Result.Result<(), CommonError>   {
        let principalName = Principal.toText(caller);

        var board = boardsById.get(boardId);

        switch(board) {
            case (null) {
                #err(#board_not_found("board doesn't exist"));
            };
            case (?existingBoard) {

                func identity(x : PrincipalName): Bool { x == principalName };
                if(Option.isSome(Array.find<Text>(existingBoard.admins, identity))) {

                    var requests = requestsByBoard.get(boardId);
                    switch(requests) {
                        case (null) {
                            #err(#other("no requests found"));
                        };
                        case (?existingRequests) {

                            var user : ?PrincipalName = null;

                            var updatedRequest = Array.map<BoardAccessRequest,BoardAccessRequest>(existingRequests, func (req : BoardAccessRequest) : BoardAccessRequest {
                                if (req.id == requestId) {
                                    user := ?req.user;
                                    return  {id = req.id; boardId = req.boardId;
                                                       user = req.user;
                                                       displayName = req.displayName;
                                                       status = status;
                                                       grantedByUser = ?principalName;
                                                       createdAt = req.createdAt;
                                                       updatedAt = Time.now()};
                                };
                                req
                            });
                            requestsByBoard.put(boardId, updatedRequest);

                            if(status == "granted") {
                                switch(user) {
                                    case (?exsistingUser) {

                                        switch(permission) {
                                             case ("admin") {
                                                var updatedUsers = Array.append<PrincipalName>([exsistingUser], existingBoard.admins);
                                                let board : Board = {id = existingBoard.id; name = existingBoard.name; icon = null;
                                                            description = existingBoard.description; createdAt = existingBoard.createdAt;
                                                            updatedAt = Time.now(); notes = existingBoard.notes; isPrivate = existingBoard.isPrivate;
                                                            admins = updatedUsers; membersWrite = existingBoard.membersWrite; membersRead = existingBoard.membersRead};
                                                boardsById.put(boardId, board);
                                                addBoardToUser(existingBoard.id,exsistingUser);
                                                #ok();
                                             };
                                            case ("read") {
                                                var updatedUsers = Array.append<PrincipalName>([exsistingUser], existingBoard.membersRead);
                                                let board : Board = {id = existingBoard.id; name = existingBoard.name; icon = null;
                                                            description = existingBoard.description; createdAt = existingBoard.createdAt;
                                                            updatedAt = Time.now(); notes = existingBoard.notes; isPrivate = existingBoard.isPrivate;
                                                            admins = existingBoard.admins; membersWrite = existingBoard.membersWrite; membersRead = updatedUsers};
                                                boardsById.put(boardId, board);
                                                addBoardToUser(existingBoard.id,exsistingUser);
                                                #ok();
                                             };
                                              case ("write") {
                                                 var updatedUsers = Array.append<PrincipalName>([exsistingUser], existingBoard.membersWrite);
                                                 let board : Board = {id = existingBoard.id; name = existingBoard.name; icon = null;
                                                             description = existingBoard.description; createdAt = existingBoard.createdAt;
                                                             updatedAt = Time.now(); notes = existingBoard.notes; isPrivate = existingBoard.isPrivate;
                                                             admins = existingBoard.admins; membersWrite = updatedUsers; membersRead = existingBoard.membersRead};
                                                 boardsById.put(boardId, board);
                                                 addBoardToUser(existingBoard.id,exsistingUser);
                                                 #ok();
                                              };
                                              case(_) {
                                                #err(#other("invalid permission requested"));
                                              };
                                        };
                                    };
                                    case(_) {
                                       #err(#other("request no found"));
                                    };
                               };
                           } else {
                             #ok();
                           };
                        };
                    };
                } else {
                    #err(#not_authorized("user not authorized"));
                };

            };
        };
    };

    public query({ caller }) func getBoardIdsOfUser(): async Result.Result<[BoardId], CommonError>  {
        let principalName = Principal.toText(caller);

        var boardIds = boardsByUsers.get(principalName);
        switch(boardIds){
            case (null) {
                    #ok([]);
            };
            case (?existingBoardIds) {
                #ok(existingBoardIds);
            };
        };

    };

    public query({ caller }) func getBoard(boardId: BoardId): async Result.Result<Board, CommonError>  {
        let principalName = Principal.toText(caller);

        var board = boardsById.get(boardId);

        switch(board) {
            case (null) {
                #err(#board_not_found("board doesn't exist"));
            };
            case (?existingBoard) {

                func identity(x : PrincipalName): Bool { x == principalName };
                if(Option.isSome(Array.find<Text>(existingBoard.admins, identity)) or
                    Option.isSome(Array.find<Text>(existingBoard.membersWrite, identity)) or
                    Option.isSome(Array.find<Text>(existingBoard.membersRead, identity))) {

                     #ok(existingBoard);
                } else {
                    #err(#not_authorized("user not authorized"));
                };
            };
        };
    };

    public query({ caller }) func getBoards(): async Result.Result<[Board], CommonError>  {
           let principalName = Principal.toText(caller);

           var boards : [Board] = [];

           var boardIds = boardsByUsers.get(principalName);
           switch(boardIds){
               case (null) {
                       // ignore
               };
               case (?existingBoardIds) {

                    for (i in Iter.range(0, existingBoardIds.size() - 1)) {

                        var board = boardsById.get(existingBoardIds[i]);
                        switch(board) {
                            case (null) {
                                // ignore
                            };
                            case (?existingBoard) {
                                boards := Array.append<Board>(boards, [existingBoard]);
                            };
                        };
                    };
               };
           };
           #ok(boards);
        };

    private func addBoardToUser(boardId: BoardId, user: PrincipalName) {

        var boardIds = boardsByUsers.get(user);

        switch(boardIds) {
            case (null) {
                boardsByUsers.put(user,[boardId]);
            };
            case (?existingIds) {
                var updatedIds = Array.append<PrincipalName>([boardId], existingIds);
                boardsByUsers.put(user,updatedIds);
            };
          };

    };


    public shared({ caller }) func createBoard(boardId: BoardId, name : Text, description : Text, isPrivate : Bool): async Result.Result<Board, CommonError>  {
        let principalName = Principal.toText(caller);

        let board : Board = {id = boardId; name = name;
            description = description; createdAt = Time.now(); icon = null;
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

        addBoardToUser(boardId,principalName);
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

                     let board : Board = {id = existingBoard.id; name = existingBoard.name; icon = existingBoard.icon;
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

    public shared({ caller }) func updateNoteOfBoard(boardId: BoardId, noteId : Int, title: Text, content : Text, tags : [Text]): async Result.Result<(), CommonError> {
        let principalName = Principal.toText(caller);

        var board = boardsById.get(boardId);

           switch(board) {
               case (null) {
                   #err(#board_not_found("board doesn't exist"));
               };
               case (?existingBoard) {

                    func identity(x : PrincipalName): Bool { x == principalName };
                    if(Option.isSome(Array.find<Text>(existingBoard.admins, identity)) or
                        Option.isSome(Array.find<Text>(existingBoard.membersWrite, identity))) {

                        var updatedNotes = Array.map<Note,Note>(existingBoard.notes, func (note : Note) : Note {
                            if (note.id == noteId) {
                                return {
                                    id = note.id; title = title;
                                                content = content; createdAt = note.createdAt;
                                                updatedAt = Time.now(); boardId = note.boardId; tags = tags;
                                                isSensitive = note.isSensitive;
                                                isMarked = note.isMarked;
                                                sortOrder = note.sortOrder;
                                                createdBy = note.createdBy;
                                                updatedBy = principalName;
                                };
                            };
                            note
                        });

                         let board : Board = {id = existingBoard.id; name = existingBoard.name; icon = existingBoard.icon;
                                     description = existingBoard.description; createdAt = existingBoard.createdAt;
                                     updatedAt = Time.now(); notes = updatedNotes; isPrivate = existingBoard.isPrivate;
                                     admins = existingBoard.admins; membersWrite = existingBoard.membersWrite; membersRead = existingBoard.membersRead};

                         boardsById.put(boardId, board);
                         #ok();
                    } else {
                        #err(#not_authorized("user not authorized"));
                    };

               };
           };
    };

    public shared({ caller }) func deleteNoteOfBoard(boardId: BoardId, noteId : Int): async Result.Result<Board, CommonError>  {
        let principalName = Principal.toText(caller);

        var board = boardsById.get(boardId);

           switch(board) {
               case (null) {
                   #err(#board_not_found("board doesn't exist"));
               };
               case (?existingBoard) {

                    func identity(x : PrincipalName): Bool { x == principalName };
                    if(Option.isSome(Array.find<Text>(existingBoard.admins, identity)) or
                        Option.isSome(Array.find<Text>(existingBoard.membersWrite, identity))) {

                        var updatedNotes : [Note] = [];

                        for(note : Note in existingBoard.notes.vals()){
                            if (note.id != noteId) {
                                updatedNotes := Array.append<Note>(updatedNotes, [note]);
                            };
                        };

                         let board : Board = {id = existingBoard.id; name = existingBoard.name; icon = existingBoard.icon;
                                     description = existingBoard.description; createdAt = existingBoard.createdAt;
                                     updatedAt = Time.now(); notes = updatedNotes; isPrivate = existingBoard.isPrivate;
                                     admins = existingBoard.admins; membersWrite = existingBoard.membersWrite; membersRead = existingBoard.membersRead};

                         boardsById.put(boardId, board);
                         #ok(board);
                    } else {
                        #err(#not_authorized("user not authorized"));
                    };

               };
           };
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

    public query({ caller }) func notesCnt() : async Nat {
        return nextNoteId;
    };

    public query({ caller }) func userCnt() : async Nat {
        return notesByUser.size();
    };

    public query({ caller }) func boardCnt() : async Nat {
        return boardsById.size();
    };

    system func preupgrade() {
         stable_notesByUser := Iter.toArray(notesByUser.entries());
         stable_boardsById := Iter.toArray(boardsById.entries());
         stable_boardsByUsers := Iter.toArray(boardsByUsers.entries());
         stable_requestsByBoard := Iter.toArray(requestsByBoard.entries());
    };

    system func postupgrade() {
        notesByUser := Map.fromIter<PrincipalName, [Note]>(stable_notesByUser.vals(), 10, Text.equal, Text.hash);
        stable_notesByUser := [];

        boardsById := Map.fromIter<BoardId, Board>(stable_boardsById.vals(), 10, Text.equal, Text.hash);
        stable_boardsById := [];

        boardsByUsers := Map.fromIter<PrincipalName, [BoardId]>(stable_boardsByUsers.vals(), 10, Text.equal, Text.hash);
        stable_boardsByUsers := [];

        requestsByBoard := Map.fromIter<BoardId, [BoardAccessRequest]>(stable_requestsByBoard.vals(), 10, Text.equal, Text.hash);
        stable_requestsByBoard := [];

        userNames := Map.fromIter<PrincipalName, Text>(stable_userNames.vals(), 10, Text.equal, Text.hash);
        stable_userNames := [];
    };
};
