@echo off
echo Cleaning up node_modules from repo and local...
@echo off
echo === Adding all changes to Git ===
git add .

:: Step 4: Commit the change
git commit -m "Remove node_modules from repo and local"


echo === Pushing to origin master ===
git push -u origin master
:: Step 5: Push to remote
git push origin main

echo Done.
pause
