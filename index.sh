# TODO: Colors do not show in zsh
# TODO: Package is not linked in @concur on Mac

# chmod +x ~/bin/link-pkg.sh
# code ~/.zshrc
# alias link-pkg=~/bin/link-pkg.sh
# source ~/.zshrc

if [ -z $1 ]
then
    echo -e "\e[31mProvide path to package as an argument!"
    exit 1
fi

if [ ! -f "$1/package.json" ]
then
    echo -e "\e[31mPackage \"$1\" does not exist!"
    exit 1
fi

if [ ! -f "package.json" ]
then
    echo -e "\e[31m\"$PWD\" is not a root directory!"
    exit 1
fi

NAME=`cd $1 && node -p "require('./package.json').name"`
REMOTE=`cd $1 && node -p "require('./package.json').version"`

if [ -f "node_modules/$NAME/package.json" ]
then
    LOCAL=`cd node_modules/$NAME && node -p "require('./package.json').version"`
    if [ "${REMOTE:0:1}" != "${LOCAL:0:1}" ] # compare local and remote versions
    then
        echo -e "\e[33m$NAME@$LOCAL\033[0m was installed locally"
    fi
fi

mkdir -p node_modules/$NAME # create the folder structure
rm -rf node_modules/$NAME # cleanup

IFS=/ read -a PARTS <<< $NAME # detect a forward slash
if [ -z "${PARTS[1]}" ]
then
    ln -s ../$1 node_modules/
else
    ln -s ../../$1 node_modules/${PARTS[0]}
fi

echo "$NAME@$REMOTE linked"