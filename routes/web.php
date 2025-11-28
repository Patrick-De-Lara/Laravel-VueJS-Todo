<?php

use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('login');
})->name('home');

Route::get('/login', function () {
    return Inertia::render('Login');
})->name('login');

Route::get('/register', function () {
    return Inertia::render('Register');
})->name('register');

Route::get('/todos', function () {
    return Inertia::render('Todos/Index');
})->name('todos.index');

Route::get('/todos/{id}', function (string $id) {
    return Inertia::render('Todos/Show', ['id' => $id]);
})->name('todos.show');

Route::get('/users', [UserController::class, 'index'])->name('users.index');
