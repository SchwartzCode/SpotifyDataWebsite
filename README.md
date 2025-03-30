# Spotify Streaming Data Parsing Website

## Running the app
`./run.sh start`

## Deployment
Build and tag container:
`docker build -f docker/Dockerfile -t spotify-data-explorer:latest .`

If it is your first time deploying on this machine, authenticate docker to ECR registery:
`aws ecr get-login-password --region us-east-2 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-2.amazonaws.com`

Push new container to aws:
`docker tag spotify-data-explorer:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-2.amazonaws.com/spotify-data-explorer:latest`

## TODO
* better popup on failure
* script to run everything
* Docker images to run scripts in
* fix uploading multiple times (need to refresh page to reupload)
* clean up frontend folder
* when searching, keep original row numbers
* add ability to select a specific range in time
* sorting by different columns doesn't work in album/artist popup
* exit album/artist popup by clicking outside of the popup
* favorite song on a rolling window of most listened to song in the last 1 month (DUDE!!!)
* play the song (ideally with spotify?) when you click on it (maybe with a play button)
* when merging data from a single and a song from an album, default to using the album
* itunes data?
* add ability to see number of full listens through of the album (minimum time on a song in the album)

Feature not a bug :tm:
* when switching tabs, arrow stays sorting on whatever you were sorting by on the last tab

Hosting as a website:
* put everything in a docker container
* amazon ecs should be able to host the container


![image](https://github.com/user-attachments/assets/bc594dfd-468d-48df-8229-c2f8b865f1dd)
