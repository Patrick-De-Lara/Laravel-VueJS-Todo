<?php

namespace App\Http\Controllers;

use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Display a listing of users.
     */
    public function index(): Response
    {
        $users = User::select('id', 'name', 'email', 'created_at')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Users/Index', [
            'users' => $users
        ]);
    }
}
