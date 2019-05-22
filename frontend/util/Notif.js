// TODO: Deal with assync pbs and read/not read notif.
var notifHomeUser = JSON.parse(localStorage.getItem("homeUserKey"));

let notifUid = JSON.parse(localStorage.getItem("homeUserId"));

$(document).ready(function () {
    let numNotif = 0;
    if (notifHomeUser) {
        if (notifHomeUser.notif) {
            for (let i = 0; i < notifHomeUser.notif.length; i++) {
                if (!notifHomeUser.notif[i].notifRead) {
                    numNotif++;
                    addNonReadedNotif(notifHomeUser.notif[i].notifMessage, i);
                } else {
                    addReadedNotif(notifHomeUser.notif[i].notifMessage);
                }
            }
        } else {
            notifHomeUser.notif = [new MyNotification("Welcome to the Badkan, this is your first notification.", false)];
            localStorage.setItem("homeUserKey", JSON.stringify(notifHomeUser));
            writeUserData(notifHomeUser, notifUid)
        }
    }
    if (numNotif === 0) {
        $('#noti_Counter').hide();
    } else {
        $('#noti_Counter').show();
    }
    // ANIMATEDLY DISPLAY THE NOTIFICATION COUNTER.
    $('#noti_Counter')
        .css({
            opacity: 0
        })
        .text(numNotif) // ADD DYNAMIC VALUE (YOU CAN EXTRACT DATA FROM DATABASE OR
        // XML).
        .css({
            top: '-10px'
        })
        .animate({
            top: '-2px',
            opacity: 1
        }, 500);

    // Append here the notification to show to the user.


    $('#noti_Button').click(function () {
        // TOGGLE (SHOW OR HIDE) NOTIFICATION WINDOW.
        $('#notifications').fadeToggle('fast', 'linear', function () {
            if ($('#notifications').is(':hidden')) {
                $('#noti_Button').css('background-color', '#2E467C');
            }
            // CHANGE BACKGROUND COLOR OF THE BUTTON.
            else
                $('#noti_Button').css('background-color', '#FFF');
        });

        $('#noti_Counter').fadeOut('slow'); // HIDE THE COUNTER.

        return false;
    });

    // HIDE NOTIFICATIONS WHEN CLICKED ANYWHERE ON THE PAGE.
    $(document).click(function () {
        $('#notifications').hide();

        // CHECK IF NOTIFICATION COUNTER IS HIDDEN.
        if ($('#noti_Counter').is(':hidden')) {
            // CHANGE BACKGROUND COLOR OF THE BUTTON.
            $('#noti_Button').css('background-color', '#2E467C');
        }
    });

    $('#notifications').click(function () {
        return false; // DO NOTHING WHEN CONTAINER IS CLICKED.
    });
});

function addNonReadedNotif(message, index) {
    $('#addNotif').append("<h3> <button id=\"btnNotif\" type=\"button\" class=\"btn btn-link\" onclick=\"notifIsReaded(" + index + ")\">" +
        message + "</button></h3>");
}

function addReadedNotif(message) {
    $('#addNotif').append("<h3>" + message + "</h3>");
}

function notifIsReaded(index) {
    notifHomeUser.notif[index].notifRead = true;
    localStorage.setItem("homeUserKey", JSON.stringify(notifHomeUser));
    writeUserData(notifHomeUser, notifUid)
}