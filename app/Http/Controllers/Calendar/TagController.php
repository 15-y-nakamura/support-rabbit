<?php

namespace App\Http\Controllers\Calendar;

use App\Models\Tag;
use App\Models\UserToken;
use App\Http\Controllers\Controller;
use App\Http\Requests\Calendar\TagRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class TagController extends Controller
{
    /**
     * ユーザー認証処理（共通メソッド）
     */
    private function authenticateUser(Request $request): UserToken
    {
        $token = $request->bearerToken();
        $userToken = UserToken::where('token', $token)
                              ->where('expiration_time', '>', now())
                              ->first();

        if (!$userToken) {
            Log::warning('【タグ】認証失敗: トークンが無効または期限切れ');
            throw new \Exception('ユーザーが認証されていません');
        }

        return $userToken;
    }

    /**
     * タグ一覧を取得
     */
    public function index(Request $req)
    {
        try {
            $userToken = $this->authenticateUser($req);

            $query = Tag::where('user_id', $userToken->user_id)->orderBy('id', 'desc');

            if ($req->has('searchQuery')) {
                $query->where('name', 'like', '%' . $req->searchQuery . '%');
            }

            $tags = $query->get();

            return response()->json(['tags' => $tags, 'user_id' => $userToken->user_id]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'タグの取得に失敗しました'], 500);
        }
    }

    /**
     * 新しいタグを作成
     */
    public function store(TagRequest $req)
    {
        try {
            $userToken = $this->authenticateUser($req);

            $validated = $req->validated();
            $tag = Tag::create(array_merge($validated, ['user_id' => $userToken->user_id]));

            return response()->json(['message' => 'タグが作成されました', 'tag' => $tag], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => 'タグの作成に失敗しました'], 500);
        }
    }

    /**
     * 指定したタグを取得
     */
    public function show(Request $req, $id)
    {
        try {
            $tag = Tag::find($id);
            if (!$tag) {
                Log::warning('【タグ】タグ取得失敗: タグが見つかりません', ['tag_id' => $id]);
                return response()->json(['error' => 'タグが見つかりません'], 404);
            }

            return response()->json($tag);
        } catch (\Exception $e) {
            return response()->json(['error' => 'タグの取得に失敗しました'], 500);
        }
    }

    /**
     * タグを更新
     */
    public function update(TagRequest $req, $id)
    {
        try {
            $tag = Tag::find($id);
            if (!$tag) {
                Log::warning('【タグ】タグ更新失敗: タグが見つかりません', ['tag_id' => $id]);
                return response()->json(['error' => 'タグが見つかりません'], 404);
            }

            $validated = $req->validated();
            $tag->update($validated);

            return response()->json(['message' => 'タグが更新されました', 'tag' => $tag], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'タグの更新に失敗しました'], 500);
        }
    }

    /**
     * タグを削除
     */
    public function destroy(Request $req, $id)
    {
        try {
            $tag = Tag::find($id);
            if (!$tag) {
                Log::warning('【タグ】タグ削除失敗: タグが見つかりません', ['tag_id' => $id]);
                return response()->json(['error' => 'タグが見つかりません'], 404);
            }

            $tag->delete();

            return response()->json(['message' => 'タグが削除されました'], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'タグの削除に失敗しました'], 500);
        }
    }
}