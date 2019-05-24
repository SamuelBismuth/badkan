#!/usr/bin/env bash
# INPUT: the exercise id and the subfolder of the GitLab repository.
# ACTION: mv the exercise in the folder exercises and clean up.

FOLDERNAME=$1 # The firebase id of the exercise.
SUBFOLDER=$2 # the subfolder of the GitLab repository.

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

cp -a $DIR/../../exercises/$FOLDERNAME/$SUBFOLDER/. $DIR/../../exercises/$FOLDERNAME/
rm -r $DIR/../../exercises/$FOLDERNAME/$SUBFOLDER/

echo "! cd $DIR/../../exercises/$FOLDERNAME"
cd $DIR/../../exercises/$FOLDERNAME 
echo "! chmod +x grade"
chmod +x grade






