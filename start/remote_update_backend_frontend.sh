#!/usr/bin/env bash
#
# Run this script from your home computer in order to automatically update the backend and frontend from github
#

git push
ssh root@104.248.40.179 "cd badkan; source start/update_backend_frontend.sh"