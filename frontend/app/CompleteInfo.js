/**
 * BUTTON CONFIRM.
 * Here we first authentificate the user, then we register the user in the
 * realtime database, then, we redirected the user to the home page.
 */
document.getElementById("confirm").addEventListener('click', e => {

  const name = document.getElementById("txtName").value;
  const lastName = document.getElementById("txtLastName").value;
  const id = document.getElementById("txtId").value;

  var emptyField = document.getElementById("emptyField");

  if (name === "" || lastName === "" || id === "") {
    emptyField.className = "show";
    setTimeout(function () { emptyField.className = emptyField.className.replace("show", ""); }, 2500);
    return;
  }

  var user = firebase.auth().currentUser;
  let grade = new Grade("id", 90);
  let grades = new Grades("Init", [grade]);
  let exerciseSolved = new ExerciseSolved(new Exercise("0", "0", "0", "0", "0", "0", grades), 90, "id");
  let currentUser = new User(name, lastName, id, user.email, 0, 0, 0, [exerciseSolved]);
  writeUserData(currentUser, user.uid);

  document.location.href = "home.html";

});