#!/usr/bin/env python3

"""
A server for submission and checking of exercises.

AUTHOR: Erel Segal-Halevi
SINCE: 2018-01
"""

from terminal import *

import websockets, subprocess, asyncio, os, urllib,  json, re
import csv, time
import sys
from terminal import *
from csv_trace import edit_csv
import datetime

PORT = sys.argv[1] if len(sys.argv)>=2 else 5670   # same port as in frontend/index.html
EXERCISE_DIR = "../exercises"

GIT_REGEXP = re.compile("http.*github[.]com/(.*)/(.*)", re.IGNORECASE)
GIT_CLEAN  = re.compile(".git.*", re.IGNORECASE)
GRADE_REGEXP = re.compile("grade.*:\\s*(\\d+)", re.IGNORECASE)

async def tee(websocket, message):
    """
    Send a message both to the backend screen and to the frontend client.
    """
    print("> " + message)
    await websocket.send(message)


def docker_command(command_words):
    """
    :param command_words: a list of words to be executed by docker.
    :return: a stream that contains all output of the command (stdout and stderr together)
    """
    return subprocess.Popen(
        ["docker"] + command_words,
        stdout=subprocess.PIPE, stderr=subprocess.STDOUT, universal_newlines=True)


async def check_submission(websocket:object, submission:dict):
    """
    Check a submitted solution to the given exercise from the given git_url.
    :param websocket: for reading the submission params and sending output messages.
    :param submission: a JSON object with at least the following fields:
           "exercise" - name of the exercise; represents a sub-folder of the "exercises" folder.
           "git_url"  - a url for cloning the student's git repository containing the submitted solution.                      must be of the form https://xxx.git.
    """
    exercise=submission["exercise"]
    git_url =submission["git_url"]

    if not os.path.isdir(EXERCISE_DIR + "/" + exercise):
        await tee(websocket, "exercise '{}' not found".format(EXERCISE_DIR + "/" + exercise))
        return

    matches = GIT_REGEXP.search(git_url)
    username = matches.group(1)
    repository = GIT_CLEAN.sub("",matches.group(2))
    repository_folder = "/submissions/"+username+"/"+repository

    # Clone or pull the student's submission from github to the docker container "badkan":
    with docker_command(["exec", "badkan", "bash", "get-submission.sh", username, repository]) as proc:
        for line in proc.stdout:
            await tee(websocket, line.strip())

    # Copy the files related to grading from the exercise folder outside docker to the submission folder inside docker:
    current_exercise_dir = os.path.realpath(EXERCISE_DIR + "/" + exercise)
    await tee(websocket, "copying from "+current_exercise_dir)
    with docker_command(["cp", current_exercise_dir, "badkan:"+repository_folder+"/grading_files"]) as proc:
        for line in proc.stdout:  print(line)

    # Grade the submission inside the docker container "badkan"
    grade = 0
    with docker_command(["exec", "-w", repository_folder, "badkan", "bash", "-c", "mv grading_files/* .; rm -rf grading_files; nice -n 5 ./grade "+username+" "+repository]) as proc:
        for line in proc.stdout:
            await tee(websocket, line.strip())
            matches = GRADE_REGEXP.search(line)
            if matches is not None:
                grade = matches.group(1)
                await tee(websocket, "Final Grade: " + grade)
                    # This line is read at app/Badkan.js, in websocket.onmessage.

    currentDT = datetime.datetime.now()
    edit_csv(str(currentDT), git_url, submission["ids"], grade)


async def appendGradeTofile(grade,submission,git_url,websocket):
    '''
    append submission grade to csv file 
    :param grade: string representing student grade
    :param submission: dict with keys ID_1 , ID_2, ID_3, student_names, exercise  where ID is student ID 
    '''
    if (any(arg not in submission for arg in ("ID_1" , "ID_2" , "ID_3" , "student_names" , "exercise" ))):
        print("this is an anonymous submission")
        return
    timestamp = time.asctime(time.localtime())
    file = open('grades'+ submission["exercise"] +'.csv', 'a+')
    gradesCsv = csv.writer(file)
    gradesCsv.writerow([submission["ID_1"],submission["ID_2"],submission["ID_3"],submission["student_names"],git_url,grade.rstrip(),timestamp])
    file.close()
    userMessage = "We recorded your IDs: {0}, {1}, {2} and your grade: {3}.<br/> Date of submission is {4}.".format(submission["ID_1"],submission["ID_2"],submission["ID_3"],grade.rstrip(),timestamp)
    htmlMessage = "<div class='grade'>"+userMessage+"</div>"
    await tee (websocket,htmlMessage)

async def load_ex(url, folder_name, username, password, exercise):
    git_clone("../exercises", url, folder_name, username, password, exercise)
    print("your exercise is loaded.")

async def edit_ex(folder_name, ex_folder):
    git_pull("../exercises", folder_name, ex_folder)
    print("your exercise is edited.")

async def delete_ex(delete_ex):
    rmv("../exercises", delete_ex)
    print("your exercise is deleted.")

async def run(websocket, path):
    """
    Run a websocket server that receives submissions and grades them.
    """
    submission_json = await websocket.recv()   # returns a string
    print("< "+submission_json)
    submission = json.loads(submission_json)   # converts the string to a python dict
    if   (submission_json[2] == 'g'):
        await load_ex(submission["git_url"], submission["folderName"], submission["username"], submission["pass"], submission["exFolder"])
    elif (submission_json[3] == 'o'):
        await edit_ex(submission["folderName"], submission["exFolder"])
    elif (submission_json[2] == 'd'):
        await delete_ex(submission["delete_exercise"])
    else:
        await check_submission(websocket, submission)
    print ("> Closing connection")

websocketserver = websockets.server.serve(run, '0.0.0.0', PORT, origins=None)
print("{} listening at {}".format(type(websocketserver), PORT))

asyncio.get_event_loop().run_until_complete(websocketserver)
asyncio.get_event_loop().run_forever()
