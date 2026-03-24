import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, GripVertical } from 'lucide-react';

export default function ApplicationQuestionBuilder({ questions = [], onChange }) {
  const addQuestion = () => {
    const newQuestion = {
      id: Date.now().toString(),
      question: '',
      type: 'text',
      required: false,
      options: []
    };
    onChange([...questions, newQuestion]);
  };

  const updateQuestion = (id, field, value) => {
    onChange(questions.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const removeQuestion = (id) => {
    onChange(questions.filter(q => q.id !== id));
  };

  const addOption = (questionId) => {
    onChange(questions.map(q => 
      q.id === questionId ? { ...q, options: [...(q.options || []), ''] } : q
    ));
  };

  const updateOption = (questionId, optionIndex, value) => {
    onChange(questions.map(q => {
      if (q.id === questionId) {
        const newOptions = [...q.options];
        newOptions[optionIndex] = value;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const removeOption = (questionId, optionIndex) => {
    onChange(questions.map(q => {
      if (q.id === questionId) {
        return { ...q, options: q.options.filter((_, i) => i !== optionIndex) };
      }
      return q;
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Application Questions</h3>
        <Button type="button" onClick={addQuestion} size="sm" variant="outline">
          <Plus className="w-4 h-4 mr-1" /> Add Question
        </Button>
      </div>

      {questions.map((q, index) => (
        <Card key={q.id} className="p-4 bg-gray-50">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <GripVertical className="w-5 h-5 text-gray-400 mt-2" />
              <div className="flex-1 space-y-3">
                <div>
                  <Label>Question {index + 1}</Label>
                  <Input
                    value={q.question}
                    onChange={(e) => updateQuestion(q.id, 'question', e.target.value)}
                    placeholder="Enter your question"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Type</Label>
                    <Select
                      value={q.type}
                      onValueChange={(value) => updateQuestion(q.id, 'type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Short Answer</SelectItem>
                        <SelectItem value="textarea">Long Answer</SelectItem>
                        <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={q.required}
                        onChange={(e) => updateQuestion(q.id, 'required', e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">Required</span>
                    </label>
                  </div>
                </div>

                {q.type === 'multiple_choice' && (
                  <div>
                    <Label>Options</Label>
                    <div className="space-y-2">
                      {(q.options || []).map((option, optIndex) => (
                        <div key={optIndex} className="flex gap-2">
                          <Input
                            value={option}
                            onChange={(e) => updateOption(q.id, optIndex, e.target.value)}
                            placeholder={`Option ${optIndex + 1}`}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeOption(q.id, optIndex)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addOption(q.id)}
                      >
                        <Plus className="w-4 h-4 mr-1" /> Add Option
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeQuestion(q.id)}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          </div>
        </Card>
      ))}

      {questions.length === 0 && (
        <div className="text-center py-8 text-gray-500 text-sm">
          No custom questions yet. Click "Add Question" to create application questions.
        </div>
      )}
    </div>
  );
}