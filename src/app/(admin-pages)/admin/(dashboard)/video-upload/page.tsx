"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload } from "lucide-react";

export default function VideoUploadPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Video Upload</h1>
      <Tabs defaultValue="direct-upload">
        <TabsList>
          <TabsTrigger value="direct-upload">Direct Upload</TabsTrigger>
          <TabsTrigger value="youtube-link">YouTube Link</TabsTrigger>
        </TabsList>
        <TabsContent value="direct-upload">
          <Card>
            <CardHeader>
              <CardTitle>Direct File Upload</CardTitle>
              <CardDescription>
                Drag and drop your video file here or click to browse.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center w-full">
                <Label
                  htmlFor="dropzone-file"
                  className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-10 h-10 mb-3 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      MP4, AVI, MOV (MAX. 800x400px)
                    </p>
                  </div>
                  <Input id="dropzone-file" type="file" className="hidden" />
                </Label>
              </div>
              <div className="mt-4 space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" placeholder="Enter video title" />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter video description"
                  />
                </div>
                <div>
                  <Label htmlFor="tags">Tags</Label>
                  <Input id="tags" placeholder="Enter tags, comma separated" />
                </div>
                <Button>Upload Video</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="youtube-link">
          <Card>
            <CardHeader>
              <CardTitle>YouTube Embedded Link</CardTitle>
              <CardDescription>
                Paste a YouTube video link to embed it.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="youtube-url">YouTube URL</Label>
                  <Input
                    id="youtube-url"
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>
                <div className="aspect-video bg-gray-200 rounded-md"></div>
                <div>
                  <Label htmlFor="title-yt">Title</Label>
                  <Input id="title-yt" placeholder="Enter video title" />
                </div>
                <div>
                  <Label htmlFor="description-yt">Description</Label>
                  <Textarea
                    id="description-yt"
                    placeholder="Enter video description"
                  />
                </div>
                <div>
                  <Label htmlFor="tags-yt">Tags</Label>
                  <Input
                    id="tags-yt"
                    placeholder="Enter tags, comma separated"
                  />
                </div>
                <Button>Embed Video</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
