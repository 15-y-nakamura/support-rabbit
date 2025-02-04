<?php

namespace App\Http\Controllers\Notice;

use App\Http\Controllers\Controller;
use App\Http\Requests\Notice\NoticeReadRequest;
use App\Models\Notice;
use Illuminate\Http\Request;

class NoticeController extends Controller
{
    public function index(Request $req)
    {
        try {
            $notices = $req->user()->notices;
            $list = [];
            foreach ($notices as $notice) {
                $tmp = [
                    'id' => $notice->id,
                    'isRead' => $notice->is_read,
                    'message' => $notice->message,
                    'created_at' => $notice->created_at,
                ];
                $list[] = $tmp;
            }
            $count = $notices->where('is_read', false)->count();
            return response()->json([
                'numberOfUnreadNotices' => $count,
                'notices' => $list
            ]);
        } catch (\Exception $e) {
            return response()->json([], 500);
        }
    }

    public function read(NoticeReadRequest $req)
    {
        try {
            $notices = Notice::whereIn('id', $req->notice_ids)
                             ->where('user_id', $req->user()->id)
                             ->update(['read_at' => now()]);

            return response()->json(['message' => '通知を既読にしました'], 200);
        } catch (\Exception $e) {
            return response()->json([], 500);
        }
    }
}
