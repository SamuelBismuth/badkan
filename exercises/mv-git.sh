FOLDERNAME1=$1
FOLDERNAME2=$2

cd $FOLDERNAME1
echo $FOLDERNAME1
echo $FOLDERNAME2
sudo cp -a $FOLDERNAME2/. .
rm -r $FOLDERNAME2
