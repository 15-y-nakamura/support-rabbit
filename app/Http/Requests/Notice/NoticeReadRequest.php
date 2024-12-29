<?php

namespace App\Http\Requests\Notice;

use Illuminate\Foundation\Http\FormRequest;

class NoticeReadRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'notice_ids' => 'required|array',
            'notice_ids.*' => 'integer|exists:notices,id',
        ];
    }
}
