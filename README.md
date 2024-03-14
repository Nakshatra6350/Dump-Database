MySQL Database Backup Automation
This Node.js script automates the backup of MySQL databases using mysqldump and node-cron. It creates a new backup folder for each backup containing the database dumps.

Prerequisites
1. Node.js installed on your machine
2. MongoDB URI for fetching database connection details
3. MySQL database connection details

Usage
1. The script will run every day at 12:00 AM (00:00 IST) and create a new backup folder for each database backup.

Note
1. Update your MongoDB URI in data.js file: Replace "your-mongodb-uri" with your actual MongoDB URI.
2. Install necessary packages: Make sure to install all necessary packages by running npm install.
3. Change your scheduling by changing the cron expression ("0 0 * * *"): Modify the cron expression in index.js to change the backup scheduling.