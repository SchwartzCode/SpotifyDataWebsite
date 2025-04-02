// src/components/ui/instructions.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from 'next/image';

export const Instructions = () => {
  return (
    <Card>
      {/* <CardHeader>
        <CardTitle>How to Use Spotify Data Explorer</CardTitle>
      </CardHeader> */}
      <CardContent>
        <div className="prose prose-invert max-w-none">
          <h2 className="text-xl font-bold text-spotify-green mb-4">Requesting your data from Spotify</h2>
          
          <ol className="list-decimal pl-6 mb-6 space-y-3">
            <li className="text-spotify-off-white">
              <p className="mt-1">Log in to your Spotify account in a browser</p>
            </li>
            
            <li className="text-spotify-off-white">
              <p className="mt-1">Go to Account Privacy settings, and request your data. Spotify will email you when it's ready to download.</p>
            </li>

            <li>
              <p className="mt-1">Go to Account Privacy settings 
                <a href="https://www.spotify.com/account/privacy/" target="_blank" rel="noopener noreferrer" className="text-spotify-green hover:underline">  Account Privacy settings </a>
                and scroll down to the "Download your data" section.
              </p>
            </li>
            
            <li className="text-spotify-off-white">
              <p className="mt-1">Check off "Extended streaming history" and click the "Request data" button at the bottom of the screen.</p>
            </li>
          </ol>

          <div className="relative h-[800px] w-full mb-4">
            <Image 
              src="/spotify_data_request_page.png"
              alt="Example of Spotify data dashboard" 
              fill
              className="object-contain rounded-lg border border-spotify-medium-gray"
            />
          </div>

          <h2 className="text-xl font-bold text-spotify-green mb-4">Waiting on your data?</h2>
          
          <ol className="list-decimal pl-6 mb-6 space-y-3 text-spotify-off-white">
              <p className="mt-1">Try out the demo data in the "Upload" tab.</p>
          </ol>

          <h2 className="text-xl font-bold text-spotify-green mb-4">Using the site</h2>
          
          <ol className="list-decimal pl-6 mb-6 space-y-3 text-spotify-off-white">
            <li>
              <p className="mt-1">Go to the "Upload" tab and upload your data. Explore</p>
            </li>

            <li>
              <p className="mt-1">Once the upload finishes, it will switch to the "Data" tab</p>
            </li>

            <li>
              <p>Explore your data</p>
              <ul className="list-disc pl-6 mb-6 space-y-3 text-spotify-off-white">

                <li>Use the "View Data By" selector to toggle between Songs, Albums, and Artists.</li>
                <li>Use the "View Data By" selector to toggle between Songs, Albums, and Artists.</li>
                <li>Use the search bar to find specific songs, albums, or artists.</li>
                <li>Use the search bar to find specific songs, albums, or artists.</li>
                <li>Click on any column header to sort by that attribute (e.g., sort by most played).</li>
                <li>Click on an album to see how much you have listened to all of the songs in that album.</li>
                <li>Click on an artist to see how much you have listened to all of the songs by that artist.</li>

              </ul>
            </li>

          </ol>

          <h2 className="text-xl font-bold text-spotify-green mb-4">The Statistics</h2>
          
          <ul className="list-disc pl-6 mb-6 space-y-3 text-spotify-off-white">
            <li>
              <span className="font-semibold">Plays</span>: The total number of times you've listened to a track.
            </li>
            
            <li>
              <span className="font-semibold">Minutes Played</span>: The total listening time for tracks (in minutes).
            </li>
          </ul>

          <h2 className="text-xl font-bold text-spotify-green mb-4">Want to add something to the site?</h2>
          <p className="mt-1">Check out
            <a href="https://github.com/SchwartzCode/SpotifyDataWebsite" target="_blank" rel="noopener noreferrer" className="text-spotify-green hover:underline">  the project on Github.</a>
            and scroll down to the "Download your data" section.
          </p>

        </div>
      </CardContent>
    </Card>
  );
};