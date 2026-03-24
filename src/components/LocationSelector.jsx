import React from 'react';
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
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

const LOCATIONS = [
  "Central", "Admiralty", "Mid-Levels", "SoHo", "Sai Wan", "Kennedy Town", "Sai Ying Pun", "Shek Tong Tsui", "Sheung Wan", "Victoria Peak",
  "Chai Wan", "Heng Fa Chuen", "Siu Sai Wan", "North Point", "Braemar Hill", "Fortress Hill", "Quarry Bay", "Kornhill", "Taikoo Shing", "Sai Wan Ho", "Shau Kei Wan", "Aldrich Bay", "A Kung Ngam",
  "Aberdeen", "Ap Lei Chau", "Chung Hom Kok", "Cyberport", "Telegraph Bay", "Deep Water Bay", "Pok Fu Lam", "Sandy Bay", "Wah Fu", "Tin Wan", "Repulse Bay", "Stanley", "Shek O", "Big Wave Bay", "Tai Tam", "Waterfall Bay", "Wong Chuk Hang", "Nam Long Shan", "Ocean Park",
  "Wan Chai", "Causeway Bay", "Tin Hau", "Caroline Hill", "Happy Valley", "Jardine's Lookout", "Tai Hang",
  "Sham Shui Po", "Cheung Sha Wan", "Lai Chi Kok", "Mei Foo Sun Chuen", "Nam Cheong", "Shek Kip Mei", "Stonecutters Island", "Yau Yat Chuen",
  "Tsim Sha Tsui", "Tsim Sha Tsui East", "Jordan", "Mong Kok", "Prince Edward", "Tai Kok Tsui", "Yau Ma Tei", "Hung Hom", "King's Park", "Kwun Chung",
  "Kowloon City", "Kowloon Tong", "Kowloon Tsai", "Ho Man Tin", "Whampoa Garden", "Kai Tak", "Ma Tau Kok", "Ma Tau Wai", "To Kwa Wan",
  "Wong Tai Sin", "Diamond Hill", "Choi Hung", "San Po Kong", "Tsz Wan Shan", "Wang Tau Hom", "Lok Fu", "Kowloon Peak",
  "Kwun Tong", "Cha Kwo Ling", "Lam Tin", "Lei Yue Mun", "Ngau Tau Kok", "Ngau Chi Wan", "Kowloon Bay", "Sau Mau Ping", "Yau Tong", "Jordan Valley",
  "Tsuen Wan", "Ma Wan", "Sham Tseng", "Tsing Lung Tau", "Ting Kau", "Lo Wai", "Penny's Bay", "Hong Kong Disneyland",
  "Kwai Chung", "Kwai Fong", "Kwai Hing", "Lai King", "Tai Wo Hau", "Tsing Yi",
  "Fanling", "Sheung Shui", "Sha Tau Kok", "Lo Wu", "Man Kam To", "Kwan Tei", "Kwu Tung", "Lin Ma Hang", "Ping Che", "Ta Kwu Ling",
  "Sai Kung Town", "Clear Water Bay", "Hang Hau", "Tseung Kwan O", "LOHAS Park", "Po Lam", "Tiu Keng Leng", "Ho Chung", "Tai Po Tsai", "Kau Sai Chau",
  "Sha Tin", "Fo Tan", "Kau To Shan", "Ma Liu Shui", "Ma On Shan", "Wu Kai Sha", "Tai Shui Hang", "Pak Shek Kok", "Science Park", "Che Kung Miu", "City One Shatin", "Sha Tin Wai", "Siu Lek Yuen", "Tai Wai", "Yuen Chau Kok", "Chinese University of Hong Kong",
  "Tai Po", "Hong Lok Yuen", "Lam Tsuen", "Pat Sin Leng", "Tung Ping Chau", "Plover Cove", "Tai Wo", "Tai Po Industrial Estate", "Tai Po Kau", "Ting Kok",
  "Tuen Mun", "Lung Kwu Tan", "Fu Tei", "San Hui", "So Kwun Wat", "Gold Coast", "Siu Lam", "Tai Lam Chung", "Hung Shui Kiu",
  "Yuen Long Town", "Tin Shui Wai", "Kam Tin", "Pat Heung", "Shek Kong", "San Tin", "Ha Tsuen", "Lau Fau Shan", "Ping Shan", "Shap Pat Heung", "Tai Tong", "Au Tau", "Mai Po", "Lok Ma Chau", "Fairview Park",
  "Tung Chung", "Discovery Bay", "Cheung Chau", "Lamma Island", "Peng Chau", "Mui Wo", "Tai O", "Ngong Ping", "Chek Lap Kok", "Sok Kwu Wan", "Yung Shue Wan", "Cheung Sha", "Pui O", "Shek Pik", "Shui Hau", "Siu Ho Wan", "Tong Fuk"
];

export default function LocationSelector({ value, onChange }) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-auto justify-between bg-white border border-gray-300 rounded-full text-sm font-normal h-9 px-4"
        >
          {value && value !== 'all' ? value : "Location"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search location..." />
          <CommandList>
            <CommandEmpty>No location found.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="all"
                onSelect={() => {
                  onChange('all');
                  setOpen(false);
                }}
              >
                <Check className={`mr-2 h-4 w-4 ${value === 'all' ? "opacity-100" : "opacity-0"}`} />
                All Locations
              </CommandItem>
              {LOCATIONS.map((location) => (
                <CommandItem
                  key={location}
                  value={location}
                  onSelect={(currentValue) => {
                    onChange(currentValue === value ? "all" : currentValue);
                    setOpen(false);
                  }}
                >
                  <Check className={`mr-2 h-4 w-4 ${value === location ? "opacity-100" : "opacity-0"}`} />
                  {location}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}