<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Todo;
use Illuminate\Http\Request;

class TodoController extends Controller
{
    /**
     * Display a listing of the authenticated user's todos.
     */
    public function index(Request $request)
    {
        $todos = $request->user()
            ->todos()
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'todos' => $todos,
            'count' => $todos->count(),
        ]);
    }

    /**
     * Store a newly created todo.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date',
            'attachment' => [
                'nullable',
                'file',
                'max:25600', // Max 25MB
                'mimes:jpg,jpeg,png,gif,bmp,webp,svg,pdf,doc,docx,xls,xlsx,ppt,pptx,txt,csv',
            ],
        ], [
            'attachment.mimes' => 'The attachment must be an image (jpg, jpeg, png, gif, bmp, webp, svg) or document (pdf, doc, docx, xls, xlsx, ppt, pptx, txt, csv).',
            'attachment.max' => 'The attachment must not be greater than 25MB.',
        ]);

        $attachmentPath = null;
        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $originalName = $file->getClientOriginalName();
            $sanitizedName = preg_replace('/[^a-zA-Z0-9._-]/', '_', pathinfo($originalName, PATHINFO_FILENAME));
            $extension = $file->getClientOriginalExtension();
            $fileName = $sanitizedName . '_' . time() . '.' . $extension;
            $attachmentPath = $file->storeAs('attachments', $fileName, 'public');
        }

        $todo = $request->user()->todos()->create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'due_date' => $validated['due_date'] ?? null,
            'attachment' => $attachmentPath,
            'is_completed' => false,
        ]);

        return response()->json([
            'message' => 'Todo created successfully',
            'todo' => $todo,
        ], 201);
    }

    /**
     * Display the specified todo.
     */
    public function show(Request $request, $id)
    {
        $todo = $request->user()
            ->todos()
            ->findOrFail($id);

        return response()->json([
            'todo' => $todo,
        ]);
    }

    /**
     * Update the specified todo.
     */
    public function update(Request $request, $id)
    {
        $todo = $request->user()
            ->todos()
            ->findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date',
            'attachment' => [
                'nullable',
                'file',
                'max:25600', // Max 25MB
                'mimes:jpg,jpeg,png,gif,bmp,webp,svg,pdf,doc,docx,xls,xlsx,ppt,pptx,txt,csv',
            ],
            'is_completed' => 'sometimes|boolean',
        ], [
            'attachment.mimes' => 'The attachment must be an image (jpg, jpeg, png, gif, bmp, webp, svg) or document (pdf, doc, docx, xls, xlsx, ppt, pptx, txt, csv).',
            'attachment.max' => 'The attachment must not be greater than 25MB.',
        ]);

        // Handle file upload
        if ($request->hasFile('attachment')) {
            // Delete old attachment if exists
            if ($todo->attachment) {
                \Storage::disk('public')->delete($todo->attachment);
            }
            $file = $request->file('attachment');
            $originalName = $file->getClientOriginalName();
            $sanitizedName = preg_replace('/[^a-zA-Z0-9._-]/', '_', pathinfo($originalName, PATHINFO_FILENAME));
            $extension = $file->getClientOriginalExtension();
            $fileName = $sanitizedName . '_' . time() . '.' . $extension;
            $validated['attachment'] = $file->storeAs('attachments', $fileName, 'public');
        }

        // Handle completed_at timestamp
        if (isset($validated['is_completed'])) {
            if ($validated['is_completed'] && !$todo->is_completed) {
                $validated['completed_at'] = now();
            } elseif (!$validated['is_completed']) {
                $validated['completed_at'] = null;
            }
        }

        $todo->update($validated);

        return response()->json([
            'message' => 'Todo updated successfully',
            'todo' => $todo->fresh(),
        ]);
    }

    /**
     * Remove the specified todo (soft delete).
     */
    public function destroy(Request $request, $id)
    {
        $todo = $request->user()
            ->todos()
            ->findOrFail($id);

        // Delete attachment file if exists
        if ($todo->attachment) {
            \Storage::disk('public')->delete($todo->attachment);
        }

        $todo->delete();

        return response()->json([
            'message' => 'Todo deleted successfully',
        ]);
    }

    /**
     * Download the attachment for a todo.
     */
    public function download(Request $request, $id)
    {
        $todo = $request->user()
            ->todos()
            ->findOrFail($id);

        if (!$todo->attachment || !\Storage::disk('public')->exists($todo->attachment)) {
            return response()->json([
                'message' => 'Attachment not found',
            ], 404);
        }

        // Extract the original filename from the stored path
        $storedFilename = basename($todo->attachment);
        
        // Get the file path and mime type
        $filePath = \Storage::disk('public')->path($todo->attachment);
        $mimeType = \Storage::disk('public')->mimeType($todo->attachment);

        return response()->download($filePath, $storedFilename, [
            'Content-Type' => $mimeType,
        ]);
    }
}
