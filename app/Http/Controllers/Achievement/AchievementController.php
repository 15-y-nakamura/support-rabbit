<?php

namespace App\Http\Controllers\Achievement;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Achievement;

class AchievementController extends Controller
{
    public function index(Request $request)
    {
        $range = $request->query('range', 'day');
        $achievements = Achievement::query()
            ->selectRaw('DATE(achieved_at) as achieved_at, COUNT(*) as count')
            ->groupBy('achieved_at');

        if ($range === 'week') {
            $achievements->selectRaw('WEEK(achieved_at) as achieved_at');
        } elseif ($range === 'month') {
            $achievements->selectRaw('MONTH(achieved_at) as achieved_at');
        }

        return response()->json($achievements->get());
    }
}