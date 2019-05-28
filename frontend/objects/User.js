/**
 * This class represents a User (every user has the same status, there is no special user).
 */
class User {

  /**
   * 
   * @param {string} name 
   * @param {string} lastName 
   * @param {int} id 
   * @param {string} email 
   * @param {int} createdEx  // Also courses.
   * @param {int} deletedEx 
   * @param {int} editedEx 
   * @param {array} submissionsId 
   * @param {boolean} admin
   * @param {array} notif
   */
  constructor(name, lastName, id, email, createdEx, deletedEx, editedEx, submissionsId, peerExerciseSolved, admin, notif) {
    this.name = name;
    this.lastName = lastName;
    this.id = id;
    this.email = email;
    this.createdEx = createdEx;
    this.deletedEx = deletedEx;
    this.editedEx = editedEx;
    this.submissionsId = submissionsId;
    this.peerExerciseSolved = peerExerciseSolved;
    this.admin = admin;
    this.notif = notif;
  }
}
