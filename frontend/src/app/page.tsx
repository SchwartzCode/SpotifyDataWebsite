"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/table";

// Define the type for data items
interface DataItem {
  [key: string]: string | number | boolean;
}

export default function FileUploader() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DataItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    setLoading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append("file", acceptedFiles[0]);

    try {
      const response = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Upload failed");
      }

      setData(result.data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/zip": [".zip"] },
  });

  return (
    <div className="flex flex-col items-center space-y-6 p-6 bg-black test-spotify-off-white font-sans">
      <Card>
        <CardHeader>
          <CardTitle>Upload Your Spotify ZIP File</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className="border-2 border-dashed border-gray-300 p-6 rounded-xl text-center cursor-pointer hover:bg-spotify-medium-gray"
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <p className="text-spotify-off-white">Drop the file here...</p>
            ) : (
              <p className="text-spotify-off-white">Drag & drop a ZIP file, or click to select one</p>
            )}
          </div>

          {loading && <p className="text-center mt-4">Loading...</p>}
          {error && <p className="text-red-500 text-center mt-4">{error}</p>}
        </CardContent>
      </Card>

      {data.length > 0 && (
        <Card>
          <CardContent>
            <DataTable data={data} /> {/* Replace the original table with DataTable */}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
