@echo off
echo Cleaning up node_modules from repo and local...
@echo off
git init



git remote add origin https://github.com/mosin11/cashbook-backup-server
echo === Adding all changes to Git ===
git add .

:: Step 4: Commit the change
git commit -m "added auth code for user based"


echo === Pushing to origin master ===
git push -u origin master
:: Step 5: Push to remote
git push origin main

echo Done.
pause
