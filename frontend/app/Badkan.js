var BACKEND_PORTS = [5670,5671,5672,5673,5674,5675,5676,5677,5678,5679,];

var grade = 0;
var homeUser = JSON.parse(localStorage.getItem("homeUserKey"));

var exercise = getParameterByName("exercise");     // in utils.js
if (!exercise)
    exercise = "multiply"; // default exercise
var ex = JSON.parse(localStorage.getItem("exercise"));
var selectedValue = JSON.parse(localStorage.getItem("selectedValue"));
$("#exercise").html(ex.name);

$("button#clear").click(() => {
    $("div#output").html("")
    return false;
})

$("button#submit").click(() => {
    // Choose a backend port at random
    var backendPort = getParameterByName("backend");     // in utils.js
    if (!backendPort)
        backendPort = BACKEND_PORTS[Math.floor(Math.random()*BACKEND_PORTS.length)];
    var websocketurl = "ws://" + location.hostname + ":" + backendPort + "/"
    logClient("color:#888", "Submitting to backend port: "+backendPort);  // in utils.js

    // Create the json for submission
    const collab1Id = document.getElementById("collab1").value;
    const collab2Id = document.getElementById("collab2").value;
    var submission_json = JSON.stringify({
        exercise: exercise + "/" + ex.exFolder,
        git_url: $("input#giturl").val(),
        ids: homeUser.id + "-" + collab1Id + "-" + collab2Id
    });  // the variable "submission_json" is read in server.py:run
    logClient("color:#888", submission_json);  // in utils.js
    var websocket = new WebSocket(websocketurl);
    websocket.onopen = (event) => {
        logServer("color:blue", "Submission starting!"); // in utils.js
        logClient("color:green; font-style:italic", submission_json)
        websocket.send(submission_json);
    }
    websocket.onmessage = (event) => {
        console.log(event);
    }
    websocket.onclose = (event) => {
        if (event.code === 1000) {
            if (grade === 0) {
                uploadGrade(0);
            }
            logServer("color:blue", "Submission completed!");
        }
        else if (event.code === 1006)
            logServer("color:red", "Connection closed abnormally!");
        else
            logServer("color:red", "Connection closed abnormally! Code=" + event.code + ". Reason=" + websocketCloseReason(event.code));
        log("&nbsp;", "&nbsp;")
    }
    websocket.onerror = (event) => {
        logServer("color:red", "Error in websocket.");
    }
    websocket.onmessage = (event) => {
        logServer("color:black; margin:0 1em 0 1em", event.data);
        // The line "Final Grade:<grade>" is written in server.py:check_submission
        if (event.data.includes("Final Grade:")) {
            grade = event.data.substring(12, event.data.length);
            uploadGrade(grade);
        }
    }
    return false;
})

function uploadGrade(grade) {
    const collab1Id = document.getElementById("collab1").value;
    const collab2Id = document.getElementById("collab2").value;
    if (collab1Id != "" && collab2Id != "") {
        uploadGradeWithTwoCollab(grade, collab1Id, collab2Id);
    }
    else if (collab1Id != "") {
        uploadGradeWithOneCollab(grade, collab1Id)
    }
    else if (collab2Id != "") {
        uploadGradeWithOneCollab(grade, collab2Id)
    }
    else {
        uploadHomeUserGrade(grade);
        let newGrade = new Grade(homeUser.id, grade)
        writeExerciseHistoric(selectedValue, [newGrade]);
    }
}

function uploadGradeWithOneCollab(grade, collab1Id) {
    uploadHomeUserGrade(grade);
    loadCollabById(collab1Id, grade);
    let newGrade1 = new Grade(homeUser.id, grade)
    let newGrade2 = new Grade(collab1Id, grade)
    let gradevector = [newGrade1, newGrade2];
    writeExerciseHistoric(selectedValue, gradevector);
}

function uploadGradeWithTwoCollab(grade, collab1Id, collab2Id) {
    uploadHomeUserGrade(grade);
    loadCollabById(collab1Id, grade);
    loadCollabById(collab2Id, grade);
    let newGrade1 = new Grade(homeUser.id, grade)
    let newGrade2 = new Grade(collab1Id, grade)
    let newGrade3 = new Grade(collab2Id, grade)
    let gradevector = [newGrade1, newGrade2, newGrade3];
    writeExerciseHistoric(selectedValue, gradevector);

}

function uploadCollabGrade(grade, collab, collabId) {
    exerciseSolved = new ExerciseSolved(ex, grade, selectedValue);
    flag = true;
    for (i = 0; i < collab.exerciseSolved.length; i++) {
        if (collab.exerciseSolved[i].exerciseId === selectedValue) {
            collab.exerciseSolved[i] = exerciseSolved;
            flag = false;
        }
    }
    if (flag) {
        collab.exerciseSolved.push(exerciseSolved);
    }
    writeUserDataWithoutComingHome(collab, collabId);
}

function uploadHomeUserGrade(grade) {
    exerciseSolved = new ExerciseSolved(ex, grade, selectedValue);
    flag = true;
    for (i = 0; i < homeUser.exerciseSolved.length; i++) {
        if (homeUser.exerciseSolved[i].exerciseId === selectedValue) {
            homeUser.exerciseSolved[i] = exerciseSolved;
            flag = false;
        }
    }
    if (flag) {
        homeUser.exerciseSolved.push(exerciseSolved);
    }
    var userId = firebase.auth().currentUser.uid;
    writeUserDataWithoutComingHome(homeUser, userId);
}

$("button#home").click(() => {
    document.location.href = "home.html";
})
