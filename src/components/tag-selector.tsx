"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

interface TagSelectorProps {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  label?: string;
  placeholder?: string;
  className?: string;
}

export function TagSelector({
  value = "",
  onChange,
  disabled = false,
  label,
  placeholder,
  className = ""
}: TagSelectorProps) {
  const { t } = useI18n();
  const [existingTags, setExistingTags] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchExistingTags = async () => {
      try {
        const response = await fetch('/api/tags');
        if (response.ok) {
          const tags = await response.json();
          setExistingTags(tags);
        }
      } catch (error) {
        console.error('Error fetching tags:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExistingTags();
  }, []);

  const handleAddCustomTag = () => {
    if (inputValue.trim() && inputValue.trim() !== value) {
      onChange(inputValue.trim());
      setInputValue("");
    }
  };

  const handleSelectExistingTag = (tag: string) => {
    onChange(tag);
  };

  const handleRemoveTag = () => {
    onChange("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCustomTag();
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <Label className="text-base font-semibold text-gray-900">
        {label || t.tagLabel}
      </Label>
      
      {/* Current selected tag */}
      {value && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="px-3 py-1">
            {value}
            {!disabled && (
              <button
                onClick={handleRemoveTag}
                className="ml-2 hover:text-red-500"
                type="button"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </Badge>
        </div>
      )}

      {/* Input for custom tag */}
      {!value && (
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || t.tagPlaceholder}
            disabled={disabled}
            className="h-12 border-gray-300 focus:border-black focus:ring-black"
          />
          <Button
            type="button"
            onClick={handleAddCustomTag}
            disabled={disabled || !inputValue.trim()}
            size="sm"
            className="h-12 px-3"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Existing tags */}
      {!value && existingTags.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm text-gray-600">{t.tagExistingLabel}</div>
          <div className="flex flex-wrap gap-2">
            {existingTags.map((tag) => (
              <Button
                key={tag}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleSelectExistingTag(tag)}
                disabled={disabled}
                className="h-8 px-3 text-xs"
              >
                {tag}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading && !value && (
        <div className="text-sm text-gray-500">{t.tagLoading}</div>
      )}
    </div>
  );
}