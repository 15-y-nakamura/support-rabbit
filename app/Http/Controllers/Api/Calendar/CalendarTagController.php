<?php

namespace App\Http\Controllers\Api\Calendar;

use App\Models\Tag;
use App\Http\Controllers\Controller;
use App\Http\Requests\Calendar\CalendarTagRequest;
use Illuminate\Http\Request;

class CalendarTagController extends Controller
{
    public function index(Request $req)
    {
        try {
            $result = Tag::orderBy('id', 'desc');

            // 検索条件がある場合はフィルタリング
            if ($req->has('searchQuery')) {
                $result = $result->where('name', 'like', '%' . $req->searchQuery . '%');
            }

            $tags = $result->get();
            return response()->json(['tags' => $tags]);
        } catch (\Exception $e) {
            return response([], 500);
        }
    }

    public function store(CalendarTagRequest $req)
    {
        try {
            $validated = $req->validated();

            $tag = Tag::create(array_merge($validated, ['user_id' => $req->user()->id]));

            return response()->json(['message' => 'タグが作成されました', 'tag' => $tag], 201);
        } catch (\Exception $e) {
            return response(['error' => $e->getMessage()], 500);
        }
    }

    public function show(Request $req, $id)
    {
        try {
            $tag = Tag::find($id);
            if (!$tag) return response(['error' => 'タグが見つかりません'], 404);

            return response()->json($tag);
        } catch (\Exception $e) {
            return response(['error' => $e->getMessage()], 500);
        }
    }

    public function update(CalendarTagRequest $req, $id)
    {
        try {
            $tag = Tag::find($id);
            if (!$tag) return response(['error' => 'タグが見つかりません'], 404);

            $validated = $req->validated();

            $tag->update($validated);

            return response()->json(['message' => 'タグが更新されました', 'tag' => $tag], 200);
        } catch (\Exception $e) {
            return response(['error' => $e->getMessage()], 500);
        }
    }

    public function destroy(Request $req, $id)
    {
        try {
            $tag = Tag::find($id);
            if (!$tag) return response(['error' => 'タグが見つかりません'], 404);

            $tag->delete();

            return response()->json(['message' => 'タグが削除されました'], 200);
        } catch (\Exception $e) {
            return response(['error' => $e->getMessage()], 500);
        }
    }
}
