import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { HONG_KONG_SCHOOLS } from './schools/schoolsList';

export default function SchoolSelector({ selectedSchools = [], onChange }) {
  const [open, setOpen] = useState(false);

  const handleSelect = (school) => {
    if (!selectedSchools.includes(school)) {
      onChange([...selectedSchools, school]);
    }
    setOpen(false);
  };

  const handleRemove = (school) => {
    onChange(selectedSchools.filter(s => s !== school));
  };

  const availableSchools = HONG_KONG_SCHOOLS.filter(s => !selectedSchools.includes(s));

  return (
    <div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start">
            {selectedSchools.length === 0 
              ? "Select schools..." 
              : `${selectedSchools.length} school${selectedSchools.length === 1 ? '' : 's'} selected`}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Search schools..." />
            <CommandList>
              <CommandEmpty>No schools found.</CommandEmpty>
              <CommandGroup>
                {availableSchools.map(school => (
                  <CommandItem
                    key={school}
                    onSelect={() => handleSelect(school)}
                  >
                    {school}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedSchools.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedSchools.map(school => (
            <Badge key={school} variant="secondary" className="pl-3 pr-2 py-1">
              {school}
              <button
                onClick={() => handleRemove(school)}
                className="ml-2 hover:bg-gray-300 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-500 mt-1">
        Only students from these schools will see and can apply to this opportunity
      </p>
    </div>
  );
}