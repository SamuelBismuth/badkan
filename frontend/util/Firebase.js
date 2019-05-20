/**
 * Here are all the function for firebase use.
 */

// Get a reference to the database service
var database = firebase.database();
var storage = firebase.storage();

/**
 * This method upload the user in firebase.
 * @param {user} user 
 * @param {String} userId 
 */
function writeUserData(user, userId) {
  database.ref("users/" + userId).set({
    user
  }).then(function () {
    document.location.href = "home.html";
  });
}

/**
 * This method upload the user on firebase and then submit the form.
 * @param {user} user 
 * @param {String} userId 
 */
function writeUserDataAndSubmit(user, userId) {
  database.ref("users/" + userId).set({
    user
  }).then(function () {
    document.getElementById("form").submit();
    document.location.href = "home.html";
  });
}

/**
 * This method upload the user on firebase and then submit the form.
 * @param {user} user 
 * @param {String} userId 
 */
function writeUserDataAndSubmitCourse(user, userId) {
  database.ref("users/" + userId).set({
    user
  }).then(function () {
    console.log("success")
  });
}

/**
 * This method upload the user in firebase.
 * Note that we're not comming home here.
 * @param {user} user 
 * @param {String} userId 
 */
function writeUserDataWithoutComingHome(user, userId) {
  database.ref("users/" + userId).set({
    user
  });
}

/**
 * This function upload an exercise.
 * @param {exercise} exercise 
 * @param {String} exerciseId 
 */
function writeExercise(exercise, exerciseId) {
  if (!exercise.deadline) {
    exercise.deadline = null;
  }
  firebase.database().ref("exercises/" + exerciseId).set({
    exercise
  });
}

function writePeerExercise(peerExercise, peerExerciseId) {
  console.log(peerExercise)
  console.log(peerExerciseId)
  firebase.database().ref("peerExercises/" + peerExerciseId).set({
    peerExercise
  });
}

function editCourse(course, courseId) {
  firebase.database().ref("courses/" + courseId).set({
    course
  });
}

function writeCourse(course, courseId) {
  firebase.database().ref("courses/" + courseId).set({
    course
  }).then(function () {
    document.getElementById("form").submit();
    document.location.href = "manageCourses.html";
  });
}

/**
 * This function increment the number of created exercise.
 * @param {String} userId 
 * @param {user}homeUser 
 */
function incrementCreatedEx(userId, homeUser) {
  homeUser.createdEx++;
  writeUserData(homeUser, userId);
}

/**
 * This function increment the number of created exercise.
 * @param {String} userId 
 * @param {user}homeUser 
 */
function incrementCreatedExWithoutCommingHome(userId, homeUser) {
  homeUser.createdEx++;
  writeUserDataWithoutComingHome(homeUser, userId);
  localStorage.setItem("homeUserKey", JSON.stringify(homeUser));
}

/**
 * This function increment the number of created exercise.
 * Note that this function submit the form.
 * @param {String} userId 
 * @param {user}homeUser 
 */
function incrementCreatedExAndSubmitCourse(userId, homeUser) {
  homeUser.createdEx++;
  localStorage.setItem("homeUserKey", JSON.stringify(homeUser));
  writeUserDataAndSubmitCourse(homeUser, userId);
}

/**
 * This function increment the number of deleted exercise.
 * @param {String} userId 
 * @param {user}homeUser 
 */
function incrementDeletedEx(userId, homeUser) {
  console.log("increment delete");
  homeUser.deletedEx++;
  writeUserData(homeUser, userId);
}

/**
 * This function increment the number of edited exercise.
 * @param {String} userId 
 * @param {user}homeUser 
 */
function incrementEditEx(userId, homeUser) {
  homeUser.editedEx++;
  writeUserData(homeUser, userId);
}

/**
 * This function increment the number of edited exercise.
 * Note that this function is not bring you at home.
 * @param {String} userId 
 * @param {user}homeUser 
 */
function incrementEditExWithoutCommingHome(userId, homeUser) {
  homeUser.editedEx++;
  writeUserDataWithoutComingHome(homeUser, userId);
}

/**
 * This function downloads the user from the firebase given his id.
 * @param {String} userId 
 */
function loadCurrentUser(userId) {
  database.ref('/users/' + userId).once('value').then(function (snapshot) {
    var data = snapshot.val();
    if (!data || (typeof data === 'undefined')) {
      // User object does not exist
      document.location.href = "completeInfo.html";
    } else {
      // User object exists
      var homeUser = snapshot.val().user;
      localStorage.setItem("homeUserKey", JSON.stringify(homeUser));
      document.getElementById("name").innerHTML =
        "Hello " + homeUser.name + " " + homeUser.lastName + "! <br />" +
        "ID number: " + homeUser.id + "<br />" +
        "Email: " + homeUser.email + "<br />";
      loading("div1");
      loading("loading");
      if (homeUser.admin) {
        if (homeUser.admin === true) {
          $("#btnManageCourses").show()
        }
      }
    }
  });
}

/**
 * This function load the collab.
 * @param {int} userId 342533064
 * @param {grade} grade
 */
function loadCollabById(userId, grade) {
  database.ref('/users/').orderByChild("/user/id").equalTo(userId).once('value').then(function (snapshot) {
    snapshot.forEach(function (child) {
      let uid = child.key;
      database.ref('/users/' + uid).once('value').then(function (snapshot) {
        let collab1 = snapshot.val().user;
        uploadCollabGrade(grade, collab1, uid);
      });
    });
  });
}

/**
 * This method download any user by is country id.
 * @param {int} id 
 * @param {String} giturl 
 */
function loadUidById(id, giturl) {
  database.ref('/users/').orderByChild("/user/id").equalTo(id).once('value').then(function (snapshot) {
    snapshot.forEach(function (child) {
      let uid = child.key;
      uploadGradeWithOneCollab(grade, uid, giturl)
    });
  });
}

/**
 * This method download two users by their country ids.
 * @param {int} id1 
 * @param {int} id2 
 * @param {String} giturl 
 */
function loadUidByIds(id1, id2, giturl) {
  database.ref('/users/').orderByChild("/user/id").equalTo(id1).once('value').then(function (snapshot) {
    snapshot.forEach(function (child) {
      let uid1 = child.key;
      database.ref('/users/').orderByChild("/user/id").equalTo(id2).once('value').then(function (snapshot) {
        snapshot.forEach(function (child) {
          let uid2 = child.key;
          uploadGradeWithTwoCollab(grade, uid1, uid2, giturl);
        });
      });
    });
  });
}

/**
 * This function load all the exercise the current user create.
 */
function loadExerciseByOwner(ownExercises) {
  var flag = false;
  database.ref().child('exercises/').on("value", function (snapshot) {
    snapshot.forEach(function (data) {
      if (data.val().exercise.ownerId === firebase.auth().currentUser.uid) {
        addOption(data.val().exercise, data.key);
        ownExercises.set(data.key, data.val().exercise);
        flag = true;
      }
    });
    loading("div2");
    loading("loading2");
    if (!flag) {
      alert("You didn't create any exercise yet!");
      window.location.href = 'home.html';
    }
  });
}

/**
 * Load all the courses from Firebase,
 *      filter only the courses owned by the currently authenticated user,
 *      and for each such course, call:
 *          onCourse(key, course)
 * After all courses are read, call onFinish()
 */
function loadCoursesOwnedByCurrentUser(onCourse, onFinish, homeUserForAdmin) {
  database.ref().child('courses/').on("value", function (snapshot) {
    if (!snapshot.val()) { // TODO: is it needed?
      document.getElementById("loading").style.display = "none";
    }

    var numToProcess = snapshot.numChildren()
    //console.log("num courses to process="+numToProcess)
    snapshot.forEach(function (course_data) { // for each course do

      if (course_data.val().course.ownerId === firebase.auth().currentUser.uid ||
        course_data.val().course.grader === homeUserForAdmin.id ||
        firebase.auth().currentUser.uid == "l54uXZrXdrZDTcDb2zMwObhXbxm1") {
        onCourse(course_data.key, course_data.val().course)
      }
      numToProcess--;
      if (numToProcess <= 0) { // done all courses
        document.getElementById("loading").style.display = "none"; // TODO: is it needed?
        onFinish();
      }
    })
  });
}


// Loads all courses from Firebase,
//    and for each course, call:
//    onCourse(key, course)
//  After all courses are read, call onFinish()
function loadAllCourses(onCourse, onFinish) {
  database.ref().child('courses/').on("value", function (snapshot) {
    var numToProcess = snapshot.numChildren()
    snapshot.forEach(function (data) {
      onCourse(data.key, data.val().course);
      numToProcess--;
      if (numToProcess <= 0) { // done all courses
        onFinish();
      }
    })
  });
}

/**
 * This function load all the exercises of the database.
 */
function loadAllExercisesAsync(exercises) {
  database.ref().child('exercises/').on("value", function (snapshot) {
    snapshot.forEach(function (data) {
      exercises.set(data.key, data.val().exercise);
    });
  });
}

/**
 * This function load all the peer-to-peer exercises of the database.
 */
function loadAllPeerExercisesAsync(peerExercises) {
  database.ref().child('peerExercises/').on("value", function (snapshot) {
    snapshot.forEach(function (data) {
      peerExercises.set(data.key, data.val().peerExercise);
    });
  });
}

/**
 * This function load all the exercises of the database.
 */
function loadAllExercises(onFinish) {
  exercises = new Map()
  database.ref().child('exercises/').on("value", function (snapshot) {
    snapshot.forEach(function (data) {
      exercises.set(data.key, data.val().exercise);
    });
    onFinish(exercises)
  });
}

/**
 * This function load all the exercises of the database.
 */
function loadAllExercisesAndAddOptions(exercisesMap) {
  database.ref().child('exercises/').on("value", function (snapshot) {
    snapshot.forEach(function (data) {
      exercisesMap.set(data.key, data.val().exercise);
    });
    loading("div3");
    loading("loading3");
  });
}

/**
 * This function load all the peer-to-peer exercises of the database.
 */
function loadAllPeerExercises(peerExercisesMap) {
  database.ref().child('peerExercises/').on("value", function (snapshot) {
    snapshot.forEach(function (data) {
      peerExercisesMap.set(data.key, data.val().peerExercise);
    });
    loading("div3");
    loading("loading3");
  });
}

/**
 *     Read from Firebase the data of all users registered to the course,
 *     and for each user, call:
 *         onUser(key, user)
 */
function loadUsersOfCourse(course, onUser, i, courses_length) {
  for (var j = 0; j < course.students.length; j++) {
    let current_student = course.students[j]
    if (current_student != "dummyStudentId") {
      database.ref().child('users/' + current_student).once('value').then(
        function (snapshot) {
          console.log("key=" + snapshot.key + " user=" + snapshot.val().user)
          console.log("i" + i);
          console.log("courses_length" + courses_length);
          onUser(snapshot.key, snapshot.val().user, i, courses_length)
        }
      )
    }
  }
}

/**
 * This function remove an exercise from the database.
 * @param {string} exerciseId 
 */
function deleteExerciseById(exerciseId) {
  database.ref().child('exercises/' + exerciseId).remove();
}

/**
 * This function remove an user from the database.
 * @param {string} userId 
 */
function deleteUserById(userId) {
  database.ref().child('users/' + userId).remove();
}

/**
 * This function remove a course from the database.
 * @param {string} courseId 
 */
function deleteCourseById(courseId) {
  database.ref().child('courses/' + courseId).remove();
}

/**
 * This function refresh the historic of the user.
 * @param {int} selectedValue
 * @param {grade} grade
 */
function writeExerciseHistoric(selectedValue, grade) {
  database.ref('exercises/' + selectedValue).once('value').then(function (snapshot) {
    var exercise = snapshot.val().exercise;
    for (var i = 0; i < grade.length; i++) {
      let index = checkIfIdExist(exercise, grade[i].id);
      if (index != -1) {
        exercise.grades.gradeObj[index] = grade[i];
      } else {
        exercise.grades.gradeObj.push(grade[i]);
      }
    }
    firebase.database().ref("exercises/" + selectedValue).set({
      exercise
    });
  });
}

/**
 * This function check if the id country exist or not in the database.
 * @param {exercise} exercise 
 * @param {int} id 
 */
function checkIfIdExist(exercise, id) {
  for (var i = 1; i < exercise.grades.gradeObj.length; i++) {
    if (exercise.grades.gradeObj[i].id === id) {
      return i;
    }
  }
  return -1;
}

function writeNewReclamationIds(id, peerSolutionExercise, testId, functionName) {
  database.ref('/tests/' + peerSolutionExercise + "/" + testId + "/" + functionName + "/ids/" + id).set({
    "reclam": "true"
  });
}