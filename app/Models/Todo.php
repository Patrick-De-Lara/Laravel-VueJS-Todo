<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Todo extends Model
{
    use HasFactory, SoftDeletes;
    
    protected $id = 'id';

    protected $table = 'todos';
    
    protected $dates = ['due_date', 'completed_at', 'deleted_at'];


    protected $fillable = [
        'title',
        'description',
        'attachment',
        'is_completed',
        'user_id',
        'due_date',
        'completed_at',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    
}
