'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Plus, FileText, X, CheckCircle2, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type FileUploadStatus = 'pending' | 'uploading' | 'success' | 'error';

interface UploadFile {
  id: string;
  file: File;
  status: FileUploadStatus;
  progress: number;
  error?: string;
  jobId?: string;
}

export function UploadDialog() {
  const [open, setOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<UploadFile[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
  }

  function handleFiles(fileList: FileList) {
    const newFiles: UploadFile[] = Array.from(fileList)
      .filter((file) => file.type === 'application/pdf' || file.name.endsWith('.pdf'))
      .map((file) => ({
        id: Math.random().toString(36).substring(7),
        file,
        status: 'pending' as FileUploadStatus,
        progress: 0,
      }));

    setFiles((prev) => [...prev, ...newFiles]);
  }

  function removeFile(id: string) {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }

  async function uploadSingleFile(uploadFile: UploadFile) {
    const { file, id } = uploadFile;

    try {
      // Import fetchAuthSession dynamically
      const { fetchAuthSession } = await import('aws-amplify/auth');
      const session = await fetchAuthSession();
      const token = session.tokens?.accessToken?.toString() ?? '';

      // Step 1: Get presigned URL + jobId
      setFiles((prev) =>
        prev.map((f) => (f.id === id ? { ...f, status: 'uploading' as FileUploadStatus, progress: 10 } : f))
      );

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type || 'application/pdf',
        }),
      });

      if (!uploadRes.ok) throw new Error('Failed to get upload URL');
      const { jobId, uploadUrl, s3Key } = await uploadRes.json();

      // Step 2: PUT file directly to S3
      setFiles((prev) =>
        prev.map((f) => (f.id === id ? { ...f, progress: 40 } : f))
      );

      const s3Res = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type || 'application/pdf' },
        body: file,
      });

      if (!s3Res.ok) throw new Error('Failed to upload file to S3');

      setFiles((prev) =>
        prev.map((f) => (f.id === id ? { ...f, progress: 70 } : f))
      );

      // Step 3: Trigger Step Functions
      const jobRes = await fetch('/api/start-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token },
        body: JSON.stringify({ jobId, s3Key }),
      });

      if (!jobRes.ok) throw new Error('Failed to start pipeline');

      // Success
      setFiles((prev) =>
        prev.map((f) =>
          f.id === id
            ? { ...f, status: 'success' as FileUploadStatus, progress: 100, jobId }
            : f
        )
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      setFiles((prev) =>
        prev.map((f) =>
          f.id === id
            ? { ...f, status: 'error' as FileUploadStatus, error: message }
            : f
        )
      );
    }
  }

  async function handleUploadFiles() {
    const pendingFiles = files.filter((f) => f.status === 'pending');
    for (const file of pendingFiles) {
      await uploadSingleFile(file);
    }
  }

  function handleGenerateReports() {
    const successfulJobIds = files
      .filter((f) => f.status === 'success' && f.jobId)
      .map((f) => f.jobId!);

    if (successfulJobIds.length > 0) {
      setOpen(false);
      setFiles([]);
      router.push(`/processing?jobIds=${successfulJobIds.join(',')}`);
    }
  }

  function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  const hasFiles = files.length > 0;
  const isUploading = files.some((f) => f.status === 'uploading');
  const hasPending = files.some((f) => f.status === 'pending');
  const allUploaded = hasFiles && !hasPending && !isUploading && files.every((f) => f.status === 'success');

  return (
    <div className="flex items-center gap-2">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-1 h-4 w-4" />
            Add New Company
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-2xl p-8">
          <DialogHeader>
            <DialogTitle className="text-left text-lg font-semibold">Upload documents</DialogTitle>
          </DialogHeader>

          {/* Upload Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`mt-4 flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed py-10 transition-colors ${
              isDragging ? 'border-blue-400 bg-blue-50' : 'border-slate-300 bg-slate-50'
            }`}
          >
            <div className="rounded-full bg-slate-200 border-2 border-slate-300 p-3">
              <Upload className="h-5 w-5 text-slate-600" />
            </div>

            <p className="text-sm font-medium text-slate-700">
              Drag and drop files here to upload
            </p>
            <p className="text-xs text-slate-400">
              or{' '}
              <Button
                type="button"
                variant="link"
                className="h-auto p-0 text-xs text-blue-600 underline underline-offset-2 hover:text-blue-700 cursor-pointer"
                onClick={() => inputRef.current?.click()}
              >
                browse from your computer
              </Button>
            </p>
            <p className="text-xs text-slate-400">PDF files only · Max 50MB per file</p>

            <Input
              ref={inputRef}
              type="file"
              className="hidden"
              accept=".pdf"
              multiple
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
            />
          </div>

          {/* Guidance Notes */}
          <div className="mt-3 px-4 py-3  border rounded-lg">
            <p className="text-xs text-gray-bg">
              <span className="font-semibold">Note:</span> Each PDF will be analyzed as a separate company.
              If you have multiple documents for one company, please combine them into a single PDF first.
              You can navigate away from the processing page anytime - your analyses will continue running in the background.
            </p>
          </div>

          {/* File List */}
          {hasFiles && (
            <div className="mt-4 space-y-2 max-h-80 overflow-y-auto">
              {files.map((uploadFile) => (
                <div
                  key={uploadFile.id}
                  className="border border-slate-200 rounded-lg p-3 bg-white"
                >
                  <div className="flex items-start gap-3">
                    {/* PDF Icon */}
                    <div className="shrink-0 mt-1">
                      <FileText className="h-5 w-5 text-slate-500" />
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-black truncate">
                            {uploadFile.file.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-xs text-slate-500">
                              {formatFileSize(uploadFile.file.size)}
                            </p>
                            {uploadFile.status === 'uploading' && (
                              <p className="text-xs text-blue-600 font-medium">
                                {uploadFile.progress}%
                              </p>
                            )}
                            {uploadFile.status === 'success' && (
                              <div className="flex items-center gap-1 text-green-600">
                                <CheckCircle2 className="h-3 w-3" />
                                <p className="text-xs font-medium">Uploaded</p>
                              </div>
                            )}
                            {uploadFile.status === 'error' && (
                              <div className="flex items-center gap-1 text-red-600">
                                <AlertCircle className="h-3 w-3" />
                                <p className="text-xs font-medium">{uploadFile.error}</p>
                              </div>
                            )}
                          </div>

                          {/* Progress Bar */}
                          {uploadFile.status === 'uploading' && (
                            <div className="mt-2 w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-600 transition-all duration-300"
                                style={{ width: `${uploadFile.progress}%` }}
                              />
                            </div>
                          )}
                        </div>

                        {/* Remove Button */}
                        {uploadFile.status !== 'uploading' && (
                          <button
                            onClick={() => removeFile(uploadFile.id)}
                            className="shrink-0 p-1 hover:bg-slate-100 rounded transition-colors"
                          >
                            <X className="h-4 w-4 text-slate-400" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Action Button */}
          <div className="mt-6 flex justify-end">
            <Button
              onClick={allUploaded ? handleGenerateReports : handleUploadFiles}
              disabled={!hasFiles || isUploading}
              className="w-full sm:w-auto"
            >
              {isUploading
                ? 'Uploading...'
                : allUploaded
                ? `Generate Report${files.length > 1 ? 's' : ''}`
                : `Upload File${files.length > 1 ? 's' : ''}`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
