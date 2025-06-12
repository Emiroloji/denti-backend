<?php
// app/Http/Controllers/Api/TodoController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\TodoService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TodoController extends Controller
{
    protected $todoService;

    public function __construct(TodoService $todoService)
    {
        $this->todoService = $todoService;
    }

    public function index()
    {
        $todos = $this->todoService->getAllTodos();

        return response()->json([
            'success' => true,
            'data' => $todos
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|min:3|max:255',
            'description' => 'nullable|string|max:1000',
            'category_id' => 'nullable|exists:categories,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $todo = $this->todoService->createTodo($validator->validated());

            return response()->json([
                'success' => true,
                'message' => 'Todo başarıyla oluşturuldu',
                'data' => $todo->load('category')
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function show($id)
    {
        $todo = $this->todoService->getTodoById($id);

        if (!$todo) {
            return response()->json([
                'success' => false,
                'message' => 'Todo bulunamadı'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $todo->load('category')
        ]);
    }

    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|min:3|max:255',
            'description' => 'nullable|string|max:1000',
            'completed' => 'sometimes|boolean',
            'category_id' => 'nullable|exists:categories,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $todo = $this->todoService->updateTodo($id, $validator->validated());

            if (!$todo) {
                return response()->json([
                    'success' => false,
                    'message' => 'Todo bulunamadı'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Todo başarıyla güncellendi',
                'data' => $todo->load('category')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function destroy($id)
    {
        try {
            $deleted = $this->todoService->deleteTodo($id);

            if (!$deleted) {
                return response()->json([
                    'success' => false,
                    'message' => 'Todo bulunamadı'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Todo başarıyla silindi'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function toggle($id)
    {
        try {
            $todo = $this->todoService->toggleTodoStatus($id);

            if (!$todo) {
                return response()->json([
                    'success' => false,
                    'message' => 'Todo bulunamadı'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Todo durumu güncellendi',
                'data' => $todo->load('category')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function stats()
    {
        $stats = $this->todoService->getTodoStats();

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    public function byCategory($categoryId)
    {
        $todos = $this->todoService->getTodosByCategory($categoryId);

        return response()->json([
            'success' => true,
            'data' => $todos
        ]);
    }
}