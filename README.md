# Spotify Streaming Data Parsing Website

![image](https://github.com/user-attachments/assets/bc594dfd-468d-48df-8229-c2f8b865f1dd)

## Running the app locally
**Start the app:** `./run.sh start`

**View the site**: Go to `localhost:5000` in a browser

**Stop the app:** `./run.sh stop`

## Deployment
Build and tag container:
`docker build -f docker/Dockerfile -t spotify-data-explorer:latest .`

If it is your first time deploying on this machine, authenticate docker to ECR registery:
`aws ecr get-login-password --region REGION_NAME | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.REGION_NAME.amazonaws.com`

Tag the image:
`docker tag spotify-data-explorer:latest YOUR_ACCOUNT_ID.dkr.ecr.REGION_NAME.amazonaws.com/spotify-data-explorer:latest`

Push new container to aws:
`docker push YOUR_ACCOUNT_ID.dkr.ecr.REGION_NAME.amazonaws.com/spotify-data-explorer:latest`

## TODO
* better popup on failure
* fix uploading multiple times (need to refresh page to reupload)
* when searching, keep original row numbers
* add ability to select a specific range in time
* sorting by different columns doesn't work in album/artist popup
* exit album/artist popup by clicking outside of the popup
* play the song (ideally with spotify?) when you click on it (maybe with a play button)
* when merging data from a single and a song from an album, default to using the album
* itunes data?
* add ability to see number of full listens through of the album (minimum time on a song in the album)
* reduce aws costs

Feature not a bug :tm:
* when switching tabs, arrow stays sorting on whatever you were sorting by on the last tab
